// Функционал для админской панели

// Загрузка списка зарегистрированных гостей
function loadGuests() {
    const guestsList = Object.keys(localStorage).filter(key => key.includes('-'));
    console.log(guestsList);

    const tableBody = document.querySelector('#guestsTable tbody');
    guestsList.forEach((key) => {
        const guestData = JSON.parse(localStorage.getItem(key));
        const row = `
            <tr>
                <td>${guestData.name}</td>
                <td>${guestData.phone}</td>
                <td><button onclick="deleteGuest('${key}')">Удалить</button></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Удаление гостя из базы данных
function deleteGuest(id) {
    localStorage.removeItem(id);
    location.reload();
}

// Отображение истории заказов
function showOrdersHistory() {
    const orders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('order-')) {
            const order = JSON.parse(localStorage.getItem(key));
            orders.push(order);
        }
    }

    const historyDiv = document.querySelector('#ordersHistory');
    orders.forEach((order) => {
        const div = `<div class="order-item">
                        <h3>Заказ №${order.id}</h3>
                        <p>Имя клиента: ${order.customerName}</p>
                        <p>Телефон: ${order.customerPhone}</p>
                        <p>Сумма заказа: ${order.totalPrice} руб.</p>
                    </div>`;
        historyDiv.insertAdjacentHTML('beforeend', div);
    });
}

// Функция загрузки количества товаров в корзине
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const countSpan = document.querySelector('.cart-count');
    countSpan.textContent = cartItems.length;
}

// Загружаем список гостей и историю заказов при открытии страницы
window.addEventListener('DOMContentLoaded', () => {
    loadGuests();
    showOrdersHistory();
});
