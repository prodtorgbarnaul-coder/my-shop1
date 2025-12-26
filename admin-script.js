// ============================================
// ПОЛНЫЙ КОД АДМИН-ПАНЕЛИ PRODTORG
// ============================================

console.log('🚀 АДМИН-ПАНЕЛЬ: Начало загрузки');

// ============================================
// 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

let adminProducts = [];
let adminCategories = [];
let adminCurrentUser = null;

// ============================================
// 2. ОСНОВНЫЕ ФУНКЦИИ
// ============================================

// 2.1 ФУНКЦИЯ ВЫХОДА (ВАЖНО!)
function logoutAdmin() {
    console.log('🔒 Выход из админ-панели...');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminProducts');
    localStorage.removeItem('adminCategories');
    window.location.href = 'login-admin.html';
}

// 2.2 ПРОВЕРКА АВТОРИЗАЦИИ
function checkAdminAuth() {
    console.log('🔐 Проверка авторизации...');
    const isAdmin = localStorage.getItem('isAdmin');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!isAdmin || !loginTime) {
        console.log('❌ Нет авторизации');
        return false;
    }
    
    // Проверяем время сессии (24 часа)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        console.log('⏰ Сессия истекла');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminLoginTime');
        return false;
    }
    
    console.log('✅ Авторизация подтверждена');
    return true;
}

// 2.3 ЗАГРУЗКА ДАННЫХ
async function loadAdminData() {
    console.log('📦 Загрузка данных админ-панели...');
    
    try {
        // Загрузка товаров
        const productsResponse = await fetch('demo-products.json');
        if (productsResponse.ok) {
            adminProducts = await productsResponse.json();
            console.log(`✅ Товаров загружено: ${adminProducts.length}`);
        }
        
        // Загрузка категорий
        adminCategories = JSON.parse(localStorage.getItem('categoriesData')) || [];
        console.log(`✅ Категорий загружено: ${adminCategories.length}`);
        
        // Обновление интерфейса
        updateAdminDashboard();
        renderAdminProducts();
        renderAdminCategories();
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        showAdminNotification('Ошибка загрузки данных', 'error');
    }
}

// 2.4 ОБНОВЛЕНИЕ ДАШБОРДА
function updateAdminDashboard() {
    console.log('📊 Обновление дашборда...');
    
    const elements = {
        'productsCount': adminProducts.length,
        'categoriesCount': adminCategories.length,
        'ordersCount': 0, // Пока нет заказов
        'revenueAmount': 0 // Пока нет выручки
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// 2.5 РЕНДЕРИНГ ТОВАРОВ
function renderAdminProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (adminProducts.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-box-open" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p style="color: #666;">Товары не найдены</p>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = adminProducts.map((product, index) => `
        <tr>
            <td>${product.id || index + 1}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${product.image || 'https://via.placeholder.com/40'}" 
                         alt="${product.name}" 
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                    <div>
                        <strong>${product.name}</strong>
                        ${product.description ? `<br><small style="color: #666;">${product.description.substring(0, 50)}...</small>` : ''}
                    </div>
                </div>
            </td>
            <td>${product.category || 'Без категории'}</td>
            <td><strong>${formatPrice(product.price || 0)}</strong></td>
            <td>${product.quantity || 0}</td>
            <td>
                <span class="badge ${getStatusClass(product.status)}">
                    ${getStatusText(product.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" title="Редактировать" onclick="editAdminProduct(${product.id || index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Удалить" onclick="deleteAdminProduct(${product.id || index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 2.6 РЕНДЕРИНГ КАТЕГОРИЙ
function renderAdminCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    if (adminCategories.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
                    <i class="fas fa-tags" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p style="color: #666;">Категории не добавлены</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = adminCategories.map(category => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="category-preview" style="
                background: ${category.backgroundType === 'gradient' 
                    ? `linear-gradient(135deg, ${category.color1}, ${category.color2})` 
                    : category.color1};
                color: white;
                border-radius: 10px;
                padding: 20px;
                position: relative;
                min-height: 120px;
            ">
                <div class="category-actions">
                    <button class="btn-icon btn-edit" onclick="editAdminCategory('${category.code}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteAdminCategory('${category.code}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div style="font-size: 2rem; margin-bottom: 10px;">
                    ${category.icon || '📁'}
                </div>
                <h5 style="margin: 0; font-size: 1.1rem;">${category.name}</h5>
                <small style="opacity: 0.8;">Код: ${category.code}</small>
                <div style="margin-top: 10px; font-size: 0.8rem;">
                    ${category.products ? `${category.products} товаров` : 'Нет товаров'}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// 3.1 ФОРМАТИРОВАНИЕ ЦЕНЫ
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

// 3.2 ПОЛУЧЕНИЕ СТАТУСА ТОВАРА
function getStatusText(status) {
    const statuses = {
        'in_stock': 'В наличии',
        'out_of_stock': 'Нет в наличии',
        'pre_order': 'Под заказ'
    };
    return statuses[status] || 'В наличии';
}

function getStatusClass(status) {
    const classes = {
        'in_stock': 'bg-success',
        'out_of_stock': 'bg-danger',
        'pre_order': 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
}

// 3.3 УВЕДОМЛЕНИЯ
function showAdminNotification(message, type = 'info') {
    console.log(`📢 Уведомление [${type}]: ${message}`);
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
        color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
        border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        ${message}
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            margin-left: 10px;
            color: inherit;
            cursor: pointer;
        ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ============================================
// 4. ФУНКЦИИ УПРАВЛЕНИЯ ТОВАРАМИ
// ============================================

// 4.1 ДОБАВЛЕНИЕ ТОВАРА
function addAdminProduct() {
    console.log('➕ Добавление товара...');
    showAdminModal('addProductModal');
}

// 4.2 РЕДАКТИРОВАНИЕ ТОВАРА
function editAdminProduct(productId) {
    console.log('✏️ Редактирование товара:', productId);
    const product = adminProducts.find(p => p.id === productId);
    if (!product) {
        showAdminNotification('Товар не найден', 'error');
        return;
    }
    
    // Заполняем форму
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productQuantity').value = product.quantity || '';
    document.getElementById('productStatus').value = product.status || 'in_stock';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image || '';
    
    showAdminModal('addProductModal');
}

// 4.3 УДАЛЕНИЕ ТОВАРА
function deleteAdminProduct(productId) {
    console.log('🗑️ Удаление товара:', productId);
    
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    adminProducts = adminProducts.filter(p => p.id !== productId);
    renderAdminProducts();
    updateAdminDashboard();
    showAdminNotification('Товар удален', 'success');
}

// 4.4 СОХРАНЕНИЕ ТОВАРА
function saveAdminProduct() {
    console.log('💾 Сохранение товара...');
    
    const form = document.getElementById('addProductForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const productData = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        quantity: parseInt(document.getElementById('productQuantity').value) || 0,
        status: document.getElementById('productStatus').value,
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/300',
        createdAt: new Date().toISOString()
    };
    
    adminProducts.unshift(productData);
    renderAdminProducts();
    updateAdminDashboard();
    hideAdminModal('addProductModal');
    showAdminNotification('Товар успешно сохранен', 'success');
    
    // Очистка формы
    form.reset();
    form.classList.remove('was-validated');
}

// ============================================
// 5. ФУНКЦИИ УПРАВЛЕНИЯ КАТЕГОРИЯМИ
// ============================================

// 5.1 ДОБАВЛЕНИЕ КАТЕГОРИИ
function addAdminCategory() {
    console.log('📁 Добавление категории...');
    showAdminModal('addCategoryModal');
}

// 5.2 РЕДАКТИРОВАНИЕ КАТЕГОРИИ
function editAdminCategory(categoryCode) {
    console.log('✏️ Редактирование категории:', categoryCode);
    const category = adminCategories.find(c => c.code === categoryCode);
    if (!category) {
        showAdminNotification('Категория не найдена', 'error');
        return;
    }
    
    // Заполняем форму
    document.getElementById('categoryName').value = category.name || '';
    document.getElementById('categoryCode').value = category.code || '';
    document.getElementById('categoryIcon').value = category.icon || '';
    document.getElementById('categoryColor1').value = category.color1 || '#667eea';
    document.getElementById('categoryColor2').value = category.color2 || '#764ba2';
    
    showAdminModal('addCategoryModal');
}

// 5.3 УДАЛЕНИЕ КАТЕГОРИИ
function deleteAdminCategory(categoryCode) {
    console.log('🗑️ Удаление категории:', categoryCode);
    
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    adminCategories = adminCategories.filter(c => c.code !== categoryCode);
    localStorage.setItem('categoriesData', JSON.stringify(adminCategories));
    renderAdminCategories();
    updateAdminDashboard();
    showAdminNotification('Категория удалена', 'success');
}

// 5.4 СОХРАНЕНИЕ КАТЕГОРИИ
function saveAdminCategory() {
    console.log('💾 Сохранение категории...');
    
    const form = document.getElementById('addCategoryForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        code: document.getElementById('categoryCode').value.toUpperCase(),
        icon: document.getElementById('categoryIcon').value,
        color1: document.getElementById('categoryColor1').value,
        color2: document.getElementById('categoryColor2').value,
        backgroundType: 'gradient'
    };
    
    adminCategories.push(categoryData);
    localStorage.setItem('categoriesData', JSON.stringify(adminCategories));
    renderAdminCategories();
    updateAdminDashboard();
    hideAdminModal('addCategoryModal');
    showAdminNotification('Категория успешно сохранена', 'success');
    
    // Очистка формы
    form.reset();
    form.classList.remove('was-validated');
}

// ============================================
// 6. МОДАЛЬНЫЕ ОКНА
// ============================================

// 6.1 ПОКАЗАТЬ МОДАЛЬНОЕ ОКНО
function showAdminModal(modalId) {
    console.log('📋 Показ модального окна:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// 6.2 СКРЫТЬ МОДАЛЬНОЕ ОКНО
function hideAdminModal(modalId) {
    console.log('📋 Скрытие модального окна:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============================================
// 7. ИНИЦИАЛИЗАЦИЯ И ЗАПУСК
// ============================================

// 7.1 ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
function initAdminPanel() {
    console.log('⚡ ИНИЦИАЛИЗАЦИЯ АДМИН-ПАНЕЛИ');
    
    // 1. Проверка авторизации
    if (!checkAdminAuth()) {
        window.location.href = 'login-admin.html';
        return;
    }
    
    console.log('✅ Авторизация прошла успешно');
    
    // 2. Установка обработчика кнопки "Выйти"
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
        console.log('✅ Кнопка "Выйти" подключена');
    } else {
        console.warn('⚠️ Кнопка "Выйти" не найдена');
    }
    
    // 3. Загрузка данных
    loadAdminData();
    
    // 4. Установка обработчиков событий
    setupAdminEventListeners();
    
    // 5. Показ имени пользователя
    const userNameElement = document.getElementById('currentAdminName');
    if (userNameElement) {
        userNameElement.textContent = 'Администратор';
    }
    
    console.log('✅ АДМИН-ПАНЕЛЬ ГОТОВА К РАБОТЕ');
}

// 7.2 НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ
function setupAdminEventListeners() {
    console.log('🎮 Настройка обработчиков событий...');
    
    // Кнопки модальных окон
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addAdminProduct);
    }
    
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addAdminCategory);
    }
    
    // Формы
    const productForm = document.getElementById('addProductForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdminProduct();
        });
    }
    
    const categoryForm = document.getElementById('addCategoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdminCategory();
        });
    }
    
    // Закрытие модальных окон
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
        element.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Поиск товаров
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchAdminProducts(this.value);
        });
    }
    
    console.log('✅ Обработчики событий настроены');
}

// 7.3 ПОИСК ТОВАРОВ
function searchAdminProducts(query) {
    console.log('🔍 Поиск товаров:', query);
    // Реализация поиска
}

// ============================================
// 8. ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================

// Ждем полной загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    // DOM уже загружен
    setTimeout(initAdminPanel, 100);
}

// Экспортируем основные функции для доступа из консоли
window.logoutAdmin = logoutAdmin;
window.initAdminPanel = initAdminPanel;
window.showAdminNotification = showAdminNotification;

console.log('✅ admin-script.js ЗАГРУЖЕН И ГОТОВ К РАБОТЕ');
