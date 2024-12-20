document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('resizer');
    const signOutButton = document.getElementById('sign-out-button');
    loadBots();
    resizer.addEventListener('click', (event) => {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.add('collapsed');
        }});
    signOutButton.addEventListener('click', async(event) => {
        try {
            const response = await fetch('Dashboard/logout', {
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
                alert('Logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Error during logout:', error);
        }
    });
});

const loadBots = async() => {
    const response = await fetch('/Dashboard/getBots', {
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
            const botItem = document.createElement('li');
            botItem.classList.add('bot-item');
            botItem.innerHTML =
            `<span>
                <img id="avatar" src="${bot.avatar}" alt="avatar">
                <p id="bot-name">${bot.name}</p>
            </span>
            <span>
                <p id="bot-status">${bot.location}</p>
                <div id="bot-status-indicator"></div>
            </span>`;
            botList.appendChild(botItem);
        });
        listenForBotSelection();
        
    } else {
        console.error('Failed to get bots:', response.statusText);
        alert('Failed to get bots:', response.statusText);
    }
}

const listenForBotSelection = () => {
    document.querySelectorAll('.bot-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.bot-item').forEach(item => {
                item.classList.remove('selected');
            });
            item.classList.add('selected');
        });
    });
}

const getBotStatusses = async(botId) => {
    const response = await fetch(`/Dashboard/getBotStatus/${botId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();
        console.log('Bot status:', result);
        return result.data;
    } else {
        console.error('Failed to get bot status:', response.statusText);
        alert('Failed to get bot status:', response.statusText);
    }
}