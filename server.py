from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict
#import os
from pathlib import Path

app = FastAPI()

# Configuration
IMAGE_BASE_DIR = "imagens"  # Pasta base das imagens
ORIGINAL_SUBDIR = "original"  # Subpasta das imagens originais
SEGMENTED_SUBDIR = "segmentado"  # Subpasta das segmentadas

class CompararImagens(BaseModel):
    imagens_originais: List[str]  # URLs pra chamada no outro endpoint
    imagens_segmentadas: List[str]
    metricas_comparacao: List[Dict]  # Métricas de comparação

# Vai ser atualizado a cada requisição
IMAGE_STORAGE = {
    "original": [],  # Imagens originais
    "segmentado": []  # Imagens segmentadas
}

def obterImagens():
    """Atualiza IMAGE_STORAGE com imagens locais salvas"""
    try:
        IMAGE_STORAGE["original"].clear()
        IMAGE_STORAGE["segmentado"].clear()

        # path das imagens originais - não lembro se era png ou outro
        original_dir = Path(IMAGE_BASE_DIR) / ORIGINAL_SUBDIR
        if original_dir.exists():
            for img_file in original_dir.glob("*"):
                if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                    IMAGE_STORAGE["original"].append(str(img_file))

        # agora as segmentadas
        segmented_dir = Path(IMAGE_BASE_DIR) / SEGMENTED_SUBDIR
        if segmented_dir.exists():
            for img_file in segmented_dir.glob("*"):
                if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                    IMAGE_STORAGE["segmentado"].append(str(img_file))

        # # Ordena pra bater a ordem das imagens
        # IMAGE_STORAGE["original"].sort()
        # IMAGE_STORAGE["segmentado"].sort()

    except Exception as e:
        print(f"Erro na atualização das imagens: {e}")

@app.get("/compare-images/", response_model=CompararImagens)
async def compare_images():
    """Rota que retorna várias imagens junto com os dados de comparação"""
    # Primeira coisa é atualizar as imagens localmente
    obterImagens()

    # Métricas dummy pra testar - lembrar quais são as métricas a usar
    metricas_comparacao = [
        {"similarity": 0.85, "mse": 12.5, "psnr": 32.1},
        {"similarity": 0.92, "mse": 8.7, "psnr": 34.8}
    ]

    return {
        "imagens_originais": [f"/image-files/{path}" for path in IMAGE_STORAGE["original"]],
        "imagens_segmentadas": [f"/image-files/{path}" for path in IMAGE_STORAGE["segmentado"]],
        "metricas_comparacao": metricas_comparacao
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
