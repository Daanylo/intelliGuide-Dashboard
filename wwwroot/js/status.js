document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.id == 'status') {
            item.classList.add('active');
        }
    }); 
});