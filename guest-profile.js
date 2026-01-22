// guest-profile.js

// Показываем профиль гостя
function displayGuestProfile() {
    const profileSection = document.querySelector('#profile-section');
    const guestPhone = prompt('Введите ваш номер телефона:');
    const guestProfile = getGuestProfile(guestPhone);

    if (guestProfile) {
        profileSection.innerHTML = `
            <h2>Ваш профиль:</h2>
            <p>Имя: ${guestProfile.name}</p>
            <p>Телефон: ${guestProfile.phone}</p>
        `;
    } else {
        alert('Пользователь не найден.');
    }
}

// Кнопка для открытия профиля
document.querySelector('#open-profile-btn').addEventListener('click', displayGuestProfile);
