document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            const response = await fetch('Login/loginUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, rememberMe })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Login successful:', result);
                location.href = '/Dashboard';
            } else {
                console.error('Login failed:', response.statusText);
                alert('Login failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error during login:', error);
        }
    });
});