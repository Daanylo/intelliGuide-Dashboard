document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id === 'context') {
            item.classList.add('active');
        }
    });
});