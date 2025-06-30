document.addEventListener('DOMContentLoaded', async function() {
    setEditingContext('');
    highlightActiveNavItem();

    const contextList = document.getElementById('context-list');
    contextList.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit')) {
            const contextId = event.target.getAttribute('data-context-id');
            setEditingContext(contextId);
        }

        if (event.target.classList.contains('delete')) {
            const contextId = event.target.getAttribute('data-context-id');
            deleteContext(contextId);
        }

        if (event.target.classList.contains('change-status')) {
            const contextId = event.target.getAttribute('data-context-id');
            handleChangeStatus(event.target, contextId);
        }
    });

    document.getElementById('save-context-activate').addEventListener('click', (event) => {
        let context = document.getElementById('context-input').value;
        let title = document.getElementById('title-input').value;

        if (context === '' || title === '') {
            showError('Vul alle velden in');
            return;
        }
        saveContext(null, context, title, true);
    });

    document.getElementById('new-context').addEventListener('click', () => {
        document.getElementById('context-input').value = '[Nieuwe context]';
        document.getElementById('title-input').value = '[Nieuwe titel]';
        setEditingContext('');
    });

    await getContexts();
});

const highlightActiveNavItem = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'context') {
            item.classList.add('active');
        }
    });
};

const handleChangeStatus = async (statusElement, contextId) => {
    const context = await getContext(contextId);
    if (context) {
        console.log('Context:', context);
        let activate = false;
        if (statusElement.innerText === 'Actief') {
            activate = true;
        }
        saveContext(context.context_id, context.body, context.title, activate);
    } else {
        console.error('Context not found for contextId:', contextId);
        showError('Context not found.');
    }
};

const saveContext = async (context_id, body, title, activate) => {
    try {
        const response = await fetch('/Dashboard/SaveContext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context_id, body, title, activate }) 
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Context saved:', result);
            showSuccess('Context opgeslagen.');
            document.getElementById('context-input').value = '';
            document.getElementById('title-input').value = '';
            setEditingContext('');
            await getContexts();
        } else {
            console.error('Failed to save context:', response.statusText);
            alert('Failed to save context: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error saving context:', error);
        showError('Error saving context');
    }
};

const getContext = async (contextId) => {
    try {
        const response = await fetch(`/Dashboard/GetContext`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contextId })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Context:', result.data);
            return result.data;
        } else {
            console.error('Failed to get context:', response.statusText);
            showError('Failed to get context');
            return null;
        }
    } catch (error) {
        console.error('Error fetching context:', error);
        showError('Error fetching context');
        return null;
    }
};

const getEditingContext = async () => {
    try {
        const response = await fetch('/Dashboard/GetEditingContext', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Editing context id:', result.data);
            return result.data;
        } else {
            console.error('Failed to get editing context id:', response.statusText);
            showError('Failed to get editing context id');
            return null;
        }
    } catch (error) {
        console.error('Error fetching editing context:', error);
        showError('Error fetching editing context');
        return null;
    }
};

const setEditingContext = async (contextId) => {
    try {
        const response = await fetch('/Dashboard/SetEditingContext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contextId }) 
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Editing context set:', result);
            document.querySelectorAll('.list-item').forEach(item => {
                item.classList.remove('selected');
            });

            if (contextId === '') {
                return;
            }

            const selectedItem = document.getElementById(contextId);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }

            const editingContext = await getContext(contextId);
            if (editingContext) {
                document.getElementById('context-input').value = editingContext.body;
                document.getElementById('title-input').value = editingContext.title;
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

const deleteContext = async (contextId) => {
    if (!confirm('Weet je zeker dat je deze context wil verwijderen?')) {
        return;
    }

    try {
        const response = await fetch('/Dashboard/DeleteContext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contextId })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Context deleted:', result);
            showSuccess('Context verwijderd.');
            await getContexts();
        } else {
            console.error('Failed to delete context:', response.statusText);
            showError('Failed to delete context');
        }
    } catch (error) {
        console.error('Error deleting context:', error);
        showError('Error deleting context');
    }
};

const getContexts = async () => {
    try {
        const response = await fetch('/Dashboard/GetContexts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Contexts:', result);
            document.getElementById('context-list').innerHTML = '';
            const contexts = result.data;

            contexts.forEach(context => {
                addContext(context);
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

const addContext = (context) => {
    let contextList = document.getElementById('context-list');
    let contextItem = document.createElement('li');
    contextItem.classList.add('list-item');
    contextItem.id = context.context_id; 

    let status = 'Inactief';
    let statusButton = `<p class="change-status" data-context-id="${context.context_id}">Actief</p>`;
    if (context.status === 'active') {
        status = 'Actief';
        statusButton = `<p class="change-status" data-context-id="${context.context_id}">Inactief</p>`;
    }

    contextItem.innerHTML = 
    `
    <div class="list-item-top">
        <span>
            <p class="title">${context.title}</p>
        </span>
        <span>
            <div class="publish-dropdown">
                <p>${status} <i class="fa-solid fa-caret-down"></i></p>
                <div class="publish-dropdown-content">
                    ${statusButton}
                </div>
            </div>
            <i class="fa-solid fa-pen-to-square edit" data-context-id="${context.context_id}"></i>
            <i class="fa-solid fa-trash-can delete" data-context-id="${context.context_id}"></i>
        </span>
    </div>
    <div id="context-content">
        <p>${context.body}</p>
    </div>
    `;
    contextList.appendChild(contextItem);
};