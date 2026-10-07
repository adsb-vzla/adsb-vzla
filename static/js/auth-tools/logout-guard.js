// ***** MANEJAR CIERRE DE SESIÓN *****
(function () {
    function bindLogout() {
        const link = document.getElementById('logout-sidebar-link');
        if (!link || link.dataset.bound === '1') return;
        link.dataset.bound = '1';
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // ***** REMOVER KEYS PROBLEMÁTICAS *****
            try {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && (k.startsWith('layer_') ||
                        k === 'active_tab' ||
                        k === 'sortCol' ||
                        k === 'sortAscending' ||
                        k === 'columnOrder' ||
                        k === 'sidebar_width' ||
                        k === 'sidebar_visible' ||
                        k === 'MapType_tar1090' ||
                        k === 'zoomLvl' ||
                        k === 'CenterLat' ||
                        k === 'CenterLon')) {
                        keysToRemove.push(k);
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));

                sessionStorage.clear();
            } catch (err) {
                console.warn('Logout: error limpiando storage', err);
            }

            const target = 'login.html';
            if (window.location.replace) {
                window.location.replace(target);
            } else {
                window.location.href = target;
            }
        });
    }

    // ***** ESPERAR LA CARGA COMPLETA DEL DOM PARA EJECUTAR CIERRE DE SESIÓN *****
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindLogout);
    } else {
        bindLogout();
    }

    // ***** APLICAR TRADUCCIONES *****
    document.addEventListener('languageChanged', function () {
        setTimeout(bindLogout, 100);
    });
})();