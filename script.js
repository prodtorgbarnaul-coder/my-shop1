// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    APP: {
        NAME: 'PRODTORG',
        VERSION: '1.0.0',
        YEAR: new Date().getFullYear()
    }
};

// ==================== ДАННЫЕ ====================
let products = [];
let categories = [];
let cart = [];
let wishlist = [];

// ==================== ДЕМО-ДАННЫЕ ====================
const demoProducts = [
    {
        id: '1',
        name: 'Смартфон Apple iPhone 14 Pro',
        category: 'Смартфоны',
        price: 99990,
        oldPrice: 109990,
        quantity: 15,
        description: 'Флагманский смартфон Apple с динамическим островом',
        image: 'https://via.placeholder.com/300x300/3498db/ffffff?text=iPhone',
        rating: 4.8,
        isNew: true,
        isBestseller: true
    },
    {
        id: '2',
        name: 'Ноутбук MacBook Pro 16"',
        category: 'Ноутбуки',
        price: 249990,
        quantity: 8,
        description: 'Профессиональный ноутбук от Apple',
        image: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=MacBook',
        rating: 4.9,
        isFeatured: true
    },
    {
        id: '3',
        name: 'Наушники Sony WH-1000XM5',
        category: 'Наушники',
        price: 34990,
        oldPrice: 39990,
        quantity: 25,
        description: 'Беспроводные наушники с шумоподавлением',
        image: 'https://via.placeholder.com/300x300/2ecc71/ffffff?text=Sony',
        rating: 4.7,
        isOnSale: true
    }
];

// ==================== УТИЛИТЫ ====================
const Utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    },

    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message);
    },

    showLoader(show = true) {
        const loader = document.getElementById('loader-overlay');
        if (loader) {
            loader.classList.toggle('active', show);
        }
    }
};

// ==================== UI КОМПОНЕНТЫ ====================
const UI = {
    init() {
        this.renderHeader();
        this.renderHero();
        this.renderProducts();
        this.bindEvents();
        this.loadData();
    },

    renderHeader() {
        const headerHTML = `
            <div class="header-container">
                <a href="/" class="logo">
                    <div class="logo-icon">P</div>
                    <div class="logo-text">
                        <div class="logo-title">PRODTORG</div>
                        <div class="logo-subtitle">Интернет-магазин</div>
                    </div>
                </a>
                
                <div class="header-actions">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="search-input" placeholder="Поиск товаров..." id="searchInput">
                    </div>
                    
                    <button class="action-btn" onclick="UI.toggleCart()">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="badge" id="cartCount">0</span>
                    </button>
                </div>
            </div>
        `;
        
        const header = document.createElement('header');
        header.innerHTML = headerHTML;
        document.getElementById('app').appendChild(header);
    },

    renderHero() {
        const heroHTML = `
            <section class="hero">
                <div class="container">
                    <h1 class="hero-title">Добро пожаловать в PRODTORG</h1>
                    <p class="hero-subtitle">Лучшие товары по выгодным ценам</p>
                    <div class="hero-actions">
                        <a href="#products" class="btn btn-primary btn-lg">
                            <i class="fas fa-shopping-bag"></i> Начать покупки
                        </a>
                    </div>
                </div>
            </section>
        `;
        
        const hero = document.createElement('div');
        hero.innerHTML = heroHTML;
        document.getElementById('app').appendChild(hero);
    },

    renderProducts() {
        const sectionHTML = `
            <section class="section" id="products">
                <div class="container">
                    <h2 class="section-title">Каталог товаров</h2>
                    <div class="products-grid" id="productsGrid">
                        <!-- Товары будут здесь -->
                    </div>
                </div>
            </section>
        `;
        
        const section = document.createElement('div');
        section.innerHTML = sectionHTML;
        document.getElementById('app').appendChild(section);
        this.updateProductsGrid();
    },

    updateProductsGrid() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/300x300/ecf0f1/7f8c8d?text=Товар'">
                    ${product.isNew ? '<span class="badge badge-new">Новинка</span>' : ''}
                    ${product.oldPrice ? '<span class="badge badge-sale">Скидка</span>' : ''}
                </div>
                
                <div class="product-content">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-price">
                        <span class="current-price">${Utils.formatPrice(product.price)}</span>
                        ${product.oldPrice ? 
                            `<span class="old-price">${Utils.formatPrice(product.oldPrice)}</span>` : ''}
                    </div>
                    
                    <div class="product-meta">
                        <div class="stock-status">
                            <span class="stock-indicator stock-in"></span>
                            В наличии: ${product.quantity} шт.
                        </div>
                        
                        <button class="btn btn-primary btn-sm" onclick="UI.addToCart('${product.id}')">
                            <i class="fas fa-cart-plus"></i> В корзину
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    loadData() {
        Utils.showLoader(true);
        
        // Используем демо-данные
        setTimeout(() => {
            products = [...demoProducts];
            categories = [...new Set(products.map(p => p.category))].map(name => ({ name }));
            
            this.updateProductsGrid();
            Utils.showLoader(false);
            Utils.showNotification(`Загружено ${products.length} товаров`, 'success');
        }, 1000);
    },

    addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        cart.push({
            ...product,
            cartQuantity: 1
        });
        
        this.updateCartCount();
        Utils.showNotification(`${product.name} добавлен в корзину`, 'success');
    },

    updateCartCount() {
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            countElement.textContent = cart.length;
        }
    },

    toggleCart() {
        alert('Корзина пока в разработке. Товаров в корзине: ' + cart.length);
    },

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('Поиск:', e.target.value);
            });
        }
    }
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

