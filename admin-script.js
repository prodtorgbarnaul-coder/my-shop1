// ============================================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ И СОСТОЯНИЕ
// ============================================

let currentUser = null;
let allProducts = [];
let allCategories = [];
let productsForExport = [];
let currentEditingCategoryId = null;
let isInitialized = false;

// ============================================
// 1. ИНИЦИАЛИЗАЦИЯ И ПРОВЕРКА АУТЕНТИФИКАЦИИ
// ============================================

function initAdminPanel() {
    if (isInitialized) {
        console.log('Админ-панель уже инициализирована');
        return;
    }
    
    console.log('Инициализация админ-панели...');
    checkAdminAuth();
    loadInitialData();
    setupEventListeners();
    isInitialized = true;
}

function checkAdminAuth() {
    const savedUser = localStorage.getItem('adminUser');
    if (!savedUser) {
        console.log('Пользователь не авторизован. Редирект на login.html');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(savedUser);
        console.log('Текущий пользователь:', currentUser);
        updateUserInfo();
    } catch (e) {
        console.error('Ошибка при разборе пользователя:', e);
        logoutAdmin();
    }
}

function updateUserInfo() {
    const userInfoElement = document.getElementById('currentAdminName');
    if (userInfoElement && currentUser) {
        userInfoElement.textContent = currentUser.name || currentUser.email;
    }
}

// ============================================
// 2. ЗАГРУЗКА ДАННЫХ (ТОВАРЫ, КАТЕГОРИИ)
// ============================================

async function loadInitialData() {
    showLoading(true, 'Загрузка данных...');
    try {
        await Promise.all([loadProducts(), loadCategories()]);
        console.log('Данные загружены. Товаров:', allProducts.length, 'Категорий:', allCategories.length);
        renderProductList(allProducts);
        renderCategoryFilter();
        renderCategoryList();
        updateDashboardStats();
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        showNotification('Не удалось загрузить данные. Проверьте консоль и сеть.', 'danger');
    } finally {
        showLoading(false);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allProducts = await response.json();
        productsForExport = [...allProducts];
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        allProducts = [];
    }
}

async function loadCategories() {
    try {
        const response = await fetch('categories.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allCategories = await response.json();
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        allCategories = [];
    }
}

// ============================================
// 3. РЕНДЕРИНГ ИНТЕРФЕЙСА
// ============================================

function renderProductList(products) {
    const container = document.getElementById('productsContainer');
    if (!container) {
        console.warn('Элемент productsContainer не найден');
        return;
    }

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-state">
                    <i class="bi bi-box-seam display-1 text-muted"></i>
                    <h4 class="mt-3">Товары не найдены</h4>
                    <p class="text-muted">Добавьте первый товар, нажав кнопку "Добавить товар"</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 mb-4" data-product-id="${product.id}">
            <div class="card h-100 product-card shadow-sm">
                <div class="card-img-container position-relative">
                    <img src="${product.image || 'placeholder.jpg'}" 
                         class="card-img-top product-image" 
                         alt="${product.name}"
                         onerror="this.onerror=null; this.src='placeholder.jpg';">
                    ${product.featured ? '<span class="badge bg-warning position-absolute top-0 start-0 m-2"><i class="bi bi-star"></i> Реком.</span>' : ''}
                    ${product.stock <= 0 ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Нет в наличии</span>' : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0 flex-grow-1">${product.name}</h5>
                        <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'} ms-2">
                            ${product.stock || 0} шт.
                        </span>
                    </div>
                    <p class="card-text flex-grow-1 text-muted small">${product.description ? truncateText(product.description, 100) : 'Нет описания'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="h5 mb-0 text-primary">${formatPrice(product.price)}</span>
                            <span class="badge bg-secondary">${getCategoryName(product.categoryId)}</span>
                        </div>
                        <div class="d-grid gap-2">
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})" title="Редактировать">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-info" onclick="duplicateProduct(${product.id})" title="Дублировать">
                                    <i class="bi bi-copy"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning" onclick="toggleFeatured(${product.id})" title="${product.featured ? 'Снять рекомендацию' : 'Рекомендовать'}">
                                    <i class="bi ${product.featured ? 'bi-star-fill' : 'bi-star'}"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteProduct(${product.id})" title="Удалить">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0 pt-0">
                    <small class="text-muted">
                        <i class="bi bi-calendar3"></i> ${formatDate(product.updatedAt || product.createdAt)}
                        ${product.sku ? `| Арт: ${product.sku}` : ''}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;

    filter.innerHTML = `
        <option value="all">Все категории</option>
        <option value="uncategorized">Без категории</option>
        ${allCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
    `;
    
    filter.addEventListener('change', (e) => {
        filterProductsByCategory(e.target.value);
    });
}

function renderCategoryList() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    if (!allCategories || allCategories.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Категории не добавлены. Создайте первую категорию.
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = allCategories.map(category => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card category-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title mb-1">${category.name}</h5>
                        <span class="badge bg-primary rounded-pill">
                            ${countProductsInCategory(category.id)}
                        </span>
                    </div>
                    ${category.description ? `<p class="card-text text-muted small mt-2">${category.description}</p>` : ''}
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${category.id})">
                            <i class="bi bi-pencil"></i> Редактировать
                        </button>
                        <button class="btn btn-sm btn-outline-danger float-end" onclick="confirmDeleteCategory(${category.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateDashboardStats() {
    // Обновляем статистику на дашборде
    const totalProducts = allProducts.length;
    const totalCategories = allCategories.length;
    const outOfStock = allProducts.filter(p => p.stock <= 0).length;
    const featuredProducts = allProducts.filter(p => p.featured).length;
    
    // Обновляем элементы, если они существуют
    const elements = {
        'totalProducts': totalProducts,
        'totalCategories': totalCategories,
        'outOfStock': outOfStock,
        'featuredProducts': featuredProducts
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

// ============================================
// 4. ФИЛЬТРАЦИЯ, ПОИСК И СОРТИРОВКА
// ============================================

function filterProductsByCategory(categoryId) {
    let filtered = allProducts;
    
    if (categoryId === 'uncategorized') {
        filtered = allProducts.filter(p => !p.categoryId);
    } else if (categoryId && categoryId !== 'all') {
        filtered = allProducts.filter(p => p.categoryId == categoryId);
    }
    
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery) || 
            (p.description && p.description.toLowerCase().includes(searchQuery)) ||
            (p.sku && p.sku.toLowerCase().includes(searchQuery))
        );
    }
    
    const sortBy = document.getElementById('sortSelect')?.value;
    if (sortBy) {
        filtered = sortProducts(filtered, sortBy);
    }
    
    renderProductList(filtered);
}

function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'name_asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name_desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'price_asc':
            return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        case 'price_desc':
            return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        case 'stock_asc':
            return sorted.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        case 'stock_desc':
            return sorted.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        case 'newest':
            return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        case 'oldest':
            return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        default:
            return sorted;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Задержка для избежания частых перерисовок
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterProductsByCategory(document.getElementById('categoryFilter').value);
            }, 300);
        });
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            filterProductsByCategory(document.getElementById('categoryFilter').value);
        });
    }
}

// ============================================
// 5. РАБОТА С ТОВАРАМИ (CRUD)
// ============================================

function openAddProductModal() {
    document.getElementById('productModalLabel').textContent = 'Добавить товар';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productForm').classList.remove('was-validated');
    renderCategoryOptions();
    
    // Сброс дополнительных полей
    document.getElementById('productSku').value = generateSKU();
    document.getElementById('productStock').value = 0;
    document.getElementById('productFeatured').checked = false;
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function editProduct(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) {
        showNotification('Товар не найден', 'warning');
        return;
    }

    document.getElementById('productModalLabel').textContent = 'Редактировать товар';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productCategory').value = product.categoryId || '';
    document.getElementById('productSku').value = product.sku || generateSKU();
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productFeatured').checked = product.featured || false;

    renderCategoryOptions();
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function duplicateProduct(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) return;
    
    const duplicatedProduct = {
        ...product,
        id: Date.now(),
        name: `${product.name} (копия)`,
        sku: generateSKU(),
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    allProducts.unshift(duplicatedProduct);
    renderProductList(allProducts);
    showNotification('Товар успешно дублирован', 'success');
}

function toggleFeatured(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) return;
    
    product.featured = !product.featured;
    product.updatedAt = Date.now();
    
    // В реальном проекте здесь был бы fetch для сохранения на сервере
    renderProductList(allProducts);
    updateDashboardStats();
    
    showNotification(
        product.featured ? 'Товар добавлен в рекомендуемые' : 'Товар удален из рекомендуемых',
        'success'
    );
}

function renderCategoryOptions() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    select.innerHTML = `
        <option value="">Без категории</option>
        ${allCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
    `;
}

async function saveProduct() {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const productData = {
        id: parseInt(document.getElementById('productId').value) || Date.now(),
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        image: document.getElementById('productImage').value.trim() || 'placeholder.jpg',
        categoryId: document.getElementById('productCategory').value || null,
        sku: document.getElementById('productSku').value.trim() || generateSKU(),
        stock: parseInt(document.getElementById('productStock').value) || 0,
        featured: document.getElementById('productFeatured').checked,
        updatedAt: Date.now()
    };

    if (!productData.createdAt) {
        productData.createdAt = Date.now();
    }

    showLoading(true, 'Сохранение товара...');
    try {
        const isEdit = productData.id && allProducts.some(p => p.id == productData.id);
        
        if (isEdit) {
            // Обновление существующего товара
            allProducts = allProducts.map(p => 
                p.id == productData.id ? { ...p, ...productData } : p
            );
        } else {
            // Добавление нового товара
            allProducts.unshift(productData);
        }

        // В реальном проекте здесь был бы fetch запрос к серверу
        await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки сети
        
        renderProductList(allProducts);
        updateDashboardStats();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        if (modal) modal.hide();
        
        showNotification(`Товар успешно ${isEdit ? 'обновлен' : 'добавлен'}`, 'success');
        
    } catch (error) {
        console.error('Ошибка сохранения товара:', error);
        showNotification('Ошибка при сохранении товара', 'danger');
    } finally {
        showLoading(false);
    }
}

// ============================================
// 6. УДАЛЕНИЕ ТОВАРА
// ============================================

function confirmDeleteProduct(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) return;
    
    if (confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
        deleteProduct(id);
    }
}

async function deleteProduct(id) {
    showLoading(true, 'Удаление товара...');
    try {
        allProducts = allProducts.filter(p => p.id != id);
        
        // В реальном проекте здесь был бы fetch запрос к серверу
        await new Promise(resolve => setTimeout(resolve, 300));
        
        renderProductList(allProducts);
        updateDashboardStats();
        showNotification('Товар успешно удален', 'success');
        
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        showNotification('Ошибка при удалении товара', 'danger');
    } finally {
        showLoading(false);
    }
}

// ============================================
// 7. РАБОТА С КАТЕГОРИЯМИ
// ============================================

function openAddCategoryModal() {
    document.getElementById('categoryModalLabel').textContent = 'Добавить категорию';
    document.getElementById('categoryForm').reset();
    currentEditingCategoryId = null;
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
}

function editCategory(id) {
    const category = allCategories.find(c => c.id == id);
    if (!category) {
        showNotification('Категория не найдена', 'warning');
        return;
    }

    document.getElementById('categoryModalLabel').textContent = 'Редактировать категорию';
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description || '';
    currentEditingCategoryId = id;
    
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
}

function saveCategory() {
    const form = document.getElementById('categoryForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const categoryData = {
        id: currentEditingCategoryId || Date.now(),
        name: document.getElementById('categoryName').value.trim(),
        description: document.getElementById('categoryDescription').value.trim(),
        createdAt: currentEditingCategoryId ? undefined : Date.now(),
        updatedAt: Date.now()
    };

    showLoading(true, 'Сохранение категории...');
    try {
        if (currentEditingCategoryId) {
            // Обновление
            allCategories = allCategories.map(c => 
                c.id == currentEditingCategoryId ? { ...c, ...categoryData } : c
            );
        } else {
            // Добавление
            allCategories.push(categoryData);
        }

        renderCategoryList();
        renderCategoryFilter();
        renderCategoryOptions();
        updateDashboardStats();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        if (modal) modal.hide();
        
        showNotification(`Категория успешно ${currentEditingCategoryId ? 'обновлена' : 'добавлена'}`, 'success');
        
    } catch (error) {
        console.error('Ошибка сохранения категории:', error);
        showNotification('Ошибка при сохранении категории', 'danger');
    } finally {
        showLoading(false);
        currentEditingCategoryId = null;
    }
}

function confirmDeleteCategory(id) {
    const category = allCategories.find(c => c.id == id);
    if (!category) return;
    
    const productCount = countProductsInCategory(id);
    if (productCount > 0) {
        if (!confirm(`В категории "${category.name}" находится ${productCount} товаров. Все они будут перемещены в "Без категории". Удалить категорию?`)) {
            return;
        }
        
        // Перемещаем товары в "Без категории"
        allProducts = allProducts.map(p => 
            p.categoryId == id ? { ...p, categoryId: null } : p
        );
    } else {
        if (!confirm(`Удалить категорию "${category.name}"?`)) {
            return;
        }
    }
    
    deleteCategory(id);
}

async function deleteCategory(id) {
    showLoading(true, 'Удаление категории...');
    try {
        allCategories = allCategories.filter(c => c.id != id);
        
        renderCategoryList();
        renderCategoryFilter();
        renderCategoryOptions();
        updateDashboardStats();
        
        showNotification('Категория успешно удалена', 'success');
        
    } catch (error) {
        console.error('Ошибка удаления категории:', error);
        showNotification('Ошибка при удалении категории', 'danger');
    } finally {
        showLoading(false);
    }
}

// ============================================
// 8. ИМПОРТ/ЭКСПОРТ ДАННЫХ
// ============================================

function prepareExportData() {
    return allProducts.map(p => ({
        ...p,
        categoryName: getCategoryName(p.categoryId),
        price: formatPrice(p.price).replace('₽', '').trim()
    }));
}

function exportToCSV() {
    const data = prepareExportData();
    if (data.length === 0) {
        showNotification('Нет данных для экспорта', 'warning');
        return;
    }

    const headers = ['ID', 'Артикул', 'Название', 'Описание', 'Цена', 'Категория', 'В наличии', 'Рекомендуемый', 'Изображение'];
    const csvRows = [
        headers.join(','),
        ...data.map(p => [
            p.id,
            `"${(p.sku || '').replace(/"/g, '""')}"`,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${(p.description || '').replace(/"/g, '""')}"`,
            p.price,
            `"${(p.categoryName || '').replace(/"/g, '""')}"`,
            p.stock || 0,
            p.featured ? 'Да' : 'Нет',
            p.image || ''
        ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Экспортировано ${data.length} товаров`, 'success');
}

function importFromCSV() {
    const input = document.getElementById('csvFileInput');
    if (!input || !input.files.length) {
        showNotification('Выберите файл для импорта', 'warning');
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        showLoading(true, 'Импорт данных...');
        try {
            const csvText = e.target.result;
            const rows = parseCSV(csvText);
            
            if (rows.length < 2) {
                throw new Error('Файл пуст или имеет неправильный формат');
            }

            const headers = rows[0];
            const importedProducts = rows.slice(1)
                .filter(row => row.length >= 3) // Минимум ID, название и цена
                .map(row => {
                    const product = {
                        id: parseInt(row[0]) || Date.now() + Math.random(),
                        sku: row[1] || generateSKU(),
                        name: row[2] || 'Без названия',
                        description: row[3] || '',
                        price: parseFloat(row[4]) || 0,
                        categoryId: findCategoryIdByName(row[5]),
                        stock: parseInt(row[6]) || 0,
                        featured: (row[7] || '').toLowerCase() === 'да',
                        image: row[8] || 'placeholder.jpg',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    return product;
                });

            if (importedProducts.length === 0) {
                throw new Error('Не удалось распознать данные в файле');
            }

            if (!confirm(`Найдено ${importedProducts.length} товаров. Импортировать?`)) {
                return;
            }

            // Добавляем импортированные товары
            allProducts = [...importedProducts, ...allProducts.filter(p => 
                !importedProducts.some(ip => ip.id === p.id)
            )];

            renderProductList(allProducts);
            updateDashboardStats();
            
            showNotification(`Успешно импортировано ${importedProducts.length} товаров`, 'success');
            
        } catch (error) {
            console.error('Ошибка импорта:', error);
            showNotification(`Ошибка при импорте: ${error.message}`, 'danger');
        } finally {
            showLoading(false);
            if (input) input.value = '';
        }
    };
    
    reader.readAsText(file, 'UTF-8');
}

function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let inQuotes = false;
    let currentCell = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && inQuotes && nextChar === '"') {
            currentCell += '"';
            i++; // Пропускаем следующий символ
        } else if (char === '"' && inQuotes) {
            inQuotes = false;
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentCell);
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    
    // Добавляем последнюю строку
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }
    
    return rows;
}

// ============================================
// 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function getCategoryName(categoryId) {
    if (!categoryId) return 'Без категории';
    const category = allCategories.find(c => c.id == categoryId);
    return category ? category.name : 'Без категории';
}

function findCategoryIdByName(categoryName) {
    if (!categoryName || categoryName === 'Без категории') return null;
    const category = allCategories.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase().trim()
    );
    return category ? category.id : null;
}

function countProductsInCategory(categoryId) {
    return allProducts.filter(p => p.categoryId == categoryId).length;
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price || 0);
}

function formatDate(timestamp) {
    if (!timestamp) return 'Не указана';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU');
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function generateSKU() {
    return 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function showNotification(message, type = 'info') {
    // Создаем или находим контейнер для уведомлений
    let container = document.getElementById('notificationsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationsContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
        `;
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show shadow`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alert);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

function showLoading(show, text = 'Загрузка...') {
    let overlay = document.getElementById('loadingOverlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            flex-direction: column;
        `;
        overlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            <div class="loading-text mt-3 text-primary">${text}</div>
        `;
        document.body.appendChild(overlay);
    }
    
    if (show) {
        const textElement = overlay.querySelector('.loading-text');
        if (textElement) textElement.textContent = text;
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

// ============================================
// 10. ВЫХОД ИЗ СИСТЕМЫ
// ============================================

function logoutAdmin() {
    console.log('Выход из системы...');
    localStorage.removeItem('adminUser');
    window.location.href = 'index.html';
}

// ============================================
// 11. НАСТРОЙКА ВСЕХ ОБРАБОТЧИКОВ СОБЫТИЙ
// ============================================

function setupEventListeners() {
    console.log('Настройка обработчиков событий...');
    
    // Кнопка "Выйти" в навбаре
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
        console.log('Обработчик для кнопки "Выйти" установлен');
    }
    
    // Кнопка "Добавить товар"
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }
    
    // Кнопка "Добавить категорию"
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', openAddCategoryModal);
    }
    
    // Форма сохранения товара
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
    
    // Форма сохранения категории
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCategory();
        });
    }
    
    // Поиск и сортировка
    setupSearch();
    
    // Импорт/экспорт
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.getElementById('csvFileInput');
            if (input) input.click();
        });
    }
    
    const csvInput = document.getElementById('csvFileInput');
    if (csvInput) {
        csvInput.addEventListener('change', importFromCSV);
    }
    
    // Табы навигации
    const navTabs = document.querySelectorAll('a[data-bs-toggle="tab"]');
    navTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const targetId = e.target.getAttribute('href');
            console.log('Переключена вкладка:', targetId);
            
            // При переключении на вкладку "Категории" обновляем список
            if (targetId === '#categories') {
                renderCategoryList();
            }
        });
    });
    
    console.log('Все обработчики событий установлены');
}

// ============================================
// 12. ЗАПУСК АДМИН-ПАНЕЛИ
// ============================================

// Ждем полной загрузки DOM и Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, запускаем админ-панель');
    
    // Проверяем, загружен ли Bootstrap
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap не загружен!');
        showNotification('Ошибка загрузки Bootstrap. Проверьте подключение.', 'danger');
        return;
    }
    
    initAdminPanel();
});

// Альтернативный запуск для старых браузеров
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    setTimeout(initAdminPanel, 100);
}
