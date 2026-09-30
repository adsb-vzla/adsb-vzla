// ***** GUARDIÁN INVERSO: EVITA VOLVER AL LOGIN CON SESIÓN ACTIVA *****
(function () {
    'use strict';

    const SESSION_KEY = 'adsb_session';
    const SESSION_TS_KEY = 'adsb_session_ts';
    const MAX_AGE_MS = 8 * 60 * 60 * 1000; // Debe coincidir con auth-guard.js

    let session = null;
    let ts = 0;

    try {
        session = sessionStorage.getItem(SESSION_KEY);
        ts = parseInt(sessionStorage.getItem(SESSION_TS_KEY) || '0', 10);
    } catch (e) {
        session = null;
    }

    const expired = !ts || (Date.now() - ts) > MAX_AGE_MS;
    const valid = session === '1' && !expired;

    if (valid) {
        // Ya hay sesión: saltar directo al dashboard
        window.location.replace('index.html');
        throw new Error('Sesión activa: redirigiendo a index.');
    }

    // Si la sesión expiró, limpiar restos
    if (session || ts) {
        try {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_TS_KEY);
            sessionStorage.removeItem('adsb_session_user');
        } catch (e) {}
    }
})();