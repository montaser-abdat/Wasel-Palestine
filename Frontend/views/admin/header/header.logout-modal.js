// components_Admin/header/header.logout-modal.js

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (profileDropdown) {
            profileDropdown.classList.remove('show');
        }

        let overlay = document.getElementById('logoutModalOverlay');
        
        if (!overlay) {
            try {
                const response = await fetch('/features/admin/logout/Logout.html');
                if (!response.ok) throw new Error('Failed to load logout modal');
                const html = await response.text();

                overlay = document.createElement('div');
                overlay.className = 'logout-modal-overlay';
                overlay.id = 'logoutModalOverlay';
                overlay.innerHTML = html;
                document.body.appendChild(overlay);

                if (!document.querySelector('link[href*="Logout.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/features/admin/logout/Logout.css';
                    document.head.appendChild(link);
                }

                overlay.addEventListener('click', (event) => {
                    if (event.target === overlay) {
                        closeModal(overlay);
                    }
                });

                const cancelBtn = overlay.querySelector('#logoutModalCancelBtn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        closeModal(overlay);
                    });
                }
                
                const confirmBtn = overlay.querySelector('#logoutModalConfirmBtn');
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', async () => {
                        closeModal(overlay);
                        try {
                            const { logoutUser } = await import('/Services/session.service.js');
                            logoutUser();
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                    });
                }
            } catch (err) {
                console.error('Error launching logout modal:', err);
                return;
            }
        }

        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
    });

    function closeModal(overlay) {
        overlay.classList.remove('show');
    }
});
