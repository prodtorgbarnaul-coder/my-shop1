// ============================================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ И СОСТОЯНИЕ
// ============================================

let currentUser = null;
let allProducts = [];
let allCategories = [];
let productsForExport = [];

// ============================================
// 1. ИНИЦИАЛИЗАЦИЯ И ПРОВЕРКА АУТЕНТИФИКАЦИИ
// ============================================

function initAdminPanel() {
    console.log('Инициализация админ-панели...');
    checkAdminAuth();
    loadInitialData();
    setupEventListeners();
}

function checkAdminAuth() {
    const savedUser = localStorage.getItem('adminUser');
    if (!savedUser) {
        console.log('Пользователь не авторизован. Редирект.');
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
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        alert('Не удалось загрузить данные. Проверьте консоль и сеть.');
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
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<p class="text-muted">Товары не найдены.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 product-card">
                <div class="card-img-container">
                    <img src="${product.image || 'placeholder.jpg'}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         onerror="this.src='placeholder.jpg'">
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text flex-grow-1">${product.description || 'Нет описания'}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="h5 mb-0">${formatPrice(product.price)}</span>
                            <span class="badge bg-secondary">${getCategoryName(product.categoryId)}</span>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary w-50" onclick="editProduct(${product.id})">
                                <i class="bi bi-pencil"></i> Ред.
                            </button>
                            <button class="btn btn-sm btn-outline-danger w-50" onclick="confirmDeleteProduct(${product.id})">
                                <i class="bi bi-trash"></i> Удл.
                            </button>
                        </div>
                    </div>
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
        ${allCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
    `;
    filter.addEventListener('change', (e) => filterProductsByCategory(e.target.value));
}

// ============================================
// 4. ФИЛЬТРАЦИЯ И ПОИСК
// ============================================

function filterProductsByCategory(categoryId) {
    let filtered = allProducts;
    if (categoryId && categoryId !== 'all') {
        filtered = allProducts.filter(p => p.categoryId == categoryId);
    }
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery) || 
            (p.description && p.description.toLowerCase().includes(searchQuery))
        );
    }
    renderProductList(filtered);
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterProductsByCategory(document.getElementById('categoryFilter').value);
        });
    }
}

// ============================================
// 5. РАБОТА С ТОВАРАМИ (ДОБАВЛЕНИЕ/РЕДАКТИРОВАНИЕ)
// ============================================

function openAddProductModal() {
    document.getElementById('productModalLabel').textContent = 'Добавить товар';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    renderCategoryOptions();
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function editProduct(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) return;

    document.getElementById('productModalLabel').textContent = 'Редактировать товар';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productCategory').value = product.categoryId || '';

    renderCategoryOptions();
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
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
        id: document.getElementById('productId').value || Date.now(),
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value || 'placeholder.jpg',
        categoryId: document.getElementById('productCategory').value || null
    };

    showLoading(true, 'Сохранение товара...');
    try {
        let response;
        if (productData.id && allProducts.some(p => p.id == productData.id)) {
            // Обновление
            allProducts = allProducts.map(p => p.id == productData.id ? productData : p);
            response = await updateProductInJSON(productData);
        } else {
            // Добавление
            productData.id = productData.id || Date.now();
            allProducts.push(productData);
            response = await addProductToJSON(productData);
        }

        if (response && response.ok) {
            renderProductList(allProducts);
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            modal.hide();
            alert('Товар успешно сохранен!');
        } else {
            throw new Error('Ошибка сохранения на сервере');
        }
    } catch (error) {
        console.error('Ошибка сохранения товара:', error);
        alert('Ошибка при сохранении товара. Проверьте консоль.');
    } finally {
        showLoading(false);
    }
}

// ============================================
// 6. УДАЛЕНИЕ ТОВАРА
// ============================================

function confirmDeleteProduct(id) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    deleteProduct(id);
}

async function deleteProduct(id) {
    showLoading(true, 'Удаление товара...');
    try {
        allProducts = allProducts.filter(p => p.id != id);
        const response = await deleteProductFromJSON(id);
        if (response && response.ok) {
            renderProductList(allProducts);
            alert('Товар успешно удален!');
        } else {
            throw new Error('Ошибка удаления на сервере');
        }
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Ошибка при удалении товара. Проверьте консоль.');
    } finally {
        showLoading(false);
    }
}

// ============================================
// 7. ИМПОРТ/ЭКСПОРТ
// ============================================

function prepareExportData() {
    const exportData = allProducts.map(p => ({
        ...p,
        categoryName: getCategoryName(p.categoryId)
    }));
    return exportData;
}

function exportToCSV() {
    const data = prepareExportData();
    if (data.length === 0) {
        alert('Нет данных для экспорта.');
        return;
    }

    const headers = ['ID', 'Название', 'Описание', 'Цена', 'Изображение', 'Категория'];
    const csvRows = [
        headers.join(','),
        ...data.map(p => [
            p.id,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${(p.description || '').replace(/"/g, '""')}"`,
            p.price,
            p.image || '',
            `"${(p.categoryName || '').replace(/"/g, '""')}"`
        ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importFromCSV() {
    const input = document.getElementById('csvFileInput');
    if (!input.files.length) {
        alert('Выберите файл для импорта.');
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const csvText = e.target.result;
            const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
            const headers = rows[0];
            const data = rows.slice(1).filter(row => row.length === headers.length);

            if (data.length === 0) {
                throw new Error('В файле нет данных или неправильный формат.');
            }

            const importedProducts = data.map(row => {
                const product = {
                    id: Date.now() + Math.random(),
                    name: row[0] || '',
                    description: row[1] || '',
                    price: parseFloat(row[2]) || 0,
                    image: row[3] || 'placeholder.jpg',
                    categoryId: findCategoryIdByName(row[4])
                };
                return product;
            });

            if (!confirm(`Найдено ${importedProducts.length} товаров. Импортировать?`)) return;

            showLoading(true, 'Импорт товаров...');
            allProducts = [...allProducts, ...importedProducts];
            await saveAllProductsToJSON(allProducts);
            renderProductList(allProducts);
            alert(`Успешно импортировано ${importedProducts.length} товаров.`);
        } catch (error) {
            console.error('Ошибка импорта:', error);
            alert('Ошибка при импорте файла. Проверьте формат CSV.');
        } finally {
            showLoading(false);
            input.value = '';
        }
    };
    reader.readAsText(file);
}

// ============================================
// 8. РАБОТА С КАТЕГОРИЯМИ (БАЗОВАЯ)
// ============================================

function getCategoryName(categoryId) {
    if (!categoryId) return 'Без категории';
    const category = allCategories.find(c => c.id == categoryId);
    return category ? category.name : 'Без категории';
}

function findCategoryIdByName(categoryName) {
    if (!categoryName) return null;
    const category = allCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    return category ? category.id : null;
}

// ============================================
// 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

function showLoading(show, text = 'Загрузка...') {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
        if (show) {
            const textElement = loadingElement.querySelector('.loading-text');
            if (textElement) textElement.textContent = text;
        }
    }
}

// ============================================
// 10. ВЫХОД ИЗ СИСТЕМЫ (ВАЖНО!)
// ============================================

function logoutAdmin() {
    console.log('Выход из системы...');
    localStorage.removeItem('adminUser');
    window.location.href = 'index.html'; // Перенаправление на главную страницу магазина
}

// ============================================
// 11. ЭМУЛЯЦИЯ РАБОТЫ С СЕРВЕРОМ (ЗАГЛУШКИ)
// ============================================

// Эти функции эмулируют работу с сервером. В реальном проекте они будут делать fetch запросы.
async function updateProductInJSON(product) {
    console.log('Эмуляция обновления товара на сервере:', product.id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ok: true };
}

async function addProductToJSON(product) {
    console.log('Эмуляция добавления товара на сервере:', product.id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ok: true };
}

async function deleteProductFromJSON(id) {
    console.log('Эмуляция удаления товара на сервере:', id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ok: true };
}

async function saveAllProductsToJSON(products) {
    console.log('Эмуляция сохранения всех товаров на сервере');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ok: true };
}

// ============================================
// 12. НАСТРОЙКА ВСЕХ ОБРАБОТЧИКОВ СОБЫТИЙ
// ============================================

function setupEventListeners() {
    // Кнопка "Выйти" в навбаре
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
        console.log('Обработчик для кнопки "Выйти" установлен');
    } else {
        console.warn('Кнопка "Выйти" не найдена в DOM');
    }

    // Кнопка "Добавить товар"
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }

    // Форма сохранения товара
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }

    // Поиск
    setupSearch();

    // Импорт/экспорт
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);

    const importBtn = document.getElementById('importBtn');
    if (importBtn) importBtn.addEventListener('click', () => document.getElementById('csvFileInput').click());

    const csvInput = document.getElementById('csvFileInput');
    if (csvInput) csvInput.addEventListener('change', importFromCSV);

    console.log('Все обработчики событий установлены');
}

// ============================================
// 13. ЗАПУСК АДМИН-ПАНЕЛИ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, запускаем админ-панель');
    initAdminPanel();
});

// Альтернатива для старых браузеров
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    initAdminPanel();
}
