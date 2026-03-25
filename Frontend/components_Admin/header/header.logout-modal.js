// components_Admin/header/header.logout-modal.js

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // 1. Close dropdown
        if (profileDropdown) {
            profileDropdown.classList.remove('show');
        }

        // 2. Check if modal already exists
        let overlay = document.getElementById('logoutModalOverlay');
        
        if (!overlay) {
            try {
                // Fetch the HTML
                const response = await fetch('/Admin/Pages/LogoutPage/Logout.html');
                if (!response.ok) throw new Error('Failed to load logout modal');
                const html = await response.text();

                // Create Overlay Container
                overlay = document.createElement('div');
                overlay.className = 'logout-modal-overlay';
                overlay.id = 'logoutModalOverlay';
                overlay.innerHTML = html;
                document.body.appendChild(overlay);

                // Load CSS if not already loaded
                if (!document.querySelector('link[href*="Logout.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/Admin/Pages/LogoutPage/Logout.css';
                    document.head.appendChild(link);
                }

                // Attach Close Events
                // Close on backdrop click
                overlay.addEventListener('click', (event) => {
                    if (event.target === overlay) {
                        closeModal(overlay);
                    }
                });

                // Close on Cancel Button click
                const cancelBtn = overlay.querySelector('#logoutModalCancelBtn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        closeModal(overlay);
                    });
                }
                
                // Confirm Logout Button
                const confirmBtn = overlay.querySelector('#logoutModalConfirmBtn');
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => {
                        // TODO: Integration with auth layer (e.g. redirect to login)
                        console.log("Logged out locally.");
                        closeModal(overlay);
                    });
                }
            } catch (err) {
                console.error("Error launching logout modal:", err);
                return;
            }
        }

        // 3. Show Modal
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
    });

    function closeModal(overlay) {
        overlay.classList.remove('show');
    }
});
