console.log('🚀 admin-script.js ЗАГРУЖЕН И ВЫПОЛНЯЕТСЯ!');

// ============================================
// ОСНОВНАЯ ФУНКЦИЯ ВЫХОДА
// ============================================

function logoutAdmin() {
    console.log('🔄 Выход из админ-панели...');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminUser');
    window.location.href = 'login-admin.html';
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

function initAdminPanel() {
    console.log('⚡ Инициализация админ-панели');
    
    // Проверка авторизации
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
        console.log('❌ Нет авторизации. Редирект на страницу входа');
        window.location.href = 'login-admin.html';
        return;
    }
    
    console.log('✅ Авторизация подтверждена');
    
    // Установка обработчика кнопки "Выйти"
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAdmin);
        console.log('✅ Обработчик для кнопки "Выйти" установлен');
    } else {
        console.warn('⚠️ Кнопка "Выйти" не найдена в DOM');
    }
    
    // Обновление имени пользователя
    const userNameElement = document.getElementById('currentAdminName');
    if (userNameElement) {
        userNameElement.textContent = 'Администратор';
    }
    
    console.log('✅ Админ-панель готова к работе');
}

// ============================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================

// Ждем полной загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    // DOM уже загружен
    setTimeout(initAdminPanel, 100);
}

// Экспортируем функцию для тестирования в консоли
window.logoutAdmin = logoutAdmin;

console.log('✅ admin-script.js успешно инициализирован');
