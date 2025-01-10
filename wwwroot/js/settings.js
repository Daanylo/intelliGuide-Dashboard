document.addEventListener('DOMContentLoaded', async function() {
    highlightActiveNavItem();

});


const highlightActiveNavItem = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'settings') {
            item.classList.add('active');
        }
    });
};

const getEvents = async () => {
    const response = await fetch('/Dashboard/GetEvents');
    if (response.ok) {
        const result = await response.json();
        return result.data;
    } else {
        console.error('Failed to get events:', response.statusText);
        showError('Kon geen evenementen ophalen');
    }
}

const fillFormWithBotData = async () => {
    const bot = await getActiveBot();
    const form = document.getElementById('settings-form');
    if (!form) return;
    form.elements.name.value = bot.name || '';
    form.elements.avatar.value = bot.avatar || '';
    form.elements.style.value = bot.style || '';
    form.elements.voice.value = bot.voice || '';
    form.elements.location.value = bot.location || '';
    const events = await getEvents();
    const eventSelect = form.elements.event;
    eventSelect.innerHTML = '';
    events.forEach(evt => {
        const option = document.createElement('option');
        option.value = evt.event_id;
        option.textContent = evt.name;
        eventSelect.appendChild(option);
    });

    eventSelect.value = bot.event_id || '';
    form.elements.greeting.value = bot.greeting || '';
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        await saveBot();
    });
};

const saveBot = async () => {
    const form = document.getElementById('settings-form');
    const activeBot = await getActiveBot();
    const bot = {
        event_id: form.elements.event.value,
        name: form.elements.name.value,
        avatar: form.elements.avatar.value,
        style: form.elements.style.value,
        voice: form.elements.voice.value,
        location: form.elements.location.value,
        greeting: form.elements.greeting.value,
        status: activeBot.status
    };
    const response = await fetch('/Dashboard/SaveBot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bot)
    });
    if (response.ok) {
        showSuccess('Bot opgeslagen');
        loadBots();
    } else {
        console.error('Failed to save bot:', response.statusText);
        showError('Failed to save bot');
    }
}
