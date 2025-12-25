// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentPage = 1;
const productsPerPage = 12;

// ========== DOM ЭЛЕМЕНТЫ ==========
const dom = {
    productsGrid: document.getElementById('productsGrid'),
    productsCount: document.getElementById('productsCount'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    sortSelect: document.getElementById('sortSelect'),
    pagination: document.getElementById('pagination'),
    
    // Корзина
    cartToggle: document.getElementById('cartToggle'),
    cartModal: document.getElementById('cartModal'),
    closeCart: document.getElementById('closeCart'),
    cartItems: document.getElementById('cartItems'),
    cartTotalItems: document.getElementById('cartTotalItems'),
    cartTotalPrice: document.getElementById('cartTotalPrice'),
    cartFinalTotal: document.getElementById('cartFinalTotal'),
    clearCart: document.getElementById('clearCart'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    continueShopping: document.getElementById('continueShopping'),
    cartCount: document.querySelector('.cart-count'),
    cartTotal: document.querySelector('.cart-total'),
    
    // Вход
    loginBtn: document.getElementById('loginBtn'),
    loginModal: document.getElementById('loginModal'),
    closeLogin: document.getElementById('closeLogin'),
    loginTabs: document.querySelectorAll('.login-tab'),
    guestForm: document.getElementById('guestForm'),
    adminForm: document.getElementById('adminForm'),
    guestLoginBtn: document.getElementById('guestLoginBtn'),
    adminLoginBtn: document.getElementById('adminLoginBtn'),
    
    // Уведомления
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText')
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    await loadProducts();
    renderProducts();
    updateCartDisplay();
    setupEventListeners();
    showNotification('Магазин загружен! Добро пожаловать!', 'success');
}

// ========== ЗАГРУЗКА ТОВАРОВ ==========
async function loadProducts() {
    try {
        // Сначала пытаемся загрузить из localStorage (из админки)
        const savedProducts = JSON.parse(localStorage.getItem('shopProducts'));
        if (savedProducts && savedProducts.length > 0) {
            products = savedProducts;
            console.log('Товары загружены из localStorage:', products.length);
            return;
        }
        
        // Если нет в localStorage, загружаем демо-данные
        const response = await fetch('data/demo-products.json');
        if (!response.ok) throw new Error('Не удалось загрузить товары');
        
        products = await response.json();
        console.log('Товары загружены из demo-products.json:', products.length);
        
        // Сохраняем в localStorage для будущего использования
        localStorage.setItem('shopProducts', JSON.stringify(products));
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showNotification('Ошибка загрузки товаров', 'error');
        products = getFallbackProducts(); // Запасной вариант
    }
}

function getFallbackProducts() {
    // Резервные товары на случай ошибки
    return [
        {
            id: 1,
            name: "Стейк из говядины",
            category: "meat",
            price: 899,
            image: "https://postimg.cc/PNc7MYtS/steak.jpg",
            description: "Премиальный стейк рибай",
            weight: "500 г"
        },
        {
            id: 2,
            name: "Лосось свежий",
            category: "fish",
            price: 1299,
            image: "https://postimg.cc/PNc7MYtS/salmon.jpg",
            description: "Охлажденный норвежский лосось",
            weight: "1 кг"
        },
        {
            id: 3,
            name: "Сыр пармезан",
            category: "dairy",
            price: 499,
            image: "https://postimg.cc/PNc7MYtS/cheese.jpg",
            description: "Итальянский сыр пармезан",
            weight: "200 г"
        }
    ];
}

// ========== РЕНДЕРИНГ ТОВАРОВ ==========
function renderProducts(page = 1) {
    currentPage = page;
    let filteredProducts = filterProducts();
    filteredProducts = sortProducts(filteredProducts);
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Обновляем счетчик
    dom.productsCount.textContent = filteredProducts.length;
    
    // Рендерим товары
    if (pageProducts.length === 0) {
        dom.productsGrid.innerHTML = `
            <div class="empty-products">
                <i class="fas fa-search"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры поиска</p>
            </div>
        `;
    } else {
        dom.productsGrid.innerHTML = pageProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-category">${getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-price">
                        <div>
                            <span class="price">${formatPrice(product.price)} ₽</span>
                            ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₽</span>` : ''}
                            ${product.weight ? `<div class="product-weight">${product.weight}</div>` : ''}
                        </div>
                        <button class="btn-add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Рендерим пагинацию
    renderPagination(totalPages);
    
    // Добавляем обработчики для кнопок корзины
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            addToCart(productId);
        });
    });
}

function filterProducts() {
    const searchTerm = dom.searchInput.value.toLowerCase();
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category;
    
    return products.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !activeCategory || 
            activeCategory === 'all' || 
            product.category === activeCategory;
        
        return matchesSearch && matchesCategory;
    });
}

function sortProducts(productsList) {
    const sortValue = dom.sortSelect.value;
    
    switch(sortValue) {
        case 'price-asc':
            return [...productsList].sort((a, b) => a.price - b.price);
        case 'price-desc':
            return [...productsList].sort((a, b) => b.price - a.price);
        case 'name-asc':
            return [...productsList].sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return [...productsList].sort((a, b) => b.name.localeCompare(a.name));
        case 'popular':
            // Здесь можно добавить логику сортировки по популярности
            return productsList;
        default:
            return productsList;
    }
}

function renderPagination(totalPages) {
    if (totalPages <= 1) {
        dom.pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Кнопка "Назад"
    paginationHTML += `
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (
            (i === currentPage - 3 && currentPage > 4) || 
            (i === currentPage + 3 && currentPage < totalPages - 3)
        ) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }
    
    // Кнопка "Вперед"
    paginationHTML += `
        <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    dom.pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    renderProducts(page);
    window.scrollTo({ top: dom.productsGrid.offsetTop - 100, behavior: 'smooth' });
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
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart();
    updateCartDisplay();
    showNotification(`${product.name} добавлен в корзину!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Товар удален из корзины', 'info');
}

function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartDisplay();
    }
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
        cart = [];
        saveCart();
        updateCartDisplay();
        showNotification('Корзина очищена', 'info');
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
    // Обновляем счетчик в шапке
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    dom.cartCount.textContent = totalItems;
    dom.cartTotal.textContent = `${formatPrice(totalPrice)} ₽`;
    
    // Обновляем модальное окно корзины
    if (cart.length === 0) {
        dom.cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Ваша корзина пуста</p>
                <button class="btn btn-primary" id="continueShopping">Продолжить покупки</button>
            </div>
        `;
        
        // Добавляем обработчик для кнопки
        document.getElementById('continueShopping')?.addEventListener('click', () => {
            dom.cartModal.classList.remove('active');
        });
    } else {
        dom.cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)} ₽</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                               onchange="updateCartItemQuantity(${item.id}, parseInt(this.value))">
                        <button class="quantity-btn plus" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Обновляем итоги
    dom.cartTotalItems.textContent = `${totalItems} шт.`;
    dom.cartTotalPrice.textContent = `${formatPrice(totalPrice)} ₽`;
    dom.cartFinalTotal.textContent = `${formatPrice(totalPrice)} ₽`;
}

// ========== ФУНКЦИИ ВХОДА ==========
function setupLoginListeners() {
    // Переключение между вкладками
    dom.loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            
            // Обновляем активную вкладку
            dom.loginTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Показываем соответствующую форму
            dom.guestForm.style.display = tabType === 'guest' ? 'block' : 'none';
            dom.adminForm.style.display = tabType === 'admin' ? 'block' : 'none';
        });
    });
    
    // Гостевой вход
    dom.guestLoginBtn.addEventListener('click', handleGuestLogin);
    
    // Вход администратора
    dom.adminLoginBtn.addEventListener('click', handleAdminLogin);
}

function handleGuestLogin() {
    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    
    if (!name || !phone) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    currentUser = {
        type: 'guest',
        name: name,
        phone: phone,
        loggedInAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    dom.loginModal.classList.remove('active');
    showNotification(`Добро пожаловать, ${name}!`, 'success');
    
    // Обновляем кнопку входа
    dom.loginBtn.innerHTML = `<i class="fas fa-user-check"></i><span>${name}</span>`;
}

function handleAdminLogin() {
    const login = document.getElementById('adminLogin').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    // Проверяем учетные данные администратора
    const adminCredentials = JSON.parse(localStorage.getItem('adminSettings'))?.credentials || {
        login: 'admin',
        password: 'admin123'
    };
    
    if (login === adminCredentials.login && password === adminCredentials.password) {
        currentUser = {
            type: 'admin',
            login: login,
            loggedInAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        dom.loginModal.classList.remove('active');
        showNotification('Вход выполнен как администратор', 'success');
        
        // Перенаправляем в админку
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    } else {
        showNotification('Неверный логин или пароль', 'error');
    }
}

// ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста', 'error');
        return;
    }
    
    if (!currentUser) {
        showNotification('Пожалуйста, войдите в систему', 'warning');
        dom.loginModal.classList.add('active');
        return;
    }
    
    const order = {
        id: Date.now(),
        user: currentUser,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    // Сохраняем заказ
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Отправляем уведомление (в реальном приложении здесь был бы API-запрос)
    showNotification(`Заказ #${order.id} оформлен! Сумма: ${formatPrice(order.total)} ₽`, 'success');
    
    // Очищаем корзину
    cart = [];
    saveCart();
    updateCartDisplay();
    
    // Закрываем корзину
    dom.cartModal.classList.remove('active');
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function getCategoryName(category) {
    const categories = {
        'meat': 'Мясо и птица',
        'fish': 'Рыба и морепродукты',
        'dairy': 'Молочные продукты',
        'vegetables': 'Овощи и фрукты',
        'grocery': 'Бакалея',
        'all': 'Все товары'
    };
    return categories[category] || category;
}

function showNotification(message, type = 'info') {
    dom.notificationText.textContent = message;
    dom.notification.className = 'notification';
    dom.notification.classList.add('show', type);
    
    setTimeout(() => {
        dom.notification.classList.remove('show');
    }, 3000);
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
function setupEventListeners() {
    // Поиск
    dom.searchBtn.addEventListener('click', () => renderProducts(1));
    dom.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') renderProducts(1);
    });
    
    // Фильтры по категориям
    dom.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(1);
        });
    });
    
    // Сортировка
    dom.sortSelect.addEventListener('change', () => renderProducts(1));
    
    // Корзина
    dom.cartToggle.addEventListener('click', () => {
        dom.cartModal.classList.add('active');
    });
    
    dom.closeCart.addEventListener('click', () => {
        dom.cartModal.classList.remove('active');
    });
    
    dom.clearCart.addEventListener('click', clearCart);
    dom.checkoutBtn.addEventListener('click', checkout);
    
    // Вход
    dom.loginBtn.addEventListener('click', () => {
        dom.loginModal.classList.add('active');
    });
    
    dom.closeLogin.addEventListener('click', () => {
        dom.loginModal.classList.remove('active');
    });
    
    setupLoginListeners();
    
    // Закрытие модальных окон по клику вне области
    window.addEventListener('click', (e) => {
        if (e.target === dom.cartModal) {
            dom.cartModal.classList.remove('active');
        }
        if (e.target === dom.loginModal) {
            dom.loginModal.classList.remove('active');
        }
    });
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ HTML ==========
// Делаем функции доступными глобально для обработчиков в HTML
window.changePage = changePage;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
