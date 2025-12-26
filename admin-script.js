// ============================================
// ПОЛНЫЙ АДМИН-СКРИПТ С ИМПОРТОМ ТОВАРОВ ИЗ CSV
// ============================================

// Основные переменные
let allProducts = [];
let allCategories = [];
let importedData = [];

// Категории магазина
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
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
        window.location.href = 'login-admin.html';
        return false;
    }
    return true;
}

// Загрузка данных
function loadData() {
    console.log('📥 Загрузка данных...');
    
    // Загружаем товары из localStorage
    const savedProducts = localStorage.getItem('shopProducts');
    if (savedProducts) {
        allProducts = JSON.parse(savedProducts);
        console.log(`📦 Загружено ${allProducts.length} товаров`);
    } else {
        // Если нет товаров, пробуем импортировать из CSV
        console.log('Товары не найдены. Готов к импорту из CSV.');
    }
    
    // Загружаем категории
    allCategories = [...shopCategories];
    console.log(`🏷️ Загружено ${allCategories.length} категорий`);
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
    
    // Настраиваем обработчики событий
    setupEventListeners();
}

// ============================================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ============================================

// Обновление дашборда
function updateDashboard() {
    document.getElementById('productsCount').textContent = allProducts.length;
    document.getElementById('categoriesCount').textContent = allCategories.length;
    document.getElementById('ordersCount').textContent = '0';
    document.getElementById('revenueAmount').textContent = '0 ₽';
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
        const category = allCategories.find(c => c.name === product.category) || {};
        return `
            <tr>
                <td>${product.id || index + 1}</td>
                <td>
                    <strong>${product.name}</strong>
                    ${product.brand ? `<br><small style="color: var(--gray);">${product.brand}</small>` : ''}
                </td>
                <td>
                    <span class="category-badge" style="background: linear-gradient(135deg, ${category.color1 || '#667eea'}, ${category.color2 || '#764ba2'}); color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">
                        ${product.category}
                    </span>
                </td>
                <td><strong>${formatPrice(product.price)}</strong></td>
                <td>
                    <span class="badge ${product.quantity > 0 ? 'bg-success' : 'bg-danger'}">
                        ${product.quantity || 0} шт.
                    </span>
                </td>
                <td>
                    <span class="badge ${getStatusClass(product.status)}">
                        ${getStatusText(product.status)}
                    </span>
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

// Обновление списка категорий
function updateCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = allCategories.map(category => {
        const productCount = allProducts.filter(p => p.category === category.name).length;
        return `
            <div class="category-preview" style="background: linear-gradient(135deg, ${category.color1}, ${category.color2})">
                <div class="category-actions">
                    <button class="btn-icon btn-edit" style="background: white; width: 30px; height: 30px;" 
                            onclick="editCategory(${category.id})" title="Редактировать">
                        <i class="fas fa-edit" style="font-size: 12px; color: #1976d2;"></i>
                    </button>
                </div>
                <div style="font-size: 2rem; margin-bottom: 10px;">${category.icon}</div>
                <h4 style="margin: 0 0 5px 0;">${category.name}</h4>
                <small style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px;">
                    ${category.code}
                </small>
                <div style="margin-top: 10px; font-size: 12px; background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 10px;">
                    ${productCount} товаров
                </div>
            </div>
        `;
    }).join('');
}

// Обновление select категорий
function updateCategorySelect() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите категорию</option>' + 
        allCategories.map(cat => `<option value="${cat.name}">${cat.name} (${cat.code})</option>`).join('');
}

// ============================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================

function setupEventListeners() {
    console.log('🔗 Настройка обработчиков событий...');
    
    // Выход из системы
    document.querySelectorAll('.logout-btn').forEach(btn => {
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
    
    // Импорт файлов
    const importFileInput = document.getElementById('importFile');
    if (importFileInput) {
        importFileInput.addEventListener('change', handleFileSelect);
    }
    
    // Поиск товаров
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', searchProductsAdmin);
    }
    
    console.log('✅ Обработчики настроены');
}

// ============================================
// УПРАВЛЕНИЕ ТОВАРАМИ
// ============================================

// Сохранение товара
function saveProduct() {
    const form = document.getElementById('addProductForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const productId = document.getElementById('productId')?.value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value) || 0;
    const status = document.getElementById('productStatus').value;
    const description = document.getElementById('productDescription').value.trim();
    const image = document.getElementById('productImage').value.trim();
    
    if (!name || !category || isNaN(price)) {
        showNotification('❌ Заполните обязательные поля', 'error');
        return;
    }
    
    const productData = {
        id: productId || Date.now(),
        код_товара: `PROD${Date.now().toString().slice(-6)}`,
        категория: category,
        название: name,
        бренд: '',
        описание: description,
        цена_закупки: price * 0.7,
        цена_продажи: price,
        количество: quantity,
        статус: status === 'in_stock' ? 'да' : 'нет',
        изображение: image || 'https://via.placeholder.com/300x200/667eea/ffffff?text=PRODTORG',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (productId) {
        // Редактирование существующего товара
        const index = allProducts.findIndex(p => p.id == productId);
        if (index !== -1) {
            allProducts[index] = { ...allProducts[index], ...productData };
            showNotification('✅ Товар обновлен', 'success');
        }
    } else {
        // Добавление нового товара
        allProducts.unshift(productData);
        showNotification('✅ Товар добавлен', 'success');
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('shopProducts', JSON.stringify(allProducts));
    
    // Обновляем интерфейс
    updateProductsTable();
    updateDashboard();
    
    // Закрываем модальное окно
    closeModal('addProductModal');
    
    // Очищаем форму
    form.reset();
}

// Редактирование товара
function editProduct(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        showNotification('❌ Товар не найден', 'error');
        return;
    }
    
    document.getElementById('productModalLabel').textContent = 'Редактировать товар';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.название || product.name;
    document.getElementById('productCategory').value = product.категория || product.category;
    document.getElementById('productPrice').value = product.цена_продажи || product.price;
    document.getElementById('productQuantity').value = product.количество || product.quantity || 0;
    document.getElementById('productStatus').value = product.статус === 'да' ? 'in_stock' : 'out_of_stock';
    document.getElementById('productDescription').value = product.описание || product.description || '';
    document.getElementById('productImage').value = product.изображение || product.image || '';
    
    updateCategorySelect();
    showModal('addProductModal');
}

// Удаление товара
function deleteProduct(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
        return;
    }
    
    allProducts = allProducts.filter(p => p.id != productId);
    localStorage.setItem('shopProducts', JSON.stringify(allProducts));
    
    updateProductsTable();
    updateDashboard();
    showNotification('🗑️ Товар удален', 'success');
}

// Поиск товаров
function searchProductsAdmin() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const container = document.getElementById('productsList');
    
    if (!searchTerm) {
        updateProductsTable();
        return;
    }
    
    const filtered = allProducts.filter(product => 
        (product.название && product.название.toLowerCase().includes(searchTerm)) ||
        (product.name && product.name.toLowerCase().includes(searchTerm)) ||
        (product.категория && product.категория.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm)) ||
        (product.описание && product.описание.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Товары не найдены<br>
                    <small style="font-size: 12px;">Попробуйте другой поисковый запрос</small>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = filtered.map((product, index) => {
        const category = allCategories.find(c => c.name === (product.категория || product.category)) || {};
        return `
            <tr>
                <td>${product.id || index + 1}</td>
                <td><strong>${product.название || product.name}</strong></td>
                <td>
                    <span class="category-badge" style="background: linear-gradient(135deg, ${category.color1 || '#667eea'}, ${category.color2 || '#764ba2'}); color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">
                        ${product.категория || product.category}
                    </span>
                </td>
                <td><strong>${formatPrice(product.цена_продажи || product.price)}</strong></td>
                <td>
                    <span class="badge ${(product.количество || product.quantity) > 0 ? 'bg-success' : 'bg-danger'}">
                        ${product.количество || product.quantity || 0} шт.
                    </span>
                </td>
                <td>
                    <span class="badge ${getStatusClass(product.статус || product.status)}">
                        ${getStatusText(product.статус || product.status)}
                    </span>
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

// ============================================
// УПРАВЛЕНИЕ КАТЕГОРИЯМИ
// ============================================

// Сохранение категории
function saveCategory() {
    const form = document.getElementById('addCategoryForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const name = document.getElementById('categoryName').value.trim();
    const code = document.getElementById('categoryCode').value.trim().toUpperCase();
    const icon = document.getElementById('categoryIcon').value.trim();
    const color1 = document.getElementById('categoryColor1').value;
    const color2 = document.getElementById('categoryColor2').value;
    
    if (!name || !code) {
        showNotification('❌ Заполните обязательные поля', 'error');
        return;
    }
    
    const categoryData = {
        id: Date.now(),
        name: name,
        code: code,
        icon: icon || '🏷️',
        color1: color1,
        color2: color2,
        description: '',
        createdAt: new Date().toISOString()
    };
    
    allCategories.push(categoryData);
    
    updateCategoriesList();
    updateCategorySelect();
    updateDashboard();
    
    closeModal('addCategoryModal');
    form.reset();
    
    showNotification('✅ Категория добавлена', 'success');
}

// Редактирование категории
function editCategory(categoryId) {
    const category = allCategories.find(c => c.id === categoryId);
    if (!category) {
        showNotification('❌ Категория не найдена', 'error');
        return;
    }
    
    showNotification('✏️ Редактирование категории - в разработке', 'info');
}

// ============================================
// ИМПОРТ ИЗ CSV
// ============================================

// Обработка выбора файла
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`📄 Выбран файл: ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            importedData = parseCSV(csvText);
            
            console.log(`✅ Прочитано ${importedData.length} записей из CSV`);
            
            // Показываем превью
            showImportPreview(importedData);
            
        } catch (error) {
            console.error('❌ Ошибка при чтении CSV:', error);
            showNotification('❌ Ошибка при чтении файла', 'error');
        }
    };
    
    reader.readAsText(file, 'UTF-8');
}

// Парсинг CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const item = {};
        
        headers.forEach((header, index) => {
            item[header] = values[index] || '';
        });
        
        data.push(item);
    }
    
    return data;
}

// Показ превью импорта
function showImportPreview(data) {
    const previewContainer = document.getElementById('importPreview');
    const previewTable = document.getElementById('previewTable');
    
    if (!previewContainer || !previewTable || data.length === 0) {
        showNotification('❌ Нет данных для импорта', 'error');
        return;
    }
    
    // Показываем первые 5 записей
    const previewData = data.slice(0, 5);
    
    previewTable.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    ${Object.keys(previewData[0]).map(key => `
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid var(--border);">${key}</th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                ${previewData.map(item => `
                    <tr>
                        ${Object.values(item).map(value => `
                            <td style="padding: 8px; border-bottom: 1px solid var(--border);">${value}</td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${data.length > 5 ? `<p style="color: var(--gray); font-size: 12px; margin-top: 10px;">... и еще ${data.length - 5} записей</p>` : ''}
    `;
    
    previewContainer.style.display = 'block';
    showNotification(`📊 Найдено ${data.length} записей для импорта`, 'info');
}

// Обработка импорта
function processImport() {
    if (!importedData || importedData.length === 0) {
        showNotification('❌ Нет данных для импорта', 'error');
        return;
    }
    
    if (!confirm(`Импортировать ${importedData.length} товаров?`)) {
        return;
    }
    
    console.log('🔄 Начинаем импорт товаров...');
    
    // Преобразуем данные CSV в формат магазина
    const convertedProducts = importedData.map((item, index) => {
        // Определяем статус
        let status = 'in_stock';
        if (item.статус === 'нет' || item.количество === '0' || item.количество === 0) {
            status = 'out_of_stock';
        }
        
        // Определяем количество
        let quantity = parseInt(item.количество) || 0;
        if (item.статус === 'да' && quantity === 0) {
            quantity = 10; // Значение по умолчанию
        }
        
        // Определяем цену
        let price = parseFloat(item.цена_продажи) || 0;
        if (price === 0) {
            price = parseFloat(item.цена_закупки) * 1.3 || 1000; // Наценка 30%
        }
        
        // Определяем категорию
        let category = item.категория || 'Бытовая химия';
        
        return {
            id: Date.now() + index,
            код_товара: item.код_товара || `IMP${Date.now().toString().slice(-6)}${index}`,
            категория: category,
            название: item.название || item.name || 'Без названия',
            бренд: item.бренд || '',
            описание: item.описание || item.description || '',
            цена_закупки: parseFloat(item.цена_закупки) || price * 0.7,
            цена_продажи: price,
            количество: quantity,
            статус: status === 'in_stock' ? 'да' : 'нет',
            изображение: item.изображение || item.image || `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(category)}`,
            imported: true,
            importedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
    });
    
    // Добавляем импортированные товары
    allProducts = [...convertedProducts, ...allProducts.filter(p => !p.imported)];
    
    // Сохраняем в localStorage
    localStorage.setItem('shopProducts', JSON.stringify(allProducts));
    
    // Обновляем интерфейс
    updateProductsTable();
    updateDashboard();
    updateCategorySelect();
    
    // Скрываем превью
    document.getElementById('importPreview').style.display = 'none';
    
    // Очищаем поле выбора файла
    const fileInput = document.getElementById('importFile');
    if (fileInput) fileInput.value = '';
    
    showNotification(`✅ Успешно импортировано ${convertedProducts.length} товаров`, 'success');
    closeModal('importModal');
}

// Очистка импорта
function clearImport() {
    importedData = [];
    const previewContainer = document.getElementById('importPreview');
    if (previewContainer) previewContainer.style.display = 'none';
    
    const fileInput = document.getElementById('importFile');
    if (fileInput) fileInput.value = '';
}

// ============================================
// ЭКСПОРТ ДАННЫХ
// ============================================

// Экспорт данных в JSON
function exportData() {
    if (allProducts.length === 0) {
        showNotification('❌ Нет данных для экспорта', 'error');
        return;
    }
    
    const data = {
        products: allProducts,
        categories: allCategories,
        exportDate: new Date().toISOString(),
        totalProducts: allProducts.length,
        totalCategories: allCategories.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_prodtorg_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification(`📤 Экспортировано ${allProducts.length} товаров`, 'success');
}

// ============================================
// НАСТРОЙКИ СИСТЕМЫ
// ============================================

// Сохранение настроек системы
function saveSystemSettings() {
    const login = document.getElementById('adminLogin').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const phone = document.getElementById('adminPhone').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    
    const settings = {
        adminLogin: login || 'admin',
        adminPhone: phone || '+7 (923) 753-36-06',
        adminEmail: email || 'prodtorg.barnaul@gmail.com',
        updatedAt: new Date().toISOString()
    };
    
    // Если указан новый пароль
    if (password) {
        settings.adminPassword = password;
    }
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('✅ Настройки сохранены', 'success');
}

// Сброс всех данных
function resetData() {
    if (!confirm('⚠️ ВНИМАНИЕ! Все данные будут удалены без возможности восстановления. Продолжить?')) {
        return;
    }
    
    localStorage.removeItem('shopProducts');
    localStorage.removeItem('cart');
    localStorage.removeItem('adminSettings');
    
    allProducts = [];
    
    updateProductsTable();
    updateDashboard();
    
    showNotification('🗑️ Все данные сброшены', 'info');
    
    // Через 2 секунды перезагружаем страницу
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// Сохранение настроек дизайна
function saveDesignSettings() {
    const storeName = document.getElementById('storeName').value.trim();
    const primaryColor = document.getElementById('primaryColor').value;
    const siteBackground = document.getElementById('siteBackground').value;
    
    const designSettings = {
        storeName: storeName || 'ДЛЯ СВОИХ',
        primaryColor: primaryColor,
        siteBackground: siteBackground,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('designSettings', JSON.stringify(designSettings));
    showNotification('🎨 Настройки дизайна сохранены', 'success');
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

// Получение класса статуса
function getStatusClass(status) {
    if (status === 'да' || status === 'in_stock' || status === 'active') {
        return 'bg-success';
    } else if (status === 'нет' || status === 'out_of_stock') {
        return 'bg-danger';
    } else {
        return 'bg-warning';
    }
}

// Получение текста статуса
function getStatusText(status) {
    if (status === 'да' || status === 'in_stock' || status === 'active') {
        return 'В наличии';
    } else if (status === 'нет' || status === 'out_of_stock') {
        return 'Нет в наличии';
    } else {
        return status || 'Не указан';
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
               style="color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// НАВИГАЦИЯ И МОДАЛЬНЫЕ ОКНА
// ============================================

// Показать секцию
function showSection(sectionId) {
    document.querySelectorAll('[id$="-section"]').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    const titles = {
        'dashboard': 'Дашборд',
        'products': 'Товары',
        'categories': 'Категории',
        'orders': 'Заказы',
        'design': 'Дизайн',
        'settings': 'Настройки',
        'users': 'Пользователи'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionId] || sectionId;
    }
    
    // Обновляем активное меню
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.admin-nav a[onclick*="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Загружаем данные для секции
    if (sectionId === 'products') {
        updateProductsTable();
    } else if (sectionId === 'categories') {
        updateCategoriesList();
    } else if (sectionId === 'dashboard') {
        updateDashboard();
    }
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

// Выход из системы
function logoutAdmin() {
    localStorage.removeItem('isAdmin');
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

// Инициализация при загрузке
window.onload = function() {
    if (document.readyState === 'complete') {
        console.log('🌐 Страница загружена');
    }
};
