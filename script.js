// ============================================
// РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ ГОСТЕЙ
// ============================================

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
    
    // Регистрация гостя
    const result = registerGuest(name, phone, password);
    
    if (result.success) {
        // Автоматически логиним гостя
        const guest = result.guest;
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            id: guest.id,
            name: guest.name,
            phone: guest.phone,
            role: 'guest',
            login: guest.phone,
            loginTime: new Date().toISOString()
        }));
        
        // Обновляем информацию о пользователе
        updateUserInfo({
            name: guest.name,
            role: 'Покупатель'
        });
        
        // Закрываем модальное окно
        document.querySelector('.modal').remove();
        
        // Показываем уведомление
        showNotification(`✅ Добро пожаловать, ${guest.name}!`, 'success');
        
        // Если у гостя был пароль, показываем его
        if (password) {
            setTimeout(() => {
                showNotification(`🔐 Ваш пароль для входа: ${password}`, 'info');
            }, 1000);
        }
    } else {
        errorDiv.textContent = '❌ ' + result.message;
        errorDiv.style.display = 'block';
    }
}

// Обновление информации о пользователе в хедере
function updateUserInfo(user) {
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userName) userName.textContent = user.name || 'Гость';
    if (userRole) userRole.textContent = user.role === 'guest' ? 'Покупатель' : (user.role || 'Покупатель');
    if (userAvatar) {
        userAvatar.textContent = (user.name || 'Г').charAt(0).toUpperCase();
        userAvatar.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
    }
}

// Оформление заказа (обновленная версия)
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
    
    // Создаем заказ
    const orderResult = createOrder(cart, guest, totalAmount);
    
    if (orderResult.success) {
        // Очищаем корзину
        cart = [];
        saveCart();
        updateCartModal();
        updateCartCount();
        
        // Закрываем модальное окно корзины
        closeModal('cartModal');
        
        // Показываем успешное сообщение
        showNotification(`✅ Заказ №${orderResult.order.id} создан успешно!`, 'success');
        
        // Показываем детали заказа
        setTimeout(() => {
            showOrderConfirmation(orderResult.order);
        }, 1000);
    } else {
        showNotification('❌ Ошибка при создании заказа: ' + orderResult.message, 'error');
    }
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

// Печать заказа
function printOrder(orderId) {
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

// Обновляем инициализацию
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Инициализация магазина...');
    
    // Загружаем данные
    loadData();
    
    // Инициализируем интерфейс
    initInterface();
    
    // Проверяем авторизацию для конструктора
    checkAdminStatus();
    
    // Проверяем и регистрируем гостя
    setTimeout(() => {
        checkAndRegisterGuest();
    }, 1000);
    
    console.log('✅ Магазин готов к работе!');
});

// Добавляем функции в глобальную область видимости
window.checkAndRegisterGuest = checkAndRegisterGuest;
window.registerGuestSubmit = registerGuestSubmit;
window.showOrderConfirmation = showOrderConfirmation;
window.printOrder = printOrder;
