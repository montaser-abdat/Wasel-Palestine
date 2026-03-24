// components_Admin/header/header.profile_button.js

document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.getElementById('headerProfileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (!profileBtn || !profileDropdown) return;

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // Prevent clicks inside dropdown from immediately closing it
    profileDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});
