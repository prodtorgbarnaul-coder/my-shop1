// ============================================
// УПРАВЛЕНИЕ ПРОФИЛЕМ ГОСТЯ
// ============================================

// Показать профиль пользователя
function showUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const savedGuests = localStorage.getItem('shopGuests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    const guest = guests.find(g => g.id === currentUser.id);
    
    if (!guest) {
        showNotification('❌ Профиль не найден', 'error');
        return;
    }
    
    // Получаем заказы гостя
    const savedOrders = localStorage.getItem('shopOrders');
    const allOrders = savedOrders ? JSON.parse(savedOrders) : [];
    const guestOrders = allOrders.filter(o => o.guestId === guest.id);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">👤 Ваш профиль</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem; margin: 0 auto 15px;">
                        ${guest.name.charAt(0).toUpperCase()}
                    </div>
                    <h3>${guest.name}</h3>
                    <p style="color: var(--gray);">${guest.phone}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">
                            ${guest.ordersCount || 0}
                        </div>
                        <div style="font-size: 12px; color: var(--gray);">Заказов</div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent);">
                            ${formatPrice(guest.totalSpent || 0)}
                        </div>
                        <div style="font-size: 12px; color: var(--gray);">Потрачено всего</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px;">История заказов</h4>
                    ${guestOrders.length > 0 ? 
                        guestOrders.slice(0, 5).map(order => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 5px; margin-bottom: 5px;">
                                <div>
                                    <strong>Заказ ${order.id}</strong><br>
                                    <small style="color: var(--gray);">${new Date(order.createdAt).toLocaleDateString('ru-RU')}</small>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: bold;">${formatPrice(order.totalAmount)}</div>
                                    <span class="badge ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span>
                                </div>
                            </div>
                        `).join('') : 
                        '<p style="color: var(--gray); text-align: center;">Заказов пока нет</p>'
                    }
                    
                    ${guestOrders.length > 5 ? 
                        `<p style="text-align: center; margin-top: 10px;">
                            <small style="color: var(--gray);">... и еще ${guestOrders.length - 5} заказов</small>
                        </p>` : ''
                    }
                </div>
                
                <div style="border-top: 1px solid var(--border); padding-top: 20
