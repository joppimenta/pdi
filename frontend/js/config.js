const CONFIG = {
    API: {
        BASE_URL: 'http://127.0.0.1:8000',
        ENDPOINTS: {
            COMPARE_IMAGES: '/compare-images/'
        },
        DEFAULT_PARAMS: {
            PER_PAGE: 5,
            LOAD_MORE_SIZE: 5,
            BULK_LOAD_SIZE: 20
        }
    },
    
    UI: {
        ANIMATION_DURATION: 300,
        IMAGE_HOVER_SCALE: 1.05,
        MODAL_Z_INDEX: 1000
    },
    
    IMAGES: {
        MAX_HEIGHT: 400,
        MODAL_MAX_WIDTH: '90%',
        MODAL_MAX_HEIGHT: '90%',
        THUMBNAIL_MAX_HEIGHT: 300
    },
    
    MESSAGES: {
        LOADING: 'Carregando imagens...',
        NO_IMAGES: 'Nenhuma imagem encontrada',
        ERROR_PREFIX: 'Erro ao carregar imagens: ',
        SERVER_CHECK: 'Verifique se o servidor está rodando em ',
        SUCCESS_LOAD: 'Imagens carregadas com sucesso'
    }
};

window.CONFIG = CONFIG;