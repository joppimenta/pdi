// Controlador de Modal de Imagens
 
class ImageModalController {
    constructor() {
        this.modalId = 'imageModal';
        this.modal = null;
        this.init();
    }
    
    init() {
        // Criar modal se não existir
        if (!document.getElementById(this.modalId)) {
            this.createModal();
        }
        
        this.addEventListeners();
    }
    
    createModal() {
        const modal = utils.createElement('div');
        modal.id = this.modalId;
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <span class="close" onclick="window.ImageModal.close()" 
                  style="position: absolute; top: 15px; right: 35px; color: #f1f1f1; 
                         font-size: 40px; font-weight: bold; cursor: pointer; z-index: 1001;">&times;</span>
            <div style="text-align: center;">
                <img class="modal-content" id="modalImage" 
                     style="object-fit: cover; width: 100%; height: 700px; max-width: 80vw; max-height: 80vh; border-radius: 8px;">
                <div id="caption" 
                     style="color: white; padding: 20px; font-size: 1.2rem;"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
    }
    
    addEventListeners() {
        // Fechar ao clicar no fundo
        document.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    open(src, caption) {
        if (!this.modal) {
            this.init();
        }
        
        const modalImg = document.getElementById('modalImage');
        const captionText = document.getElementById('caption');
        
        modalImg.onload = () => {
            this.modal.style.display = 'flex';
            utils.animate.fadeIn(this.modal, CONFIG.UI.ANIMATION_DURATION);
        };
        
        modalImg.onerror = () => {
            utils.Logger.error('Erro ao carregar imagem no modal:', src);
            captionText.textContent = 'Erro ao carregar a imagem: ' + caption;
            this.modal.style.display = 'flex';
        };
        
        modalImg.src = src;
        captionText.textContent = caption;
    }
    
    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}

class ImageComponentGenerator {
    createStatsComponent(totalOriginais, totalSegmentadas) {
        const statsDiv = utils.createElement('div');
        statsDiv.style.cssText = `
            background: #e8f4fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
        `;
        
        const maxComparacoes = Math.min(totalOriginais, totalSegmentadas);
        
        statsDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Estatísticas das Imagens Médicas</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div><strong>Máscaras Pulmonares:</strong> ${totalOriginais}</div>
                <div><strong>Máscaras de Infecção:</strong> ${totalSegmentadas}</div>
                <div><strong>Comparações Possíveis:</strong> ${maxComparacoes}</div>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: rgba(52, 152, 219, 0.1); 
                        border-radius: 4px; font-size: 0.9em;">
                <strong>Explicação:</strong> As máscaras pulmonares mostram o contorno completo dos pulmões, 
                enquanto as máscaras de infecção destacam apenas as áreas com lesões ou infecções detectadas pela UNet++.
            </div>
        `;
        
        return statsDiv;
    }
    
    // Criar componente de imagem individual
    createImageComponent(imageUrl, imageName, title, index) {
        // Barras invertidas '\' causam um problema de parsing no HTML pois são interpretadas como caracteres de escape e desaparecem, o que causa que o modal use o caminho errado para a imagem. Substitua por barras normais '/'.
        const fixedImageUrl = imageUrl.replace(/\\/g, '/'); 

        const imageGroup = utils.createElement('div', 'image-group');
        
        imageGroup.innerHTML = `
            <h3 style="color: #2c3e50; margin-bottom: 10px;">${title}</h3>
            <p style="font-size: 0.9em; color: #7f8c8d; margin-bottom: 15px;">${imageName}</p>
            <div class="image-wrapper">
                <img src="${fixedImageUrl}" 
                     alt="${title} ${index + 1}" 
                     class="comparison-image"
                     onclick="window.ImageModal.open('${fixedImageUrl}', '${title} ${index + 1}: ${imageName}')"
                     onload="this.style.opacity='1'"
                     onerror="window.ImageHandler.handleError(this, '${title} ${index + 1}')">
            </div>
        `;
        
        return imageGroup;
    }
    
    // Criar placeholder para imagem não disponível
    createImagePlaceholder(title, index) {
        const imageGroup = utils.createElement('div', 'image-group');
        
        imageGroup.innerHTML = `
            <h3 style="color: #95a5a6; margin-bottom: 15px;">${title}</h3>
            <div style="background: #ecf0f1; padding: 40px; border-radius: 8px; 
                        color: #7f8c8d; font-style: italic;">
                Imagem não disponível
            </div>
        `;
        
        return imageGroup;
    }
    
    createMetricsComponent(metric, index) {
        const metricsCard = utils.createElement('div', 'metrics-card');
        
        metricsCard.innerHTML = `
            <h4>Métricas de Comparação</h4>
            <div class="metrics-grid">
                <div class="metric-item">
                    <span class="metric-label">Similaridade:</span>
                    <span class="metric-value">${utils.formatMetric(metric.similarity, 'percentage')}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">IoU:</span>
                    <span class="metric-value">${utils.formatMetric(metric.iou)}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Dice:</span>
                    <span class="metric-value">${utils.formatMetric(metric.dice)}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Precisão:</span>
                    <span class="metric-value">${utils.formatMetric(metric.precision)}</span>
                </div>
            </div>
        `;
        
        return metricsCard;
    }
    
    createMetricsPlaceholder(index) {
        const metricsCard = utils.createElement('div', 'metrics-card');
        metricsCard.style.background = 'linear-gradient(135deg, #fff3cd, #ffeaa7)';
        metricsCard.style.borderLeftColor = '#f39c12';
        
        metricsCard.innerHTML = `
            <h4>Métricas não disponíveis para Comparação ${index + 1}</h4>
            <div style="text-align: center; padding: 10px; color: #856404;">
                <p>As métricas para esta comparação ainda não foram calculadas.</p>
            </div>
        `;
        
        return metricsCard;
    }
    
    createValidAnalysisMessage(validPairs) {
        const infoDiv = utils.createElement('div');
        infoDiv.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid #27ae60;
        `;
        
        infoDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">Análise Médica Válida</h4>
            <p style="margin: 0;">
                ${validPairs} par(es) de imagens prontos para análise comparativa. 
                As métricas mostradas comparearam as máscaras pulmonares com as respectivas máscaras de infecção.
            </p>
        `;
        
        return infoDiv;
    }
    
    createNoImagesMessage() {
        const noImagesDiv = utils.createElement('div');
        noImagesDiv.style.cssText = 'text-align: center; padding: 40px; color: #7f8c8d;';
        
        noImagesDiv.innerHTML = `
            <h3>Nenhuma imagem encontrada</h3>
            <p>Adicione imagens nas pastas:</p>
            <ul style="list-style: none; padding: 0;">
                <li>imagens/original/ - Imagens originais</li>
                <li>imagens/segmentado/ - Imagens segmentadas</li>
            </ul>
        `;
        
        return noImagesDiv;
    }
}

class ImageHandler {
    constructor() {
        this.modal = new ImageModalController();
        this.generator = new ImageComponentGenerator();
    }

    // Manipular erro de carregamento de imagem
    handleError(img, imageName) {
        utils.Logger.error(`Erro ao carregar: ${imageName}`);
        img.style.display = 'none';
        
        const wrapper = img.parentElement;
        if (!wrapper.querySelector('.error-placeholder')) {
            const errorDiv = utils.createElement('div', 'error-placeholder');
            errorDiv.style.cssText = `
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                padding: 30px;
                border-radius: 4px;
                text-align: center;
                font-style: italic;
            `;
            
            errorDiv.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                <div><strong>Erro ao carregar</strong></div>
                <div style="font-size: 0.9em; margin-top: 5px;">${imageName}</div>
            `;
            
            wrapper.appendChild(errorDiv);
        }
    }
     
    renderImages(originais, mascaras, segmentadas, metricas) {
        const container = document.getElementById('imagesContainer');
        container.innerHTML = '';
        
        // Verificar se há imagens
        if (originais.length === 0 && mascaras.length === 0 && segmentadas.length === 0) {
            container.appendChild(this.generator.createNoImagesMessage());
            return;
        }
        
        // Adicionar timestamp
        UI.showContent();
        
        // Adicionar estatísticas
        const statsComponent = this.generator.createStatsComponent(originais.length, mascaras.length, segmentadas.length);
        container.appendChild(statsComponent);
        
        // Determinar número de comparações
        const maxComparacoes = Math.max(originais.length, mascaras.length, segmentadas.length);
        
        // Criar comparações
        for (let i = 0; i < maxComparacoes; i++) {
            const imageComparison = utils.createElement('div', 'image-comparison');

            const titulo = utils.createElement('h2', "image-comparison-title");
            titulo.textContent = `Comparação ${i + 1}`;
            titulo.style.marginBottom = '15px';
            titulo.style.color = '#2c3e50'; // opcional
            imageComparison.appendChild(titulo);

            const imagePair = utils.createElement('div', 'image-trio');
            
            // Imagem Original
            if (i < originais.length) {
                const originalUrl = API.images.getImageUrl(originais[i]);
                const originalName = utils.getFileName(originais[i]);
                const originalComponent = this.generator.createImageComponent(
                    originalUrl, originalName, 'Imagem original', i
                );
                imagePair.appendChild(originalComponent);
            } else {
                const placeholder = this.generator.createImagePlaceholder('Original', i);
                imagePair.appendChild(placeholder);
            }

            // Imagens máscaras
            if (i < mascaras.length) {
                const maskUrl = API.images.getImageUrl(mascaras[i]);
                const maskName = utils.getFileName(mascaras[i]);
                const maskComponent = this.generator.createImageComponent(
                    maskUrl, maskName, 'Máscara', i
                );
                imagePair.appendChild(maskComponent);
            } else {
                const placeholder = this.generator.createImagePlaceholder('Original', i);
                imagePair.appendChild(placeholder);
            }
            
            // Imagem Segmentada
            if (i < segmentadas.length) {
                const segmentedUrl = API.images.getImageUrl(segmentadas[i]);
                const segmentedName = utils.getFileName(segmentadas[i]);
                const segmentedComponent = this.generator.createImageComponent(
                    segmentedUrl, segmentedName, 'Resultado segmentado', i
                );
                imagePair.appendChild(segmentedComponent);
            } else {
                const placeholder = this.generator.createImagePlaceholder('Segmentada', i);
                imagePair.appendChild(placeholder);
            }
            
            imageComparison.appendChild(imagePair);
            
            // Adicionar métricas
            const minImages = Math.min(originais.length, segmentadas.length);
            if (i < metricas.length && i < minImages) {
                const metricsComponent = this.generator.createMetricsComponent(metricas[i], i);
                imageComparison.appendChild(metricsComponent);
            } else if (i < minImages) {
                const metricsPlaceholder = this.generator.createMetricsPlaceholder(i);
                imageComparison.appendChild(metricsPlaceholder);
            }
            
            container.appendChild(imageComparison);
        }
        
        // Adicionar mensagem de análise válida
        const validPairs = Math.min(originais.length, segmentadas.length);
        if (validPairs > 0) {
            const validAnalysisMessage = this.generator.createValidAnalysisMessage(validPairs);
            container.appendChild(validAnalysisMessage);
        }
    }
}

const imageHandler = new ImageHandler();

window.ImageHandler = imageHandler;
window.ImageModal = imageHandler.modal;