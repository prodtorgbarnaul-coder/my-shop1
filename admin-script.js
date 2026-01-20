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
    const savedCategories = localStorage.getItem('shopCategories');
    if (savedCategories) {
        allCategories = JSON.parse(savedCategories);
    }
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
        outOfStock: allProducts.filter(p => (p.количество || 0) <= 0).length
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

// Обновление дашборда
function updateDashboard() {
    const productsCount = document.getElementById('productsCount');
    const categoriesCount = document.getElementById('categoriesCount');
    const ordersCount = document.getElementById('ordersCount');
    const revenueAmount = document.getElementById('revenueAmount');
    
    if (productsCount) productsCount.textContent = statistics.totalProducts;
    if (categoriesCount) categoriesCount.textContent = allCategories.length;
    if (ordersCount) ordersCount.textContent = statistics.totalOrders;
    if (revenueAmount) revenueAmount.textContent = formatPrice(statistics.totalRevenue);
    
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
        const statusClass = (product.количество || 0) > 0 ? 'status-in-stock' : 'status-out-of-stock';
        const statusText = (product.количество || 0) > 0 ? 'В наличии' : 'Нет в наличии';
        
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
    
    // Обновляем статистику заказов
    updateOrderStats();
    
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

// Обновление статистики заказов
function updateOrderStats() {
    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.status === 'new').length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    const totalOrdersStat = document.getElementById('totalOrdersStat');
    const newOrdersStat = document.getElementById('newOrdersStat');
    const revenueStat = document.getElementById('revenueStat');
    const avgOrderStat = document.getElementById('avgOrderStat');
    
    if (totalOrdersStat) totalOrdersStat.textContent = totalOrders;
    if (newOrdersStat) newOrdersStat.textContent = newOrders;
    if (revenueStat) revenueStat.textContent = formatPrice(totalRevenue);
    if (avgOrderStat) avgOrderStat.textContent = formatPrice(avgOrder);
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
// ФУНКЦИИ ДЛЯ ТОВАРОВ И КАТЕГОРИЙ
// ============================================

// Сохранение товара
function saveProduct() {
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const status = document.getElementById('productStatus').value;
    const image = document.getElementById('productImage').value;
    const description = document.getElementById('productDescription').value;
    
    if (!name || !category || !price) {
        showNotification('❌ Заполните обязательные поля', 'error');
        return;
    }
    
    if (productId) {
        // Редактирование существующего товара
        const index = allProducts.findIndex(p => p.id == productId);
        if (index !== -1) {
            allProducts[index] = {
                ...allProducts[index],
                название: name,
                категория: category,
                цена_продажи: price,
                количество: quantity,
                статус: status,
                изображение: image,
                описание: description
            };
        }
    } else {
        // Добавление нового товара
        const newProduct = {
            id: Date.now(),
            название: name,
            категория: category,
            цена_продажи: price,
            количество: quantity,
            статус: status,
            изображение: image,
            описание: description,
            код_товара: `PROD${Date.now().toString().slice(-6)}`
        };
        allProducts.push(newProduct);
    }
    
    // Сохраняем
    localStorage.setItem('shopProducts', JSON.stringify(allProducts));
    
    // Обновляем интерфейс
    updateProductsTable();
    updateDashboard();
    updateCategorySelect();
    
    // Закрываем модальное окно
    closeModal('addProductModal');
    
    showNotification(productId ? '✅ Товар обновлен' : '✅ Товар добавлен', 'success');
}

// Редактирование товара
function editProduct(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.название || '';
    document.getElementById('productCategory').value = product.категория || '';
    document.getElementById('productPrice').value = product.цена_продажи || '';
    document.getElementById('productQuantity').value = product.количество || 0;
    document.getElementById('productStatus').value = product.статус || 'in_stock';
    document.getElementById('productImage').value = product.изображение || '';
    document.getElementById('productDescription').value = product.описание || '';
    document.getElementById('productModalLabel').textContent = 'Редактировать товар';
    
    showModal('addProductModal');
}

// Удаление товара
function deleteProduct(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    allProducts = allProducts.filter(p => p.id != productId);
    localStorage.setItem('shopProducts', JSON.stringify(allProducts));
    
    updateProductsTable();
    updateDashboard();
    
    showNotification('🗑️ Товар удален', 'info');
}

// Обновление select категорий
function updateCategorySelect() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    select.innerHTML = `
        <option value="">Выберите категорию</option>
        ${allCategories.map(category => `
            <option value="${category.name}">${category.name}</option>
        `).join('')}
    `;
}

// Обновление списка категорий
function updateCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = allCategories.map(category => {
        const productCount = allProducts.filter(p => p.категория === category.name).length;
        
        return `
            <div class="category-card-admin" style="background: linear-gradient(135deg, ${category.color1}, ${category.color2}); color: white;">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-code">${category.code}</div>
                <div class="category-count">${productCount} товаров</div>
                <div class="category-actions">
                    <button class="btn-icon btn-edit" onclick="editCategory('${category.name}')" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteCategory('${category.name}')" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Сохранение категории
function saveCategory() {
    const name = document.getElementById('categoryName').value;
    const code = document.getElementById('categoryCode').value;
    const icon = document.getElementById('categoryIcon').value || '🏷️';
    const color1 = document.getElementById('categoryColor1').value;
    const color2 = document.getElementById('categoryColor2').value;
    
    if (!name || !code) {
        showNotification('❌ Заполните название и код категории', 'error');
        return;
    }
    
    // Проверяем, существует ли категория
    const existingIndex = allCategories.findIndex(c => c.name === name);
    
    if (existingIndex !== -1) {
        // Обновляем существующую категорию
        allCategories[existingIndex] = {
            ...allCategories[existingIndex],
            code: code,
            icon: icon,
            color1: color1,
            color2: color2
        };
    } else {
        // Добавляем новую категорию
        allCategories.push({
            name: name,
            code: code,
            icon: icon,
            color1: color1,
            color2: color2
        });
    }
    
    // Сохраняем
    localStorage.setItem('shopCategories', JSON.stringify(allCategories));
    
    // Обновляем интерфейс
    updateCategoriesList();
    updateCategorySelect();
    
    // Закрываем модальное окно
    closeModal('addCategoryModal');
    
    showNotification(existingIndex !== -1 ? '✅ Категория обновлена' : '✅ Категория добавлена', 'success');
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Показать раздел
function showSection(sectionId) {
    // Скрываем все разделы
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Показываем выбранный раздел
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Обновляем заголовок
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Дашборд',
            'products': 'Товары',
            'categories': 'Категории',
            'orders': 'Заказы',
            'guests': 'Гости',
            'design': 'Дизайн',
            'settings': 'Настройки',
            'users': 'Пользователи'
        };
        pageTitle.textContent = titles[sectionId] || sectionId;
    }
    
    // Обновляем активную вкладку в навигации
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(`'${sectionId}'`)) {
            link.classList.add('active');
        }
    });
}

// Показать модальное окно
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Закрыть модальное окно
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Экспорт данных
function exportData() {
    const data = {
        products: allProducts,
        categories: allCategories,
        orders: orders,
        guests: guests
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shop-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📥 Данные экспортированы', 'success');
}

// Экспорт заказов
function exportOrders() {
    const csv = [
        ['Номер заказа', 'Клиент', 'Телефон', 'Товары', 'Сумма', 'Статус', 'Дата'],
        ...orders.map(order => [
            order.id,
            order.guestName,
            order.guestPhone,
            order.items?.map(i => `${i.name} (x${i.quantity})`).join('; ') || '',
            order.totalAmount,
            getOrderStatusText(order.status),
            new Date(order.createdAt).toLocaleDateString('ru-RU')
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📥 Заказы экспортированы в CSV', 'success');
}

// Поиск заказов
function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#ordersList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Поиск гостей
function searchGuests() {
    const searchTerm = document.getElementById('guestSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#guestsList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Сохранение настроек системы
function saveSystemSettings() {
    const login = document.getElementById('adminLogin').value;
    const password = document.getElementById('adminPassword').value;
    const phone = document.getElementById('adminPhone').value;
    const email = document.getElementById('adminEmail').value;
    
    if (!login) {
        showNotification('❌ Введите логин администратора', 'error');
        return;
    }
    
    // Сохраняем настройки
    const settings = {
        adminLogin: login,
        adminPassword: password,
        adminPhone: phone,
        adminEmail: email
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Обновляем данные админа
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        currentUser.name = login === 'admin' ? 'Администратор' : login;
        if (password) {
            // Обновляем пароль в базе данных
            const admins = [
                { id: 1, login: 'admin', password: password || 'admin123', name: 'Администратор', role: 'admin' },
                { id: 2, login: 'prodtorg', password: 'prodtorg2024', name: 'PRODTORG Manager', role: 'manager' },
                { id: 3, login: 'manager', password: 'manager123', name: 'Менеджер', role: 'manager' }
            ];
            localStorage.setItem('adminUsers', JSON.stringify(admins));
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    showNotification('✅ Настройки сохранены', 'success');
    showSection('dashboard');
}

// Сохранение настроек дизайна
function saveDesignSettings() {
    const storeName = document.getElementById('storeName').value;
    const primaryColor = document.getElementById('primaryColor').value;
    const siteBackground = document.getElementById('siteBackground').value;
    
    if (!storeName) {
        showNotification('❌ Введите название магазина', 'error');
        return;
    }
    
    const settings = {
        storeName: storeName,
        primaryColor: primaryColor,
        siteBackground: siteBackground
    };
    
    localStorage.setItem('designSettings', JSON.stringify(settings));
    
    showNotification('✅ Настройки дизайна сохранены', 'success');
    showSection('dashboard');
}

// Импорт CSV
function processImport() {
    const fileInput = document.getElementById('importFile');
    if (!fileInput.files.length) {
        showNotification('❌ Выберите файл для импорта', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csvData = e.target.result;
        const rows = csvData.split('\n');
        
        if (rows.length < 2) {
            showNotification('❌ Файл пуст или имеет неправильный формат', 'error');
            return;
        }
        
        // Парсим CSV
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        importedData = [];
        
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            
            const values = rows[i].split(',').map(v => v.trim());
            const product = {};
            
            headers.forEach((header, index) => {
                if (values[index]) {
                    product[header] = values[index];
                }
            });
            
            if (product.название && product.категория) {
                // Преобразуем числовые поля
                if (product.цена_продажи) product.цена_продажи = parseFloat(product.цена_продажи);
                if (product.количество) product.количество = parseInt(product.количество);
                if (product.id) product.id = parseInt(product.id);
                
                importedData.push(product);
            }
        }
        
        if (importedData.length > 0) {
            // Добавляем новые товары к существующим
            importedData.forEach(newProduct => {
                if (!newProduct.id) {
                    newProduct.id = Date.now() + Math.floor(Math.random() * 1000);
                }
                
                const existingIndex = allProducts.findIndex(p => p.id == newProduct.id);
                if (existingIndex !== -1) {
                    // Обновляем существующий товар
                    allProducts[existingIndex] = { ...allProducts[existingIndex], ...newProduct };
                } else {
                    // Добавляем новый товар
                    allProducts.push(newProduct);
                }
            });
            
            // Сохраняем
            localStorage.setItem('shopProducts', JSON.stringify(allProducts));
            
            // Обновляем интерфейс
            updateProductsTable();
            updateDashboard();
            
            showNotification(`✅ Импортировано ${importedData.length} товаров`, 'success');
            clearImport();
            closeModal('importModal');
        } else {
            showNotification('❌ Не удалось импортировать данные', 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('❌ Ошибка чтения файла', 'error');
    };
    
    reader.readAsText(file);
}

// Очистка импорта
function clearImport() {
    document.getElementById('importFile').value = '';
    document.getElementById('fileName').textContent = '';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('clearImportBtn').style.display = 'none';
    document.getElementById('processImportBtn').style.display = 'none';
    importedData = [];
}

// Сброс данных
function resetData() {
    if (!confirm('⚠️ ВНИМАНИЕ! Это действие удалит ВСЕ данные магазина (товары, заказы, гостей). Продолжить?')) {
        return;
    }
    
    // Удаляем данные
    localStorage.removeItem('shopProducts');
    localStorage.removeItem('shopOrders');
    localStorage.removeItem('shopGuests');
    
    // Оставляем только категории и настройки
    localStorage.removeItem('shopCart');
    
    // Перезагружаем страницу
    location.reload();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Загрузка файла для импорта
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('fileName').textContent = file.name;
                document.getElementById('importPreview').style.display = 'block';
                document.getElementById('clearImportBtn').style.display = 'inline-block';
                document.getElementById('processImportBtn').style.display = 'inline-block';
                
                // Показываем превью
                const reader = new FileReader();
                reader.onload = function(e) {
                    const csvData = e.target.result;
                    const rows = csvData.split('\n').slice(0, 6); // Показываем первые 5 строк
                    document.getElementById('previewTable').innerHTML = `
                        <div style="max-height: 200px; overflow-y: auto; font-size: 12px;">
                            <pre>${rows.join('\n')}</pre>
                        </div>
                        <small>Показано ${rows.length - 1} из ${csvData.split('\n').length - 1} строк</small>
                    `;
                };
                reader.readAsText(file);
            }
        });
    }
    
    // Навигация
    const navLinks = document.querySelectorAll('.admin-nav a[onclick*="showSection"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const match = this.getAttribute('onclick').match(/showSection\('(.+?)'\)/);
            if (match) {
                showSection(match[1]);
            }
        });
    });
}

// Выход из системы
function logoutAdmin() {
    localStorage.removeItem('currentUser');
    
    showNotification('👋 Вы вышли из системы', 'info');
    
    setTimeout(() => {
        window.location.href = 'login-admin.html';
    }, 1000);
}

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
window.exportOrders = exportOrders;
window.searchOrders = searchOrders;
window.searchGuests = searchGuests;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveCategory = saveCategory;
window.editCategory = function(name) {
    const category = allCategories.find(c => c.name === name);
    if (!category) return;
    
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryCode').value = category.code;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryColor1').value = category.color1;
    document.getElementById('categoryColor2').value = category.color2;
    
    showModal('addCategoryModal');
};
window.deleteCategory = function(name) {
    if (!confirm(`Удалить категорию "${name}"? Товары в этой категории останутся без категории.`)) return;
    
    allCategories = allCategories.filter(c => c.name !== name);
    
    // Удаляем категорию у товаров
    allProducts.forEach(product => {
        if (product.категория === name) {
            product.категория = '';
        }
    });
    
    localStorage.setItem('shopCategories', JSON.stringify(allCategories));
    localStorage.setItem('shopProducts', JSON.stringify(allProducts));
    
    updateCategoriesList();
    updateProductsTable();
    updateCategorySelect();
    
    showNotification('🗑️ Категория удалена', 'info');
};
window.editOrder = function(orderId) {
    viewOrderDetails(orderId);
};
window.editGuest = function(guestId) {
    viewGuestDetails(guestId);
};

// Инициализация при загрузке
window.onload = function() {
    if (document.readyState === 'complete') {
        console.log('🌐 Страница загружена');
    }
};
