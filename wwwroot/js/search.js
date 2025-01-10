document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'search') {
            item.classList.add('active');
        }
    });

    document.getElementById('search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        handleSearch();
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        if (window.location.href.split('/').pop() != 'Search') {
            window.location.href = '/Dashboard/Search';
        }
        document.getElementById('conversation-id').value = '';
        document.querySelectorAll('input[name="review"]').forEach(r => {
            r.checked = false;
        });
        document.getElementById('date-from').value = '';
        document.getElementById('time-from').value = '';
        document.getElementById('date-to').value = '';
        document.getElementById('time-to').value = '';
        document.getElementById('text-content').value = '';
    });

    const conversationId = window.location.href.split('/').pop();
    if (conversationId != 'Search') {
        let searchModel = {
            conversation_id: conversationId,
            review: null,
            date_from: null,
            date_to: null,
            text: null
        }
        searchConversations(searchModel);
        document.getElementById('conversation-id').value = conversationId;
    }
});

const handleSearch = () => {
    let conversationId = document.getElementById('conversation-id').value;
    let reviews = [];
    document.querySelectorAll('input[name="review"]:checked').forEach(r => {
        reviews.push(parseInt(r.value, 10));
    });
    let dateFrom = document.getElementById('date-from').value;
    let timeFrom = document.getElementById('time-from').value;
    let dateTimeFrom = null;
    if (dateFrom && timeFrom) {
        dateTimeFrom = `${dateFrom}T${timeFrom}`;
    } else if (dateFrom && !timeFrom) {
        dateTimeFrom = dateFrom + 'T00:00';
    } else if (!dateFrom && timeFrom) {
        dateTimeFrom = new Date().toISOString().split('T')[0] + 'T' + timeFrom;
    }
    let dateTo = document.getElementById('date-to').value;
    let timeTo = document.getElementById('time-to').value;
    let dateTimeTo = null;
    if (dateTo && timeTo) {
        dateTimeTo = `${dateTo}T${timeTo}`;
    } else if (dateTo && !timeTo) {
        dateTimeTo = dateTo + 'T23:59';
    } else if (!dateTo && timeTo) {
        dateTimeTo = new Date().toISOString().split('T')[0] + 'T' + timeTo;
    }
    let text = document.getElementById('text-content').value;

    let searchModel = {
        conversation_id: conversationId,
        review: reviews,
        date_from: dateTimeFrom,
        date_to: dateTimeTo,
        text: text
    };
    searchConversations(searchModel);
}


const searchConversations = async(searchModel) => {
    fetch('/Dashboard/SearchConversations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( searchModel)
    }).then(response => {
        if (response.ok) {
            response.json().then(result => {
                console.log('Search:', result);
                let conversationList = document.getElementById('conversation-list');
                conversationList.innerHTML = '';
                if (result.data.length === 0) {
                    showError('No conversations found');
                }
                const conversations = result.data;
                conversations.forEach(conversation => {
                    addConversation(conversation);
                });
            });
        } else {
            console.error('Failed to search conversation:', response.statusText);
            showError('Failed to search conversation');
        }
    });
};

const getMessages = async (conversationId) => {
    fetch('/Dashboard/GetMessages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId })
    })
    .then(response => {
        if (response.ok) {
            response.json().then(result => {
                let messages = result.data;
                messages.forEach(message => {
                    addMessage(message);
                });
                return messages;
            });
        } else {
            console.error('Failed to get conversation body:', response.statusText);
            showError('Failed to get conversation body');
        }
    });
};

const formatTime = (time) => {
    return new Date(time)
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
}

const addMessage = (message) => {
    let conversationItem = document.getElementById(message.conversation_id);
    let messageItem = document.createElement('p');
    if (message.type == 'question') {
        messageItem.innerText = `[Vraag] ${message.body}`;
    } else if (message.type == 'answer') {
        messageItem.innerText = `[Antwoord] ${message.body}`;
    } 
    let messageList = conversationItem.querySelector('.list-item-middle');
    messageList.appendChild(messageItem);
}

const addConversation = (conversation) => {
    let conversationList = document.getElementById('conversation-list');
    let conversationItem = document.createElement('li');
    conversationItem.classList.add('list-item');
    conversationItem.id = conversation.conversation_id;
    let review;
    switch (conversation.review) {
        case 0:
            review = '🤬';
            break;
        case 1:
            review = '🙁';
            break;
        case 2:
            review = '😶';
            break;
        case 3:
            review = '😁';
            break;
        case 4:
            review = '😍';
            break;
        default:
            review = '-';
    } 
    conversationItem.innerHTML = 
    `<div class="list-item-top">
        <span>
            <p class="id" id="conversation-id">${conversation.conversation_id}</p>
            <p class="date" id="conversation-date">${formatTime(conversation.time)}</p>
        </span>
        <span>
            <p class="review" id="conversation_review">${review}</p>
            <i class="fa-solid fa-trash-can delete" id="delete-conversation"></i>
        </span>
    </div>
    <div class="list-item-middle">
    </div>
    <div class="list-item-bottom">
        <p class="comment" id="conversation-comment">Comment: "${conversation.comment}"</p>
    </div>`;
    conversationList.appendChild(conversationItem);
    getMessages(conversation.conversation_id);
}