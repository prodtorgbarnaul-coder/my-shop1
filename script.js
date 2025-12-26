// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [];
let currentUser = null;

// Ваши категории
const categoriesData = JSON.parse(localStorage.getItem('categoriesData')) || [
    { 
        name: 'Бытовая химия', 
        code: 'BH',
        icon: '🧴', 
        color1: '#667eea', 
        color2: '#764ba2',
        backgroundType: 'gradient'
    },
    { 
        name: 'Постельное белье', 
        code: 'PB',
        icon: '🛏️', 
        color1: '#f093fb', 
        color2: '#f5576c',
        backgroundType: 'gradient'
    },
    { 
        name: 'Рыба и морепродукты', 
        code: 'RB',
        icon: '🐟', 
        color1: '#4facfe', 
        color2: '#00f2fe',
        backgroundType: 'gradient'
    },
    { 
        name: 'Мясо и птица', 
        code: 'MT',
        icon: '🍗', 
        color1: '#43e97b', 
        color2: '#38f9d7',
        backgroundType: 'gradient'
    },
    { 
        name: 'Кондитерские изделия', 
        code: 'KD',
        icon: '🍰', 
        color1: '#fa709a', 
        color2: '#fee140',
        backgroundType: 'gradient'
    },
    { 
        name: 'Молочные продукты', 
        code: 'ML',
        icon: '🥛', 
        color1: '#30cfd0', 
        color2: '#330867',
        backgroundType: 'gradient'
    },
    { 
        name: 'Мангальные зоны и мангалы', 
        code: 'MM',
        icon: '🔥', 
        color1: '#ffecd2', 
        color2: '#fcb69f',
        backgroundType: 'gradient'
    }
];

// Настройки сайта
let siteSettings = JSON.parse(localStorage.getItem('siteSettings')) || {
    backgroundType: 'gradient',
    backgroundImage: '',
    headerColor: '#2c5aa0',
    logoText: 'ДЛЯ СВОИХ'
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    loadData();
    loadCategories();
    loadProducts();
    updateCategoryFilter();
    updateCartCount();
    setupSearch();
    
    // Применяем сохраненные настройки
    applySiteSettings();
    
    console.log('✅ Магазин инициализирован');
}

function loadData() {
    // Загружаем товары из localStorage или создаем тестовые
    products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (products.length === 0) {
        // Создаем демо-товары по вашим категориям
        products = [
            {
                id: 1001,
                name: 'FAIRY банан - 5 литров',
                category: 'Бытовая химия',
                code: 'BH',
                price: 800,
                quantity: 50,
                status: 'in_stock',
                description: 'Концентрированное средство для мытья посуды',
                image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=FAIRY'
            },
            {
                id: 1002,
                name: 'Постельное белье "Люкс"',
                category: 'Постельное белье',
                code: 'PB',
                price: 2500,
                quantity: 20,
                status: 'in_stock',
                description: 'Хлопковое постельное белье премиум-класса',
                image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Белье'
            },
            {
                id: 1003,
                name: 'Лосось свежий',
                category: 'Рыба и морепродукты',
                code: 'RB',
                price: 1500,
                quantity: 15,
                status: 'in_stock',
                description: 'Охлажденный норвежский лосось',
                image: 'https://via.placeholder.com/300x200/4facfe/ffffff?text=Лосось'
            },
            {
                id: 1004,
                name: 'Стейк говяжий',
                category: 'Мясо и птица',
                code: 'MT',
                price: 1200,
                quantity: 30,
                status: 'in_stock',
                description: 'Премиальный стейк рибай',
                image: 'https://via.placeholder.com/300x200/43e97b/ffffff?text=Стейк'
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    filteredProducts = [...products];
}

function applySiteSettings() {
    if (siteSettings.backgroundType === 'gradient') {
        document.body.style.background = `linear-gradient(135deg, ${siteSettings.color1 || '#667eea'}, ${siteSettings.color2 || '#764ba2'})`;
    } else if (siteSettings.backgroundType === 'solid') {
        document.body.style.background = siteSettings.solidColor;
    } else if (siteSettings.backgroundType === 'image' && siteSettings.backgroundImage) {
        document.body.style.background = `url('${siteSettings.backgroundImage}') center/cover fixed`;
    }
    
    // Обновляем логотип
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.textContent = siteSettings.logoText;
    }
}

// ========== КАТЕГОРИИ ==========
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = categoriesData.map(category => {
        const background = category.backgroundType === 'gradient' 
            ? `linear-gradient(135deg, ${category.color1}, ${category.color2})`
            : category.color1;
        
        return `
            <div class="category-card" onclick="filterByCategory('${category.name}')">
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
                <small>Код: ${category.code}</small>
            </div>
        `;
    }).join('');
}

function filterByCategory(categoryName) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = categoryName;
    }
    filterProducts();
    
    // Прокрутка к товарам
    const productsSection = document.getElementById('productsSection');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========== ТОВАРЫ ==========
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: var(--gray); margin-bottom: 20px;">Товары не найдены</h3>
                <p style="color: var(--gray);">Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const statusClass = `status-${product.status ? product.status.replace('_', '-') : 'in-stock'}`;
        const statusText = getProductStatusText(product.status);
        
        return `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onclick="showProductDetails(${product.id})">
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name" onclick="showProductDetails(${product.id})">${product.name}</h3>
                    <div class="product-description-short">${product.description || 'Описание товара'}</div>
                    
                    <div class="product-price">
                        <span class="current-price">${(product.price || 0).toLocaleString()} ₽</span>
                    </div>
                    
                    <div class="product-status ${statusClass}">
                        ${statusText}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> В корзину
                        </button>
                        <button class="details-btn" onclick="showProductDetails(${product.id})">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getProductStatusText(status) {
    const statuses = {
        'in_stock': 'В наличии',
        'out_of_stock': 'Нет в наличии',
        'pre_order': 'Под заказ'
    };
    return statuses[status] || 'В наличии';
}

// ========== ФИЛЬТРАЦИЯ И ПОИСК ==========
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Собираем уникальные категории из товаров
    const categoriesFromProducts = [...new Set(products.map(p => p.category))];
    const allCategories = [...new Set([...categoriesFromProducts, ...categoriesData.map(c => c.name)])];
    
    categoryFilter.innerHTML = '<option value="">Все категории</option>' +
        allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function filterProducts() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const priceRange = document.getElementById('priceFilter')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    filteredProducts = products.filter(product => {
        // Фильтр по категории
        if (category && product.category !== category) return false;
        
        // Фильтр по цене
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (product.price < min || product.price > max) return false;
        }
        
        // Поиск
        if (searchTerm) {
            const matches = product.name.toLowerCase().includes(searchTerm) ||
                          product.description.toLowerCase().includes(searchTerm) ||
                          product.category.toLowerCase().includes(searchTerm);
            if (!matches) return false;
        }
        
        return true;
    });
    
    loadProducts();
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn') || 
                     document.querySelector('.search-bar button');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', filterProducts);
    }
}

function searchProducts() {
    filterProducts();
}

// ========== СОРТИРОВКА ==========
function sortProducts() {
    const sortBy = document.getElementById('sortBy')?.value || 'name';
    
    if (sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    loadProducts();
}

// ========== КОРЗИНА ==========
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            cartId: Date.now()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('✅ Товар добавлен в корзину!');
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function openCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!modal || !cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">Корзина пуста</p>';
        if (cartTotal) cartTotal.textContent = '0';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image || 'https://via.placeholder.com/60x60/ecf0f1/7f8c8d?text=Нет'}" 
                     alt="${item.name}" 
                     class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price || 0} ₽ × ${item.quantity || 1}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="changeQuantity(${item.cartId}, -1)">-</button>
                    <span>${item.quantity || 1}</span>
                    <button class="quantity-btn" onclick="changeQuantity(${item.cartId}, 1)">+</button>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.cartId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
        if (cartTotal) cartTotal.textContent = total.toLocaleString();
    }
    
    modal.style.display = 'block';
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.style.display = 'none';
}

function changeQuantity(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity = (item.quantity || 1) + change;
        if (item.quantity <= 0) {
            removeFromCart(cartId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            openCart();
        }
    }
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCart();
    showNotification('Товар удален из корзины');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    showNotification(`✅ Заказ оформлен! Сумма: ${total.toLocaleString()} ₽`);
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    closeCart();
}

// ========== МОДАЛЬНЫЕ ОКНА ==========
function openProfile() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'block';
}

function closeProfile() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
}

function openNotifications() {
    showNotification('У вас нет новых уведомлений');
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const content = document.getElementById('productModalContent');
    
    if (!product || !modal || !title || !content) return;
    
    title.textContent = product.name;
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${product.image || 'https://via.placeholder.com/400x300/ecf0f1/7f8c8d?text=Нет+изображения'}" 
                 alt="${product.name}" 
                 style="max-width: 100%; max-height: 300px; border-radius: 10px;">
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Категория:</strong> ${product.category}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Цена:</strong> <span style="font-size: 1.5rem; color: var(--primary); font-weight: bold;">${product.price || 0} ₽</span>
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Наличие:</strong> ${product.quantity || 0} шт.
        </div>
        <div style="margin-bottom: 20px;">
            <strong>Описание:</strong>
            <p style="margin-top: 10px; line-height: 1.6;">${product.description || 'Описание товара'}</p>
        </div>
        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeProductModal();" style="width: 100%;">
            <i class="fas fa-shopping-cart"></i> Добавить в корзину
        </button>
    `;
    
    modal.style.display = 'block';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ========== КОНСТРУКТОР (АДМИН) ==========
function toggleConstructor() {
    // Проверяем авторизацию
    if (!localStorage.getItem('isAdmin')) {
        showNotification('Войдите как администратор');
        return;
    }
    
    const toolbar = document.querySelector('.constructor-toolbar');
    const editButtons = document.getElementById('editButtons');
    
    if (!toolbar || !editButtons) return;
    
    if (toolbar.classList.contains('expanded')) {
        toolbar.classList.remove('expanded');
        editButtons.style.display = 'none';
    } else {
        toolbar.classList.add('expanded');
        editButtons.style.display = 'flex';
    }
}

function editBackground() {
    showNotification('Редактирование фона - функция в разработке');
}

function editHeader() {
    showNotification('Редактирование шапки - функция в разработке');
}

function editCategories() {
    showNotification('Редактирование категорий - функция в разработке');
}

function editProducts() {
    showNotification('Редактирование товаров - функция в разработке');
}

function editOrders() {
    showNotification('Редактирование заказов - функция в разработке');
}

function editGiveaway() {
    showNotification('Редактирование розыгрыша - функция в разработке');
}

function saveDesign() {
    showNotification('Дизайн сохранен');
}

function logout() {
    localStorage.removeItem('isAdmin');
    showNotification('Вы вышли из системы');
}

// ========== ЭКСПОРТ ФУНКЦИЙ ДЛЯ HTML ==========
// ВСЕ функции, которые вызываются из HTML (onclick="...") должны быть здесь:
window.filterByCategory = filterByCategory;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.sortProducts = sortProducts;
window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.openNotifications = openNotifications;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.toggleConstructor = toggleConstructor;
window.editBackground = editBackground;
window.editHeader = editHeader;
window.editCategories = editCategories;
window.editProducts = editProducts;
window.editOrders = editOrders;
window.editGiveaway = editGiveaway;
window.saveDesign = saveDesign;
window.logout = logout;

console.log('✅ Все функции магазина загружены и экспортированы');
// ============================================
// ФУНКЦИЯ ВЫХОДА ИЗ АДМИНКИ (ВРЕМЕННОЕ РЕШЕНИЕ)
// ============================================

function logoutAdmin() {
    console.log('Выход из админ-панели...');
    localStorage.removeItem('adminUser');
    window.location.href = 'index.html';
}

// Проверяем, если мы на странице админки, добавляем обработчик
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && window.location.pathname.includes('admin.html')) {
        logoutBtn.addEventListener('click', logoutAdmin);
        console.log('Обработчик выхода установлен (временное решение)');
    }
});
