// ============================================
// ПОЛНЫЙ АДМИН-СКРИПТ С УПРАВЛЕНИЕМ ЗАКАЗАМИ
// ============================================

// Основные переменные
let allProducts = [];
let allCategories = [];
let importedData = [];
let orders = [];
let guests = [];
let statistics = {};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Инициализация админ-панели...');
    
    // Проверяем авторизацию
    if (!checkAuth()) {
        return;
    }
    
    // Загружаем данные
    loadData();
    
    // Настраиваем интерфейс
    initInterface();
    
    console.log('✅ Админ-панель готова!');
});

// Проверка авторизации
function checkAuth() {
    const auth = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!auth.id || (auth.role !== 'admin' && auth.role !== 'manager')) {
        window.location.href = 'login-admin.html';
        return false;
    }
    
    // Показываем имя админа
    const adminName = document.getElementById('adminName');
    if (adminName) {
        adminName.textContent = auth.name;
    }
    
    // Показываем аватар
    const adminAvatar = document.getElementById('adminAvatar');
    if (adminAvatar) {
        adminAvatar.textContent = auth.name.charAt(0).toUpperCase();
        adminAvatar.style.background = `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
    }
    
    return true;
}

// Загрузка данных
function loadData() {
    console.log('📥 Загрузка данных...');
    
    // Загружаем товары
    const savedProducts = localStorage.getItem('shopProducts');
    if (savedProducts) {
        allProducts = JSON.parse(savedProducts);
        console.log(`📦 Загружено ${allProducts.length} товаров`);
    }
    
    // Загружаем категории
    allCategories = [...shopCategories];
    console.log(`🏷️ Загружено ${allCategories.length} категорий`);
    
    // Загружаем заказы
    const savedOrders = localStorage.getItem('shopOrders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
        console.log(`📋 Загружено ${orders.length} заказов`);
    }
    
    // Загружаем гостей
    const savedGuests = localStorage.getItem('shopGuests');
    if (savedGuests) {
        guests = JSON.parse(savedGuests);
        console.log(`👥 Загружено ${guests.length} гостей`);
    }
    
    // Загружаем статистику
    loadStatistics();
}

// Загрузка статистики
function loadStatistics() {
    statistics = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        newOrders: orders.filter(o => o.status === 'new').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        activeGuests: guests.filter(g => g.ordersCount > 0).length,
        totalProducts: allProducts.length,
        outOfStock: allProducts.filter(p => p.количество <= 0).length
    };
}

// Инициализация интерфейса
function initInterface() {
    // Обновляем статистику
    updateDashboard();
    
    // Обновляем таблицу товаров
    updateProductsTable();
    
    // Обновляем список категорий
    updateCategoriesList();
    
    // Обновляем select категорий
    updateCategorySelect();
    
    // Обновляем заказы
    updateOrdersTable();
    
    // Обновляем гостей
    updateGuestsTable();
    
    // Настраиваем обработчики событий
    setupEventListeners();
}

// ============================================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ============================================

// Обновление дашборда
function updateDashboard() {
    document.getElementById('productsCount').textContent = statistics.totalProducts;
    document.getElementById('categoriesCount').textContent = allCategories.length;
    document.getElementById('ordersCount').textContent = statistics.totalOrders;
    document.getElementById('revenueAmount').textContent = formatPrice(statistics.totalRevenue);
    
    // Обновляем последние товары
    updateRecentProducts();
}

// Обновление последних товаров
function updateRecentProducts() {
    const container = document.getElementById('recentProducts');
    if (!container) return;
    
    const recentProducts = allProducts.slice(0, 5);
    
    container.innerHTML = recentProducts.map(product => {
        const category = allCategories.find(c => c.name === product.категория) || {};
        const statusClass = (product.количество || 0) > 0 ? 'status-in-stock' : 'status-out-of-stock';
        const statusText = (product.количество || 0) > 0 ? 'В наличии' : 'Нет в наличии';
        
        return `
            <tr>
                <td>${product.id || ''}</td>
                <td>
                    <strong>${product.название || 'Без названия'}</strong>
                    <br><small style="color: var(--gray);">${product.код_товара || ''}</small>
                </td>
                <td>
                    <span class="category-badge" style="background: linear-gradient(135deg, ${category.color1 || '#667eea'}, ${category.color2 || '#764ba2'}); color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">
                        ${product.категория || 'Без категории'}
                    </span>
                </td>
                <td><strong>${formatPrice(product.цена_продажи || 0)}</strong></td>
                <td>
                    <span class="badge ${(product.количество || 0) > 0 ? 'bg-success' : 'bg-danger'}">
                        ${product.количество || 0} шт.
                    </span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
            </tr>
        `;
    }).join('');
}

// Обновление таблицы товаров
function updateProductsTable() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (allProducts.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Товары не найдены<br>
                    <small style="font-size: 12px;">Добавьте товары вручную или импортируйте из CSV</small>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = allProducts.map((product, index) => {
        const category = allCategories.find(c => c.name === product.категория) || {};
        const statusClass = getStatusClass(product.статус);
        const statusText = getStatusText(product.статус);
        
        return `
            <tr>
                <td>${product.id || index + 1}</td>
                <td>
                    <strong>${product.название || 'Без названия'}</strong>
                    ${product.код_товара ? `<br><small style="color: var(--gray);">${product.код_товара}</small>` : ''}
                </td>
                <td>
                    <span class="category-badge" style="background: linear-gradient(135deg, ${category.color1 || '#667eea'}, ${category.color2 || '#764ba2'}); color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">
                        ${product.категория || 'Без категории'}
                    </span>
                </td>
                <td><strong>${formatPrice(product.цена_продажи || 0)}</strong></td>
                <td>
                    <span class="badge ${(product.количество || 0) > 0 ? 'bg-success' : 'bg-danger'}">
                        ${product.количество || 0} шт.
                    </span>
                </td>
                <td>
                    <span class="badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editProduct(${product.id || index})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id || index})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Обновление таблицы заказов
function updateOrdersTable() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Заказов нет<br>
                    <small style="font-size: 12px;">Ожидание заказов от клиентов</small>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = orders.map((order, index) => {
        const guest = guests.find(g => g.id === order.guestId);
        const statusClass = getOrderStatusClass(order.status);
        const statusText = getOrderStatusText(order.status);
        
        return `
            <tr>
                <td>${order.id || 'N/A'}</td>
                <td>
                    <strong>${order.guestName || 'Гость'}</strong>
                    <br><small style="color: var(--gray);">${order.guestPhone || 'Без телефона'}</small>
                </td>
                <td>
                    <div style="max-height: 60px; overflow-y: auto; font-size: 12px;">
                        ${order.items?.map(item => 
                            `${item.name} × ${item.quantity} = ${formatPrice(item.total)}`
                        ).join('<br>') || 'Нет товаров'}
                    </div>
                </td>
                <td><strong>${formatPrice(order.totalAmount || 0)}</strong></td>
                <td>
                    <span class="badge ${statusClass}">${statusText}</span>
                </td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editOrder('${order.id}')" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-view" onclick="viewOrderDetails('${order.id}')" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <select class="status-select" style="padding: 5px; border-radius: 5px; border: 1px solid var(--border);" 
                                onchange="updateOrderStatus('${order.id}', this.value)" 
                                title="Изменить статус">
                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Завершен</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                        </select>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Обновление таблицы гостей
function updateGuestsTable() {
    const container = document.getElementById('guestsList');
    if (!container) return;
    
    if (guests.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Гостей нет<br>
                    <small style="font-size: 12px;">Клиенты появятся после регистрации</small>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = guests.map((guest, index) => {
        const guestOrders = orders.filter(o => o.guestId === guest.id);
        const lastOrder = guestOrders.length > 0 
            ? guestOrders[guestOrders.length - 1] 
            : null;
        
        return `
            <tr>
                <td>${guest.id || index + 1}</td>
                <td>
                    <strong>${guest.name || 'Без имени'}</strong>
                    <br><small style="color: var(--gray);">Гость</small>
                </td>
                <td>${guest.phone || 'Без телефона'}</td>
                <td>
                    <span class="badge bg-info">${guest.ordersCount || 0} заказов</span>
                </td>
                <td><strong>${formatPrice(guest.totalSpent || 0)}</strong></td>
                <td>${lastOrder ? formatDate(lastOrder.createdAt) : 'Нет заказов'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewGuestDetails(${guest.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editGuest(${guest.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Обновление статуса заказа
function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('❌ Заказ не найден', 'error');
        return;
    }
    
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    
    // Сохраняем
    localStorage.setItem('shopOrders', JSON.stringify(orders));
    
    // Обновляем таблицу
    updateOrdersTable();
    updateDashboard();
    
    showNotification(`✅ Статус заказа ${orderId} изменен на "${getOrderStatusText(newStatus)}"`, 'success');
}

// Просмотр деталей заказа
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('❌ Заказ не найден', 'error');
        return;
    }
    
    const guest = guests.find(g => g.id === order.guestId);
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="admin-modal-content" style="max-width: 700px;">
            <div class="admin-modal-header">
                <h3 class="admin-modal-title">📋 Детали заказа ${order.id}</h3>
                <button class="admin-modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="admin-modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Клиент:</label>
                        <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <strong>${order.guestName}</strong><br>
                            📞 ${order.guestPhone}<br>
                            ID: ${order.guestId}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Статус:</label>
                        <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <span class="badge ${getOrderStatusClass(order.status)}">
                                ${getOrderStatusText(order.status)}
                            </span>
                            <br>Создан: ${formatDate(order.createdAt)}<br>
                            Обновлен: ${formatDate(order.updatedAt)}
                        </div>
                    </div>
                </div>
                
                <h4>Товары в заказе:</h4>
                <div class="admin-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Товар</th>
                                <th>Цена</th>
                                <th>Кол-во</th>
                                <th>Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items?.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${formatPrice(item.price)}</td>
                                    <td>${item.quantity} шт.</td>
                                    <td><strong>${formatPrice(item.total)}</strong></td>
                                </tr>
                            `).join('') || '<tr><td colspan="4">Товары не указаны</td></tr>'}
                            <tr>
                                <td colspan="3" style="text-align: right; font-weight: bold;">Итого:</td>
                                <td><strong style="color: var(--primary);">${formatPrice(order.totalAmount)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px;">
                    <label>Примечания:</label>
                    <textarea id="orderNotes" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 5px; margin-top: 5px;" rows="3">${order.notes || ''}</textarea>
                </div>
                
                <div class="form-actions" style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                    <button class="btn btn-primary" onclick="saveOrderNotes('${order.id}')">
                        <i class="fas fa-save"></i> Сохранить примечания
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Сохранение примечаний к заказу
function saveOrderNotes(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const notes = document.getElementById('orderNotes')?.value || '';
    order.notes = notes;
    order.updatedAt = new Date().toISOString();
    
    localStorage.setItem('shopOrders', JSON.stringify(orders));
    showNotification('✅ Примечания сохранены', 'success');
}

// Просмотр деталей гостя
function viewGuestDetails(guestId) {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) {
        showNotification('❌ Гость не найден', 'error');
        return;
    }
    
    const guestOrders = orders.filter(o => o.guestId === guestId);
    const totalOrders = guestOrders.length;
    const totalSpent = guestOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="admin-modal-content" style="max-width: 700px;">
            <div class="admin-modal-header">
                <h3 class="admin-modal-title">👤 Профиль гостя</h3>
                <button class="admin-modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="admin-modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Имя:</label>
                        <input type="text" class="form-control" id="guestName" value="${guest.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label>Телефон:</label>
                        <input type="text" class="form-control" id="guestPhone" value="${guest.phone || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Статистика:</label>
                        <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <div>Заказов: <strong>${totalOrders}</strong></div>
                            <div>Потрачено: <strong>${formatPrice(totalSpent)}</strong></div>
                            <div>Дата регистрации: ${formatDate(guest.registered)}</div>
                            <div>Последний вход: ${formatDate(guest.lastLogin)}</div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Заказы гостя:</label>
                        <div style="max-height: 150px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            ${guestOrders.length > 0 ? 
                                guestOrders.map(order => `
                                    <div style="margin-bottom: 5px; padding: 5px; border-bottom: 1px solid var(--border);">
                                        <strong>${order.id}</strong> - ${formatPrice(order.totalAmount)} - 
                                        <span class="badge ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span>
                                    </div>
                                `).join('') : 
                                '<div>Заказов нет</div>'
                            }
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                    <button class="btn btn-primary" onclick="saveGuestDetails(${guestId})">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Сохранение изменений гостя
function saveGuestDetails(guestId) {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    
    const name = document.getElementById('guestName')?.value || '';
    const phone = document.getElementById('guestPhone')?.value || '';
    
    if (!name || !phone) {
        showNotification('❌ Заполните имя и телефон', 'error');
        return;
    }
    
    guest.name = name;
    guest.phone = phone;
    
    // Обновляем также все заказы этого гостя
    orders.forEach(order => {
        if (order.guestId === guestId) {
            order.guestName = name;
            order.guestPhone = phone;
        }
    });
    
    // Сохраняем
    localStorage.setItem('shopGuests', JSON.stringify(guests));
    localStorage.setItem('shopOrders', JSON.stringify(orders));
    
    // Обновляем таблицы
    updateGuestsTable();
    updateOrdersTable();
    
    showNotification('✅ Данные гостя обновлены', 'success');
    
    // Закрываем модальное окно
    document.querySelector('.admin-modal').remove();
}

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return 'Нет данных';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

// Остальные функции остаются как в предыдущей версии (saveProduct, editProduct, deleteProduct и т.д.)
// ... [Все остальные функции из предыдущего admin-script.js] ...

// Выход из системы
function logoutAdmin() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminLoginTime');
    
    showNotification('👋 Вы вышли из системы', 'info');
    
    setTimeout(() => {
        window.location.href = 'login-admin.html';
    }, 1000);
}

// ============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ============================================

// Делаем функции доступными глобально
window.showSection = showSection;
window.showModal = showModal;
window.closeModal = closeModal;
window.logoutAdmin = logoutAdmin;
window.exportData = exportData;
window.saveSystemSettings = saveSystemSettings;
window.resetData = resetData;
window.saveDesignSettings = saveDesignSettings;
window.processImport = processImport;
window.clearImport = clearImport;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.viewGuestDetails = viewGuestDetails;
window.saveGuestDetails = saveGuestDetails;
window.saveOrderNotes = saveOrderNotes;

// Инициализация при загрузке
window.onload = function() {
    if (document.readyState === 'complete') {
        console.log('🌐 Страница загружена');
    }
};
