from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
#import os
from pathlib import Path
import json

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

class CompararImagens(BaseModel):
    imagens_originais: List[str]  # URLs pra chamada no outro endpoint
    imagens_segmentadas: List[str]
    metricas_comparacao: List[Dict]

# Vai ser atualizado a cada requisição
IMAGE_STORAGE = {
    "original": [],  # Imagens originais
    "segmentado": []  # Imagens segmentadas
}

metricas = []

def obterImagensMetricas():
    """Atualiza IMAGE_STORAGE com imagens locais salvas"""
    global metricas

    try:
        IMAGE_STORAGE["original"].clear()
        IMAGE_STORAGE["segmentado"].clear()
        metricas.clear()

        # path das imagens originais e segmentadas
        original_dir = Path(IMAGE_BASE_DIR) / ORIGINAL_SUBDIR
        for img_file in original_dir.glob("*"):
            IMAGE_STORAGE["original"].append(str(img_file))


        segmented_dir = Path(IMAGE_BASE_DIR) / SEGMENTED_SUBDIR
        for img_file in segmented_dir.glob("*"):
            IMAGE_STORAGE["segmentado"].append(str(img_file))

        try:
            with open('./metricas.json') as f:
                metricas.extend(json.load(f))
        except Exception as e:
                print(f"Erro ao carregar métricas: {e}")
                return []

    except Exception as e:
        print(f"Erro na atualização das imagens: {e}")

@app.get("/compare-images/", response_model=CompararImagens)
async def compare_images():
    """Rota que retorna várias imagens junto com os dados de comparação"""

    obterImagensMetricas()

    return {
        "imagens_originais": [f"/image-files/{path}" for path in IMAGE_STORAGE["original"]],
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
