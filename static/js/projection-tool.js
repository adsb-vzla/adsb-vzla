"use strict";

// ***** INICIALIZAR FUNCIÓN DE PROYECCIÓN *****
(function () {
    // ***** INICIALIZAR ESTADOS *****
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
        uiReady: false,
        sliderActive: false
    };

    // ***** COLORES PARA CADA PROYECCIÓN *****
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
    const TRACK_CHANGE_THRESHOLD_DEG = 3;
    const TRACK_REFRESH_INTERVAL_MS = 5000;
    const TRACK_REFRESH_INTERVAL_S = TRACK_REFRESH_INTERVAL_MS / 1000;

    // ***** LOGS PARA DEPURACIÓN *****
    const LOG_PREFIX = '[Projection]';
    function log(...a) { console.log(LOG_PREFIX, ...a); }
    function warn(...a) { console.warn(LOG_PREFIX, ...a); }

    // ***** TRADUCIR TEXTOS *****
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

    // ***** OBTENER MAPA *****
    function getMap() {
        try { return (typeof OLMap !== 'undefined') ? OLMap : null; } catch (e) { return null; }
    }

    // ***** OBTENER TIEMPO DE PROYECCIÓN *****
    function getProjectionTime() {
        if (replay && Number.isFinite(now)) {
            return now;
        }

        return Date.now() / 1000;
    }

    // ***** PROYECTAR POSICIÓN FUTURA *****
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

    // ***** ALTITUD *****
    function projectAltitude(currentAlt, vertRate, minutes) {
        if (currentAlt == null || currentAlt === 'ground') return 0;
        const rate = (typeof vertRate === 'number' && !isNaN(vertRate)) ? vertRate : 0;
        const clamped = Math.max(-6000, Math.min(6000, rate));
        return Math.max(0, currentAlt + clamped * minutes);
    }

    // ***** INTERPOLACIÓN *****
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

    // ***** HAVERSINE *****
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

    // ***** FORMATEAR CUENTA REGRESIVA *****
    function formatCountdown(seconds) {
        const s = Math.max(0, Math.round(seconds));
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    // ***** FORMATEAR NM *****
    function formatNM(meters) {
        return (meters / 1852).toFixed(1) + ' NM';
    }

    function getPlaneLabel(hex, plane) {
        return String(
            (plane && (plane.flight || plane.callsign || plane.registration)) || hex
        ).trim().toUpperCase();
    }

    // ***** MOSTRAR TIEMPO FALTANTE *****
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

    // ***** CREAR CAPAS DE LA FUNCIÓN *****
    function createLayers() {
        const map = getMap();
        if (!map) { warn('createLayers: OLMap no disponible'); return false; }
        if (state.layersReady) return true;

        const renderBuf = (typeof renderBuffer !== 'undefined') ? renderBuffer : 60;

        // ***** LÍNEAS *****
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

        // ***** PUNTOS *****
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

        // ***** ESTELA *****
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

        // ***** CREAR GRUPO EN EL CUAL INSERTAR LAS CAPAS *****
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

        return true;
    }

    // ***** ESTILO DE LA ESTELA DEL AVIÓN PROYECTADO *****
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

    // ***** CREAR OVERLAY CON EL TIEMPO RESTANTE DE LA PROYECCIÓN *****
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
            <div style="display: flex; justify-content: flex-end; gap: 6px; margin-bottom: 4px; padding-bottom: 2px;">
                <button type="button" class="proj-toggle-btn" aria-label="${T('projection_hide', 'Hide')}"
                        style="cursor: pointer; color: white; width: 28px; height: 26px; padding: 0;">
                    <i class="fa-solid fa-eye-slash"></i>
                </button>
                <button type="button" class="proj-close-btn" aria-label="${T('projection_remove', 'Remove')}"
                        style="cursor: pointer; color: #c00; width: 28px; height: 26px; padding: 0;">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="proj-text-content" style="text-align:center;font-family:monospace;font-weight:700;font-size:13px;"></div>
        `;

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
                icon.innerHTML = '<i class="fa-solid fa-eye"></i>';
                if (lineFeat) lineFeat.setStyle(new ol.style.Style({}));
                if (pointFeat) pointFeat.setStyle(new ol.style.Style({}));
                if (ghostFeat) ghostFeat.setStyle(new ol.style.Style({}));
            } else {
                if (text) text.style.display = 'block';
                icon.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
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

    // ***** ACTUALIZAR CONTENIDO DEL OVERLAY *****
    function updateProjectionOverlayContent(entry, now) {
        const ov = entry.overlay;
        if (!ov) return;
        const el = ov.getElement();
        if (!el) return;

        const text = el.querySelector('.proj-text-content');
        if (!text) return;

        const totalS = entry.minutes * 60;

        const progress = Math.max(0, Math.min(1, entry.progress || 0));
        const remaining = totalS * (1 - progress);
        const elapsed = totalS - remaining;

        let content = formatCountdown(remaining);
        if (entry.arrived) {
            content = `✓ ${formatCountdown(remaining)}`;
        } else if (entry.deviated) {
            content = `⚠ ${formatCountdown(remaining)}`;
        }

        // ***** SEGUNDOS RESTANTES HASTA EL PRÓXIMO MÚLTIPLO DE 5 S *****
        const step = TRACK_REFRESH_INTERVAL_S;
        const intoStep = elapsed % step;
        const refreshRemainingS = (intoStep === 0 && elapsed > 0)
            ? 0
            : (step - intoStep);
        const refreshS = Math.ceil(refreshRemainingS) % step;

        if (entry.arrived || entry.deviated) {
            text.textContent = content;
        } else {
            text.textContent = `${content} (${refreshS}s)`;
        }

        if (entry.hidden) {
            text.style.display = 'none';
        } else {
            text.style.display = 'block';
        }
    }

    // ***** OBTENER COLOR DISPONIBLE PARA LA SIGUIENTE PROYECCIÓN *****
    function getAvailableColor() {
        const used = new Set(state.planes.map(p => p.color));
        for (const c of COLORS) if (!used.has(c)) return c;
        return COLORS[state.planes.length % COLORS.length];
    }

    // ***** OBTENER RUMBO DE LA PROYECCIÓN *****
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

    // ***** CREAR PROYECCIÓN *****
    function createProjection(hex) {
        if (!state.active) { showBadge(T('projection_not_active', 'Projection mode is not active'), 3000); return false; }
        if (state.planes.length >= state.maxPlanes) {
            showBadge(T('projection_max', 'Maximum number of projections reached'), 3000);
            return false;
        }
        if (state.planes.some(p => p.hex === hex)) {
            showBadge(T('projection_dup', 'This aircraft already has a projection'), 3000);
            return false;
        }

        const plane = g.planes[hex];
        if (!plane) { showBadge(T('projection_no_plane', 'Aircraft not found'), 3000); return false; }
        if (typeof InstrumentedAircraft !== 'undefined') {
            InstrumentedAircraft.register(hex);
        }
        if (!plane.position || plane.position.length < 2) { showBadge(T('projection_no_pos', 'No valid position'), 3000); return false; }

        const track = getProjectionTrack(plane);

        if (track == null) {
            showBadge(T('projection_no_track', 'No valid track'), 3000);
            return false;
        }

        const gs = plane.gs;
        if (gs == null || isNaN(gs) || gs <= 0) { showBadge(T('projection_no_gs', 'No valid groundspeed'), 3000); return false; }

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

        const coords = [
            ol.proj.fromLonLat([startLon, startLat]),
            ol.proj.fromLonLat([projected.lon, projected.lat])
        ];
        const lineFeature = new ol.Feature(new ol.geom.LineString(coords));
        lineFeature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({ color: color, width: 2, lineDash: [8, 6] })
        }));
        state.lineSource.addFeature(lineFeature);

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

        const ghostFeature = new ol.Feature(
            new ol.geom.Point(ol.proj.fromLonLat([startLon, startLat]))
        );
        ghostFeature.setStyle(createGhostStyle(color, trackAtCreation));
        state.ghostSource.addFeature(ghostFeature);

        state.lastTrackCheck = now;

        const entry = {
            hex,
            color,
            minutes,
            startTime: now,
            endTime: now + minutes * 60,
            lastCheckedStep: -1,
            progress: 0,
            refreshAtCreation: now,
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
        showBadge(`${T('projection_created', 'Projection created for aircraft')} ${getPlaneLabel(hex, plane)}`, 3500);
        return true;
    }

    // ***** ACTUALIZAR ESTELA SEGÚN EL PROGRESO DEL SLIDER *****
    function updateGhost(entry, now) {
        if (!entry._userDragged) {
            const total = entry.endTime - entry.startTime;
            let t = total > 0 ? (now - entry.startTime) / total : 1;
            if (t < 0) t = 0;
            if (t > 1) t = 1;
            entry.progress = t;
        }

        let t = entry.progress;
        if (entry.arrived) t = 1;

        let ghostLat, ghostLon;
        const pos = interpolateGreatCircle(
            entry.startLat, entry.startLon,
            entry.destLat, entry.destLon,
            t
        );
        ghostLat = pos.lat;
        ghostLon = pos.lon;

        const coord = ol.proj.fromLonLat([ghostLon, ghostLat]);
        entry.ghostFeature.getGeometry().setCoordinates(coord);

        if (entry.overlay) {
            entry.overlay.setPosition(coord);
        }

        // ***** DETECCIÓN DE LLEGADA / DESVIACIÓN *****
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
                showBadge(`${T('projection_deviated_toast', 'Aircraft')} ${getPlaneLabel(entry.hex, plane)} ${T('projection_deviated_suffix', 'has deviated from the projection')}`, 3000);
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

    // ***** RECALCULAR UNA PROYECCIÓN EXISTENTE (CAMBIO DE RUMBO) *****
    function refreshEntry(entry) {
        const plane = g.planes[entry.hex];
        if (!plane || !plane.position || plane.position.length < 2) return false;
        if (plane.seen > 15) return false;

        const track = getProjectionTrack(plane);
        if (track == null) return false;

        const gs = plane.gs;
        if (gs == null || isNaN(gs) || gs <= 0) return false;

        const now = getProjectionTime();
        const minutes = state.minutes;

        const startLat = plane.position[1];
        const startLon = plane.position[0];
        const startAlt = plane.altitude;

        const distanceMeters = gs * (minutes / 60) * 1852;
        const projected = projectPosition(startLat, startLon, track, distanceMeters);
        const destAlt = projectAltitude(startAlt, plane.vert_rate, minutes);

        // ***** ACTUALIZAR GEOMETRÍAS EXISTENTES *****
        const coords = [
            ol.proj.fromLonLat([startLon, startLat]),
            ol.proj.fromLonLat([projected.lon, projected.lat])
        ];
        if (entry.lineFeature) {
            entry.lineFeature.getGeometry().setCoordinates(coords);
        }
        if (entry.pointFeature) {
            entry.pointFeature.getGeometry().setCoordinates(
                ol.proj.fromLonLat([projected.lon, projected.lat])
            );
        }
        if (entry.ghostFeature) {
            entry.ghostFeature.getGeometry().setCoordinates(
                ol.proj.fromLonLat([startLon, startLat])
            );
            entry.ghostFeature.setStyle(createGhostStyle(entry.color, track));
        }

        // ***** ACTUALIZAR DATOS DE LA ENTRY *****
        entry.minutes = minutes;
        entry.startTime = now;
        entry.endTime = now + minutes * 60;
        entry.lastCheckedStep = -1;
        entry.progress = 0;
        entry._userDragged = false;
        entry.startLat = startLat;
        entry.startLon = startLon;
        entry.startAlt = startAlt;
        entry.destLat = projected.lat;
        entry.destLon = projected.lon;
        entry.destAlt = destAlt;
        entry.distanceMeters = distanceMeters;
        entry.gsAtCreation = gs;
        entry.trackAtCreation = track;
        entry.arrived = false;
        entry.deviated = false;
        entry.realDistanceToDest = null;

        // ***** REPOSICIONAR OVERLAY Y REFRESCAR TEXTO *****
        if (entry.overlay && entry.ghostFeature) {
            entry.overlay.setPosition(entry.ghostFeature.getGeometry().getCoordinates());
        }
        updateProjectionOverlayContent(entry, now);

        log(`Refrescada: ${entry.hex} track=${track.toFixed(1)}° → (${projected.lat.toFixed(4)}, ${projected.lon.toFixed(4)}), ${minutes}min, ${formatNM(distanceMeters)}`);
        return true;
    }

    // ***** COMPROBAR CAMBIOS DE RUMBO Y REFRESCAR PROYECCIONES *****
        // ***** COMPROBAR CAMBIOS DE RUMBO EN MÚLTIPLOS DE TRACK_REFRESH_INTERVAL_S *****
    // Se llama desde el tick de 250 ms. Para cada entrada, calcula cuántos
    // intervalos de 5 s han transcurrido desde su inicio y, si ha cruzado
    // uno nuevo, refresca la proyección.
    function checkTrackChanges(now) {
        if (!state.active) return;
        if (state.planes.length === 0) return;

        const step = TRACK_REFRESH_INTERVAL_S;

        for (const entry of state.planes) {
            const plane = g.planes[entry.hex];
            if (!plane || !plane.position) continue;
            if (plane.seen > 15) continue;

            const track = getProjectionTrack(plane);
            if (track == null) continue;

            // elapsed en segundos desde el inicio de la proyección
            const elapsed = now - entry.startTime;
            if (elapsed < 0) continue;

            // Número de intervalos completos de 5 s transcurridos
            const stepsDone = Math.floor(elapsed / step);

            // Si hemos cruzado al menos un intervalo nuevo desde el último chequeo
            if (stepsDone > (entry.lastCheckedStep ?? -1)) {
                entry.lastCheckedStep = stepsDone;

                // Diferencia angular mínima (considerando el wrap 0/360)
                let diff = Math.abs(track - entry.trackAtCreation);
                diff = diff % 360;
                if (diff > 180) diff = 360 - diff;

                if (diff >= TRACK_CHANGE_THRESHOLD_DEG) {
                    refreshEntry(entry);
                }
            }
        }
    }

    // ***** INICIAR CICLO DE PROYECCIÓN *****
        // ***** INICIAR CICLO DE PROYECCIÓN *****
    function startLoop() {
        if (state.updateInterval) return;
        state.updateInterval = setInterval(() => {
            if (!state.active) return;
            if (state.planes.length === 0) return;

            const now = getProjectionTime();
            const finished = [];

            for (const entry of state.planes.slice()) {
                const status = updateGhost(entry, now);
                if (status === 'expired') finished.push(entry.hex);
            }
            finished.forEach(hex => removeProjection(hex));

            // ***** COMPROBAR CAMBIOS DE RUMBO ALINEADOS AL CONTADOR *****
            checkTrackChanges(now);

            renderSidebarPanel();
        }, 250);
    }

    // ***** TERMINAR CICLO DE PROYECCIÓN *****
    function stopLoop() {
        if (state.updateInterval) {
            clearInterval(state.updateInterval);
            state.updateInterval = null;
        }
    }

    // ***** OCULTAR/MOSTRAR PROYECCIÓN *****
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

    // ***** QUITAR PROYECCIÓN *****
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

    // ***** LIMPIAR TODAS LAS PROYECCIONES DE LA LISTA *****
    function clearAll() {
        state.sliderActive = false;
        const hexes = state.planes.map(p => p.hex);
        hexes.forEach(hex => removeProjection(hex));
        state.planes = [];
        if (state.lineSource) state.lineSource.clear();
        if (state.pointSource) state.pointSource.clear();
        if (state.ghostSource) state.ghostSource.clear();
        renderSidebarPanel();
    }

    // ***** INICIAR MODO PROYECCIÓN *****
    function startProjection(minutes) {
        log('startProjection', minutes);
        if (!createLayers()) {
            showBadge(T('projection_no_layers', 'Could not create layers (wait for the map to load).'), 4000);
            return;
        }
        if (typeof distanceBetweenPlanesMode !== 'undefined' && distanceBetweenPlanesMode) {
            DistanceBetweenPlanes();
        }
        if (typeof distanceToGroundMode !== 'undefined' && distanceToGroundMode) {
            DistanceToGround();
        }
        if (typeof groundToGroundMode !== 'undefined' && groundToGroundMode) {
            DistanceGroundToGround();
        }
        if (typeof elevationMode !== 'undefined' && elevationMode && typeof forceStopElevationGroundGround === 'function') {
            forceStopElevationGroundGround();
        }
        if (typeof elevationGroundAircraftMode !== 'undefined' && elevationGroundAircraftMode &&
            typeof forceStopElevationGroundAircraft === 'function') {
            forceStopElevationGroundAircraft();
        }
        if (minutes != null) {
            if (!state.validMinutes.includes(minutes)) {
                showBadge(`${T('projection_invalid_min', 'Invalid minutes')}: ${minutes}`, 3000);
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
        showBadge(`${T('projection_on', 'Projection Mode: ON')} (${state.minutes} ${T('projection_min_abbr', 'minutes')})`, 3500);
    }

    // ***** DETENER MODO PROYECCIÓN *****
    function stopProjection() {
        state.active = false;
        state.sliderActive = false;
        clearAll();
        stopLoop();
        updateToggleBtn();
        hideSidebarPanel();
        showBadge(T('projection_off', 'Projection Mode: OFF'), 2500);
    }

    // ***** MANEJAR CAMBIO DE ESTADO DEL MODO *****
    function toggleProjection() {
        if (state.active) stopProjection();
        else startProjection();
    }

    // ***** MANEJAR CLIC *****
    function handleClick(evt, planeHex) {
        if (!state.active) return false;
        if (planeHex) {
            createProjection(planeHex);
            evt.stopPropagation();
            return true;
        }
        return false;
    }

    // ***** ACTUALIZAR ESTADO DEL BOTÓN SEGÚN INICIADO/DETENIDO *****
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

    // ***** ACTUALIZAR TIEMPO DE LA PROYECCIÓN *****
    function updateMinutesRow() {
        const row = document.getElementById('projection-minutes-row');
        if (!row) return;
        row.querySelectorAll('.proj-min-btn').forEach(b => {
            b.classList.remove('proj-min-active');
            if (state.active && parseInt(b.dataset.min, 10) === state.minutes) {
                b.classList.add('proj-min-active');
            }
        });
    }

    // ***** CONSTRUIR MENÚ DE CON AVIONES PROYECTADOS *****
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
                .proj-min-btn.proj-min-active {
                    background: #ffffff !important;
                    color: ${SYS.base} !important;
                    font-weight: bold !important;
                    border-color: #ffffff !important;
                }
                .proj-min-btn:not(.proj-min-active) {
                    background: ${SYS.lighter} !important;
                    color: ${SYS.text} !important;
                    border-color: ${SYS.darker} !important;
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
            <div id="projection-minutes-row" style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;padding-bottom:4px;">
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
                showBadge(`${T('projection_base_time', 'Projection time set to')} ${min} ${T('projection_min_abbr', 'minutes')}`, 2500);
            });
        });

        updateToggleBtn();
        updateMinutesRow();
        log('Menú inyectado');
        return true;
    }

    // ***** COLOCAR PANEL DE AVIONES PROYECTADOS EN EL SIDEBAR DERECHO *****
    function ensureSidebarPanel() {
        let section = document.getElementById('projection-section');
        if (section) return section;

        const sidebarTable = document.getElementById('sidebar-table');
        if (!sidebarTable) return null;

        const starredSection = document.getElementById('starred-aircraft-section');

        section = document.createElement('div');
        section.id = 'projection-section';
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

    // ***** MOSTRAR EL PANEL CUANDO SE ACTIVA EL MODO *****
    function showSidebarPanel() {
        const section = ensureSidebarPanel();
        if (section) {
            section.style.display = '';
            renderSidebarPanel();
        }
    }

    // ***** OCULTAR EL PANEL CUANDO SE DESACTIVA EL MODO *****
    function hideSidebarPanel() {
        const section = document.getElementById('projection-section');
        if (section) {
            section.style.display = 'none';
        }
    }

    // ***** RENDERIZAR PANEL *****
    function renderSidebarPanel() {
        const section = document.getElementById('projection-section');
        if (!section) return;
        if (section.style.display === 'none') return;

        // ***** NO RECONSTRUIR MIENTRAS EL USUARIO ARRASTRA UN SLIDER *****
        if (state.sliderActive) return;

        const count = section.querySelector('#projection-sidebar-count');
        if (count) count.textContent = `${state.planes.length}/${state.maxPlanes}`;

        const list = section.querySelector('#projection-sidebar-list');
        if (!list) return;

        if (state.planes.length === 0) {
            list.innerHTML = `<div class="starred-empty" data-i18n="projection_empty">${T('projection_empty', 'Sin proyecciones activas')}</div>`;
            return;
        }

                const now = getProjectionTime();
        let html = '';
        for (const entry of state.planes) {
            const remaining = Math.max(0, entry.minutes * 60 * (1 - (entry.progress || 0)));
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
            const progressPct = Math.round((entry.progress || 0) * 100);

            html += `
                <div class="starred-item projection-item" data-hex="${entry.hex}"
                     style="border-left:4px solid ${entry.color}; flex-direction:column; align-items:stretch; gap:6px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
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
                                           color:${SYS.text};border-radius:3px;width:30px;height:26px;
                                           cursor:pointer;font-size:13px;padding:0;">${hiddenIcon}</button>
                            <button class="proj-sidebar-btn-remove" data-hex="${entry.hex}"
                                    title="${removeTitle}"
                                    style="background:#8a1a1a;border:1px solid #5a0f0f;
                                           color:#fff;border-radius:3px;width:30px;height:26px;
                                           cursor:pointer;font-size:13px;padding:0;
                                           font-weight:bold;">✖</button>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <input type="range" class="proj-progress-slider"
                               data-hex="${entry.hex}"
                               min="0" max="100" step="1" value="${progressPct}"
                               style="flex:1; height:4px; cursor:pointer; accent-color:${entry.color};">
                        <span class="proj-progress-value" style="min-width:36px; text-align:right; font-size:11px; color:${SYS.textDim};">${progressPct}%</span>
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

        // ***** SLIDER DE PROGRESO DE LA ESTELA *****
        list.querySelectorAll('.proj-progress-slider').forEach(slider => {
            const hex = slider.dataset.hex;

            // ***** ACTUALIZACIÓN EN VIVO (SIN REPINTAR EL PANEL) *****
            const applyProgress = () => {
                const entry = state.planes.find(p => p.hex === hex);
                if (!entry) return;

                const pct = parseInt(slider.value, 10) || 0;
                entry.progress = pct / 100;
                entry._userDragged = true;

                const now = getProjectionTime();
                updateGhost(entry, now);

                const valueSpan = slider.parentElement.querySelector('.proj-progress-value');
                if (valueSpan) valueSpan.textContent = pct + '%';

                const item = slider.closest('.projection-item');
                if (item && !entry.arrived && !entry.deviated) {
                    const detail = item.querySelector('.starred-item-detail');
                    if (detail) {
                        const timeStr = formatCountdown(entry.minutes * 60 * (1 - entry.progress));
                        // El tercer span del detail es el tiempo (precedido de "·")
                        const timeSpan = detail.querySelector('span:last-child');
                        if (timeSpan) timeSpan.textContent = timeStr;
                    }
                }

                if (entry.overlay && entry.ghostFeature) {
                    entry.overlay.setPosition(entry.ghostFeature.getGeometry().getCoordinates());
                }
                if (OLMap) OLMap.renderSync();
            };

            // ***** AL EMPEZAR A ARRASTRAR: BLOQUEAR REPINTADO *****
            slider.addEventListener('pointerdown', () => {
                state.sliderActive = true;
                slider.setPointerCapture && slider.setPointerCapture(event.pointerId);
            });

            // ***** DURANTE EL ARRASTRE: ACTUALIZAR EN VIVO *****
            slider.addEventListener('input', applyProgress);

            // ***** AL SOLTAR: REANUDAR MOVIMIENTO AUTOMÁTICO DESDE AQUÍ *****
            const releaseSlider = () => {
                const entry = state.planes.find(p => p.hex === hex);
                if (!entry) {
                    state.sliderActive = false;
                    return;
                }

                const totalS = entry.minutes * 60;
                const now = getProjectionTime();
                entry.startTime = now - entry.progress * totalS;
                entry.endTime = entry.startTime + totalS;
                entry.lastCheckedStep = Math.floor((entry.progress * totalS) / TRACK_REFRESH_INTERVAL_S);
                entry._userDragged = false;

                state.sliderActive = false;
                renderSidebarPanel();
            };

            slider.addEventListener('pointerup', releaseSlider);
            slider.addEventListener('pointercancel', releaseSlider);
            slider.addEventListener('change', releaseSlider);

            slider.addEventListener('mouseup', releaseSlider);
            slider.addEventListener('touchend', releaseSlider);
        });
    }

    // ***** INICIALIZAR MENÚ *****
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

    // ***** INICIALIZAR FUNCIÓN *****
    function init() {

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

    // ***** PUBLICAR FUNCIONES PARA USO EXTERNO *****
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
        refresh: (hex) => {
            const entry = state.planes.find(p => p.hex === hex);
            if (entry) refreshEntry(entry);
        },
        refreshAll: () => {
            for (const entry of state.planes) refreshEntry(entry);
        },
        checkTrackChanges: checkTrackChanges,
        init: init,
        _state: state
    };

    window.startProjection = startProjection;
    window.stopProjection = stopProjection;
    window.toggleProjection = toggleProjection;

    // ***** INICIALIZAR CUANDO ESTÉ CARGADO EL DOM *****
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ***** DETECTAR CAMBIO EN EL SELECTOR DE IDIOMA Y ACTUALIZAR *****
    document.addEventListener('languageChanged', () => {
        setTimeout(() => {
            const menuSpan = document.querySelector('#projection-menu-item > div:first-child > span');
            if (menuSpan) menuSpan.textContent = T('projection_tool', 'Projection tool');
            const clickHint = document.querySelector('#projection-menu-item > div:last-child');

            const headerH4 = document.querySelector('#projection-section .projection-header h4');
            if (headerH4) headerH4.textContent = T('projection_tool', 'Projection');

            const clearBtn = document.getElementById('clear-all-projections-btn');
            if (clearBtn) clearBtn.title = T('projection_clear_all', 'Remove all projections');

            renderSidebarPanel();
            if (typeof window.updateDistanceGuideContent === 'function') {
                window.updateDistanceGuideContent();
            }
        }, 200);
    });

})();