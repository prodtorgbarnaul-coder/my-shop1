// ============================================
// ОСНОВНОЙ СКРИПТ ИНТЕРНЕТ-МАГАЗИНА
// ============================================

// Основные переменные
let products = [];
let categories = [];
let cart = [];
let currentUser = null;
let currentCategory = 'all';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Инициализация магазина...');
    
    // Загружаем данные
    loadData();
    
    // Проверяем авторизацию
    checkAuth();
    
    // Показываем товары
    loadProducts();
    loadCategories();
    
    // Обновляем корзину
    updateCart();
    
    console.log('✅ Магазин готов!');
});

// Загрузка данных
function loadData() {
    // Загружаем товары из localStorage или используем демо-данные
    const savedProducts = localStorage.getItem('shopProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Демо-товары
        products = [
            {
                id: 1,
                название: "FAIRY банан - 5 литров",
                категория: "Бытовая химия",
                цена_продажи: 800,
                количество: 50,
                статус: "in_stock",
                описание: "Концентрированное средство для мытья посуды. Экономичный расход, приятный аромат.",
                изображение: "",
                код_товара: "PROD001"
            },
            {
                id: 2,
                название: "Постельное белье \"Люкс\"",
                категория: "Постельное белье",
                цена_продажи: 2500,
                количество: 20,
                статус: "in_stock",
                описание: "Хлопковое постельное белье премиум-класса. Комплект 1.5 спальный.",
                изображение: "",
                код_товара: "PROD002"
            },
            {
                id: 3,
                название: "Лосось свежий",
                категория: "Рыба и морепродукты",
                цена_продажи: 1500,
                количество: 15,
                статус: "in_stock",
                описание: "Охлажденный норвежский лосось. Филе без костей.",
                изображение: "",
                код_товара: "PROD003"
            },
            {
                id: 4,
                название: "Смартфон Xiaomi",
                категория: "Электроника",
                цена_продажи: 19999,
                количество: 8,
                статус: "in_stock",
                описание: "Смартфон с отличной камерой и быстрым процессором.",
                изображение: "",
                код_товара: "PROD004"
            },
            {
                id: 5,
                название: "Куртка зимняя",
                категория: "Одежда",
                цена_продажи: 3500,
                количество: 0,
                статус: "out_of_stock",
                описание: "Теплая куртка для зимы. Водоотталкивающая ткань.",
                изображение: "",
                код_товара: "PROD005"
            }
        ];
        localStorage.setItem('shopProducts', JSON.stringify(products));
    }
    
    // Загружаем категории
    const savedCategories = localStorage.getItem('shopCategories');
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        // Демо-категории
        categories = [
            {
                name: "Бытовая химия",
                code: "CHEM",
                icon: "🧴",
                color1: "#667eea",
                color2: "#764ba2"
            },
            {
                name: "Постельное белье",
                code: "BED",
                icon: "🛏️",
                color1: "#f093fb",
                color2: "#f5576c"
            },
            {
                name: "Рыба и морепродукты",
                code: "FISH",
                icon: "🐟",
                color1: "#4facfe",
                color2: "#00f2fe"
            },
            {
                name: "Электроника",
                code: "ELECTRO",
                icon: "📱",
                color1: "#43e97b",
                color2: "#38f9d7"
            },
            {
                name: "Одежда",
                code: "CLOTHES",
                icon: "👕",
                color1: "#fa709a",
                color2: "#fee140"
            }
        ];
        localStorage.setItem('shopCategories', JSON.stringify(categories));
    }
    
    // Загружаем корзину
    const savedCart = localStorage.getItem('shopCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Загрузка товаров
function loadProducts(filter = 'all') {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    let filteredProducts = products;
    
    if (filter !== 'all') {
        filteredProducts = products.filter(product => 
            product.категория.toLowerCase().includes(filter.toLowerCase()) ||
            product.название.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить критерии поиска</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
        const category = categories.find(c => c.name === product.категория) || {};
        const statusClass = product.количество > 0 ? 'product-stock' : 'product-stock out';
        const statusText = product.количество > 0 ? `В наличии: ${product.количество} шт.` : 'Нет в наличии';
        const badge = product.количество <= 5 && product.количество > 0 ? '<div class="product-badge">Мало</div>' : '';
        
        return `
            <div class="product-card">
                ${badge}
                <div class="product-image">
                    ${product.изображение ? 
                        `<img src="${product.изображение}" alt="${product.название}">` : 
                        `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${category.color1 || '#667eea'}, ${category.color2 || '#764ba2'}); color: white; font-size: 3rem;">
                            ${category.icon || '📦'}
                        </div>`
                    }
                </div>
                <div class="product-info">
                    <div class="product-category">${product.категория || 'Без категории'}</div>
                    <h3 class="product-title">${product.название}</h3>
                    <p class="product-description">${product.описание || 'Описание товара'}</p>
                    <div class="product-footer">
                        <div>
                            <div class="product-price">${formatPrice(product.цена_продажи)}</div>
                            <div class="${statusClass}">${statusText}</div>
                        </div>
                        <div class="product-actions">
                            ${product.количество > 0 ? 
                                `<button class="btn btn-primary" onclick="addToCart(${product.id})">
                                    <i class="fas fa-cart-plus"></i> В корзину
                                </button>` : 
                                `<button class="btn btn-secondary" disabled>
                                    <i class="fas fa-times"></i> Нет в наличии
                                </button>`
                            }
                            <button class="btn-icon" onclick="viewProduct(${product.id})" title="Подробнее">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Загрузка категорий
function loadCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(category => {
        const productCount = products.filter(p => p.категория === category.name).length;
        
        return `
            <div class="category-card" onclick="showCategory('${category.name}')">
                <div class="category-icon">${category.icon}</div>
                <h3 class="category-name">${category.name}</h3>
                <div class="category-count">${productCount} товаров</div>
            </div>
        `;
    }).join('');
}

// Показать категорию
function showCategory(category) {
    currentCategory = category;
    
    // Обновляем активную вкладку
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Загружаем товары категории
    loadProducts(category);
}

// Поиск товаров
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm.length < 2) {
        loadProducts(currentCategory);
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.название.toLowerCase().includes(searchTerm) ||
        product.описание.toLowerCase().includes(searchTerm) ||
        product.категория.toLowerCase().includes(searchTerm)
    );
    
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>По запросу "${searchTerm}" ничего не найдено</h3>
                <p>Попробуйте изменить поисковый запрос</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
        const category = categories.find(c => c.name === product.категория) || {};
        const statusClass = product.количество > 0 ? 'product-stock' : 'product-stock out';
        const statusText = product.количество > 0 ? `В наличии: ${product.количество} шт.` : 'Нет в наличии';
        
        return `
            <div class="product-card">
                <div class="product-image">
                    ${product.изображение ? 
                        `<img src="${product.изображение}" alt="${product.название}">` : 
                        `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${category.color1 || '#667eea'}, ${category.color2 || '#764ba2'}); color: white; font-size: 3rem;">
                            ${category.icon || '📦'}
                        </div>`
                    }
                </div>
                <div class="product-info">
                    <div class="product-category">${product.категория || 'Без категории'}</div>
                    <h3 class="product-title">${product.название}</h3>
                    <p class="product-description">${product.описание || 'Описание товара'}</p>
                    <div class="product-footer">
                        <div>
                            <div class="product-price">${formatPrice(product.цена_продажи)}</div>
                            <div class="${statusClass}">${statusText}</div>
                        </div>
                        <div class="product-actions">
                            ${product.количество > 0 ? 
                                `<button class="btn btn-primary" onclick="addToCart(${product.id})">
                                    <i class="fas fa-cart-plus"></i> В корзину
                                </button>` : 
                                `<button class="btn btn-secondary" disabled>
                                    <i class="fas fa-times"></i> Нет в наличии
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
});

// ============================================
// КОРЗИНА
// ============================================

// Показать корзину
function showCart() {
    document.getElementById('cartModal').style.display = 'block';
    updateCartDisplay();
}

// Закрыть корзину
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

// Добавить в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Проверяем наличие
    if (product.количество <= 0) {
        showNotification('❌ Товара нет в наличии', 'error');
        return;
    }
    
    // Проверяем, есть ли уже в корзине
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Проверяем, не превышаем ли остаток
        if (existingItem.quantity >= product.количество) {
            showNotification('❌ Нельзя добавить больше, чем есть в наличии', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.название,
            price: product.цена_продажи,
            quantity: 1,
            category: product.категория,
            maxQuantity: product.количество
        });
    }
    
    // Сохраняем корзину
    localStorage.setItem('shopCart', JSON.stringify(cart));
    
    // Обновляем отображение
    updateCart();
    updateCartDisplay();
    
    showNotification(`✅ "${product.название}" добавлен в корзину`, 'success');
}

// Удалить из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('shopCart', JSON.stringify(cart));
    updateCart();
    updateCartDisplay();
    
    showNotification('🗑️ Товар удален из корзины', 'info');
}

// Изменить количество
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > product.количество) {
        showNotification(`❌ Максимальное количество: ${product.количество} шт.`, 'error');
        return;
    }
    
    item.quantity = newQuantity;
    localStorage.setItem('shopCart', JSON.stringify(cart));
    updateCart();
    updateCartDisplay();
}

// Обновить корзину
function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('cartCount').textContent = totalItems;
    
    return { totalItems, totalPrice };
}

// Обновить отображение корзины
function updateCartDisplay() {
    const container = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из каталога</p>
            </div>
        `;
        cartTotal.textContent = '0 ₽';
        return;
    }
    
    const { totalPrice } = updateCart();
    
    container.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const category = categories.find(c => c.name === product?.категория);
        
        return `
            <div class="cart-item">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${category?.color1 || '#667eea'}, ${category?.color2 || '#764ba2'}); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                    ${category?.icon || '📦'}
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.maxQuantity}" onchange="updateQuantity(${item.id}, parseInt(this.value))">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="btn-icon" onclick="removeFromCart(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = formatPrice(totalPrice);
}

// Оформить заказ
function checkout() {
    if (cart.length === 0) {
        showNotification('❌ Корзина пуста', 'error');
        return;
    }
    
    // Проверяем авторизацию
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.id) {
        // Показываем форму регистрации
        showModal('guestModal');
        return;
    }
    
    // Создаем заказ
    createOrder();
}

// ============================================
// АВТОРИЗАЦИЯ ГОСТЕЙ
// ============================================

// Проверить авторизацию
function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.id) {
        // Пользователь авторизован
        document.getElementById('profileBtn').style.display = 'flex';
        
        // Обновляем информацию о пользователе
        updateUserInfo(currentUser);
    } else {
        // Гость
        document.getElementById('profileBtn').style.display = 'none';
    }
}

// Обновить информацию о пользователе
function updateUserInfo(user) {
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${user.name || 'Профиль'}</span>
        `;
    }
}

// Регистрация гостя
function registerGuest() {
    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const password = document.getElementById('guestPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    // Валидация
    if (!name || !phone) {
        errorDiv.textContent = '❌ Заполните имя и телефон';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Проверяем формат телефона
    if (!/^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/.test(phone)) {
        errorDiv.textContent = '❌ Введите телефон в формате +7 (999) 123-45-67';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Загружаем существующих гостей
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    
    // Проверяем, существует ли уже такой гость
    let guest = guests.find(g => g.phone === phone);
    
    if (!guest) {
        // Создаем нового гостя
        guest = {
            id: Date.now(),
            name: name,
            phone: phone,
            password: password || generatePassword(),
            registered: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            ordersCount: 0,
            totalSpent: 0
        };
        
        guests.push(guest);
        localStorage.setItem('shopGuests', JSON.stringify(guests));
    } else {
        // Обновляем существующего гостя
        guest.name = name;
        if (password) guest.password = password;
        guest.lastLogin = new Date().toISOString();
        
        // Сохраняем изменения
        localStorage.setItem('shopGuests', JSON.stringify(guests));
    }
    
    // Авторизуем гостя
    currentUser = {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        role: 'guest'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Обновляем интерфейс
    checkAuth();
    
    // Закрываем модальное окно
    closeModal('guestModal');
    
    // Показываем уведомление
    showNotification(`✅ Добро пожаловать, ${name}!`, 'success');
    
    // Создаем заказ
    setTimeout(() => {
        createOrder();
    }, 1000);
}

// Генерация пароля
function generatePassword() {
    return Math.random().toString(36).slice(-8);
}

// Создать заказ
function createOrder() {
    if (cart.length === 0) {
        showNotification('❌ Корзина пуста', 'error');
        return;
    }
    
    if (!currentUser.id) {
        showNotification('❌ Необходима регистрация', 'error');
        showModal('guestModal');
        return;
    }
    
    // Рассчитываем итоговую сумму
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Создаем заказ
    const order = {
        id: 'ORD' + Date.now().toString().slice(-8),
        guestId: currentUser.id,
        guestName: currentUser.name,
        guestPhone: currentUser.phone,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        })),
        totalAmount: totalAmount,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Загружаем существующие заказы
    const savedOrders = localStorage.getItem('shopOrders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Добавляем новый заказ
    orders.push(order);
    localStorage.setItem('shopOrders', JSON.stringify(orders));
    
    // Обновляем статистику гостя
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    const guest = guests.find(g => g.id === currentUser.id);
    
    if (guest) {
        guest.ordersCount = (guest.ordersCount || 0) + 1;
        guest.totalSpent = (guest.totalSpent || 0) + totalAmount;
        localStorage.setItem('shopGuests', JSON.stringify(guests));
    }
    
    // Уменьшаем количество товаров на складе
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.количество -= cartItem.quantity;
            if (product.количество < 0) product.количество = 0;
        }
    });
    
    localStorage.setItem('shopProducts', JSON.stringify(products));
    
    // Очищаем корзину
    cart = [];
    localStorage.removeItem('shopCart');
    updateCart();
    updateCartDisplay();
    
    // Закрываем корзину
    closeCart();
    
    // Показываем уведомление
    showNotification(`✅ Заказ #${order.id} создан! Сумма: ${formatPrice(totalAmount)}`, 'success');
    
    // Перезагружаем товары (обновляем остатки)
    loadProducts(currentCategory);
    
    // Показываем детали заказа
    showOrderSuccess(order);
}

// Показать успешное оформление заказа
function showOrderSuccess(order) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fas fa-check-circle" style="color: var(--success);"></i> Заказ оформлен!</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 4rem;">🎉</div>
                    <h2>Спасибо за заказ!</h2>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4>Детали заказа:</h4>
                    <p><strong>Номер заказа:</strong> ${order.id}</p>
                    <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Статус:</strong> <span class="badge bg-warning">Новый</span></p>
                    <p><strong>Сумма:</strong> <span style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">${formatPrice(order.totalAmount)}</span></p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4>Товары в заказе:</h4>
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
                            <div>${item.name} × ${item.quantity}</div>
                            <div>${formatPrice(item.total)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 20px;">
                    <i class="fas fa-info-circle"></i> С вами свяжется менеджер для подтверждения заказа.
                </p>
                
                <button class="btn btn-primary" style="width: 100%;" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-check"></i> Понятно
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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

// Показать модальное окно
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Закрыть модальное окно
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Просмотр товара
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const category = categories.find(c => c.name === product.категория) || {};
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>${product.название}</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: linear-gradient(135deg, ${category.color1 || '#667eea'}, ${category.color2 || '#764ba2'}); border-radius: 10px; height: 200px; display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
                        ${category.icon || '📦'}
                    </div>
                    <div>
                        <h4>Информация о товаре</h4>
                        <p><strong>Категория:</strong> ${product.категория}</p>
                        <p><strong>Код товара:</strong> ${product.код_товара || 'N/A'}</p>
                        <p><strong>Цена:</strong> ${formatPrice(product.цена_продажи)}</p>
                        <p><strong>Наличие:</strong> ${product.количество > 0 ? 
                            `<span class="badge bg-success">${product.количество} шт.</span>` : 
                            `<span class="badge bg-danger">Нет в наличии</span>`
                        }</p>
                    </div>
                </div>
                
                <h4>Описание</h4>
                <p>${product.описание || 'Описание отсутствует'}</p>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    ${product.количество > 0 ? 
                        `<button class="btn btn-primary" onclick="addToCart(${product.id}); this.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-cart-plus"></i> Добавить в корзину
                        </button>` : 
                        `<button class="btn btn-secondary" disabled>
                            <i class="fas fa-times"></i> Нет в наличии
                        </button>`
                    }
                    <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Делаем функции доступными глобально
window.showCart = showCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.showCategory = showCategory;
window.showUserProfile = showUserProfile;
window.registerGuest = registerGuest;
window.checkout = checkout;
window.showModal = showModal;
window.closeModal = closeModal;
window.viewProduct = viewProduct;
