// ***** FUNCIÓN HELPER PARA TRADUCCIONES *****
function t(key) {
    // ***** OBTENER IDIOMA DEL NAVEGADOR (ESPAÑOL POR DEFECTO) *****
    const currentLang = localStorage.getItem('app_lang') || navigator.language.slice(0, 2) || 'es';

    // ***** OBTENER EL OBJETO CON EL DICCIONARIO DE TRADUCCIONES Y OBTENER LAS CLAVES NECESARIOS *****
    if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][key]) {
        return translations[currentLang][key];
    }

    // ***** DEVOLVER LA CLAVE SI NO SE ENCUENTRA LA TRADUCIÓN *****
    return key;
}

// ***** MOSTRAR/OCULTAR CONTRASEÑA *****

// ***** OBTENER ELEMENTOS HTML *****
const form = document.getElementById('login-form');
const password = document.getElementById('password');
const username = document.getElementById('username');
const togglePassword = document.getElementById('toggle-password');
const icon = togglePassword.querySelector('i');

// ***** DETECTAR CLICK *****
togglePassword.addEventListener('click', () => {
    // ***** DECLARAR ESTADO VISIBLE *****
    const isVisible = password.type === 'text';

    // ***** SI ES VISIBLE, INPUT TIPO TEXT; SI NO, INPUT TIPO PASSWORD *****
    password.type = isVisible ? 'password' : 'text';

    // ***** SI VISIBLE, ÍCONO DE OJO NORMAL *****
    if (isVisible) {
        // ***** LIMPIAR ÍCONO ANTERIOR PARA EVITAR ERRORES *****
        icon.classList.remove('fa-eye-slash');
        // ***** AÑADIR ÍCONO NUEVO *****
        icon.classList.add('fa-eye');
        togglePassword.setAttribute('aria-label', 'Mostrar clave');
        // ***** SI NO, ÍCONO DE OJO TACHADO *****
    } else {
        // ***** LIMPIAR ÍCONO ANTERIOR PARA EVITAR ERRORES *****
        icon.classList.remove('fa-eye');
        // ***** AÑADIR ÍCONO NUEVO *****
        icon.classList.add('fa-eye-slash');
        togglePassword.setAttribute('aria-label', 'Ocultar clave');
    }
    togglePassword.setAttribute('aria-pressed', String(!isVisible));
});

// ***** VALIDACIÓN DE USUARIO *****

// ***** SI EL FORMULARIO ES VÁLIDO *****
if (form) {
    // ***** OBTENER EVENTO SUBMIT *****
    form.addEventListener('submit', async function (event) {
        // ***** INTERCEPTAR EL ENVÍO DEL FORMULARIO PARA VERIFICAR EL CONTENIDO *****
        event.preventDefault();

        // ***** OBTENER CONTENIDO DE LOS INPUT *****
        const inputUser = username ? username.value.trim() : '';
        const inputPass = password ? password.value.trim() : '';

        // ***** VALIDAR QUE LOS INPUT NO ESTÉN VACÍOS (COMPLEMENTARIO - YA LO MANEJA HTML) *****
        if (!inputUser || !inputPass) {
            Swal.fire({
                icon: 'warning',
                title: t('swal_incomplete_title'),
                text: t('swal_incomplete_text'),
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        try {
            // ***** PETICIÓN AL NUEVO BACKEND (FLASK) *****
            // ***** EN EL SERVIDOR ES SÓLO /api/login *****
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: inputUser,
                    password: inputPass
                })
            });

            const result = await response.json();

            if (result.success) {
                // ***** GUARDAR SESIÓN *****
                try {
                    sessionStorage.setItem('adsb_session', '1');
                    sessionStorage.setItem('adsb_session_ts', String(Date.now()));
                    sessionStorage.setItem('adsb_session_user', inputUser);
                    sessionStorage.setItem('adsb_role', result.role); // GUARDAMOS EL ROL
                    sessionStorage.setItem('adsb_user_id', result.user_id);
                } catch (e) {
                    console.warn('No se pudo guardar la sesión:', e);
                }

                Swal.fire({
                    icon: 'success',
                    title: t('swal_access_granted'),
                    text: t('swal_welcome'),
                }).then(() => {
                    window.location.href = './index.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('swal_access_denied'),
                    text: result.message || t('swal_invalid_credentials'),
                    confirmButtonColor: '#d33'
                });
            }
        } catch (error) {
            console.error('Error durante la autenticación:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor de autenticación.'
            });
        }
    });
} else {
    // ***** ERROR AL ENCONTRAR EL FORMULARIO *****
    console.error("No se encontró el elemento <form id='login-form'>");
}