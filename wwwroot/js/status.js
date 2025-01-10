document.addEventListener('DOMContentLoaded', async function() {
    highlightActiveNavItem();
});

const highlightActiveNavItem = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'status') {
            item.classList.add('active');
        }
    });
};

const getStatus = async() => {
    const botStatus = await getBotProperty(null, 'status')
    if (botStatus === 'active') {
        document.getElementById('current-status').innerText = 'Actief';
    } else {
        document.getElementById('current-status').innerText = 'Inactief';
    }
}

const getConversationCount = async() => {
    fetch('/Dashboard/GetConversationCount', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(result => {
                console.log('Conversation count:', result);
                document.getElementById('conversation-count').innerText = result;
            });
        } else {
            console.error('Failed to get conversation count:', response.statusText);
            showError('Failed to get conversation count');
        }
    });
}

let activityChartInstance = null;

const initializeActivityChart = async () => {
    try {
        const response = await fetch('/Dashboard/GetActivity', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            const activityData = result.data;
            console.log('Activity data:', activityData);

            const canvasElement = document.getElementById('activity-chart');
            if (!canvasElement) {
                console.error('Canvas element with ID "activity-chart" not found.');
                return;
            }

            const ctx = canvasElement.getContext('2d');
            if (!ctx) {
                console.error('Failed to get 2D context from canvas.');
                return;
            }

            if (activityChartInstance) {
                activityChartInstance.destroy();
            }

            const now = new Date();
            const hours = Array.from({ length: 24 }, (_, i) => {
                const hourDate = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
                hourDate.setMinutes(0, 0, 0);
                return hourDate.toISOString().substr(11, 5);
            });

            const dataMap = new Map(
                activityData.map(item => {
                    const date = new Date(item.hour);
                    const hourLabel = date.toISOString().substr(11, 5);
                    return [hourLabel, item.conversations];
                })
            );

            const chartData = hours.map(hour => dataMap.get(hour) || 0);
            const maxDataValue = Math.max(...chartData);
            const yMax = maxDataValue ? Math.ceil(maxDataValue / 10) * 10 : 10;

            activityChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: hours,
                    datasets: [{
                        label: 'Gesprekken',
                        data: chartData,
                        backgroundColor: '#00A2FF',
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Tijd'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            max: yMax,
                            ticks: {
                                stepSize: 1
                            },
                            title: {
                                display: true,
                                text: 'Gesprekken'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            enabled: true
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            });
        } else {
            console.error('Failed to get activity data:', response.statusText);
            showError('Kon activiteitsgegevens niet ophalen');
        }
    } catch (error) {
        console.error('Error initializing activity chart:', error);
        showError('Kon activiteitsgegevens niet ophalen');
    }
};

let reviewChartInstance = null;

const initializeReviewChart = async () => {
    try {
        const response = await fetch('/Dashboard/GetReviews', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            const reviewData = result.data;
            console.log('Review data:', reviewData);

            const canvasElement = document.getElementById('review-chart');
            if (!canvasElement) {
                console.error('Canvas element with ID "review-chart" not found.');
                return;
            }

            const ctx = canvasElement.getContext('2d');
            if (!ctx) {
                console.error('Failed to get 2D context from canvas.');
                return;
            }

            const reviewLabels = ['🤬', '🙁', '😶', '😁', '😍', '-'];
            const reviewDataMap = new Map(
                reviewData.map(item => {
                    const emoji = item.review === null ? '-' : reviewLabels[item.review];
                    return [emoji, item.count];
                })
            );

            const chartData = reviewLabels.map(label => reviewDataMap.get(label) || 0);

            if (reviewChartInstance) {
                reviewChartInstance.destroy();
            }

            reviewChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: reviewLabels,
                    datasets: [{
                        data: chartData,
                        backgroundColor: [
                            '#ff6384',
                            '#ff9f40',
                            '#ffcd56',
                            '#4bc0c0',
                            '#36a2eb',
                            '#d3d3d3'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            enabled: true
                        }
                    }
                }
            });
        }
    }
    catch (error) {
        console.error('Error initializing review chart:', error);
        showError('Kon reviewgegevens niet ophalen');
    }
};

const getConversations = async() => {
    fetch('/Dashboard/GetConversations', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(result => {
                console.log('Conversations:', result);
                document.getElementById('conversation-list').innerHTML = '';
                const conversations = result.data;
                conversations.forEach(conversation => {
                    addConversation(conversation);
                });
            });
        } else {
            console.error('Failed to get conversations:', response.statusText);
            showError('Failed to get conversations');
        }
    });
}

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
            <i class="fa-solid fa-eye view" id="view-conversation"></i>
        </span>
    </div>`;           
    conversationItem.querySelector('.view').addEventListener('click', () => {
        location.href = `/Dashboard/Search/${conversation.conversation_id}`;
    });
    conversationList.appendChild(conversationItem);
    getMessages(conversation.conversation_id);
}

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
    conversationItem.appendChild(messageItem);
}

const getUnansweredQuestions = async() => {
    fetch('/Dashboard/GetUnansweredQuestions', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(result => {
                console.log('Unanswered questions:', result);
                document.getElementById('unanswered-questions').innerHTML = '';
                const questions = result.data;
                questions.forEach(question => {
                    addUnansweredQuestion(question);
                });
                document.querySelectorAll('.view').forEach(viewButton => {
                    viewButton.addEventListener('click', () => {
                        const conversationId = viewButton.getAttribute('data-conversation-id');
                        location.href = `/Dashboard/Search/${conversationId}`;
                    });
                });
            });
        } else {
            console.error('Failed to get unanswered questions:', response.statusText);
            showError('Failed to get unanswered questions');
        }
    });
}

const addUnansweredQuestion = (question) => {
    let questionList = document.getElementById('unanswered-questions');
    let questionItem = document.createElement('li');
    questionItem.classList.add('list-item');
    questionItem.id = question.question_id;
    questionItem.innerHTML = 
    `<div class="list-item-top">
        <span>
            <p class="id">${question.message_id}</p>
            <p class="date">${formatTime(question.time)}</p>
        </span>
        <span>
            <i class="fa-solid fa-eye view" data-conversation-id="${question.conversation_id}"></i>
        </span>
        </div>
    <div id="question-content">
        <p>${question.body}</p>
    </div>`;
    questionList.appendChild(questionItem);
}
