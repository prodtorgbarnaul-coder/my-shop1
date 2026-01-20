// ============================================
// СИСТЕМА АВТОРИЗАЦИИ ДЛЯ АДМИН-ПАНЕЛИ
// ============================================

// База данных пользователей
const adminUsers = [
    { id: 1, login: 'admin', password: 'admin123', name: 'Администратор', role: 'admin', phone: '+7 (923) 753-36-06', email: 'prodtorg.barnaul@gmail.com' },
    { id: 2, login: 'prodtorg', password: 'prodtorg2024', name: 'PRODTORG Manager', role: 'manager', phone: '+7 (923) 753-36-06', email: 'prodtorg.barnaul@gmail.com' },
    { id: 3, login: 'manager', password: 'manager123', name: 'Менеджер', role: 'manager', phone: '+7 (923) 753-36-06', email: 'prodtorg.barnaul@gmail.com' }
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Инициализация системы авторизации...');
    
    // Проверяем, уже авторизован ли пользователь
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
        // Перенаправляем в админ-панель
        window.location.href = 'admin.html';
        return;
    }
    
    // Настраиваем обработчики
    setupLoginForm();
    
    console.log('✅ Система авторизации готова');
});

// Настройка формы входа
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performLogin();
    });
    
    // Нажатие Enter в поле пароля
    document.getElementById('password')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performLogin();
        }
    });
    
    // Автозаполнение логина, если запомнен
    const rememberedLogin = localStorage.getItem('rememberedLogin');
    if (rememberedLogin && document.getElementById('login')) {
        document.getElementById('login').value = rememberedLogin;
        document.getElementById('remember').checked = true;
    }
}

// Выполнение входа
function performLogin() {
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked;
    
    // Проверка заполнения полей
    if (!login || !password) {
        showLoginError('❌ Заполните все поля');
        return;
    }
    
    // Поиск пользователя
    const user = adminUsers.find(u => 
        u.login.toLowerCase() === login.toLowerCase() && u.password === password
    );
    
    if (user) {
        // Успешный вход
        loginSuccess(user, remember);
    } else {
        showLoginError('❌ Неверный логин или пароль');
    }
}

// Успешный вход
function loginSuccess(user, remember = false) {
    console.log(`✅ Успешный вход: ${user.name} (${user.role})`);
    
    // Сохраняем сессию
    localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        login: user.login,
        loginTime: new Date().toISOString()
    }));
    
    // Запоминаем логин, если выбрана опция
    if (remember && user.login) {
        localStorage.setItem('rememberedLogin', user.login);
    } else {
        localStorage.removeItem('rememberedLogin');
    }
    
    // Показываем уведомление
    showLoginMessage(`✅ Добро пожаловать, ${user.name}!`, 'success');
    
    // Перенаправляем
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1500);
}

// Показать ошибку входа
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (!errorDiv) return;
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    errorDiv.style.display = 'block';
    
    // Автоскрытие через 5 секунд
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Показать сообщение об успехе
function showLoginMessage(message, type = 'success') {
    const errorDiv = document.getElementById('loginError');
    if (!errorDiv) return;
    
    const icon = type === 'success' ? 'check-circle' : 'info-circle';
    const color = type === 'success' ? '#27ae60' : '#3498db';
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${icon}" style="color: ${color};"></i>
            <span>${message}</span>
        </div>
    `;
    errorDiv.style.display = 'block';
    errorDiv.style.background = type === 'success' ? 
        'linear-gradient(135deg, #d4edda, #c3e6cb)' : 
        'linear-gradient(135deg, #d1ecf1, #bee5eb)';
    errorDiv.style.color = type === 'success' ? '#155724' : '#0c5460';
    errorDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#bee5eb'}`;
}

// Сброс пароля
function resetPassword() {
    const login = prompt('Введите ваш логин для восстановления пароля:');
    if (!login) return;
    
    // Поиск пользователя
    const user = adminUsers.find(u => u.login === login);
    if (user) {
        alert(`Пароль для ${user.login}: ${user.password}\n\nРекомендуем изменить пароль в настройках после входа.`);
    } else {
        alert('Пользователь не найден');
    }
}

// Делаем функции доступными глобально
window.performLogin = performLogin;
window.resetPassword = resetPassword;
