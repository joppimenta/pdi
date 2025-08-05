class AppState {
    constructor() {
        this.currentPage = 1;
        this.showingAll = false;
        this.allImages = {
            originais: [],
            segmentadas: [],
            metricas: []
        };
    }
    
    reset() {
        this.currentPage = 1;
        this.showingAll = false;
        this.allImages = {
            originais: [],
            segmentadas: [],
            metricas: []
        };
    }
    
    addImages(newImages) {
        this.allImages.originais.push(...newImages.originais);
        this.allImages.segmentadas.push(...newImages.segmentadas);
        this.allImages.metricas.push(...newImages.metricas);
    }
    
    setImages(newImages) {
        this.allImages = { ...newImages };
    }
    
    getTotalImages() {
        return {
            originais: this.allImages.originais.length,
            segmentadas: this.allImages.segmentadas.length,
            metricas: this.allImages.metricas.length
        };
    }
}

class AppController {
    constructor() {
        this.state = new AppState();
        this.init();
    }
    
    init() {
        UI.init();
        
        this.setupEventListeners();
        
        utils.Logger.info('Aplicação inicializada');
    }
    
    setupEventListeners() {
        const elements = {
            loadImagesBtn: document.getElementById('loadImagesBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            loadMoreBtn: document.getElementById('loadMoreBtn'),
            showAllBtn: document.getElementById('showAllBtn')
        };
        
        // Botão carregar imagens
        elements.loadImagesBtn?.addEventListener('click', () => {
            this.handleLoadImages();
        });
        
        // Botão atualizar
        elements.refreshBtn?.addEventListener('click', () => {
            this.handleRefresh();
        });
        
        // Botão carregar mais
        elements.loadMoreBtn?.addEventListener('click', () => {
            this.handleLoadMore();
        });
        
        // Botão mostrar todas
        elements.showAllBtn?.addEventListener('click', () => {
            this.handleShowAll();
        });
    }

    // Carregamento inicial
    async handleLoadImages() {
        this.state.reset();
        UI.hidePagination();
        await this.loadImages(false);
    }
    
    // Atualização
    async handleRefresh() {
        this.state.reset();
        UI.hidePagination();
        await this.loadImages(false);
    }
    
    // Carregar mais
    async handleLoadMore() {
        this.state.currentPage++;
        UI.setLoadMoreLoading(true);
        await this.loadImages(true);
        UI.setLoadMoreLoading(false);
    }
    
    // Manipular mostrar todas
    async handleShowAll() {
        try {
            this.state.showingAll = true;
            UI.setShowAllLoading(true);
            
            const allImages = await API.images.loadAllImages();
            this.state.setImages(allImages);

            window.ImageHandler.renderImages(
                this.state.allImages.originais,
                this.state.allImages.segmentadas,
                this.state.allImages.metricas
            );
            
            UI.hidePagination();
            
        } catch (error) {
            UI.showError(error.message);
        } finally {
            UI.setShowAllLoading(false);
        }
    }
    
    async loadImages(addToExisting = false) {
        try {
            if (!addToExisting) {
                UI.showLoading();
            }
            
            const response = await API.images.loadImagesPage(
                this.state.currentPage,
                CONFIG.API.DEFAULT_PARAMS.PER_PAGE
            );
            
            if (!response.success) {
                throw new Error(response.error);
            }
            
            const { data } = response;
            
            if (addToExisting) {
                this.state.addImages(data);
            } else {
                this.state.setImages(data);
            }
            
            utils.Logger.info('Dados carregados:', {
                originais: data.originais.length,
                segmentadas: data.segmentadas.length,
                metricas: data.metricas.length,
                hasMore: data.hasMore
            });
            
            // Renderizar imagens
            window.ImageHandler.renderImages(
                this.state.allImages.originais,
                this.state.allImages.segmentadas,
                this.state.allImages.metricas
            );
            
            this.updatePaginationControls(data);
            
        } catch (error) {
            UI.showError(error.message);
            utils.Logger.error('Erro ao carregar imagens:', error);
        } finally {
            if (!addToExisting) {
                UI.hideLoading();
            }
        }
    }
    
    // Atualizar controles de paginação
    updatePaginationControls(data) {
        const hasMoreImages = data.totalOriginais > CONFIG.API.DEFAULT_PARAMS.PER_PAGE || 
                             data.totalSegmentadas > CONFIG.API.DEFAULT_PARAMS.PER_PAGE;
        
        if (data.hasMore) {
            UI.updatePagination(true, hasMoreImages);
        } else {
            UI.updatePagination(false, hasMoreImages);
        }
    }
    
    // Verificar saúde da API
    async checkAPIHealth() {
        const isHealthy = await API.client.healthCheck();
        if (!isHealthy) {
            utils.Logger.warn('API não está respondendo adequadamente');
        }
        return isHealthy;
    }
    
    // Obter estatísticas da aplicação
    getStats() {
        const totals = this.state.getTotalImages();
        return {
            currentPage: this.state.currentPage,
            showingAll: this.state.showingAll,
            totalImages: totals,
            validComparisons: Math.min(totals.originais, totals.segmentadas)
        };
    }
}

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.App = new AppController();
    } catch (error) {
        utils.Logger.error('Erro ao inicializar aplicação:', error);
        
        // Mostrar erro crítico
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 9999;
            text-align: center;
            max-width: 400px;
        `;
        
        errorDiv.innerHTML = `
            <h3>Erro de Inicialização</h3>
            <p>Não foi possível inicializar a aplicação.</p>
            <small>Verifique o console para mais detalhes.</small>
        `;
        
        document.body.appendChild(errorDiv);
    }
});

// Manipulador de erros global
window.addEventListener('error', (event) => {
    utils.Logger.error('Erro global capturado:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Manipulador de promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
    utils.Logger.error('Promise rejeitada não capturada:', event.reason);
});