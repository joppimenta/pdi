const DOMElements = {
    loadImagesBtn: null,
    refreshBtn: null,
    loadMoreBtn: null,
    showAllBtn: null,
    loading: null,
    errorMessage: null,
    imagesSection: null,
    imagesContainer: null,
    
    init() {
        this.loadImagesBtn = document.getElementById('loadImagesBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.showAllBtn = document.getElementById('showAllBtn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.imagesSection = document.getElementById('imagesSection');
        this.imagesContainer = document.getElementById('imagesContainer');
    }
};

const LoadingController = {
    show() {
        DOMElements.loading.classList.remove('hidden');
        this.updateButtonStates(true);
    },
    
    hide() {
        DOMElements.loading.classList.add('hidden');
        this.updateButtonStates(false);
    },
    
    updateButtonStates(isLoading) {
        if (isLoading) {
            DOMElements.loadImagesBtn.textContent = 'Carregando...';
            DOMElements.refreshBtn.textContent = 'Atualizando...';
            DOMElements.loadImagesBtn.disabled = true;
            DOMElements.refreshBtn.disabled = true;
        } else {
            DOMElements.loadImagesBtn.textContent = 'Carregar Imagens';
            DOMElements.refreshBtn.textContent = 'Atualizar';
            DOMElements.loadImagesBtn.disabled = false;
            DOMElements.refreshBtn.disabled = false;
        }
    }
};
 
const ErrorController = {
    show(message) {
        DOMElements.errorMessage.textContent = message;
        DOMElements.errorMessage.classList.remove('hidden');
        utils.Logger.error('UI Error:', message);
    },
    
    hide() {
        DOMElements.errorMessage.classList.add('hidden');
    }
};
 
const PaginationController = {
    showLoadMore() {
        DOMElements.loadMoreBtn.classList.remove('hidden');
    },
    
    hideLoadMore() {
        DOMElements.loadMoreBtn.classList.add('hidden');
    },
    
    showShowAll() {
        DOMElements.showAllBtn.classList.remove('hidden');
    },
    
    hideShowAll() {
        DOMElements.showAllBtn.classList.add('hidden');
    },
    
    updateLoadMoreButton(isLoading) {
        if (isLoading) {
            DOMElements.loadMoreBtn.disabled = true;
            DOMElements.loadMoreBtn.textContent = 'Carregando...';
        } else {
            DOMElements.loadMoreBtn.disabled = false;
            DOMElements.loadMoreBtn.textContent = 'Carregar Mais 5 ⬇️';
        }
    },
    
    updateShowAllButton(isLoading) {
        if (isLoading) {
            DOMElements.showAllBtn.disabled = true;
            DOMElements.showAllBtn.textContent = 'Carregando Todas...';
        } else {
            DOMElements.showAllBtn.disabled = false;
            DOMElements.showAllBtn.textContent = 'Mostrar Todas';
        }
    },
    
    hideAll() {
        this.hideLoadMore();
        this.hideShowAll();
    }
};

const ContentController = {
    show() {
        DOMElements.imagesSection.classList.remove('hidden');
    },
    
    hide() {
        DOMElements.imagesSection.classList.add('hidden');
    },
    
    clear() {
        DOMElements.imagesContainer.innerHTML = '';
    }
};

const TimestampController = {
    update() {
        const timestamp = utils.formatTimestamp();
        
        let timestampDiv = document.querySelector('.timestamp');
        if (!timestampDiv) {
            timestampDiv = utils.createElement('div', 'timestamp');
            DOMElements.imagesContainer.insertBefore(timestampDiv, DOMElements.imagesContainer.firstChild);
        }
        
        timestampDiv.textContent = `Última atualização: ${timestamp}`;
    }
};
 
const UIController = {
    init() {
        DOMElements.init();
    },
    
    showLoading() {
        LoadingController.show();
        ErrorController.hide();
        ContentController.hide();
    },
    
    hideLoading() {
        LoadingController.hide();
    },
    
    showError(message) {
        LoadingController.hide();
        ErrorController.show(message);
    },
    
    showContent() {
        ContentController.show();
        TimestampController.update();
    },
    
    clearContent() {
        ContentController.clear();
    },
    
    updatePagination(hasMore, showShowAll = false) {
        if (hasMore) {
            PaginationController.showLoadMore();
            if (showShowAll) {
                PaginationController.showShowAll();
            }
        } else {
            PaginationController.hideLoadMore();
            if (showShowAll) {
                PaginationController.showShowAll();
            }
        }
    },
    
    hidePagination() {
        PaginationController.hideAll();
    },
    
    setLoadMoreLoading(isLoading) {
        PaginationController.updateLoadMoreButton(isLoading);
    },
    
    setShowAllLoading(isLoading) {
        PaginationController.updateShowAllButton(isLoading);
    }
};

window.UI = UIController;