// ***** CAPAS DE UBICACIÓN FÍSICA DE LOS RECEPTORES (UNA POR RECEPTOR) *****
(function () {
    'use strict';

    // ***** CONFIGURACIÓN: RUTA AL JSON CON LAS COORDENADAS *****
    const LOCATIONS_JSON_URL = 'data-receivers/locations.json';

    // ***** ESTADO INTERNO DEL MÓDULO *****
    let groupLayer = null;            // ol.layer.Group contenedor
    let layersById = new Map();       // id -> ol.layer.Vector
    let sourcesById = new Map();      // id -> ol.source.Vector
    let locationsCache = {};          // id -> {lat, lon, name}
    let initialized = false;

    // ***** CREAR EL ESTILO DE UN PUNTO DE RECEPTOR (CÍRCULO CON BORDE BLANCO) *****
    function makeReceiverDotStyle(color) {
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: color }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            }),
            text: new ol.style.Text({
                font: 'bold 11px sans-serif',
                offsetY: -14,
                fill: new ol.style.Fill({ color: '#ffffff' }),
                stroke: new ol.style.Stroke({ color: '#000000', width: 3 })
            })
        });
    }

    // ***** OBTENER EL COLOR DEL RECEPTOR DESDE LA LISTA GLOBAL RECEIVERS *****
    function receiverColor(id) {
        if (typeof window.RECEIVERS !== 'undefined') {
            const rec = window.RECEIVERS.find(function (r) { return r.id === id; });
            if (rec) return rec.color;
        }
        return '#888888';
    }

    // ***** OBTENER EL NOMBRE DEL RECEPTOR DESDE LA LISTA GLOBAL RECEIVERS *****
    function receiverName(id) {
        if (typeof window.RECEIVERS !== 'undefined') {
            const rec = window.RECEIVERS.find(function (r) { return r.id === id; });
            if (rec) return rec.name;
        }
        return id.toUpperCase();
    }

    // ***** CREAR (O RECREAR) LA CAPA DE UN RECEPTOR CONCRETO *****
    function ensureReceiverLayer(id, lat, lon, name) {
        const color = receiverColor(id);
        const displayName = name || receiverName(id);

        // ***** SI YA EXISTE LA CAPA, SOLO MOVEMOS EL PUNTO *****
        if (layersById.has(id)) {
            const src = sourcesById.get(id);
            src.clear();
            const proj = ol.proj.fromLonLat([lon, lat]);
            const feat = new ol.Feature(new ol.geom.Point(proj));
            feat.setStyle(makeReceiverDotStyle(color));
            feat.set('receiverId', id);
            feat.set('receiverName', displayName);
            src.addFeature(feat);
            return layersById.get(id);
        }

        // ***** CREAR SOURCE Y FEATURE INICIAL *****
        const source = new ol.source.Vector();
        const proj = ol.proj.fromLonLat([lon, lat]);
        const feat = new ol.Feature(new ol.geom.Point(proj));
        feat.setStyle(makeReceiverDotStyle(color));
        feat.set('receiverId', id);
        feat.set('receiverName', displayName);
        source.addFeature(feat);

        // ***** LEER VISIBILIDAD GUARDADA (MISMO PATRÓN QUE EL RESTO DE OVERLAYS) *****
        let visible = true;
        try {
            const stored = localStorage.getItem('layer_receiver_loc_' + id);
            if (stored === 'false') visible = false;
        } catch (e) { /* localStorage no disponible */ }

        // ***** CREAR LA CAPA *****
        const layer = new ol.layer.Vector({
            name: 'receiver_loc_' + id,
            type: 'overlay',
            title: displayName,
            source: source,
            visible: visible,
            zIndex: 110,
            renderOrder: null,
            renderBuffer: 60,
            style: null // el estilo se aplica por feature
        });

        // ***** GUARDAR VISIBILIDAD EN LOCALSTORAGE AL CAMBIAR *****
        layer.on('change:visible', function (evt) {
            try {
                localStorage.setItem(
                    'layer_receiver_loc_' + id,
                    evt.target.getVisible() ? 'true' : 'false'
                );
            } catch (e) { /* noop */ }
        });

        layersById.set(id, layer);
        sourcesById.set(id, source);
        return layer;
    }

    // ***** CREAR EL GRUPO CONTENEDOR CON TODAS LAS CAPAS DE RECEPTORES *****
    function buildGroup(locations) {
        // ***** ELIMINAR GRUPO ANTERIOR SI EXISTE *****
        if (groupLayer && window.layersGroup && typeof window.layersGroup.remove === 'function') {
            try { window.layersGroup.remove(groupLayer); } catch (e) { }
            groupLayer = null;
            layersById.clear();
            sourcesById.clear();
        }

        const subLayers = new ol.Collection();
        // ***** INVERTIR EL ORDEN PARA QUE EN EL MENÚ DE CAPAS APAREZCAN DE LA A A LA D *****
        const sortedIds = Object.keys(locations).sort().reverse();
        
        for (const id of sortedIds) {
            const loc = locations[id];
            if (loc == null || loc.lat == null || loc.lon == null) continue;
            
            const layer = ensureReceiverLayer(id, loc.lat, loc.lon, loc.name);
            
            subLayers.push(layer);
        }

        // ***** CREAR EL GRUPO *****
        groupLayer = new ol.layer.Group({
            name: 'receivers_locations',
            title: 'Receivers locations',
            type: 'overlay',
            fold: 'close',
            combine: false,
            visible: true,
            zIndex: 99,
            layers: subLayers
        });

        // ***** AÑADIR AL GRUPO RAÍZ DE CAPAS, ANTES DEL GRUPO DE PROYECCIÓN *****
        if (window.layersGroup && typeof window.layersGroup.push === 'function') {
            // ***** BUSCAR EL ÍNDICE DEL GRUPO DE PROYECCIÓN EN LA COLECCIÓN *****
            const arr = window.layersGroup.getArray();
            let insertAt = arr.length;
            let distanceIdx = -1;
            for (let i = 0; i < arr.length; i++) {
                const lyr = arr[i];
                let nm = null;
                try {
                    nm = lyr.get && lyr.get('name');
                } catch (e) { nm = null; }
                if (nm === 'distance_tools') {
                    distanceIdx = i;
                }
            }
            // ***** INSERTAR DESPUÉS DE distance_tools (O AL FINAL SI NO EXISTE) *****
            if (distanceIdx >= 0) {
                insertAt = distanceIdx + 1;
                window.layersGroup.insertAt(insertAt, groupLayer);
            } else {
                window.layersGroup.push(groupLayer);
            }
            initialized = true;

            // ***** FORZAR REDIBUJADO DEL MENÚ DE CAPAS PARA MOSTRAR EL GRUPO *****
            if (typeof window.forceRecreateLayerSwitcher === 'function') {
                setTimeout(window.forceRecreateLayerSwitcher, 100);
            }
            // ***** Y APLICAR TRADUCCIONES A LOS TÍTULOS *****
            if (typeof window.updateLayerTitles === 'function') {
                setTimeout(window.updateLayerTitles, 200);
            }
        }
    }

    // ***** CARGAR EL JSON DE UBICACIONES Y CONSTRUIR LAS CAPAS *****
    function loadLocations() {
        fetch(LOCATIONS_JSON_URL, { cache: 'no-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status + ' cargando ' + LOCATIONS_JSON_URL);
                return res.json();
            })
            .then(function (json) {
                if (!json || typeof json !== 'object' || Array.isArray(json)) {
                    throw new Error('Formato inválido en ' + LOCATIONS_JSON_URL);
                }
                locationsCache = json;
                // ***** EXPONER LOS IDS CONFIGURADOS PARA QUE EL FETCH SOLO PIDA ESOS *****
                window.configuredReceiverIds = Object.keys(json).filter(function (id) {
                    const loc = json[id];
                    return loc && loc.lat != null && loc.lon != null;
                });
                buildGroup(locationsCache);
            })
            .catch(function (err) {
                // ***** NO ES UN ERROR CRÍTICO: SIMPLEMENTE NO HABRÁ CAPAS DE RECEPTORES *****
                console.warn('[receivers-locations] No se pudo cargar ubicaciones:', err.message);
            });
    }

    // ***** ESPERAR A QUE OLMap ESTÉ DISPONIBLE Y ARRANCAR *****
    function waitForMapAndStart() {
        if (!window.layersGroup || typeof window.layersGroup.push !== 'function') {
            setTimeout(waitForMapAndStart, 300);
            return;
        }
        loadLocations();
    }

    // ***** API PÚBLICA PARA USO EXTERNO *****
    window.ReceiversLocations = {
        // ***** RECARGAR EL JSON Y RECONSTRUIR LAS CAPAS *****
        reload: function () {
            loadLocations();
            return true;
        },
        // ***** MOSTRAR U OCULTAR LA CAPA DE UN RECEPTOR CONCRETO *****
        setVisibility: function (id, visible) {
            const layer = layersById.get(id);
            if (!layer) return false;
            layer.setVisible(!!visible);
            return true;
        },
        // ***** MOSTRAR TODAS LAS CAPAS DE RECEPTORES *****
        showAll: function () {
            layersById.forEach(function (l) { l.setVisible(true); });
        },
        // ***** OCULTAR TODAS LAS CAPAS DE RECEPTORES *****
        hideAll: function () {
            layersById.forEach(function (l) { l.setVisible(false); });
        },
        // ***** CONSULTAR EL GRUPO (PARA DEBUG) *****
        getGroup: function () { return groupLayer; },
        isInitialized: function () { return initialized; }
    };

    // ***** ARRANCAR *****
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForMapAndStart);
    } else {
        waitForMapAndStart();
    }

    // ***** REPINTAR TÍTULOS AL CAMBIAR DE IDIOMA *****
    document.addEventListener('languageChanged', function () {
        if (typeof window.updateLayerTitles === 'function') {
            setTimeout(window.updateLayerTitles, 150);
        }
    });
})();