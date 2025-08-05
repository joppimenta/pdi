const formatTimestamp = () => {
    return new Date().toLocaleTimeString('pt-BR');
};

const formatMetric = (value, type = 'decimal') => {
    if (typeof value !== 'number') return 'N/A';
    
    switch (type) {
        case 'percentage':
            return `${(value * 100).toFixed(1)}%`;
        case 'decimal':
            return value.toFixed(3);
        default:
            return value.toString();
    }
};

// Extrator de nome de arquivo
const getFileName = (path) => {
    return path.split('/').pop() || 'arquivo';
};

// Criador de elementos DOM
const createElement = (tag, className = '', innerHTML = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
};

const Logger = {
    info: (message, data = null) => {
        console.log(`[INFO] ${message}`, data || '');
    },
    error: (message, error = null) => {
        console.error(`[ERROR] ${message}`, error || '');
    },
    warn: (message, data = null) => {
        console.warn(`[WARN] ${message}`, data || '');
    }
};

const handleHttpError = (response) => {
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }
    return response;
};

// Animações suaves
const animate = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    },
    
    fadeOut: (element, duration = 300) => {
        element.style.opacity = '1';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
};

window.utils = {
    formatTimestamp,
    formatMetric,
    getFileName,
    createElement,
    Logger,
    handleHttpError,
    animate
};