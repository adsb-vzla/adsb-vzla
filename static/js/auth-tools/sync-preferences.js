// ***** SINCRONIZACIÓN DE PREFERENCIAS CON LA BASE DE DATOS *****
(function() {
    'use strict';

    // En producción (servidor), esta URL debería ser relativa: '/api/'
    // En tu WSL, como el HTML se sirve por un lado y Flask por otro, usamos la URL absoluta.
    // ***** EN EL SERVIDOR ES SÓLO /auth-api *****
    const API_BASE_URL = 'http://127.0.0.1:5000/auth-api';

    const userId = sessionStorage.getItem('adsb_user_id');
    if (!userId) return;

    // 1. CARGAR PREFERENCIAS AL INICIAR
    async function loadPreferences() {
        try {
            const response = await fetch(`${API_BASE_URL}/preferences/${userId}`);
            const data = await response.json();
            
            if (data.success && data.preferences) {
                for (const [key, value] of Object.entries(data.preferences)) {
                    localStorage.setItem(key, value);
                }
                console.log("Preferencias cargadas desde la Base de Datos:", data.preferences);
            }
        } catch (error) {
            console.error("Error cargando preferencias:", error);
        }
    }

    // 2. ESCUCHAR CAMBIOS Y GUARDAR EN LA BD
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Interceptar la clase Toggle de tar1090
            if (typeof window.Toggle !== 'undefined' && Toggle.prototype.toggle) {
                const originalToggle = Toggle.prototype.toggle;
                
                Toggle.prototype.toggle = function(override, init) {
                    originalToggle.call(this, override, init);

                    if (!init) {
                        fetch(`${API_BASE_URL}/preferences`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: userId,
                                key: this.key,
                                value: String(this.state)
                            })
                        }).catch(err => console.error("Error guardando preferencia:", err));
                    }
                };
            }

            // Interceptar el selector de unidades
            const unitsSelector = document.getElementById('units_selector');
            if (unitsSelector) {
                unitsSelector.addEventListener('change', (e) => {
                    fetch(`${API_BASE_URL}/preferences`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId, key: 'displayUnits', value: e.target.value })
                    });
                });
            }

            // Interceptar los sliders (Icon Scale y User Scale)
            if (typeof jQuery !== 'undefined') {
                jQuery('#iconScaleSlider').on('slidechange', function() {
                    fetch(`${API_BASE_URL}/preferences`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId, key: 'iconScale', value: String(iconScale) })
                    });
                });
                jQuery('#userScaleSlider').on('slidechange', function() {
                    fetch(`${API_BASE_URL}/preferences`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId, key: 'userScale', value: String(userScale) })
                    });
                });
            }
        }, 1000);
    });

    loadPreferences();
})();