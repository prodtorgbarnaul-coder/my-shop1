// ============================================
// СИСТЕМА АВТОРИЗАЦИИ ДЛЯ АДМИН-ПАНЕЛИ
// ============================================

// База данных пользователей (админы и гости)
let usersDatabase = {
    admins: [
        { id: 1, login: 'admin', password: 'admin123', name: 'Администратор', role: 'admin', phone: '+7 (923) 753-36-06', email: 'prodtorg.barnaul@gmail.com' },
        { id: 2, login: 'prodtorg', password: 'prodtorg2024', name: 'PRODTORG Manager', role: 'manager', phone: '+7 (923) 753-36-06', email: 'prodtorg.barnaul@gmail.com' },
        { id: 3, login: 'manager', password: 'manager123', name: 'Менеджер', role: 'manager', phone: '+7 (923) 753-36-06', email: 'prodtorg.barnaul@gmail.com' }
    ],
    guests: [] // Гости будут добавляться при регистрации
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Инициализация системы авторизации...');
    
    // Загружаем сохраненные данные
    loadSavedData();
    
    // Настраиваем обработчики
    setupLoginForm();
    
    console.log('✅ Система авторизации готова');
});

// Загрузка сохраненных данных
function loadSavedData() {
    // Загружаем гостей
    const savedGuests = localStorage.getItem('shopGuests');
    if (savedGuests) {
        usersDatabase.guests = JSON.parse(savedGuests);
        console.log(`👥 Загружено ${usersDatabase.guests.length} гостей`);
    }
}

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
    const admin = usersDatabase.admins.find(u => 
        u.login.toLowerCase() === login.toLowerCase() && u.password === password
    );
    
    if (admin) {
        // Успешный вход админа
        loginSuccess(admin, remember);
    } else {
        // Проверка гостя
        const guest = usersDatabase.guests.find(g => 
            g.phone === login && g.password === password
        );
        
        if (guest) {
            // Успешный вход гостя
            loginSuccess(guest, remember);
        } else {
            showLoginError('❌ Неверный логин или пароль');
        }
    }
}

// Успешный вход
function loginSuccess(user, remember = false) {
    console.log(`✅ Успешный вход: ${user.name} (${user.role})`);
    
    // Сохраняем сессию
    localStorage.setItem('isAdmin', 'true');
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
        if (user.role === 'admin' || user.role === 'manager') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
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
    const admin = usersDatabase.admins.find(u => u.login === login);
    if (admin) {
        alert(`Пароль для ${admin.login}: ${admin.password}\n\nРекомендуем изменить пароль в настройках после входа.`);
    } else {
        alert('Пользователь не найден');
    }
}

// Регистрация нового гостя
function registerGuest(name, phone, password = '') {
    if (!name || !phone) {
        return { success: false, message: 'Заполните имя и телефон' };
    }
    
    // Проверяем, существует ли уже гость с таким телефоном
    const existingGuest = usersDatabase.guests.find(g => g.phone === phone);
    
    if (existingGuest) {
        // Обновляем данные существующего гостя
        existingGuest.name = name;
        existingGuest.lastLogin = new Date().toISOString();
        existingGuest.loginCount = (existingGuest.loginCount || 0) + 1;
        
        if (password) {
            existingGuest.password = password;
        }
        
        // Сохраняем
        saveGuestsData();
        
        return { 
            success: true, 
            message: 'Данные обновлены', 
            guest: existingGuest 
        };
    } else {
        // Создаем нового гостя
        const newGuest = {
            id: Date.now(),
            name: name.trim(),
            phone: phone.trim(),
            password: password || generateGuestPassword(),
            role: 'guest',
            registered: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1,
            ordersCount: 0,
            totalSpent: 0
        };
        
        usersDatabase.guests.push(newGuest);
        saveGuestsData();
        
        return { 
            success: true, 
            message: 'Регистрация успешна', 
            guest: newGuest 
        };
    }
}

// Генерация пароля для гостя
function generateGuestPassword() {
    return 'guest' + Math.floor(1000 + Math.random() * 9000);
}

// Сохранение данных гостей
function saveGuestsData() {
    localStorage.setItem('shopGuests', JSON.stringify(usersDatabase.guests));
}

// Делаем функции доступными глобально
window.performLogin = performLogin;
window.resetPassword = resetPassword;
window.registerGuest = registerGuest;

// Автозаполнение логина, если запомнен
window.onload = function() {
    const rememberedLogin = localStorage.getItem('rememberedLogin');
    if (rememberedLogin && document.getElementById('login')) {
        document.getElementById('login').value = rememberedLogin;
        document.getElementById('remember').checked = true;
    }
};
