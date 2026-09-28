// ***** CONSULTAR EL ENDPOINT QUE DEVUELVE EL PERFIL DE ELEVACIÓN *****
const ELEV_CONFIG = {
    samples: 20,
    cgiUrl: `${window.location.origin}/cgi-bin/get_elevation.sh`
};

// ***** CONSERVAR CACHÉ DE PANORAMAS PARA SER REUTILIZADOS *****
const elevCache = new Map();
// ***** ESTABLECER UN LÍMITE DE CACHÉ PARA EVITAR QUE CREZCA DEMASIADO *****
const ELEV_CACHE_MAX_SIZE = 50;

// ***** DETECTAR SI UN ELEMENTO ESTÁ VISIBLE *****
function isVisibleElement(element) {
    if (!element) return false;

    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0;
}

// ***** AJUSTAR TAMAÑO DEL OVERLAY SEGÚN LOS ELEMENTOS ABIERTOS A SU ALREDEDOR *****
function updatePanoramaOverlayBounds() {
    // ***** OBTENER ELEMENTOS HTML *****
    const overlay = document.getElementById('panorama-overlay');
    const map = document.getElementById('map_container');

    // ***** SALIR SI NO EXISTE NI OVERLAY NI MAPA *****
    if (!overlay || !map) return;

    // ***** OBTENER INFORMACIÓN DE LAS MEDIDAS DEL MAPA *****
    const mapRect = map.getBoundingClientRect();

    // ***** ESTABLECER MÁRGENES PARA EL OVERLAY *****
    let left = 50;
    let right = 10;
    let bottom = 10;

    // ***** DETECTAR ELEMENTOS ABIERTOS DEL LADO IZQUIERDO *****
    const leftElements = [
        document.getElementById('selected_infoblock')
    ];

    // ***** DETECTAR ELEMENTOS ABIERTOS DEL LADO DERECHO *****
    const rightElements = [
        document.getElementById('header_side'),
        document.getElementById('layer-select')
    ];

    // ***** PARA CADA ELEMENTO VISIBLE DEL LADO IZQUIERDO, RECALCULAR TAMAÑO CONSIDERANDO MÁRGENES *****
    for (const element of leftElements) {
        if (!isVisibleElement(element)) continue;

        const rect = element.getBoundingClientRect();

        if (rect.right > mapRect.left && rect.left < mapRect.right) {
            left = Math.max(
                left,
                rect.right - mapRect.left + 10
            );
        }
    }

    // ***** PARA CADA ELEMENTO VISIBLE DEL LADO DERECHO, RECALCULAR TAMAÑO CONSIDERANDO MÁRGENES *****
    for (const element of rightElements) {
        if (!isVisibleElement(element)) continue;

        const rect = element.getBoundingClientRect();

        if (rect.left < mapRect.right && rect.right > mapRect.left) {
            right = Math.max(
                right,
                mapRect.right - rect.left + 10
            );
        }
    }

    // ***** OBTENER MEDIDAS DEL REPLAY *****
    const replay = document.getElementById('replayBar');

    // ***** PARA EL REPLAY VISIBLE, RECALCULAR TAMAÑO CONSIDERANDO MÁRGENES *****
    if (isVisibleElement(replay)) {
        const rect = replay.getBoundingClientRect();

        if (rect.top < mapRect.bottom && rect.bottom > mapRect.top) {
            bottom = Math.max(
                bottom,
                mapRect.bottom - rect.top + 10
            );
        }
    }

    // ***** ESTABLECER MÁRGENES SEGÚN LOS ELEMENTOS ABIERTOS *****
    overlay.style.setProperty('left', `${left}px`, 'important');
    overlay.style.setProperty('right', `${right}px`, 'important');
    overlay.style.setProperty('bottom', `${bottom}px`, 'important');
    overlay.style.setProperty('top', 'auto', 'important');
}

// ***** SI SE DETECTA EL EVENTO RESIZE, EJECUTAR FUNCIÓN *****
window.addEventListener('resize', updatePanoramaOverlayBounds);

// ***** MOSTRAR PANORAMA EN EL COMPONENTE HTML *****
function showPanoramaOverlay() {
    const el = document.getElementById('panorama-overlay');
    if (!el) return;
    // ***** QUITAR PROPIEDADES DE MINIMIZADO Y OCULTO SI EXISTEN *****
    el.classList.remove('hidden');
    el.classList.remove('minimized');

    // ***** COLOCAR ÍCONO PARA MINIMIZAR *****
    const btn = document.getElementById('panorama-close');
    if (btn) btn.textContent = '▼';

    // ***** AJUSTAR TAMAÑO DEL OVERLAY *****
    updatePanoramaOverlayBounds();
    setTimeout(updatePanoramaOverlayBounds, 100);
}

// ***** MOSTRAR/OCULTAR OVERLAY *****
function togglePanoramaMinimize() {
    // ***** OBTENER ELEMENTO HTML *****
    const el = document.getElementById('panorama-overlay');
    if (!el) return;
    // ***** APLICAR PROPIEDAD MINIMIZADA *****
    el.classList.toggle('minimized');
    const btn = document.getElementById('panorama-close');
    // ***** CAMBIAR ÍCONO SI EL OVERLAY VA A MOSTRARSE/OCULTARSE *****
    if (btn) btn.textContent = el.classList.contains('minimized') ? '▲' : '▼';
    // ***** ACTUALIZAR TAMAÑO DEL OVERLAY *****
    setTimeout(updatePanoramaOverlayBounds, 50);
}

// ***** OBTENER ELEMENTO DEL BOTÓN PARA MOSTRAR/OCULTAR Y EJECUTAR FUNCIÓN *****
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('panorama-close');
    if (btn) btn.addEventListener('click', togglePanoramaMinimize);
});

// ***** OCULTAR OVERLAY CUANDO SE DESHABILITE LA FUNCIÓN DESDE EL BOTÓN *****
function hidePanoramaOverlay() {
    const el = document.getElementById('panorama-overlay');
    if (el) el.classList.add('hidden');
    const c = document.getElementById('panorama-container');
    if (c) c.innerHTML = '';
    // ***** DETENER TIMER DE ACTUALIZACIÓN DE PANORAMA CUANDO ES EL MODO TIERRA-AERONAVE *****
    stopElevationCountdown();
}

// ***** CONSTRUIR PANORAMA DE ELEVACIÓN *****
async function getElevationProfileLine(lat1, lon1, lat2, lon2) {
    // ***** IMPEDIR SELECCIONAR OTROS PUNTOS HASTA QUE NO TERMINE DE CONSTRUIRSE EL PANORAMA ACTUAL *****
    if (elevationBusy) {
        showDistanceGuide(() => getTranslatedText('wait_for_elevation', 'Wait for the elevation to finish rendering...'));
        return;
    }
    // ***** MENSAJE DE QUE EL PANORAMA SE ESTÁ CONSTRUYENDO *****
    elevationBusy = true;
    showDistanceGuide(() => getTranslatedText('building_elevation', 'Building elevation...'));

    // ***** CONSULTAR ENDPOINT *****
    const urlBase = `${ELEV_CONFIG.cgiUrl}?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&samples=${ELEV_CONFIG.samples}`;

    try {
        // ***** CONSTRUIR UNA CLAVE ESPECÍFICA CON CACHÉ *****
        const cacheKey = `${lat1.toFixed(5)},${lon1.toFixed(5)}|${lat2.toFixed(5)},${lon2.toFixed(5)}|${ELEV_CONFIG.samples}`;
        const cached = elevCache.get(cacheKey);
        // ***** SI EXISTE UN PANORAMA EN CACHÉ, NO VOLVER A CONSULTAR AL ENDPOINT, SÓLO REDIBUJAR Y MOSTRAR *****
        if (cached) {
            showPanoramaOverlay();
            draw3DPanorama(cached.points, cached.totalNm);
            return;
        }
        
        // ***** OBTENER RESPUESTA DE LA PETICIÓN AL ENDPOINT *****
        const res = await fetch(urlBase);
        // ***** RECIBIR MENSAJE DE ERROR EN CASO DE FALLAR *****
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();

        // ***** SALIR SI EL ENDPOINT NO DEVOLVIÓ NADA Y MOSTRAR ERROR *****
        if (!data.points || !data.points.length) {
            showDistanceGuide(() => getTranslatedText('no_data', 'No significant data to draw from.'));
            return;
        }

        // ***** OBTENER LA DISTANCIA TOTAL ENTRE LOS PUNTOS *****
        const totalNm = data.totalNm || data.points[data.points.length - 1].distNm;
        // ***** SI EL NUEVO PANORAMA EN CACHÉ EXCEDE EL TAMAÑO MÁXIMO, LIMPIAR EL PANORAMA MÁS ANTIGUO *****
        if (elevCache.size >= ELEV_CACHE_MAX_SIZE) {
            const oldestKey = elevCache.keys().next().value;
            elevCache.delete(oldestKey);
        }
        // ***** ALMACENAR EN CACHÉ EL PANORAMA OBTENIDO *****
        elevCache.set(cacheKey, { points: data.points, totalNm });

        // ***** DIBUJAR Y MOSTRAR PANORAMA *****
        showPanoramaOverlay();
        draw3DPanorama(data.points, totalNm);
    // ***** CAPTURAR ERROR AL PROCESAR PANORAMA *****
    } catch (e) {
        showDistanceGuide(() => getTranslatedText('data_error', 'Batch elevation error:'));
    } finally {
        elevationBusy = false;
        hideDistanceGuide();
    }
}

// ***** DIBUJAR PANORAMA UTILIZANDO LA LIBRERÍA D3.JS *****
function draw3DPanorama(data, totalNm) {
    // ***** ALMACENAR INFORMACIÓN DE LAT, LON, DIST Y ALT *****
    lastPanoramaData = data;
    // ***** ALMACENAR DISTANCIA TOTAL *****
    lastPanoramaTotalNm = totalNm;
    // ***** OBTENER Y LIMPIAR COMPONENTE HTML; SALIR SI NO EXISTE *****
    const container = document.getElementById('panorama-container');
    if (!container) return;
    container.innerHTML = '';

    // ***** DEFINIR MEDIDAS Y MARGENES DEL PANORAMA *****
    const width = container.offsetWidth || 800;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    // ***** ESTABLECER UNIDADES DEL PANORAMA: LA SELECCIONADA POR EL USUARIO O, POR DEFECTO, NÁUTICAS *****
    const units = DisplayUnits || 'nautical';

    // ***** CONFIGURAR PROPIEDADES PARA CADA TIPO DE UNIDAD *****
    const unitConfig = {
        // ***** NAÚTICO *****
        'nautical': {
            // ***** NO CONVERTIR: VIENEN EN NM DESDE EL ENDPOINT *****
            distMultiplier: 1,
            // ***** LABEL DE DISTANCIA ES NM *****
            distLabel: 'NM',
            // ***** LABEL DE ALTURA ES FT *****
            altLabel: 'ft'
        },
        // ***** MÉTRICO *****
        'metric': {
            // ***** CONVERTIR DISTANCIA A KILÓMETROS *****
            distMultiplier: 1.852,
            // ***** LABEL DE DISTANCIA ES KM *****
            distLabel: 'km',
            // ***** LABEL DE ALTURA ES M *****
            altLabel: 'm'
        },
        // ***** IMPERIAL *****
        'imperial': {
            // ***** CONVERTIR DISTANCIA A MILLAS *****
            distMultiplier: 1.15078,
            // ***** LABEL DE DISTANCIA ES MI *****
            distLabel: 'mi',
            // ***** LABEL DE ALTURA ES FT *****
            altLabel: 'ft'
        }
    };
    // ***** ESTABLECER QUE LAS UNIDADES SON LAS SELECCIONADAS POR EL USUARIO O, POR DEFECTO, NAÚTICAS *****
    const config = unitConfig[units] || unitConfig['nautical'];

    // ***** CONVERTIR DISTANCIA TOTAL RECIBIDA DEL ENDPOINT A LA UNIDAD CORRESPONDIENTE *****
    const distTotal = totalNm * config.distMultiplier;
    // ***** SI LA UNIDAD ES METROS, NO CONVERTIR (VIENE EN M DESDE EL ENDPOINT); SI ES NÁUTICO O IMPERIAL, CONVERTIR A PIES *****
    const altUnitFactor = (units === 'metric') ? 1 : 3.28084;
    // ***** EVITAR DIBUJAR ALTURAS NEGATIVAS *****
    const altData = data.map(d => d3.max([0, d.alt * altUnitFactor]));
    // ***** DEJAR UNA PEQUEÑA SEPARACIÓN ENTRE LA ALTURA Y EL BORDE SUPERIOR DEL PANORAMA *****
    const maxAlt = d3.max(altData) * 1.1;

    // ***** CREAR PANORAMA DENTRO DEL COMPONENTE HTML *****
    const svg = d3.select("#panorama-container")
        // ***** INSERTAR SVG EN EL CONTENEDOR *****
        .append("svg")
        // ***** ESTABLECER ANCHO Y ALTO *****
        .attr("viewBox", `0 0 ${width} ${height}`)
        // ***** PERMITIR QUE EL SVG SE EXPANDA PARA OCUPAR TODO EL CONTENEDOR *****
        .attr("preserveAspectRatio", "none")
        // ***** PERMITIR QUE EL SVG OCUPE TODO EL ALTO Y ANCHO DEL CONTENEDOR *****
        .style("width", "100%")
        .style("height", "100%");

    // ***** DIBUJAR DISTANCIA EN EL PANORAMA RESPETANDO ESPACIO DEL SVG *****
    const x = d3.scaleLinear()
        .domain([0, distTotal])
        .range([margin.left, width - margin.right]);

    // ***** DIBUJAR ALTURA EN EL PANORAMA RESPETANDO ESPACIO DEL SVG *****
    const y = d3.scaleLinear()
        .domain([0, maxAlt])
        .range([height - margin.bottom, margin.top]);

    // ***** DIBUJAR UNIDADES DE DISTANCIA EN EL PANORAMA RESPETANDO ESPACIO DEL SVG *****
    const xAxis = d3.axisBottom(x)
        .ticks(6)
        .tickFormat(d => `${d.toFixed(0)} ${config.distLabel}`)
        .tickSizeOuter(0)
        .tickSizeInner(-(height - margin.top - margin.bottom));

    // ***** DIBUJAR UNIDADES DE ALTURA EN EL PANORAMA RESPETANDO ESPACIO DEL SVG *****
    const yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `${d.toFixed(0)} ${config.altLabel}`)
        .tickSizeOuter(0)
        .tickSizeInner(-(width - margin.left - margin.right));

    // ***** RECONSTRUIR INFORMACIÓN EN EL FORMATO ESPERADO POR D3 *****
    const areaData = data.map(d => ({
        dist: d.distNm * config.distMultiplier,
        alt: d3.max([0, d.alt * altUnitFactor])
    }));

    // ***** DIBUJAR ÁREA DEL PANORAMA *****
    const area = d3.area()
        .x(d => x(d.dist))
        .y0(y(0))
        .y1(d => y(d.alt))
        .curve(d3.curveLinear);

    // ***** DIBUJAR PANORAMA CON CUADRÍCULA *****
    svg.append("path")
        .datum(areaData)
        .attr("fill", "rgba(100, 100, 100, 0.7)")
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .attr("d", area);

    // ***** DIBUJAR EJE X *****
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    // ***** ESTILIZAR CUADRÍCULA DEL EJE X *****
    xAxisGroup.selectAll(".tick line")
        .attr("stroke", "rgba(255, 255, 255, 0.3)")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1);

    // ***** ESTILIZAR TEXTO DEL EJE X *****
    xAxisGroup.selectAll(".tick text")
        .attr("fill", "rgba(255, 255, 255, 0.8)")
        .attr("font-size", "10px");

    // ***** DIBUJAR EJE Y *****
    const yAxisGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    // ***** ESTILIZAR CUADRÍCULA DEL EJE Y *****
    yAxisGroup.selectAll(".tick line")
        .attr("stroke", "rgba(255, 255, 255, 0.3)")
        .attr("stroke-dasharray", "4,4")
        .attr("stroke-width", 1);

    // ***** ESTILIZAR TEXTO DEL EJE Y *****
    yAxisGroup.selectAll(".tick text")
        .attr("fill", "rgba(255, 255, 255, 0.8)")
        .attr("font-size", "10px");

    // ***** ESTILIZAR BORDES DEL GRÁFICO EN EL EJE X *****
    xAxisGroup.selectAll(".domain")
        .attr("stroke", "rgba(255, 255, 255, 0.2)")
        .attr("stroke-width", 1);

    // ***** ESTILIZAR BORDES DEL GRÁFICO EN EL EJE Y *****
    yAxisGroup.selectAll(".domain")
        .attr("stroke", "rgba(255, 255, 255, 0.2)")
        .attr("stroke-width", 1);

    // ***** OBSERVAR CAMBIOS EN EL TAMAÑO DEL PANORAMA *****
    if (!panoramaResizeObs && window.ResizeObserver) {
        // ***** PARA CUALQUIER CAMBIO, REDIBUJAR PANORAMA, NO CONSULTAR NUEVAMENTE AL ENDPOINT *****
        panoramaResizeObs = new ResizeObserver(() => {
            if (lastPanoramaData && lastPanoramaTotalNm != null) {
                draw3DPanorama(lastPanoramaData, lastPanoramaTotalNm);
            }
        });
        panoramaResizeObs.observe(container);
    }
}

// ***** HABILITAR/DESHABILITAR FUNCIÓN DE ELEVACIÓN (MODO TIERRA-TIERRA) *****
function toggleElevationMode() {
    // ***** INVERTIR ESTADO GLOBAL DEL MODO *****
    elevationMode = !elevationMode;

    // ***** SI EL MODO ESTÁ ACTIVO *****
    if (elevationMode) {
        // ***** SI EL MODO ACTIVO ES EL TIERRA-AERONAVE *****
        if (elevationGroundAircraftMode) {
            // ***** DESACTIVAR MODO *****
            elevationGroundAircraftMode = false;
            // ***** DETENER ACTUALIZACIÓN DEL PANORAMA *****
            if (typeof stopElevationGroundAircraftUpdates === 'function') {
                stopElevationGroundAircraftUpdates();
            }
            // ***** DETENER TIMER DE 5 SEGUNDOS *****
            if (typeof stopElevationCountdown === 'function') {
                stopElevationCountdown();
            }
        }
        // ***** LIMPIAR ANCLA *****
        elevationAnchor = null;
        // ***** MOSTRAR MENSAJE GUÍA DEL PASO 1 *****
        showDistanceGuide(() => getTranslatedText('elevation_mark_point_a', 'Click on the map to mark point A.'));
        // ***** OCULTAR OVERLAY *****
        hidePanoramaOverlay();

        // ***** LIMPIAR CAPAS DE LÍNEAS Y PUNTOS *****
        if (elevationPointSource) elevationPointSource.clear();
        if (elevationLineSource) elevationLineSource.clear();
        elevationPointLayer && elevationPointLayer.setVisible(true);
        elevationLineLayer && elevationLineLayer.setVisible(false);

    // ***** SI EL MODO NO ESTÁ ACTIVO *****
    } else {
        // ***** LIMPIAR ANCLA *****
        elevationAnchor = null;
        // ***** OCULTAR GUÍA *****
        hideDistanceGuide();
        // ***** OCULTAR OVERLAY *****
        hidePanoramaOverlay();
        // ***** LIMPIAR CAPAS DE LÍNEAS Y PUNTOS *****
        elevationPointSource && elevationPointSource.clear();
        elevationLineSource && elevationLineSource.clear();
        elevationPointLayer && elevationPointLayer.setVisible(false);
        elevationLineLayer && elevationLineLayer.setVisible(false);
    }
}

// ***** ESTABLECER ANCLA A 50NM DESDE LA POSICIÓN DEL AVIÓN *****
function computeAnchorFromAircraft(plane, distanceNm = 50) {
    // ***** SALIR SI NO EXISTE AVIÓN O SI EL AVIÓN NO TIENE POSICIÓN *****
    if (!plane || !plane.position) return null;

    // ***** OBTENER POSICIÓN DEL AVIÓN - LAT/LON *****
    const [lon, lat] = plane.position;

    // ***** UTILIZAR COMO ANCLA (SEGÚN ORDEN DE PREFERENCIA): *****
    // ***** 1 - DIRECCIÓN DE LA NARIZ (TRUE HEADING) *****
    // ***** 2 - DECLINACIÓN MAGNÉTICA (MAG HEADING) *****
    // ***** 3 - RUMBO (TRACK) *****
    // ***** 4 - NORTE *****

    // ***** LIMPIAR ANCLA *****
    let heading = null;

    // ***** SI EXISTE TRUE HEADING, ESTABLECER COMO ANCLA *****
    if (plane.true_heading != null && !isNaN(plane.true_heading)) {
        heading = plane.true_heading;
    // ***** SI EXISTE MAG HEADING, ESTABLECER COMO ANCLA *****
    } else if (plane.mag_heading != null && !isNaN(plane.mag_heading)) {
        // ***** CONVERTIR MAG HEADING A TRUE HEADING *****
        let declination = 0;
        // ***** COMPROBAR QUE EXISTE LA FUNCIÓN GEOMAG Y EL AVIÓN TIENE POSICIÓN *****
        if (typeof geoMag === 'function' && plane.position) {
            // ***** CALCULAR DECLINACIÓN MAGNÉTICA *****
            try {
                const mag = geoMag(plane.position[1], plane.position[0], 0);
                declination = mag.dec || 0;
            } catch (e) { }
        }
        // ***** ESTABLECER ANCLA *****
        heading = (plane.mag_heading + declination + 360) % 360;
    // ***** SI EXISTE TRACK, ESTABLECER COMO ANCLA *****
    } else if (plane.track != null && !isNaN(plane.track)) {
        heading = plane.track;
    // ***** SI NO EXISTE NINGUNO DE LOS ANTERIORES, ESTABLECER NORTE COMO ANCLA *****
    } else {
        heading = 0;
    }

    // ***** RADIO DE LA TIERRA EN NM (PARA QUE ESTÉ EN LA MISMA UNIDAD QUE LA DISTANCIA) *****
    const R_NM = 6371 / 1.852;

    // ***** CONVERTIR TODOS LOS GRADOS A RADIANES PARA USO DE LAS BIBLIOTECAS MATEMÁTICAS DE JS *****
    // ***** LATITUD *****
    const latRad = lat * Math.PI / 180;
    // ***** LONGITUD *****
    const lonRad = lon * Math.PI / 180;
    // ***** DIRECCIÓN DE LA NARIZ *****
    const bearing = heading * Math.PI / 180;
    // ***** ÁNGULO ENTRE LOS PUNTOS DE ORIGEN-DESTINO *****
    const angDist = distanceNm / R_NM;

    // ***** FÓRMULA ESTÁNDAR DE LA NAVEGACIÓN ESFÉTICA: PUNTO + DIRECCIÓN DE LA NARIZ + DISTANCIA *****

    // ***** CALCULADO PARA LATITUD *****
    const lat2 = Math.asin(
        Math.sin(latRad) * Math.cos(angDist) +
        Math.cos(latRad) * Math.sin(angDist) * Math.cos(bearing)
    );

    // ***** CALCULADO PARA LONGITUD *****
    const lon2 = lonRad + Math.atan2(
        Math.sin(bearing) * Math.sin(angDist) * Math.cos(latRad),
        Math.cos(angDist) - Math.sin(latRad) * Math.sin(lat2)
    );

    // ***** CONVERTIR RESULTADO DE RADIANES A GRADOS *****
    return {
        lat: lat2 * 180 / Math.PI,
        lon: lon2 * 180 / Math.PI
    };
}

// ***** HABILITAR/DESHABILITAR FUNCIÓN DE ELEVACIÓN (MODO TIERRA-AERONAVE) *****
function startElevationGroundAircraft() {
    // ***** INVERTIR ESTADO GLOBAL DEL MODO *****
    elevationGroundAircraftMode = !elevationGroundAircraftMode;

    // ***** SI EL MODO ESTÁ ACTIVO *****
    if (elevationGroundAircraftMode) {
        // ***** SI EL MODO ACTIVO ES EL TIERRA-AERONAVE *****
        if (elevationMode) {
            // ***** DESACTIVAR MODO *****
            elevationMode = false;
            // ***** LIMPIAR ANCLA *****
            elevationAnchor = null;
        }
        // ***** LIMPIAR CAPAS DE LÍNEAS Y PUNTOS *****
        elevationPointSource && elevationPointSource.clear();
        elevationLineSource && elevationLineSource.clear();
        elevationPointLayer && elevationPointLayer.setVisible(true);
        elevationLineLayer && elevationLineLayer.setVisible(false);

        // ***** LIMPIAR ANCLA EN TIERRA Y AVIÓN SELECCIONADO *****
        elevationGroundAnchor = null;
        elevationAircraftHex = null;
        // ***** OCULTAR OVERLAY *****
        hidePanoramaOverlay();
        // ***** MOSTRAR GUÍA PARA EL USUARIO *****
        showDistanceGuide(() => getTranslatedText('elevation_select_aircraft_only', 'Click on an aircraft to draw the elevation panorama (50 NM ahead).'));
        // MODO ANTIGUO: INDICAR AL USUARIO QUE SELECCIONE PUNTO A
        // showDistanceGuide(
        //     getTranslatedText(
        //         'elevation_mark_ground_point',
        //         'Click on the map to mark the ground point.'
        //     )
        // );
        // ***** DETENER ACTUALIZACIÓN DEL PANORAMA *****
        stopElevationGroundAircraftUpdates();
    // ***** SI NO ESTÁ ACTIVO *****
    } else {
        // ***** LIMPIAR ANCLA EN TIERRA Y AVIÓN SELECCIONADO *****
        elevationGroundAnchor = null;
        elevationAircraftHex = null;

        // ***** DETENER ACTUALIZACIÓN DEL PANORAMA Y TIMER DE 5 SEGUNDOS *****
        stopElevationGroundAircraftUpdates();
        stopElevationCountdown();

        // ***** LIMPIAR CAPAS DE LÍNEAS Y PUNTOS *****
        elevationPointSource && elevationPointSource.clear();
        elevationLineSource && elevationLineSource.clear();
        elevationPointLayer && elevationPointLayer.setVisible(false);
        elevationLineLayer && elevationLineLayer.setVisible(false);

        // ***** OCULTAR GUÍA *****
        hidePanoramaOverlay();
        // ***** OCULTAR OVERLAY *****
        hideDistanceGuide();
    }
}

// ***** DETENER ACTUALIZACIÓN DEL PANORAMA *****
function stopElevationGroundAircraftUpdates() {
    if (elevationGroundAircraftUpdateInterval) {
        clearInterval(elevationGroundAircraftUpdateInterval);
        elevationGroundAircraftUpdateInterval = null;
    }
}

// ***** ACTUALIZAR PANORAMA SEGÚN TIMER *****
function updateElevationGroundAircraftProfile() {
    // ***** SALIR SI NO HAY AVIÓN SELECCIONADO O SI HAY UN PANORAMA CONSTRUYÉNDOSE *****
    if (!elevationGroundAircraftMode ||
        // MODO ANTIGUO: exigía que existiera un punto A ya marcado
        // !elevationGroundAnchor ||
        !elevationAircraftHex ||
        elevationBusy) {
        return;
    }

    // ***** OBTENER AVIÓN SELECCIONADO *****
    const plane = g.planes[elevationAircraftHex];

    // ***** SALIR SI NO HAY AVIÓN, SI EL AVIÓN NO TIENE POSICIÓN O SI FUE VISTO POR ÚLTIMA VEZ HACE MÁS DE 15 SEGUNDOS *****
    if (!plane || !plane.position || plane.seen > 15) {
        return;
    }

    // ***** RECALCULTAR ANCLA CADA 5 SEGUNDOS *****
    elevationGroundAnchor = computeAnchorFromAircraft(plane, 50);
    // ***** SALIR SI NO HAY ANCLA *****
    if (!elevationGroundAnchor) {
        return;
    }

    // ***** ACTUALIZAR POSICIÓN DE LA LÍNEA Y PUNTO B SEGÚN MOVIMIENTO DEL AVIÓN *****
    updateElevationGroundAircraftDrawings(plane);

    // ***** CONSTRUIR PANORAMA *****
    getElevationProfileLine(
        elevationGroundAnchor.lat,
        elevationGroundAnchor.lon,
        plane.position[1],
        plane.position[0]
    );
}

// ***** ACTUALIZAR POSICIÓN DE LA LÍNEA Y PUNTO B SEGÚN MOVIMIENTO DEL AVIÓN *****
function updateElevationGroundAircraftDrawings(plane) {
    // ***** SALIR SI NO EXISTE ANCLA, AVIÓN, POSICIÓN DEL AVIÓN, PUNTOS O LÍNEA DEL PANORAMA *****
    if (!elevationGroundAnchor || !plane || !plane.position) return;
    if (!elevationPointSource || !elevationLineSource) return;

    // ***** OBTENER COORDENADAS DEL PUNTO EN TIERRA *****
    const groundCoord = ol.proj.fromLonLat([
        elevationGroundAnchor.lon,
        elevationGroundAnchor.lat
    ]);

    // ***** OBTENER COORDENADAS DEL AVIÓN *****
    const aircraftCoord = ol.proj.fromLonLat([
        plane.position[0],
        plane.position[1]
    ]);

    // ***** LIMPIAR CAPAS DE LÍNEAS Y PUNTOS *****
    elevationPointSource.clear();
    elevationLineSource.clear();

    // ***** ESTABLECER PUNTO EN TIERRA *****
    const groundFeature = new ol.Feature(
        new ol.geom.Point(groundCoord)
    );
    groundFeature.set('role', 'ground');

    // ***** ESTABLECER AVIÓN *****
    const aircraftFeature = new ol.Feature(
        new ol.geom.Point(aircraftCoord)
    );
    aircraftFeature.set('role', 'aircraft');

    // ***** CONSTRUIR CAPA DE PUNTOS *****
    elevationPointSource.addFeatures([
        groundFeature,
        aircraftFeature
    ]);

    // ***** CONSTRUIR CAPA DE LÍNEA *****
    elevationLineSource.addFeature(
        new ol.Feature(
            new ol.geom.LineString([
                groundCoord,
                aircraftCoord
            ])
        )
    );

    // ***** HACER VISIBLES AMBAS CAPAS *****
    elevationPointLayer.setVisible(true);
    elevationLineLayer.setVisible(true);

    // ***** DETECTAR CAMBIO EN LAS CAPAS *****
    elevationPointSource.changed();
    elevationLineSource.changed();
    elevationPointLayer.changed();
    elevationLineLayer.changed();

    if (OLMap) OLMap.renderSync();
}

// ***** INICIAR TIMER *****
function startElevationCountdown() {
    // ***** LIMPIAR CUALQUIER INTERVALO ANTERIOR *****
    clearInterval(elevationCountdownInterval);

    // ***** ESTABLECER TIEMPO DE 5 SEGUNDOS *****
    elevationCountdownValue = 5;
    // ***** ACTUALIZAR CONTADOR *****
    updateElevationCountdown();

    // ***** DISMINUIR CONTADOR EN 1 CADA SEGUNDO SIEMPRE QUE ESTÉ DENTRO DEL PARÁMETRO *****
    elevationCountdownInterval = setInterval(() => {
        // ***** DISMINUIR Y ACTUALIZAR CONTADOR *****
        elevationCountdownValue--;
        updateElevationCountdown();

        // ***** ESTABLECER EN 5 EL VALOR DEL CONTADOR SI ES MENOR O IGUAL A 0 PARA REINICIAR TIMER CUANDO SE REDIBUJE EL PANORAMA *****
        if (elevationCountdownValue <= 0) {
            elevationCountdownValue = 5;
        }
    // ***** EJECUTAR CADA SEGUNDO *****
    }, 1000);
}

// ***** ACTUALIZAR CONTADOR *****
function updateElevationCountdown() {
    // ***** OBTENER COMPONENTE HTML *****
    const el = document.getElementById('panorama-update-countdown');
    if (!el) return;

    // ***** MOSTRAR TIMER EN EL OVERLAY *****
    el.textContent = getTranslatedText(
        'elevation_next_update',
        'Next update in {seconds}s'
    ).replace('{seconds}', elevationCountdownValue);
}

// ***** DETENER CONTADOR *****
function stopElevationCountdown() {
    // ***** LIMPIAR INTERVALO Y ESTABLECER EN NULO *****
    clearInterval(elevationCountdownInterval);
    elevationCountdownInterval = null;
    // ***** LIMPIAR TEXTO DEL TIMER EN EL OVERLAY *****
    const el = document.getElementById('panorama-update-countdown');
    if (el) el.textContent = '';
}

// ***** DIBUJAR CAPA DE PUNTOS *****
function drawElevationGroundPoint(point) {
    // ***** SALIR SI NO HAY PUNTOS DISPONIBLE *****
    if (!elevationPointSource || !point) return;

    // ***** LIMPIAR CAPA DE PUNTOS EXISTENTE *****
    elevationPointSource.clear();

    // ***** OBTENER POSICIÓN DEL PUNTO *****
    const feature = new ol.Feature(
        new ol.geom.Point(
            ol.proj.fromLonLat([point.lon, point.lat])
        )
    );

    feature.set('role', 'ground');

    // ***** AÑADIR PUNTO A LA CAPA Y HACERLA VISIBLE *****
    elevationPointSource.addFeature(feature);
    elevationPointLayer && elevationPointLayer.setVisible(true);

    // ***** DETECTAR CAMBIOS EN LA POSICIÓN DEL PUNTO *****
    elevationPointSource.changed();
    elevationPointLayer && elevationPointLayer.changed();
    OLMap && OLMap.renderSync();
}

// ***** OBSERVAR CAMBIOS EN LOS ELEMENTOS CIRCUNDANTES AL PANORAMA *****
function initPanoramaObserver() {
    // ***** OBSERVAR CAMBIOS EN EL MENÚ LATERAL DERECHO *****
    const sidebar = document.getElementById('sidebar_container');
    if (!sidebar) return;

    // ***** SI SE DETECTAN CAMBIOS, EJECUTAR FUNCIÓN DE ACTUALIZAR TAMAÑO DEL PANORAMA *****
    const observer = new MutationObserver(() => {
        updatePanoramaOverlayBounds();
    });

    // ***** OBSERVAR CAMBIOS DE ESTILO Y CLASES *****
    observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // ***** OBSERVAR CAMBIOS EN EL MENÚ LATERAL IZQUIERDO *****
    const infoblock = document.getElementById('selected_infoblock');

    // ***** SI SE DETECTAN CAMBIOS, EJECUTAR FUNCIÓN DE ACTUALIZAR TAMAÑO DEL PANORAMA *****
    if (infoblock) {
        const infoObserver = new MutationObserver(() => {
            setTimeout(updatePanoramaOverlayBounds, 50);
        });
        // ***** OBSERVAR CAMBIOS DE ESTILO Y CLASES *****
        infoObserver.observe(infoblock, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
}

// ***** MANEJADOR DE CLIC PARA ELEVACIÓN TIERRA-TIERRA *****
function handleElevationClick(evt) {
    // ***** INDICAR QUE LA ELEVACIÓN SE ESTÁ CONSTRUYENDO *****
    if (elevationBusy) {
        showDistanceGuide(() => getTranslatedText('building_elevation', 'Building elevation...'));
        return;
    }

    // ***** OBTENER COORDENADAS DEL PUNTO MARCADO *****
    const evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
    // ***** TRANSFORMAR COORDENADA OBTENIDA A VALORES DE LATITUD/LONGITUD *****
    const lonlat = ol.proj.toLonLat(evtCoords);
    // ***** ESTABLECER COORDENADAS DEL PUNTO MARCADO *****
    const clicked = { lat: lonlat[1], lon: lonlat[0] };

    // ***** SI NO HAY ANCLA (PUNTO A) DEFINIDA *****
    if (!elevationAnchor) {
        // ***** ASIGNAR PUNTO MARCADO COMO ANCLA *****
        elevationAnchor = clicked;

        // ***** SI EXISTE LA CAPA DE PUNTOS *****
        if (elevationPointSource) {
            // ***** LIMPIAR CAPA EXISTENTE PARA EVITAR ERRORES DE DIBUJO *****
            elevationPointSource.clear();
            // ***** INSERTAR PUNTO MARCADO EN LA CAPA *****
            const fA = new ol.Feature(
                new ol.geom.Point(ol.proj.fromLonLat([clicked.lon, clicked.lat]))
            );
            // ***** ESTABLECER PUNTO A *****
            fA.set('role', 'A');
            elevationPointSource.addFeature(fA);
            // ***** HACER VISIBLE LA CAPA DE PUNTOS *****
            elevationPointLayer && elevationPointLayer.setVisible(true);
        }

        // ***** LIMPIAR Y OCULTAR CAPAS DE LÍNEAS Y PUNTOS *****
        if (elevationLineSource) elevationLineSource.clear();
        elevationLineLayer && elevationLineLayer.setVisible(false);

        // ***** INDICAR AL USUARIO QUE SELECCIONE EL PUNTO B *****
        showDistanceGuide(() => getTranslatedText('elevation_mark_point_b', 'Click on the map to mark point B.'));
        return;
    }

    // ***** ASIGNAR PUNTO A COMO ANCLA Y PUNTO B COMO EL QUE ACABA DE SER MARCADO *****
    const a = elevationAnchor;
    const b = clicked;

    // ***** SI EXISTE LA CAPA DE PUNTOS *****
    if (elevationPointSource) {
        // ***** LIMPIAR CAPA EXISTENTE PARA EVITAR ERRORES DE DIBUJO *****
        elevationPointSource.clear();
        // ***** INSERTAR PUNTO A EN LA CAPA *****
        const fA = new ol.Feature(
            new ol.geom.Point(ol.proj.fromLonLat([a.lon, a.lat]))
        );
        // ***** ESTABLECER PUNTO A *****
        fA.set('role', 'A');
        elevationPointSource.addFeature(fA);

        // ***** INSERTAR PUNTO MARCADO EN LA CAPA *****
        const fB = new ol.Feature(
            new ol.geom.Point(ol.proj.fromLonLat([b.lon, b.lat]))
        );
        // ***** ESTABLECER PUNTO B *****
        fB.set('role', 'B');
        elevationPointSource.addFeature(fB);
        
        // ***** HACER VISIBLE LA CAPA DE PUNTOS *****
        elevationPointLayer && elevationPointLayer.setVisible(true);
    }

    // ***** SI EXISTE LA CAPA DE LÍNEA *****
    if (elevationLineSource) {
        // ***** LIMPIAR CAPA EXISTENTE PARA EVITAR ERRORES DE DIBUJO *****
        elevationLineSource.clear();
        // ***** INSERTAR LÍNEA ENTRE LOS DOS PUNTOS EN LA CAPA *****
        elevationLineSource.addFeature(
            new ol.Feature(
                new ol.geom.LineString([
                    ol.proj.fromLonLat([a.lon, a.lat]),
                    ol.proj.fromLonLat([b.lon, b.lat])
                ])
            )
        );
        // ***** HACER VISIBLE LA CAPA DE LÍNEA *****
        elevationLineLayer && elevationLineLayer.setVisible(true);
    }

    // ***** OCULTAR GUÍA *****
    hideDistanceGuide();

    // ***** LLAMAR A LA FUNCIÓN QUE DIBUJA LA ELEVACIÓN *****
    if (typeof getElevationProfileLine === 'function') {
        getElevationProfileLine(a.lat, a.lon, b.lat, b.lon);
    }

    // ***** LIMPIAR ANCLA *****
    elevationAnchor = null;
}

// ***** MANEJADOR DE CLIC PARA ELEVACIÓN TIERRA-AERONAVE *****
function handleElevationGroundAircraftClick(evt, planeHex) {
    // ***** INDICAR QUE LA ELEVACIÓN SE ESTÁ CONSTRUYENDO *****
    if (elevationBusy) {
        showDistanceGuide(() => getTranslatedText('building_elevation', 'Building elevation...'));
        return;
    }

    // ***** INDICAR QUE SE SELECCIONE EL AERONAVE REFERENTE A LA CUAL SE QUIERE DIBUJAR LA ELEVACIÓN *****
    if (!planeHex) {
        showDistanceGuide(() => getTranslatedText('elevation_select_aircraft_only', 'Click on an aircraft to draw the elevation panorama (50 NM ahead).'));
        return;
    }

    // ***** OBTENER INFORMACIÓN DEL AERONAVE *****
    const plane = g.planes[planeHex];

    // ***** SI NO HAY AERONAVE, NO TIENE POSICIÓN O LA ÚLTIMA VEZ QUE SE VIÓ FUE HACE 15 SEGUNDOS *****
    if (!plane || !plane.position || plane.seen > 15) {
        // ***** INDICAR QUE LA POSICIÓN DEL AERONAVE NO ESTÁ DISPONIBLE *****
        showDistanceGuide(() => getTranslatedText('elevation_invalid_aircraft', 'The aircraft position is unavailable.'));
        return;
    }

    // ***** DETENER LA ACTUALIZACIÓN DEL PANORAMA *****
    stopElevationGroundAircraftUpdates();
    // ***** DETENER TIMER DE ACTUALIZACIÓN *****
    stopElevationCountdown();

    // ***** ESTABLECER AVIÓN COMO EL SELECCIONADO *****
    elevationAircraftHex = planeHex;
    // ***** LLAMAR A LA FUNCIÓN QUE CALCULA EL ANCLA A 50NM *****
    elevationGroundAnchor = computeAnchorFromAircraft(plane, 50);

    // ***** SI NO SE PUEDE DETERMINAR EL ANCLA POR PROBLEMAS EN LOS DATOS DEL AVIÓN, MOSTRAR MENSAJE *****
    if (!elevationGroundAnchor) {
        showDistanceGuide(() => getTranslatedText('elevation_invalid_aircraft', 'The aircraft position is unavailable.'));
        return;
    }

    // ***** DIBUJAR ELEVACIÓN CONFORME AL ANCLA *****
    drawElevationGroundPoint(elevationGroundAnchor);
    // ***** ACTUALIZAR LÍNEA Y PUNTOS SEGÚN SE MUEVE EL AVIÓN *****
    updateElevationGroundAircraftDrawings(plane);
    // ***** INICIAR TIMER *****
    startElevationCountdown();

    // ***** SI LA FUNCIÓN ESTÁ DISPONIBLE, DIBUJAR EL PERFIL CONFORME EL AVIÓN SE MUEVE *****
    if (typeof getElevationProfileLine === 'function') {
        getElevationProfileLine(
            elevationGroundAnchor.lat,
            elevationGroundAnchor.lon,
            plane.position[1],
            plane.position[0]
        );
    }

    // ***** CADA 5 SEGUNDOS, ACTUALIZAR EL PERFIL *****
    elevationGroundAircraftUpdateInterval =
        setInterval(updateElevationGroundAircraftProfile, 5000);

    // ***** OCULTAR GUÍA *****
    hideDistanceGuide();
}

// ***** EXPONER FUNCIONES GLOBALMENTE PARA USO EN OTROS ARCHIVOS *****
window.updatePanoramaOverlayBounds = updatePanoramaOverlayBounds;
window.showPanoramaOverlay = showPanoramaOverlay;
window.hidePanoramaOverlay = hidePanoramaOverlay;
window.togglePanoramaMinimize = togglePanoramaMinimize;
window.getElevationProfileLine = getElevationProfileLine;
window.draw3DPanorama = draw3DPanorama;
window.initPanoramaObserver = initPanoramaObserver;
window.toggleElevationMode = toggleElevationMode;
window.startElevationGroundAircraft = startElevationGroundAircraft;
window.stopElevationGroundAircraftUpdates = stopElevationGroundAircraftUpdates;
window.computeAnchorFromAircraft = computeAnchorFromAircraft;
window.drawElevationGroundPoint = drawElevationGroundPoint;
window.startElevationCountdown = startElevationCountdown;
window.updateElevationCountdown = updateElevationCountdown;
window.stopElevationCountdown = stopElevationCountdown;
window.updateElevationGroundAircraftDrawings = updateElevationGroundAircraftDrawings;
window.handleElevationClick = handleElevationClick;
window.handleElevationGroundAircraftClick = handleElevationGroundAircraftClick;