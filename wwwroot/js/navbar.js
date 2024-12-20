document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (event) => {
            switch (item.id) {
                case 'status':
                    this.location.href = '/Dashboard/Status';
                    break;
                case 'context':
                    this.location.href = '/Dashboard/Context';
                    break;
                case 'settings':
                    this.location.href = '/Dashboard/Settings';
                    break;
                case 'events':
                    this.location.href = '/Dashboard/Events';
                    break;
                case 'search':
                    this.location.href = '/Dashboard/Search';
                    break;
                case 'notifications':
                    this.location.href = '/Dashboard/Notifications';
                    break;
            }
        });
    }); 
});