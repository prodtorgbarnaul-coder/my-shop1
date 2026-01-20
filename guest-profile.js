// ============================================
// УПРАВЛЕНИЕ ПРОФИЛЕМ ПОКУПАТЕЛЯ
// ============================================

// Показать профиль пользователя
function showUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    const guest = guests.find(g => g.id === currentUser.id);
    
    if (!guest) {
        showNotification('❌ Профиль не найден. Пройдите регистрацию.', 'error');
        return;
    }
    
    // Получаем заказы гостя
    const savedOrders = localStorage.getItem('shopOrders');
    const allOrders = savedOrders ? JSON.parse(savedOrders) : [];
    const guestOrders = allOrders.filter(o => o.guestId === guest.id).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3 class="modal-title"><i class="fas fa-user-circle"></i> Ваш профиль</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div class="user-avatar" style="width: 100px; height: 100px; font-size: 2.5rem; margin: 0 auto 15px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        ${guest.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 style="margin-bottom: 5px;">${guest.name}</h2>
                    <p style="color: var(--gray); margin-bottom: 20px;">
                        <i class="fas fa-phone"></i> ${guest.phone}
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;">${guest.ordersCount || 0}</div>
                        <div style="font-size: 14px;">Заказов</div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold;">${formatPrice(guest.totalSpent || 0)}</div>
                        <div style="font-size: 14px;">Потрачено всего</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0;">История заказов</h4>
                        <span style="font-size: 14px; color: var(--gray);">${guestOrders.length} заказов</span>
                    </div>
                    
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${guestOrders.length > 0 ? 
                            guestOrders.map(order => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${getStatusColor(order.status)};">
                                    <div>
                                        <strong style="display: block; margin-bottom: 5px;">Заказ ${order.id}</strong>
                                        <small style="color: var(--gray);">${new Date(order.createdAt).toLocaleDateString('ru-RU')} • ${formatPrice(order.totalAmount)}</small>
                                    </div>
                                    <div>
                                        <span class="badge ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span>
                                        <button class="btn-icon" onclick="viewOrder('${order.id}')" title="Просмотреть" style="margin-left: 10px;">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('') : 
                            '<div style="text-align: center; padding: 30px; color: var(--gray);">' +
                                '<i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>' +
                                '<p>Заказов пока нет</p>' +
                                '<small>Оформите первый заказ в магазине</small>' +
                            '</div>'
                        }
                    </div>
                </div>
                
                <div style="border-top: 1px solid var(--border); padding-top: 20px;">
                    <h4 style="margin-bottom: 15px;">Управление профилем</h4>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="editProfile(${guest.id})" style="flex: 1;">
                            <i class="fas fa-edit"></i> Редактировать профиль
                        </button>
                        <button class="btn btn-outline" onclick="changePassword(${guest.id})" style="flex: 1;">
                            <i class="fas fa-key"></i> Сменить пароль
                        </button>
                        <button class="btn btn-secondary" onclick="logoutGuest()" style="flex: 1;">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Просмотр заказа
function viewOrder(orderId) {
    const savedOrders = localStorage.getItem('shopOrders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('❌ Заказ не найден', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title"><i class="fas fa-receipt"></i> Заказ ${order.id}</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px;">Информация о заказе</h4>
                        <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString('ru-RU', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                        <p><strong>Статус:</strong> <span class="badge ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span></p>
                        <p><strong>Сумма:</strong> ${formatPrice(order.totalAmount)}</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px;">Клиент</h4>
                        <p><strong>Имя:</strong> ${order.guestName}</p>
                        <p><strong>Телефон:</strong> ${order.guestPhone}</p>
                        <p><strong>ID клиента:</strong> ${order.guestId}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px;">Товары в заказе</h4>
                    <div style="background: #f8f9fa; border-radius: 8px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: rgba(0,0,0,0.05);">
                                    <th style="padding: 12px; text-align: left;">Товар</th>
                                    <th style="padding: 12px; text-align: center;">Кол-во</th>
                                    <th style="padding: 12px; text-align: right;">Сумма</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                        <td style="padding: 12px;">${item.name}</td>
                                        <td style="padding: 12px; text-align: center;">${item.quantity} шт.</td>
                                        <td style="padding: 12px; text-align: right;">${formatPrice(item.total)}</td>
                                    </tr>
                                `).join('')}
                                <tr style="background: rgba(0,0,0,0.05); font-weight: bold;">
                                    <td style="padding: 12px; text-align: right;" colspan="2">Итого:</td>
                                    <td style="padding: 12px; text-align: right; color: var(--primary);">${formatPrice(order.totalAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                ${order.notes ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px;">Примечания к заказу</h4>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            ${order.notes}
                        </div>
                    </div>
                ` : ''}
                
                <button class="btn btn-primary" style="width: 100%;" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-check"></i> Закрыть
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Редактирование профиля
function editProfile(guestId) {
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    const guest = guests.find(g => g.id === guestId);
    
    if (!guest) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title"><i class="fas fa-user-edit"></i> Редактирование профиля</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Ваше имя *</label>
                    <input type="text" id="editGuestName" class="form-control" value="${guest.name}" required>
                </div>
                
                <div class="form-group">
                    <label>Ваш телефон *</label>
                    <input type="tel" id="editGuestPhone" class="form-control" value="${guest.phone}" required>
                </div>
                
                <div class="form-group">
                    <label>Email (необязательно)</label>
                    <input type="email" id="editGuestEmail" class="form-control" value="${guest.email || ''}" placeholder="example@mail.ru">
                </div>
                
                <div class="form-group">
                    <label>Адрес доставки (необязательно)</label>
                    <textarea id="editGuestAddress" class="form-control" rows="3" placeholder="Город, улица, дом, квартира">${guest.address || ''}</textarea>
                </div>
                
                <div id="editProfileError" style="color: var(--danger); margin: 10px 0; display: none;"></div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()" style="flex: 1;">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                    <button class="btn btn-primary" onclick="saveProfileChanges(${guestId})" style="flex: 2;">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Смена пароля
function changePassword(guestId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title"><i class="fas fa-key"></i> Смена пароля</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Новый пароль *</label>
                    <input type="password" id="newPassword" class="form-control" placeholder="Введите новый пароль" required>
                </div>
                
                <div class="form-group">
                    <label>Повторите пароль *</label>
                    <input type="password" id="confirmPassword" class="form-control" placeholder="Повторите новый пароль" required>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; font-size: 14px;">Требования к паролю:</h4>
                    <ul style="font-size: 13px; color: var(--gray); margin: 0; padding-left: 20px;">
                        <li>Минимум 6 символов</li>
                        <li>Рекомендуется использовать буквы и цифры</li>
                        <li>Не используйте простые пароли (123456, qwerty и т.д.)</li>
                    </ul>
                </div>
                
                <div id="changePasswordError" style="color: var(--danger); margin: 10px 0; display: none;"></div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()" style="flex: 1;">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                    <button class="btn btn-primary" onclick="savePasswordChanges(${guestId})" style="flex: 2;">
                        <i class="fas fa-save"></i> Сохранить пароль
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Сохранение изменений профиля
function saveProfileChanges(guestId) {
    const name = document.getElementById('editGuestName').value.trim();
    const phone = document.getElementById('editGuestPhone').value.trim();
    const email = document.getElementById('editGuestEmail').value.trim();
    const address = document.getElementById('editGuestAddress').value.trim();
    const errorDiv = document.getElementById('editProfileError');
    
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
    
    // Сохраняем изменения
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    const guestIndex = guests.findIndex(g => g.id === guestId);
    
    if (guestIndex === -1) {
        errorDiv.textContent = '❌ Пользователь не найден';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Обновляем данные
    guests[guestIndex].name = name;
    guests[guestIndex].phone = phone;
    if (email) guests[guestIndex].email = email;
    if (address) guests[guestIndex].address = address;
    guests[guestIndex].updatedAt = new Date().toISOString();
    
    // Обновляем также заказы
    const savedOrders = localStorage.getItem('shopOrders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.forEach(order => {
        if (order.guestId === guestId) {
            order.guestName = name;
            order.guestPhone = phone;
        }
    });
    
    // Сохраняем
    localStorage.setItem('shopGuests', JSON.stringify(guests));
    localStorage.setItem('shopOrders', JSON.stringify(orders));
    
    // Обновляем текущего пользователя
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id === guestId) {
        currentUser.name = name;
        currentUser.phone = phone;
        if (email) currentUser.email = email;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Обновляем информацию в хедере
        updateUserInfo(currentUser);
    }
    
    // Закрываем все модальные окна
    document.querySelectorAll('.modal').forEach(m => m.remove());
    
    // Показываем уведомление
    showNotification('✅ Профиль успешно обновлен', 'success');
    
    // Показываем профиль снова
    setTimeout(() => {
        showUserProfile();
    }, 500);
}

// Сохранение изменений пароля
function savePasswordChanges(guestId) {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('changePasswordError');
    
    // Валидация
    if (!newPassword || !confirmPassword) {
        errorDiv.textContent = '❌ Заполните оба поля';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        errorDiv.textContent = '❌ Пароль должен быть не менее 6 символов';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = '❌ Пароли не совпадают';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Проверяем на простые пароли
    const simplePasswords = ['123456', 'password', 'qwerty', '12345678', '123123'];
    if (simplePasswords.includes(newPassword)) {
        errorDiv.textContent = '❌ Используйте более сложный пароль';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Сохраняем изменения
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    const guestIndex = guests.findIndex(g => g.id === guestId);
    
    if (guestIndex === -1) {
        errorDiv.textContent = '❌ Пользователь не найден';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Обновляем пароль
    guests[guestIndex].password = newPassword;
    guests[guestIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('shopGuests', JSON.stringify(guests));
    
    // Закрываем модальное окно
    document.querySelectorAll('.modal').forEach(m => m.remove());
    
    // Показываем уведомление
    showNotification('✅ Пароль успешно изменен', 'success');
    
    // Показываем профиль снова
    setTimeout(() => {
        showUserProfile();
    }, 500);
}

// Выход гостя
function logoutGuest() {
    if (confirm('Вы уверены, что хотите выйти из профиля?')) {
        localStorage.removeItem('currentUser');
        
        // Обновляем информацию в хедере
        if (typeof updateUserInfo === 'function') {
            updateUserInfo({ name: 'Гость', role: 'Покупатель' });
        }
        
        // Скрываем кнопку профиля
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) profileBtn.style.display = 'none';
        
        // Закрываем все модальные окна
        document.querySelectorAll('.modal').forEach(m => m.remove());
        
        showNotification('👋 Вы вышли из профиля', 'info');
    }
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

// Получение класса статуса заказа
function getOrderStatusClass(status) {
    switch (status) {
        case 'new': return 'bg-warning';
        case 'processing': return 'bg-info';
        case 'completed': return 'bg-success';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Получение текста статуса заказа
function getOrderStatusText(status) {
    switch (status) {
        case 'new': return 'Новый';
        case 'processing': return 'В обработке';
        case 'completed': return 'Завершен';
        case 'cancelled': return 'Отменен';
        default: return status;
    }
}

// Получение цвета статуса
function getStatusColor(status) {
    switch (status) {
        case 'new': return '#ffc107';
        case 'processing': return '#17a2b8';
        case 'completed': return '#28a745';
        case 'cancelled': return '#dc3545';
        default: return '#6c757d';
    }
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

// Добавляем функции в глобальную область видимости
window.showUserProfile = showUserProfile;
window.editProfile = editProfile;
window.changePassword = changePassword;
window.saveProfileChanges = saveProfileChanges;
window.savePasswordChanges = savePasswordChanges;
window.logoutGuest = logoutGuest;
window.viewOrder = viewOrder;
