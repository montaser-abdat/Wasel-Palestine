// Admin/Pages/Incidents/CreateIncident_btn.js

(function() {
    const initCreateIncidentBtn = () => {
        const createBtn = document.getElementById('createIncidentBtn');
        if (!createBtn || createBtn.dataset.modalBound) return;
        
        createBtn.dataset.modalBound = "true";

        createBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            let overlay = document.getElementById('createIncidentOverlay');
            
            if (!overlay) {
                try {
                    const response = await fetch('/features/admin/incidents/CreateIncident.html');
                    if (!response.ok) throw new Error('Failed to load Create Incident modal');
                    const html = await response.text();

                    overlay = document.createElement('div');
                    overlay.className = 'create-incident-overlay';
                    overlay.id = 'createIncidentOverlay';
                    overlay.innerHTML = html;
                    document.body.appendChild(overlay);

                    if (!document.querySelector('link[href*="CreateIncident.css"]')) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = '/features/admin/incidents/CreateIncident.css?v=' + new Date().getTime();
                        document.head.appendChild(link);
                    }

                    // Attach Close Events
                    overlay.addEventListener('click', (event) => {
                        if (event.target === overlay) {
                            closeModal(overlay);
                        }
                    });

                    const closeBtn = overlay.querySelector('#createIncidentCloseBtn');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            closeModal(overlay);
                        });
                    }

                    const cancelBtn = overlay.querySelector('#createIncidentCancelBtn');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', () => {
                            closeModal(overlay);
                        });
                    }
                    
                    const form = overlay.querySelector('#createIncidentForm');
                    if (form) {
                        form.addEventListener('submit', (event) => {
                            event.preventDefault();
                            // Implementation for saving the incident
                            console.log("Incident form submitted successfully");
                            closeModal(overlay);
                        });
                    }
                } catch (err) {
                    console.error("Error launching create incident modal:", err);
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

    // Initialize immediately in case DOM is already parsed (SPA routing)
    initCreateIncidentBtn();
    
    // Also bind to DOMContentLoaded for initial hard reloads
    document.addEventListener('DOMContentLoaded', initCreateIncidentBtn);
})();
