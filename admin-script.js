javascript:my-shop1/admin-script.js
// ============================================
// УПРОЩЕННЫЙ admin-script.js (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// ============================================

// Основные переменные - объявляем один раз
let allProducts = [];
let allCategories = [];

// Проверка авторизации при загрузке
function checkAuth() {
    console.log('Проверка авторизации...');
    const isAdmin = localStorage.getItem('isAdmin');
    console.log('Статус админа:', isAdmin);
    
    if (!isAdmin) {
        window.location.href = 'login-admin.html';
        return false;
    }
    return true;
}

// Инициализация админки
function initAdmin() {
    console.log('Инициализация админ-панели...');
    
    if (!checkAuth()) {
        return;
    }
    
    // Загружаем данные
    loadProducts();
    loadCategories();
    updateDashboard();
    
    // Настраиваем обработчики
    setupEventListeners();
    
    console.log('✅ Админ-панель инициализирована');
}

// Загрузка товаров
function loadProducts() {
    try {
        // Пытаемся загрузить из localStorage
        const savedProducts = localStorage.getItem('adminProducts');
        if (savedProducts) {
            allProducts = JSON.parse(savedProducts);
        } else {
            // Создаем демо-товары
            allProducts = [
                {
                    id: 1,
                    name: "FAIRY банан - 5 литров",
                    category: "Бытовая химия",
                    price: 800,
                    quantity: 50,
                    status: "in_stock",
                    description: "Концентрированное средство для мытья посуды"
                },
                {
                    id: 2,
                    name: "Постельное белье 'Люкс'",
                    category: "Постельное белье",
                    price: 2500,
                    quantity: 20,
                    status: "in_stock",
                    description: "Хлопковое постельное белье премиум-класса"
                }
            ];
            localStorage.setItem('adminProducts', JSON.stringify(allProducts));
        }
        
        console.log('Товаров загружено:', allProducts.length);
        updateProductsTable();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        allProducts = [];
    }
}

// Загрузка категорий
function loadCategories() {
    try {
        allCategories = [
            { id: 1, name: 'Бытовая химия', code: 'BH' },
            { id: 2, name: 'Постельное белье', code: 'PB' },
            { id: 3, name: 'Рыба и морепродукты', code: 'RB' },
            { id: 4, name: 'Мясо и птица', code: 'MT' },
            { id: 5, name: 'Кондитерские изделия', code: 'KD' },
            { id: 6, name: 'Молочные продукты', code: 'ML' },
            { id: 7, name: 'Мангальные зоны и мангалы', code: 'MM' }
        ];
        
        console.log('Категорий загружено:', allCategories.length);
        updateCategoriesList();
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        allCategories = [];
    }
}

// Обновление дашборда
function updateDashboard() {
    document.getElementById('productsCount').textContent = allProducts.length;
    document.getElementById('categoriesCount').textContent = allCategories.length;
    document.getElementById('ordersCount').textContent = 0;
    document.getElementById('revenueAmount').textContent = '0 ₽';
}

// Обновление таблицы товаров
function updateProductsTable() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (allProducts.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    Товары не найдены. Добавьте первый товар.
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = allProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td>${product.price} ₽</td>
            <td>${product.quantity || 0}</td>
            <td>
                <span class="badge ${product.status === 'in_stock' ? 'bg-success' : 'bg-danger'}">
                    ${product.status === 'in_stock' ? 'В наличии' : 'Нет в наличии'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Обновление списка категорий
function updateCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = allCategories.map(category => `
        <div class="category-preview" style="background: linear-gradient(135deg, var(--gradient-bh))">
            <div class="category-actions">
                <button class="btn-icon btn-edit" style="background: white; width: 30px; height: 30px;">
                    <i class="fas fa-edit" style="font-size: 12px;"></i>
                </button>
            </div>
            <i class="fas fa-tag"></i>
            <h4>${category.name}</h4>
            <small>${category.code}</small>
        </div>
    `).join('');
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('Настройка обработчиков...');
    
    // Кнопка выхода
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', logoutAdmin);
    });
    
    // Форма добавления товара
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
    
    // Форма добавления категории
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCategory();
        });
    }
    
    console.log('✅ Обработчики настроены');
}

// Сохранение товара
function saveProduct() {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const quantity = document.getElementById('productQuantity').value;
    
    if (!name || !category || !price) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    const newProduct = {
        id: Date.now(),
        name: name,
        category: category,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 0,
        status: 'in_stock',
        description: '',
        createdAt: new Date().toISOString()
    };
    
    allProducts.push(newProduct);
    localStorage.setItem('adminProducts', JSON.stringify(allProducts));
    
    updateProductsTable();
    updateDashboard();
    
    // Закрываем модальное окно
    closeModal('addProductModal');
    
    // Очищаем форму
    document.getElementById('addProductForm').reset();
    
    showNotification('Товар успешно добавлен', 'success');
}

// Сохранение категории
function saveCategory() {
    const name = document.getElementById('categoryName').value;
    const code = document.getElementById('categoryCode').value;
    
    if (!name || !code) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    const newCategory = {
        id: Date.now(),
        name: name,
        code: code.toUpperCase(),
        createdAt: new Date().toISOString()
    };
    
    allCategories.push(newCategory);
    
    updateCategoriesList();
    updateDashboard();
    
    // Закрываем модальное окно
    closeModal('addCategoryModal');
    
    // Очищаем форму
    document.getElementById('addCategoryForm').reset();
    
    showNotification('Категория успешно добавлена', 'success');
}

// Удаление товара
function deleteProduct(id) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        allProducts = allProducts.filter(product => product.id !== id);
        localStorage.setItem('adminProducts', JSON.stringify(allProducts));
        
        updateProductsTable();
        updateDashboard();
        showNotification('Товар удален', 'success');
    }
}

// Редактирование товара
function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    // Заполняем форму
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity;
    
    // Показываем модальное окно
    showModal('addProductModal');
    
    // TODO: Добавить логику обновления существующего товара
    showNotification('Редактирование товара', 'info');
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Управление модальными окнами
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Экспорт данных
function exportData() {
    const data = {
        products: allProducts,
        categories: allCategories,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Данные экспортированы', 'success');
}

// Выход из системы
function logoutAdmin() {
    console.log('Выход из системы...');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    showNotification('Вы вышли из системы', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ HTML
// ============================================

window.showSection = function(sectionId) {
    document.querySelectorAll('[id$="-section"]').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionId + '-section').style.display = 'block';
    
    const titles = {
        'dashboard': 'Дашборд',
        'products': 'Товары',
        'categories': 'Категории',
        'orders': 'Заказы',
        'design': 'Дизайн',
        'settings': 'Настройки'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || sectionId;
    
    if (sectionId === 'products') {
        updateProductsTable();
    }
};

window.showModal = showModal;
window.closeModal = closeModal;
window.logoutAdmin = logoutAdmin;
window.exportData = exportData;

// ============================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, запускаем админку...');
    initAdmin();
});

// Резервный запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    setTimeout(initAdmin, 100);
}
