document.addEventListener('DOMContentLoaded', () => {

});

const showError = (message) => {
    if (document.getElementById('error-overlay')) {
        document.getElementById('error-overlay').remove();
    }
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-overlay');
    errorElement.id = 'error-overlay';
    errorElement.innerHTML = 
    `<i class="fa-solid fa-xmark" id="close-error"></i>
    <p id="error-message">${message}</p>
    `
    document.body.appendChild(errorElement);
    document.getElementById('close-error').addEventListener('click', () => {
        errorElement.remove();
    });
}

const showSuccess = (message) => {
    if (document.getElementById('success-overlay')) {
        document.getElementById('success-overlay').remove();
    }
    const successElement = document.createElement('div');
    successElement.classList.add('success-overlay');
    successElement.id = 'success-overlay';
    successElement.innerHTML = 
    `<i class="fa-solid fa-xmark" id="close-success"></i>
    <p id="success-message">${message}</p>
    `
    document.body.appendChild(successElement);
    document.getElementById('close-success').addEventListener('click', () => {
        successElement.remove();
    });
}



const getUser = async () => {
    const response = await fetch('/Dashboard/GetUser', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const result = await response.json();   
        return result.data;
    } else {
        console.error('Failed to get user:', response.statusText);
        showError('Failed to get user');
    }
}