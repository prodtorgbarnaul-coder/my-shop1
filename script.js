// ============================================
// ОСНОВНОЙ СКРИПТ ИНТЕРНЕТ-МАГАЗИНА
// ============================================

// Глобальные переменные
let shopProducts = [];
let shopCategories = [];
let cart = [];
let currentCategory = null;
let currentPage = 1;
let productsPerPage = 12;

// Категории по умолчанию
const defaultCategories = [
    { name: "Бытовая химия", code: "BH", icon: "🧴", color1: "#667eea", color2: "#764ba2" },
    { name: "Постельное белье", code: "PB", icon: "🛏️", color1: "#f093fb", color2: "#f5576c" },
    { name: "Рыба и морепродукты", code: "RB", icon: "🐟", color1: "#4facfe", color2: "#00f2fe" },
    { name: "Мясо и птица", code: "MT", icon: "🍗", color1: "#43e97b", color2: "#38f9d7" },
    { name: "Кондитерские изделия", code: "KD", icon: "🍰", color1: "#fa709a", color2: "#fee140" },
    { name: "Молочные продукты", code: "ML", icon: "🥛", color1: "#30cfd0", color2: "#330867" },
    { name: "Мангалы и грили", code: "MG", icon: "🔥", color1: "#ffecd2", color2: "#fcb69f" }
];

// Инициализация при загрузке
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
        shopProducts = JSON.parse(savedProducts);
        console.log(`📦 Загружено ${shopProducts.length} товаров`);
    } else {
        // Загружаем демо-товары
        loadDemoProducts();
    }
    
    // Загружаем категории
    const savedCategories = localStorage.getItem('shopCategories');
    if (savedCategories) {
        shopCategories = JSON.parse(savedCategories);
    } else {
        shopCategories = [...defaultCategories];
        saveCategories();
    }
    console.log(`🏷️ Загружено ${shopCategories.length} категорий`);
    
    // Загружаем корзину
    const savedCart = localStorage.getItem('shopCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log(`🛒 Загружено ${cart.length} товаров в корзине`);
    }
    
    // Загружаем настройки
    loadSettings();
}

// Загрузка демо-товаров
function loadDemoProducts() {
    shopProducts = [
        {
            id: 1,
            название: "FAIRY банан - 5 литров",
            категория: "Бытовая химия",
            цена_продажи: 800,
            количество: 50,
            статус: "in_stock",
            описание: "Концентрированное средство для мытья посуды",
            изображение: "https://via.placeholder.com/300x200/667eea/ffffff?text=FAIRY"
        },
        {
            id: 2,
            название: "Постельное белье \"Люкс\"",
            категория: "Постельное белье",
            цена_продажи: 2500,
            количество: 20,
            статус: "in_stock",
            описание: "Хлопковое постельное белье премиум-класса",
            изображение: "https://via.placeholder.com/300x200/f093fb/ffffff?text=Белье"
        },
        {
            id: 3,
            название: "Лосось свежий",
            категория: "Рыба и морепродукты",
            цена_продажи: 1500,
            количество: 15,
            статус: "in_stock",
            описание: "Охлажденный норвежский лосось",
            изображение: "https://via.placeholder.com/300x200/4facfe/ffffff?text=Лосось"
        }
    ];
    
    saveProducts();
    console.log('📦 Загружены демо-товары');
}

// Инициализация интерфейса
function initInterface() {
    // Показываем приветствие для нового пользователя
    showWelcomeMessage();
    
    // Обновляем категории
    updateCategories();
    
    // Обновляем товары
    updateProducts();
    
    // Обновляем корзину
    updateCartCount();
    
    // Настраиваем обработчики
    setupEventListeners();
    
    // Проверяем и регистрируем гостя
    setTimeout(() => {
        checkAndRegisterGuest();
    }, 1000);
}

// Проверка и регистрация гостя
function checkAndRegisterGuest() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.id && currentUser.role === 'guest') {
        // Гость уже зарегистрирован
        updateUserInfo(currentUser);
        return;
    }
    
    // Показываем форму регистрации
    showGuestRegistrationForm();
}

// Показать форму регистрации гостя
function showGuestRegistrationForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title">👋 Регистрация покупателя</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px; color: var(--gray);">
                    Пожалуйста, введите ваши данные для оформления заказов
                </div>
                
                <div class="form-group">
                    <label>Ваше имя *</label>
                    <input type="text" id="guestNameInput" class="form-control" placeholder="Иван Иванов" required>
                </div>
                
                <div class="form-group">
                    <label>Ваш телефон *</label>
                    <input type="tel" id="guestPhoneInput" class="form-control" placeholder="+7 (999) 123-45-67" required>
                </div>
                
                <div class="form-group">
                    <label>Пароль (необязательно)</label>
                    <input type="password" id="guestPasswordInput" class="form-control" placeholder="Оставьте пустым для автоматической генерации">
                    <small style="color: var(--gray); font-size: 12px;">Пароль нужен для входа в будущем</small>
                </div>
                
                <div id="guestRegistrationError" style="color: var(--secondary); margin: 10px 0; display: none;"></div>
                
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()" style="flex: 1;">
                        <i class="fas fa-times"></i> Позже
                    </button>
                    <button class="btn btn-primary" onclick="registerGuestSubmit()" style="flex: 2;">
                        <i class="fas fa-check"></i> Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Обработка регистрации гостя
function registerGuestSubmit() {
    const name = document.getElementById('guestNameInput').value.trim();
    const phone = document.getElementById('guestPhoneInput').value.trim();
    const password = document.getElementById('guestPasswordInput').value;
    const errorDiv = document.getElementById('guestRegistrationError');
    
    // Валидация
    if (!name || !phone) {
        errorDiv.textContent = '❌ Заполните имя и телефон';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Простой валидатор телефона
    const phoneRegex = /^[\+]?[7-8]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        errorDiv.textContent = '❌ Введите корректный номер телефона';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Получаем существующих гостей
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    
    // Проверяем, существует ли уже гость с таким телефоном
    const existingGuest = guests.find(g => g.phone === phone);
    
    if (existingGuest) {
        // Обновляем данные существующего гостя
        existingGuest.name = name;
        existingGuest.lastLogin = new Date().toISOString();
        existingGuest.loginCount = (existingGuest.loginCount || 0) + 1;
        
        if (password) {
            existingGuest.password = password;
        }
        
        // Сохраняем
        localStorage.setItem('shopGuests', JSON.stringify(guests));
        
        // Автоматически логиним гостя
        loginGuest(existingGuest);
    } else {
        // Создаем нового гостя
        const newGuest = {
            id: Date.now(),
            name: name.trim(),
            phone: phone.trim(),
            password: password || generateGuestPassword(),
            role: 'guest',
            registered: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            ordersCount: 0,
            totalSpent: 0
        };
        
        guests.push(newGuest);
        localStorage.setItem('shopGuests', JSON.stringify(guests));
        
        // Автоматически логиним гостя
        loginGuest(newGuest);
    }
}

// Генерация пароля для гостя
function generateGuestPassword() {
    return 'guest' + Math.floor(1000 + Math.random() * 9000);
}

// Логин гостя
function loginGuest(guest) {
    localStorage.setItem('currentUser', JSON.stringify({
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        role: 'guest',
        loginTime: new Date().toISOString()
    }));
    
    // Обновляем информацию о пользователе
    updateUserInfo({
        name: guest.name,
        role: 'Покупатель'
    });
    
    // Закрываем модальное окно
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
    
    // Показываем уведомление
    showNotification(`✅ Добро пожаловать, ${guest.name}!`, 'success');
}

// Обновление информации о пользователе в хедере
function updateUserInfo(user) {
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    const userAvatar = document.querySelector('.user-avatar');
    const profileBtn = document.getElementById('profileBtn');
    
    if (userName) userName.textContent = user.name || 'Гость';
    if (userRole) userRole.textContent = user.role === 'guest' ? 'Покупатель' : (user.role || 'Покупатель');
    if (userAvatar) {
        userAvatar.textContent = (user.name || 'Г').charAt(0).toUpperCase();
        userAvatar.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
    }
    
    // Показываем кнопку профиля, если пользователь зарегистрирован
    if (profileBtn) {
        profileBtn.style.display = user.name && user.name !== 'Гость' ? 'flex' : 'none';
    }
}

// ============================================
// КОРЗИНА И ЗАКАЗЫ
// ============================================

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('❌ Корзина пуста', 'error');
        return;
    }
    
    // Проверяем авторизацию гостя
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id || currentUser.role !== 'guest') {
        showNotification('⚠️ Сначала зарегистрируйтесь', 'warning');
        showGuestRegistrationForm();
        return;
    }
    
    // Получаем гостя из базы
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    const guest = guests.find(g => g.id === currentUser.id);
    
    if (!guest) {
        showNotification('❌ Ошибка данных пользователя', 'error');
        return;
    }
    
    // Вычисляем общую сумму
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Получаем заказы
    const savedOrders = localStorage.getItem('shopOrders');
    const ordersDatabase = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Создаем заказ
    const order = {
        id: 'ORD' + Date.now().toString().slice(-8),
        guestId: guest.id,
        guestName: guest.name,
        guestPhone: guest.phone,
        items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        })),
        totalAmount: totalAmount,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethod: 'cash',
        deliveryAddress: '',
        notes: ''
    };
    
    // Добавляем заказ в базу
    ordersDatabase.push(order);
    
    // Обновляем статистику гостя
    guest.ordersCount = (guest.ordersCount || 0) + 1;
    guest.totalSpent = (guest.totalSpent || 0) + totalAmount;
    guest.lastOrder = new Date().toISOString();
    
    // Сохраняем данные
    localStorage.setItem('shopOrders', JSON.stringify(ordersDatabase));
    localStorage.setItem('shopGuests', JSON.stringify(guests));
    
    // Очищаем корзину
    cart = [];
    saveCart();
    updateCartModal();
    updateCartCount();
    
    // Закрываем модальное окно корзины
    closeModal('cartModal');
    
    // Показываем успешное сообщение
    showNotification(`✅ Заказ №${order.id} создан успешно!`, 'success');
    
    // Показываем детали заказа
    setTimeout(() => {
        showOrderConfirmation(order);
    }, 1000);
}

// Показать подтверждение заказа
function showOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">🎉 Заказ оформлен!</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--accent); margin-bottom: 15px; display: block;"></i>
                    <h3 style="margin-bottom: 10px;">Спасибо за заказ!</h3>
                    <p style="color: var(--gray);">Мы свяжемся с вами для уточнения деталей</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 15px;">Детали заказа:</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div><strong>Номер заказа:</strong></div>
                        <div>${order.id}</div>
                        
                        <div><strong>Имя:</strong></div>
                        <div>${order.guestName}</div>
                        
                        <div><strong>Телефон:</strong></div>
                        <div>${order.guestPhone}</div>
                        
                        <div><strong>Дата:</strong></div>
                        <div>${new Date(order.createdAt).toLocaleDateString('ru-RU')}</div>
                        
                        <div><strong>Статус:</strong></div>
                        <div><span class="badge bg-warning">Новый</span></div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--border); padding-top: 15px;">
                        <h4 style="margin-bottom: 10px;">Состав заказа:</h4>
                        ${order.items.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                                <div>${item.name} × ${item.quantity}</div>
                                <div>${formatPrice(item.total)}</div>
                            </div>
                        `).join('')}
                        
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 1.1rem;">
                            <div>Итого:</div>
                            <div style="color: var(--primary);">${formatPrice(order.totalAmount)}</div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; color: var(--gray); font-size: 14px;">
                    <p>📞 Мы свяжемся с вами по телефону ${order.guestPhone} в ближайшее время</p>
                    <p>🛒 <a href="index.html" style="color: var(--primary);">Продолжить покупки</a></p>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()" style="flex: 1;">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                    <button class="btn btn-primary" onclick="printOrder('${order.id}')" style="flex: 1;">
                        <i class="fas fa-print"></i> Распечатать
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ============================================
// ОСТАЛЬНЫЕ ФУНКЦИИ (корзина, товары, категории)
// ============================================

// Добавить товар в корзину
function addToCart(productId) {
    const product = shopProducts.find(p => p.id == productId);
    
    if (!product) {
        showNotification('❌ Товар не найден', 'error');
        return;
    }
    
    // Проверяем наличие
    if ((product.количество || 0) <= 0) {
        showNotification('❌ Товара нет в наличии', 'error');
        return;
    }
    
    // Ищем товар в корзине
    const cartItem = cart.find(item => item.id == productId);
    
    if (cartItem) {
        // Увеличиваем количество
        cartItem.quantity++;
    } else {
        // Добавляем новый товар
        cart.push({
            id: product.id,
            name: product.название,
            price: product.цена_продажи || 0,
            quantity: 1,
            image: product.изображение || ''
        });
    }
    
    // Сохраняем корзину
    saveCart();
    
    // Обновляем счетчик
    updateCartCount();
    
    // Показываем уведомление
    showNotification(`✅ "${product.название}" добавлен в корзину`, 'success');
}

// Показать корзину
function showCart() {
    const modal = document.getElementById('cartModal');
    if (!modal) {
        createCartModal();
    }
    
    modal.style.display = 'block';
    updateCartModal();
}

// Обновление модального окна корзины
function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <p>Ваша корзина пуста</p>
            </div>
        `;
        cartTotal.textContent = '0 ₽';
        return;
    }
    
    // Отображаем товары
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'https://via.placeholder.com/60x60/e9ecef/6c757d?text=Товар'}" 
                 alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button class="btn-icon btn-delete" onclick="removeFromCart(${item.id})" style="margin-left: 10px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Вычисляем общую сумму
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(total);
}

// Обновить количество товара в корзине
function updateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id == productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        updateCartModal();
    }
}

// Удалить товар из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    updateCartCount();
    updateCartModal();
    showNotification('🗑️ Товар удален из корзины', 'info');
}

// Сохранить корзину
function saveCart() {
    localStorage.setItem('shopCart', JSON.stringify(cart));
}

// Обновить счетчик корзины
function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    countElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Обновление категорий
function updateCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = shopCategories.map(category => {
        const productCount = shopProducts.filter(p => p.категория === category.name).length;
        
        return `
            <div class="category-card" 
                 data-category="${category.name}"
                 onclick="filterByCategory('${category.name}')">
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
                <small>${productCount} товаров</small>
            </div>
        `;
    }).join('');
}

// Обновление товаров
function updateProducts() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    let filteredProducts = shopProducts;
    
    // Фильтрация по категории
    if (currentCategory) {
        filteredProducts = filteredProducts.filter(p => p.категория === currentCategory);
    }
    
    // Пагинация
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (paginatedProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--gray);">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <h3 style="margin-bottom: 10px;">Товары не найдены</h3>
                <p>Попробуйте выбрать другую категорию или изменить фильтры</p>
                <button class="btn btn-outline" onclick="clearFilters()" style="margin-top: 20px;">
                    <i class="fas fa-times"></i> Сбросить фильтры
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = paginatedProducts.map(product => {
        const statusClass = getStatusClass(product.статус);
        const statusText = getStatusText(product.статус);
        
        return `
            <div class="product-card">
                ${(product.количество || 0) <= 0 ? '<div class="product-badge">Нет в наличии</div>' : ''}
                
                <img src="${product.изображение || 'https://via.placeholder.com/300x200/e9ecef/6c757d?text=Товар'}" 
                     alt="${product.название}" 
                     class="product-image"
                     onclick="showProductDetails(${product.id})">
                
                <div class="product-info">
                    <div class="product-category">${product.категория || 'Без категории'}</div>
                    <h3 class="product-name" onclick="showProductDetails(${product.id})">
                        ${product.название || 'Без названия'}
                    </h3>
                    <p class="product-description-short">${product.описание || 'Нет описания'}</p>
                    
                    <div class="product-price">
                        <div class="current-price">${formatPrice(product.цена_продажи || 0)}</div>
                        <div>
                            ${(product.количество || 0) > 0 ? 
                                `<span class="product-status status-in-stock">В наличии</span>` : 
                                `<span class="product-status status-out-of-stock">Нет в наличии</span>`
                            }
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart" 
                                onclick="addToCart(${product.id})"
                                ${(product.количество || 0) <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            ${(product.количество || 0) <= 0 ? 'Нет в наличии' : 'В корзину'}
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

// Фильтрация по категории
function filterByCategory(category) {
    currentCategory = currentCategory === category ? null : category;
    currentPage = 1;
    updateProducts();
    updateActiveCategoryButton();
}

// Очистка фильтров
function clearFilters() {
    currentCategory = null;
    currentPage = 1;
    updateProducts();
    updateActiveCategoryButton();
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price).replace('RUB', '₽');
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Проверка статуса админа
function checkAdminStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        document.getElementById('adminConstructor').style.display = 'block';
    }
}

// Создание модального окна корзины
function createCartModal() {
    const modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">🛒 Корзина</h3>
                <span class="close" onclick="closeModal('cartModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div id="cartItems" style="max-height: 400px; overflow-y: auto;"></div>
                <div class="cart-total">
                    <span>Итого:</span>
                    <span id="cartTotal">0 ₽</span>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="closeModal('cartModal')" style="flex: 1;">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                    <button class="btn btn-primary" onclick="checkout()" style="flex: 2;">
                        <i class="fas fa-check"></i> Оформить заказ
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Закрыть модальное окно
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Показать приветственное сообщение
function showWelcomeMessage() {
    const firstVisit = !localStorage.getItem('firstVisitShown');
    if (firstVisit) {
        setTimeout(() => {
            showNotification('🎉 Добро пожаловать в магазин "ДЛЯ СВОИХ"!', 'info');
            localStorage.setItem('firstVisitShown', 'true');
        }, 1000);
    }
}

// Загрузка настроек
function loadSettings() {
    // Можно добавить загрузку пользовательских настроек
}

// Сохранение товаров
function saveProducts() {
    localStorage.setItem('shopProducts', JSON.stringify(shopProducts));
}

// Сохранение категорий
function saveCategories() {
    localStorage.setItem('shopCategories', JSON.stringify(shopCategories));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            performSearch(e.target.value);
        });
    }
    
    // Фильтры
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function(e) {
            sortProducts(e.target.value);
        });
    }
}

// Поиск товаров
function performSearch(query) {
    // Реализация поиска
    console.log('Поиск:', query);
}

// Сортировка товаров
function sortProducts(sortBy) {
    // Реализация сортировки
    console.log('Сортировка:', sortBy);
}

// Получить класс статуса
function getStatusClass(status) {
    switch (status) {
        case 'in_stock': return 'status-in-stock';
        case 'out_of_stock': return 'status-out-of-stock';
        default: return 'status-pre-order';
    }
}

// Получить текст статуса
function getStatusText(status) {
    switch (status) {
        case 'in_stock': return 'В наличии';
        case 'out_of_stock': return 'Нет в наличии';
        default: return 'Под заказ';
    }
}

// Обновить активную кнопку категории
function updateActiveCategoryButton() {
    // Реализация обновления активной категории
}

// Показать детали товара
function showProductDetails(productId) {
    const product = shopProducts.find(p => p.id == productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3 class="modal-title">${product.название}</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px;">
                    <div>
                        <img src="${product.изображение || 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Товар'}" 
                             alt="${product.название}" 
                             style="width: 100%; border-radius: 10px;">
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px; color: var(--dark);">${formatPrice(product.цена_продажи || 0)}</h4>
                        <div style="margin-bottom: 15px;">
                            <span class="badge ${getStatusClass(product.статус)}">${getStatusText(product.статус)}</span>
                            <span style="margin-left: 10px; color: var(--gray);">${product.категория}</span>
                        </div>
                        <p style="color: var(--gray); line-height: 1.6;">${product.описание || 'Нет описания'}</p>
                        
                        <div style="margin-top: 20px;">
                            <button class="add-to-cart" 
                                    onclick="addToCart(${product.id}); this.parentElement.parentElement.parentElement.parentElement.remove()"
                                    style="width: 100%; padding: 15px; font-size: 1.1rem;"
                                    ${(product.количество || 0) <= 0 ? 'disabled' : ''}>
                                <i class="fas fa-cart-plus"></i>
                                ${(product.количество || 0) <= 0 ? 'Нет в наличии' : 'Добавить в корзину'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Печать заказа
function printOrder(orderId) {
    const savedOrders = localStorage.getItem('shopOrders');
    const ordersDatabase = savedOrders ? JSON.parse(savedOrders) : [];
    const order = ordersDatabase.find(o => o.id === orderId);
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Заказ ${order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 1.2em; }
                .footer { margin-top: 30px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Магазин "ДЛЯ СВОИХ"</h1>
                <h2>Заказ №${order.id}</h2>
                <p>Дата: ${new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
            
            <div class="info">
                <p><strong>Клиент:</strong> ${order.guestName}</p>
                <p><strong>Телефон:</strong> ${order.guestPhone}</p>
                <p><strong>Статус:</strong> Новый</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>Цена</th>
                        <th>Кол-во</th>
                        <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.price} ₽</td>
                            <td>${item.quantity}</td>
                            <td>${item.total} ₽</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">
                Итого к оплате: ${order.totalAmount} ₽
            </div>
            
            <div class="footer">
                <p>Спасибо за заказ!</p>
                <p>Телефон: +7 (923) 753-36-06</p>
                <p>Email: prodtorg.barnaul@gmail.com</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Делаем функции глобально доступными
window.addToCart = addToCart;
window.showCart = showCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.filterByCategory = filterByCategory;
window.clearFilters = clearFilters;
window.showProductDetails = showProductDetails;
window.closeModal = closeModal;
window.checkout = checkout;
window.printOrder = printOrder;
window.registerGuestSubmit = registerGuestSubmit;
