// script.js - Все скрипты магазина

// ==================== ОСНОВНЫЕ ДАННЫЕ ====================
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [];
let categoriesData = JSON.parse(localStorage.getItem('categoriesData')) || [];

let siteSettings = JSON.parse(localStorage.getItem('siteSettings')) || {
    backgroundType: 'gradient',
    backgroundImage: '',
    headerColor: '#2c5aa0',
    logoText: 'ДЛЯ СВОИХ'
};

// ==================== ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ФИЛЬТРА ====================
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Собираем все уникальные категории из товаров
    const categoriesFromProducts = [...new Set(products.map(p => p.category))];
    
    // Собираем все категории из настроек категорий
    const categoriesFromSettings = categoriesData.map(cat => cat.name);
    
    // Объединяем и убираем дубликаты
    const allCategories = [...new Set([...categoriesFromProducts, ...categoriesFromSettings])];
    
    categoryFilter.innerHTML = '<option value="">Все категории</option>' +
        allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// ==================== ИМПОРТ ИЗ EXCEL ====================
function importExcel(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                showNotification('❌ Файл не содержит данных');
                return;
            }
            
            let importedCount = 0;
            let updatedCount = 0;
            let errorCount = 0;
            
            jsonData.forEach((row, index) => {
                try {
                    const headers = Object.keys(row);
                    const headerMapping = {
                        'код_товара': 'id',
                        'категория': 'category',
                        'название': 'name',
                        'бренд': 'brand', 
                        'описание': 'description',
                        'цена_закупки': 'purchase_price',
                        'цена_продажи': 'sale_price',
                        'цена': 'price',
                        'количество': 'quantity',
                        'статус': 'status',
                        'ссылка_изображение': 'image_url',
                        'изображение': 'image'
                    };
                    
                    const productData = {};
                    headers.forEach(header => {
                        const cleanHeader = header.trim().toLowerCase();
                        const mappedHeader = headerMapping[cleanHeader] || cleanHeader;
                        productData[mappedHeader] = row[header];
                    });
                    
                    if (!productData.name || !productData.category) {
                        errorCount++;
                        return;
                    }
                    
                    let productId;
                    if (productData.id && productData.id.toString().startsWith('PROD-')) {
                        productId = parseInt(productData.id.toString().replace('PROD-', '')) || Date.now() + index;
                    } else {
                        productId = Date.now() + index;
                    }
                    
                    const price = productData.price || productData.sale_price || 0;
                    const quantity = productData.quantity || 0;
                    
                    const newProduct = {
                        id: productId,
                        name: productData.name.toString(),
                        category: productData.category.toString(),
                        price: parseInt(price) || 0,
                        oldPrice: null,
                        quantity: parseInt(quantity) || 0,
                        status: (productData.status || 'in_stock').toString().toLowerCase(),
                        description: (productData.description || 'Описание товара').toString(),
                        image: (productData.image_url || productData.image || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения').toString()
                    };
                    
                    const existingIndex = products.findIndex(p => p.id === newProduct.id);
                    if (existingIndex !== -1) {
                        products[existingIndex] = newProduct;
                        updatedCount++;
                    } else {
                        products.push(newProduct);
                        importedCount++;
                    }
                    
                } catch (error) {
                    errorCount++;
                }
            });
            
            localStorage.setItem('products', JSON.stringify(products));
            filteredProducts = [...products];
            loadProducts();
            updateCategoryFilter(); // ОБНОВЛЯЕМ ФИЛЬТР ПОСЛЕ ИМПОРТА
            showImportStats(importedCount, updatedCount, errorCount);
            
        } catch (error) {
            showNotification('❌ Ошибка при импорте файла');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function importCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const lines = csvData.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const headerMapping = {
                'код_товара': 'id',
                'категория': 'category',
                'название': 'name',
                'бренд': 'brand', 
                'описание': 'description',
                'цена_закупки': 'purchase_price',
                'цена_продажи': 'sale_price',
                'цена': 'price',
                'количество': 'quantity',
                'статус': 'status',
                'ссылка_изображение': 'image_url',
                'изображение': 'image'
            };
            
            const englishHeaders = headers.map(header => {
                const cleanHeader = header.trim().toLowerCase();
                return headerMapping[cleanHeader] || header;
            });
            
            let importedCount = 0;
            let updatedCount = 0;
            let errorCount = 0;
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                try {
                    const values = lines[i].split(',').map(v => v.trim());
                    if (values.length < englishHeaders.length) {
                        errorCount++;
                        continue;
                    }
                    
                    const productData = {};
                    englishHeaders.forEach((header, index) => {
                        productData[header] = (values[index] || '').trim();
                    });
                    
                    if (!productData.name || !productData.category) {
                        errorCount++;
                        continue;
                    }
                    
                    let productId;
                    if (productData.id && productData.id.startsWith('PROD-')) {
                        productId = parseInt(productData.id.replace('PROD-', '')) || Date.now() + i;
                    } else {
                        productId = Date.now() + i;
                    }
                    
                    const price = productData.price || productData.sale_price || 0;
                    const quantity = productData.quantity || 0;
                    
                    const newProduct = {
                        id: productId,
                        name: productData.name,
                        category: productData.category,
                        price: parseInt(price) || 0,
                        oldPrice: null,
                        quantity: parseInt(quantity) || 0,
                        status: productData.status || 'in_stock',
                        description: productData.description || 'Описание товара',
                        image: productData.image_url || productData.image || 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'
                    };
                    
                    const existingIndex = products.findIndex(p => p.id === newProduct.id);
                    if (existingIndex !== -1) {
                        products[existingIndex] = newProduct;
                        updatedCount++;
                    } else {
                        products.push(newProduct);
                        importedCount++;
                    }
                    
                } catch (error) {
                    errorCount++;
                }
            }
            
            localStorage.setItem('products', JSON.stringify(products));
            filteredProducts = [...products];
            loadProducts();
            updateCategoryFilter(); // ОБНОВЛЯЕМ ФИЛЬТР ПОСЛЕ ИМПОРТА
            showImportStats(importedCount, updatedCount, errorCount);
            
        } catch (error) {
            showNotification('❌ Ошибка при импорте файла');
        }
    };
    
    reader.readAsText(file, 'UTF-8');
}

function importProducts(file) {
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
        importCSV(file);
    } else if (fileExtension === 'xlsx') {
        importExcel(file);
    } else {
        showNotification('❌ Поддерживаются только CSV и XLSX файлы');
    }
}

function showImportStats(imported, updated, errors) {
    const panelContent = document.getElementById('productsPanelContent');
    
    const statsHTML = `
        <div class="import-info">
            <h4>📊 Результаты импорта</h4>
            <p>Импорт товаров завершен успешно!</p>
            <div class="import-stats">
                <div class="stat-item">
                    <div class="stat-value stat-added">${imported}</div>
                    <div>Добавлено</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value stat-updated">${updated}</div>
                    <div>Обновлено</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value stat-errors">${errors}</div>
                    <div>Ошибок</div>
                </div>
            </div>
        </div>
    `;
    
    panelContent.innerHTML = statsHTML + panelContent.innerHTML;
    
    let message = `✅ Импорт завершен! Добавлено: ${imported}, Обновлено: ${updated}`;
    if (errors > 0) {
        message += `, Ошибок: ${errors}`;
    }
    showNotification(message);
}

// ==================== РЕДАКТИРОВАНИЕ САЙТА ====================
function editBackground() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>🎨 Редактирование фона сайта</h3>
        <div class="form-group">
            <label>Тип фона:</label>
            <select class="form-control" id="bgType" onchange="toggleBackgroundOptions()">
                <option value="gradient" ${siteSettings.backgroundType === 'gradient' ? 'selected' : ''}>Градиент</option>
                <option value="solid" ${siteSettings.backgroundType === 'solid' ? 'selected' : ''}>Сплошной цвет</option>
                <option value="image" ${siteSettings.backgroundType === 'image' ? 'selected' : ''}>Изображение</option>
            </select>
        </div>
        
        <div id="gradientOptions" style="${siteSettings.backgroundType !== 'gradient' ? 'display: none;' : ''}">
            <div class="form-group">
                <label>Цвет 1:</label>
                <input type="color" class="color-picker" id="bgColor1" value="${siteSettings.color1 || '#667eea'}">
            </div>
            <div class="form-group">
                <label>Цвет 2:</label>
                <input type="color" class="color-picker" id="bgColor2" value="${siteSettings.color2 || '#764ba2'}">
            </div>
        </div>
        
        <div id="solidOptions" style="${siteSettings.backgroundType !== 'solid' ? 'display: none;' : ''}">
            <div class="form-group">
                <label>Цвет фона:</label>
                <input type="color" class="color-picker" id="solidColor" value="${siteSettings.solidColor || '#667eea'}">
            </div>
        </div>
        
        <div id="imageOptions" style="${siteSettings.backgroundType !== 'image' ? 'display: none;' : ''}">
            <div class="form-group">
                <label>Загрузить изображение:</label>
                <div class="file-upload" onclick="document.getElementById('bgImageUpload').click()">
                    <i class="fas fa-image"></i>
                    <p>Нажмите для загрузки изображения</p>
                    <input type="file" id="bgImageUpload" accept="image/*" style="display: none;" 
                           onchange="handleBackgroundImageUpload(this.files[0])">
                </div>
                <div class="background-preview ${siteSettings.backgroundImage ? 'has-image' : ''}" 
                     id="bgPreview" style="${siteSettings.backgroundImage ? `background-image: url('${siteSettings.backgroundImage}')` : ''}">
                    ${!siteSettings.backgroundImage ? 'Предпросмотр' : ''}
                </div>
            </div>
        </div>
        
        <div class="panel-actions">
            <button class="btn btn-success" onclick="applyBackground()">Применить</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
    `;
}

function toggleBackgroundOptions() {
    const bgType = document.getElementById('bgType').value;
    document.getElementById('gradientOptions').style.display = bgType === 'gradient' ? 'block' : 'none';
    document.getElementById('solidOptions').style.display = bgType === 'solid' ? 'block' : 'none';
    document.getElementById('imageOptions').style.display = bgType === 'image' ? 'block' : 'none';
}

function handleBackgroundImageUpload(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('bgPreview');
        preview.style.backgroundImage = `url('${e.target.result}')`;
        preview.classList.add('has-image');
        siteSettings.backgroundImage = e.target.result;
    };
    reader.readAsDataURL(file);
}

function applyBackground() {
    const bgType = document.getElementById('bgType').value;
    siteSettings.backgroundType = bgType;
    
    if (bgType === 'gradient') {
        const color1 = document.getElementById('bgColor1').value;
        const color2 = document.getElementById('bgColor2').value;
        document.body.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
        siteSettings.color1 = color1;
        siteSettings.color2 = color2;
    } else if (bgType === 'solid') {
        const color = document.getElementById('solidColor').value;
        document.body.style.background = color;
        siteSettings.solidColor = color;
    } else if (bgType === 'image') {
        document.body.style.background = `url('${siteSettings.backgroundImage}') center/cover fixed`;
    }
    
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    showNotification('✅ Фон обновлен!');
    closePanel();
}

function editHeader() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📝 Редактирование шапки</h3>
        <div class="form-group">
            <label>Текст логотипа:</label>
            <input type="text" class="form-control" id="logoText" value="${siteSettings.logoText}">
        </div>
        <div class="form-group">
            <label>Цвет шапки:</label>
            <input type="color" class="color-picker" id="headerColor" value="${siteSettings.headerColor}">
        </div>
        <div class="form-group">
            <label>Телефон:</label>
            <input type="text" class="form-control" id="headerPhone" value="+7 (923) 753-36-06">
        </div>
        <div class="form-group">
            <label>Email:</label>
            <input type="email" class="form-control" id="headerEmail" value="prodtorg.barnaul@gmail.com">
        </div>
        <div class="panel-actions">
            <button class="btn btn-success" onclick="applyHeaderChanges()">Применить</button>
            <button class="btn btn-danger" onclick="closePanel()">Отмена</button>
        </div>
    `;
}

function applyHeaderChanges() {
    const logoText = document.getElementById('logoText').value;
    const headerColor = document.getElementById('headerColor').value;
    const phone = document.getElementById('headerPhone').value;
    const email = document.getElementById('headerEmail').value;
    
    // Обновляем логотип
    document.querySelector('.logo').innerHTML = `${logoText}<span>.</span>`;
    
    // Обновляем цвет шапки
    document.querySelector('.header-top').style.background = `linear-gradient(135deg, ${headerColor}, #1a3a6b)`;
    
    // Обновляем контакты
    document.querySelector('.header-contacts').innerHTML = `
        <i class="fas fa-phone"></i> ${phone}
        <span style="margin: 0 15px">|</span>
        <i class="fas fa-envelope"></i> ${email}
    `;
    
    siteSettings.logoText = logoText;
    siteSettings.headerColor = headerColor;
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    
    showNotification('✅ Шапка обновлена!');
    closePanel();
}

function editCategories() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>📂 Редактирование категорий</h3>
        <div class="form-group">
            <button class="btn btn-primary" onclick="showAddCategoryForm()" style="width: 100%;">
                <i class="fas fa-plus"></i> Добавить категорию
            </button>
        </div>
        <div class="categories-list">
            ${categoriesData.map((category, index) => `
                <div class="category-editor-item">
                    <div class="category-header">
                        <h4>${category.name}</h4>
                        <div>
                            <button class="btn btn-sm btn-outline" onclick="editCategory(${index})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <div><strong>Иконка:</strong> ${category.icon}</div>
                            <div><strong>Тип фона:</strong> ${category.backgroundType}</div>
                        </div>
                        <div class="background-preview" style="background: ${getCategoryBackground(category)}"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getCategoryBackground(category) {
    if (category.backgroundType === 'gradient') {
        return `linear-gradient(135deg, ${category.color1}, ${category.color2})`;
    } else if (category.backgroundType === 'solid') {
        return category.color1;
    } else if (category.backgroundType === 'image') {
        return `url('${category.backgroundImage}')`;
    }
    return `linear-gradient(135deg, ${category.color1}, ${category.color2})`;
}

function showAddCategoryForm() {
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>➕ Добавить категорию</h3>
        <div class="form-group">
            <label>Название категории:</label>
            <input type="text" class="form-control" id="newCategoryName" placeholder="Введите название">
        </div>
        <div class="form-group">
            <label>Иконка (эмодзи):</label>
            <input type="text" class="form-control" id="newCategoryIcon" placeholder="🧴" value="🧴">
        </div>
        <div class="form-group">
            <label>Тип фона:</label>
            <select class="form-control" id="newCategoryBgType" onchange="toggleCategoryBgOptions()">
                <option value="gradient">Градиент</option>
                <option value="solid">Сплошной цвет</option>
                <option value="image">Изображение</option>
            </select>
        </div>
        <div id="categoryGradientOptions">
            <div class="form-group">
                <label>Цвет 1:</label>
                <input type="color" class="color-picker" id="newCategoryColor1" value="#667eea">
            </div>
            <div class="form-group">
                <label>Цвет 2:</label>
                <input type="color" class="color-picker" id="newCategoryColor2" value="#764ba2">
            </div>
        </div>
        <div id="categoryImageOptions" style="display: none;">
            <div class="form-group">
                <label>Загрузить изображение:</label>
                <div class="file-upload" onclick="document.getElementById('categoryImageUpload').click()">
                    <i class="fas fa-image"></i>
                    <p>Нажмите для загрузки изображения</p>
                    <input type="file" id="categoryImageUpload" accept="image/*" style="display: none;" 
                           onchange="handleCategoryImageUpload(this.files[0])">
                </div>
                <div class="background-preview" id="categoryPreview">Предпросмотр</div>
            </div>
        </div>
        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveNewCategory()">Сохранить</button>
            <button class="btn btn-danger" onclick="editCategories()">Отмена</button>
        </div>
    `;
}

function toggleCategoryBgOptions() {
    const bgType = document.getElementById('newCategoryBgType').value;
    document.getElementById('categoryGradientOptions').style.display = bgType === 'gradient' ? 'block' : 'none';
    document.getElementById('categoryImageOptions').style.display = bgType === 'image' ? 'block' : 'none';
}

function handleCategoryImageUpload(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('categoryPreview');
        preview.style.backgroundImage = `url('${e.target.result}')`;
        preview.classList.add('has-image');
        preview.innerHTML = '';
    };
    reader.readAsDataURL(file);
}

function saveNewCategory() {
    const name = document.getElementById('newCategoryName').value;
    const icon = document.getElementById('newCategoryIcon').value;
    const bgType = document.getElementById('newCategoryBgType').value;
    
    if (!name || !icon) {
        showNotification('❌ Заполните обязательные поля');
        return;
    }

    const newCategory = {
        name: name,
        icon: icon,
        backgroundType: bgType,
        color1: '#667eea',
        color2: '#764ba2',
        backgroundImage: ''
    };

    if (bgType === 'gradient') {
        newCategory.color1 = document.getElementById('newCategoryColor1').value;
        newCategory.color2 = document.getElementById('newCategoryColor2').value;
    } else if (bgType === 'solid') {
        newCategory.color1 = document.getElementById('newCategoryColor1').value;
    } else if (bgType === 'image') {
        const preview = document.getElementById('categoryPreview');
        newCategory.backgroundImage = preview.style.backgroundImage.replace('url("', '').replace('")', '');
    }

    categoriesData.push(newCategory);
    localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
    loadCategories();
    editCategories();
    showNotification('✅ Категория добавлена!');
}

function editCategory(index) {
    const category = categoriesData[index];
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>✏️ Редактирование категории</h3>
        <div class="form-group">
            <label>Название категории:</label>
            <input type="text" class="form-control" id="editCategoryName" value="${category.name}">
        </div>
        <div class="form-group">
            <label>Иконка (эмодзи):</label>
            <input type="text" class="form-control" id="editCategoryIcon" value="${category.icon}">
        </div>
        <div class="form-group">
            <label>Тип фона:</label>
            <select class="form-control" id="editCategoryBgType" onchange="toggleEditCategoryBgOptions()">
                <option value="gradient" ${category.backgroundType === 'gradient' ? 'selected' : ''}>Градиент</option>
                <option value="solid" ${category.backgroundType === 'solid' ? 'selected' : ''}>Сплошной цвет</option>
                <option value="image" ${category.backgroundType === 'image' ? 'selected' : ''}>Изображение</option>
            </select>
        </div>
        <div id="editCategoryGradientOptions" style="${category.backgroundType !== 'gradient' ? 'display: none;' : ''}">
            <div class="form-group">
                <label>Цвет 1:</label>
                <input type="color" class="color-picker" id="editCategoryColor1" value="${category.color1 || '#667eea'}">
            </div>
            <div class="form-group">
                <label>Цвет 2:</label>
                <input type="color" class="color-picker" id="editCategoryColor2" value="${category.color2 || '#764ba2'}">
            </div>
        </div>
        <div id="editCategoryImageOptions" style="${category.backgroundType !== 'image' ? 'display: none;' : ''}">
            <div class="form-group">
                <label>Изображение:</label>
                <div class="file-upload" onclick="document.getElementById('editCategoryImageUpload').click()">
                    <i class="fas fa-image"></i>
                    <p>Нажмите для загрузки нового изображения</p>
                    <input type="file" id="editCategoryImageUpload" accept="image/*" style="display: none;" 
                           onchange="handleEditCategoryImageUpload(this.files[0])">
                </div>
                <div class="background-preview ${category.backgroundImage ? 'has-image' : ''}" 
                     id="editCategoryPreview" style="${category.backgroundImage ? `background-image: url('${category.backgroundImage}')` : ''}">
                    ${!category.backgroundImage ? 'Предпросмотр' : ''}
                </div>
            </div>
        </div>
        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveEditedCategory(${index})">Сохранить</button>
            <button class="btn btn-danger" onclick="editCategories()">Отмена</button>
        </div>
    `;
}

function toggleEditCategoryBgOptions() {
    const bgType = document.getElementById('editCategoryBgType').value;
    document.getElementById('editCategoryGradientOptions').style.display = bgType === 'gradient' ? 'block' : 'none';
    document.getElementById('editCategoryImageOptions').style.display = bgType === 'image' ? 'block' : 'none';
}

function handleEditCategoryImageUpload(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('editCategoryPreview');
        preview.style.backgroundImage = `url('${e.target.result}')`;
        preview.classList.add('has-image');
        preview.innerHTML = '';
    };
    reader.readAsDataURL(file);
}

function saveEditedCategory(index) {
    const name = document.getElementById('editCategoryName').value;
    const icon = document.getElementById('editCategoryIcon').value;
    const bgType = document.getElementById('editCategoryBgType').value;
    
    categoriesData[index] = {
        ...categoriesData[index],
        name: name,
        icon: icon,
        backgroundType: bgType
    };

    if (bgType === 'gradient') {
        categoriesData[index].color1 = document.getElementById('editCategoryColor1').value;
        categoriesData[index].color2 = document.getElementById('editCategoryColor2').value;
        categoriesData[index].backgroundImage = '';
    } else if (bgType === 'solid') {
        categoriesData[index].color1 = document.getElementById('editCategoryColor1').value;
        categoriesData[index].backgroundImage = '';
    } else if (bgType === 'image') {
        const preview = document.getElementById('editCategoryPreview');
        if (preview.style.backgroundImage) {
            categoriesData[index].backgroundImage = preview.style.backgroundImage.replace('url("', '').replace('")', '');
        }
    }

    localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
    loadCategories();
    editCategories();
    showNotification('✅ Категория обновлена!');
}

function deleteCategory(index) {
    if (confirm('Удалить категорию? Товары в этой категории останутся без категории.')) {
        categoriesData.splice(index, 1);
        localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
        loadCategories();
        editCategories();
        showNotification('Категория удалена');
    }
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ САЙТА ====================
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    
    if (categoriesData.length === 0) {
        categoriesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: var(--gray);">Категории не настроены</h3>
                <p style="color: var(--gray); margin-top: 10px;">Добавьте категории через конструктор</p>
            </div>
        `;
        return;
    }
    
    categoriesGrid.innerHTML = categoriesData.map(category => {
        let background = getCategoryBackground(category);
        
        return `
            <div class="category-card" style="background: ${background}" onclick="filterByCategory('${category.name}')">
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
            </div>
        `;
    }).join('');
}

function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3 style="color: var(--gray); margin-bottom: 20px;">Товары не найдены</h3>
                <p style="color: var(--gray);">Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => {
        const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
        const statusClass = `status-${product.status.replace('_', '-')}`;
        
        const productImage = product.image && product.image.trim() !== '' 
            ? product.image 
            : 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения';
        
        return `
            <div class="product-card">
                ${discount > 0 ? `<div class="product-badge">-${discount}%</div>` : ''}
                <img src="${productImage}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'"
                     onclick="showProductDetails(${product.id})">
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name" onclick="showProductDetails(${product.id})">${product.name}</h3>
                    <div class="product-description-short">${product.description}</div>
                    
                    <div class="product-price">
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                        ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}
                    </div>
                    
                    <div class="product-status ${statusClass}">
                        ${getProductStatusText(product.status)}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart(${product.id})" 
                                ${product.status !== 'in_stock' ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${product.status === 'in_stock' ? 'В корзину' : 'Недоступно'}
                        </button>
                        <button class="details-btn" onclick="showProductDetails(${product.id})">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getProductStatusText(status) {
    const statuses = {
        'in_stock': 'В наличии',
        'out_of_stock': 'Нет в наличии',
        'pre_order': 'Под заказ'
    };
    return statuses[status] || status;
}

function filterByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    filterProducts();
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
}

function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    
    filteredProducts = products.filter(product => {
        if (category && product.category !== category) return false;
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (product.price < min || product.price > max) return false;
        }
        return true;
    });
    
    loadProducts();
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    loadProducts();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            cartId: Date.now()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Товар добавлен в корзину!');
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== РАБОЧИЕ МОДАЛЬНЫЕ ОКНА ====================
function openCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">Корзина пуста</p>';
        cartTotal.textContent = '0';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/60x60/ecf0f1/7f8c8d?text=Нет'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ₽ × ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="changeQuantity(${item.cartId}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity(${item.cartId}, 1)">+</button>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.cartId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toLocaleString();
    }
    
    modal.style.display = 'block';
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function changeQuantity(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(cartId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            openCart();
        }
    }
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCart();
    showNotification('Товар удален из корзины');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`✅ Заказ оформлен! Сумма: ${total.toLocaleString()} ₽`);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    closeCart();
}

function openProfile() {
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const content = document.getElementById('productModalContent');
    
    title.textContent = product.name;
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${product.image}" alt="${product.name}" 
                 style="max-width: 100%; max-height: 300px; border-radius: 10px;"
                 onerror="this.src='https://via.placeholder.com/400x300/ecf0f1/7f8c8d?text=Нет+изображения'">
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Категория:</strong> ${product.category}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Цена:</strong> <span style="font-size: 1.5rem; color: var(--primary); font-weight: bold;">${product.price} ₽</span>
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Наличие:</strong> ${product.quantity} шт.
        </div>
        <div style="margin-bottom: 20px;">
            <strong>Описание:</strong>
            <p style="margin-top: 10px; line-height: 1.6;">${product.description}</p>
        </div>
        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeProductModal();" style="width: 100%;">
            <i class="fas fa-shopping-cart"></i> Добавить в корзину
        </button>
    `;
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function openNotifications() {
    showNotification('У вас нет новых уведомлений');
}

// ==================== КОНСТРУКТОР ====================
function toggleConstructor() {
    const toolbar = document.querySelector('.constructor-toolbar');
    const editButtons = document.getElementById('editButtons');
    
    if (toolbar.classList.contains('expanded')) {
        toolbar.classList.remove('expanded');
        editButtons.style.display = 'none';
    } else {
        toolbar.classList.add('expanded');
        editButtons.style.display = 'flex';
    }
}

function editProducts() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    loadProductsEditor();
}

function loadProductsEditor() {
    const panelContent = document.getElementById('productsPanelContent');
    
    panelContent.innerHTML = `
        <h3>🛍️ Управление товарами</h3>
        
        <div class="form-group">
            <label>📤 Импорт товаров из файла:</label>
            <div class="file-upload" onclick="document.getElementById('fileImport').click()">
                <i class="fas fa-file-import"></i>
                <p>Нажмите для загрузки CSV или Excel файла</p>
                <input type="file" id="fileImport" accept=".csv,.xlsx" style="display: none;" 
                       onchange="importProducts(this.files[0])">
            </div>
            <small style="color: var(--gray); display: block; margin-top: 10px;">
                📝 Поддерживаемые форматы: CSV, XLSX (Excel)<br>
                📋 Обязательные поля: название, категория, цена
            </small>
        </div>

        <div class="form-group">
            <label>Добавить новый товар:</label>
            <button class="btn btn-primary" onclick="showAddProductForm()" style="width: 100%;">
                <i class="fas fa-plus"></i> Добавить товар
            </button>
        </div>

        <div class="form-group">
            <label>Поиск товара:</label>
            <input type="text" class="form-control" id="productSearch" placeholder="Поиск по названию..." 
                   onkeyup="filterProductsInEditor()">
        </div>

        <div class="categories-list" style="max-height: 400px;">
            <h4>Список товаров (${products.length}):</h4>
            <div id="productsEditorList">
                ${products.map((product, index) => `
                    <div class="category-editor-item product-editor-item">
                        <div class="category-header">
                            <h4>${product.name}</h4>
                            <div>
                                <button class="btn btn-sm btn-outline" onclick="editProduct(${index})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${index})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 80px 1fr; gap: 15px; align-items: start;">
                            <img src="${product.image}" alt="${product.name}" 
                                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
                                 onerror="this.src='https://via.placeholder.com/80x80/ecf0f1/7f8c8d?text=Нет+изображения'">
                            <div>
                                <div><strong>Категория:</strong> ${product.category}</div>
                                <div><strong>Цена:</strong> ${product.price} ₽</div>
                                <div><strong>Наличие:</strong> ${product.quantity} шт.</div>
                                <div><strong>Статус:</strong> ${getProductStatusText(product.status)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function filterProductsInEditor() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const productItems = document.querySelectorAll('.product-editor-item');
    
    productItems.forEach(item => {
        const productName = item.querySelector('h4').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function showAddProductForm() {
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>➕ Добавить новый товар</h3>
        <div class="form-group">
            <label>Название товара:</label>
            <input type="text" class="form-control" id="newProductName" placeholder="Введите название">
        </div>
        <div class="form-group">
            <label>Категория:</label>
            <input type="text" class="form-control" id="newProductCategory" placeholder="Введите категорию">
        </div>
        <div class="form-group">
            <label>Цена:</label>
            <input type="number" class="form-control" id="newProductPrice" placeholder="Введите цену">
        </div>
        <div class="form-group">
            <label>Количество:</label>
            <input type="number" class="form-control" id="newProductQuantity" placeholder="Введите количество">
        </div>
        <div class="form-group">
            <label>Описание:</label>
            <textarea class="form-control" id="newProductDescription" placeholder="Введите описание" rows="3"></textarea>
        </div>
        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveNewProduct()">Сохранить товар</button>
            <button class="btn btn-danger" onclick="loadProductsEditor()">Отмена</button>
        </div>
    `;
}

function saveNewProduct() {
    const name = document.getElementById('newProductName').value;
    const category = document.getElementById('newProductCategory').value;
    const price = parseInt(document.getElementById('newProductPrice').value);
    const quantity = parseInt(document.getElementById('newProductQuantity').value);
    const description = document.getElementById('newProductDescription').value;

    if (!name || !category || !price) {
        showNotification('❌ Заполните обязательные поля');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        category: category,
        price: price,
        oldPrice: null,
        quantity: quantity || 0,
        status: 'in_stock',
        description: description || 'Описание товара',
        image: 'https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=Нет+изображения'
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    filteredProducts = [...products];
    loadProducts();
    updateCategoryFilter(); // ОБНОВЛЯЕМ ФИЛЬТР
    loadProductsEditor();
    showNotification('✅ Товар добавлен!');
}

function editProduct(index) {
    const product = products[index];
    document.getElementById('editOverlay').style.display = 'block';
    document.getElementById('productsPanel').style.display = 'block';
    document.getElementById('productsPanelContent').innerHTML = `
        <h3>✏️ Редактирование товара</h3>
        <div class="form-group">
            <label>Название товара:</label>
            <input type="text" class="form-control" id="editProductName" value="${product.name}">
        </div>
        <div class="form-group">
            <label>Категория:</label>
            <input type="text" class="form-control" id="editProductCategory" value="${product.category}">
        </div>
        <div class="form-group">
            <label>Цена:</label>
            <input type="number" class="form-control" id="editProductPrice" value="${product.price}">
        </div>
        <div class="form-group">
            <label>Количество:</label>
            <input type="number" class="form-control" id="editProductQuantity" value="${product.quantity}">
        </div>
        <div class="form-group">
            <label>Описание:</label>
            <textarea class="form-control" id="editProductDescription" rows="3">${product.description}</textarea>
        </div>
        <div class="panel-actions">
            <button class="btn btn-success" onclick="saveEditedProduct(${index})">Сохранить изменения</button>
            <button class="btn btn-danger" onclick="loadProductsEditor()">Отмена</button>
        </div>
    `;
}

function saveEditedProduct(index) {
    const name = document.getElementById('editProductName').value;
    const category = document.getElementById('editProductCategory').value;
    const price = parseInt(document.getElementById('editProductPrice').value);
    const quantity = parseInt(document.getElementById('editProductQuantity').value);
    const description = document.getElementById('editProductDescription').value;

    if (!name || !category || !price) {
        showNotification('❌ Заполните обязательные поля');
        return;
    }

    products[index] = {
        ...products[index],
        name: name,
        category: category,
        price: price,
        quantity: quantity,
        description: description
    };

    localStorage.setItem('products', JSON.stringify(products));
    filteredProducts = [...products];
    loadProducts();
    updateCategoryFilter(); // ОБНОВЛЯЕМ ФИЛЬТР
    loadProductsEditor();
    showNotification('✅ Товар обновлен!');
}

function deleteProduct(index) {
    if (confirm('Удалить товар?')) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        filteredProducts = [...products];
        loadProducts();
        updateCategoryFilter(); // ОБНОВЛЯЕМ ФИЛЬТР
        loadProductsEditor();
        showNotification('Товар удален');
    }
}

function closePanel() {
    document.querySelectorAll('.edit-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById('editOverlay').style.display = 'none';
}

function editOrders() {
    showNotification('📦 Управление заказами - функция в разработке');
}

function editGiveaway() {
    showNotification('🎁 Управление розыгрышем - функция в разработке');
}

function saveDesign() {
    showNotification('💾 Все изменения сохранены!');
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    showNotification('👋 До свидания!');
}

function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    if (sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    loadProducts();
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    // Применяем сохраненные настройки
    if (siteSettings.backgroundType === 'gradient') {
        document.body.style.background = `linear-gradient(135deg, ${siteSettings.color1}, ${siteSettings.color2})`;
    } else if (siteSettings.backgroundType === 'solid') {
        document.body.style.background = siteSettings.solidColor;
    } else if (siteSettings.backgroundType === 'image' && siteSettings.backgroundImage) {
        document.body.style.background = `url('${siteSettings.backgroundImage}') center/cover fixed`;
    }

    // Загружаем данные
    loadCategories();
    loadProducts();
    updateCategoryFilter();
    updateCartCount();

    // БЕЗ ТЕСТОВЫХ ТОВАРОВ - только данные из localStorage или импорт
});

// Глобальные функции
window.filterByCategory = filterByCategory;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.openNotifications = openNotifications;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.toggleConstructor = toggleConstructor;
window.editProducts = editProducts;
window.closePanel = closePanel;
window.importProducts = importProducts;
window.filterProductsInEditor = filterProductsInEditor;
window.sortProducts = sortProducts;
window.editBackground = editBackground;
window.toggleBackgroundOptions = toggleBackgroundOptions;
window.handleBackgroundImageUpload = handleBackgroundImageUpload;
window.applyBackground = applyBackground;
window.editHeader = editHeader;
window.applyHeaderChanges = applyHeaderChanges;
window.editCategories = editCategories;
window.showAddCategoryForm = showAddCategoryForm;
window.toggleCategoryBgOptions = toggleCategoryBgOptions;
window.handleCategoryImageUpload = handleCategoryImageUpload;
window.saveNewCategory = saveNewCategory;
window.editCategory = editCategory;
window.toggleEditCategoryBgOptions = toggleEditCategoryBgOptions;
window.handleEditCategoryImageUpload = handleEditCategoryImageUpload;
window.saveEditedCategory = saveEditedCategory;
window.deleteCategory = deleteCategory;
window.showAddProductForm = showAddProductForm;
window.saveNewProduct = saveNewProduct;
window.editProduct = editProduct;
window.saveEditedProduct = saveEditedProduct;
window.deleteProduct = deleteProduct;
window.editOrders = editOrders;
window.editGiveaway = editGiveaway;
window.saveDesign = saveDesign;
window.logout = logout;
