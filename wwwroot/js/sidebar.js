document.addEventListener('DOMContentLoaded', async function() {
    await loadBots();
    const notifications = await getNotifications();
        addNotificationsToSidebar(notifications);
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('resizer');
    const signOutButton = document.getElementById('sign-out-button');
    resizer.addEventListener('click', (event) => {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.add('collapsed');
        }});
    signOutButton.addEventListener('click', async(event) => {
        try {
            const response = await fetch('/Dashboard/Logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const result = await response.json();
                console.log('Logout successful:', result);
                location.href = '/Login';
            } else {
                console.error('Logout failed:', response.statusText);
                showError('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            showError('Error during logout');
        }
    });
    const user = await getUser();
    const logoBar = document.querySelector('.logo-bar');
    const imageUrl = user.image;
    logoBar.style.backgroundImage = `linear-gradient(rgba(34, 45, 68, 0.90),rgba(34, 45, 68, 0.90)), url(${imageUrl})`;
    document.getElementById('company-name').textContent = user.name;
});

const loadBots = async() => {
    const response = await fetch('/Dashboard/GetBots', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        console.log('Bots:', result);
        const bots = result.data;
        const botList = document.getElementById('bot-list');
        botList.innerHTML = '';
        bots.forEach(bot => {
            addBot(bot);
        });
        const active = await getActiveBot();
        if (!active && bots.length > 0) {
            await setActiveBot(bots[0].bot_id);
        } else if (active) {
            await setActiveBot(active.bot_id);
        }
        listenForBotSelection();
        bots.forEach(bot => {
            updateBotStatus(bot.bot_id);
        });
    } else {
        console.error('Failed to get bots:', response.statusText);
        showError('Failed to get bots');
    }
}

const addBot = (bot) => {
    const botList = document.getElementById('bot-list');
    const botItem = document.createElement('li');
    botItem.classList.add('bot-item');
    botItem.id = bot.bot_id;
    let location = '';
    if (bot.location) {
        location = bot.location;
    }
    botItem.innerHTML =
    `<span>
        <img id="avatar" src="${bot.avatar}" alt="avatar">
        <p id="bot-name">${bot.name}</p>
    </span>
    <span>
        <p id="bot-location">${location}</p>
        <div class="bot-status-indicator ${bot.status}"></div>
    </span>`;
    botList.appendChild(botItem);
}

const updateBotStatus = async(botId) => {
    let botElement = document.getElementById(botId);
    let botStatus = await getBotProperty(botId, 'status');
    if (botStatus === 'active') {
        botElement.querySelector('.bot-status-indicator').classList.remove('inactive');
        botElement.querySelector('.bot-status-indicator').classList.add('active');
    } else {
        botElement.querySelector('.bot-status-indicator').classList.remove('active');
        botElement.querySelector('.bot-status-indicator').classList.add('inactive');
    }
    if (window.location.href.includes('Status')) {
        getStatus();
    }
}
const getBotProperty = async(botId, property) => {
    const response = await fetch('/Dashboard/GetBotProperty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ botId, property })
    });
    if (response.ok) {
        const result = await response.json();
        return result.data;
    } else {
        console.error('Failed to update bots:', response.statusText);
        showError('Failed to update bots');
    }
}

const listenForBotSelection = () => {
    document.querySelectorAll('.bot-item').forEach(item => {
        item.addEventListener('click', () => {
            setActiveBot(item.id);
        });
    });
}

const setActiveBot = async (botId) => {
    const response = await fetch('/Dashboard/SetActiveBot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ botId }) 
    });
    if (response.ok) {
        const result = await response.json();
        console.log('Active bot:', result);
        document.querySelectorAll('.bot-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.getElementById(botId).classList.add('selected');
        let botName = document.getElementById(botId).querySelector('#bot-name').textContent;
        document.getElementById('currently-editing').innerText = `Aan het beheren: ${botName}`;
        if (window.location.href.includes('Status')) {
            getStatus();
            getConversationCount();
            initializeActivityChart();
            initializeReviewChart();
            getConversations();
            getUnansweredQuestions();
        } else if (window.location.href.includes('Context')) {
            getContexts();
            document.getElementById('title-input').value = '';
            document.getElementById('context-input').value = '';
        } else if (window.location.href.includes('Settings')) {
            fillFormWithBotData();
        } else if (window.location.href.includes('Events')) {
            getEvents();
            document.getElementById('name-input').value = '';
            document.getElementById('description-input').value = '';
            document.getElementById('address-input').value = '';
            document.getElementById('place-input').value = '';
            document.getElementById('date-input').value = '';
            document.getElementById('time-input').value = '';

        }
    } else {    
        console.error('Failed to set active bot:', response.statusText);
        showError('Failed to set active bot');
    }
}

const getNotifications = async() => {
    const response = await fetch('/Dashboard/GetNotifications', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        console.log('Notifications:', result);
        const notifications = result.data;
        return notifications;
    } else {
        console.error('Failed to get notifications:', response.statusText);
        showError('Failed to get notifications');
    }
}

const addNotificationsToSidebar = (notifications) => {
    const notificationList = document.getElementById('notification-list');
    notificationList.innerHTML = '';
    notifications.forEach(notification => {
        addNotificationToSidebar(notification);
    });
}

const formatTimeAgo = (time) => {
    const now = new Date();
    const past = new Date(time);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const units = [
        { name: 'j', seconds: 31536000 },
        { name: 'w', seconds: 604800 },
        { name: 'd', seconds: 86400 },
        { name: 'u', seconds: 3600 },
        { name: 'm', seconds: 60 },
        { name: 's', seconds: 1 }
    ];

    for (const unit of units) {
        const interval = Math.floor(diffInSeconds / unit.seconds);
        if (interval >= 1) {
            return `${interval}${unit.name} geleden`;
        }
    }
    return 'zojuist';
}

const addNotificationToSidebar = (notification) => {
    const notificationList = document.getElementById('notification-list');
    const notificationItem = document.createElement('li');
    const bots = document.getElementById('bot-list').children;
    const bot = Array.from(bots).find(b => b.id === notification.bot_id);
    const botName = bot.querySelector('#bot-name').textContent;
    notificationItem.classList.add('notification-item');
    notificationItem.id = notification.help_id;
    const message = notification.message.length > 30 ? `${notification.message.substring(0, 30)}...` : notification.message;
    notificationItem.innerHTML =
    `
    <span>
        <p id="bot-name">${botName}</p>
        <span>
            <p id="notification-time">${formatTimeAgo(notification.time)}</p>
            <p id="notification-title">${message}</p>
        </span>
    </span>
    <i class="fa-solid fa-envelope"></i>
    `;
    notificationList.appendChild(notificationItem);
}



const getActiveBot = async() => {
    const response = await fetch('/Dashboard/GetActiveBot', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        return result.data;
    } else {
        console.log('No active bot was found:', response.statusText);
        return null;
    }
}