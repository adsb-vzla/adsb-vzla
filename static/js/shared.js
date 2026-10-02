// ***** FUNCIONES COMPARTIDAS *****

// ***** ESTRUCTURA BASE PARA LAS GUÍAS DE DISTANCIA *****
let _distanceGuideRenderer = null;

function showDistanceGuide(textOrRenderer) {
    // ***** DETECTAR FUNCIÓN DE RENDERIZADO DE TEXTO *****
    _distanceGuideRenderer =
        typeof textOrRenderer === 'function' ? textOrRenderer : () => textOrRenderer;

    // ***** OBTENER ELEMENTO HTML *****
    let guideEl = document.getElementById('distance-guide-element');
    // ***** SI EL ELEMENTO NO EXISTE, CREARLO *****
    if (!guideEl) {
        // ***** DEFINIR ELEMENTO, ID Y ESTILOS *****
        guideEl = document.createElement('div');
        guideEl.id = 'distance-guide-element';
        Object.assign(guideEl.style, {
            position: 'absolute',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid #000',
            padding: '6px 8px',
            // fontSize: '12px',
            fontSize: 'calc(12px * var(--SCALE))',
            fontWeight: '600',
            textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000',
            color: 'white',
            pointerEvents: 'none',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: '10000',
            display: 'none',
        });
        // ***** OBTENER CONTENEDOR *****
        const host = document.getElementById('map_container') || document.body;
        // ***** INSERTAR ELEMENTO *****
        host.appendChild(guideEl);
    }
    // ***** SI EL ELEMENTO EXISTE, APLICAR ESTILO *****
    guideEl.innerHTML = _distanceGuideRenderer();
    guideEl.style.display = 'block';
}

// ***** OCULTAR GUÍA *****
function hideDistanceGuide() {
    // ***** OBTENER ELEMENTO Y APLICAR PROPIEDAD NONE *****
    const guideEl = document.getElementById('distance-guide-element');
    if (guideEl) {
        guideEl.style.display = 'none';
    }
}

// ***** ACTUALIZAR TEXTO DE LAS GUÍAS SEGÚN IDIOMA *****
function updateDistanceGuideContent() {
    // ***** OBTENER ELEMENTO HTML PARA ACTUALIZAR TEXTO SEGÚN IDIOMA *****
    const guideEl = document.getElementById('distance-guide-element');
    if (!guideEl || guideEl.style.display !== 'block') return;
    if (!_distanceGuideRenderer) return;
    // ***** INSERTAR TEXTO TRADUCIDO EN EL ELEMENTO HTML *****
    guideEl.innerHTML = _distanceGuideRenderer();
}


// ***** FORMATEAR RUMBO PARA MOSTRAR EN LA ETIQUETA *****
function formatTrackDisplay(track) {
    // ***** SI NO EXISTE RUMBO, MOSTRAR ESTILO GENÉRICO *****
    if (track === null || track === undefined || isNaN(track)) {
        return '---°';
    }
    // ***** REDONDEAR ÁNGULO ENCONTRADO Y DEVOLVER CON FORMATO *****
    const rounded = Math.round(track * 10) / 10;
    return rounded.toFixed(1) + '°';
}

// ***** DETERMINAR DIRECCIÓN DE LA NARIZ DEL AVIÓN CONFORME POSICIÓN *****
function bearingFromLonLat(position1, position2) {
    // ***** NORMALIZAR POSICIONES *****
    const lon1 = position1[0] * Math.PI / 180;
    const lat1 = position1[1] * Math.PI / 180;
    const lon2 = position2[0] * Math.PI / 180;
    const lat2 = position2[1] * Math.PI / 180;

    // ***** CALCULAR DIRECCIÓN DE LA NARIZ DEL AVIÓN BASE CON RESPECTO AL AVIÓN OBJETIVO *****
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2)
        - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// ***** NORMALIZAR DIRECCIÓN DE LA NARIZ *****
function normalizeBearing(degrees) {
    return ((degrees % 360) + 360) % 360;
}

// ***** DIRECCIÓN DE LA NARIZ RELATIVA SEGÚN EL AVIÓN DE REFERENCIA Y EL AVIÓN OBJETIVO *****
function relativeBearing(referenceBearing, targetBearing) {
    // ***** SALIR SI NO HAY AVIÓN DE REFERENCIA O AVIÓN OBJETIVO *****
    if (referenceBearing == null || targetBearing == null ||
        isNaN(referenceBearing) || isNaN(targetBearing)) {
        return null;
    }

    // ***** RETORNAR DIRECCIÓN NORMALIZADA *****
    return normalizeBearing(referenceBearing - targetBearing);
}

// ***** DETERMINAR DECLINACIÓN MAGNÉTICA DE LA NARIZ *****
function magneticBearing(lat, lon, altitude, trueBearing) {
    // ***** SALIR SI NO HAY DIRECCIÓN DE LA NARIZ O DECLINACIÓN MAGNÉTICA *****
    if (!geoMag || trueBearing == null || isNaN(trueBearing)) {
        return null;
    }

    // ***** DEVOLVER DECLINACIÓN NORMALIZADA *****
    const declination = geoMag(lat, lon, altitude || 0).dec || 0;
    return normalizeBearing(trueBearing - declination);
}

// ***** DAR FORMATO AL ÁNGULO OBTENIDO *****
function formatAngle(angle) {
    return angle == null || isNaN(angle)
        ? '---°'
        : `${angle.toFixed(1)}°`;
}

// ***** FUNCIÓN HAVERSINE PARA DISTANCIA ENTRE PUNTOS *****
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 / 1.852;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ***** OBTENER FUENTE DE CAPA DE NUMERACIÓN *****
function _getPointNumberSource(layerKey) {
    // ***** MANEJAR LOS MODOS DE DISTANCIA EXISTENTES *****
    switch (layerKey) {
        case 'aa': return (typeof pointNumberSourceAA !== 'undefined') ? pointNumberSourceAA : null;
        case 'ta': return (typeof pointNumberSourceTA !== 'undefined') ? pointNumberSourceTA : null;
        case 'tt': return (typeof pointNumberSourceTT !== 'undefined') ? pointNumberSourceTT : null;
        // ***** ERROR DE MODO DESCONOCIDO *****
        default:
            console.warn('updatePointNumbers: layerKey desconocido:', layerKey);
            return null;
    }
}

// ***** ACTUALIZAR NUMERACIÓN *****
function updatePointNumbers(layerKey, points, replaceAll = false) {
    // ***** SALIR SI NO HAY MAPA DISPONIBLE *****
    if (!OLMap) return;

    // ***** SALIR SI NO HAY FUENTE DISPONIBLE *****
    const source = _getPointNumberSource(layerKey);
    if (!source) return;

    // ***** LIMPIAR FUENTE SI SE EJECUTÓ LA FUNCIÓN DE REEMPLAZAR TODO *****
    if (replaceAll) source.clear();

    // ***** CUANDO EXISTAN PUNTOS *****
    for (const p of points) {
        // ***** SALIR SI NO HAY PUNTOS *****
        if (!p || !p.coord || !p.key) continue;

        // ***** INICIALIZAR VARIABLE PARA ALMACENAR PUNTOS EXISTENTES *****
        let existing = null;
        // ***** OBTENER PUNTO SELECCIONADO Y MARCAR COMO PUNTO EXISTENTE *****
        source.forEachFeature(f => {
            if (f.get('pointKey') === p.key) existing = f;
        });

        // ***** PARA EL PUNTO EXISTENTE, DIBUJAR NÚMERO CORRESPONDIENTE *****
        if (existing) {
            existing.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(p.coord)));
            existing.set('num', p.num);
            existing.set('isDark', !!p.isDark);
        } else {
            // ***** SI NO HAY PUNTO NUEVO, INSERTAR EL PUNTO ANTERIOR *****
            source.addFeature(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat(p.coord)),
                pointKey: p.key,
                num: p.num,
                isDark: !!p.isDark
            }));
        }
    }
}

// ***** ELIMINAR LA NUMERACIÓN EXISTENTE *****
function removePointNumbers(layerKey, keysArray) {
    // ***** OBTENER FUENTE *****
    const source = _getPointNumberSource(layerKey);
    // ***** SALIR SI NO EXISTE FUENTE *****
    if (!source) return;
    // ***** INICIAR ARRAY DE PUNTOS A ELIMINAR *****
    const toRemove = [];
    // ***** OBTENER LOS PUNTOS DE LA FUENTE Y AÑADIRLOS AL ARRAY PARA ELIMINAR *****
    source.forEachFeature(f => {
        if (keysArray.includes(f.get('pointKey'))) toRemove.push(f);
    });
    // ***** ELIMINAR TODOS LOS PUNTOS DEL ARRAY *****
    toRemove.forEach(f => source.removeFeature(f));
}

// ***** LIMPIAR NUMERACIÓN EXISTENTE *****
function clearPointNumbers(layerKey) {
    // ***** OBTENER FUENTE *****
    const source = _getPointNumberSource(layerKey);
    // ***** LIMPIAR FUENTE SI EXISTE *****
    if (source) source.clear();
}

// ***** OBTENER FUENTE DE PUNTOS DE AVIÓN *****
function _getPlanePointSource(layerKey) {
    // ***** MANEJAR LOS MODOS DE DISTANCIA EXISTENTES *****
    switch (layerKey) {
        case 'aa': return (typeof planePointSourceAA !== 'undefined') ? planePointSourceAA : null;
        case 'ta': return (typeof planePointSourceTA !== 'undefined') ? planePointSourceTA : null;
        // ***** ERROR DE MODO DESCONOCIDO *****
        default:
            console.warn('updatePlanePoints: layerKey desconocido:', layerKey);
            return null;
    }
}

// ***** ACTUALIZAR PUNTOS DE AVIÓN *****
function updatePlanePoints(layerKey, points, replaceAll = false) {
    // ***** SALIR SI NO HAY MAPA DISPONIBLE *****
    if (!OLMap) return;

    // ***** SALIR SI NO HAY FUENTE DISPONIBLE *****
    const source = _getPlanePointSource(layerKey);
    if (!source) return;

    // ***** LIMPIAR FUENTE SI SE EJECUTÓ LA FUNCIÓN DE REEMPLAZAR TODO *****
    if (replaceAll) source.clear();

    // ***** CUANDO EXISTAN PUNTOS *****
    for (const p of points) {
        // ***** SALIR SI NO HAY PUNTOS *****
        if (!p || !p.coord || !p.key) continue;

        // ***** INICIALIZAR VARIABLE PARA ALMACENAR PUNTOS EXISTENTES *****
        let existing = null;
        // ***** OBTENER PUNTO SELECCIONADO Y MARCAR COMO PUNTO EXISTENTE *****
        source.forEachFeature(f => {
            if (f.get('planePointKey') === p.key) existing = f;
        });

        // ***** PARA EL PUNTO EXISTENTE, DIBUJAR AVIÓN CORRESPONDIENTE *****
        if (existing) {
            existing.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(p.coord)));
            existing.set('hex', p.hex || '');
            // ***** SI NO HAY PUNTO NUEVO, INSERTAR EL PUNTO ANTERIOR *****
        } else {
            source.addFeature(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat(p.coord)),
                planePointKey: p.key,
                hex: p.hex || ''
            }));
        }
    }

    // ***** RENDERIZAR MAPA *****
    if (OLMap) OLMap.render();
}

// ***** ELIMINAR LOS PUNTOS DE AVIÓN EXISTENTES *****
function removePlanePoints(layerKey, keysArray) {
    // ***** OBTENER FUENTE *****
    const source = _getPlanePointSource(layerKey);
    // ***** SALIR SI NO EXISTE FUENTE *****
    if (!source) return;
    // ***** INICIAR ARRAY DE PUNTOS A ELIMINAR *****
    const toRemove = [];
    // ***** OBTENER LOS PUNTOS DE LA FUENTE Y AÑADIRLOS AL ARRAY PARA ELIMINAR *****
    source.forEachFeature(f => {
        if (keysArray.includes(f.get('planePointKey'))) toRemove.push(f);
    });
    // ***** ELIMINAR TODOS LOS PUNTOS DEL ARRAY *****
    toRemove.forEach(f => source.removeFeature(f));
}

// ***** LIMPIAR PUNTOS DE AVIÓN EXISTENTES *****
function clearPlanePoints(layerKey) {
    // ***** OBTENER FUENTE *****
    const source = _getPlanePointSource(layerKey);
    // ***** LIMPIAR FUENTE SI EXISTE *****
    if (source) source.clear();
}

// ***** OBTENER CAPAS PARA CADA GRUPO *****
const _overlayLayerSources = {};
const _overlayLayers = {};
const _overlayLayerConfigs = {};

// ***** ASEGURAR CAPAS DE GRUPOS *****
function ensureOverlayLayer(layerKey) {
    // ***** SALIR SI NO EXISTE NINGUNA CAPA *****
    if (_overlayLayers[layerKey]) return _overlayLayers[layerKey];

    const cfg = _overlayLayerConfigs[layerKey];
    if (!cfg || !OLMap) return null;

    // ***** DETERMINAR CADA CAPA OVERLAY *****
    const source = new ol.source.Vector();
    const layer = new ol.layer.Vector({
        name: cfg.name,
        type: 'overlay',
        title: cfg.title,
        source,
        zIndex: cfg.zIndex,
        visible: cfg.visible !== undefined ? cfg.visible : true,
        style: cfg.style || null,
        renderBuffer: typeof renderBuffer !== 'undefined' ? renderBuffer : 60
    });

    _overlayLayerSources[layerKey] = source;
    _overlayLayers[layerKey] = layer;
    return layer;
}

// ***** REGISTRAR CADA GRUPO DE CAPAS *****
function registerOverlayLayer(layerKey, config) {
    _overlayLayerConfigs[layerKey] = config;
}

// ***** DETERMINAR LOS SUB GRUPOS PARA CADA GRUPO DE CAPAS *****
const _distanceGroupLayers = {};
const _distanceGroupConfigs = {
    aa: { name: 'aircraft_aircraft', title: 'Aircraft-aircraft' },
    ta: { name: 'ground_point_aircraft', title: 'Ground point-aircraft' },
    tt: { name: 'ground_point_ground_point', title: 'Ground point-ground point' },
};

// ***** ASEGURAR GRUPO DE CAPAS DE DISTANCIA *****
function ensureDistanceGroup(groupKey) {
    // ***** SALIR SI NO EXISTEN LAS CAPAS INTERNAS *****
    if (_distanceGroupLayers[groupKey]) return _distanceGroupLayers[groupKey];

    const cfg = _distanceGroupConfigs[groupKey];
    if (!cfg) return null;

    const group = new ol.layer.Group({
        name: cfg.name,
        title: cfg.title,
        type: 'overlay',
        fold: 'close',
        combine: false,
        layers: new ol.Collection([])
    });

    _distanceGroupLayers[groupKey] = group;
    return group;
}

// ***** AÑADIR CAPA AL GRUPO DE DISTANCIA *****
function addLayerToDistanceGroup(groupKey, layer) {
    const group = ensureDistanceGroup(groupKey);
    if (!group) {
        if (OLMap) OLMap.addLayer(layer);
        return;
    }
    group.getLayers().push(layer);

    if (OLMap) {
        const root = window._distanceRootGroup;
        if (root) {
            if (!root.getLayers().getArray().includes(group)) {
                root.getLayers().push(group);
            }
            if (!OLMap.getLayers().getArray().includes(root)) {
                OLMap.addLayer(root);
            }
        } else if (!OLMap.getLayers().getArray().includes(group)) {
            OLMap.addLayer(group);
        }
        if (typeof refreshLayerSwitcher === 'function') {
            refreshLayerSwitcher();
        }
    }
}

// ***** ASEGURAR GRUPO DE CAPAS DE ELEVACIÓN *****
window.ensureElevationGroup = function (key) {
    if (!window._elevationGroups) window._elevationGroups = {};

    if (window._elevationGroups[key]) return window._elevationGroups[key];

    let groupConfig;
    if (key === 'gg') {
        groupConfig = {
            name: 'elevation_gg',
            title: 'Ground point-ground point',
            type: 'overlay',
            fold: 'close',
            combine: false,
            visible: true,
            layers: new ol.Collection([])
        };
    } else if (key === 'ga') {
        groupConfig = {
            name: 'elevation_ga',
            title: 'Ground point-aircraft',
            type: 'overlay',
            fold: 'close',
            combine: false,
            visible: true,
            layers: new ol.Collection([])
        };
    } else {
        return null;
    }

    const group = new ol.layer.Group(groupConfig);
    window._elevationGroups[key] = group;
    return group;
};

// ***** AÑADIR CAPA AL GRUPO DE ELEVACIÓN *****
window.addLayerToElevationGroup = function (key, layer) {
    const group = window.ensureElevationGroup(key);
    if (group && layer) {
        group.getLayers().push(layer);
    }
};

// ***** REGISTRO DE AVIONES INSTRUMENTADOS *****
window.InstrumentedAircraft = {
    hexes: new Set(),

    register(hex) {
        if (!hex) return;
        this.hexes.add(hex);
        const plane = g.planes[hex];
        if (plane && (replay || showTrace)) {
            if (!plane.fullTrace) {

                getTrace(plane, hex, { noDeselect: true, noFetch: false });
            } else {
                this.enrichFromTrace(plane);
            }
        }
    },

    unregister(hex) {
        if (hex) this.hexes.delete(hex);
    },

    clear() {
        this.hexes.clear();
    },

    enrichFromTrace(plane) {
        if (!plane || !plane.fullTrace || !plane.fullTrace.trace || !plane.fullTrace.trace.length) {
            return;
        }

        const trace = plane.fullTrace.trace;
        let best = null;
        let bestDiff = Infinity;
        for (let i = 0; i < trace.length; i++) {
            const pt = trace[i];
            const ts = pt[0];
            const diff = Math.abs(ts - plane.position_time);
            if (diff < bestDiff) {
                bestDiff = diff;
                best = pt;
            }
        }
        if (!best || bestDiff > 60) return;

        const [, lat, lon, altitude, gs, track, flags, rate, data, type, geom_alt, geom_rate, ias, roll, rId] = best;
        if (track != null) {
            plane.track = track;
            plane.rotation = track;
        }
        if (data) {
            if (data.mag_heading != null) plane.mag_heading = data.mag_heading;
            if (data.true_heading != null) plane.true_heading = data.true_heading;
            if (data.track_rate != null) plane.track_rate = data.track_rate;
            if (data.tas != null) plane.tas = data.tas;
            if (data.mach != null) plane.mach = data.mach;
            if (data.nav_qnh != null) plane.nav_qnh = data.nav_qnh;
            if (data.nav_altitude != null) plane.nav_altitude = data.nav_altitude;
            if (data.nav_heading != null) plane.nav_heading = data.nav_heading;
            if (data.wd != null) plane.wd = data.wd;
            if (data.ws != null) plane.ws = data.ws;
        }
        if (geom_alt != null) plane.alt_geom = geom_alt;
        if (geom_rate != null) plane.geom_rate = geom_rate;
        if (ias != null) plane.ias = ias;
        if (roll != null) plane.roll = roll;
        if (rId != null) plane.rId = rId;
    }
};

// ***** EXPONER FUNCIONES GLOBALMENTE PARA USO EN OTROS ARCHIVOS *****
window.haversineDistance = haversineDistance;
window.bearingFromLonLat = bearingFromLonLat;
window.normalizeBearing = normalizeBearing;
window.relativeBearing = relativeBearing;
window.magneticBearing = magneticBearing;
window.formatAngle = formatAngle;
window.formatTrackDisplay = formatTrackDisplay;
window.showDistanceGuide = showDistanceGuide;
window.hideDistanceGuide = hideDistanceGuide;
window.updateDistanceGuideContent = updateDistanceGuideContent;
window.updatePointNumbers = updatePointNumbers;
window.removePointNumbers = removePointNumbers;
window.clearPointNumbers = clearPointNumbers;
window.updatePlanePoints = updatePlanePoints;
window.removePlanePoints = removePlanePoints;
window.clearPlanePoints = clearPlanePoints;
window.ensureDistanceGroup = ensureDistanceGroup;
window.addLayerToDistanceGroup = addLayerToDistanceGroup;