document.addEventListener('DOMContentLoaded', () => {
    highlightActiveNavItem();
    addNotifications();
});

const highlightActiveNavItem = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'notifications') {
            item.classList.add('active');
        }
    });
};

async function addNotifications() {
    let notifications = await getNotifications();
    let notificationList = document.getElementById('notifications-page-list');
    notificationList.innerHTML = '';
    notifications.forEach(notification => {
        let notificationItem = document.createElement('li');
        notificationItem.classList.add('list-item');
        notificationItem.classList.add('notification');
        notificationItem.innerHTML = `
        <div class="list-item-top">
            <span>
                <p class="name">${formatTimeAgo(notification.time)}</p>
            </span>
            <span>
                <i class="fa-solid fa-trash-can delete" data-notification-id="${notification.help_id}"></i>
            </span>
        </div>
        <div id="notification-body">
            <p>${notification.message}</p>
        </div>
        `;
        notificationList.appendChild(notificationItem);
    });
}