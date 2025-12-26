// ============================================
// ГЛАВНЫЙ СКРИПТ ИНТЕРНЕТ-МАГАЗИНА
// ============================================

// Глобальные переменные
let allProducts = [];
let allCategories = [];
let cart = [];
let filteredProducts = [];

// Категории магазина (должны совпадать с админкой)
const shopCategories = [
    {
        id: 1,
        name: 'Бытовая химия',
        code: 'BH',
        icon: '🧴',
        color1: '#667eea',
        color2: '#764ba2',
        description: 'Средства для дома и чистоты'
    },
    {
        id: 2,
        name: 'Постельное белье',
        code: 'PB',
        icon: '🛏️',
        color1: '#f093fb',
        color2: '#f5576c',
        description: 'Качественное постельное белье'
    },
    {
        id: 3,
        name: 'Рыба',
        code: 'RB',
        icon: '🐟',
        color1: '#4facfe',
        color2: '#00f2fe',
        description: 'Свежая рыба и морепродукты'
    },
    {
        id: 4,
        name: 'Мясо',
        code: 'MT',
        icon: '🍗',
        color1: '#43e97b',
        color2: '#38f9d7',
        description: 'Мясо и птица'
    },
    {
        id: 5,
        name: 'Кондитерские изделия',
        code: 'KD',
        icon: '🍰',
        color1: '#fa709a',
        color2: '#fee140',
        description: 'Сладости и выпечка'
    },
    {
        id: 6,
        name: 'Молочные продукты',
        code: 'ML',
        icon: '🥛',
        color1: '#30cfd0',
        color2: '#330867',
        description: 'Молочная продукция'
    },
    {
        id: 7,
        name: 'Мангалы',
        code: 'MM',
        icon: '🔥',
        color1: '#ffecd2',
        color2: '#fcb69f',
        description: 'Мангалы и аксессуары'
    }
];

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Инициализация магазина...');
    
    // Загружаем данные
    loadData();
    
    // Инициализируем интерфейс
    initInterface();
    
    // Проверяем авторизацию для конструктора
    checkAdminStatus();
    
    console.log('✅ Магазин готов к работе!');
});

// Загрузка данных
function loadData() {
    console.log('📥 Загрузка данных...');
    
    // Загружаем товары
    const savedProducts = localStorage.getItem('shopProducts');
    if (savedProducts) {
        allProducts = JSON.parse(savedProducts);
        filteredProducts = [...allProducts];
        console.log(`📦 Загружено ${allProducts.length} товаров`);
    } else {
        // Если товаров нет, создаем демо-данные
        createDemoProducts();
    }
    
    // Загружаем корзину
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log(`🛒 Загружено ${cart.length} товаров в корзине`);
    }
    
    // Загружаем категории
    allCategories = [...shopCategories];
    console.log(`🏷️ Загружено ${allCategories.length} категорий`);
}

// Создание демо-товаров (если нет данных)
function createDemoProducts() {
    console.log('🎭 Создание демо-товаров...');
    
    const demoProducts = [
        {
            id: 1,
            код_товара: 'BH001',
            категория: 'Бытовая химия',
            название: 'FAIRY банан - 5 литров',
            бренд: 'FAIRY',
            описание: 'Концентрированное средство для мытья посуды с ароматом банана. Экономичный расход, 5 литров.',
            цена_закупки: 560,
            цена_продажи: 800,
            количество: 25,
            статус: 'да',
            изображение: 'https://via.placeholder.com/300x200/667eea/ffffff?text=FAIRY',
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            код_товара: 'PB001',
            категория: 'Постельное белье',
            название: 'Постельное белье "Люкс"',
            бренд: 'Luxury Linens',
            описание: 'Хлопковое постельное белье премиум-класса, 1.5 спальное, сатин.',
            цена_закупки: 1800,
            цена_продажи: 2500,
            количество: 12,
            статус: 'да',
            изображение: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Люкс',
            createdAt: '2024-01-16'
        },
        {
            id: 3,
            код_товара: 'RB001',
            категория: 'Рыба',
            название: 'Лосось свежий',
            бренд: 'Норвежский',
            описание: 'Охлажденный норвежский лосось, филе, 1 кг.',
            цена_закупки: 1050,
            цена_продажи: 1500,
            количество: 8,
            статус: 'да',
            изображение: 'https://via.placeholder.com/300x200/4facfe/ffffff?text=Лосось',
            createdAt: '2024-01-17'
        },
        {
            id: 4,
            код_товара: 'MT001',
            категория: 'Мясо',
            название: 'Стейк говяжий',
            бренд: 'Premium Beef',
            описание: 'Премиальный стейк рибай, выдержка 28 дней, 300 гр.',
            цена_закупки: 840,
            цена_продажи: 1200,
            количество: 15,
            статус: 'да',
            изображение: 'https://via.placeholder.com/300x200/43e97b/ffffff?text=Стейк',
            createdAt: '2024-01-18'
        },
        {
            id: 5,
            код_товара: 'KD001',
            категория: 'Кондитерские изделия',
            название: 'Шоколадные конфеты',
            бренд: 'Sweet Dreams',
            описание: 'Ассорти шоколадных конфет ручной работы, 500 гр.',
            цена_закупки: 420,
            цена_продажи: 600,
            количество: 30,
            статус: 'да',
            изображение: 'https://via.placeholder.com/300x200/fa709a/ffffff?text=Конфеты',
            createdAt: '2024-01-19'
        },
        {
            id: 6,
            код_товара: 'ML001',
            категория: 'Молочные продукты',
            название: 'Сыр пармезан',
            бренд: 'Italian Cheese',
            описание: 'Настоящий итальянский пармезан, выдержка 12 месяцев, 200 гр.',
            цена_закупки: 560,
            цена_продажи: 800,
            количество: 20,
            статус: 'да',
            изображение: 'https://via.placeholder.com/300x200/30cfd0/ffffff?text=Пармезан',
            createdAt: '2024-01-20'
        },
        {
            id: 7,
            код_товара: 'MM001',
            категория: 'Мангалы',
            название: 'Мангал стальной',
            бренд: 'Grill Master',
            описание: 'Стальной мангал с регулируемой высотой, размер 40x20x15 см.',
            цена_закупки: 2100,
            цена_продажи: 3000,
            количество: 10,
            статус: 'да',
            изображение: 'https://via.placeholder.com/300x200/ffecd2/333333?text=Мангал',
            createdAt: '2024-01-21'
        }
    ];
    
    allProducts = demoProducts;
    filteredProducts = [...demoProducts];
    localStorage.setItem('shopProducts', JSON.stringify(demoProducts));
}

// Инициализация интерфейса
function initInterface() {
    // Обновляем категории
    updateCategories();
    
    // Обновляем товары
    updateProductsGrid();
    
    // Обновляем корзину
    updateCartCount();
    
    // Обновляем фильтры
    updateCategoryFilter();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Проверяем данные
    checkData();
}

// ============================================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ============================================

// Обновление категорий
function updateCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = allCategories.map(category => {
        const productCount = allProducts.filter(p => p.категория === category.name).length;
        return `
            <a href="#" class="category-card" data-category="${category.name}" onclick="filterByCategory('${category.name}'); return false;">
                <div class="category-icon">${category.icon}</div>
                <h3>${category.name}</h3>
                <small>Код: ${category.code}</small>
                <div class="category-count">${productCount} товаров</div>
            </a>
        `;
    }).join('');
}

// Обновление товаров
function updateProductsGrid() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    document.getElementById('productsCount').textContent = filteredProducts.length;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--gray);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; display: block;"></i>
                <h3 style="margin-bottom: 10px;">Товары не найдены</h3>
                <p style="margin-bottom: 20px;">Попробуйте изменить параметры фильтрации</p>
                <button class="btn btn-primary" onclick="clearFilters()">
                    <i class="fas fa-times"></i> Сбросить фильтры
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
        const category = allCategories.find(c => c.name === product.категория) || {};
        const isInStock = product.статус === 'да' && (product.количество || 0) > 0;
        const statusText = isInStock ? 'В наличии' : 'Нет в наличии';
        const statusClass = isInStock ? 'status-in-stock' : 'status-out-of-stock';
        
        // Короткое описание (максимум 100 символов)
        const shortDescription = (product.описание || '').length > 100 
            ? (product.описание || '').substring(0, 100) + '...' 
            : product.описание || '';
        
        return `
            <div class="product-card">
                ${product.количество > 10 ? `<div class="product-badge">Хит продаж</div>` : ''}
                
                <img src="${product.изображение || `https://via.placeholder.com/300x200/${category.color1?.replace('#', '') || '667eea'}/ffffff?text=${encodeURIComponent(product.название?.substring(0, 15) || 'Товар')}`}" 
                     alt="${product.название}" 
                     class="product-image"
                     onclick="showProductDetails(${product.id})">
                
                <div class="product-info">
                    <div class="product-category" style="color: ${category.color1 || '#667eea'}">
                        ${product.категория}
                    </div>
                    
                    <h3 class="product-name" onclick="showProductDetails(${product.id})">
                        ${product.название}
                    </h3>
                    
                    <p class="product-description-short">
                        ${shortDescription}
                    </p>
                    
                    <div class="product-price">
                        <div class="current-price">
                            ${formatPrice(product.цена_продажи)}
                        </div>
                        ${product.количество <= 5 ? `<div class="product-status ${statusClass}">${statusText}</div>` : ''}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart" ${!isInStock ? 'disabled' : ''} onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            ${isInStock ? 'В корзину' : 'Нет в наличии'}
                        </button>
                        <button class="details-btn" onclick="showProductDetails(${product.id})">
                            <i class="fas fa-info-circle"></i> Подробнее
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Обновление счетчика корзины
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Обновление фильтра категорий
function updateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    // Уникальные категории из товаров
    const categories = [...new Set(allProducts.map(p => p.категория))];
    
    filter.innerHTML = '<option value="">Все категории</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Проверка данных
function checkData() {
    if (allProducts.length === 0) {
        console.warn('⚠️ Внимание: нет товаров в базе данных');
        showNotification('Используются демо-товары. Добавьте товары в админ-панели.', 'warning');
    }
}

// ============================================
// ФИЛЬТРАЦИЯ И ПОИСК
// ============================================

// Фильтрация по категории
function filterByCategory(categoryName) {
    if (categoryName === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(p => p.категория === categoryName);
    }
    
    updateProductsGrid();
    showNotification(`Показаны товары: ${categoryName === 'all' ? 'все категории' : categoryName}`, 'info');
}

// Применение фильтров
function applyFilters() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const sortBy = document.getElementById('sortFilter')?.value || '';
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    
    filteredProducts = [...allProducts];
    
    // Фильтрация по категории
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.категория === category);
    }
    
    // Поиск
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            (p.название && p.название.toLowerCase().includes(searchTerm)) ||
            (p.описание && p.описание.toLowerCase().includes(searchTerm)) ||
            (p.категория && p.категория.toLowerCase().includes(searchTerm))
        );
    }
    
    // Сортировка
    switch (sortBy) {
        case 'price_asc':
            filteredProducts.sort((a, b) => (a.цена_продажи || 0) - (b.цена_продажи || 0));
            break;
        case 'price_desc':
            filteredProducts.sort((a, b) => (b.цена_продажи || 0) - (a.цена_продажи || 0));
            break;
        case 'name_asc':
            filteredProducts.sort((a, b) => (a.название || '').localeCompare(b.название || ''));
            break;
        case 'name_desc':
            filteredProducts.sort((a, b) => (b.название || '').localeCompare(a.название || ''));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
    }
    
    updateProductsGrid();
}

// Поиск товаров
function searchProducts() {
    applyFilters();
}

// Сброс фильтров
function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortFilter').value = '';
    document.getElementById('productSearch').value = '';
    
    filteredProducts = [...allProducts];
    updateProductsGrid();
    
    showNotification('Фильтры сброшены', 'info');
}

// ============================================
// КОРЗИНА
// ============================================

// Добавление товара в корзину
function addToCart(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        showNotification('❌ Товар не найден', 'error');
        return;
    }
    
    // Проверяем наличие
    if (product.статус !== 'да' || (product.количество || 0) <= 0) {
        showNotification('❌ Товар отсутствует на складе', 'error');
        return;
    }
    
    // Ищем товар в корзине
    const cartItem = cart.find(item => item.id == productId);
    
    if (cartItem) {
        // Проверяем, не превышаем ли доступное количество
        if (cartItem.quantity >= (product.количество || 0)) {
            showNotification('⚠️ Достигнуто максимальное количество товара', 'warning');
            return;
        }
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.название,
            price: product.цена_продажи,
            image: product.изображение,
            category: product.категория,
            quantity: 1
        });
    }
    
    // Сохраняем корзину
    saveCart();
    
    // Обновляем интерфейс
    updateCartCount();
    showNotification('✅ Товар добавлен в корзину', 'success');
}

// Обновление количества товара в корзине
function updateCartQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id == productId);
    
    if (itemIndex === -1) return;
    
    const product = allProducts.find(p => p.id == productId);
    const newQuantity = cart[itemIndex].quantity + change;
    
    // Проверяем минимальное количество
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    // Проверяем максимальное количество
    if (product && newQuantity > (product.количество || 0)) {
        showNotification('⚠️ Превышено доступное количество', 'warning');
        return;
    }
    
    cart[itemIndex].quantity = newQuantity;
    saveCart();
    updateCartModal();
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    updateCartModal();
    updateCartCount();
    showNotification('🗑️ Товар удален из корзины', 'info');
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Очистка корзины
function clearCart() {
    if (!confirm('Очистить всю корзину?')) return;
    
    cart = [];
    saveCart();
    updateCartModal();
    updateCartCount();
    showNotification('🛒 Корзина очищена', 'info');
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('❌ Корзина пуста', 'error');
        return;
    }
    
    // Здесь будет логика оформления заказа
    showNotification('📦 Оформление заказа - в разработке', 'info');
}

// ============================================
// МОДАЛЬНЫЕ ОКНА
// ============================================

// Показать детали товара
function showProductDetails(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        showNotification('❌ Товар не найден', 'error');
        return;
    }
    
    const category = allCategories.find(c => c.name === product.категория) || {};
    const isInStock = product.статус === 'да' && (product.количество || 0) > 0;
    
    const modal = document.getElementById('productDetailsModal');
    const content = document.getElementById('productDetailsContent');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <div class="product-details">
            <div class="product-details-images">
                <img src="${product.изображение || `https://via.placeholder.com/400x300/${category.color1?.replace('#', '') || '667eea'}/ffffff?text=${encodeURIComponent(product.название?.substring(0, 20) || 'Товар')}`}" 
                     alt="${product.название}"
                     class="main-image">
            </div>
            
            <div class="product-details-info">
                <div class="product-category" style="color: ${category.color1 || '#667eea'}">
                    ${product.категория}
                </div>
                
                <h2 class="product-title">${product.название}</h2>
                
                <div class="product-price-details">
                    <span class="price">${formatPrice(product.цена_продажи)}</span>
                    ${product.цена_закупки ? `<span class="margin">Наценка: ${Math.round((product.цена_продажи / product.цена_закупки - 1) * 100)}%</span>` : ''}
                </div>
                
                <div class="product-stock">
                    <span class="stock-label ${isInStock ? 'in-stock' : 'out-of-stock'}">
                        ${isInStock ? '✓ В наличии' : '✗ Нет в наличии'}
                    </span>
                    <span class="stock-count">Остаток: ${product.количество || 0} шт.</span>
                </div>
                
                <div class="product-description-full">
                    <h4>Описание</h4>
                    <p>${product.описание || 'Описание отсутствует'}</p>
                </div>
                
                <div class="product-details-actions">
                    <button class="btn btn-primary btn-lg" ${!isInStock ? 'disabled' : ''} onclick="addToCart(${product.id}); closeModal('productDetailsModal')">
                        <i class="fas fa-shopping-cart"></i>
                        ${isInStock ? 'Добавить в корзину' : 'Нет в наличии'}
                    </button>
                    <button class="btn btn-outline" onclick="closeModal('productDetailsModal')">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Обновление модального окна корзины
function updateCartModal() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 40px 20px; color: var(--gray);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px; display: block;"></i>
                <h3 style="margin-bottom: 10px;">Корзина пуста</h3>
                <p>Добавьте товары из каталога</p>
            </div>
        `;
        document.getElementById('cartTotal').textContent = '0 ₽';
        return;
    }
    
    // Вычисляем общую сумму
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = formatPrice(total);
    
    container.innerHTML = cart.map(item => {
        const product = allProducts.find(p => p.id == item.id);
        const category = product ? allCategories.find(c => c.name === product.категория) : {};
        
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || `https://via.placeholder.com/80x60/${category?.color1?.replace('#', '') || '667eea'}/ffffff?text=${encodeURIComponent(item.name?.substring(0, 10) || 'Т')}`}" 
                         alt="${item.name}">
                </div>
                
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-category" style="color: ${category?.color1 || '#667eea'}; font-size: 12px;">
                        ${product?.категория || ''}
                    </div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="cart-item-total">
                    ${formatPrice(item.price * item.quantity)}
                </div>
                
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Показать корзину
function showCart() {
    updateCartModal();
    document.getElementById('cartModal').style.display = 'block';
}

// Закрыть модальное окно
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ============================================
// КОНСТРУКТОР (РЕДАКТИРОВАНИЕ САЙТА)
// ============================================

// Проверка статуса администратора
function checkAdminStatus() {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin) {
        initConstructor();
    }
}

// Инициализация конструктора
function initConstructor() {
    const toolbar = document.createElement('div');
    toolbar.className = 'constructor-toolbar';
    toolbar.innerHTML = `
        <div class="constructor-toggle" onclick="toggleConstructor()">
            <i class="fas fa-cog"></i>
        </div>
        <div id="editButtons">
            <button class="edit-btn" onclick="editStoreName()">
                <i class="fas fa-store"></i> Название магазина
            </button>
            <button class="edit-btn" onclick="editHero()">
                <i class="fas fa-image"></i> Заголовок
            </button>
            <button class="edit-btn" onclick="editCategories()">
                <i class="fas fa-tags"></i> Категории
            </button>
            <button class="edit-btn" onclick="editContacts()">
                <i class="fas fa-phone"></i> Контакты
            </button>
            <button class="edit-btn" onclick="logoutAdmin()">
                <i class="fas fa-sign-out-alt"></i> Выйти
            </button>
        </div>
    `;
    
    document.body.appendChild(toolbar);
}

// Переключение конструктора
function toggleConstructor() {
    const toolbar = document.querySelector('.constructor-toolbar');
    const buttons = document.getElementById('editButtons');
    
    toolbar.classList.toggle('expanded');
    
    if (toolbar.classList.contains('expanded')) {
        buttons.style.display = 'flex';
    } else {
        buttons.style.display = 'none';
    }
}

// Редактирование названия магазина
function editStoreName() {
    const currentName = document.querySelector('.logo').textContent;
    const newName = prompt('Введите новое название магазина:', currentName);
    
    if (newName && newName !== currentName) {
        document.querySelector('.logo').textContent = newName;
        showNotification('✅ Название магазина изменено', 'success');
    }
}

// Редактирование заголовка
function editHero() {
    const currentTitle = document.querySelector('.hero h1').textContent;
    const currentDescription = document.querySelector('.hero p').textContent;
    
    const newTitle = prompt('Введите новый заголовок:', currentTitle);
    const newDescription = prompt('Введите новое описание:', currentDescription);
    
    if (newTitle) {
        document.querySelector('.hero h1').textContent = newTitle;
    }
    
    if (newDescription) {
        document.querySelector('.hero p').textContent = newDescription;
    }
    
    if (newTitle || newDescription) {
        showNotification('✅ Заголовок обновлен', 'success');
    }
}

// Выход из режима администратора
function logoutAdmin() {
    localStorage.removeItem('isAdmin');
    document.querySelector('.constructor-toolbar').remove();
    showNotification('👋 Вы вышли из режима редактирования', 'info');
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Форматирование цены
function formatPrice(price) {
    if (!price) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price) + ' ₽';
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удаляем предыдущие уведомления
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; padding: 15px 20px; border-radius: 8px; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
            <i class="fas fa-${icons[type] || 'info-circle'}" 
               style="color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'}; font-size: 20px;"></i>
            <span style="font-weight: 500;">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProducts, 300));
    }
    
    // Фильтры
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', applyFilters);
    });
    
    // Модальные окна - закрытие по клику вне
    window.onclick = function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    };
    
    // Закрытие модальных окон по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    // Прокрутка плавная
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Дебаунс для поиска
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ============================================

// Делаем функции доступными глобально
window.filterByCategory = filterByCategory;
window.searchProducts = searchProducts;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.addToCart = addToCart;
window.showCart = showCart;
window.closeModal = closeModal;
window.showProductDetails = showProductDetails;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.toggleConstructor = toggleConstructor;
window.editStoreName = editStoreName;
window.editHero = editHero;
window.logoutAdmin = logoutAdmin;
