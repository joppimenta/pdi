from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
#import os
from pathlib import Path
import json
from PIL import Image
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE_BASE_DIR = "imagens"
ORIGINAL_SUBDIR = "original"
SEGMENTED_SUBDIR = "segmentado"
MASKS_SUBDIR = "masks"

class CompararImagens(BaseModel):
    imagens_originais: List[str]  # URLs pra chamada no outro endpoint
    imagens_mascaras: List[str]
    imagens_segmentadas: List[str]
    metricas_comparacao: List[Dict]

# Vai ser atualizado a cada requisição
IMAGE_STORAGE = {
    "original": [],
    "segmentado": [],
    "mascara": []
}

metricas = []

def calcular_metricas(mask_path: Path, segment_path: Path) -> Dict:
    """Compara uma máscara e uma segmentação e retorna as métricas"""
    try:
        mask = Image.open(mask_path).convert("L")
        segment = Image.open(segment_path).convert("L")

        mask_np = np.array(mask) > 0
        segment_np = np.array(segment) > 0

        intersection = np.logical_and(mask_np, segment_np).sum()
        union = np.logical_or(mask_np, segment_np).sum()
        total_mask = mask_np.sum()
        total_segment = segment_np.sum()

        iou = intersection / union if union != 0 else 0
        dice = 2 * intersection / (total_mask + total_segment) if (total_mask + total_segment) != 0 else 0
        precision = intersection / total_segment if total_segment != 0 else 0
        similarity = (mask_np == segment_np).sum() / mask_np.size

        return {
            "mask": mask_path.name,
            "segmentada": segment_path.name,
            "similarity": round(similarity, 4),
            "iou": round(iou * 100, 2),
            "dice": round(dice * 100, 2),
            "precision": round(precision, 4)
        }
    except Exception as e:
        print(f"Erro ao comparar {mask_path} e {segment_path}: {e}")
        return {}

def obterImagensMetricas():
    """Atualiza IMAGE_STORAGE com imagens locais salvas e calcula métricas"""
    global metricas

    try:
        IMAGE_STORAGE["original"].clear()
        IMAGE_STORAGE["segmentado"].clear()
        IMAGE_STORAGE["mascara"].clear()
        metricas.clear()

        # Diretórios
        original_dir = Path(IMAGE_BASE_DIR) / ORIGINAL_SUBDIR
        segmented_dir = Path(IMAGE_BASE_DIR) / SEGMENTED_SUBDIR
        masks_dir = Path(IMAGE_BASE_DIR) / MASKS_SUBDIR

        orig_paths = sorted(list(original_dir.glob("*")))
        seg_paths = sorted(list(segmented_dir.glob("*")))
        mask_paths = sorted(list(masks_dir.glob("*")))

        for img_file in orig_paths:
            IMAGE_STORAGE["original"].append(str(img_file))
        for img_file in seg_paths:
            IMAGE_STORAGE["segmentado"].append(str(img_file))
        for img_file in mask_paths:
            IMAGE_STORAGE["mascara"].append(str(img_file))

        # Cálculo das métricas
        metricas_calculadas = []
        for mask_path, seg_path in zip(mask_paths, seg_paths):
            m = calcular_metricas(mask_path, seg_path)
            if m:
                metricas_calculadas.append(m)

        metricas.extend(metricas_calculadas)

        # Salvar em metricas.json
        with open('metricas.json', 'w') as f:
            json.dump(metricas_calculadas, f, indent=2)

    except Exception as e:
        print(f"Erro na atualização das imagens: {e}")

@app.get("/compare-images/", response_model=CompararImagens)
async def compare_images():
    """Rota que retorna várias imagens junto com os dados de comparação"""

    obterImagensMetricas()

    return {
        "imagens_originais": [f"/image-files/{path}" for path in IMAGE_STORAGE["original"]],
        "imagens_mascaras": [f"/image-files/{path}" for path in IMAGE_STORAGE["mascara"]],
        "imagens_segmentadas": [f"/image-files/{path}" for path in IMAGE_STORAGE["segmentado"]],
        "metricas_comparacao": metricas
    }

@app.get("/image-files/{image_path:path}")
async def get_image(image_path):
    """Envia realmente o arquivo de imagem"""
    try:
        image_path = Path(image_path)
        if not image_path.exists():
            raise FileNotFoundError("Imagem não encontrada")

        return FileResponse(image_path)
    except Exception as e:
        return {"error": str(e)}, 404
