// ***** GUARDIÁN DE SESIÓN *****
(function () {
    'use strict';

    const SESSION_KEY = 'adsb_session';
    const SESSION_TS_KEY = 'adsb_session_ts';
    // ***** MANTENER SESIÓN POR 8 HORAS *****
    const MAX_AGE_MS = 8 * 60 * 60 * 1000;

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

    if (!valid) {

        try {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_TS_KEY);
            sessionStorage.removeItem('adsb_session_user');
        } catch (e) {}

        window.location.replace('login.html');

        throw new Error('Sesión no válida: redirigiendo a login.');
    }

    try {
        sessionStorage.setItem(SESSION_TS_KEY, String(Date.now()));
    } catch (e) {}
})();

// ***** REEJECUTAR GUARDIÁN AL RESTAURAR DESDE BFCACHE *****
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {

        let s, ts;
        try {
            s = sessionStorage.getItem('adsb_session');
            ts = parseInt(sessionStorage.getItem('adsb_session_ts') || '0', 10);
        } catch (e) { s = null; ts = 0; }
        if (s !== '1' || !ts || (Date.now() - ts) > 8 * 60 * 60 * 1000) {
            window.location.replace('login.html');
        }
    }
});