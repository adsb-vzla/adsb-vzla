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
            fontSize: '12px',
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
    // Positions in format [lon in deg, lat in deg]
    const lon1 = position1[0] * Math.PI / 180;
    const lat1 = position1[1] * Math.PI / 180;
    const lon2 = position2[0] * Math.PI / 180;
    const lat2 = position2[1] * Math.PI / 180;

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2)
        - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function normalizeBearing(degrees) {
    return ((degrees % 360) + 360) % 360;
}

function relativeBearing(referenceBearing, targetBearing) {
    if (referenceBearing == null || targetBearing == null ||
        isNaN(referenceBearing) || isNaN(targetBearing)) {
        return null;
    }

    return normalizeBearing(referenceBearing - targetBearing);
}

function magneticBearing(lat, lon, altitude, trueBearing) {
    if (!geoMag || trueBearing == null || isNaN(trueBearing)) {
        return null;
    }

    const declination = geoMag(lat, lon, altitude || 0).dec || 0;
    return normalizeBearing(trueBearing - declination);
}

function formatAngle(angle) {
    return angle == null || isNaN(angle)
        ? '---°'
        : `${angle.toFixed(1)}°`;
}

// **************************************************
// ******** INICIO FUNCIÓN DE HAVERSINE *************
// **************************************************
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 / 1.852; // Radio de la Tierra en millas náuticas
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// **************************************************
// ********** FIN FUNCIÓN DE HAVERSINE **************
// **************************************************

// **************************************************
// **** INICIO NUMERACIÓN DE PUNTOS EN EL MAPA ******
// **************************************************
const _pointNumberSources = {};   // layerKey -> ol.source.Vector
const _pointNumberLayers  = {};   // layerKey -> ol.layer.Vector

function ensurePointNumberLayer(layerKey) {
    if (_pointNumberLayers[layerKey]) return;

    const source = new ol.source.Vector();
    const layer = new ol.layer.Vector({
        name: 'pointNumbers_' + layerKey,
        type: 'overlay',
        title: 'Point numbers',
        source: source,
        zIndex: 305,
        style: (feature) => {
            const num = feature.get('num');
            const isDark = feature.get('isDark');
            return new ol.style.Style({
                text: new ol.style.Text({
                    text: String(num),
                    font: 'bold 13px sans-serif',
                    fill: new ol.style.Fill({ color: isDark ? '#000' : '#fff' }),
                    stroke: new ol.style.Stroke({ color: isDark ? '#fff' : '#000', width: 3 }),
                    offsetY: -14
                })
            });
        }
    });

    OLMap.addLayer(layer);
    _pointNumberSources[layerKey] = source;
    _pointNumberLayers[layerKey]  = layer;
}

/**
 * Actualiza los números de los puntos.
 * @param {string} layerKey - 'aa' | 'ta' | 'tt' | 'elev'
 * @param {Array}  points   - [{ key: 'id-unico', coord: [lon,lat], num: 1, isDark: false }, ...]
 * @param {boolean} replaceAll - Si es true, limpia antes de agregar. Default false.
 */
function updatePointNumbers(layerKey, points, replaceAll = false) {
    if (!OLMap) return;
    ensurePointNumberLayer(layerKey);

    const source = _pointNumberSources[layerKey];
    if (!source) return;

    if (replaceAll) source.clear();

    for (const p of points) {
        if (!p || !p.coord || !p.key) continue;

        // Si ya existe un feature con ese key, actualizarlo
        let existing = null;
        source.forEachFeature(f => {
            if (f.get('pointKey') === p.key) existing = f;
        });

        if (existing) {
            existing.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(p.coord)));
            existing.set('num', p.num);
            existing.set('isDark', !!p.isDark);
        } else {
            source.addFeature(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat(p.coord)),
                pointKey: p.key,
                num: p.num,
                isDark: !!p.isDark
            }));
        }
    }
}

/**
 * Elimina números específicos por su key.
 */
function removePointNumbers(layerKey, keysArray) {
    const source = _pointNumberSources[layerKey];
    if (!source) return;
    const toRemove = [];
    source.forEachFeature(f => {
        if (keysArray.includes(f.get('pointKey'))) toRemove.push(f);
    });
    toRemove.forEach(f => source.removeFeature(f));
}

function clearPointNumbers(layerKey) {
    if (_pointNumberSources[layerKey]) _pointNumberSources[layerKey].clear();
}
// **************************************************
// **** FIN NUMERACIÓN DE PUNTOS EN EL MAPA *********
// **************************************************

// **************************************************
// **** CAPA DE PUNTOS PARA AVIONES SELECCIONADOS ***
// **************************************************
const _planePointSources = {};   // layerKey -> ol.source.Vector
const _planePointLayers  = {};   // layerKey -> ol.layer.Vector

function ensurePlanePointLayer(layerKey) {
    if (_planePointLayers[layerKey]) return;

    const source = new ol.source.Vector();
    const layer = new ol.layer.Vector({
        name: 'planePoints_' + layerKey,
        type: 'overlay',
        title: 'Plane points',
        source: source,
        zIndex: 250,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: '#222' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });

    if (OLMap) {
        OLMap.addLayer(layer);
    }

    _planePointSources[layerKey] = source;
    _planePointLayers[layerKey] = layer;
}

/**
 * Actualiza los puntos de los aviones seleccionados.
 * @param {string} layerKey - 'aa' | 'ta'
 * @param {Array}  points   - [{ key, coord, hex }, ...]
 * @param {boolean} replaceAll
 */
function updatePlanePoints(layerKey, points, replaceAll = false) {
    if (!OLMap) return;
    ensurePlanePointLayer(layerKey);

    const source = _planePointSources[layerKey];
    if (!source) return;

    if (replaceAll) source.clear();

    for (const p of points) {
        if (!p || !p.coord || !p.key) continue;

        let existing = null;
        source.forEachFeature(f => {
            if (f.get('planePointKey') === p.key) existing = f;
        });

        if (existing) {
            existing.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(p.coord)));
            existing.set('hex', p.hex || '');
        } else {
            source.addFeature(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat(p.coord)),
                planePointKey: p.key,
                hex: p.hex || ''
            }));
        }
    }

    if (OLMap) OLMap.render();
}

function removePlanePoints(layerKey, keysArray) {
    const source = _planePointSources[layerKey];
    if (!source) return;
    const toRemove = [];
    source.forEachFeature(f => {
        if (keysArray.includes(f.get('planePointKey'))) toRemove.push(f);
    });
    toRemove.forEach(f => source.removeFeature(f));
}

function clearPlanePoints(layerKey) {
    if (_planePointSources[layerKey]) _planePointSources[layerKey].clear();
}

// ***** REGISTRO GENÉRICO DE CAPAS OVERLAY CACHEABLES *****
const _overlayLayerSources = {};  // layerKey -> ol.source.Vector
const _overlayLayers       = {};  // layerKey -> ol.layer.Vector
const _overlayLayerConfigs = {};  // layerKey -> { name, title, zIndex, style, group }

function ensureOverlayLayer(layerKey) {
    if (_overlayLayers[layerKey]) return _overlayLayers[layerKey];

    const cfg = _overlayLayerConfigs[layerKey];
    if (!cfg || !OLMap) return null;

    const source = new ol.source.Vector();
    const layer = new ol.layer.Vector({
        name:  cfg.name,
        type:  'overlay',
        title: cfg.title,
        source,
        zIndex: cfg.zIndex,
        visible: cfg.visible !== undefined ? cfg.visible : true,
        style: cfg.style || null,
        renderBuffer: typeof renderBuffer !== 'undefined' ? renderBuffer : 60
    });

    _overlayLayerSources[layerKey] = source;
    _overlayLayers[layerKey]       = layer;
    return layer;
}

function registerOverlayLayer(layerKey, config) {
    _overlayLayerConfigs[layerKey] = config;
}


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
window.clearPointNumbers  = clearPointNumbers;
window.updatePlanePoints  = updatePlanePoints;
window.removePlanePoints  = removePlanePoints;
window.clearPlanePoints   = clearPlanePoints;