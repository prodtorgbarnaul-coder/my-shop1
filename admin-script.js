// ============================================
// АДМИН-ПАНЕЛЬ PRODTORG - ПОЛНЫЙ ФУНКЦИОНАЛ
// ============================================

// Основной класс админ-панели
class AdminPanel {
    constructor() {
        this.products = [];
        this.orders = [];
        this.users = [];
        this.settings = this.loadSettings();
        this.currentUser = this.loadCurrentUser();
        this.currentSection = 'dashboard';
        this.init();
    }

    // Инициализация
    init() {
        console.log('🚀 Админ-панель PRODTORG инициализирована');
        this.bindEvents();
        this.loadData();
        this.updateUI();
        this.setupCharts();
        this.checkAuth();
    }

    // Проверка авторизации
    checkAuth() {
        // Если на странице login-admin.html - пропускаем
        if (window.location.pathname.includes('login-admin.html') || 
            window.location.pathname.includes('login-guest.html')) {
            return;
        }
        
        // Проверяем, авторизован ли администратор
        const adminUser = localStorage.getItem('adminUser');
        const guestUser = localStorage.getItem('guestUser');
        
        if (!adminUser && !guestUser) {
            // Если нет авторизации, перенаправляем на страницу выбора входа
            console.log('Не авторизован, перенаправляю...');
            // window.location.href = 'login.html'; // Раскомментировать позже
        } else if (adminUser) {
            this.currentUser = JSON.parse(adminUser);
        } else if (guestUser) {
            this.currentUser = JSON.parse(guestUser);
        }
    }

    // Загрузка настроек
    loadSettings() {
        try {
            // Сначала пробуем загрузить из файла
            this.loadSettingsFromFile();
            
            // Затем проверяем localStorage
            const saved = localStorage.getItem('storeSettings');
            if (saved) {
                const localSettings = JSON.parse(saved);
                // Объединяем настройки (локальные имеют приоритет)
                return { ...this.settings, ...localSettings };
            }
        } catch (error) {
            console.log('Используем настройки по умолчанию');
        }
        
        // Настройки по умолчанию
        return {
            store: {
                name: 'PRODTORG',
                slogan: 'Лучший интернет-магазин с синхронизацией Google Sheets',
                currency: '₽',
                language: 'ru'
            },
            colors: {
                primary: '#007bff',
                secondary: '#6c757d',
                accent: '#28a745',
                background: '#f8f9fa'
            },
            layout: {
                showFeatured: true,
                showCategories: true,
                showTestimonials: true,
                showBlog: true
            },
            features: {
                guestCheckout: true,
                enableReviews: true
            }
        };
    }

    // Загрузка настроек из файла
    async loadSettingsFromFile() {
        try {
            const response = await fetch('data/settings.json');
            if (response.ok) {
                this.settings = await response.json();
                console.log('Настройки загружены из файла');
            }
        } catch (error) {
            console.log('Не удалось загрузить настройки из файла');
        }
    }

    // Загрузка текущего пользователя
    loadCurrentUser() {
        const adminUser = localStorage.getItem('adminUser');
        const guestUser = localStorage.getItem('guestUser');
        
        if (adminUser) {
            return JSON.parse(adminUser);
        } else if (guestUser) {
            return JSON.parse(guestUser);
        }
        
        return { 
            name: 'Администратор', 
            role: 'admin',
            email: 'admin@prodtorg.ru'
        };
    }

    // Привязка событий
    bindEvents() {
        console.log('Привязываю события...');
        
        // Навигация по меню
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
                this.setActiveMenuItem(item);
            });
        });

        // Вкладки настроек
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = tab.dataset.tab;
                this.switchSettingsTab(tabId);
                this.setActiveSettingsTab(tab);
            });
        });

        // Методы импорта
        document.querySelectorAll('.import-method').forEach(method => {
            method.addEventListener('click', (e) => {
                const methodType = method.dataset.method;
                this.switchImportMethod(methodType);
                this.setActiveImportMethod(method);
            });
        });

        // Цветовые пикеры
        document.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateColorPreview(e.target);
            });
        });

        // Готовые темы
        document.querySelectorAll('.preset-item').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const theme = preset.dataset.preset;
                this.applyTheme(theme);
            });
        });

        // Сохранение настроек
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Сброс настроек
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                if (confirm('Сбросить все настройки к стандартным?')) {
                    this.resetSettings();
                }
            });
        }

        // Выход из системы
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Поиск товаров
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Импорт из Google Sheets
        const startImportBtn = document.getElementById('startImportBtn');
        if (startImportBtn) {
            startImportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startImportFromGoogleSheets();
            });
        }

        // Проверка подключения
        const testConnectionBtn = document.getElementById('testConnectionBtn');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.testGoogleSheetsConnection();
            });
        }

        // Добавление товара
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAddProductModal();
            });
        }

        // Обновление товаров
        const refreshBtn = document.getElementById('refreshProductsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadProducts();
            });
        }

        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Обработка клавиши ESC для закрытия модалок
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Загрузка логотипа
        const uploadLogoBtn = document.getElementById('uploadLogoBtn');
        if (uploadLogoBtn) {
            uploadLogoBtn.addEventListener('click', () => {
                document.getElementById('storeLogo').click();
            });
        }

        const storeLogoInput = document.getElementById('storeLogo');
        if (storeLogoInput) {
            storeLogoInput.addEventListener('change', (e) => {
                this.handleLogoUpload(e.target);
            });
        }

        // Предпросмотр настроек
        const previewBtn = document.getElementById('previewSettingsBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previewSettings();
            });
        }

        // Массовые действия с товарами
        const bulkActionSelect = document.getElementById('bulkActionSelect');
        const applyBulkAction = document.getElementById('applyBulkAction');
        
        if (bulkActionSelect && applyBulkAction) {
            applyBulkAction.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyBulkAction();
            });
        }

        // Выделить все товары
        const selectAllProducts = document.getElementById('selectAllProducts');
        if (selectAllProducts) {
            selectAllProducts.addEventListener('change', (e) => {
                this.toggleSelectAllProducts(e.target.checked);
            });
        }

        console.log('Все события привязаны!');
    }

    // Переключение секций
    switchSection(sectionId) {
        console.log('Переключаю на секцию:', sectionId);
        
        // Скрыть все секции
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Показать выбранную секцию
        const targetSection = document.getElementById(sectionId + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Загружаем данные для секции если нужно
            this.loadSectionData(sectionId);
        } else {
            console.error('Секция не найдена:', sectionId + 'Section');
        }
    }

    // Загрузка данных для секции
    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'analytics':
                this.updateCharts();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    // Установка активного пункта меню
    setActiveMenuItem(menuItem) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        menuItem.classList.add('active');
    }

    // Переключение вкладок настроек
    switchSettingsTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        const targetTab = document.getElementById(tabId + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    // Установка активной вкладки настроек
    setActiveSettingsTab(tabElement) {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        tabElement.classList.add('active');
    }

    // Переключение методов импорта
    switchImportMethod(methodId) {
        document.querySelectorAll('.import-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(methodId + 'Import');
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    // Установка активного метода импорта
    setActiveImportMethod(methodElement) {
        document.querySelectorAll('.import-method').forEach(method => {
            method.classList.remove('active');
        });
        methodElement.classList.add('active');
    }

    // Обновление превью цвета
    updateColorPreview(input) {
        const colorValueElement = document.getElementById(input.id + 'Value');
        if (colorValueElement) {
            colorValueElement.textContent = input.value;
        }

        const previewElement = input.closest('.color-picker-item').querySelector('.color-preview');
        if (previewElement) {
            previewElement.style.backgroundColor = input.value;
        }
    }

    // Применение готовой темы
    applyTheme(themeName) {
        console.log('Применяю тему:', themeName);
        
        const themes = {
            default: {
                primary: '#007bff',
                secondary: '#6c757d',
                accent: '#28a745',
                background: '#f8f9fa'
            },
            green: {
                primary: '#28a745',
                secondary: '#20c997',
                accent: '#007bff',
                background: '#f8f9fa'
            },
            purple: {
                primary: '#6f42c1',
                secondary: '#e83e8c',
                accent: '#007bff',
                background: '#f8f9fa'
            },
            dark: {
                primary: '#343a40',
                secondary: '#212529',
                accent: '#007bff',
                background: '#f5f5f5'
            }
        };

        const theme = themes[themeName] || themes.default;
        
        // Обновляем значения в полях ввода
        const primaryInput = document.getElementById('primaryColor');
        const secondaryInput = document.getElementById('secondaryColor');
        const accentInput = document.getElementById('accentColor');
        const backgroundInput = document.getElementById('backgroundColor');
        
        if (primaryInput) primaryInput.value = theme.primary;
        if (secondaryInput) secondaryInput.value = theme.secondary;
        if (accentInput) accentInput.value = theme.accent;
        if (backgroundInput) backgroundInput.value = theme.background;

        // Обновляем превью
        if (primaryInput) this.updateColorPreview(primaryInput);
        if (secondaryInput) this.updateColorPreview(secondaryInput);
        if (accentInput) this.updateColorPreview(accentInput);
        if (backgroundInput) this.updateColorPreview(backgroundInput);
        
        this.showNotification(`Тема "${themeName}" применена`, 'success');
    }

    // Сохранение настроек
    saveSettings() {
        console.log('Сохраняю настройки...');
        
        try {
            const settings = {
                store: {
                    name: document.getElementById('storeName').value,
                    currency: document.getElementById('storeCurrency').value,
                    language: document.getElementById('storeLanguage').value
                },
                colors: {
                    primary: document.getElementById('primaryColor').value,
                    secondary: document.getElementById('secondaryColor').value,
                    accent: document.getElementById('accentColor').value,
                    background: document.getElementById('backgroundColor').value
                },
                layout: {
                    showFeatured: document.getElementById('showFeatured').checked,
                    showCategories: document.getElementById('showCategories').checked,
                    showTestimonials: document.getElementById('showTestimonials').checked,
                    showBlog: document.getElementById('showBlog').checked
                },
                content: {
                    homepageTitle: document.getElementById('homepageTitle').value,
                    homepageDescription: document.getElementById('homepageDescription').value,
                    footerText: document.getElementById('footerText').value
                }
            };

            // Сохраняем в localStorage
            localStorage.setItem('storeSettings', JSON.stringify(settings));
            
            // Обновляем текущие настройки
            this.settings = settings;
            
            this.showNotification('Настройки сохранены успешно!', 'success');
            
            // Обновляем настройки в реальном времени
            this.applySettingsToStore();
            
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            this.showNotification('Ошибка сохранения настроек', 'error');
        }
    }

    // Сброс настроек
    resetSettings() {
        localStorage.removeItem('storeSettings');
        this.settings = this.loadSettings();
        this.loadSettingsForm();
        this.showNotification('Настройки сброшены к стандартным', 'success');
    }

    // Загрузка формы настроек
    loadSettingsForm() {
        // Заполняем форму значениями из настроек
        const storeName = document.getElementById('storeName');
        const primaryColor = document.getElementById('primaryColor');
        const secondaryColor = document.getElementById('secondaryColor');
        const accentColor = document.getElementById('accentColor');
        const backgroundColor = document.getElementById('backgroundColor');
        const storeCurrency = document.getElementById('storeCurrency');
        const storeLanguage = document.getElementById('storeLanguage');
        const homepageTitle = document.getElementById('homepageTitle');
        const homepageDescription = document.getElementById('homepageDescription');
        const footerText = document.getElementById('footerText');
        const showFeatured = document.getElementById('showFeatured');
        const showCategories = document.getElementById('showCategories');
        const showTestimonials = document.getElementById('showTestimonials');
        const showBlog = document.getElementById('showBlog');

        if (storeName && this.settings.store) storeName.value = this.settings.store.name || 'PRODTORG';
        if (primaryColor && this.settings.colors) primaryColor.value = this.settings.colors.primary || '#007bff';
        if (secondaryColor && this.settings.colors) secondaryColor.value = this.settings.colors.secondary || '#6c757d';
        if (accentColor && this.settings.colors) accentColor.value = this.settings.colors.accent || '#28a745';
        if (backgroundColor && this.settings.colors) backgroundColor.value = this.settings.colors.background || '#f8f9fa';
        if (storeCurrency && this.settings.store) storeCurrency.value = this.settings.store.currency || '₽';
        if (storeLanguage && this.settings.store) storeLanguage.value = this.settings.store.language || 'ru';
        if (homepageTitle && this.settings.content) homepageTitle.value = this.settings.content.homepageTitle || 'Добро пожаловать в PRODTORG';
        if (homepageDescription && this.settings.content) homepageDescription.value = this.settings.content.homepageDescription || 'Лучший интернет-магазин с синхронизацией Google Sheets';
        if (footerText && this.settings.content) footerText.value = this.settings.content.footerText || '© 2024 PRODTORG. Все права защищены.';
        if (showFeatured && this.settings.layout) showFeatured.checked = this.settings.layout.showFeatured !== false;
        if (showCategories && this.settings.layout) showCategories.checked = this.settings.layout.showCategories !== false;
        if (showTestimonials && this.settings.layout) showTestimonials.checked = this.settings.layout.showTestimonials !== false;
        if (showBlog && this.settings.layout) showBlog.checked = this.settings.layout.showBlog !== false;

        // Обновляем превью
        if (primaryColor) this.updateColorPreview(primaryColor);
        if (secondaryColor) this.updateColorPreview(secondaryColor);
        if (accentColor) this.updateColorPreview(accentColor);
        if (backgroundColor) this.updateColorPreview(backgroundColor);
    }

    // Применение настроек к магазину
    applySettingsToStore() {
        // Применяем настройки к основному магазину
        const settings = this.settings;
        
        // Сохраняем в localStorage магазина
        localStorage.setItem('storeSettings', JSON.stringify(settings));
        
        // Отправляем сообщение если магазин открыт в другой вкладке
        try {
            if (window.opener) {
                window.opener.postMessage({
                    type: 'SETTINGS_UPDATED',
                    settings: settings
                }, '*');
            }
            
            // Также отправляем через localStorage для синхронизации
            window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
            
        } catch (error) {
            console.log('Не удалось синхронизировать настройки:', error);
        }
    }

    // Загрузка всех данных
    loadData() {
        console.log('Загружаю данные...');
        this.loadProducts();
        this.loadOrders();
        this.loadUsers();
        this.loadSettingsForm();
    }

    // Загрузка товаров
    async loadProducts() {
        console.log('Загружаю товары...');
        try {
            // Пробуем загрузить из Google Sheets
            const response = await fetch('https://docs.google.com/spreadsheets/d/1udzmDOhQVIUf86IM2GXUFfYm_oOoTlGl6doZdImPr-s/export?format=csv');
            
            if (response.ok) {
                const csvData = await response.text();
                this.products = this.parseCSV(csvData);
                console.log('Товары загружены из Google Sheets:', this.products.length);
            } else {
                throw new Error('Не удалось загрузить из Google Sheets');
            }
            
        } catch (error) {
            console.log('Пробую загрузить демо-товары...');
            // Загружаем демо-данные
            await this.loadDemoProducts();
        }
        
        // Обновляем счетчик товаров
        const totalProductsEl = document.getElementById('totalProducts');
        if (totalProductsEl) {
            totalProductsEl.textContent = this.products.length;
        }
        
        // Отображаем товары в таблице
        this.renderProductsTable();
        
        // Заполняем фильтр категорий
        this.populateCategoryFilter();
        
        this.showNotification('Товары загружены', 'success');
    }

    // Загрузка демо-товаров из файла
    async loadDemoProducts() {
        try {
            // Пробуем загрузить из файла на GitHub Pages
            const response = await fetch('data/demo-products.json');
            
            if (response.ok) {
                this.products = await response.json();
                console.log('Демо-товары загружены из файла:', this.products.length);
            } else {
                throw new Error('Файл не найден');
            }
            
        } catch (error) {
            console.log('Используем встроенные демо-данные');
            // Используем старый метод как fallback
            this.loadLocalDemoProducts();
        }
    }

    // Загрузка локальных демо-товаров
    loadLocalDemoProducts() {
        this.products = [
            { 
                id: 1, 
                name: 'Ноутбук HP Pavilion', 
                category: 'Электроника', 
                price: '65900', 
                stock: '12', 
                status: 'active',
                image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
                description: 'Мощный ноутбук для работы и игр'
            },
            { 
                id: 2, 
                name: 'Смартфон Samsung Galaxy', 
                category: 'Электроника', 
                price: '44990', 
                stock: '25', 
                status: 'active',
                image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
                description: 'Флагманский смартфон с отличной камерой'
            },
            { 
                id: 3, 
                name: 'Наушники Sony WH-1000XM4', 
                category: 'Аксессуары', 
                price: '24990', 
                stock: '8', 
                status: 'active',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                description: 'Беспроводные наушники с шумоподавлением'
            },
            { 
                id: 4, 
                name: 'Кофемашина De\'Longhi', 
                category: 'Бытовая техника', 
                price: '34990', 
                stock: '5', 
                status: 'active',
                image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
                description: 'Автоматическая кофемашина для дома'
            },
            { 
                id: 5, 
                name: 'Фитнес-браслет Xiaomi Mi Band', 
                category: 'Спорт', 
                price: '3490', 
                stock: '0', 
                status: 'outofstock',
                image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288',
                description: 'Умный браслет для отслеживания активности'
            }
        ];
        console.log('Используются локальные демо-данные:', this.products.length);
    }

    // Парсинг CSV
    parseCSV(csvText) {
        try {
            const lines = csvText.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) return [];
            
            const headers = lines[0].split(',').map(h => h.trim());
            
            const products = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length === headers.length) {
                    const product = {};
                    headers.forEach((header, index) => {
                        product[header] = values[index];
                    });
                    
                    // Добавляем ID если нет
                    if (!product.id) product.id = Date.now() + i;
                    if (!product.status) product.status = 'active';
                    
                    products.push(product);
                }
            }
            
            return products;
        } catch (error) {
            console.error('Ошибка парсинга CSV:', error);
            return [];
        }
    }

    // Отображение таблицы товаров
    renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) {
            console.log('Таблица товаров не найдена');
            return;
        }

        tbody.innerHTML = '';
        
        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <i class="fas fa-box-open fa-2x" style="color: #ccc; margin-bottom: 10px;"></i>
                        <p>Товары не найдены</p>
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.loadProducts()">
                            <i class="fas fa-sync"></i> Загрузить товары
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.products.forEach(product => {
            const row = document.createElement('tr');
            
            const imageHtml = product.image ? 
                `<img src="${product.image}" alt="${product.name}" class="product-image-thumb">` :
                `<div class="product-image-placeholder"><i class="fas fa-box"></i></div>`;
            
            row.innerHTML = `
                <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
                <td>${imageHtml}</td>
                <td><strong>${product.name}</strong></td>
                <td><span class="category-badge">${product.category || 'Без категории'}</span></td>
                <td>${this.formatPrice(product.price)}</td>
                <td><span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock || 0}</span></td>
                <td><span class="status-badge ${product.status || 'active'}">${this.getStatusText(product.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-id="${product.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${product.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn view" data-id="${product.id}" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        // Добавляем обработчики для кнопок действий
        this.bindProductActions();
        
        console.log('Таблица товаров обновлена:', this.products.length, 'товаров');
    }

    // Форматирование цены
    formatPrice(price) {
        const numPrice = parseFloat(price) || 0;
        return numPrice.toLocaleString('ru-RU') + ' ₽';
    }

    // Получение текста статуса
    getStatusText(status) {
        const statusMap = {
            'active': 'В наличии',
            'outofstock': 'Нет в наличии',
            'out-of-stock': 'Нет в наличии',
            'draft': 'Черновик',
            'archived': 'В архиве'
        };
        return statusMap[status] || status || 'В наличии';
    }

    // Привязка действий товаров
    bindProductActions() {
        // Редактирование товара
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = btn.dataset.id;
                this.editProduct(productId);
            });
        });

        // Удаление товара
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = btn.dataset.id;
                this.deleteProduct(productId);
            });
        });

        // Просмотр товара
        document.querySelectorAll('.action-btn.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = btn.dataset.id;
                this.viewProduct(productId);
            });
        });
    }

    // Заполнение фильтра категорий
    populateCategoryFilter() {
        const filter = document.getElementById('categoryFilter');
        if (!filter) return;

        // Очищаем существующие опции, кроме первой
        while (filter.options.length > 1) {
            filter.remove(1);
        }

        // Получаем уникальные категории
        const categories = [...new Set(this.products.map(p => p.category).filter(Boolean))];
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filter.appendChild(option);
        });
    }

    // Поиск товаров
    searchProducts(query) {
        if (!query.trim()) {
            this.renderProductsTable();
            return;
        }

        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.renderFilteredProducts(filteredProducts);
    }

    // Отображение отфильтрованных товаров
    renderFilteredProducts(products) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <i class="fas fa-search fa-2x" style="color: #ccc; margin-bottom: 10px;"></i>
                        <p>По запросу ничего не найдено</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            const imageHtml = product.image ? 
                `<img src="${product.image}" alt="${product.name}" class="product-image-thumb">` :
                `<div class="product-image-placeholder"><i class="fas fa-box"></i></div>`;
            
            row.innerHTML = `
                <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>
                <td>${imageHtml}</td>
                <td><strong>${product.name}</strong></td>
                <td><span class="category-badge">${product.category || 'Без категории'}</span></td>
                <td>${this.formatPrice(product.price)}</td>
                <td><span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock || 0}</span></td>
                <td><span class="status-badge ${product.status || 'active'}">${this.getStatusText(product.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        this.bindProductActions();
    }

    // Начало импорта из Google Sheets
    async startImportFromGoogleSheets() {
        const urlInput = document.getElementById('googleSheetUrl');
        if (!urlInput) {
            this.showNotification('Поле с ссылкой не найдено', 'error');
            return;
        }

        const url = urlInput.value.trim();
        
        if (!url) {
            this.showNotification('Введите ссылку на Google Таблицу', 'error');
            return;
        }

        // Показываем прогресс
        this.showImportProgress();
        
        try {
            // Извлекаем ID таблицы из URL
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) {
                throw new Error('Неверный формат ссылки на Google Таблицу. Пример правильной ссылки: https://docs.google.com/spreadsheets/d/1abc123/edit');
            }

            const sheetId = match[1];
            const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
            
            console.log('Загружаю данные с:', exportUrl);
            
            // Обновляем прогресс
            this.updateImportProgress(30, 'Подключение к Google Sheets...');
            
            const response = await fetch(exportUrl);
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
            }
            
            const csvData = await response.text();
            
            // Обновляем прогресс
            this.updateImportProgress(60, 'Обработка данных...');
            
            // Парсим CSV
            const importedProducts = this.parseCSV(csvData);
            
            // Обновляем прогресс
            this.updateImportProgress(80, 'Сохранение товаров...');
            
            // Сохраняем товары
            this.products = importedProducts;
            localStorage.setItem('products', JSON.stringify(importedProducts));
            
            // Обновляем прогресс
            this.updateImportProgress(100, 'Импорт завершен!');
            
            // Показываем результаты
            this.showImportResults(importedProducts.length, 0, 0);
            
            // Обновляем интерфейс
            this.loadProducts();
            
            this.showNotification(`Успешно импортировано ${importedProducts.length} товаров`, 'success');
            
        } catch (error) {
            console.error('Ошибка импорта:', error);
            this.showNotification(`Ошибка импорта: ${error.message}`, 'error');
            this.hideImportProgress();
        }
    }

    // Показать прогресс импорта
    showImportProgress() {
        const progress = document.getElementById('importProgress');
        const results = document.getElementById('importResults');
        
        if (progress) progress.style.display = 'block';
        if (results) results.style.display = 'none';
        
        this.updateImportProgress(0, 'Начинаем импорт...');
    }

    // Обновить прогресс импорта
    updateImportProgress(percent, status) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const progressStatus = document.getElementById('progressStatus');
        const importedCount = document.getElementById('importedCount');
        
        if (progressFill) {
            progressFill.style.width = percent + '%';
            progressFill.style.transition = 'width 0.3s ease';
        }
        if (progressPercent) progressPercent.textContent = percent + '%';
        if (progressStatus) progressStatus.textContent = status;
        if (importedCount) importedCount.textContent = `Прогресс: ${percent}%`;
    }

    // Скрыть прогресс импорта
    hideImportProgress() {
        const progress = document.getElementById('importProgress');
        if (progress) progress.style.display = 'none';
    }

    // Показать результаты импорта
    showImportResults(successCount, errorCount, skippedCount) {
        const results = document.getElementById('importResults');
        const progress = document.getElementById('importProgress');
        
        if (results) {
            const successEl = document.getElementById('importSuccessCount');
            const errorEl = document.getElementById('importErrorCount');
            const skippedEl = document.getElementById('importSkippedCount');
            
            if (successEl) successEl.textContent = successCount;
            if (errorEl) errorEl.textContent = errorCount;
            if (skippedEl) skippedEl.textContent = skippedCount;
            
            results.style.display = 'block';
        }
        
        if (progress) progress.style.display = 'none';
    }

    // Тест подключения к Google Sheets
    async testGoogleSheetsConnection() {
        const urlInput = document.getElementById('googleSheetUrl');
        if (!urlInput) return;

        const url = urlInput.value.trim();
        
        if (!url) {
            this.showNotification('Введите ссылку на Google Таблицу', 'error');
            return;
        }

        try {
            this.showNotification('Проверяем подключение...', 'info');
            
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) {
                throw new Error('Неверный формат ссылки. Пример: https://docs.google.com/spreadsheets/d/1abc123/edit');
            }

            const sheetId = match[1];
            const testUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
            
            const response = await fetch(testUrl, { method: 'HEAD' });
            
            if (response.ok) {
                this.showNotification('✅ Подключение успешно установлено! Таблица доступна для импорта.', 'success');
            } else {
                throw new Error(`Не удалось получить доступ к таблице: ${response.status}`);
            }
            
        } catch (error) {
            this.showNotification(`❌ Ошибка подключения: ${error.message}`, 'error');
        }
    }

    // Загрузка заказов
    loadOrders() {
        try {
            const savedOrders = localStorage.getItem('orders');
            if (savedOrders) {
                this.orders = JSON.parse(savedOrders);
            } else {
                // Демо-заказы
                this.orders = [
                    { 
                        id: 1001, 
                        customer: 'Иван Иванов', 
                        email: 'ivan@example.com',
                        phone: '+7 999 123-45-67',
                        date: '2024-03-15', 
                        amount: '12450', 
                        status: 'completed',
                        products: ['Ноутбук HP Pavilion', 'Сумка для ноутбука']
                    },
                    { 
                        id: 1002, 
                        customer: 'Мария Петрова', 
                        email: 'maria@example.com',
                        phone: '+7 999 234-56-78',
                        date: '2024-03-14', 
                        amount: '8500', 
                        status: 'processing',
                        products: ['Наушники Sony']
                    },
                    { 
                        id: 1003, 
                        customer: 'Алексей Сидоров', 
                        email: 'alex@example.com',
                        phone: '+7 999 345-67-89',
                        date: '2024-03-13', 
                        amount: '32000', 
                        status: 'pending',
                        products: ['Смартфон Samsung Galaxy']
                    },
                    { 
                        id: 1004, 
                        customer: 'Елена Кузнецова', 
                        email: 'elena@example.com',
                        phone: '+7 999 456-78-90',
                        date: '2024-03-12', 
                        amount: '15600', 
                        status: 'completed',
                        products: ['Кофемашина De\'Longhi', 'Кофе 250г']
                    }
                ];
            }
            
            this.renderOrdersTable();
            
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        }
    }

    // Отображение таблицы заказов
    renderOrdersTable() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (this.orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <i class="fas fa-shopping-cart fa-2x" style="color: #ccc; margin-bottom: 10px;"></i>
                        <p>Заказов пока нет</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.orders.forEach(order => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div class="customer-info">
                        <div class="customer-name">${order.customer}</div>
                        <div class="customer-contact">${order.phone || ''}</div>
                    </div>
                </td>
                <td>${order.date}</td>
                <td>${this.formatPrice(order.amount)}</td>
                <td><span class="order-status ${order.status}">${this.getOrderStatusText(order.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-order-id="${order.id}" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" data-order-id="${order.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        // Привязываем события для заказов
        this.bindOrderActions();
    }

    // Получение текста статуса заказа
    getOrderStatusText(status) {
        const statusMap = {
            'pending': 'Ожидает',
            'processing': 'В обработке',
            'completed': 'Завершен',
            'cancelled': 'Отменен',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен'
        };
        return statusMap[status] || status;
    }

    // Привязка действий заказов
    bindOrderActions() {
        // Просмотр заказа
        document.querySelectorAll('.action-btn.view[data-order-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.orderId;
                this.viewOrder(orderId);
            });
        });

        // Редактирование заказа
        document.querySelectorAll('.action-btn.edit[data-order-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.orderId;
                this.editOrder(orderId);
            });
        });
    }

    // Загрузка пользователей
    loadUsers() {
        // Пока заглушка
        this.users = [
            { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', role: 'customer', registered: '2024-01-15' },
            { id: 2, name: 'Мария Петрова', email: 'maria@example.com', role: 'customer', registered: '2024-02-20' },
            { id: 3, name: 'Администратор', email: 'admin@prodtorg.ru', role: 'admin', registered: '2024-01-01' }
        ];
    }

    // Настройка графиков
    setupCharts() {
        // Отложим инициализацию до загрузки данных
        setTimeout(() => {
            this.updateCharts();
        }, 1000);
    }

    // Обновление графиков
    updateCharts() {
        this.setupSalesChart();
        this.setupCategoriesChart();
    }

    // Настройка графика продаж
    setupSalesChart() {
        const ctx = document.getElementById('salesChartCanvas');
        if (!ctx) return;

        // Очищаем старый график
        if (window.salesChart) {
            window.salesChart.destroy();
        }

        const salesData = [12000, 19000, 15000, 25000, 22000, 30000, 28000];
        
        window.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                datasets: [{
                    label: 'Продажи (₽)',
                    data: salesData,
                    borderColor: this.settings.colors?.primary || '#007bff',
                    backgroundColor: this.hexToRgba(this.settings.colors?.primary || '#007bff', 0.1),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.settings.colors?.primary || '#007bff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Продажи: ' + context.parsed.y.toLocaleString('ru-RU') + ' ₽';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('ru-RU') + ' ₽';
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }

    // Настройка графика категорий
    setupCategoriesChart() {
        const ctx = document.getElementById('categoriesChartCanvas');
        if (!ctx) return;

        // Очищаем старый график
        if (window.categoriesChart) {
            window.categoriesChart.destroy();
        }

        // Группируем товары по категориям
        const categories = {};
        this.products.forEach(product => {
            const category = product.category || 'Без категории';
            categories[category] = (categories[category] || 0) + 1;
        });

        const categoryNames = Object.keys(categories);
        const categoryCounts = Object.values(categories);
        
        // Цвета для категорий
        const colors = [
            this.settings.colors?.primary || '#007bff',
            this.settings.colors?.accent || '#28a745',
            this.settings.colors?.secondary || '#6c757d',
            '#ffc107',
            '#dc3545',
            '#6f42c1',
            '#17a2b8'
        ];

        window.categoriesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryNames,
                datasets: [{
                    data: categoryCounts,
                    backgroundColor: colors.slice(0, categoryNames.length),
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} товаров (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Конвертация HEX в RGBA
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Редактирование товара
    editProduct(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            this.openEditProductModal(product);
        }
    }

    // Удаление товара
    deleteProduct(productId) {
        if (confirm('Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.')) {
            this.products = this.products.filter(p => p.id != productId);
            localStorage.setItem('products', JSON.stringify(this.products));
            this.renderProductsTable();
            this.showNotification('Товар удален', 'success');
        }
    }

    // Просмотр товара
    viewProduct(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            this.openViewProductModal(product);
        }
    }

    // Просмотр заказа
    viewOrder(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (order) {
            this.openViewOrderModal(order);
        }
    }

    // Редактирование заказа
    editOrder(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (order) {
            this.openEditOrderModal(order);
        }
    }

    // Открытие модалки добавления товара
    openAddProductModal() {
        const categories = [...new Set(this.products.map(p => p.category).filter(Boolean))];
        
        this.openModal(`
            <form id="productForm" class="modal-form">
                <div class="form-group">
                    <label for="productName">Название товара *</label>
                    <input type="text" id="productName" required placeholder="Введите название товара">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="productCategory">Категория</label>
                        <select id="productCategory">
                            <option value="">Выберите категорию</option>
                            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            <option value="other">Другая...</option>
                        </select>
                        <input type="text" id="newCategory" style="display: none; margin-top: 5px;" placeholder="Введите новую категорию">
                    </div>
                    
                    <div class="form-group">
                        <label for="productPrice">Цена (₽) *</label>
                        <input type="number" id="productPrice" min="0" step="0.01" required placeholder="0.00">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="productStock">Количество *</label>
                        <input type="number" id="productStock" min="0" required placeholder="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="productStatus">Статус</label>
                        <select id="productStatus">
                            <option value="active">В наличии</option>
                            <option value="outofstock">Нет в наличии</option>
                            <option value="draft">Черновик</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="productImage">Ссылка на изображение</label>
                    <input type="url" id="productImage" placeholder="https://example.com/image.jpg">
                    <small class="form-hint">Оставьте пустым для изображения по умолчанию</small>
                </div>
                
                <div class="form-group">
                    <label for="productDescription">Описание</label>
                    <textarea id="productDescription" rows="4" placeholder="Подробное описание товара..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Сохранить товар
                    </button>
                    <button type="button" class="btn btn-secondary modal-close">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </form>
        `, '<i class="fas fa-plus"></i> Добавить товар');

        // Обработка выбора категории
        const categorySelect = document.getElementById('productCategory');
        const newCategoryInput = document.getElementById('newCategory');
        
        if (categorySelect && newCategoryInput) {
            categorySelect.addEventListener('change', (e) => {
                if (e.target.value === 'other') {
                    newCategoryInput.style.display = 'block';
                    newCategoryInput.required = true;
                } else {
                    newCategoryInput.style.display = 'none';
                    newCategoryInput.required = false;
                }
            });
        }

        // Обработка формы
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNewProduct();
            });
        }
    }

    // Открытие модалки редактирования товара
    openEditProductModal(product) {
        const categories = [...new Set(this.products.map(p => p.category).filter(Boolean))];
        
        this.openModal(`
            <form id="editProductForm" class="modal-form">
                <input type="hidden" id="editProductId" value="${product.id}">
                
                <div class="form-group">
                    <label for="editProductName">Название товара *</label>
                    <input type="text" id="editProductName" value="${product.name || ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editProductCategory">Категория</label>
                        <select id="editProductCategory">
                            <option value="">Выберите категорию</option>
                            ${categories.map(cat => 
                                `<option value="${cat}" ${cat === product.category ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                            <option value="other" ${!categories.includes(product.category) && product.category ? 'selected' : ''}>
                                Другая...
                            </option>
                        </select>
                        <input type="text" id="editNewCategory" 
                               value="${!categories.includes(product.category) && product.category ? product.category : ''}"
                               style="${!categories.includes(product.category) && product.category ? 'display: block; margin-top: 5px;' : 'display: none; margin-top: 5px;'}" 
                               placeholder="Введите новую категорию">
                    </div>
                    
                    <div class="form-group">
                        <label for="editProductPrice">Цена (₽) *</label>
                        <input type="number" id="editProductPrice" value="${product.price || ''}" min="0" step="0.01" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editProductStock">Количество *</label>
                        <input type="number" id="editProductStock" value="${product.stock || 0}" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editProductStatus">Статус</label>
                        <select id="editProductStatus">
                            <option value="active" ${(product.status || 'active') === 'active' ? 'selected' : ''}>В наличии</option>
                            <option value="outofstock" ${product.status === 'outofstock' ? 'selected' : ''}>Нет в наличии</option>
                            <option value="draft" ${product.status === 'draft' ? 'selected' : ''}>Черновик</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editProductImage">Ссылка на изображение</label>
                    <input type="url" id="editProductImage" value="${product.image || ''}" placeholder="https://example.com/image.jpg">
                    <small class="form-hint">Оставьте пустым для изображения по умолчанию</small>
                </div>
                
                <div class="form-group">
                    <label for="editProductDescription">Описание</label>
                    <textarea id="editProductDescription" rows="4">${product.description || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                    <button type="button" class="btn btn-secondary modal-close">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </form>
        `, '<i class="fas fa-edit"></i> Редактировать товар');

        // Обработка выбора категории
        const categorySelect = document.getElementById('editProductCategory');
        const newCategoryInput = document.getElementById('editNewCategory');
        
        if (categorySelect && newCategoryInput) {
            categorySelect.addEventListener('change', (e) => {
                if (e.target.value === 'other') {
                    newCategoryInput.style.display = 'block';
                    newCategoryInput.required = true;
                } else {
                    newCategoryInput.style.display = 'none';
                    newCategoryInput.required = false;
                }
            });
        }

        // Обработка формы
        const form = document.getElementById('editProductForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProductEdits();
            });
        }
    }

    // Открытие модалки просмотра товара
    openViewProductModal(product) {
        this.openModal(`
            <div class="product-view">
                <div class="product-view-header">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="product-view-image">` :
                        `<div class="product-view-image placeholder">
                            <i class="fas fa-box fa-3x"></i>
                        </div>`
                    }
                    <div class="product-view-info">
                        <h3>${product.name}</h3>
                        <div class="product-meta">
                            <span class="category-badge">${product.category || 'Без категории'}</span>
                            <span class="status-badge ${product.status || 'active'}">${this.getStatusText(product.status)}</span>
                        </div>
                        <div class="product-price">${this.formatPrice(product.price)}</div>
                    </div>
                </div>
                
                <div class="product-view-details">
                    <div class="detail-row">
                        <span class="detail-label">Остаток на складе:</span>
                        <span class="detail-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.stock || 0} шт.
                        </span>
                    </div>
                    
                    ${product.description ? `
                    <div class="detail-row">
                        <span class="detail-label">Описание:</span>
                        <div class="detail-value">${product.description}</div>
                    </div>
                    ` : ''}
                    
                    <div class="detail-row">
                        <span class="detail-label">ID товара:</span>
                        <span class="detail-value">${product.id}</span>
                    </div>
                </div>
                
                <div class="product-view-actions">
                    <button class="btn btn-primary" onclick="adminPanel.editProduct(${product.id}); adminPanel.closeModal();">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="btn btn-outline modal-close">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        `, '<i class="fas fa-eye"></i> Просмотр товара');
    }

    // Сохранение нового товара
    saveNewProduct() {
        try {
            const categorySelect = document.getElementById('productCategory');
            const newCategoryInput = document.getElementById('newCategory');
            const category = categorySelect.value === 'other' ? newCategoryInput.value : categorySelect.value;
            
            const product = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                category: category,
                price: document.getElementById('productPrice').value,
                stock: document.getElementById('productStock').value,
                status: document.getElementById('productStatus').value,
                image: document.getElementById('productImage').value || '',
                description: document.getElementById('productDescription').value
            };

            this.products.push(product);
            localStorage.setItem('products', JSON.stringify(this.products));
            
            this.renderProductsTable();
            this.closeModal();
            this.showNotification('Товар успешно добавлен!', 'success');
            
        } catch (error) {
            console.error('Ошибка сохранения товара:', error);
            this.showNotification('Ошибка при добавлении товара', 'error');
        }
    }

    // Сохранение изменений товара
    saveProductEdits() {
        try {
            const productId = parseInt(document.getElementById('editProductId').value);
            const productIndex = this.products.findIndex(p => p.id === productId);
            
            if (productIndex !== -1) {
                const categorySelect = document.getElementById('editProductCategory');
                const newCategoryInput = document.getElementById('editNewCategory');
                const category = categorySelect.value === 'other' ? newCategoryInput.value : categorySelect.value;
                
                this.products[productIndex] = {
                    ...this.products[productIndex],
                    name: document.getElementById('editProductName').value,
                    category: category,
                    price: document.getElementById('editProductPrice').value,
                    stock: document.getElementById('editProductStock').value,
                    status: document.getElementById('editProductStatus').value,
                    image: document.getElementById('editProductImage').value || '',
                    description: document.getElementById('editProductDescription').value
                };

                localStorage.setItem('products', JSON.stringify(this.products));
                this.renderProductsTable();
                this.closeModal();
                this.showNotification('Изменения сохранены успешно!', 'success');
            } else {
                throw new Error('Товар не найден');
            }
            
        } catch (error) {
            console.error('Ошибка сохранения изменений:', error);
            this.showNotification('Ошибка при сохранении изменений', 'error');
        }
    }

    // Открытие модалки просмотра заказа
    openViewOrderModal(order) {
        this.openModal(`
            <div class="order-view">
                <div class="order-view-header">
                    <h3>Заказ #${order.id}</h3>
                    <span class="order-status-badge ${order.status}">${this.getOrderStatusText(order.status)}</span>
                </div>
                
                <div class="order-view-details">
                    <div class="detail-section">
                        <h4>Информация о клиенте</h4>
                        <div class="detail-row">
                            <span class="detail-label">Имя:</span>
                            <span class="detail-value">${order.customer}</span>
                        </div>
                        ${order.email ? `
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${order.email}</span>
                        </div>
                        ` : ''}
                        ${order.phone ? `
                        <div class="detail-row">
                            <span class="detail-label">Телефон:</span>
                            <span class="detail-value">${order.phone}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <h4>Информация о заказе</h4>
                        <div class="detail-row">
                            <span class="detail-label">Дата заказа:</span>
                            <span class="detail-value">${order.date}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Сумма:</span>
                            <span class="detail-value">${this.formatPrice(order.amount)}</span>
                        </div>
                    </div>
                    
                    ${order.products && order.products.length > 0 ? `
                    <div class="detail-section">
                        <h4>Товары в заказе</h4>
                        <ul class="order-products">
                            ${order.products.map(product => `<li>${product}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                
                <div class="order-view-actions">
                    <button class="btn btn-primary" onclick="adminPanel.editOrder(${order.id}); adminPanel.closeModal();">
                        <i class="fas fa-edit"></i> Редактировать заказ
                    </button>
                    <button class="btn btn-outline modal-close">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        `, '<i class="fas fa-shopping-cart"></i> Просмотр заказа');
    }

    // Открытие модалки редактирования заказа
    openEditOrderModal(order) {
        this.openModal(`
            <form id="editOrderForm" class="modal-form">
                <input type="hidden" id="editOrderId" value="${order.id}">
                
                <div class="form-group">
                    <label for="editOrderStatus">Статус заказа</label>
                    <select id="editOrderStatus" class="form-control">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Ожидает</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Завершен</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editOrderCustomer">Имя клиента</label>
                    <input type="text" id="editOrderCustomer" value="${order.customer}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editOrderEmail">Email</label>
                        <input type="email" id="editOrderEmail" value="${order.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editOrderPhone">Телефон</label>
                        <input type="tel" id="editOrderPhone" value="${order.phone || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editOrderAmount">Сумма (₽)</label>
                    <input type="number" id="editOrderAmount" value="${order.amount}" min="0" step="0.01" required>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Сохранить изменения
                    </button>
                    <button type="button" class="btn btn-secondary modal-close">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </form>
        `, '<i class="fas fa-edit"></i> Редактировать заказ');

        // Обработка формы
        const form = document.getElementById('editOrderForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveOrderEdits();
            });
        }
    }

    // Сохранение изменений заказа
    saveOrderEdits() {
        try {
            const orderId = parseInt(document.getElementById('editOrderId').value);
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                this.orders[orderIndex] = {
                    ...this.orders[orderIndex],
                    status: document.getElementById('editOrderStatus').value,
                    customer: document.getElementById('editOrderCustomer').value,
                    email: document.getElementById('editOrderEmail').value,
                    phone: document.getElementById('editOrderPhone').value,
                    amount: document.getElementById('editOrderAmount').value
                };

                localStorage.setItem('orders', JSON.stringify(this.orders));
                this.renderOrdersTable();
                this.closeModal();
                this.showNotification('Изменения в заказе сохранены!', 'success');
            }
            
        } catch (error) {
            console.error('Ошибка сохранения заказа:', error);
            this.showNotification('Ошибка при сохранении заказа', 'error');
        }
    }

    // Открытие модального окна
    openModal(content, title = '') {
        const modal = document.getElementById('productModal');
        const overlay = document.getElementById('modalOverlay');
        const modalBody = modal.querySelector('.modal-body');
        const modalHeader = modal.querySelector('.modal-header h3');
        
        if (title) {
            modalHeader.innerHTML = title;
        }
        
        modalBody.innerHTML = content;
        modal.style.display = 'block';
        overlay.style.display = 'block';
        
        // Анимация появления
        setTimeout(() => {
            modal.style.opacity = '1';
            overlay.style.opacity = '1';
        }, 10);
        
        // Фокус на первом поле ввода
        setTimeout(() => {
            const firstInput = modalBody.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Закрытие модального окна
    closeModal() {
        const modal = document.getElementById('productModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.style.opacity = '0';
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                modal.style.display = 'none';
                overlay.style.display = 'none';
            }, 300);
        }
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'check-circle' :
                     type === 'error' ? 'exclamation-circle' :
                     type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Добавляем в тело документа
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Автоматическое скрытие
        const autoHide = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Кнопка закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoHide);
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
    }

    // Выход из системы
    logout() {
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('guestUser');
            
            // Перенаправляем на главную страницу магазина
            window.location.href = 'index.html';
        }
    }

    // Обновление интерфейса
    updateUI() {
        // Обновляем время последней синхронизации
        const syncTime = document.getElementById('lastSyncTime');
        if (syncTime) {
            const now = new Date();
            syncTime.textContent = now.toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Обновляем имя пользователя
        const adminName = document.getElementById('adminName');
        if (adminName && this.currentUser) {
            adminName.textContent = this.currentUser.name;
            
            // Обновляем роль
            const adminRole = document.querySelector('.admin-role');
            if (adminRole) {
                adminRole.textContent = this.currentUser.role === 'admin' ? 'Администратор' : 'Пользователь';
            }
        }

        // Обновляем название магазина в форме настроек
        const storeNameInput = document.getElementById('storeName');
        if (storeNameInput && this.settings.store) {
            storeNameInput.value = this.settings.store.name || 'PRODTORG';
        }
    }

    // Загрузка логотипа
    handleLogoUpload(input) {
        const file = input.files[0];
        if (!file) return;

        // Проверяем тип файла
        if (!file.type.match('image.*')) {
            this.showNotification('Пожалуйста, выберите изображение', 'error');
            return;
        }

        // Проверяем размер файла (макс 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('Изображение должно быть меньше 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const logoPreview = document.getElementById('logoPreview');
            const fileName = document.getElementById('logoFileName');
            
            if (logoPreview) {
                logoPreview.innerHTML = `<img src="${e.target.result}" alt="Логотип">`;
            }
            
            if (fileName) {
                fileName.textContent = file.name;
            }
            
            // Сохраняем в настройках
            if (this.settings.store) {
                this.settings.store.logo = e.target.result;
                this.saveSettings();
            }
            
            this.showNotification('Логотип загружен успешно', 'success');
        };
        
        reader.onerror = () => {
            this.showNotification('Ошибка при загрузке изображения', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    // Предпросмотр настроек
    previewSettings() {
        // Открываем главную страницу в новой вкладке
        window.open('index.html', '_blank');
        this.showNotification('Магазин открыт в новой вкладке для предпросмотра', 'info');
    }

    // Массовые действия с товарами
    applyBulkAction() {
        const select = document.getElementById('bulkActionSelect');
        if (!select) return;

        const action = select.value;
        if (!action) {
            this.showNotification('Выберите действие', 'warning');
            return;
        }

        const selectedProducts = document.querySelectorAll('.product-checkbox:checked');
        if (selectedProducts.length === 0) {
            this.showNotification('Выберите хотя бы один товар', 'warning');
            return;
        }

        const productIds = Array.from(selectedProducts).map(cb => cb.dataset.id);
        
        if (action === 'delete') {
            if (!confirm(`Удалить ${productIds.length} выбранных товаров?`)) {
                return;
            }
        }

        let updatedCount = 0;
        
        productIds.forEach(productId => {
            const productIndex = this.products.findIndex(p => p.id == productId);
            if (productIndex !== -1) {
                switch(action) {
                    case 'activate':
                        this.products[productIndex].status = 'active';
                        updatedCount++;
                        break;
                    case 'deactivate':
                        this.products[productIndex].status = 'outofstock';
                        updatedCount++;
                        break;
                    case 'delete':
                        this.products.splice(productIndex, 1);
                        updatedCount++;
                        break;
                }
            }
        });

        if (updatedCount > 0) {
            localStorage.setItem('products', JSON.stringify(this.products));
            this.renderProductsTable();
            
            let message = '';
            switch(action) {
                case 'activate':
                    message = `${updatedCount} товаров активировано`;
                    break;
                case 'deactivate':
                    message = `${updatedCount} товаров деактивировано`;
                    break;
                case 'delete':
                    message = `${updatedCount} товаров удалено`;
                    break;
            }
            
            this.showNotification(message, 'success');
            
            // Сбрасываем выбор
            const selectAll = document.getElementById('selectAllProducts');
            if (selectAll) selectAll.checked = false;
            
            // Сбрасываем выпадающий список
            select.value = '';
        }
    }

    // Выделить/снять выделение всех товаров
    toggleSelectAllProducts(checked) {
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    // Обновление статистики
    updateStatistics() {
        // Обновляем счетчики на дашборде
        const totalProducts = document.getElementById('totalProducts');
        if (totalProducts) {
            totalProducts.textContent = this.products.length;
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Страница админ-панели загружена');
    
    // Инициализируем админ-панель
    window.adminPanel = new AdminPanel();
    
    // Добавляем стили для уведомлений если их еще нет
    if (!document.getElementById('notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 9999;
            transform: translateX(150%);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 400px;
            border-left: 4px solid #007bff;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            border-left-color: #28a745;
        }
        
        .notification.error {
            border-left-color: #dc3545;
        }
        
        .notification.warning {
            border-left-color: #ffc107;
        }
        
        .notification.info {
            border-left-color: #17a2b8;
        }
        
        .notification i {
            font-size: 20px;
        }
        
        .notification.success i {
            color: #28a745;
        }
        
        .notification.error i {
            color: #dc3545;
        }
        
        .notification.warning i {
            color: #ffc107;
        }
        
        .notification.info i {
            color: #17a2b8;
        }
        
        .notification span {
            flex: 1;
            font-size: 14px;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6c757d;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
        }
        
        .notification-close:hover {
            background: #f8f9fa;
            color: #dc3545;
        }
        
        /* Дополнительные стили для таблиц */
        .category-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #e9ecef;
            border-radius: 20px;
            font-size: 12px;
            color: #495057;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-badge.active {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.outofstock, .status-badge.out-of-stock {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-badge.draft {
            background: #fff3cd;
            color: #856404;
        }
        
        .stock-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .stock-badge.in-stock {
            background: #d4edda;
            color: #155724;
        }
        
        .stock-badge.out-of-stock {
            background: #f8d7da;
            color: #721c24;
        }
        
        .order-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .order-status.pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .order-status.processing {
            background: #cce5ff;
            color: #004085;
        }
        
        .order-status.completed {
            background: #d4edda;
            color: #155724;
        }
        
        .order-status.cancelled {
            background: #f8d7da;
            color: #721c24;
        }
        
        .product-image-thumb {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 4px;
        }
        
        .product-image-placeholder {
            width: 50px;
            height: 50px;
            background: #f8f9fa;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
        }
        
        .action-buttons {
            display: flex;
            gap: 5px;
        }
        
        .action-btn {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 4px;
            background: #f8f9fa;
            color: #6c757d;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .action-btn:hover {
            background: #e9ecef;
            transform: translateY(-1px);
        }
        
        .action-btn.edit:hover {
            color: #007bff;
        }
        
        .action-btn.delete:hover {
            color: #dc3545;
        }
        
        .action-btn.view:hover {
            color: #28a745;
        }
        
        .text-center {
            text-align: center;
            padding: 40px 0;
        }
        
        .text-center i {
            margin-bottom: 10px;
        }
        
        /* Стили для модальных форм */
        .modal-form .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .modal-form .form-row .form-group {
            flex: 1;
        }
        
        .modal-form .form-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        /* Стили для просмотра товара/заказа */
        .product-view-header, .order-view-header {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .product-view-image {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .product-view-image.placeholder {
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .product-view-info h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        
        .product-meta {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .product-price {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
        }
        
        .product-view-details, .order-view-details {
            margin-bottom: 30px;
        }
        
        .detail-section {
            margin-bottom: 25px;
        }
        
        .detail-section h4 {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #495057;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        
        .detail-label {
            width: 140px;
            font-weight: 500;
            color: #6c757d;
        }
        
        .detail-value {
            flex: 1;
        }
        
        .order-products {
            margin: 0;
            padding-left: 20px;
        }
        
        .order-products li {
            margin-bottom: 5px;
        }
        
        .order-status-badge {
            display: inline-block;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .order-view-header {
            justify-content: space-between;
            align-items: center;
        }
        
        .order-view-header h3 {
            margin: 0;
        }
        `;
        document.head.appendChild(notificationStyles);
    }
    
    console.log('✅ Админ-панель готова к работе!');
});

// Глобальные вспомогательные функции
window.formatPrice = function(price) {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toLocaleString('ru-RU') + ' ₽';
};

// Экспорт для использования в консоли
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminPanel;
}
