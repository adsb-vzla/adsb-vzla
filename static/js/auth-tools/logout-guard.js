// ***** MANEJAR CIERRE DE SESIÓN *****
(function () {
    function bindLogout() {
        const link = document.getElementById('logout-sidebar-link');
        if (!link || link.dataset.bound === '1') return;
        link.dataset.bound = '1';
        link.addEventListener('click', function (e) {
            e.preventDefault();

            try {
                // ***** GUARDAR IDIOMA *****
                const currentLang = localStorage.getItem('app_lang');

                // ***** LIMPIART TODO LO QUE ESTÉ ALMACENADO LOCALMENTE *****
                localStorage.clear();

                // ***** LIMPIAR TODO LO QUE ESTÉ ALMACENADO EN SESIÓN *****
                sessionStorage.clear();

                // ***** RESTAURAR IDIOMA *****
                if (currentLang) {
                    localStorage.setItem('app_lang', currentLang);
                }
            // ***** LOG EN CASO DE ERROR LIMPIANDO ALMACENAMIENTO *****
            } catch (err) {
                console.warn('Logout: error limpiando storage', err);
            }

            // ***** REDIRIGIR A LOGIN *****
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