// script.js

// Генерация уникального идентификатора гостя
function generateGuestId(name, phoneNumber) {
    return `${name}-${phoneNumber}`;
}

// Регистрация гостя
function registerGuest(name, phoneNumber) {
    const guestId = generateGuestId(name, phoneNumber);
    localStorage.setItem(guestId, JSON.stringify({ name, phone: phoneNumber }));
}

// Получение данных гостя
function getGuestProfile(phoneNumber) {
    const keys = Object.keys(localStorage);
    const guestKey = keys.find(key => key.endsWith(phoneNumber));
    return guestKey ? JSON.parse(localStorage.getItem(guestKey)) : null;
}

// Добавление товара в корзину
function addToCart(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[productId] = (cart[productId] || 0) + parseInt(quantity);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Функция для отправки формы заказа
function submitOrderForm(event) {
    event.preventDefault();
    const form = event.target;
    const customerName = form.elements['customer-name'].value.trim();
    const customerPhone = form.elements['customer-phone'].value.trim();
    const totalPrice = calculateTotalPrice();

    if (!customerName || !customerPhone) {
        alert('Заполните все обязательные поля!');
        return;
    }

    // Регистрация гостя при заказе
    registerGuest(customerName, customerPhone);

    // Отправляем заказ
    const order = {
        id: Date.now(),
        customerName,
        customerPhone,
        totalPrice
    };
    localStorage.setItem(`order-${order.id}`, JSON.stringify(order));

    alert('Ваш заказ принят!');
    form.reset();
}

// Расчет общей суммы заказа
function calculateTotalPrice() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    let total = 0;
    for (const product in cart) {
        total += products[product].price * cart[product];
    }
    return total.toFixed(2);
}

// Обработка кликов по продуктам
document.querySelectorAll('.product').forEach(product => {
    product.addEventListener('click', () => {
        const productId = product.dataset.productId;
        addToCart(productId, 1);
        alert('Товар добавлен в корзину!');
    });
});

// Форматируем кнопку регистрации заказа
document.querySelector('#register-order-btn').addEventListener('click', submitOrderForm);
