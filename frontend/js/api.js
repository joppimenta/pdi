 class APIClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            utils.Logger.info('API Request:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            utils.handleHttpError(response);
            
            const data = await response.json();
            utils.Logger.info('API Response Success:', data);
            
            return data;
            
        } catch (error) {
            utils.Logger.error('API Request Failed:', error);
            throw error;
        }
    }
    
    // Buscar imagens comparativas
    async fetchCompareImages(page = 1, perPage = 5) {
        const endpoint = `${CONFIG.API.ENDPOINTS.COMPARE_IMAGES}?page=${page}&per_page=${perPage}`;
        return await this.request(endpoint);
    }
    
    // Verificar se API está ativa
    async healthCheck() {
        try {
            await this.request('/health');
            return true;
        } catch (error) {
            return false;
        }
    }
}

class ImageService {
    constructor(apiClient) {
        this.api = apiClient;
    }
    
    async loadImagesPage(page = 1, perPage = CONFIG.API.DEFAULT_PARAMS.PER_PAGE) {
        try {
            const data = await this.api.fetchCompareImages(page, perPage);
            
            return {
                success: true,
                data: {
                    originais: data.imagens_originais || [],
                    segmentadas: data.imagens_segmentadas || [],
                    metricas: data.metricas_comparacao || [],
                    hasMore: data.tem_mais || false,
                    totalOriginais: data.total_originais || 0,
                    totalSegmentadas: data.total_segmentadas || 0
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: `${CONFIG.MESSAGES.ERROR_PREFIX}${error.message}. ${CONFIG.MESSAGES.SERVER_CHECK}${this.api.baseUrl}`
            };
        }
    }
    
    async loadMultiplePages(startPage, endPage, perPage = CONFIG.API.DEFAULT_PARAMS.BULK_LOAD_SIZE) {
        const results = {
            originais: [],
            segmentadas: [],
            metricas: []
        };
        
        for (let page = startPage; page <= endPage; page++) {
            try {
                const response = await this.loadImagesPage(page, perPage);
                if (response.success) {
                    results.originais.push(...response.data.originais);
                    results.segmentadas.push(...response.data.segmentadas);
                    results.metricas.push(...response.data.metricas);
                    
                    if (!response.data.hasMore) break;
                } else {
                    utils.Logger.warn(`Falha ao carregar página ${page}:`, response.error);
                    break;
                }
            } catch (error) {
                utils.Logger.error(`Erro na página ${page}:`, error);
                break;
            }
        }
        
        return results;
    }
    
    async loadAllImages() {
        const results = {
            originais: [],
            segmentadas: [],
            metricas: []
        };
        
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            try {
                const response = await this.loadImagesPage(page, CONFIG.API.DEFAULT_PARAMS.BULK_LOAD_SIZE);
                
                if (response.success) {
                    results.originais.push(...response.data.originais);
                    results.segmentadas.push(...response.data.segmentadas);
                    results.metricas.push(...response.data.metricas);
                    
                    hasMore = response.data.hasMore;
                    page++;
                } else {
                    throw new Error(response.error);
                }
            } catch (error) {
                utils.Logger.error('Erro ao carregar todas as imagens:', error);
                throw error;
            }
        }
        
        return results;
    }
    
    // Construir URL completa para imagem
    getImageUrl(imagePath) {
        return `${this.api.baseUrl}${imagePath}`;
    }
}

const apiClient = new APIClient(CONFIG.API.BASE_URL);
const imageService = new ImageService(apiClient);

window.API = {
    client: apiClient,
    images: imageService
};