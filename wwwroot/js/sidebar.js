document.addEventListener('DOMContentLoaded', async function() {
    loadBots();
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