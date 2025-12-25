// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let adminProducts = [];
let adminCategories = [];
let adminOrders = [];
let importData = [];

// ========== ИНИЦИАЛИЗАЦИЯ АДМИНКИ ==========
function initAdmin() {
    loadAdminData();
    updateDashboardStats();
    loadProductsTable();
    loadCategoriesTable();
    console.log('✅ Админ-панель загружена');
}

function loadAdminData() {
    // Загружаем товары
    adminProducts = JSON.parse(localStorage.getItem('products')) || [];
    
    // Загружаем категории
    adminCategories = JSON.parse(localStorage.getItem('categoriesData')) || [
        { name: 'Бытовая химия', code: 'BH', icon: '🧴', color1: '#667eea', color2: '#764ba2' },
        { name: 'Постельное белье', code: 'PB', icon: '🛏️', color1: '#f093fb', color2: '#f5576c' },
        { name: 'Рыба и морепродукты', code: 'RB', icon: '🐟', color1: '#4facfe', color2: '#00f2fe' },
        { name: 'Мясо и птица', code: 'MT', icon: '🍗', color1: '#43e97b', color2: '#38f9d7' },
        { name: 'Кондитерские изделия', code: 'KD', icon: '🍰', color1: '#fa709a', color2: '#fee140' },
        { name: 'Молочные продукты', code: 'ML', icon: '🥛', color1: '#30cfd0', color2: '#330867' },
        { name: 'Мангальные зоны и мангалы', code: 'MM', icon: '🔥', color1: '#ffecd2', color2: '#fcb69f' }
    ];
    
    // Загружаем заказы
    adminOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Сохраняем категории если их нет
    if (!localStorage.getItem('categoriesData')) {
        localStorage.setItem('categoriesData', JSON.stringify(adminCategories));
    }
}

// ========== ОБНОВЛЕНИЕ СТАТИСТИКИ ==========
function updateDashboardStats() {
    const productsCount = document.getElementById('productsCount');
    const categoriesCount = document.getElementById('categoriesCount');
    const ordersCount = document.getElementById('ordersCount');
    const revenueAmount = document.getElementById('revenueAmount');
    const recentOrders = document.getElementById('recentOrders');
    
    if (productsCount) productsCount.textContent = adminProducts.length;
    if (categoriesCount) categoriesCount.textContent = adminCategories.length;
    if (ordersCount) ordersCount.textContent = adminOrders.length;
    
    // Считаем выручку
    const revenue = adminOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    if (revenueAmount) revenueAmount.textContent = revenue.toLocaleString() + ' ₽';
    
    // Показываем последние заказы
    if (recentOrders) {
        if (adminOrders.length === 0) {
            recentOrders.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Заказов нет</p>';
        } else {
            const lastOrders = adminOrders.slice(-5).reverse();
            recentOrders.innerHTML = lastOrders.map(order => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid var(--border);">
                    <div>
                        <strong>Заказ #${order.id}</strong>
                        <div style="font-size: 12px; color: var(--gray);">${formatDate(order.date)}</div>
                    </div>
                    <div>
                        <span style="font-weight: bold; color: var(--primary);">${(order.total || 0).toLocaleString()} ₽</span>
                        <span style="background: #e8f5e9; color: #388e3c; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px;">
                            ${order.status || 'Новый'}
                        </span>
                    </div>
                </div>
            `).join('');
        }
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========== УПРАВЛЕНИЕ ТОВАРАМИ ==========
function loadProductsTable() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    if (adminProducts.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--gray); padding: 40px;">
                    Товаров нет. Добавьте первый товар!
                </td>
            </tr>
        `;
        return;
    }
    
    productsList.innerHTML = adminProducts.map((product, index) => `
        <tr>
            <td>${product.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${product.image || 'https://via.placeholder.com/40x40/ecf0f1/7f8c8d?text=Нет'}" 
                         alt="${product.name}" 
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                    <div>
                        <strong>${product.name}</strong>
                        ${product.description ? `<div style="font-size: 12px; color: var(--gray);">${product.description.substring(0, 50)}...</div>` : ''}
                    </div>
                </div>
            </td>
            <td>
                <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                    ${product.category}
                </span>
            </td>
            <td><strong>${product.price.toLocaleString()} ₽</strong></td>
            <td>${product.quantity || 0} шт.</td>
            <td>
                <span class="status-badge ${product.status || 'in_stock'}">
                    ${getStatusText(product.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editProduct(${index})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${index})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon btn-view" onclick="viewProduct(${index})" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusText(status) {
    switch(status) {
        case 'in_stock': return 'В наличии';
        case 'out_of_stock': return 'Нет в наличии';
        case 'pre_order': return 'Под заказ';
        default: return 'В наличии';
    }
}

function searchProductsAdmin() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filtered = adminProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
    );
    
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    if (filtered.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--gray); padding: 40px;">
                    Товары не найдены
                </td>
            </tr>
        `;
        return;
    }
    
    productsList.innerHTML = filtered.map((product, index) => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toLocaleString()} ₽</td>
            <td>${product.quantity || 0} шт.</td>
            <td>${getStatusText(product.status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editProduct(${adminProducts.indexOf(product)})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${adminProducts.indexOf(product)})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value) || 0;
    const status = document.getElementById('productStatus').value;
    const description = document.getElementById('productDescription').value.trim();
    const image = document.getElementById('productImage').value.trim();
    
    // Проверка данных
    if (!name || !category || !price) {
        showAdminNotification('❌ Заполните обязательные поля', 'error');
        return;
    }
    
    // Создаем новый товар
    const newProduct = {
        id: Date.now(),
        name: name,
        category: category,
        price: price,
        quantity: quantity,
        status: status,
        description: description || 'Описание товара',
        image: image || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'
    };
    
    // Добавляем в массив
    adminProducts.push(newProduct);
    
    // Сохраняем в localStorage
    localStorage.setItem('products', JSON.stringify(adminProducts));
    
    // Обновляем интерфейс
    loadProductsTable();
    updateDashboardStats();
    
    // Закрываем модальное окно
    closeModal('addProductModal');
    
    // Очищаем форму
    document.getElementById('addProductForm').reset();
    
    // Показываем уведомление
    showAdminNotification('✅ Товар успешно добавлен', 'success');
    
    // Обновляем магазин (если он открыт)
    updateShopProducts();
}

function editProduct(index) {
    const product = adminProducts[index];
    if (!product) return;
    
    // Заполняем форму
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity || 0;
    document.getElementById('productStatus').value = product.status || 'in_stock';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image || '';
    
    // Меняем кнопку на "Сохранить изменения"
    const form = document.getElementById('addProductForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Сохранить изменения';
    submitBtn.onclick = function(e) {
        e.preventDefault();
        updateProduct(index);
    };
    
    // Показываем модальное окно
    showModal('addProductModal');
}

function updateProduct(index) {
    const product = adminProducts[index];
    if (!product) return;
    
    // Получаем новые данные
    product.name = document.getElementById('productName').value.trim();
    product.category = document.getElementById('productCategory').value;
    product.price = parseFloat(document.getElementById('productPrice').value);
    product.quantity = parseInt(document.getElementById('productQuantity').value) || 0;
    product.status = document.getElementById('productStatus').value;
    product.description = document.getElementById('productDescription').value.trim();
    product.image = document.getElementById('productImage').value.trim() || product.image;
    
    // Сохраняем
    localStorage.setItem('products', JSON.stringify(adminProducts));
    
    // Обновляем интерфейс
    loadProductsTable();
    updateDashboardStats();
    
    // Закрываем модальное окно
    closeModal('addProductModal');
    
    // Сбрасываем форму
    document.getElementById('addProductForm').reset();
    
    // Восстанавливаем кнопку
    const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
    submitBtn.textContent = 'Сохранить товар';
    submitBtn.onclick = function(e) {
        e.preventDefault();
        saveProduct();
    };
    
    showAdminNotification('✅ Товар обновлен', 'success');
    updateShopProducts();
}

function deleteProduct(index) {
    if (!confirm('Удалить товар?')) return;
    
    adminProducts.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(adminProducts));
    
    loadProductsTable();
    updateDashboardStats();
    showAdminNotification('Товар удален', 'info');
    updateShopProducts();
}

function viewProduct(index) {
    const product = adminProducts[index];
    if (!product) return;
    
    alert(`
        📦 Просмотр товара:
        
        Название: ${product.name}
        Категория: ${product.category}
        Цена: ${product.price.toLocaleString()} ₽
        Количество: ${product.quantity || 0} шт.
        Статус: ${getStatusText(product.status)}
        
        Описание:
        ${product.description || 'Нет описания'}
        
        Изображение: ${product.image || 'Нет изображения'}
    `);
}

// ========== УПРАВЛЕНИЕ КАТЕГОРИЯМИ ==========
function loadCategoriesTable() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;
    
    categoriesList.innerHTML = adminCategories.map((category, index) => `
        <div class="category-preview" style="background: linear-gradient(135deg, ${category.color1}, ${category.color2})">
            <div class="category-actions">
                <button class="btn-icon btn-edit" onclick="editCategory(${index})" style="background: rgba(255,255,255,0.2);">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div style="font-size: 2rem; margin-bottom: 10px;">${category.icon || '📦'}</div>
            <div style="font-weight: bold; margin-bottom: 5px;">${category.name}</div>
            <div style="font-size: 12px; background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 10px;">
                Код: ${category.code}
            </div>
        </div>
    `).join('');
}

function saveCategory() {
    const name = document.getElementById('categoryName').value.trim();
    const code = document.getElementById('categoryCode').value.trim().toUpperCase();
    const icon = document.getElementById('categoryIcon').value.trim();
    const color1 = document.getElementById('categoryColor1').value;
    const color2 = document.getElementById('categoryColor2').value;
    
    // Проверка данных
    if (!name || !code) {
        showAdminNotification('❌ Заполните название и код категории', 'error');
        return;
    }
    
    // Проверяем уникальность кода
    const existingCategory = adminCategories.find(cat => cat.code === code);
    if (existingCategory) {
        showAdminNotification('❌ Категория с таким кодом уже существует', 'error');
        return;
    }
    
    // Создаем новую категорию
    const newCategory = {
        name: name,
        code: code,
        icon: icon || '📦',
        color1: color1,
        color2: color2,
        backgroundType: 'gradient'
    };
    
    // Добавляем в массив
    adminCategories.push(newCategory);
    
    // Сохраняем в localStorage
    localStorage.setItem('categoriesData', JSON.stringify(adminCategories));
    
    // Обновляем интерфейс
    loadCategoriesTable();
    updateDashboardStats();
    updateCategorySelect();
    
    // Закрываем модальное окно
    closeModal('addCategoryModal');
    
    // Очищаем форму
    document.getElementById('addCategoryForm').reset();
    
    // Показываем уведомление
    showAdminNotification('✅ Категория успешно добавлена', 'success');
    
    // Обновляем магазин
    updateShopCategories();
}

function editCategory(index) {
    const category = adminCategories[index];
    if (!category) return;
    
    // Заполняем форму
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryCode').value = category.code;
    document.getElementById('categoryIcon').value = category.icon || '';
    document.getElementById('categoryColor1').value = category.color1 || '#667eea';
    document.getElementById('categoryColor2').value = category.color2 || '#764ba2';
    
    // Меняем кнопку на "Сохранить изменения"
    const form = document.getElementById('addCategoryForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Сохранить изменения';
    submitBtn.onclick = function(e) {
        e.preventDefault();
        updateCategory(index);
    };
    
    // Показываем модальное окно
    showModal('addCategoryModal');
}

function updateCategory(index) {
    const category = adminCategories[index];
    if (!category) return;
    
    // Получаем новые данные
    category.name = document.getElementById('categoryName').value.trim();
    category.code = document.getElementById('categoryCode').value.trim().toUpperCase();
    category.icon = document.getElementById('categoryIcon').value.trim() || '📦';
    category.color1 = document.getElementById('categoryColor1').value;
    category.color2 = document.getElementById('categoryColor2').value;
    
    // Сохраняем
    localStorage.setItem('categoriesData', JSON.stringify(adminCategories));
    
    // Обновляем интерфейс
    loadCategoriesTable();
    updateCategorySelect();
    
    // Закрываем модальное окно
    closeModal('addCategoryModal');
    
    // Сбрасываем форму
    document.getElementById('addCategoryForm').reset();
    
    // Восстанавливаем кнопку
    const submitBtn = document.querySelector('#addCategoryForm button[type="submit"]');
    submitBtn.textContent = 'Сохранить категорию';
    submitBtn.onclick = function(e) {
        e.preventDefault();
        saveCategory();
    };
    
    showAdminNotification('✅ Категория обновлена', 'success');
    updateShopCategories();
}

function updateCategorySelect() {
    const select = document.getElementById('productCategory');
    if (select) {
        select.innerHTML = '<option value="">Выберите категорию</option>' + 
            adminCategories.map(cat => `<option value="${cat.name}">${cat.name} (${cat.code})</option>`).join('');
    }
}

// ========== ИМПОРТ ТОВАРОВ ==========
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length === 0) {
                showAdminNotification('❌ Файл не содержит данных', 'error');
                return;
            }
            
            importData = jsonData;
            showImportPreview();
            
        } catch (error) {
            // Пробуем как CSV
            const csvText = e.target.result;
            importCSVData(csvText);
        }
    };
    
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function importCSVData(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    importData = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, index) => {
            if (values[index]) {
                row[header] = values[index];
            }
        });
        
        if (row['название'] || row['name']) {
            importData.push(row);
        }
    }
    
    showImportPreview();
}

function showImportPreview() {
    const previewTable = document.getElementById('previewTable');
    const importPreview = document.getElementById('importPreview');
    
    if (!previewTable || !importPreview) return;
    
    if (importData.length === 0) {
        previewTable.innerHTML = '<p>Нет данных для импорта</p>';
        return;
    }
    
    const headers = Object.keys(importData[0]);
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr>' + headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; background: #f8f9fa;">${h}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    
    importData.slice(0, 5).forEach(row => {
        html += '<tr>' + headers.map(h => `<td style="border: 1px solid #ddd; padding: 8px;">${row[h] || ''}</td>`).join('') + '</tr>';
    });
    
    if (importData.length > 5) {
        html += `<tr><td colspan="${headers.length}" style="text-align: center; color: var(--gray);">... и еще ${importData.length - 5} строк</td></tr>`;
    }
    
    html += '</tbody></table>';
    previewTable.innerHTML = html;
    importPreview.style.display = 'block';
    
    showAdminNotification(`✅ Загружено ${importData.length} товаров для импорта`, 'success');
}

function clearImport() {
    importData = [];
    document.getElementById('importFile').value = '';
    document.getElementById('importPreview').style.display = 'none';
    closeModal('importModal');
}

function processImport() {
    if (importData.length === 0) {
        showAdminNotification('❌ Нет данных для импорта', 'error');
        return;
    }
    
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    importData.forEach((row, index) => {
        try {
            // Преобразуем заголовки
            const productData = {
                name: row['название'] || row['name'] || row['Название'] || `Товар ${index + 1}`,
                category: row['категория'] || row['category'] || row['Категория'] || 'Без категории',
                price: parseFloat(row['цена'] || row['price'] || row['Цена'] || 0),
                quantity: parseInt(row['количество'] || row['quantity'] || row['Количество'] || 0),
                status: row['статус'] || row['status'] || row['Статус'] || 'in_stock',
                description: row['описание'] || row['description'] || row['Описание'] || '',
                image: row['изображение'] || row['image'] || row['Изображение'] || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'
            };
            
            // Проверяем обязательные поля
            if (!productData.name || !productData.category || productData.price <= 0) {
                errors++;
                return;
            }
            
            // Генерируем ID
            productData.id = Date.now() + index;
            
            // Проверяем, есть ли такой товар
            const existingIndex = adminProducts.findIndex(p => 
                p.name.toLowerCase() === productData.name.toLowerCase() && 
                p.category.toLowerCase() === productData.category.toLowerCase()
            );
            
            if (existingIndex !== -1) {
                // Обновляем существующий товар
                adminProducts[existingIndex] = { ...adminProducts[existingIndex], ...productData };
                updated++;
            } else {
                // Добавляем новый товар
                adminProducts.push(productData);
                imported++;
            }
            
        } catch (error) {
            errors++;
        }
    });
    
    // Сохраняем в localStorage
    localStorage.setItem('products', JSON.stringify(adminProducts));
    
    // Обновляем интерфейс
    loadProductsTable();
    updateDashboardStats();
    
    // Показываем результат
    showAdminNotification(`
        ✅ Импорт завершен!<br>
        📥 Добавлено: ${imported}<br>
        🔄 Обновлено: ${updated}<br>
        ❌ Ошибок: ${errors}
    `, 'success');
    
    // Закрываем модальное окно
    clearImport();
    closeModal('importModal');
    
    // Обновляем магазин
    updateShopProducts();
}

// ========== ЭКСПОРТ ДАННЫХ ==========
function exportData() {
    // Создаем книгу Excel
    const wb = XLSX.utils.book_new();
    
    // Лист с товарами
    const productsWS = XLSX.utils.json_to_sheet(adminProducts.map(p => ({
        'ID': p.id,
        'Название': p.name,
        'Категория': p.category,
        'Цена': p.price,
        'Количество': p.quantity || 0,
        'Статус': getStatusText(p.status),
        'Описание': p.description || '',
        'Изображение': p.image || ''
    })));
    XLSX.utils.book_append_sheet(wb, productsWS, 'Товары');
    
    // Лист с категориями
    const categoriesWS = XLSX.utils.json_to_sheet(adminCategories.map(c => ({
        'Название': c.name,
        'Код': c.code,
        'Иконка': c.icon || '',
        'Цвет 1': c.color1,
        'Цвет 2': c.color2
    })));
    XLSX.utils.book_append_sheet(wb, categoriesWS, 'Категории');
    
    // Лист с заказами
    const ordersWS = XLSX.utils.json_to_sheet(adminOrders.map(o => ({
        'ID заказа': o.id,
        'Покупатель': o.user?.name || 'Гость',
        'Телефон': o.user?.phone || '',
        'Товары': o.items?.map(i => i.name).join(', ') || '',
        'Количество товаров': o.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0,
        'Сумма': o.total || 0,
        'Дата': formatDate(o.date),
        'Статус': o.status || 'Новый'
    })));
    XLSX.utils.book_append_sheet(wb, ordersWS, 'Заказы');
    
    // Скачиваем файл
    const fileName = `export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showAdminNotification(`✅ Данные экспортированы в ${fileName}`, 'success');
}

// ========== НАСТРОЙКИ ДИЗАЙНА ==========
function saveDesignSettings() {
    const storeName = document.getElementById('storeName').value;
    const primaryColor = document.getElementById('primaryColor').value;
    const siteBackground = document.getElementById('siteBackground').value;
    
    // Сохраняем настройки
    const settings = {
        logoText: storeName,
        headerColor: primaryColor,
        backgroundType: siteBackground,
        color1: primaryColor,
        color2: darkenColor(primaryColor, 20)
    };
    
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    
    showAdminNotification('✅ Настройки дизайна сохранены', 'success');
    updateShopSettings();
}

function darkenColor(color, percent) {
    // Простая функция для затемнения цвета
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return "#" + (
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

// ========== СИСТЕМНЫЕ НАСТРОЙКИ ==========
function saveSystemSettings() {
    const login = document.getElementById('adminLogin').value;
    const password = document.getElementById('adminPassword').value;
    const phone = document.getElementById('adminPhone').value;
    const email = document.getElementById('adminEmail').value;
    
    // Сохраняем учетные данные только если пароль введен
    if (password) {
        const credentials = { login, password };
        localStorage.setItem('adminCredentials', JSON.stringify(credentials));
    }
    
    // Сохраняем контакты
    const contacts = { phone, email };
    localStorage.setItem('adminContacts', JSON.stringify(contacts));
    
    showAdminNotification('✅ Системные настройки сохранены', 'success');
}

function resetData() {
    if (!confirm('ВНИМАНИЕ! Это действие удалит ВСЕ данные: товары, категории, заказы. Продолжить?')) {
        return;
    }
    
    // Очищаем все данные
    localStorage.removeItem('products');
    localStorage.removeItem('cart');
    localStorage.removeItem('orders');
    localStorage.removeItem('categoriesData');
    
    // Перезагружаем страницу
    location.reload();
}

// ========== СИНХРОНИЗАЦИЯ С МАГАЗИНОМ ==========
function updateShopProducts() {
    // Эта функция обновляет данные в магазине
    // В реальном приложении здесь может быть событие или обновление через BroadcastChannel
    console.log('✅ Данные товаров обновлены для магазина');
}

function updateShopCategories() {
    console.log('✅ Данные категорий обновлены для магазина');
}

function updateShopSettings() {
    console.log('✅ Настройки дизайна обновлены для магазина');
}

// ========== УВЕДОМЛЕНИЯ ==========
function showAdminNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    // Цвета в зависимости от типа
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Добавляем стили для анимации
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== ГЛОБАЛЬНЫЙ ЭКСПОРТ ФУНКЦИЙ ==========
window.initAdmin = initAdmin;
window.saveProduct = saveProduct;
window.saveCategory = saveCategory;
window.editProduct = editProduct;
window.editCategory = editCategory;
window.updateProduct = updateProduct;
window.updateCategory = updateCategory;
window.deleteProduct = deleteProduct;
window.searchProductsAdmin = searchProductsAdmin;
window.handleFileSelect = handleFileSelect;
window.processImport = processImport;
window.clearImport = clearImport;
window.exportData = exportData;
window.saveDesignSettings = saveDesignSettings;
window.saveSystemSettings = saveSystemSettings;
window.resetData = resetData;
    localStorage.removeItem('isAdmin');
    window.location.href = 'login-admin.html';
};

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}
