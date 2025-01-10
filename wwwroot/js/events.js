document.addEventListener('DOMContentLoaded', function () {
    highlightActiveNavItem();
    setEditingEvent('');
    document.getElementById('save-event').addEventListener('click', async () => {
        let name = document.getElementById('name-input').value;
        if (name === '') {
            showError('Vul een naam in');
            return;
        }
        let description = document.getElementById('description-input').value;
        let address = document.getElementById('address-input').value;
        let place = document.getElementById('place-input').value;
        let date = document.getElementById('date-input').value;
        let time = document.getElementById('time-input').value;
        let event = {
            name,
            description,
            address,
            place,
            time: new Date(`${date}T${time}:00`).toISOString()
        };
        await saveEvent(event);
    });

    document.getElementById('new-event').addEventListener('click', () => {
        document.getElementById('name-input').value = '';
        document.getElementById('description-input').value = '';
        document.getElementById('address-input').value = '';
        document.getElementById('place-input').value = '';
        document.getElementById('date-input').value = '';
        setEditingEvent('');
    });
});


const highlightActiveNavItem = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'events') {
            item.classList.add('active');
        }
    });
};

const getEvents = async () => {
    try {
        const response = await fetch('/Dashboard/GetEvents', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Events:', result);
            let eventList = document.getElementById('event-list');
            eventList.innerHTML = '';
            const events = result.data;

            events.forEach(event => {
                addEvent(event);
                document.getElementById(event.event_id).querySelector('.edit').addEventListener('click', () => {
                    setEditingEvent(event.event_id);
                });
                document.getElementById(event.event_id).querySelector('.delete').addEventListener('click', () => {
                    deleteEvent(event.event_id);
                });
            });
        } else {
            console.error('Failed to get contexts:', response.statusText);
            showError('Failed to get contexts');
        }
    } catch (error) {
        console.error('Error fetching contexts:', error);
        showError('Error fetching contexts');
    }
};

const addEvent = (event) => {
    let eventList = document.getElementById('event-list');
    let eventItem = document.createElement('li');
    eventItem.classList.add('list-item');
    eventItem.id = event.event_id; 

    eventItem.innerHTML = 
    `
    <div class="list-item-top">
        <span>
            <p class="name">${event.name}</p>
        </span>
        <span>
            <i class="fa-solid fa-pen-to-square edit" data-event-id="${event.event_id}"></i>
            <i class="fa-solid fa-trash-can delete" data-event-id="${event.event_id}"></i>
        </span>
    </div>
    <div id="event-content">
        <p>Beschrijving: ${event.description}</p>
        <p>Datum & tijd: ${formatTime(event.time)}</p>
        <p>Adres: ${event.address}</p>
        <p>Plaats: ${event.place}</p>
    </div>
    `;
    eventList.appendChild(eventItem);
};

const setEditingEvent = async (eventId) => {
    try {
        const response = await fetch('/Dashboard/SetEditingEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventId }) 
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Editing event set:', result);
            document.querySelectorAll('.list-item').forEach(item => {
                item.classList.remove('selected');
            });

            if (eventId === '') {
                return;
            }

            const selectedItem = document.getElementById(eventId);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }

            const editingEvent = await getEditingEvent(eventId);
            if (editingEvent) {
                document.getElementById('name-input').value = editingEvent.name;
                document.getElementById('description-input').value = editingEvent.description;
                document.getElementById('address-input').value = editingEvent.address;
                document.getElementById('place-input').value = editingEvent.place;
                let date = new Date(editingEvent.time);
                document.getElementById('date-input').value = date.toISOString().slice(0, 10);
                document.getElementById('time-input').value = date.toTimeString().slice(0, 5);
            }
        } else {
            console.error('Failed to set editing context:', response.statusText);
            showError('Failed to set editing context');
        }
    } catch (error) {
        console.error('Error setting editing context:', error);
        showError('Error setting editing context');
    }
};

const getEditingEvent = async (eventId) => {
    try {
        const response = await fetch('/Dashboard/GetEditingEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventId })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Editing event:', result.data);
            return result.data;
        } else {
            console.error('Failed to get editing event:', response.statusText);
            showError('Failed to get editing event');
            return null;
        }
    } catch (error) {
        console.error('Error fetching editing event:', error);
        showError('Error fetching editing event');
        return null;
    }
};

const saveEvent = async (event) => {
    try {
        const response = await fetch('/Dashboard/SaveEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( event ) 
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Event saved:', result);
            showSuccess('Evenement opgeslagen.');
            document.getElementById('name-input').value = '';
            document.getElementById('description-input').value = '';
            document.getElementById('address-input').value = '';
            document.getElementById('place-input').value = '';
            document.getElementById('date-input').value = '';
            document.getElementById('time-input').value = '';
            setEditingEvent('');
            await getEvents();
        } else {
            console.error('Failed to save event:', response.statusText);
            showError('Kon evenement niet opslaan');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showError('Kon evenement niet opslaan');
    }
};

const deleteEvent = async (eventId) => {
    if (!confirm('Weet je zeker dat je dit evenement wil verwijderen?')) {
        return;
    }
    try {
        const response = await fetch('/Dashboard/DeleteEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventId })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Event deleted:', result);
            showSuccess('Evenement verwijderd.');
            await getEvents();
        } else {
            console.error('Failed to delete event:', response.statusText);
            showError('Kon evenement niet verwijderen');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showError('Kon evenement niet verwijderen');
    }
}; 

const formatTime = (time) => {
    return new Date(time)
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
}