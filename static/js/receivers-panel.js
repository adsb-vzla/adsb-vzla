// ***** PANEL DE RECEPTORES: DROPDOWN EN INFOBLOCK + COLUMNA EN TABLA *****
(function () {
    'use strict';

    let lastSelectedPlane = null;

    // ***** ACTUALIZAR LA LISTA PLANA DE RECEPTORES EN EL INFOBLOCK SELECCIONADO *****
    function updateSelectedReceiversDropdown(plane) {
        const countEl = document.getElementById('selected_receivers_count');
        const listEl = document.getElementById('selected_receivers_list');
        if (!countEl || !listEl) return;

        let ids = [];
        if (plane && plane.receivers && typeof window.getPlaneReceiverIds === 'function') {
            ids = window.getPlaneReceiverIds(plane, false);
        } else if (plane && plane.receivers) {
            ids = Array.from(plane.receivers);
        }

        const count = ids.length;
        const noneText = window.getTranslatedText
            ? window.getTranslatedText('receivers_none', 'None')
            : 'None';
        const countTpl = window.getTranslatedText
            ? window.getTranslatedText('receivers_count', '{n} receiver(s)')
            : '{n} receiver(s)';

        // ***** TEXTO DEL CONTADOR (SOLO NÚMERO EN LÍNEA CON EL TÍTULO) *****
        countEl.textContent = count > 0 ? String(count) : noneText;
        countEl.title = countTpl.replace('{n}', count);

        // ***** CONSTRUIR LA LISTA PLANA CON CÍRCULO DE COLOR + NOMBRE *****
        let html = '';
        if (count > 0) {
            for (const id of ids) {
                const receiver = (typeof window.RECEIVER_BY_ID !== 'undefined')
                    ? window.RECEIVER_BY_ID.get(id)
                    : null;
                const name = receiver
                    ? (typeof window.getReceiverDisplayName === 'function'
                        ? window.getReceiverDisplayName(receiver)
                        : receiver.name)
                    : id;
                const color = receiver ? receiver.color : '#888';
                const safeName = (typeof window.escapeHtml === 'function')
                    ? window.escapeHtml(name)
                    : name;

                html += '<div class="receiver-entry" style="padding-left: 2px;">'
                    + '<span class="receiver-color-dot" style="background-color:' + color + ';"></span>'
                    + '<span class="receiver-entry-name">' + safeName + '</span>'
                    + '</div>';
            }
        }
        listEl.innerHTML = html;
    }

    // ***** REGISTRAR LA COLUMNA EN LA TABLA (CUANDO planeMan EXISTA) *****
    function registerReceiversColumn() {
        if (typeof TAR === 'undefined' || !TAR.planeMan || !TAR.planeMan.cols) {
            setTimeout(registerReceiversColumn, 200);
            return;
        }
        const cols = TAR.planeMan.cols;
        if (cols.receivers) return;

        // ***** HELPERS INTERNOS DE ORDENACIÓN *****
        function compareNumeric(xf, yf) {
            if (Math.abs(xf - yf) < 1e-9) return 0;
            return xf - yf;
        }

        cols.receivers = {
            text: 'Receivers',
            sort: function () {
                // ***** REDIBUJAR APLICANDO ORDEN POR CONTEO DE RECEPTORES *****
                const planes = g.planesOrdered.slice();
                planes.sort(function (a, b) {
                    const ca = a.receivers ? a.receivers.size : 0;
                    const cb = b.receivers ? b.receivers.size : 0;
                    return compareNumeric(ca, cb);
                });
                // ***** NO TOCAR EL ORDEN GLOBAL; SOLO REFRESCAR LA TABLA *****
                TAR.planeMan.refresh();
            },
            value: function (plane) {
                const count = plane.receivers ? plane.receivers.size : 0;
                return count > 0 ? String(count) : '0';
            },
            align: 'center'
        };

        // ***** COMPLETAR PROPIEDADES REQUERIDAS POR planeMan *****
        const col = cols.receivers;
        col.id = 'receivers';
        col.header = function () {
            let text = col.text || col.id;
            if (typeof window.translate !== 'undefined' && window.translate.t) {
                const tr = window.translate.t('col_receivers');
                if (tr && tr !== 'col_receivers') text = tr;
            }
            return text;
        };
        col.td = '<td style="text-align: right">';
        col.visible = true;
        col.toggleKey = 'column_receivers';

        // ***** REFRESCAR REDIBUJADO PARA INCLUIR LA NUEVA COLUMNA *****
        if (typeof TAR.planeMan.redraw === 'function') {
            TAR.planeMan.redraw();
        }
    }

    // ***** EXPONER FUNCIONES AL SCOPE GLOBAL *****
    window.updateSelectedReceiversDropdown = updateSelectedReceiversDropdown;

    // ***** ARRANCAR EL REGISTRO DE LA COLUMNA *****
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerReceiversColumn);
    } else {
        registerReceiversColumn();
    }

    // ***** ESCUCHAR CAMBIO DE IDIOMA PARA REPINTAR EL HEADER DE LA COLUMNA *****
    document.addEventListener('languageChanged', function () {
        if (lastSelectedPlane) updateSelectedReceiversDropdown(lastSelectedPlane);
        if (typeof TAR !== 'undefined' && TAR.planeMan && TAR.planeMan.cols && TAR.planeMan.cols.receivers) {
            if (typeof TAR.planeMan.redraw === 'function') TAR.planeMan.redraw();
        }
    });

    const originalUpdate = window.updateSelectedReceiversDropdown;
    window.updateSelectedReceiversDropdown = function (plane) {
        lastSelectedPlane = plane;
        originalUpdate(plane);
    };
})();