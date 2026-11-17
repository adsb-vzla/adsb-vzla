// ***** VISTA DE AERONAVES AGRUPADAS POR RECEPTOR *****
(function () {
    'use strict';

    let renderedSignature = '';

    function translate(key, fallback) {
        if (typeof window.getTranslatedText === 'function') {
            return window.getTranslatedText(key, fallback);
        }
        if (window.translate && typeof window.translate.t === 'function') {
            return window.translate.t(key) || fallback;
        }
        return fallback;
    }

    function escape(value) {
        return typeof window.escapeHtml === 'function'
            ? window.escapeHtml(String(value == null ? '' : value))
            : String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
                return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
            });
    }

    function altitude(plane) {
        if (plane.altitude === 'ground') return translate('receivers_ground', 'Ground');
        if (plane.altitude == null || plane.altitude === '') return 'n/a';
        const value = Number(plane.altitude);
        return Number.isFinite(value) ? Math.round(value).toLocaleString() + ' ft' : 'n/a';
    }

    function aircraftLabel(plane) {
        return plane.flight && plane.flight.trim()
            ? plane.flight.trim()
            : (plane.registration || plane.icao || 'n/a');
    }

    function renderAircraft(plane) {
        const label = escape(aircraftLabel(plane));
        const registration = escape(plane.registration || plane.icao || 'n/a');
        const type = escape(plane.icaoType || plane.typeDescription || 'n/a');
        const route = escape(plane.routeString || translate('receivers_no_route', 'No route'));
        return '<button type="button" class="receiver-aircraft-row" data-icao="' + escape(plane.icao) + '">'
            + '<span class="receiver-aircraft-main"><strong>' + label + '</strong>'
            + '<span>' + registration + ' · ' + type + '</span></span>'
            + '<span class="receiver-aircraft-details"><span>' + altitude(plane) + '</span>'
            + '<span>' + route + '</span></span>'
            + '</button>';
    }

    function setReceiverFilter(id) {
        if (typeof window.setReceiverFilter === 'function') {
            window.setReceiverFilter(id);
        }
    }

    function render() {
        const container = document.getElementById('receivers-tab-content');
        if (!container || typeof window.RECEIVERS === 'undefined' || typeof g === 'undefined') return;

        const groups = new Map(window.RECEIVERS.map(function (receiver) {
            return [receiver.id, []];
        }));
        const planes = Array.isArray(g.planesOrdered) ? g.planesOrdered : [];

        planes.forEach(function (plane) {
            if (!plane || !plane.receivers || plane.visible === false) return;
            const receiverIds = typeof window.getPlaneReceiverIds === 'function'
                ? window.getPlaneReceiverIds(plane, false)
                : Array.from(plane.receivers);
            receiverIds.forEach(function (id) {
                if (groups.has(id)) groups.get(id).push(plane);
            });
        });

        const signature = window.RECEIVERS.map(function (receiver) {
            return receiver.id + ':' + groups.get(receiver.id).map(function (plane) {
                return plane.icao + ':' + (plane.visible ? '1' : '0') + ':' + plane.flight + ':' + plane.altitude;
            }).join(',');
        }).join('|');
        if (signature === renderedSignature) return;
        renderedSignature = signature;

        let html = '<div class="receivers-tab-toolbar">'
            + '<div><strong>' + escape(translate('receivers_tab_title', 'Aircraft by receiver')) + '</strong>'
            + '<small>' + escape(translate('receivers_tab_help', 'Click a receiver to filter the map and aircraft table.')) + '</small></div>'
            + '<button type="button" class="formButton receiver-show-all">'
            + escape(translate('receivers_show_all', 'Show all')) + '</button></div>';

        window.RECEIVERS.forEach(function (receiver) {
            const aircraft = groups.get(receiver.id).slice().sort(function (a, b) {
                return aircraftLabel(a).localeCompare(aircraftLabel(b));
            });
            const name = typeof window.getReceiverDisplayName === 'function'
                ? window.getReceiverDisplayName(receiver)
                : receiver.name;
            html += '<section class="receiver-aircraft-group">'
                + '<button type="button" class="receiver-group-header" data-receiver-id="' + escape(receiver.id) + '">'
                + '<span class="receiver-group-name"><span class="receiver-color-dot" style="background-color:'
                + escape(receiver.color) + '"></span>' + escape(name) + '</span>'
                + '<span class="receiver-group-count">' + aircraft.length + '</span></button>'
                + '<div class="receiver-aircraft-list">'
                + (aircraft.length ? aircraft.map(renderAircraft).join('')
                    : '<div class="receiver-empty">' + escape(translate('receivers_no_aircraft', 'No aircraft currently received')) + '</div>')
                + '</div></section>';
        });

        container.innerHTML = html;
        container.querySelector('.receiver-show-all').addEventListener('click', function () {
            setReceiverFilter(null);
        });
        container.querySelectorAll('.receiver-group-header').forEach(function (button) {
            button.addEventListener('click', function () {
                setReceiverFilter(button.dataset.receiverId);
            });
        });
        container.querySelectorAll('.receiver-aircraft-row').forEach(function (button) {
            button.addEventListener('click', function () {
                if (typeof window.selectPlaneByHex === 'function') {
                    window.selectPlaneByHex(button.dataset.icao, { follow: false });
                }
            });
        });
    }

    window.setReceiverFilter = function (id) {
        receiverFilter = id ? new Set([id]) : null;
        if (typeof refreshFilter === 'function') refreshFilter();
        renderedSignature = '';
        render();
    };
    window.refreshReceiversTab = render;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
    document.addEventListener('languageChanged', function () {
        renderedSignature = '';
        render();
    });
})();
