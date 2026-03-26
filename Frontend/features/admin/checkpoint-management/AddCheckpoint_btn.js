// Admin/Pages/CheckpointManagement/AddCheckpoint_btn.js

(function() {
    const initAddCheckpointBtn = () => {
        const addBtn = document.getElementById('addCheckpointBtn');
        if (!addBtn || addBtn.dataset.modalBound) return;
        
        addBtn.dataset.modalBound = "true";

        addBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            let overlay = document.getElementById('addCheckpointOverlay');
            
            if (!overlay) {
                try {
                    const response = await fetch('/features/admin/checkpoint-management/AddCheckpoint.html');
                    if (!response.ok) throw new Error('Failed to load Add Checkpoint modal');
                    const html = await response.text();

                    overlay = document.createElement('div');
                    overlay.className = 'add-checkpoint-overlay';
                    overlay.id = 'addCheckpointOverlay';
                    overlay.innerHTML = html;
                    document.body.appendChild(overlay);

                    if (!document.querySelector('link[href*="AddCheckpoint.css"]')) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = '/features/admin/checkpoint-management/AddCheckpoint.css?v=' + new Date().getTime();
                        document.head.appendChild(link);
                    }

                    // Attach Close Events
                    overlay.addEventListener('click', (event) => {
                        if (event.target === overlay) {
                            closeModal(overlay);
                        }
                    });

                    const closeBtn = overlay.querySelector('#addCheckpointCloseBtn');
                    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(overlay));

                    const cancelBtn = overlay.querySelector('#addCheckpointCancelBtn');
                    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(overlay));
                    
                    const form = overlay.querySelector('#addCheckpointForm');
                    if (form) {
                        form.addEventListener('submit', (event) => {
                            event.preventDefault();
                            // Logic to save checkpoint
                            console.log("Checkpoint form submitted successfully.");
                            closeModal(overlay);
                        });
                    }
                } catch (err) {
                    console.error("Error launching add checkpoint modal:", err);
                    return;
                }
            }

            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });
        });
    };

    function closeModal(overlay) {
        overlay.classList.remove('show');
    }

    // Initialize immediately (for dynamic SPA routing)
    initAddCheckpointBtn();
    
    // Fallback for direct page loads
    document.addEventListener('DOMContentLoaded', initAddCheckpointBtn);
})();
