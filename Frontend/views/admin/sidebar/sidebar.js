/* components_Admin/sidebar/sidebar.js */
window.initSidebar = function() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            if (sidebar.classList.contains('sidebar-expanded')) {
                sidebar.classList.remove('sidebar-expanded');
                sidebar.classList.add('sidebar-collapsed');
            } else {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
            }
        });
    }

    // Set active link logic
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(n => n.classList.remove('active-nav'));
            this.classList.add('active-nav');

            // Update Header Breadcrumb Optional sync
            const label = this.querySelector('.nav-label');
            if(label) {
                const titleEl = document.getElementById('current-page-title');
                if(titleEl) {
                    titleEl.textContent = label.textContent;
                }
            }
        });
    });
};
