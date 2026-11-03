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
            // ***** OBTENER ARCHIVO CON LAS CREDENCIALES (SIN CACHÉ) *****
            const cacheBuster = `?t=${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const response = await fetch(`./login-credentials.xlsx${cacheBuster}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            // ***** SI FALLÓ LA PETICIÓN AL ARCHIVO, MOSTRAR ERROR *****
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }

            // ***** OBTENER CRUDOS DEL ARCHIVO *****
            const data = await response.arrayBuffer();

            // ***** LEER Y PROCESAR DATOS OBTENIDOS *****
            const workbook = XLSX.read(data, { type: 'array' });
            // ***** OBTENER LOS DATOS DE LA PRIMERA HOJA DEL LIBRO *****
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            // ***** CONVERTIR DATOS OBTENIDOS A JSON *****
            const users = XLSX.utils.sheet_to_json(firstSheet);

            // ***** VERIFICAR SI EL USUARIO INGRESADO EXISTE EN EL ARCHIVO DE CREDENCIALES *****
            const validUser = users.find(u => {
                const keys = Object.keys(u);

                // ***** BUSCAR COINCIDENCIA IGNORANDO MAYÚSCULAS/MINÚSCULAS *****
                const userKey = keys.find(k => k.trim().toLowerCase().includes('user'));
                const passKey = keys.find(k => k.trim().toLowerCase().includes('pass'));

                // ***** SI HUBO COINCIDENCIA, OBTENERLA Y ALMACENARLO EN UNA VARIABLE *****
                const dbUser = userKey ? String(u[userKey]).trim() : '';
                const dbPass = passKey ? String(u[passKey]).trim() : '';

                // ***** EL USUARIO Y CONTRASEÑA ESCRITOS EXISTEN EN EL ARCHIVO *****
                return dbUser === inputUser && dbPass === inputPass;
            });

            // ***** ALERTA PARA USUARIO EXISTENTE *****
            if (validUser) {
                // ***** GUARDAR SESIÓN ACTIVA *****
                try {
                    sessionStorage.setItem('adsb_session', '1');
                    sessionStorage.setItem('adsb_session_ts', String(Date.now()));
                    sessionStorage.setItem('adsb_session_user', inputUser);
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
                // ***** ALERTA PARA USUARIO NO EXISTENTE *****
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('swal_access_denied'),
                    text: t('swal_invalid_credentials'),
                    confirmButtonColor: '#d33'
                });
            }
            // ***** ALERTA PARA ERROR AL LEER ARCHIVO *****
        } catch (error) {
            console.error('Error durante la autenticación:', error);
        }
    });
} else {
    // ***** ERROR AL ENCONTRAR EL FORMULARIO *****
    console.error("No se encontró el elemento <form id='login-form'>");
}