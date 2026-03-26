// components_Admin/header/header.notifications_button.js

document.addEventListener('DOMContentLoaded', () => {
    const notificationsBtn = document.getElementById('headerNotificationsBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');

    if (!notificationsBtn || !notificationsDropdown) return;

    notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationsDropdown.classList.toggle('show');
        
        // Auto-close profile dropdown if open to prevent overlapping menus
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown && profileDropdown.classList.contains('show')) {
            profileDropdown.classList.remove('show');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationsBtn.contains(e.target) && !notificationsDropdown.contains(e.target)) {
            notificationsDropdown.classList.remove('show');
        }
    });

    // Prevent clicks inside dropdown from immediately closing it
    notificationsDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});
