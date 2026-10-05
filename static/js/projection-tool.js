// ============================================================================
// PROJECTION TOOL - Predicción estática de posición futura de aeronaves
// ============================================================================
// Al hacer clic en un avión:
//   1) Calcula destino UNA SOLA VEZ con gs, track y vert_rate actuales.
//   2) Dibuja línea segmentada (color por avión) + punto destino.
//   3) Mueve un "avión fantasma" (color por avión) hacia el destino.
//   4) Detecta si el avión real alcanza la proyección antes que el fantasma.
//
// UI:
//   - Una etiqueta por proyección, idéntica a las de medición (con 👁 y ✖),
//     mostrando SOLO el tiempo de proyección (countdown).
//   - Panel dentro del sidebar derecho (visible solo cuando está ON).
//   - Menú de control en el dropdown de Measurement.
//   - Mensajes de estado en badge tooltip (showDistanceGuide).
//
// Modos: 5, 10, 15 minutos. Máximo 5 aeronaves.
// ============================================================================

"use strict";

(function () {
    // ------------------------------------------------------------------------
    // ESTADO
    // ------------------------------------------------------------------------
    const state = {
        active: false,
        planes: [],
        minutes: 5,
        validMinutes: [5, 10, 15],
        maxPlanes: 5,
        lineSource: null,
        pointSource: null,
        ghostSource: null,
        lineLayer: null,
        pointLayer: null,
        ghostLayer: null,
        projectionGroup: null,
        layersReady: false,
        updateInterval: null,
        uiReady: false
    };

    const COLORS = ['#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE'];

    const SYS = {
        base: '#192a56',
        lighter: '#243f8b',
        darker: '#0c152b',
        text: '#e9edf7',
        textDim: 'rgba(233,237,247,0.6)'
    };

    const ARRIVAL_THRESHOLD_M = 500;
    const DEVIATION_THRESHOLD_M = 5000;

    // ------------------------------------------------------------------------
    // LOGGING
    // ------------------------------------------------------------------------
    const LOG_PREFIX = '[Projection]';
    function log(...a) { console.log(LOG_PREFIX, ...a); }
    function warn(...a) { console.warn(LOG_PREFIX, ...a); }

    // ------------------------------------------------------------------------
    // TRADUCCIÓN
    // ------------------------------------------------------------------------
    function T(key, fallback) {
        try {
            if (typeof window.translate !== 'undefined' && window.translate.t) {
                const tr = window.translate.t(key);
                if (tr && tr !== key) return tr;
            }
            if (typeof window.t === 'function') {
                const tr = window.t(key);
                if (tr && tr !== key) return tr;
            }
        } catch (e) { /* ignore */ }
        return fallback || key;
    }

    // ------------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------------
    function getMap() {
        try { return (typeof OLMap !== 'undefined') ? OLMap : null; } catch (e) { return null; }
    }

    function getProjectionTime() {
        if (replay && Number.isFinite(now)) {
            return now;
        }

        return Date.now() / 1000;
    }

    function projectPosition(lat, lon, track, distanceMeters) {
        const R = 6378137.0;
        const angularDistance = distanceMeters / R;
        const bearing = track * Math.PI / 180.0;
        const lat1 = lat * Math.PI / 180.0;
        const lon1 = lon * Math.PI / 180.0;

        const lat2 = Math.asin(
            Math.sin(lat1) * Math.cos(angularDistance) +
            Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
        );

        let lon2 = lon1 + Math.atan2(
            Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
            Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
        );

        lon2 = ((lon2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

        return { lat: lat2 * 180.0 / Math.PI, lon: lon2 * 180.0 / Math.PI };
    }

    function projectAltitude(currentAlt, vertRate, minutes) {
        if (currentAlt == null || currentAlt === 'ground') return 0;
        const rate = (typeof vertRate === 'number' && !isNaN(vertRate)) ? vertRate : 0;
        const clamped = Math.max(-6000, Math.min(6000, rate));
        return Math.max(0, currentAlt + clamped * minutes);
    }

    function interpolateGreatCircle(lat1, lon1, lat2, lon2, t) {
        const toRad = Math.PI / 180;
        const toDeg = 180 / Math.PI;

        const φ1 = lat1 * toRad, λ1 = lon1 * toRad;
        const φ2 = lat2 * toRad, λ2 = lon2 * toRad;

        const d = 2 * Math.asin(Math.sqrt(
            Math.pow(Math.sin((φ2 - φ1) / 2), 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.pow(Math.sin((λ2 - λ1) / 2), 2)
        ));

        if (d < 1e-9) return { lat: lat1, lon: lon1 };

        const A = Math.sin((1 - t) * d) / Math.sin(d);
        const B = Math.sin(t * d) / Math.sin(d);

        const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
        const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
        const z = A * Math.sin(φ1) + B * Math.sin(φ2);

        const φ3 = Math.atan2(z, Math.sqrt(x * x + y * y));
        const λ3 = Math.atan2(y, x);

        return { lat: φ3 * toDeg, lon: λ3 * toDeg };
    }

    function haversineMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = Math.PI / 180;
        const dLat = (lat2 - lat1) * toRad;
        const dLon = (lon2 - lon1) * toRad;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function formatAlt(alt) {
        if (alt == null || isNaN(alt)) return '?';
        return (Math.round(alt / 100) * 100).toLocaleString() + ' ft';
    }

    function formatCountdown(seconds) {
        const s = Math.max(0, Math.round(seconds));
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    function formatNM(meters) {
        return (meters / 1852).toFixed(1) + ' NM';
    }

    // ------------------------------------------------------------------------
    // BADGE DE MENSAJES (reutiliza showDistanceGuide para el estilo)
    // ------------------------------------------------------------------------
    let _badgeTimer = null;
    function showBadge(html, durationMs) {
        if (typeof window.showDistanceGuide !== 'function') return;
        window.showDistanceGuide(html);
        if (_badgeTimer) clearTimeout(_badgeTimer);
        if (durationMs && durationMs > 0) {
            _badgeTimer = setTimeout(() => {
                if (typeof window.hideDistanceGuide === 'function') {
                    window.hideDistanceGuide();
                }
                _badgeTimer = null;
            }, durationMs);
        }
    }
    function hideBadge() {
        if (_badgeTimer) { clearTimeout(_badgeTimer); _badgeTimer = null; }
        if (typeof window.hideDistanceGuide === 'function') {
            window.hideDistanceGuide();
        }
    }

    // ------------------------------------------------------------------------
    // CAPAS OL
    // ------------------------------------------------------------------------
    function createLayers() {
        const map = getMap();
        if (!map) { warn('createLayers: OLMap no disponible'); return false; }
        if (state.layersReady) return true;

        const renderBuf = (typeof renderBuffer !== 'undefined') ? renderBuffer : 60;

        state.lineSource = new ol.source.Vector();
        state.lineLayer = new ol.layer.Vector({
            name: 'projectionLines',
            type: 'overlay',
            title: 'Projection lines',
            source: state.lineSource,
            zIndex: 280,
            visible: true,
            renderBuffer: renderBuf
        });

        state.pointSource = new ol.source.Vector();
        state.pointLayer = new ol.layer.Vector({
            name: 'projectionPoints',
            type: 'overlay',
            title: 'Projection points',
            source: state.pointSource,
            zIndex: 285,
            visible: true,
            renderBuffer: renderBuf
        });

        state.ghostSource = new ol.source.Vector();
        state.ghostLayer = new ol.layer.Vector({
            name: 'projectionGhosts',
            type: 'overlay',
            title: 'Projection ghosts',
            source: state.ghostSource,
            zIndex: 286,
            visible: true,
            renderBuffer: renderBuf
        });

        // map.addLayer(state.lineLayer);
        // map.addLayer(state.pointLayer);
        // map.addLayer(state.ghostLayer);

        // state.layersReady = true;
        const projectionGroup = new ol.layer.Group({
            name: 'projection_tool',
            title: 'Projection tool',
            type: 'overlay',
            fold: 'close',
            combine: false,
            visible: true,
            layers: new ol.Collection([
                state.ghostLayer,
                state.pointLayer,
                state.lineLayer
            ])
        });

        const rootLayers = map.getLayerGroup().getLayers();
        const distanceRoot = window._distanceRootGroup;
        const distanceIndex = distanceRoot
            ? rootLayers.getArray().indexOf(distanceRoot)
            : -1;

        if (distanceIndex >= 0) {
            rootLayers.insertAt(distanceIndex + 1, projectionGroup);
        } else {
            rootLayers.push(projectionGroup);
        }

        state.projectionGroup = projectionGroup;

        if (typeof window.updateLayerTitles === 'function') {
            setTimeout(window.updateLayerTitles, 0);
        }

        state.layersReady = true;

        log('Capas creadas');
        return true;
    }

    // ------------------------------------------------------------------------
    // ESTILO DEL AVIÓN FANTASMA
    // ------------------------------------------------------------------------
    function createGhostStyle(color, track) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <g transform="translate(14,14) rotate(${track})">
                    <path d="M 0,-12 L 2.5,-3 L 11,0 L 2.5,3 L 0,12 L -2.5,3 L -11,0 L -2.5,-3 Z"
                          fill="${color}"
                          stroke="#FFFFFF"
                          stroke-width="1.4"
                          stroke-linejoin="round"
                          opacity="0.9"/>
                </g>
            </svg>
        `;
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        return new ol.style.Style({
            image: new ol.style.Icon({
                src: dataUrl,
                anchor: [0.5, 0.5],
                scale: 1.0
            })
        });
    }

    // ------------------------------------------------------------------------
    // OVERLAY HTML POR PROYECCIÓN
    // Estética idéntica a las etiquetas de medición, pero SOLO muestra
    // el countdown (tiempo restante de la proyección).
    // ------------------------------------------------------------------------
    function createProjectionOverlayElement(entry) {
        const el = document.createElement('div');
        el.className = 'projection-label-tag';
        el.id = `projection-label-${entry.hex}`;
        el.style.background = 'rgba(0,0,0,0.4)';
        el.style.padding = '5px';
        el.style.fontSize = '12px';
        el.style.fontWeight = '600';
        el.style.textShadow = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000';
        el.style.color = 'white';
        el.style.pointerEvents = 'auto';
        el.style.borderRadius = '4px';

        el.innerHTML = `
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; padding-bottom: 2px;">
                <i class="fa-solid fa-eye-slash proj-toggle-btn" style="cursor: pointer; color: white;"></i>
                <i class="fa-solid fa-xmark proj-close-btn" style="cursor: pointer; color: #c00;"></i>
            </div>
            <div class="proj-text-content" style="text-align:center;font-family:monospace;font-weight:700;font-size:13px;"></div>
        `;

        // Botón ocultar
        el.querySelector('.proj-toggle-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleEntryVisibility(entry.hex);

            const icon = el.querySelector('.proj-toggle-btn');
            const text = el.querySelector('.proj-text-content');
            const lineFeat = entry.lineFeature;
            const pointFeat = entry.pointFeature;
            const ghostFeat = entry.ghostFeature;
            if (entry.hidden) {
                if (text) text.style.display = 'none';
                icon.className = 'fa-solid fa-eye proj-toggle-btn';
                if (lineFeat) lineFeat.setStyle(new ol.style.Style({}));
                if (pointFeat) pointFeat.setStyle(new ol.style.Style({}));
                if (ghostFeat) ghostFeat.setStyle(new ol.style.Style({}));
            } else {
                if (text) text.style.display = 'block';
                icon.className = 'fa-solid fa-eye-slash proj-toggle-btn';
                if (lineFeat) lineFeat.setStyle(new ol.style.Style({
                    stroke: new ol.style.Stroke({ color: entry.color, width: 2, lineDash: [8, 6] })
                }));
                if (pointFeat) pointFeat.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: new ol.style.Fill({ color: entry.color }),
                        stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
                    })
                }));
                if (ghostFeat) ghostFeat.setStyle(createGhostStyle(entry.color, entry.trackAtCreation));
            }
        });

        // Botón cerrar
        el.querySelector('.proj-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            removeProjection(entry.hex);
        });

        return el;
    }

    function updateProjectionOverlayContent(entry, now) {
        const ov = entry.overlay;
        if (!ov) return;
        const el = ov.getElement();
        if (!el) return;

        const text = el.querySelector('.proj-text-content');
        if (!text) return;

        const remaining = Math.max(0, entry.endTime - now);

        // SOLO el tiempo. Si llegó o está desviado, se indica brevemente.
        let content = formatCountdown(remaining);
        if (entry.arrived) {
            content = `✓ ${formatCountdown(remaining)}`;
        } else if (entry.deviated) {
            content = `⚠ ${formatCountdown(remaining)}`;
        }
        text.textContent = content;

        // Aplicar visibilidad
        if (entry.hidden) {
            text.style.display = 'none';
        } else {
            text.style.display = 'block';
        }
    }

    // ------------------------------------------------------------------------
    // CREAR PROYECCIÓN
    // ------------------------------------------------------------------------
    function getAvailableColor() {
        const used = new Set(state.planes.map(p => p.color));
        for (const c of COLORS) if (!used.has(c)) return c;
        return COLORS[state.planes.length % COLORS.length];
    }

    function getProjectionTrack(plane) {
        if (Number.isFinite(plane.track)) {
            return plane.track;
        }

        if (Number.isFinite(plane.true_heading)) {
            return plane.true_heading;
        }

        if (Number.isFinite(plane.nav_heading)) {
            return plane.nav_heading;
        }

        if (Number.isFinite(plane.mag_heading)) {
            return plane.mag_heading;
        }

        return null;
    }

    function createProjection(hex) {
        if (!state.active) { showBadge(T('projection_not_active', 'El modo proyección no está activo'), 3000); return false; }
        if (state.planes.length >= state.maxPlanes) {
            showBadge(`${T('projection_max_prefix', 'Máximo')} ${state.maxPlanes} ${T('projection_max_suffix', 'aeronaves permitidas')}`, 3000);
            return false;
        }
        if (state.planes.some(p => p.hex === hex)) {
            showBadge(T('projection_dup', 'Esta aeronave ya tiene proyección'), 3000);
            return false;
        }

        const plane = g.planes[hex];
        if (!plane) { showBadge(T('projection_no_plane', 'Aeronave no encontrada'), 3000); return false; }
        if (typeof InstrumentedAircraft !== 'undefined') {
            InstrumentedAircraft.register(hex);
        }
        if (!plane.position || plane.position.length < 2) { showBadge(T('projection_no_pos', 'Sin posición válida'), 3000); return false; }

        const track = getProjectionTrack(plane);

        if (track == null) {
            showBadge(T('projection_no_track', 'Sin rumbo válido'), 3000);
            return false;
        }

        const gs = plane.gs;
        if (gs == null || isNaN(gs) || gs <= 0) { showBadge(T('projection_no_gs', 'Sin velocidad válida'), 3000); return false; }

        // const now = Date.now() / 1000;
        const now = getProjectionTime();
        const minutes = state.minutes;
        const color = getAvailableColor();

        const startLat = plane.position[1];
        const startLon = plane.position[0];
        const startAlt = plane.altitude;
        const gsAtCreation = gs;
        const trackAtCreation = track;

        const distanceMeters = gs * (minutes / 60) * 1852;
        const projected = projectPosition(startLat, startLon, track, distanceMeters);
        const destAlt = projectAltitude(startAlt, plane.vert_rate, minutes);

        // Línea
        const coords = [
            ol.proj.fromLonLat([startLon, startLat]),
            ol.proj.fromLonLat([projected.lon, projected.lat])
        ];
        const lineFeature = new ol.Feature(new ol.geom.LineString(coords));
        lineFeature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({ color: color, width: 2, lineDash: [8, 6] })
        }));
        state.lineSource.addFeature(lineFeature);

        // Punto destino
        const pointCoord = ol.proj.fromLonLat([projected.lon, projected.lat]);
        const pointFeature = new ol.Feature(new ol.geom.Point(pointCoord));
        pointFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: color }),
                stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
            })
        }));
        state.pointSource.addFeature(pointFeature);

        // Fantasma
        const ghostFeature = new ol.Feature(
            new ol.geom.Point(ol.proj.fromLonLat([startLon, startLat]))
        );
        ghostFeature.setStyle(createGhostStyle(color, trackAtCreation));
        state.ghostSource.addFeature(ghostFeature);

        const entry = {
            hex,
            color,
            minutes,
            startTime: now,
            endTime: now + minutes * 60,
            startLat, startLon, startAlt,
            destLat: projected.lat,
            destLon: projected.lon,
            destAlt,
            distanceMeters,
            gsAtCreation,
            trackAtCreation,
            lineFeature,
            pointFeature,
            ghostFeature,
            overlay: null,
            hidden: false,
            arrived: false,
            deviated: false,
            realDistanceToDest: null
        };

        // Overlay por proyección
        const el = createProjectionOverlayElement(entry);
        const overlay = new ol.Overlay({
            element: el,
            positioning: 'bottom-center',
            offset: [0, -14],
            stopEvent: true
        });
        const map = getMap();
        if (map) map.addOverlay(overlay);
        overlay.setPosition(ghostFeature.getGeometry().getCoordinates());
        entry.overlay = overlay;

        state.planes.push(entry);

        log(`Creada: ${hex} → (${projected.lat.toFixed(4)}, ${projected.lon.toFixed(4)}), ${minutes}min, ${formatNM(distanceMeters)}, ${color}`);

        renderSidebarPanel();
        startLoop();
        showBadge(`${T('projection_created', 'Proyección')} ${minutes}${T('projection_min_abbr', 'min')} ${T('projection_for', 'para')} ${hex.toUpperCase()} (${formatNM(distanceMeters)})`, 3500);
        return true;
    }

    // ------------------------------------------------------------------------
    // ACTUALIZAR FANTASMA + LLEGADA
    // ------------------------------------------------------------------------
    function updateGhost(entry, now) {
        const total = entry.endTime - entry.startTime;
        let t = total > 0 ? (now - entry.startTime) / total : 1;
        if (t < 0) t = 0;

        let ghostLat, ghostLon;
        if (entry.arrived) {
            ghostLat = entry.destLat;
            ghostLon = entry.destLon;
            t = 1;
        } else {
            if (t > 1) t = 1;
            const pos = interpolateGreatCircle(
                entry.startLat, entry.startLon,
                entry.destLat, entry.destLon,
                t
            );
            ghostLat = pos.lat;
            ghostLon = pos.lon;
        }

        const coord = ol.proj.fromLonLat([ghostLon, ghostLat]);
        entry.ghostFeature.getGeometry().setCoordinates(coord);

        if (entry.overlay) {
            entry.overlay.setPosition(coord);
        }

        // Detección llegada del avión real
        const plane = g.planes[entry.hex];
        if (plane && plane.position && plane.position.length >= 2) {
            const dist = haversineMeters(
                plane.position[1], plane.position[0],
                entry.destLat, entry.destLon
            );
            entry.realDistanceToDest = dist;

            if (!entry.arrived && dist < ARRIVAL_THRESHOLD_M) {
                entry.arrived = true;
                log(`${entry.hex} ALCANZÓ su proyección (dist=${dist.toFixed(0)}m)`);
                showBadge(`${entry.hex.toUpperCase()} ${T('projection_reached', 'alcanzó su proyección')}`, 3000);
                renderSidebarPanel();
                updateProjectionOverlayContent(entry, now);
                return 'arrived';
            }
        }

        if (now >= entry.endTime) {
            if (entry.realDistanceToDest != null && entry.realDistanceToDest > DEVIATION_THRESHOLD_M) {
                entry.deviated = true;
                log(`${entry.hex} DESVIADO (dist=${entry.realDistanceToDest.toFixed(0)}m)`);
                showBadge(`${entry.hex.toUpperCase()} ${T('projection_deviated_toast', 'desviado de la proyección')}`, 3000);
                renderSidebarPanel();
                updateProjectionOverlayContent(entry, now);
                setTimeout(() => {
                    removeProjection(entry.hex);
                    renderSidebarPanel();
                }, 2000);
                return 'deviated';
            }
            return 'expired';
        }
        updateProjectionOverlayContent(entry, now);
        return 'running';
    }

    // ------------------------------------------------------------------------
    // LOOP
    // ------------------------------------------------------------------------
    function startLoop() {
        if (state.updateInterval) return;
        state.updateInterval = setInterval(() => {
            if (!state.active) return;
            if (state.planes.length === 0) return;

            // const now = Date.now() / 1000;
            const now = getProjectionTime();
            const finished = [];

            for (const entry of state.planes.slice()) {
                const status = updateGhost(entry, now);
                if (status === 'expired') finished.push(entry.hex);
            }
            finished.forEach(hex => removeProjection(hex));

            renderSidebarPanel();
        }, 250);
    }

    function stopLoop() {
        if (state.updateInterval) {
            clearInterval(state.updateInterval);
            state.updateInterval = null;
        }
    }

    // ------------------------------------------------------------------------
    // OCULTAR/MOSTRAR
    // ------------------------------------------------------------------------
    function toggleEntryVisibility(hex) {
        const entry = state.planes.find(p => p.hex === hex);
        if (!entry) return;
        entry.hidden = !entry.hidden;

        const visible = !entry.hidden;
        if (entry.lineFeature) entry.lineFeature.setStyle(
            visible ? new ol.style.Style({
                stroke: new ol.style.Stroke({ color: entry.color, width: 2, lineDash: [8, 6] })
            }) : new ol.style.Style({})
        );
        if (entry.pointFeature) entry.pointFeature.setStyle(
            visible ? new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({ color: entry.color }),
                    stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
                })
            }) : new ol.style.Style({})
        );
        if (entry.ghostFeature) entry.ghostFeature.setStyle(
            visible ? createGhostStyle(entry.color, entry.trackAtCreation) : new ol.style.Style({})
        );

        if (entry.overlay) {
            const el = entry.overlay.getElement();
            if (el) {
                const icon = el.querySelector('.proj-toggle-btn');
                const text = el.querySelector('.proj-text-content');
                if (entry.hidden) {
                    if (text) text.style.display = 'none';
                    if (icon) icon.className = 'fa-solid fa-eye proj-toggle-btn';
                } else {
                    if (text) text.style.display = 'block';
                    if (icon) icon.className = 'fa-solid fa-eye-slash proj-toggle-btn';
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // QUITAR / LIMPIAR
    // ------------------------------------------------------------------------
    function removeProjection(hex) {
        const idx = state.planes.findIndex(p => p.hex === hex);
        if (idx === -1) return;
        const entry = state.planes[idx];
        state.planes.splice(idx, 1);

        try { if (entry.lineFeature) state.lineSource.removeFeature(entry.lineFeature); } catch (e) { }
        try { if (entry.pointFeature) state.pointSource.removeFeature(entry.pointFeature); } catch (e) { }
        try { if (entry.ghostFeature) state.ghostSource.removeFeature(entry.ghostFeature); } catch (e) { }

        const map = getMap();
        if (entry.overlay && map) {
            try { map.removeOverlay(entry.overlay); } catch (e) { }
        }

        renderSidebarPanel();
        log(`Eliminada: ${hex}`);
    }

    function clearAll() {
        const hexes = state.planes.map(p => p.hex);
        hexes.forEach(hex => removeProjection(hex));
        state.planes = [];
        if (state.lineSource) state.lineSource.clear();
        if (state.pointSource) state.pointSource.clear();
        if (state.ghostSource) state.ghostSource.clear();
        renderSidebarPanel();
    }

    // ------------------------------------------------------------------------
    // START / STOP
    // ------------------------------------------------------------------------
    function startProjection(minutes) {
        log('startProjection', minutes);
        if (!createLayers()) {
            showBadge(T('projection_no_layers', 'No se pudieron crear las capas (espera a que cargue el mapa).'), 4000);
            return;
        }
        if (minutes != null) {
            if (!state.validMinutes.includes(minutes)) {
                showBadge(`${T('projection_invalid_min', 'Minutos inválidos')}: ${minutes}`, 3000);
                return;
            }
            state.minutes = minutes;
        }
        if (state.active) clearAll();
        state.active = true;
        updateToggleBtn();
        updateMinutesRow();
        showSidebarPanel();
        startLoop();
        showBadge(`${T('projection_on', 'Projection Mode: ON')}: ${state.minutes} ${T('projection_min_abbr', 'min')}.`, 3500);
    }

    function stopProjection() {
        log('stopProjection');
        state.active = false;
        clearAll();
        stopLoop();
        updateToggleBtn();
        hideSidebarPanel();
        showBadge(T('projection_off', 'Projection Mode: OFF'), 2500);
    }

    function toggleProjection() {
        if (state.active) stopProjection();
        else startProjection();
    }

    // ------------------------------------------------------------------------
    // CLICK HANDLER
    // ------------------------------------------------------------------------
    function handleClick(evt, planeHex) {
        if (!state.active) return false;
        if (planeHex) {
            createProjection(planeHex);
            evt.stopPropagation();
            return true;
        }
        return false;
    }

    // ------------------------------------------------------------------------
    // UI: BOTÓN Y MENÚ DE MINUTOS (en dropdown)
    // ------------------------------------------------------------------------
    function updateToggleBtn() {
        const btn = document.getElementById('projection-toggle-btn');
        if (!btn) return;
        if (state.active) {
            btn.textContent = 'ON';
            btn.classList.add('proj-on');
            btn.classList.add('activeButton');
        } else {
            btn.textContent = 'OFF';
            btn.classList.remove('proj-on');
            btn.classList.remove('activeButton');
        }
    }

    function updateMinutesRow() {
        const row = document.getElementById('projection-minutes-row');
        if (!row) return;
        row.querySelectorAll('.proj-min-btn').forEach(b => {
            b.classList.toggle('proj-min-active', parseInt(b.dataset.min, 10) === state.minutes);
        });
    }

    function buildProjectionMenu() {
        const dd = document.getElementById('measurement_dropdown');
        if (!dd) { warn('No existe #measurement_dropdown'); return false; }

        const menu = dd.querySelector('.dropdown-content');
        if (!menu) { warn('No existe .dropdown-content'); return false; }

        if (document.getElementById('projection-menu-item')) {
            updateToggleBtn();
            updateMinutesRow();
            return true;
        }

        if (!document.getElementById('projection-tool-styles')) {
            const style = document.createElement('style');
            style.id = 'projection-tool-styles';
            style.textContent = `
                .proj-min-btn {
                    background: ${SYS.lighter} !important;
                    border: 1px solid ${SYS.darker} !important;
                    color: ${SYS.text} !important;
                    border-radius: 4px !important;
                    padding: 3px 10px !important;
                    cursor: pointer !important;
                    font-size: 11px !important;
                    font-family: monospace !important;
                    transition: all 0.15s !important;
                }
                .proj-min-btn:hover { background: #3455a8 !important; }
                .proj-min-active {
                    background: #ffffff !important;
                    color: ${SYS.base} !important;
                    font-weight: bold !important;
                    border-color: #ffffff !important;
                }
                #projection-toggle-btn {
                    background: ${SYS.lighter} !important;
                    border: 1px solid ${SYS.base} !important;
                    color: ${SYS.text} !important;
                    border-radius: 4px !important;
                    padding: 2px 10px !important;
                    cursor: pointer !important;
                    font-size: 11px !important;
                    font-weight: bold !important;
                    font-family: monospace !important;
                    transition: all 0.15s !important;
                }
                #projection-toggle-btn:hover { background: #3455a8 !important; }
                #projection-toggle-btn.proj-on {
                    background: #ffffff !important;
                    color: ${SYS.base} !important;
                    border-color: #ffffff !important;
                }
            `;
            document.head.appendChild(style);
        }

        const li = document.createElement('li');
        li.id = 'projection-menu-item';
        li.style.cssText = 'list-style:none; border-top:1px solid rgba(255,255,255,0.15); margin-top:4px; padding-top:6px;';

        li.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0;">
                <span style="flex:1;font-weight:bold;color:${SYS.text};">${T('projection_tool', 'Proyección')}</span>
                <button id="projection-toggle-btn">OFF</button>
            </div>
            <div id="projection-minutes-row" style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;padding-bottom:4px;">
                ${state.validMinutes.map(m =>
            `<button class="proj-min-btn" data-min="${m}">${m}m</button>`
        ).join('')}
            </div>
        `;

        menu.appendChild(li);

        li.querySelector('#projection-toggle-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleProjection();
        });

        li.querySelectorAll('.proj-min-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const min = parseInt(btn.dataset.min, 10);
                if (!state.validMinutes.includes(min)) return;
                state.minutes = min;
                updateMinutesRow();
                showBadge(`${T('projection_base_time', 'Base time')}: ${min} ${T('projection_min_abbr', 'min')} (${T('projection_applies_new', 'applies to new projections')})`, 2500);
            });
        });

        updateToggleBtn();
        updateMinutesRow();
        log('Menú inyectado');
        return true;
    }

    // ------------------------------------------------------------------------
    // PANEL EN SIDEBAR DERECHO (visible solo cuando está ON)
    // ------------------------------------------------------------------------
    function ensureSidebarPanel() {
        let section = document.getElementById('projection-section');
        if (section) return section;

        const sidebarTable = document.getElementById('sidebar-table');
        if (!sidebarTable) return null;

        const starredSection = document.getElementById('starred-aircraft-section');

        section = document.createElement('div');
        section.id = 'projection-section';
        // Por defecto oculto. Solo se muestra cuando state.active === true.
        section.className = 'projection-section';
        section.style.display = 'none';
        section.innerHTML = `
            <div class="starred-header projection-header">
                <h4 data-i18n="projection_tool">${T('projection_tool', 'Proyección')}</h4>
                <div>
                    <span class="starred-count" id="projection-sidebar-count">0</span>
                    <button id="clear-all-projections-btn" class="starred-count"
                            data-i18n-title="projection_clear_all"
                            title="${T('projection_clear_all', 'Eliminar todas las proyecciones')}"
                            style="padding: 2px 8px; font-size: 11px; cursor: pointer;">✖</button>
                </div>
            </div>
            <div id="projection-sidebar-list" class="starred-list">
                <div class="starred-empty" data-i18n="projection_empty">${T('projection_empty', 'Sin proyecciones activas')}</div>
            </div>
        `;

        if (starredSection && starredSection.parentNode) {
            starredSection.parentNode.insertBefore(section, starredSection);
        } else {
            sidebarTable.appendChild(section);
        }

        const clearBtn = section.querySelector('#clear-all-projections-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearAll();
                renderSidebarPanel();
            });
        }

        return section;
    }

    function showSidebarPanel() {
        const section = ensureSidebarPanel();
        if (section) {
            section.style.display = '';  // visible
            renderSidebarPanel();
        }
    }

    function hideSidebarPanel() {
        const section = document.getElementById('projection-section');
        if (section) {
            section.style.display = 'none';
        }
    }

    function renderSidebarPanel() {
        const section = document.getElementById('projection-section');
        if (!section) return;
        // No renderizar si no está visible
        if (section.style.display === 'none') return;

        const count = section.querySelector('#projection-sidebar-count');
        if (count) count.textContent = `${state.planes.length}/${state.maxPlanes}`;

        const list = section.querySelector('#projection-sidebar-list');
        if (!list) return;

        if (state.planes.length === 0) {
            list.innerHTML = `<div class="starred-empty" data-i18n="projection_empty">${T('projection_empty', 'Sin proyecciones activas')}</div>`;
            return;
        }

        // const now = Date.now() / 1000;
        const now = getProjectionTime();
        let html = '';
        for (const entry of state.planes) {
            const remaining = Math.max(0, entry.endTime - now);
            const timeStr = formatCountdown(remaining);
            let statusHtml = `<span style="color:${SYS.textDim};">${timeStr}</span>`;
            if (entry.arrived) {
                statusHtml = `<span style="color:#34C759;font-weight:bold;">✓ ${T('projection_arrived_short', 'LLEGÓ')}</span>`;
            } else if (entry.deviated) {
                statusHtml = `<span style="color:#FF3B30;font-weight:bold;">⚠ ${T('projection_deviated_short', 'DESV.')}</span>`;
            }

            const hiddenIcon = entry.hidden ? '🚫' : '👁';
            const hiddenTitle = entry.hidden
                ? T('projection_show', 'Mostrar')
                : T('projection_hide', 'Ocultar');
            const removeTitle = T('projection_remove', 'Quitar');

            html += `
                <div class="starred-item projection-item" data-hex="${entry.hex}"
                     style="border-left:4px solid ${entry.color};">
                    <div class="starred-item-info">
                        <div class="starred-item-callsign" style="color:${entry.color};">${entry.hex.toUpperCase()}</div>
                        <div class="starred-item-detail" style="display:flex;gap:8px;align-items:center;">
                            <span>${entry.minutes}${T('projection_min_abbr', 'min')}</span>
                            <span>·</span>
                            <span>${statusHtml}</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;flex-shrink:0;">
                        <button class="proj-sidebar-btn-hide" data-hex="${entry.hex}"
                                title="${hiddenTitle}"
                                style="background:${SYS.lighter};border:1px solid ${SYS.base};
                                       color:${SYS.text};border-radius:3px;width:24px;height:20px;
                                       cursor:pointer;font-size:11px;padding:0;">${hiddenIcon}</button>
                        <button class="proj-sidebar-btn-remove" data-hex="${entry.hex}"
                                title="${removeTitle}"
                                style="background:#8a1a1a;border:1px solid #5a0f0f;
                                       color:#fff;border-radius:3px;width:24px;height:20px;
                                       cursor:pointer;font-size:12px;padding:0;
                                       font-weight:bold;">✖</button>
                    </div>
                </div>
            `;
        }

        list.innerHTML = html;

        list.querySelectorAll('.projection-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const hex = item.dataset.hex;
                if (hex && typeof selectPlaneByHex === 'function') {
                    selectPlaneByHex(hex, { follow: true });
                }
            });
        });

        list.querySelectorAll('.proj-sidebar-btn-hide').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleEntryVisibility(btn.dataset.hex);
                renderSidebarPanel();
            });
        });

        list.querySelectorAll('.proj-sidebar-btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                removeProjection(btn.dataset.hex);
                renderSidebarPanel();
            });
        });
    }

    // ------------------------------------------------------------------------
    // INICIALIZACIÓN
    // ------------------------------------------------------------------------
    function tryBuildMenu() {
        if (state.uiReady) return true;
        if (buildProjectionMenu()) {
            state.uiReady = true;
            log('UI lista');
            ensureSidebarPanel();
            return true;
        }
        return false;
    }

    function init() {
        log('init()');

        const readyTimer = setInterval(() => {
            const menuReady = tryBuildMenu();
            const layersReady = createLayers();

            if (menuReady && layersReady) {
                clearInterval(readyTimer);
            }
        }, 300);

        setTimeout(() => {
            clearInterval(readyTimer);
            tryBuildMenu();
            createLayers();
        }, 15000);
    }

    // ------------------------------------------------------------------------
    // API PÚBLICA
    // ------------------------------------------------------------------------
    window.ProjectionTool = {
        isActive: () => state.active,
        getPlanes: () => state.planes.slice(),
        getMinutes: () => state.minutes,
        start: startProjection,
        stop: stopProjection,
        toggle: toggleProjection,
        add: createProjection,
        remove: removeProjection,
        clear: clearAll,
        handleClick: handleClick,
        toggleVisibility: toggleEntryVisibility,
        setMinutes: (m) => {
            if (state.validMinutes.includes(m)) {
                state.minutes = m;
                updateMinutesRow();
            }
        },
        init: init,
        _state: state
    };

    window.startProjection = startProjection;
    window.stopProjection = stopProjection;
    window.toggleProjection = toggleProjection;

    // ------------------------------------------------------------------------
    // ARRANQUE
    // ------------------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('languageChanged', () => {
        setTimeout(() => {
            const menuSpan = document.querySelector('#projection-menu-item > div:first-child > span');
            if (menuSpan) menuSpan.textContent = T('projection_tool', 'Proyección');
            const clickHint = document.querySelector('#projection-menu-item > div:last-child');

            const headerH4 = document.querySelector('#projection-section .projection-header h4');
            if (headerH4) headerH4.textContent = T('projection_tool', 'Proyección');

            const clearBtn = document.getElementById('clear-all-projections-btn');
            if (clearBtn) clearBtn.title = T('projection_clear_all', 'Eliminar todas las proyecciones');

            renderSidebarPanel();
            if (typeof window.updateDistanceGuideContent === 'function') {
                window.updateDistanceGuideContent();
            }
        }, 200);
    });

    log('Script cargado.');

})();