// Some global variables are defined in early_2fb3798b27b8a81aea55bad8e31f020b.js
// early_2fb3798b27b8a81aea55bad8e31f020b.js takes care of getting some history files while the html page and
// some javascript libraries are still loading, hopefully speeding up loading


"use strict";
// Guarda los objetos de cada avión indexados por su identificador hex
g.planes = {};
// Lista ordenada de aviones (usar para iteraciones en orden)
g.planesOrdered = [];
// Caché de rutas consultadas
g.route_cache = [];
// Tareas pendientes para comprobar rutas
g.route_check_todo = {};
// Indicador de si ya hay una comprobación de ruta en curso
g.route_check_in_flight = false;
// Tiempo próximo permitido para una consulta de rutas
g.route_next_lookup = 0;
// Marca del último lookup de rutas
g.route_last_lookup = 0;
// Guarda la orientación del mapa (valor inicial proviene de otra parte)
g.mapOrientation = mapOrientation;

// Define our global variables
// Indica si la pestaña del navegador está oculta
let tabHidden = false;
// Activa el uso de WebGL para dibujar iconos
let webgl = false;
// Fuente de datos para features cuando se usa WebGL
let webglFeatures = new ol.source.Vector();
// Referencia a la capa WebGL (si se crea)
let webglLayer;
// Referencia al mapa OpenLayers
let OLMap = null;
// Proyección actual usada por OpenLayers
let OLProj = null;
// Extensión de la proyección (área visible máxima)
let OLProjExtent = null;
// Fuente para los iconos de avión cuando no se usa WebGL
let PlaneIconFeatures = new ol.source.Vector();
// Grupo que mantiene las capas de traza (pistas de vuelo)
let trailGroup = new ol.Collection();
// Capa para dibujar círculos alrededor del sitio (distancias)
let siteCircleLayer;
// Fuente para las features de los círculos del sitio
let siteCircleFeatures = new ol.source.Vector();
// Capa para el punto de ubicación del receptor / usuario
let locationDotLayer;
// Fuente para el punto de ubicación
let locationDotFeatures = new ol.source.Vector();
// Capa que contiene los iconos de las aeronaves
let iconLayer;
// Contenedor para las capas que dibujan trazas
let trailLayers;
// Arreglo con features para el mapa de calor
let heatFeatures = [];
// Cuántos sub‑grupos usar para distribuir el mapa de calor
let heatFeaturesSpread = 1024;
// Capas que renderizan el mapa de calor por segmentos
let heatLayers = [];
// Fuente con puntos "reales" para el heatmap (si se usa)
let realHeatFeatures = new ol.source.Vector();
// Capa heatmap real
let realHeat;
// Caché de imágenes/iconos ya creados
let iconCache = {};
// Cola temporal de iconos a cargar
let addToIconCache = [];
// Caché de estilos de línea por clave (ej: por altitud)
let lineStyleCache = {};
// Guarda aviones cargados desde un replay temporalmente
let replayPlanes = {};
// Objeto que contiene filtros aplicados a aeronaves (altitud, fuentes, etc.)
let PlaneFilter = {};
// Avión actualmente seleccionado (objeto)
let SelectedPlane = null;
// Alias/backup del avión seleccionado
let sp = null;
// Lista de aviones seleccionados
let SelPlanes = [];
// Indica si se han seleccionado todos los aviones
let SelectedAllPlanes = false;
// Avión actualmente resaltado por el cursor
let HighlightedPlane = null;
// Indica si la vista sigue al avión seleccionado
let FollowSelected = false;
// Posición de seguimiento (array [lon,lat]) usada al seguir
let followPos = [];
// Modo para medir distancia entre aviones activado
let distanceBetweenPlanesMode = false;
// Lista de aviones seleccionados para medir distancia
let selectedPlanesForDistance = [];
// Capa que dibuja la(s) línea(s) de distancia entre aviones
let distanceLineLayer = null;
// Feature única para la línea de distancia en modo simple
let distanceLineFeature = null;
// Overlay que muestra texto con la distancia
let distanceOverlay = null;
// Intervalo que actualiza la medición de distancia periódicamente
let distanceUpdateInterval = null;
// Plane-plane distance modes and storage for multiple pairs
let planeDistanceModeType = '1A1B';
const PP_MODES = ['1A1B', 'pairs'];
const PP_MAX_PAIRS = 3; // límite total de pares
let distanceLineFeaturesMap = new Map(); // key -> ol.Feature
let distanceOverlaysMap = new Map(); // key -> ol.Overlay
let selectedPlaneA = null; // anchor A when in anchor mode
let pairMap = new Map(); // key -> {a, b}
let pairOrder = []; // keep insertion order of keys
let pairBuffer = []; // temporary buffer for click pairing
// Per-pair missing signal tracking for plane-plane mode
let ppMissingSince = new Map();
let ppRemoved = new Set();
// Activa o desactiva el modo de medir distancia suelo‑avión
let distanceToGroundMode = false;
// Overlay que muestra la distancia entre el punto A y el avión
let distanceGroundOverlay = null;
// Intervalo que refresca la medición suelo‑avión
let distanceGroundUpdateInterval = null;
// Avión elegido como punto B para la medición
let selectedPlaneForGround = null;
// Coordenadas del punto A marcado en el suelo
let groundPointCoord = null;
// Fuente vectorial que guarda el punto A en el mapa
let groundPointSource = null;
// Capa que dibuja el punto A sobre el mapa
let groundPointLayer = null;
// Capa que dibuja la línea entre el punto A y el avión
let groundToPlaneLineLayer = null;
// Fuente vectorial de la línea A‑B
let groundToPlaneLineSource = null;
// Feature actual de la línea A‑B renderizada
let groundToPlaneLineFeature = null;
// Modo de medición por defecto
let distanceToGroundModeType = '1A1B';
// Arreglo para almacenar los hex/aviones seleccionados como punto B
let planesForGround = [];
// Arreglo para almacenar los puntos A marcados en el suelo
let groundPoints = [];
// Mapa que asocia cada avión con su feature de línea A‑B en modos multi‑B
const groundPlaneFeaturesByHex = new Map();
// Mapa que asocia cada avión con su overlay de distancia en modos multi‑B
const groundPlaneOverlaysByHex = new Map();
// Mapa genérico de features de líneas A‑B
const groundPlaneFeatures = new Map();
// Mapa genérico de overlays de distancia para cada par A‑B
const groundPlaneOverlays = new Map();
// Lista de pares A‑B acumulados en el modo nA_nB
let taPairs = [];
// Papa de Features por coordenada de punto A (lon,lat con 6 decimales)
const groundPointFeaturesByCoord = new Map();
// Guardar temporalmente el avión seleccionado a la espera de que se marque un punto A (modo nA_nB)
let taPendingPlaneHex = null;
// Guardar temporalmente el punto A marcado a la espera de que se seleccione un avión (modo nA_nB)
let taPendingGround = null;
// Modos de distancia tierra-aeronave
const TA_MODES = ['1A1B', '1A_nB', 'nA_1B', 'nA_nB'];
// Límite de cuántas aeronaves se pueden seleccionar en el modo 1A_nB
const TA_MAX_1A_nB = 3;
// Límite de cuantos puntos en tierra se pueden marcar en el modo nA_1B
const TA_MAX_nA_1B = 3;
// Límite de cuantos pares A-B se pueden acumular en el modo nA_nB
const TA_MAX_nA_nB = 3;
// Tiempo desde que cada par A‑B perdió señal
const groundPlaneMissingSince = new Map();
// Pares A‑B ya descartados tras perder señal
const groundPlaneRemoved = new Set();
// Flag del modo distancia tierra‑tierra
let groundToGroundMode = false;
// Modo activo por defecto
let groundToGroundModeType = '1A1B';
// Modos disponibles tierra‑tierra
const GG_MODES = ['1A1B', '1A_nB'];
// Límite de puntos B en modo 1A_nB
const GG_MAX_1A_nB = 3;
// Punto A actual en tierra
let ggPointA = null;
// Lista de puntos B marcados en tierra
let ggPointsB = [];
// Fuente vectorial de las líneas A‑B
let ggLineSource = null;
// Capa que dibuja las líneas A‑B
let ggLineLayer = null;
// Fuente vectorial de los puntos A y B
let ggPointSource = null;
// Capa que dibuja los puntos A y B
let ggPointLayer = null;
// Features de línea por cada par A‑B
const ggLineFeatures = new Map();
// Overlays de distancia por cada par A‑B
const ggOverlays = new Map();
// Intervalo de refresco del modo tierra‑tierra
let ggUpdateInterval = null;
// Indicar si está activo el modo de elevación (panorama) en el mapa.
let elevationMode = false;
// Fuente vectorial para los puntos del modo elevación (A y B).
let elevationPointSource = null;
// Capa que renderiza los puntos del modo elevación en el mapa.
let elevationPointLayer = null;
// Fuente vectorial para la línea A‑B del modo elevación.
let elevationLineSource = null;
// Capa que renderiza la línea A‑B del modo elevación en el mapa.
let elevationLineLayer = null;
// Últimos datos del perfil de elevación, usados para redibujar al cambiar tamaño.
let lastPanoramaData = null;
// Distancia total del perfil en millas náuticas.
let lastPanoramaTotalNm = null;
// Observer para redimensionar el panorama cuando cambia el contenedor.
let panoramaResizeObs = null;
// Indicar si hay una consulta de panorama en curso
let elevationBusy = false;
// Tiempo (ms) en que empezó la carga de la página
let loadStart = new Date().getTime();
// Temporizador para redimensionar el mapa (se usa para agrupar eventos)
let mapResizeTimeout;
// Temporizador para movimiento del puntero (debounce)
let pointerMoveTimeout;
// Tamaño actual de los iconos
let iconSize = 1;
// Mostrar información extra para depurar trazas
let debugTracks = false;
// Más detalles en la depuración de actualización de trazas
let verboseUpdateTrack = false;
// Activar toda la depuración
let debugAll = false;
// Mostrar etiquetas en las trazas
let trackLabels = false;
// Permitir selección múltiple de aviones
let multiSelect = false;
// Datos recibidos desde la fuente UAT (978 MHz)
let uat_data = null;
// Si se muestran etiquetas en el mapa
g.enableLabels = false;
// Nivel de detalle extendido de etiquetas
g.extendedLabels = 0;
// Indica si el mapa está visible en la UI
let mapIsVisible = true;
// Filtrar solo aviones militares
let onlyMilitary = false;
// Mostrar sólo aviones seleccionados
let onlySelected = false;
// Flag de depuración genérica
let debug = false;
// Depuración para saltos a aviones
let debugJump = false;
// Hex para saltar a un avión (si se solicita)
let jumpTo = null;
// Ignorar MLAT si es verdadero
let noMLAT = false;
// Evitar que aviones "desaparezcan" por inactividad
let noVanish = false;
// Filtrar trazas por altitud en vez de aviones enteros
let filterTracks = false; // altitude filter: don't filter planes but rather their tracks by altitude
// Timestamp de cuándo se detectó que un par de aviones perdió señal
let planesMissingSince = null;
// ID del refresco actual
let refreshId = 0;
// Última vez que se pidió datos
let lastFetch = 0;
// Objeto para datos del contorno real (si se usa)
let actualOutline = {};
// Índice de tiempo por tile del globo (ahora)
let globeIndexNow = {};
// Distancia calculada por tile para ordenamiento
let globeIndexDist = {};
// Lookup de tiles especiales del globo
let globeIndexSpecialLookup = {};
// Cuántas tiles del globo se están viendo
let globeTilesViewCount = 0;
// Límite base de filas en la tabla del globo
let globeTableLimitBase = 80;
// Límite actual de filas en la tabla del globo
let globeTableLimit = 80;
// Contador de peticiones realizadas
let fetchCounter = 0;
// Última extensión de globo calculada
let lastGlobeExtent;
// Última extensión renderizada
let lastRenderExtent;
// Cuántas peticiones pendientes hay
let pendingFetches = 0;
// Marca si fue la primera petición hecha
let firstFetch = true;
// Contador de depuración genérico
let debugCounter = 0;
// Ruta de la página (limpia de barras extra)
let pathName = window.location.pathname.replace(/\/+/, '/') || "/";
// Filtro de fuentes activo
let sourcesFilter = null;
// Lista de fuentes de datos disponibles (orden interno)
let sources = ['adsb', ['uat', 'adsr'], 'mlat', 'tisb', 'modeS', 'other', 'adsc', 'ais'];
// Filtro por banderas (por ejemplo: military)
let flagFilter = null;
// Valores posibles para flagFilter
let flagFilterValues = ['military', 'pia', 'ladd'];
// Estado del modo "mostrar trazas"
let showTrace = false;
// Indicador para salir del modo traza
let showTraceExit = false;
// Indica si antes de entra en modo traza había aislamiento activo
let showTraceWasIsolation = false;
// Timestamp concreto a mostrar en modo traza
let showTraceTimestamp = null;
// Fecha seleccionada para trazas
let traceDate = null;
// Overlay de guía para usar el modo distancia suelo‑avión
let distanceGuideEl = null;
// Fecha en string para la URL / UI
let traceDateString = null;
// Opciones y parámetros del modo traza
let traceOpts = {};
// Parámetro ICAO pasado por URL
let icaoParam = null;
// Nuevo ancho para dibujar líneas (se calcula después)
let newWidth = lineWidth;
// Indica si la posición del sitio fue forzada por parámetros (override)
let SiteOverride = (SiteLat != null && SiteLon != null);
// Valor temporal cuando se solicita un "jump" desde la UI
let onJumpInput = null;
// Variables de estilos para textos y etiquetas (llenadas más adelante)
let labelFill = null;
let blackFill = null;
let labelStroke = null;
let labelStrokeNarrow = null;
let bgFill = null;
// Selección de leg para trazas históricas (-1 = todos)
let legSel = -1;
// Función para declinar la declinación magnética (rellenada luego)
let geoMag = null;
// Modo especial que evita filtros en trazas
let solidT = false;
// Última interacción del usuario (ms)
let lastActive = new Date().getTime();
// Capas activas (overlays) que se deben mostrar por defecto
let enableOverlays = [];
let halloween = false;
// Mostrar sólo aviones con matrícula
let noRegOnly = false;
// Fuerza una actualización inmediata
let triggerRefresh = 0;
// Indica si ya se dibujó por primera vez
let firstDraw = true;
// Colores más oscuros para el tema
let darkerColors = false;
// Auto selección activa
let autoselect = false;
// Mostrar solo aviones sin GPS
let nogpsOnly = false;
// URL de sprites generada en tiempo de ejecución
let spritesDataURL = null;
// Solo traza histórica (sin posiciones actuales)
let trace_hist_only = false;
// Forzar trazas de alta resolución
let traces_high_res = false;
// Mostrar ID del receptor en la UI
let show_rId = true;
// Etiquetas arriba en la lista
let labels_top = false;
// Forzar que el punto del receptor quede centrado
let lockDotCentered = false;
// Forzar tipo de mapa desde parámetros
let overrideMapType = null;
// Ajustes de contraste y atenuado por mapa
let layerMoreContrast = false;
let layerDimFactor = 0;
let layerExtraContrast = 0;
// Incluir filtros en la URL compartida
let shareFiltersParam = false;
// Tamaño de la última petición recibida (bytes)
let lastRequestSize = 0;
// Caja de petición anterior (string)
let lastRequestBox = '';
// Próximo índice de consulta para selección
let nextQuerySelected = 0;
// Activar cache-busting dinámico
let enableDynamicCachebusting = false;
// Intervalo de refresco almacenado globalmente
g.lastRefreshInt = 1000;
// Tiempo (s) hasta "reap" por defecto (dependiendo de globeIndex)
let reapTimeout = globeIndex ? 240 : 480;
// Valor de referencia de presión atmosférica para correcciones barométricas
let baroCorrectQNH = 1013.25;
// Límite de actualizaciones (si se quiere forzar)
let limitUpdates = -1;
// Ancho base del bloque de información lateral
let infoBlockWidth = baseInfoBlockWidth;
// Buffer adicional para renderizar fuera de pantalla
const renderBuffer = 60;
// Enlace para compartir el estado actual
let shareLink = '';
// Centro del mapa por defecto (lat/lon)
let CenterLat = 0;
let CenterLon = 0;
// Nivel de zoom actual
g.zoomLvl = 5;
g.zoomLvlCache;
// Contadores de aviones y posiciones
let TrackedAircraft = 0;
let globeTrackedAircraft = 0;
let TrackedAircraftPositions = 0;
let TrackedHistorySize = 0;
let aircraftShown = 0;
// Posición del sitio (lon,lat) si está conocida
let SitePosition = null;
// timestamps
// timestamps para datos en vivo y UAT
let now = 0;
let last = 0;
let uat_now = 0;
let uat_last = 0;
// Colas de peticiones pendientes
let FetchPending = [];
let FetchPendingUAT = null;
// Historial de conteo de mensajes para calcular tasa
let MessageCountHistory = [];
let MessageRate = 0;
// Contenedores de capas del mapa
let layers;
let layers_group;
// Estilo nulo para reutilizar
const nullStyle = new ol.style.Style({});
// Estilos que se definirán más adelante para trazas y fallos
let estimateStyle;
let estimateStyleSlim;
let badLine;
let badLineMlat;
let badDot;
let badDotMlat;
// Indica si la barra de replay se está mostrando
let showingReplayBar = false;
// Calcula la distancia "haversine" entre dos puntos y la devuelve en NM
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

// Configuración del perfil de elevación
const ELEV_CONFIG = {
    // Número de muestras
    samples: 20,
    // Endpoint CGI a consultar
    cgiUrl: `${window.location.origin}/cgi-bin/get_elevation.sh`
};

// Mostrar overlay con el panorama generado
function showPanoramaOverlay() {
    const el = document.getElementById('panorama-overlay');
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.remove('minimized');

    const btn = document.getElementById('panorama-close');
    if (btn) btn.textContent = '×';

    updatePanoramaOverlayBounds();
}

// Actualizar el tamaño del overlay del panorama según los menús abiertos
function updatePanoramaOverlayBounds() {
    const overlay = document.getElementById('panorama-overlay');
    const map = document.getElementById('map_container');
    if (!overlay || !map) return;

    // Si el mapa está oculto, ocultar overlay
    if (map.style.display === 'none') {
        overlay.classList.add('hidden');
        return;
    }

    const mapRect = map.getBoundingClientRect();
    let left = 10;
    let right = 10;
    let bottom = 10;

    // Evitar tapar el infoblock (izquierda)
    const info = document.getElementById('selected_infoblock');
    if (info && info.offsetParent !== null) {
        const r = info.getBoundingClientRect();
        if (r.right > mapRect.left && r.left < mapRect.right) {
            left = Math.max(left, (r.right - mapRect.left) + 10);
        }
    }

    // Evitar tapar replayBar (abajo)
    const replay = document.getElementById('replayBar');
    if (replay && replay.offsetParent !== null && getComputedStyle(replay).display !== 'none') {
        const r = replay.getBoundingClientRect();
        if (r.top < mapRect.bottom && r.bottom > mapRect.top) {
            bottom = Math.max(bottom, (mapRect.bottom - r.top) + 10);
        }
    }

    overlay.style.left = left + 'px';
    overlay.style.right = right + 'px';
    overlay.style.bottom = bottom + 'px';
}

window.addEventListener('resize', updatePanoramaOverlayBounds);

// Minimizar overlay del panorama
function togglePanoramaMinimize() {
    const el = document.getElementById('panorama-overlay');
    if (!el) return;
    el.classList.toggle('minimized');
    const btn = document.getElementById('panorama-close');
    if (btn) btn.textContent = el.classList.contains('minimized') ? '+' : '×';
}

// Ocultar overlay del panorama
function hidePanoramaOverlay() {
    const el = document.getElementById('panorama-overlay');
    if (el) el.classList.add('hidden');
    const c = document.getElementById('panorama-container');
    if (c) c.innerHTML = '';
}

// Minimizar panorama al hacer click en el botón con clase "panorama-close"
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('panorama-close');
    if (btn) btn.addEventListener('click', togglePanoramaMinimize);
});

// Realizar un fetch con timeout usando AbortController para cancelar si se excede el tiempo.
function elevFetchWithTimeout(url, ms = 8000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

// Limitar la cantidad de promesas en ejecución simultánea usando una cola.
function elevPLimit(concurrency) {
    let active = 0;
    const queue = [];
    const next = () => {
        if (active >= concurrency || queue.length === 0) return;
        active++;
        const { fn, resolve, reject } = queue.shift();
        fn().then(resolve, reject).finally(() => {
            active--;
            next();
        });
    };
    return (fn) => new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        next();
    });
}

// Distancia en millas naúticas (eje X)
function distanceNm(lat1, lon1, lat2, lon2) {
    const R = 6371 / 1.852;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Distancia en pies (eje Y)
function mToFt(m) {
    return m * 3.28084;
}

// Interpolar linealmente entre dos puntos (lat/lon) según el factor t (0..1).
function interpolateLine(lat1, lon1, lat2, lon2, t) {
    return {
        lat: lat1 + (lat2 - lat1) * t,
        lon: lon1 + (lon2 - lon1) * t
    };
}

// Caché de elevaciones para evitar consultas repetidas.
const elevCache = new Map();

// Generar una clave estable a partir de lat/lon con 5 decimales.
function elevKey(lat, lon) {
    return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

// Obtener el perfil de elevación entre dos puntos y dibujar el panorama
async function getElevationProfileLine(lat1, lon1, lat2, lon2) {
    if (elevationBusy) {
        showDistanceGuide('Espere a que termine el panorama anterior...');
        return;
    }
    elevationBusy = true;
    showDistanceGuide('Generando panorama...');

    const urlBase = `${ELEV_CONFIG.cgiUrl}?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&samples=${ELEV_CONFIG.samples}`;

    try {
        const cacheKey = `${lat1.toFixed(5)},${lon1.toFixed(5)}|${lat2.toFixed(5)},${lon2.toFixed(5)}|${ELEV_CONFIG.samples}`;
        const cached = elevCache.get(cacheKey);
        if (cached) {
            draw3DPanorama(cached.points, cached.totalNm);
            return;
        }

        const res = await fetch(urlBase);
        const data = await res.json();

        if (!data.points || !data.points.length) {
            console.warn('Sin datos de relieve para dibujar.');
            return;
        }

        for (const p of data.points) {
            if (p.distNm == null && p.distKm != null) {
                p.distNm = p.distKm / 1.852;
            }
        }

        const totalNm = data.points[data.points.length - 1].distNm || distanceNm(lat1, lon1, lat2, lon2) / 1.852;
        elevCache.set(cacheKey, { points: data.points, totalNm });

        showPanoramaOverlay();
        draw3DPanorama(data.points, totalNm);
    } catch (e) {
        console.error('Error en batch elevation:', e);
    } finally {
        elevationBusy = false;
        hideDistanceGuide();
    }
}

// Dibujar el panorama en SVG usando D3.
function draw3DPanorama(data, totalNm) {
    lastPanoramaData = data;
    lastPanoramaTotalNm = totalNm;
    const container = document.getElementById('panorama-container');
    if (!container) return;
    container.innerHTML = '';

    // Dimensiones del gráfico y márgenes.
    const width = container.offsetWidth || 800;
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    // Crear el SVG donde se renderiza el perfil.
    const svg = d3.select("#panorama-container")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "none")
        .style("width", "100%")
        .style("height", "100%");

    // Eje X: distancia total en millas náuticas.
    const x = d3.scaleLinear()
        .domain([0, totalNm])
        .range([margin.left, width - margin.right]);

    // Eje Y: altitud máxima con margen extra.
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => mToFt(d.alt)) * 1.1])
        .range([height - margin.bottom, margin.top]);

    // Área del panorama (distancia vs altitud).
    const area = d3.area()
        .x(d => x(d.distNm))
        .y0(y(0))
        .y1(d => y(mToFt(d.alt)))
        // .curve(d3.curveBasis);
        .curve(d3.curveLinear);

    // Dibujar el área del relieve.
    svg.append("path")
        .datum(data)
        .attr("fill", "rgba(100, 100, 100, 0.7)")
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .attr("d", area);

    // Eje X con etiqueta de distancia.
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d.toFixed(0)} NM`));

    // Eje Y con etiqueta de altitud.
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d.toFixed(0)} ft`));

    // Redibujar cuando cambie el tamaño del contenedor
    if (!panoramaResizeObs && window.ResizeObserver) {
        panoramaResizeObs = new ResizeObserver(() => {
            if (lastPanoramaData && lastPanoramaTotalNm != null) {
                draw3DPanorama(lastPanoramaData, lastPanoramaTotalNm);
            }
        });
        panoramaResizeObs.observe(container);
    }
}

// Activar/desactivar modo Elevación (panorama)
function toggleElevationMode() {
    elevationMode = !elevationMode;
    buttonActive('#ELEV', elevationMode);

    if (elevationMode) {
        showDistanceGuide('Haga clic en el mapa para elegir un punto.');

        if (SiteLat != null && SiteLon != null && elevationPointSource) {
            elevationPointSource.clear();
            elevationPointSource.addFeature(
                new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([SiteLon, SiteLat])))
            );
            elevationPointLayer && elevationPointLayer.setVisible(true);
        }
        elevationLineSource && elevationLineSource.clear();
        elevationLineLayer && elevationLineLayer.setVisible(false);
    } else {
        hideDistanceGuide();
        hidePanoramaOverlay();
        elevationPointSource && elevationPointSource.clear();
        elevationLineSource && elevationLineSource.clear();
        elevationPointLayer && elevationPointLayer.setVisible(false);
        elevationLineLayer && elevationLineLayer.setVisible(false);

    }
}
// Actualizar línea de distancia en modo aeronave-aeronave
function updateDistanceLine() {
    if (!distanceBetweenPlanesMode) return;

    // Modo 1A1B: comportamiento original (solo un par)
    if (planeDistanceModeType === '1A1B') {
        if (selectedPlanesForDistance.length !== 2) return;

        let p1 = selectedPlanesForDistance[0];
        let p2 = selectedPlanesForDistance[1];

        let plane1 = g.planes[p1.hex];
        let plane2 = g.planes[p2.hex];
        // ----------------------------------------------
        // 1. El avión no existe en g.planes
        // 2. El avión no tiene posición o altitud
        // 3. El avión no ha reportado nada en los últimos 15 segundos (plane.seen > 15)
        let isPlane1Lost = !plane1 || !plane1.position || plane1.seen > 15;
        let isPlane2Lost = !plane2 || !plane2.position || plane2.seen > 15;

        const key = `${p1.hex}|${p2.hex}`;

        if (isPlane1Lost || isPlane2Lost) {
            if (ppRemoved.has(key)) {
                // If already removed, ignore until plane revives
                return;
            }

            if (!ppMissingSince.has(key)) {
                ppMissingSince.set(key, Date.now());
                console.log("Señal inactiva o perdida detectada para par:", key);
            }

            let secondsMissing = (Date.now() - ppMissingSince.get(key)) / 1000;

            // Durante la espera, podemos avisar en el cartel
            if (!distanceOverlay) {
                let element = document.createElement('div');
                element.id = 'distance-label-tag';
                element.style.background = 'rgba(255, 255, 255, 0.8)';
                element.style.border = '1px solid black';
                element.style.padding = '5px';
                element.style.fontSize = '12px';
                element.style.color = 'black';
                element.style.pointerEvents = 'none';

                distanceOverlay = new ol.Overlay({ element: element, positioning: 'bottom-center', offset: [0, -10] });
                OLMap.addOverlay(distanceOverlay);
            }
            distanceOverlay.getElement().innerHTML = `<b style="color:red;">SEÑAL PERDIDA</b><br>Reintentando... ${Math.ceil(15 - secondsMissing)}s`;

            if (secondsMissing >= 15) {
                // For single-pair mode, reset everything; for multi, mark removed
                if (planeDistanceModeType === '1A1B') {
                    ppMissingSince.delete(key);
                    resetDistanceCalculation();
                } else {
                    ppMissingSince.delete(key);
                    ppRemoved.add(key);
                    // remove any existing feature/overlay for this key
                    const feat = distanceLineFeaturesMap.get(key);
                    if (feat) {
                        distanceLineLayer.getSource().removeFeature(feat);
                        distanceLineFeaturesMap.delete(key);
                    }
                    const ov = distanceOverlaysMap.get(key);
                    if (ov) {
                        OLMap && OLMap.removeOverlay(ov);
                        distanceOverlaysMap.delete(key);
                    }
                    // remove from selectedPlanesForDistance list any matching hex
                    selectedPlanesForDistance = selectedPlanesForDistance.filter(p => `${selectedPlaneA}|${p.hex}` !== key && `${p.hex}|${selectedPlaneA}` !== key);
                }
            }

            return;
        }
        // ----------------------------------------------

        planesMissingSince = null;

        let coords1 = plane1.position;
        let coords2 = plane2.position;

        // Calcular distancia y diferencia de altitud con seguridad
        let distance = haversineDistance(coords1[1], coords1[0], coords2[1], coords2[0]);
        let altDiff = Math.abs(plane1.altitude - plane2.altitude);

        // Actualizar o crear la línea
        let lineCoords = [ol.proj.fromLonLat(coords1), ol.proj.fromLonLat(coords2)];
        if (!distanceLineFeature) {
            distanceLineFeature = new ol.Feature({
                geometry: new ol.geom.LineString(lineCoords)
            });
            distanceLineLayer.getSource().addFeature(distanceLineFeature);
        } else {
            distanceLineFeature.getGeometry().setCoordinates(lineCoords);
        }

        // Actualizar o crear el Cartel (Overlay)
        let midPoint = [(coords1[0] + coords2[0]) / 2, (coords1[1] + coords2[1]) / 2];
        let midPointProj = ol.proj.fromLonLat(midPoint);

        if (!distanceOverlay) {
            let element = document.createElement('div');
            element.id = 'distance-label-tag'; // ID para limpieza forzada
            element.style.background = 'rgba(255, 255, 255, 0.8)';
            element.style.border = '1px solid black';
            element.style.padding = '5px';
            element.style.fontSize = '12px';
            element.style.color = 'black';
            element.style.pointerEvents = 'none';

            distanceOverlay = new ol.Overlay({
                element: element,
                positioning: 'bottom-center',
                offset: [0, -10]
            });
            OLMap.addOverlay(distanceOverlay);
        }

        // Actualizamos el texto solo si tenemos números válidos
        distanceOverlay.getElement().innerHTML = `Dist: ${distance.toFixed(2)} NM<br>Alt Diff: ${altDiff} ft`;
        distanceOverlay.setPosition(midPointProj);
        return;
    }

    // Modo 1A_nB: un avión A contra varios B (hasta PP_MAX_1A_nB)
    if (planeDistanceModeType === 'pairs') {
        // iterate over pairMap and draw/update each pair
        if (!pairMap.size) return;

        const activeKeys = new Set();
        for (const key of pairOrder) {
            if (!pairMap.has(key)) continue;
            activeKeys.add(key);
            const { a: hexA, b: hexB } = pairMap.get(key);
            const planeA = g.planes[hexA];
            const planeB = g.planes[hexB];

            const missingA = !planeA || !planeA.position;
            const missingB = !planeB || !planeB.position;
            const isStale = missingA || missingB || (planeA && planeA.seen > 15) || (planeB && planeB.seen > 15);

            if (ppRemoved.has(key)) {
                // skip until revived
                if (!isStale) ppRemoved.delete(key);
                else continue;
            }

            if (isStale) {
                if (!ppMissingSince.has(key)) ppMissingSince.set(key, Date.now());
                const started = ppMissingSince.get(key);
                const secondsMissing = (Date.now() - started) / 1000;
                const remaining = Math.max(0, Math.ceil(15 - secondsMissing));

                let ov = distanceOverlaysMap.get(key);
                if (!ov) {
                    const el = document.createElement('div');
                    Object.assign(el.style, { background: 'rgba(255,255,255,0.85)', border: '1px solid #000', padding: '6px', fontSize: '12px', color: '#000', pointerEvents: 'none' });
                    ov = new ol.Overlay({ element: el, positioning: 'bottom-center', offset: [0, -10] });
                    OLMap && OLMap.addOverlay(ov);
                    distanceOverlaysMap.set(key, ov);
                }
                ov.getElement().innerHTML = `<b style="color:red;">SEÑAL PERDIDA</b><br>Reintentando... ${remaining}s`;
                ov.setOffset(stableOverlayOffset(key));
                // position overlay at available point if any, else skip
                if (planeA && planeA.position) ov.setPosition(ol.proj.fromLonLat(planeA.position));

                if (secondsMissing >= 15) {
                    ppMissingSince.delete(key);
                    ppRemoved.add(key);
                    const feat = distanceLineFeaturesMap.get(key);
                    if (feat) {
                        distanceLineLayer.getSource().removeFeature(feat);
                        distanceLineFeaturesMap.delete(key);
                    }
                    OLMap && ov && OLMap.removeOverlay(ov);
                    distanceOverlaysMap.delete(key);
                    // remove pair
                    pairMap.delete(key);
                    pairOrder = pairOrder.filter(k => k !== key);
                }
                continue;
            }

            ppMissingSince.delete(key);

            // both available: draw
            const coordsA = planeA.position;
            const coordsB = planeB.position;
            const distance = haversineDistance(coordsA[1], coordsA[0], coordsB[1], coordsB[0]);
            const altDiff = Math.abs((planeA.altitude || 0) - (planeB.altitude || 0));

            const lineCoords = [ol.proj.fromLonLat(coordsA), ol.proj.fromLonLat(coordsB)];
            let feat = distanceLineFeaturesMap.get(key);
            if (!feat) {
                feat = new ol.Feature({ geometry: new ol.geom.LineString(lineCoords) });
                distanceLineLayer.getSource().addFeature(feat);
                distanceLineFeaturesMap.set(key, feat);
            } else {
                feat.getGeometry().setCoordinates(lineCoords);
            }

            let ov = distanceOverlaysMap.get(key);
            if (!ov) {
                const el = document.createElement('div');
                Object.assign(el.style, { background: 'rgba(255,255,255,0.85)', border: '1px solid #000', padding: '6px', fontSize: '12px', color: '#000', pointerEvents: 'none' });
                ov = new ol.Overlay({ element: el, positioning: 'bottom-center', offset: [0, -10] });
                OLMap && OLMap.addOverlay(ov);
                distanceOverlaysMap.set(key, ov);
            }
            const midPoint = [(coordsA[0] + coordsB[0]) / 2, (coordsA[1] + coordsB[1]) / 2];
            ov.getElement().innerHTML = `Dist: ${distance.toFixed(2)} NM<br>Alt Diff: ${altDiff} ft`;
            ov.setPosition(ol.proj.fromLonLat(midPoint));
        }

        // cleanup features/overlays for keys not active
        for (const [k, feat] of distanceLineFeaturesMap) {
            if (!pairMap.has(k)) {
                try { distanceLineLayer.getSource().removeFeature(feat); } catch (_) { }
                distanceLineFeaturesMap.delete(k);
            }
        }
        for (const [k, ov] of distanceOverlaysMap) {
            if (!pairMap.has(k)) {
                OLMap && OLMap.removeOverlay(ov);
                distanceOverlaysMap.delete(k);
            }
        }
    }
}

// Crear o actualizar el punto A en el mapa
function setGroundPoint(lonlat) {
    // Guardar las coordenadas del punto A
    groundPointCoord = lonlat;

    // Crear la fuente y capa del punto A si aún no existen
    if (!groundPointSource) {
        groundPointSource = new ol.source.Vector();
        groundPointLayer = new ol.layer.Vector({
            name: 'groundPoint',
            type: 'overlay',
            title: 'Punto A',
            source: groundPointSource,
            zIndex: 250,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: '#222' }),
                    stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
                })
            })
        });
    }
    // Limpiar cualquier punto previo y marcar el nuevo
    groundPointSource.clear();
    const f = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)));
    groundPointSource.addFeature(f);

    // Si el mapa ya está creado y el punto no está añadido, se añade
    if (groundPointLayer && OLMap) {
        const exists = OLMap.getLayers().getArray().includes(groundPointLayer);
        if (!exists) OLMap.addLayer(groundPointLayer);
    }

    // Asegurar que la capa esté visible al colocar el punto
    if (groundPointLayer) groundPointLayer.setVisible(true);

}

// Paso 1 de los tooltips según el modo (tierra-aeronave)
function taStep1Message() {
    switch (distanceToGroundModeType) {
        case '1A1B':
            return 'Haga clic en el mapa para marcar el punto A.';
        case '1A_nB':
            return 'Haga clic en el mapa para marcar un único punto A.';
        case 'nA_1B':
            return 'Haga clic en el mapa para marcar varios puntos A.';
        case 'nA_nB':
            return 'Haga clic en el mapa para marcar el punto A.';
        default:
            return 'Haga clic en el mapa para marcar el Punto A.';
    }
}

// Paso 2 de los tooltips según el modo (tierra-aeronave)
function taStep2Message() {
    switch (distanceToGroundModeType) {
        case '1A1B':
            return 'Haga clic sobre un avión para marcar el Punto B.';
        case '1A_nB':
            return 'Haga clic sobre uno o más aviones para marcar varios puntos B.';
        case 'nA_1B':
            return 'Haga clic sobre un avión para marcar un único punto B.';
        case 'nA_nB':
            return 'Haga clic sobre un avión para marcar el Punto B.';
        default:
            return 'Haga clic sobre un avión para marcar el Punto B.';
    }
}

// Mensaje según el modo (tierra-aeronave)
function taPreMessage() {
    switch (distanceToGroundModeType) {
        case '1A1B': return 'Modo 1 Punto - 1 Avión';
        case '1A_nB': return 'Modo 1 Punto - Varios Aviones';
        case 'nA_1B': return 'Modo Varios Puntos - 1 Avión';
        case 'nA_nB': return 'Modo Varios Puntos - Varios Aviones';
        default: return '';
    }
}

// Mensaje según el modo (tierra-tierra)
function ggPreMessage() {
    return groundToGroundModeType === '1A_nB'
        ? 'Modo 1 Punto - Varios Puntos'
        : 'Modo 1 Punto - 1 Punto';
}

// Paso 1 guía (tierra-tierra)
function ggStep1Message() {
    return groundToGroundModeType === '1A_nB'
        ? 'Marca un único Punto A en tierra.'
        : 'Marca el Punto A en tierra.';
}

// Paso 2 guía (tierra-tierra)
function ggStep2Message() {
    return groundToGroundModeType === '1A_nB'
        ? 'Marca hasta 3 puntos B en tierra.'
        : 'Marca el Punto B en tierra.';
}

// Limpiar puntos, líneas y overlays en el modo tierra-aeronave
function clearTAGroundDrawings(opts = {}) {

    // Limpiar la fuente vectorial del punto A si existe
    try { groundPointSource && groundPointSource.clear() } catch (_) {}

    // Limpiar referencias indexadas a Features de puntos A
    try { groundPointFeaturesByCoord && groundPointFeaturesByCoord.clear() } catch (_) {}

    // Vaciar la fuente de líneas A‑B 
    try { groundToPlaneLineSource && groundToPlaneLineSource.clear() } catch (_) {}

    // Resetear referencia a la feature de la línea actual
    groundToPlaneLineFeature = null;

    // Eliminar y limpiar todos los overlays A‑B
    if (groundPlaneOverlays && groundPlaneOverlays.size) {
        groundPlaneOverlays.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
        groundPlaneOverlays.clear();
    }
    if (typeof groundPlaneOverlaysByHex !== 'undefined' && groundPlaneOverlaysByHex.size) {
        groundPlaneOverlaysByHex.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
        groundPlaneOverlaysByHex.clear();
    }

    // Eliminar el overlay único de distancia suelo‑avión si existe
    if (distanceGroundOverlay) {
        try { distanceGroundOverlay.setPosition(undefined); } catch (_) { }
        try { OLMap && OLMap.removeOverlay(distanceGroundOverlay); } catch (_) { }
        distanceGroundOverlay = null;
    }

    // Limpiar el mapa genérico de features de líneas A‑B si existe
    try { groundPlaneFeatures && groundPlaneFeatures.clear(); } catch (_) {}
    try { typeof groundPlaneFeaturesByHex !== 'undefined' && groundPlaneFeaturesByHex.clear(); } catch (_) {}

    // Resetear variables según opción
    if (opts.reset !== false) {
        selectedPlaneForGround = null;
        groundPointCoord = null;
        groundPoints = [];
        planesForGround = [];
        taPairs = [];
        taPendingPlaneHex = null;
        taPendingGround = null;
        try { groundPlaneMissingSince && groundPlaneMissingSince.clear(); } catch (_) {}
        try { groundPlaneRemoved && groundPlaneRemoved.clear(); } catch (_) {}
    }

    // Detener refresco de distancia si está activo
    if (distanceGroundUpdateInterval) {
        clearInterval(distanceGroundUpdateInterval);
        distanceGroundUpdateInterval = null;
    }
}

// Limpiar puntos, líneas y overlays en el modo tierra-tierra
function clearGroundToGround(opts = {}) {

    // Borrar las líneas A‑B
    try { ggLineSource && ggLineSource.clear(); } catch (_) { }
    // Borrar los puntos A y B
    try { ggPointSource && ggPointSource.clear(); } catch (_) { }
    
    // Limpiar overlays y colección de features
    try { ggLineFeatures && ggLineFeatures.clear(); } catch (_) { }
    if (ggOverlays && ggOverlays.size) {
        ggOverlays.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
        try { ggOverlays.clear(); } catch (_) { }
    }

    // Si se pide reset completo:
    if (opts.reset !== false) {
        // Olvidar el punto A
        ggPointA = null;
        // Olvidar la lista de puntos B
        ggPointsB = [];
    }
    // Detener refresco periódico
    if (ggUpdateInterval) {
        clearInterval(ggUpdateInterval);
        ggUpdateInterval = null;
    }
}

// Ciclar cada modo según click en el botón (tierra-aeronave)
function onTACycleClick() {
    // Si está apagado, activarlo en el primer modo
    if (!distanceToGroundMode) {
        // Seleccionar el modo inicial (1A1B)
        distanceToGroundModeType = TA_MODES[0];
        // Encender el modo de distancia suelo‑avión
        DistanceToGround();
        // Si el modo tierra-tierra está activo, apagarlo
        if (groundToGroundMode) DistanceGroundToGround();
        return;
    }

    // Ubicar el modo actual en la lista
    const idx = TA_MODES.indexOf(distanceToGroundModeType);
    // Si no es el último modo disponible, avanzar al siguiente
    if (idx >= 0 && idx < TA_MODES.length - 1) {
        distanceToGroundModeType = TA_MODES[idx + 1];

        // Limpiar puntos, líneas y overlays previos
        clearTAGroundDrawings();

        // Mostrar nombre del modo activo y guía paso 1
        showDistanceGuide(`<center>${taPreMessage()}</center><br>${taStep1Message()}`);
        // Refrescar la medición según el nuevo modo
        updateDistanceToGroundOverlay();
    } else {
        // Si es el último modo, apagar la función
        DistanceToGround();
    }
}

// Ciclar cada modo según click en el botón (tierra-tierra)
function onTTCycleClick() {
    // Si está apagado, encenderlo en el primer modo
    if (!groundToGroundMode) {
        // Seleccionar el modo inicial (1A1B)
        groundToGroundModeType = GG_MODES[0];
        // Activar el modo tierra‑tierra
        DistanceGroundToGround();
        return;
    }

    // Posición del modo actual en la lista
    const idx = GG_MODES.indexOf(groundToGroundModeType);
    // Si no es el último modo disponible, pasar al siguiente modo
    if (idx >= 0 && idx < GG_MODES.length - 1) {
        groundToGroundModeType = GG_MODES[idx + 1];
        // Limpiar puntos, líneas y overlays previos
        clearGroundToGround();

        // Asegurar que la capa de puntos esté visible
        if (ggPointLayer) ggPointLayer.setVisible(true);

        // Mostrar nombre del modo activo y guía paso 1
        showDistanceGuide(`<center>${ggPreMessage()}</center><br>${ggStep1Message()}`);
        // Refrescar la medición con el nuevo modo
        updateGroundToGroundOverlay();
    } else {
        // Apagar el modo tierra‑tierra
        DistanceGroundToGround();
    }
}
// Devuelve un pequeño desplazamiento reproducible para un identificador, para que carteles cercanos no se solapen
function stableOverlayOffset(key) {
    // Deterministic, small scatter around the anchor to avoid overlap
    let h = 0;
    for (let i = 0; i < key.length; i++) {
        h = (h * 31 + key.charCodeAt(i)) >>> 0;
    }
    const dx = (h % 7 - 3) * 12;                // -36 .. +36 px
    const dy = -10 - (Math.floor(h / 7) % 3) * 14; // -10, -24, -38 px
    return [dx, dy];
}

// Función para actualizar la medición de distancia suelo‑avión
function updateDistanceToGroundOverlay() {

    // Si la capa de líneas está creada pero el usuario la ocultó, no crear ni volver a añadir overlays.
    if (groundToPlaneLineLayer && !groundToPlaneLineLayer.getVisible()) return;
    
    // Arreglo para almacenar los pares
    const pairs = [];

    // Modo 1 punto tierra 1 avión: un único par
    if (distanceToGroundModeType === '1A1B') {
        // Solo si hay un punto en tierra y un avión seleccionado
        if (groundPoints.length === 1 && planesForGround.length === 1) {
            // Guardar el par A‑B con su clave y hex del avión
            pairs.push({ key: '0|' + planesForGround[0], gp: groundPoints[0], hex: planesForGround[0] });
        }

        // Modo 1 punto tierra n aviones: varios pares con el mismo punto A
    } else if (distanceToGroundModeType === '1A_nB') {
        // Solo si ya hay un punto A y al menos un avión marcado
        if (groundPoints.length === 1 && planesForGround.length) {
            // Recorrer cada avión y crear su par con el mismo punto A
            for (const hex of planesForGround) {
                pairs.push({ key: '0|' + hex, gp: groundPoints[0], hex });
            }
        }

        // Modo n puntos tierra 1 avión: varios pares con el mismo avión B
    } else if (distanceToGroundModeType === 'nA_1B') {
        // Solo si hay un avión seleccionado y al menos un punto en tierra
        if (planesForGround.length === 1 && groundPoints.length) {
            const hex = planesForGround[0];
            // Recorrer todos los puntos A y crear su par con el mismo avión
            for (let gi = 0; gi < groundPoints.length; gi++) {
                pairs.push({ key: gi + '|' + hex, gp: groundPoints[gi], hex });
            }
        }

        // Modo n puntos tierra n aviones: todos los pares acumulados
    } else if (distanceToGroundModeType === 'nA_nB') {

        // Añadir cada par guardado previamente a la lista de pares activos
        for (const p of taPairs) {
            pairs.push({ key: p.key, gp: p.gp, hex: p.hex });
        }
    }

    // Si no hay pares, no se dibuja nada
    if (!pairs.length) return;

    // Mostrar la capa de líneas si existe
    // if (groundToPlaneLineLayer) groundToPlaneLineLayer.setVisible(true);

    // IDs de pares que siguen activos
    const active = new Set();

    // Recorrer cada par A‑B pendiente de dibujar
    for (const { key, gp, hex } of pairs) {
        // Buscar el avión por su hex
        let plane = g.planes[hex];
        // Marcar si falta o no tiene posición
        const missingPlane = !plane || !plane.position;
        // Considera “viejo” si no reporta en >15 s
        const isStale = missingPlane || plane.seen > 15;

        // Sin punto A, no se puede dibujar
        if (!gp) continue;

        // Si ya se descartó antes por pérdida de señal
        if (groundPlaneRemoved.has(key)) {
            // Si volvió a reportar, lo rehabilita
            if (!isStale) {
                groundPlaneRemoved.delete(key);
                groundPlaneMissingSince.delete(key);
            } else {
                // Si sigue sin señal, omite este par
                continue;
            }
        }

        // Si el avión está “viejo” o sin señal
        if (isStale) {
            // Marca el par como activo (en espera)
            active.add(key);

            // Tiempo en que empezó a faltar la señal
            const started = groundPlaneMissingSince.get(key) || Date.now();
            // Registrar/actualizar el inicio de la ausencia
            groundPlaneMissingSince.set(key, started);
            // Segundos sin señal
            const secondsMissing = (Date.now() - started) / 1000;
            // Segundos para expirar
            const remaining = Math.max(0, Math.ceil(15 - secondsMissing));

            // Buscar overlay existente para este par
            let ov = groundPlaneOverlays.get(key);
            // Si no existe, crear uno nuevo
            if (!ov) {
                const el = document.createElement('div');
                Object.assign(el.style, {
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid #000',
                    padding: '6px',
                    fontSize: '12px',
                    color: '#000',
                    pointerEvents: 'none',
                });
                ov = new ol.Overlay({ element: el, positioning: 'bottom-center', offset: [0, -10] });
                OLMap && OLMap.addOverlay(ov);
                groundPlaneOverlays.set(key, ov);
            }

            // Mensaje de señal perdida
            ov.getElement().innerHTML = `<b style="color:red;">SEÑAL PERDIDA</b><br>Reintentando... ${remaining}s`;

            // Coordenada donde se mostrará el cartel
            let overlayPos;
            // Si ya hay una línea A‑B dibujada para este par
            if (groundPlaneFeatures.has(key)) {
                // Usar el punto medio de esa línea
                overlayPos = groundPlaneFeatures.get(key).getGeometry().getCoordinateAt(0.5);
            // Si el avión tiene posición válida pero no hay línea
            } else if (!missingPlane && plane.position) {
                // Proyectar la posición del avión
                const projPlane = ol.proj.fromLonLat(plane.position);
                // Proyectar el punto A en tierra
                const projGround = ol.proj.fromLonLat(gp);
                // Calcular el punto medio entre A y el avión
                overlayPos = [(projGround[0] + projPlane[0]) / 2, (projGround[1] + projPlane[1]) / 2];
            // Si no hay posición del avión
            } else {
                // Colocar el cartel sobre el punto A
                overlayPos = ol.proj.fromLonLat(gp);
            }
            // Anclar el overlay en su centro
            ov.setPositioning('center-center');
            // Sin desplazamiento adicional
            ov.setOffset([0, 0]);
            // Posiciona el overlay en la coordenada calculada
            ov.setPosition(overlayPos);

            // Si lleva 15s sin señal, se descarta el par
            if (secondsMissing >= 15) {
                // Limpiar el registro de ausencia
                groundPlaneMissingSince.delete(key);
                // Marcar el par como eliminado
                groundPlaneRemoved.add(key);

                // Recuperar la línea A‑B de este par
                const feat = groundPlaneFeatures.get(key);
                if (feat) {
                    // Quitar la línea del mapa
                    groundToPlaneLineSource && groundToPlaneLineSource.removeFeature(feat);
                    // Borrar la referencia de la línea
                    groundPlaneFeatures.delete(key);
                }
                // Quitar el overlay del mapa
                OLMap && ov && OLMap.removeOverlay(ov);
                // Eliminar el overlay del registro
                groundPlaneOverlays.delete(key);

                // Ajustar listas según el modo activo
                if (distanceToGroundModeType === '1A_nB') {
                    // Quitar avión B
                    planesForGround = planesForGround.filter(h => h !== hex);
                } else if (distanceToGroundModeType === 'nA_1B') {
                    // Limpiar avión B
                    planesForGround = [];
                    // Borrar selección de avión
                    selectedPlaneForGround = null;
                } else if (distanceToGroundModeType === 'nA_nB') {
                    // Quitar el par A‑B almacenado
                    taPairs = taPairs.filter(p => p.key !== key);

                    // Extraer la clave de la coordenada del punto A
                    const groundKey = key.split('|')[0];

                    // Recuperar la feature del punto A si estaba indexada
                    const featA = groundPointFeaturesByCoord.get(groundKey);
                    // Si existe la feature y la fuente de puntos está disponible
                    if (featA && groundPointSource) {
                        // Intentar quitar el punto A del mapa
                        try { groundPointSource.removeFeature(featA); } catch (_) {}
                        // Eliminar la entrada del índice para ese punto A    
                        groundPointFeaturesByCoord.delete(groundKey);
                    }
                    // Borrar la clave aunque no hubiera feature
                    groundPointFeaturesByCoord.delete(groundKey);

                    // Si hay fuente de puntos A activa
                    if (groundPointSource) {
                        // Limpiar todos los puntos A del mapa
                        groundPointSource.clear();
                        // Vaciar el índice de puntos A por coordenada
                        groundPointFeaturesByCoord.clear();
                        // Recorrer cada par tierra‑avión almacenado
                        for (const { gp } of taPairs) {
                            // Clave de la coord con 6 decimales
                            const gpKey = `${gp[0].toFixed(6)},${gp[1].toFixed(6)}`;
                            // Si ya existe ese punto, saltarlo
                            if (groundPointFeaturesByCoord.has(gpKey)) continue;
                            // Crear la feature del punto A
                            const f = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(gp)));
                            // Registrar la feature en el índice por coord
                            groundPointFeaturesByCoord.set(gpKey, f);
                            // Añadir el punto A a la fuente para dibujarlo
                            groundPointSource.addFeature(f);
                        }
                        // Contar cuántos puntos A hay
                        const count = groundPointSource.getFeatures().length;
                        // Mostrar u ocultar la capa según haya puntos
                        if (groundPointLayer) groundPointLayer.setVisible(count > 0);
                        // Forzar a la fuente a notificar cambios
                        groundPointSource.changed();
                        // Forzar a la capa a redibujarse
                        groundPointLayer && groundPointLayer.changed();
                        // Redibujar el mapa inmediatamente
                        OLMap && OLMap.renderSync();
                    }
                    // Si no quedan puntos A, ocultar la capa
                    if (groundPointLayer && groundPointSource && groundPointSource.getFeatures().length === 0) {
                        groundPointLayer.setVisible(false);
                    }
                }
            }

            continue;

        }

        // Borrar el registro de ausencia del par
        groundPlaneMissingSince.delete(key);
        // Quitar el par de la lista de descartados
        groundPlaneRemoved.delete(key);
        // Marcar el par como activo
        active.add(key);

        // Tomar la altitud barométrica
        let altBaro = plane.altitude;
        // Si reporta “ground”, usarlo como 0 ft
        if (altBaro === "ground") altBaro = 0;
        // Corregir altitud baro por QNH
        altBaro = adjust_baro_alt(altBaro);
        // Ajustar altitud geométrica (EGM si aplica)
        let altGeom = adjust_geom_alt(plane.alt_geom, plane.position);
        // “ground” a 0 ft en geométrica
        if (altGeom === "ground") altGeom = 0;
        // Usar geométrica si existe, si no baro
        const verticalFt = (altGeom != null) ? altGeom : altBaro;
        // Sin altitud válida, pasar al siguiente par
        if (verticalFt == null) continue;

        // Posición del avión
        const pp = plane.position;
        // Distancia horizontal A‑B (NM)
        const horizNm = haversineDistance(gp[1], gp[0], pp[1], pp[0]);
        // Distancia horizontal en metros
        const horizM = horizNm * 1852;
        // Altura en millas náuticas
        const vertNm = Math.abs(verticalFt) / 6076.12;
        // Distancia inclinada combinando horiz/vert
        const slantNm = Math.sqrt(horizNm * horizNm + vertNm * vertNm);
        // Distancia inclinada en metros
        const slantM = slantNm * 1852;
        // Texto formateado (NM)
        const slantText = format_distance_long(slantM, DisplayUnits).replace(/nmi?/i, 'NM');

        // Proyectar posición del avión al mapa
        const projPlane = ol.proj.fromLonLat(pp);
        // Proyectar el punto A al mapa
        const projGround = ol.proj.fromLonLat(gp);

        // Volver a marcar el par como activo
        active.add(key);

        // Recuperar la feature de línea A‑B si ya existe
        let feat = groundPlaneFeatures.get(key);
        // Si no existe, crear una nueva
        if (!feat) {
            // Definir la línea entre punto A y avión
            feat = new ol.Feature(new ol.geom.LineString([projGround, projPlane]));
            // Añadir la línea a la fuente vectorial
            groundToPlaneLineSource && groundToPlaneLineSource.addFeature(feat);
            // Guardar la feature en el mapa de líneas
            groundPlaneFeatures.set(key, feat);
        } else {
            // Actualizar las coordenadas de la línea existente
            feat.getGeometry().setCoordinates([projGround, projPlane]);
        }

        // Punto medio A‑B
        const midProj = feat.getGeometry().getCoordinateAt(0.5);

        // Buscar el overlay de texto para el par
        let ov = groundPlaneOverlays.get(key);
        // Si no existe, crear uno nuevo
        if (!ov) {
            const el = document.createElement('div');
            el.style.background = 'rgba(255,255,255,0.85)';
            el.style.border = '1px solid #000';
            el.style.padding = '6px';
            el.style.fontSize = '12px';
            el.style.color = '#000';
            el.style.pointerEvents = 'none';
            ov = new ol.Overlay({ element: el, positioning: 'center-center', offset: [0, -10] });
            OLMap && OLMap.addOverlay(ov);
            groundPlaneOverlays.set(key, ov);
        }
        // Mostrar la distancia calculada
        ov.getElement().innerHTML = `Distancia: ${slantText}`;
        // Posicionar el overlay en el punto medio A‑B
        ov.setPosition(midProj);
    }

    // Recorrer todas las líneas A‑B dibujadas
    for (const [k, feat] of groundPlaneFeatures) {
        // Si la línea no quedó activa en este ciclo
        if (!active.has(k)) {
            // Se quita de la fuente del mapa
            groundToPlaneLineSource && groundToPlaneLineSource.removeFeature(feat);
            // Se elimina del registro de líneas
            groundPlaneFeatures.delete(k);
        }
    }
    // Recorrer todos los overlays de distancia
    for (const [k, ov] of groundPlaneOverlays) {
        // Si el overlay no quedó activo en este ciclo
        if (!active.has(k)) {
            // Se retira del mapa
            OLMap && OLMap.removeOverlay(ov);
            // Se elimina del registro de overlays
            groundPlaneOverlays.delete(k);
        }
    }

    return;

}

// Función para actualizar la medición tierra-tierra
function updateGroundToGroundOverlay() {
    // Si la capa de líneas existe pero el usuario la ocultó, respetar su elección y no volver a crear/añadir nada.
    if (ggLineLayer && !ggLineLayer.getVisible()) return;

    // Lista de pares A‑B que se van a mostrar
    const pairs = [];
    // Modo 1A1B: un punto en tierra a otro punto en tierra
    if (groundToGroundModeType === '1A1B') {
        // Solo si existe el punto A y un único punto B
        if (ggPointA && ggPointsB.length === 1) {
            // Guardar el par A‑B con clave fija
            pairs.push({ key: '0', a: ggPointA, b: ggPointsB[0] });
        }
        // Modo 1AnB: un punto en tierra a otros puntos en tierra
    } else if (groundToGroundModeType === '1A_nB') {
        // Solo si existe el punto A y al menos un punto B
        if (ggPointA && ggPointsB.length) {
            // Guardar los pares A‑B con claves basadas en el índice
            ggPointsB.forEach((pt, idx) => pairs.push({ key: `${idx}`, a: ggPointA, b: pt }));
        }
    }
    // Si no hay pares, no se dibuja nada
    if (!pairs.length) return;
    // Asegurar que la capa de líneas esté visible
    // if (ggLineLayer) ggLineLayer.setVisible(true);
    // Conjunto de pares que siguen activos
    const active = new Set();

    // Recorrer cada par tierra‑tierra activo
    for (const { key, a, b } of pairs) {
        // Calcular distancia en millas náuticas
        const distNm = haversineDistance(a[1], a[0], b[1], b[0]);
        // Convertir distancia a metros
        const distM = distNm * 1852;
        // Formatear la distancia
        const distText = format_distance_long(distM, DisplayUnits).replace(/nmi?/i, 'NM');

        // Proyectar el punto A al mapa
        const projA = ol.proj.fromLonLat(a);
        // Proyectar el punto B al mapa
        const projB = ol.proj.fromLonLat(b);

        // Marcar el par como activo en el ciclo
        active.add(key);

        // Buscar la línea A‑B ya dibujada
        let feat = ggLineFeatures.get(key);
        // Si no existe, crearla
        if (!feat) {
            // Línea entre A y B
            feat = new ol.Feature(new ol.geom.LineString([projA, projB]));
            // Añadir la línea a la fuente vectorial
            ggLineSource && ggLineSource.addFeature(feat);
            // Guardar la línea en el registro
            ggLineFeatures.set(key, feat);
        } else {
            // Actualizar coordenadas de la línea existente
            feat.getGeometry().setCoordinates([projA, projB]);
        }

        // Calcular el punto medio A‑B
        const mid = feat.getGeometry().getCoordinateAt(0.5);

        // Buscar overlay de distancia para el par
        let ov = ggOverlays.get(key);
        // Si no existe, crearlo
        if (!ov) {
            const el = document.createElement('div');
            Object.assign(el.style, {
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid #000',
                padding: '6px',
                fontSize: '12px',
                color: '#000',
                pointerEvents: 'none',
            });
            ov = new ol.Overlay({ element: el, positioning: 'center-center', offset: [0, -10] });
            OLMap && OLMap.addOverlay(ov);
            ggOverlays.set(key, ov);
        }
        // Mostrar la distancia formateada
        ov.getElement().innerHTML = `Distancia: ${distText}`;
        // Posicionar el overlay en el punto medio A‑B
        ov.setPosition(mid);
    }

    // Recorrer todas las líneas tierra‑tierra dibujadas
    for (const [k, feat] of ggLineFeatures) {
        // Si la línea no quedó activa en este ciclo
        if (!active.has(k)) {
            // Se quita de la fuente del mapa
            ggLineSource && ggLineSource.removeFeature(feat);
            // Se elimina del registro de líneas
            ggLineFeatures.delete(k);
        }
    }
    // Recorrer todos los overlays de distancia
    for (const [k, ov] of ggOverlays) {
        // Si el overlay no quedó activo en este ciclo
        if (!active.has(k)) {
            // Se retira del mapa
            OLMap && OLMap.removeOverlay(ov);
            // Se elimina del registro de overlays
            ggOverlays.delete(k);
        }
    }
}

// Función para mostrar el texto guía del modo distancia suelo‑avión
function showDistanceGuide(text) {
    // Seleccionar el contenedor donde se insertará la guía: el mapa si existe, o el body como respaldo.
    const host = document.getElementById('map_container') || document.body;
    // Crear el overlay si no existe
    if (!distanceGuideEl) {
        distanceGuideEl = document.createElement('div');
        // Aplicar estilos al elemento creado
        Object.assign(distanceGuideEl.style, {
            position: 'absolute',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #000',
            padding: '6px 8px',
            fontSize: '12px',
            color: '#000',
            pointerEvents: 'none',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: '10000',
            display: 'none',
        });
        // Insertar elemento guía en el contenedor elegido.
        host.appendChild(distanceGuideEl);
    }
    distanceGuideEl.innerHTML = text;
    distanceGuideEl.style.display = 'block';
}

// Función para ocultar la guía del modo distancia suelo‑avión
function hideDistanceGuide() {
    if (distanceGuideEl) distanceGuideEl.style.display = 'none';
}

// Función para activar/desactivar el modo distancia suelo‑avión
function DistanceToGround() {
    // Alternar el modo de medición suelo‑avión
    distanceToGroundMode = !distanceToGroundMode;

    if (distanceToGroundMode) {
        // Limpieza y reset al activar
        clearTAGroundDrawings();

        // Asegurar fuente y capa de puntos A
        if (!groundPointSource) groundPointSource = new ol.source.Vector();
        if (groundPointLayer) {
            groundPointLayer.setSource(groundPointSource);
            if (OLMap && !OLMap.getLayers().getArray().includes(groundPointLayer)) {
                OLMap.addLayer(groundPointLayer);
            }
            groundPointLayer.setVisible(true);
        }

        // Asegurar fuente de línea
        if (!groundToPlaneLineSource) groundToPlaneLineSource = new ol.source.Vector();
        if (groundToPlaneLineLayer) {
            groundToPlaneLineLayer.setSource(groundToPlaneLineSource);
            // Mostrar la capa de líneas al activar el modo
            groundToPlaneLineLayer.setVisible(true);
            // Si por cualquier motivo la capa no está añadida al mapa, añadirla
            if(OLMap && !OLMap.getLayers().getArray().includes(groundToPlaneLineLayer)) {
                OLMap.addLayer(groundToPlaneLineLayer);
            }
        }

        // Mostrar guía paso 1 según modo actual
        showDistanceGuide(`<center>${taPreMessage()}</center><br>${taStep1Message()}`);

        // Intervalo de refresco
        distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);

        buttonActive('#TA', true);
    } else {
        // Apagar y limpiar todo
        clearTAGroundDrawings();
        hideDistanceGuide();
        buttonActive('#TA', false);
    }
}

// Función para activar/desactivar el modo distancia tierra-tierra
function DistanceGroundToGround() {
    // Invertir el estado actual del modo
    groundToGroundMode = !groundToGroundMode;
    // Si se enciende el modo
    if (groundToGroundMode) {
        // Limpiar puntos, líneas y overlays previos
        clearGroundToGround();

        // Crear la fuente vectorial para los puntos (A/B) si no existe.
        if (!ggPointSource) ggPointSource = new ol.source.Vector();
        // Si la capa de puntos está definida, configurar su fuente y visibilidad.
        if (ggPointLayer) {
            // Asignar la fuente recién creada a la capa de puntos.
            ggPointLayer.setSource(ggPointSource);
            // Añadir la capa al mapa si aún no está presente.
            if (OLMap && !OLMap.getLayers().getArray().includes(ggPointLayer)) OLMap.addLayer(ggPointLayer);
            // Asegurar que la capa de puntos sea visible.
            ggPointLayer.setVisible(true);
        }

        // Crear la fuente vectorial para las líneas A‑B si no existe.
        if (!ggLineSource) ggLineSource = new ol.source.Vector();
        // Si la capa de líneas está definida, configurar su fuente y visibilidad.
        if (ggLineLayer) {
            // Asignar la fuente de líneas a la capa correspondiente.
            ggLineLayer.setSource(ggLineSource);
            // Añadir la capa de líneas al mapa si falta.
            if (OLMap && !OLMap.getLayers().getArray().includes(ggLineLayer)) OLMap.addLayer(ggLineLayer);
            // Asegurar que la capa de líneas sea visible.
            ggLineLayer.setVisible(true);
        }

        // Mostrar guía con el modo y paso 1
        showDistanceGuide(`<center>${ggPreMessage()}</center><br>${ggStep1Message()}`);
        // Refrescar medición cada segundo
        ggUpdateInterval = setInterval(updateGroundToGroundOverlay, 1000);
        // Marcar el botón como activo
        buttonActive('#TT', true);
        // Si se apaga el modo:
    } else {
        // Limpiar puntos, líneas y overlays
        clearGroundToGround();
        // Ocultar el texto guía
        hideDistanceGuide();
        // Marcar el botón como inactivo
        buttonActive('#TT', false);
    }
}
// Procesa la información de un avión individual recibida del servidor
function processAircraft(ac, init, uat) {
    // Indica si la entrada es un arreglo compacto (versión binaria) o un objeto
    const isArray = Array.isArray(ac);
    // Identificador hexadecimal del avión
    let hex = isArray ? ac[0] : ac.hex;
    // Si hay un filtro por ICAO y este hex no está en la lista, ignorarlo
    if (icaoFilter && !icaoFilter.includes(hex))
        return;
    // Si hay una lista negra de ICAOs y este hex está dentro, descartarlo
    if (icaoBlacklist && icaoBlacklist.includes(hex))
        return;
    // Fusionar identificadores no-ICAO que empiezan con '~' si está habilitado
    if (MergeNonIcao && hex.startsWith('~')) {
        hex = hex.slice(1);
    }
    // Tipo de mensaje (por ejemplo 'adsb', 'tisb', etc.)
    const type = isArray ? ac[7] : ac.type;
    // Si hay una lista para mantener historial y este avión no está en ella, ignorarlo salvo excepciones
    if (g.historyKeep && !g.historyKeep[hex] && type != 'adsc') {
        return;
    }
    // Si la fuente es UAT y hay opción de ignorar TIS-B desde UAT, descartarlo
    if (uat && uatNoTISB && ac.type && ac.type.substring(0, 4) == "tisb") {
        // drop non ADS-B planes from UAT (TIS-B)
        return;
    }

    // Do we already have this plane object in g.planes?
    // If not make it.
    // Buscar si ya tenemos un objeto Plane para este hex
    let plane = g.planes[hex]
    // Si no existe, crear un nuevo objeto que represente el avión
    if (!plane) {
        plane = new PlaneObject(hex);
        if (uat)
            plane.uat = true;
    }

    // Si estamos mostrando trazas históricas, no procesar posiciones en vivo aquí
    if (showTrace)
        return;

    // Actualiza los datos del avión según el modo (globo/replay o normal)
    // Call the function update
    if (globeIndex || replay) {
        // Si no filtramos por militares o el avión es militar o marcado en la base de datos, aceptarlo
        if (!onlyMilitary || plane.military || (ac.dbFlags && ac.dbFlags & 1)) {
            plane.updateData(now, last, ac, init);
        } else {
            // Si no, actualizar sólo el tiempo de último mensaje
            plane.last_message_time = now - ac.seen;
        }
        return;
    }
    // Si no hay datos UAT activos, aceptar la actualización inmediatamente
    if (uat_now == 0) {
        plane.updateData(now, last, ac, init);
        return;
    }

    // UAT dual source stuff below
    // Lógica para decidir qué fuente (UAT 978 vs ADS-B 1090) usar cuando hay ambas
    // Tiempo desde que el mensaje incluye posición (prioridad relativa)
    let newPos = ac.seen_pos;
    if (newPos === undefined || isNaN(newPos)) {
        newPos = 1000;
    }
    let oldPos = plane.seen_pos;
    if (oldPos === undefined || isNaN(oldPos)) {
        oldPos = 1000;
    }
    let newSeen = ac.seen;
    if (newSeen === undefined || isNaN(newSeen)) {
        newSeen = 1000;
    }
    let oldSeen = plane.seen;
    if (oldSeen === undefined || isNaN(oldSeen)) {
        oldSeen = 1000;
    }
    // Si la nueva información NO viene de UAT, aplicar reglas para aceptar o rechazar
    if (!uat) {
        if (!plane.uat // plane isn't uat, new data isn't uat, accept immediately
            || (prefer978 < 0 && newPos < -prefer978)
            || (newPos < 2 && oldPos > 4 + prefer978)
            || (oldPos > 60 && newSeen < 2 && oldSeen > 4 + prefer978)
            || init) {
            // Marcar como no-UAT y actualizar datos
            plane.uat = false;
            plane.updateData(now, last, ac, init);
        }
    } else {
        // Si la nueva información viene de UAT, aplicar otras reglas de preferencia
        if (plane.uat // plane is uat, new data is uat, accept immediately
            || (prefer978 > 0 && newPos < prefer978)
            || (newPos < 2 && (oldPos > 4 - prefer978 || plane.dataSource == "mlat"))
            || (oldPos > 60 && newSeen < 2 && oldSeen > 4 - prefer978)
            || init) {
            // Detectar si es TIS-B y si debemos ignorarlo para un avión que ya viene por ADS-B
            let tisb = Array.isArray(ac) ? (ac[7] == "tisb") : (ac.tisb != null && ac.tisb.indexOf("lat") >= 0);
            if (tisb && plane.dataSource == "adsb") {
                // ignore TIS-B data for current ADS-B 1090 planes
            } else {
                // Aceptar datos UAT y actualizar con tiempos UAT
                plane.uat = true;
                plane.updateData(uat_now, uat_last, ac, init);
            }
        }
    }
}
// Contador auxiliar para errores de tiempo que no avanzan
let notNewCounter = 0;
let backwardsCounter = 0;
// Procesa un paquete de actualización del receptor (varios aviones)
function processReceiverUpdate(data, init) {
    // update now and last
    // Actualiza marcas de tiempo "now" y "last" según si el paquete es UAT o no
    let uat = data.uat_978;
    if (uat) {
        if (data.now <= uat_now)
            return;
        uat_last = uat_now;
        uat_now = data.now;
    } else {
        // Si ha pasado demasiado desde el último UAT, sincronizar tempos
        if (uat_now && now - uat_now > 15) {
            uat_now = now;
        }
        // Si el paquete viene con tiempo igual o anterior al actual y no estamos en modo globo, puede ser cache viejo
        if (data.now <= now && !globeIndex) {
            if (data.now < now) {
                backwardsCounter++;
                console.log('timestep backwards or the same, ignoring data: ' + now + ' -> ' + data.now);
                if (backwardsCounter >= 5) {
                    // Si esto ocurre muchas veces, resetear el reloj interno y forzar limpieza
                    backwardsCounter = 0;
                    console.log('resetting all data now:' + now + ' -> ' + data.now);
                    now = data.now;
                    last = now - 1;
                    reaper(1);
                    enableDynamicCachebusting = true;
                }
            }
            if (++notNewCounter > 2) {
                // data.now is too old, possibly a caching issues
                // datos demasiado antiguos, posible problema de cache
                enableDynamicCachebusting = true;
            }
            return;
        }
        // Si el paquete avanza en el tiempo, actualizar marcas last/now
        if (data.now > now) {
            if (0 && now && data.now - now > 10) {
                console.log('now jumped: ' + localTime(new Date(now * 1000)) + ' -> ' + localTime(new Date(data.now * 1000)));
            }
            notNewCounter = 0;
            backwardsCounter = 0;
            last = now;
            now = data.now;
        }
    }
    // Guardar now en el objeto global g para acceso desde otras partes
    g.now = now;
    // Si estamos en vista tipo globo, actualizar índices y contar aviones globales
    if (globeIndex) {
        if ((showGrid || loStore['globeGrid'] == 'true')
            && globeIndexNow[data.globeIndex] == null)
            drawTileBorder(data);
        globeTrackedAircraft = data.global_ac_count_withpos;
        globeIndexNow[data.globeIndex] = data.now;
    }
    // Actualizar tasa de mensajes si procede
    if (!(uat || init || (globeIndex && aggregator))) {
        updateMessageRate(data);
    }

    // Loop through all the planes in the data packet
    // Recorre todas las aeronaves del paquete y procesa cada una
    for (let j = 0; j < data.aircraft.length; j++) {
        processAircraft(data.aircraft[j], init, uat);
    }
}
// Manejador de fallo de fetch: registra errores y muestra aviso en UI
function fetchFail(jqxhr, status, error) {
    try {
        // Reducir contador de peticiones pendientes
        pendingFetches--;
        if (pendingFetches <= 0 && !tabHidden) {
            triggerRefresh++;
            checkMovement();
        }
        status = jqxhr.status;
        if (jqxhr.readyState == 0) error = "Can't connect to server, check your network!";
        let errText = status + (error ? (": " + error) : "");
        console.log(jqxhr);
        console.log(error);
        // Si no es un rate-limit (429) mostrar detalle de error y aumentar contador de receptores desactualizados
        if (status != 429 && status != '429') {
            jQuery("#update_error_detail").text(errText);
            jQuery("#update_error").css('display', 'block');
            StaleReceiverCount++;
        } else {
            // Si se reciben muchos 429, forzar actualización de tasas del globo
            if (C429++ > 16) {
                globeRateUpdate();
                C429 = 0;
            }
        }
    } catch (e) {
        console.error(e);
    }
}
// Manejador cuando un fetch termina correctamente: procesa datos binarios o JSON y actualiza estado
function fetchDone(data) {
    try {
        pendingFetches--;
        if (data == null) {
            return;
        }
        // Si los datos vienen comprimidos con zstd, descomprimir y pasar al decodificador interno
        if (zstd) {
            let arr = new Uint8Array(data);
            lastRequestSize = arr.byteLength;
            let res;
            try {
                res = zstdDecode(arr, 0);
            } catch (e) {
                let errText = e.message;
                console.log(errText);
                jQuery("#update_error_detail").text(errText);
                jQuery("#update_error").css('display', 'block');
                return;
            }
            let arrayBuffer = res.buffer
            // return type is Uint8Array, wqi requires the ArrayBuffer
            // wqi espera ArrayBuffer, así que lo empaquetamos
            data = { buffer: arrayBuffer, };
            wqi(data);
        } else if (binCraft) {
            // Si es formato binCraft, preparar buffer y pasarlo al parser wqi
            lastRequestSize = data.byteLength / 2;
            data = { buffer: data, };
            wqi(data);
        }
        // Guardar índice de URL para casos con múltiples segmentos
        data.urlIndex = this.urlIndex;
        // Validar que el paquete tenga lista de aeronaves y timestamp
        if (!data.aircraft || !data.now) {
            let error = data.error;
            if (error) {
                jQuery("#update_error_detail").text(error);
                jQuery("#update_error").css('display', 'block');
                StaleReceiverCount++;
            }
            return;
        }
        // Si los timers están desactivados, no aplicar los datos
        if (!timersActive) {
            //console.log(localTime(new Date()) + " fetchDone: not applying data due to !timersActive");
            return;
        }

        //console.time("Process " + data.globeIndex);
        // Procesar el paquete de datos del receptor
        processReceiverUpdate(data);
        //console.timeEnd("Process " + data.globeIndex);
        data = null;
        // Si había datos UAT pendientes, procesarlos también
        if (uat_data) {
            processReceiverUpdate(uat_data);
            uat_data = null;
        }
        // Si ya no hay peticiones pendientes, marcar para refrescar la UI
        if (pendingFetches <= 0 && !tabHidden) {
            triggerRefresh++;
            checkMovement();
            if (firstFetch) {
                firstFetch = false;
                if (uuid) {
                    const ext = myExtent(OLMap.getView().calculateExtent(OLMap.getSize()));
                    let jump = true;
                    for (let i = 0; i < g.planesOrdered.length; ++i) {
                        const plane = g.planesOrdered[i];
                        if (plane.visible && inView(plane.position, ext)) {
                            jump = false;
                            break;
                        }
                    }
                    if (jump) {
                        followRandomPlane();
                        deselectAllPlanes();
                        OLMap.getView().setZoom(6);
                    }
                }
                checkRefresh();
            }
        }
        // Estadísticas de fetchs completados
        fetchDoneCount++;
        if (fetchDoneCount == 1) { console.timeEnd("first fetch()"); };
        // Llamada posterior a la primera descarga completa
        if (!g.firstFetchDone) { afterFirstFetch(); };

        // Check for stale receiver data
        // Comprobar si los datos del receptor se han quedado estancados
        if (last == now && !globeIndex) {
            StaleReceiverCount++;
            if (StaleReceiverCount > 5) {
                jQuery("#update_error_detail").text("The data from the server hasn't been updated in a while.");
                jQuery("#update_error").css('display', 'block');
            }
        } else if (StaleReceiverCount > 0) {
            StaleReceiverCount = 0;
            jQuery("#update_error").css('display', 'none');
        }
    } catch (e) {
        console.error(e);
    }
}
// Carga en memoria la tabla de tipos de avión desde el directorio de la base de datos
function db_load_type_cache() {
    return jQuery.getJSON(databaseFolder + "/icao_aircraft_types2.js").done(function (typeLookupData) {
        // Guardar la tabla de búsqueda en la cache global
        g.type_cache = typeLookupData;
        // Actualizar los aviones ya cargados para que apliquen los nuevos datos
        for (let i in g.planesOrdered) {
            g.planesOrdered[i].setTypeData();
        }
    });
}
// Bandera para ejecutar funciones después de la carga inicial
g.afterLoadDone = false;
g.afterLoad = [];
// Añade una función para ejecutar después de la primera carga completa
function runAfterLoad(func) {
    if (g.afterLoadDone) {
        func()
    } else {
        g.afterLoad.push(func);
    }
}
// Se ejecuta tras la primera descarga de datos completa; realiza tareas de inicialización finales
function afterFirstFetch() {
    if (g.firstFetchDone) { return; }

    g.firstFetchDone = true;

    updateVisible();
    mapRefresh();
    // Pequeño retraso para dejar estabilizar la UI y ejecutar tareas en segundo plano
    setTimeout(() => {
        console.time('afterFirstFetch()');


        let func;
        // Ejecutar funciones encoladas antes de la carga
        while ((func = g.afterLoad.pop())) {
            func();
        }
        g.afterLoadDone = true;
        while ((func = g.afterLoad.pop())) {
            func();
        }

        // Inicializar el calculador de declinación magnética
        geoMag = geoMagFactory(cof2Obj());
        // Cargar cache de tipos y forzar un refresco
        db_load_type_cache().always(function () {
            refresh();
        });
        // Si estamos en modo screenshot, parar temporizadores silenciosamente
        if (usp.has('screenshot')) {
            clearIntervalTimers('silent');
        }

        console.timeEnd('afterFirstFetch()');
    }, 30);
}

let debugFetch = false;
let C429 = 0;
let fetchCalls = 0;
let fetchDoneCount = 0;
// Función que inicia las peticiones periódicas para traer datos de aeronaves
function fetchData(options) {
    options = options || {};
    // Si los timers están apagados, no iniciar fetch
    if (!timersActive) {
        //console.log(localTime(new Date()) + " fetchData inhibited by !timersActive");
        return;
    }
    // No fetch en modos especiales como heatmap, replay, trace, etc.
    if (heatmap || replay || showTrace || pTracks || !loadFinished || inhibitFetch) {
        return;
    }
    let currentTime = new Date().getTime();
    const refreshMs = refreshInt()
    g.lastRefreshInt = refreshMs;
    // Evitar hacer fetchs demasiado seguido, o si hay fetchs pendientes, o si el mapa se está moviendo
    if (!options.force) {
        if (
            currentTime - lastFetch <= refreshMs
            || pendingFetches > 0
            || OLMap.getView().getInteracting()
            || OLMap.getView().getAnimating()
        ) {
            return;
        }
    }
    // Programar la próxima ejecución recursiva
    setTimeout(fetchData, refreshMs);
    if (debugFetch) {
        console.log('Time since last fetch: ' + (currentTime - lastFetch) + ' ms');
    }
    lastFetch = currentTime;
    // Reiniciar lista de fetch pendientes
    FetchPending = [];
    if (FetchPendingUAT != null) {
        // don't double up on fetches, let the last one resolve
        return;
    }

    //console.timeEnd("Starting Fetch");
    //console.time("Starting Fetch");
    // Si se ha limitado el número de actualizaciones, respetarlo
    if (limitUpdates != -1 && fetchCalls > limitUpdates) {
        return;
    }
    fetchCalls++;

    if (fetchCalls == 1) { console.time("first fetch()"); };
    // Si UAT está habilitado, arrancar la petición específica para 978
    if (enable_uat) {
        FetchPendingUAT = jQuery.ajax({
            url: 'chunks/978.json',
            dataType: 'json'
        });

        FetchPendingUAT.done(function (data) {
            uat_data = data;
            FetchPendingUAT = null;
        });
        FetchPendingUAT.fail(function (jqxhr, status, error) {
            FetchPendingUAT = null;
        });
    }
    // Determinar sufijo de archivos según compresión/formato
    let suffix = zstd ? '.binCraft.zst' : (binCraft ? '.binCraft' : '.json');
    if (enableDynamicCachebusting) {
        suffix += `?${currentTime}`;
    }

    let ac_url = [];
    // Construir URLs a consultar según configuración (uuid, reApi, globeIndex, etc.)
    if (uuid != null) {
        for (let i in uuid) {
            ac_url.push('uuid/?feed=' + uuid[i]);
        }
    } else if (reApi || filterUuid) {
        let url = 're-api/?' + (binCraft ? 'binCraft' : 'json');
        url += zstd ? '&zstd' : '';
        url += onlyMilitary ? '&filter_mil' : '';
        lastRequestBox = requestBoxString();
        if (icaoFilter) {
            if (icaoFilter.length > 0) {
                url += '&find_hex='
                for (let k in icaoFilter) {
                    url += icaoFilter[k] + ','
                }
                url = url.slice(0, -1); // remove trailing comma
            }
        } else if (onlySelected && SelPlanes.length > 0) {
            url += '&find_hex='
            for (let k in SelPlanes) {
                url += SelPlanes[k].icao + ','
            }
            url = url.slice(0, -1); // remove trailing comma
        } else {
            url += '&box=' + lastRequestBox;

            if (SelPlanes.length > 0) {
                url += '&find_hex='
                for (let k in SelPlanes) {
                    url += SelPlanes[k].icao + ','
                }
                url = url.slice(0, -1); // remove trailing comma
            }
        }

        if (filterUuid) {
            url += '&filter_uuid=' + filterUuid;
        }

        ac_url.push(url);
        //console.log(url);

    } else if (globeIndex) {
        // Si estamos en modo globo, determinar índices de tiles a pedir
        let indexes = globeIndexes();
        const ancient = (currentTime - 2 * refreshMs / globeSimLoad * globeTilesViewCount) / 1000;
        for (let i in indexes) {
            const k = indexes[i];
            if (globeIndexNow[k] < ancient) {
                globeIndexNow[k] = null;
            }
        }
        indexes.sort(function (x, y) {
            if (!globeIndexNow[x] && !globeIndexNow[y]) {
                return globeIndexDist[x] - globeIndexDist[y];
            }
            if (globeIndexNow[x] == null)
                return -1;
            if (globeIndexNow[y] == null)
                return 1;
            return (globeIndexNow[x] - globeIndexNow[y]);
        });

        if (binCraft && onlyMilitary && g.zoomLvl < 5.5) {
            ac_url.push('data/globeMil_42777' + suffix);
        } else {

            indexes = indexes.slice(0, globeSimLoad);

            let mid = (binCraft && onlyMilitary) ? 'Mil_' : '_';
            for (let i in indexes) {
                ac_url.push('data/globe' + mid + indexes[i].toString().padStart(4, '0') + suffix);
            }
        }
    } else {
        // Petición por defecto del archivo de aeronaves
        ac_url.push('data/aircraft' + suffix);
    }
    // Ajustar contadores y lanzar pedidos AJAX
    pendingFetches += ac_url.length;
    fetchCounter += ac_url.length;

    for (let i in ac_url) {
        if (debugFetch) {
            console.log('Fetching: ' + ac_url[i]);
        }
        let req;
        if (binCraft || zstd) {
            req = jQuery.ajax({
                url: `${ac_url[i]}`, method: 'GET',
                xhr: arraybufferRequest,
                timeout: 15000,
                urlIndex: i,
            });
        } else {
            req = jQuery.ajax({ url: `${ac_url[i]}`, dataType: 'json', urlIndex: i });
        }
        FetchPending.push(req);

        req
            .done(fetchDone)
            .fail(fetchFail);
    }

    // Ejecutar reaper si hace tiempo desde el último
    if (now - lastReap > 60) {
        reaper();
    }
}

// this function is called from index.html on body load
// kicks off the whole rabbit hole
// Inicia la aplicación cuando se carga el body (arranca toda la interfaz)
function initialize() {
    // Si la URL pide una prueba de iconos, muestra el canvas de prueba y sale
    if (usp.has('iconTest') || usp.has('iconTestLabels')) {
        jQuery('#iconTestCanvas').show();
        iconTest();
        return;
    }

    // things that can run without receiver json being known
    // Ejecuta pasos que no necesitan datos del receptor
    earlyInitPage();
    initMapEarly();
    // Espera que la configuración del receptor y el heatmap estén listos antes de continuar
    jQuery.when(configureReceiver, heatmapDefer).done(function () {
        // Si hay info del receptor, aplica ajustes iniciales (trazas, resolución, posición)
        if (receiverJson) {
            if (receiverJson.trace_hist_only)
                trace_hist_only = true;
            if (receiverJson.json_trace_interval < 2)
                traces_high_res = true;
            if (receiverJson.lat != null && !SiteOverride) {
                //console.log("receiver.json lat: " + receiverJson.lat)
                // Usa la lat/lon del receptor como posición del sitio si no hay override
                SiteLat = receiverJson.lat;
                SiteLon = receiverJson.lon;
            }
            if (receiverJson.jaeroTimeout) {
                // Ajusta timeout para datos jaero si viene en segundos en el JSON
                jaeroTimeout = receiverJson.jaeroTimeout * 60;
            }


            if (receiverJson.readsb) {
                // Si el receptor usa readsb, desactiva ciertos filtros
                positionFilter = false;
                altitudeFilter = false;
            }
        }
        // Si se conoce la posición del sitio, prepara los valores por defecto de centro del mapa
        if (SiteLat && SiteLon) {
            SitePosition = [SiteLon, SiteLat];
            DefaultCenterLat = SiteLat;
            DefaultCenterLon = SiteLon;
        }
        // Liberar la promesa de configuración del receptor
        configureReceiver = null;

        // Initialize stuff
        // Inicializar UI y mapa completos
        initPage();
        initMap();
        // Procesar toggles pasados por la URL
        processQueryToggles();
        // Cuando la cola de historial esté lista, empujarla
        jQuery.when(historyQueued).done(push_history);
        // Resolver que el historial está cargado si no hay items
        if (!nHistoryItems) {
            historyLoaded.resolve();
        }
        // Esperar a que todo (historial y zstd) esté listo y empezar la página
        jQuery.when(historyLoaded, zstdDefer).done(startPage);
    });
}

// Lee parámetros 'toggles' y aplica los cambios solicitados por URL
function processQueryToggles() {
    if (!usp.has('toggles')) {
        return;
    }
    let todo;
    try {
        // 'toggles' viene como "key1,value1,key2,value2,..."
        todo = usp.get('toggles').split(',');;
    } catch (e) {
        console.error(e);
        return;
    }
    while (todo.length >= 2) {
        // Saca la pareja key/value y activa o desactiva el toggle
        let key = todo.shift();
        let value = todo.shift();
        let state = true;
        if (value == 'false' || value == '0') {
            state = false;
        }
        try {
            toggles[key].toggle(state, "init");
            console.log((state ? "Enabled" : "Disabled") + " setting: " + key);
        } catch (e) {
            console.error(e);
        }
    }
}
// Cambia la velocidad de reproducción de trazas y recalcula si no está animando
function replaySpeedChange(arg) {
    traceOpts.replaySpeed = arg;
    console.log(arg);
    if (traceOpts.animate)
        return;
    legShift(0);
};
// Inicializa partes de la página que necesitan configuraciones previas
function initPage() {
    // Si estamos en modo "globo", añade toggles para controlar cuántas filas ver en la tabla
    if (globeIndex) {
        function setGlobeTableLimit() {
            let mult = 1 + 4 * toggles['moreTableLines1'].state + 16 * (toggles['moreTableLines2'] && toggles['moreTableLines2'].state);
            globeTableLimit = globeTableLimitBase * mult;
            if (toggles['allTableLines'] && toggles['allTableLines'].state)
                globeTableLimit = 1e9;
            if (onMobile)
                globeTableLimit /= 2;
        };
        new Toggle({
            key: "moreTableLines1",
            display: "More Table Lines",
            container: "#sidebar-table",
            init: false,
            setState: setGlobeTableLimit,
        });
        new Toggle({
            key: "moreTableLines2",
            display: "Even More Table Lines",
            container: "#sidebar-table",
            init: false,
            setState: setGlobeTableLimit,
        });
        new Toggle({
            key: "allTableLines",
            display: "All Table Lines",
            container: "#sidebar-table",
            init: false,
            setState: setGlobeTableLimit,
        });
    }

    // Oculta opciones de trazas si no hay historial
    if (!globeIndex && !haveTraces) {
        jQuery("#lastLeg_cb").parent().hide();
        jQuery('#show_trace').hide();
    }
    if (globeIndex) {
        // Si es mapa global, mostrar tabla en vista
        toggleTableInView('enable');
        if (icaoFilter) {
            toggleTableInView('disable');
        }
    } else {
        jQuery('#V').show();
    }
    // Si la URL fuerzas SiteLat/SiteLon, aplicarlo y guardar en almacenamiento local
    if (usp.has('SiteLat') && usp.has('SiteLon')) {
        let lat = parseFloat(usp.get('SiteLat'));
        let lon = parseFloat(usp.get('SiteLon'));
        if (!isNaN(lat) && !isNaN(lon)) {
            SiteLat = CenterLat = DefaultCenterLat = lat;
            SiteLon = CenterLon = DefaultCenterLon = lon;
            SiteOverride = true;
            loStore['SiteLat'] = lat;
            loStore['SiteLon'] = lon;
        }
    }
    if (loStore['SiteLat'] != null && loStore['SiteLon'] != null) {
        if (usp.has('SiteClear')) {
            loStore.removeItem('SiteLat');
            loStore.removeItem('SiteLon');
        }
    } else {
        // Si no hay posición del sitio guardada, usa valores por defecto
        CenterLat = DefaultCenterLat;
        CenterLon = DefaultCenterLon;
    }

}
// Inicializaciones tempranas que no dependen del receptor
function earlyInitPage() {
    // things that can run without receiver json being known
    // Si se configuró una lista de URLs de audio, crear los reproductores
    if (audio_url) {
        if (!Array.isArray(audio_url)) {
            audio_url = [audio_url];
        }
        let html = "";
        for (const entry of audio_url) {
            let url = entry;
            let title = entry;
            if (Array.isArray(url)) {
                url = entry[0];
                title = entry[1];
            }
            if (url) {
                // Inserta una fila con el reproductor de audio
                html += `
                    <tr><td style="text-align: center">${title}</td></tr>
                    <tr><td style="text-align: center">
                    <audio crossorigin="anonymous" preload="none" src="${url}" type="audio/mp3" controls="controls" autoplay="false"></audio>
                    </td></tr>
                `;
            }
        }
        if (html) {
            document.getElementById('mp3player').innerHTML = html;
            jQuery('#mp3player').show();
        }
    }

    let value;
    // Ajustes regionales (UK) que habilitan capas y estilo ATC
    if (uk_advisory) {
        defaultOverlays.push('uka_airports');
        defaultOverlays.push('uka_airspaces');
        defaultOverlays.push('uka_runways');
        defaultOverlays.push('uka_shoreham');
        atcStyle = true;
    }
    // Si el estilo ATC está activo, aplicar varios cambios visuales y de comportamiento
    if (atcStyle) {
        labels_top = true;
        tempTrails = true;
        tempTrailsTimeout = 45;
        SiteCirclesDistances = new Array(5, 10, 20);
        SiteCirclesLineDash = [5, 5];
        SiteCirclesColors = ['#2b3436', '#2b3436', '#2b3436'];
        MapType_tar1090 = 'carto_light_all';
        lineWidth = 4;
        g.enableLabels = true;
    }
    // Leer parámetros de URL y ajustar banderas/valores locales
    if (usp.has('debugFetch')) {
        debugFetch = true;
    }

    if (usp.has('rangeRings')) {
        SiteCircles = Boolean(parseInt(usp.get('rangeRings')));
    }

    if (usp.has('limitUpdates')) {
        let tmp = parseInt(usp.get('limitUpdates'));
        if (!isNaN(tmp))
            limitUpdates = tmp;
    }

    if (usp.has('screenshot')) {
        limitUpdates = 0;
    }

    if (usp.has('nowebgl')) {
        loStore['webgl'] = "false";
    }

    if (usp.has('showGrid')) {
        showGrid = true;
        loStore['layer_site_pos'] = 'true';
    }

    if (usp.has('halloween'))
        halloween = true;

    if (usp.has('outlineWidth')) {
        let tmp = parseInt(usp.get('outlineWidth'));
        if (!isNaN(tmp))
            outlineWidth = tmp;
    }

    if (usp.has('kiosk')) {
        // Modo kiosko: simplifica UI y aumenta escala
        tempTrails = true;
        hideButtons = true;
        userScale = 2;
    }

    if (pTracks) {
        // Si estamos mostrando pistas persistentes, no dejar que los aviones desaparezcan
        noVanish = true;
        buttonActive('#P', noVanish);
        filterTracks = true;
        selectAllPlanes();
    }

    if (usp.has('mobile'))
        onMobile = true;
    if (usp.has('desktop'))
        onMobile = false;

    if (usp.has('hideSidebar'))
        loStore['sidebar_visible'] = "false";
    if (usp.has('sidebarWidth')) {
        loStore['sidebar_width'] = usp.get('sidebarWidth');
        loStore['sidebar_visible'] = "true";
    }

    if (usp.has('allTracks')) {
        SelectedAllPlanes = true;
        buttonActive('#T', SelectedAllPlanes);
    }
    if (usp.has('tempTrails')) {
        tempTrails = true;
        let tmp = parseInt(usp.get('tempTrails'));
        if (tmp > 0)
            tempTrailsTimeout = tmp;
    }
    if (usp.has('squareMania')) {
        squareMania = true;
    }

    if (usp.has('darkerColors')) {
        darkerColors = true;
    }

    if (usp.has('mapDim')) {
        let dim = parseFloat(usp.get('mapDim'));
        if (!isNaN(dim))
            mapDimPercentage = dim;
    } else if (heatmap) {
        // Si heatmap activo, atenuar mapa automáticamente
        mapDimPercentage = 0.6;
        MapDim = true;
    }

    if (usp.has('noRegOnly'))
        noRegOnly = true;

    if (usp.has('nogpsOnly') || usp.has('badgps'))
        nogpsOnly = true;

    if (usp.has('mapContrast')) {
        let contrast = parseFloat(usp.get('mapContrast'));
        if (!isNaN(contrast))
            mapContrastPercentage = contrast;
    }

    if (value = usp.getFloat('labelScale')) {
        labelScale = value;
    }

    if (value = usp.getFloat('largeMode')) {
        userScale = Math.pow(1.2, value) / 1.2;
        iconScale = 1;
    }

    if (value = usp.getFloat('iconScale')) {
        iconScale = value;
    } else if (loStore['iconScale'] != null) {
        iconScale = loStore['iconScale'];
    }

    if (value = usp.getFloat('scale')) {
        userScale = value;
    } else if (loStore['userScale'] != null) {
        userScale = loStore['userScale'];
    }
    // Inicializa sliders para ajustar escala de iconos y UI
    const slideBase = 0.6;
    jQuery('#iconScaleSlider').slider({
        value: Math.pow(iconScale, 1 / slideBase),
        step: 0.02,
        min: 0.1,
        max: 3,
        change: function (event, ui) {
            iconScale = Math.pow(ui.value, slideBase);
            checkScale();
            mapRefresh();
            loStore['iconScale'] = iconScale;
        },
    });

    jQuery('#userScaleSlider').slider({
        value: Math.pow(userScale, 1 / slideBase),
        step: 0.02,
        min: 0.5,
        max: 3,
        change: function (event, ui) {
            userScale = Math.pow(ui.value, slideBase);
            checkScale();
            mapRefresh();
            loStore['userScale'] = userScale;

            setGlobalScale(userScale);
        },
    });
    setGlobalScale(userScale, "init");

    if (usp.has('hideButtons'))
        hideButtons = true;

    if (usp.has('baseMap')) {
        overrideMapType = usp.get('baseMap');
    }

    if (usp.has('offlineMap')) {
        overrideMapType = 'osm_tiles_offline';
    }

    if (usp.has('overlays'))
        enableOverlays = usp.get('overlays').split(',');

    if (value = usp.get('icaoFilter')) {
        icaoFilter = value.toLowerCase().split(',');
    }

    if (value = usp.get('icaoBlacklist')) {
        icaoBlacklist = value.toLowerCase().split(',');
    }

    if (value = usp.getFloat('filterMaxRange')) {
        filterMaxRange = value;
    }
    // Convierte rango en millas náuticas a metros
    filterMaxRange *= 1852; // convert from nmi to meters


    if (value = usp.getFloat('mapOrientation')) {
        g.mapOrientation = value;
    }
    g.mapOrientation *= (Math.PI / 180); // adjust to radians
    // Si la URL pide replay, preparar la hora solicitada
    if (usp.has('r') || usp.has('replay')) {
        let numbers = (usp.get('r') || usp.get('replay') || "").split(/(?:-|:)/);
        let ts = new Date();
        if (numbers.length == 5) {
            ts.setUTCFullYear(numbers[0]);
            ts.setUTCMonth(numbers[1] - 1);
            ts.setUTCDate(numbers[2]);
            ts.setUTCHours(numbers[3]);
            ts.setUTCMinutes(numbers[4]);
        }
        if (isNaN(ts)) {
            ts = new Date();
        }
        console.log(ts);
        replay = replayDefaults(ts);
    }

    //Pulling filters from params
    // Extrae filtros de altitud desde la URL y actívalos
    if (usp.has('filterAltMin')) {
        const minAlt = usp.getInt('filterAltMin');
        if (minAlt !== null) {
            PlaneFilter.minAltitude = minAlt;
            PlaneFilter.enabled = true;
            PlaneFilter.maxAltitude = 1000000;
        }
    }
    if (usp.has('filterAltMax')) {
        const maxAlt = usp.getInt('filterAltMax');
        if (maxAlt !== null) {
            PlaneFilter.maxAltitude = maxAlt;
            PlaneFilter.enabled = true;
            if (PlaneFilter.minAltitude === undefined) {
                PlaneFilter.minAltitude = -1000000;
            }
        }
    }

    if (usp.has('filterSources')) {
        PlaneFilter.sources = usp.get('filterSources').split(',');
        shareFiltersParam = true;
    }
    if (usp.has('filterDbFlag')) {
        PlaneFilter.flagFilter = usp.get('filterDbFlag').split(',');
        shareFiltersParam = true;
    }


    if (false && iOSVersion() <= 12 && !('PointerEvent' in window)) {
        // Mensaje para navegadores antiguos (normalmente no se ejecuta)
        jQuery("#generic_error_detail").text("Enable Settings - Safari - Advanced - Experimental features - Pointer Events");
        jQuery("#generic_error").css('display', 'block');
        setTimeout(function () {
            jQuery("#generic_error").css('display', 'none');
        }, 30000);
    }
    // Aplicar estado inicial de etiquetas desde almacenamiento local o URL
    if (loStore['enableLabels'] == 'true' || usp.has('enableLabels')) {
        toggleLabels();
    }
    if (usp.has('extendedLabels')) {
        g.extendedLabels = parseInt(usp.getFloat('extendedLabels'));
        toggleExtendedLabels({ noIncrement: true });
    } else if (loStore['extendedLabels']) {
        g.extendedLabels = parseInt(loStore['extendedLabels']);
        toggleExtendedLabels({ noIncrement: true });
    }
    if (loStore['trackLabels'] == "true" || usp.has('trackLabels')) {
        toggleTrackLabels();
    }
    if (loStore['tableInView'] == "true" || usp.has('tableInView')) {
        toggleTableInView('enable');
    }
    if (loStore['debug'] == "true")
        debug = true;
    if (loStore['debugPosFilter'] == "true")
        debugPosFilter = true;

    if (loStore['noVanish'] == "true" || usp.has('noVanish')) {
        noVanish = true;
        //filterTracks = noVanish;
        //loStore['noVanish'] = "false";
        buttonActive('#P', noVanish);
    }
    // Inicializa las pestañas y recuerda la activa
    jQuery('#tabs').tabs({
    active: (loStore['active_tab'] !== undefined) ? loStore['active_tab'] : false,
    
    activate: function (event, ui) {
        loStore['active_tab'] = jQuery("#tabs").tabs("option", "active");
    },
    collapsible: true
    });

    // Set page basics
    // Títulos y módulos básicos de la página
    document.title = PageName;

    initializeUnitsSelector();
    TAR.planeMan.init();

    if (loStore['sidebar_width'] != null)
        jQuery('#sidebar_container').width(loStore['sidebar_width']);
    else
        jQuery('#sidebar_container').width('25%');

    if (jQuery('#sidebar_container').width() > jQuery(window).innerWidth() * 0.8)
        jQuery('#sidebar_container').width('30%');

    loStore['sidebar_width'] = jQuery('#sidebar_container').width();

    jQuery('#sidebar_container').on('resize', function () {
        loStore['sidebar_width'] = jQuery('#sidebar_container').width();
    });

    // Set up event handlers for buttons
    // Configura botones y formularios básicos (altímetro, filtros, búsqueda, trace, replay)
    jQuery("#expand_sidebar_button").click(expandSidebar);
    jQuery("#shrink_sidebar_button").click(showMap);

    jQuery("#altimeter_form").submit(onAltimeterChange);
    jQuery("#altimeter_set_standard").click(onAltimeterSetStandard);
    jQuery("#altimeter_set_selected").click(onAltimeterSetSelected);

    // Set up altitude filter button event handlers and validation options
    jQuery("#altitude_filter_form").submit(onFilterByAltitude);
    jQuery("#source_filter_form").submit(updateSourceFilter);
    jQuery("#flag_filter_form").submit(updateFlagFilter);

    jQuery("#altitude_filter_reset_button").click(onResetAltitudeFilter);
    jQuery("#source_filter_reset_button").click(onResetSourceFilter);
    jQuery("#flag_filter_reset_button").click(onResetFlagFilter);

    // Initialize other controls
    jQuery("#search_form").submit(unifiedSearch);
    jQuery("#search_clear_button").click(onSearchClear);
    /*
    jQuery("#jump_clear_button").click(function() {
        jQuery("#jump_input").val("");
        jQuery("#jump_input").blur();
    });
    jQuery("#jump_form").submit(onJump);
    */

    jQuery("#show_trace").click(toggleShowTrace);
    jQuery("#trace_back_1d").click(function () { shiftTrace(-1) });
    jQuery("#trace_jump_1d").click(function () { shiftTrace(1) });
    // Selector de fecha para trazas históricas
    jQuery("#histDatePicker").datepicker({
        maxDate: '+1d',
        dateFormat: "yy-mm-dd",
        onSelect: function (date) {
            setTraceDate({ string: date });
            shiftTrace();
            jQuery("#histDatePicker").blur();
        },
        autoSize: true,
        onClose: !onMobile ? null : function (dateText, inst) {
            jQuery("#histDatePicker").attr("disabled", false);
        },
        beforeShow: !onMobile ? null : function (input, inst) {
            jQuery("#histDatePicker").attr("disabled", true);
        },
    });
    // Botón play/pause del replay
    jQuery("#replayPlay").click(function () {

        if (replay.playing) {
            //if playing, pause.
            playReplay(false);

        } else {
            //if paused, play.
            playReplay(true);
        }
    });

    jQuery("#leg_prev").click(function () { legShift(-1) });
    jQuery("#leg_next").click(function () { legShift(1) });

    jQuery('#settingsCog').on('click', function () {
        jQuery('#settings_infoblock').toggle();
    });

    if (onMobile) {
        // Botón fullscreen para móviles
        jQuery('#fullscreenButton').on('click', function () {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        });
    } else {
        jQuery('#fullscreenButton').hide();
    }

    jQuery('#settings_close').on('click', function () {
        jQuery('#settings_infoblock').hide();
    });

    jQuery('#groundvehicle_filter').on('click', function () {
        filterGroundVehicles(true);
        refresh();
    });

    jQuery('#blockedmlat_filter').on('click', function () {
        filterBlockedMLAT(true);
        refresh();
    });
    // Toggle para mostrar solo último tramo (last leg)
    new Toggle({
        key: "lastLeg",
        display: "Last Leg only",
        container: "#settingsLeft",
        init: true,
        setState: function (state) {
            lastLeg = state;
            if (loadFinished && !showTrace) {
                for (let i in SelPlanes) {
                    SelPlanes[i].processTrace();
                }
            }
        }
    });
    // Toggle para usar altitudes geométricas en etiquetas
    new Toggle({
        key: "labelsGeom",
        display: "Labels: geom. alt. (WGS84)",
        container: "#settingsLeft",
        init: labelsGeom,
        setState: function (state) {
            labelsGeom = state;
            if (loadFinished) {
                remakeTrails();
                refreshSelected();
            }
        }
    });
    // Toggle para conversión EGM (más lento)
    new Toggle({
        key: "geomUseEGM",
        display: "Geom. alt.: WGS84 -> EGM conversion (long load)",
        container: "#settingsLeft",
        init: geomUseEGM,
        setState: function (state) {
            geomUseEGM = state;
            if (geomUseEGM) {
                jQuery('#selected_altitude_geom1')
                jQuery('#selected_altitude_geom1_title').updateText('EGM96 altitude');
                jQuery('#selected_altitude_geom2_title').updateText('Geom. EGM96');
                let egm = loadEGM();
                if (egm) {
                    egm.addEventListener('load', function () {
                        remakeTrails();
                        refreshSelected();
                    });
                    return;
                }
            } else {
                jQuery('#selected_altitude_geom1_title').updateText('Alt. WGS84:');
                jQuery('#selected_altitude_geom2_title').updateText('Alt. WGS84:');
            }
            if (loadFinished) {
                remakeTrails();
                refreshSelected();
            }
        }
    });
    // Usar corrección barométrica QNH para mostrar altitudes corregidas
    new Toggle({
        key: "baroUseQNH",
        display: "Baro. alt.: correct for QNH",
        container: "#settingsLeft",
        init: baroUseQNH,
        setState: function (state) {
            baroUseQNH = state;
            if (baroUseQNH) {
                jQuery('#selected_altitude1_title').updateText('Corr. baro-alt');
                jQuery('#selected_altitude2_title').updateText('Corr. baro.');
                jQuery('#infoblock_altimeter').removeClass('hidden');
            } else {
                jQuery('#selected_altitude1_title').updateText('Alt. baro.:');
                jQuery('#selected_altitude2_title').updateText('Alt. baro.:');
                jQuery('#infoblock_altimeter').addClass('hidden');
            }
            if (loadFinished) {
                remakeTrails();
                refreshSelected();
            }
        }
    });
    // Si la URL pide etiquetas geométricas, activar el toggle correspondiente al inicio
    if (usp.has('labelsGeom')) {
        toggles['labelsGeom'].toggle(true, 'init');
    }
    // Si la URL pide conversión EGM, activar ese toggle al inicio
    if (usp.has('geomEGM')) {
        toggles['geomUseEGM'].toggle(true, 'init');
    }
    // mostrar horas UTC en etiquetas en vivo
    new Toggle({
        key: "utcTimesLive",
        display: "Live track labels: UTC",
        container: "#settingsLeft",
        init: utcTimesLive,
        setState: function (state) {
            utcTimesLive = state;
            remakeTrails();
            refreshSelected();
        }
    });
    // mostrar horas UTC en etiquetas en trazas históricas
    new Toggle({
        key: "utcTimesHistoric",
        display: "Historic track labels: UTC",
        container: "#settingsLeft",
        init: utcTimesHistoric,
        setState: function (state) {
            utcTimesHistoric = state;
            remakeTrails();
            refreshSelected();
        }
    });

    // etiquetas de viento más pequeñas
    new Toggle({
        key: "windLabelsSlim",
        display: "Smaller wind labels",
        container: "#settingsLeft",
        init: windLabelsSlim,
        setState: function (state) {
            windLabelsSlim = state;
            if (!loadFinished)
                return;
            for (let key in g.planesOrdered) {
                g.planesOrdered[key].updateMarker();
            }
        }
    });

    // mostrar/ocultar unidades en las etiquetas
    new Toggle({
        key: "showLabelUnits",
        display: "Label units",
        container: "#settingsLeft",
        init: showLabelUnits,
        setState: function (state) {
            showLabelUnits = state;
            if (!loadFinished)
                return;
            for (let key in g.planesOrdered) {
                g.planesOrdered[key].updateMarker();
            }
            remakeTrails();
            refreshSelected();
        }
    });

    // Al hacer clic: pausar trazas y mostrar tiempo actual del replay
    jQuery('#tStop').on('click', function () { traceOpts.replaySpeed = 0; gotoTime(traceOpts.showTime); });
    // botones para velocidad
    jQuery('#t1x').on('click', function () { replaySpeedChange(1); });
    jQuery('#t5x').on('click', function () { replaySpeedChange(5); });
    jQuery('#t10x').on('click', function () { replaySpeedChange(10); });
    jQuery('#t20x').on('click', function () { replaySpeedChange(20); });
    jQuery('#t40x').on('click', function () { replaySpeedChange(40); });

    // incluir filtros en las URLs compartidas (para reconstruir estado)
    new Toggle({
        key: "shareFilters",
        display: "Include Filters In URLs",
        container: "#settingsRight",
        init: false,
        setState: function (state) {
            updateAddressBar();
        }
    });

    // modo depuración de trazas (muestra más detalles)
    new Toggle({
        key: "debugTracks",
        display: "Debug Tracks",
        container: "#settingsRight",
        init: false,
        setState: function (state) {
            debugTracks = state;
            remakeTrails();
        }
    });

    // mostrar todo para depuración (activa flag global)
    new Toggle({
        key: "debugAll",
        display: "Debug show all",
        container: "#settingsRight",
        init: false,
        setState: function (state) {
            if (state)
                debugAll = true;
            else
                debugAll = false;
        }
    });

    /*
    new Toggle({
        key: "SiteCircles",
        display: "Distance Circles",
        container: "#settingsRight",
        init: SiteCircles,
        setState: function(state) {
            SiteCircles = state;
            if (loadFinished)
                initSitePos();
        }
    });
    */

    // permitir actualizar ubicación GPS del navegador
    new Toggle({
        key: "updateLocation",
        display: "Update GPS location",
        container: "#settingsRight",
        init: updateLocation,
        setState: function (state) {
            updateLocation = state;
            runAfterLoad(watchPosition);
        }
    });

    // auto-selección de avión más cercano
    new Toggle({
        key: "autoselect",
        display: "Auto-select plane",
        container: "#settingsRight",
        init: autoselect,
        setState: function (state) {
            autoselect = state;
            setAutoselect();
        }
    });
    // Si la URL solicita autoselect, activarlo ya
    if (usp.has('autoselect')) {
        autoselect = true;
        setAutoselect();
    }

    // aviones coloreados o en escala de grises
    new Toggle({
        key: "ColoredPlanes",
        display: "Colored Planes",
        container: "#settingsRight",
        init: true,
        setState: function (state) {
            if (state)
                monochromeMarkers = null;
            else
                monochromeMarkers = "#EEEEEE";

            refreshFeatures();
        }
    });
    // trazas coloreadas o en negro
    new Toggle({
        key: "ColoredTrails",
        display: "Colored Trails",
        container: "#settingsRight",
        init: true,
        setState: function (state) {
            if (state)
                monochromeTracks = null;
            else
                monochromeTracks = "#000000";

            remakeTrails();
        }
    });
    // Toggle para mostrar/ocultar la barra lateral (sidebar)
    new Toggle({
        key: "sidebar_visible",
        display: "Sidebar visible",
        container: null,
        checkbox: null,
        button: '#toggle_sidebar_button',
        init: false, //Esto determina si abre la sidebar por defecto la primera vez. Funcion ternaria para movil: init: (onMobile ? false : true),
        setState: function (state) {
            if (state) {
                jQuery("#sidebar_container").show();
                jQuery("#expand_sidebar_button").show();
                jQuery("#toggle_sidebar_button").removeClass("show_sidebar");
                jQuery("#toggle_sidebar_button").addClass("hide_sidebar");
                if (!g.sidebar_initiated) {
                    g.sidebar_initiated = true;
                    // Set up map/sidebar splitter
                    jQuery("#sidebar_container").resizable({
                        handles: {
                            w: '#splitter'
                        },
                        minWidth: 150,
                        maxWidth: (jQuery(window).innerWidth() * 0.8),
                    });

                    jQuery("#splitter").dblclick(function () {
                        jQuery('#legend').hide();
                        jQuery('#sidebar_container').width('auto');
                        updateMapSize();
                        loStore['sidebar_width'] = jQuery('#sidebar_container').width();
                        jQuery('#sidebar_container').width(loStore['sidebar_width']);
                        jQuery('#legend').show();
                    });

                }
                if (!hideButtons) {
                    jQuery('#splitter').show();
                }
            } else {
                if (loadFinished) {
                    jQuery("#sidebar_container").hide();
                    jQuery("#expand_sidebar_button").hide();
                    jQuery("#toggle_sidebar_button").removeClass("hide_sidebar");
                    jQuery("#toggle_sidebar_button").addClass("show_sidebar");
                }
            }
            if (loadFinished) {
                updateMapSize();
            }
        },
    });
    // Si no mostramos fotos, desactivar APIs de fotos
    if (!showPictures) {
        planespottingAPI = false;
        planespottersAPI = false;
    }
    // Toggle para activar fotos desde planespotting.be
    new Toggle({
        key: "planespottingAPI",
        display: "Pictures planespotting.be",
        container: "#settingsRight",
        init: planespottingAPI,
        setState: function (state) {
            planespottingAPI = state;
            if (state) {
                toggles['planespottersAPI'] && toggles['planespottersAPI'].toggle(false);
            }
            setPictureVisibility();
            refreshSelected();
        }
    });
    // Toggle para activar fotos desde planespotters.net
    new Toggle({
        key: "planespottersAPI",
        display: "Pictures planespotters.net",
        container: "#settingsRight",
        init: planespottersAPI,
        setState: function (state) {
            planespottersAPI = state;
            if (state) {
                toggles['planespottingAPI'] && toggles['planespottingAPI'].toggle(false);
            }
            setPictureVisibility();
            refreshSelected();
        }
    });
    // Si hay URL para API de rutas, configurar toggle y ajustes relacionados
    if (routeApiUrl) {
        if (location.protocol == 'http:' && routeApiUrl == "https://adsb.im/api/0/routeset") {
            // adsb.im API provider kindly asks that tar1090 uses http for the route API if possible
            routeApiUrl = "http://adsb.im/api/0/routeset";
        }
        // Toggle para activar consulta de rutas (lookup)
        new Toggle({
            key: "useRouteAPI",
            display: "Lookup route",
            container: "#settingsRight",
            init: useRouteAPI,
            setState: function (state) {
                useRouteAPI = state;
                if (useRouteAPI) {
                    jQuery('#routeRow').show();
                    jQuery('#routeRowHighlighted').show();
                } else {
                    jQuery('#routeRow').hide();
                    jQuery('#routeRowHighlighted').hide();
                }
            }
        });
        // manejar valor de compatibilidad con variable antigua
        if (useIataAirportCodes == false) {
            routeDisplay = 'icao'; // cope with deprecated useIata var
        }
        // si la URL indica cómo mostrar rutas, usarlo
        if (usp.has('routeDisplay')) {
            routeDisplay = usp.get('routeDisplay');
        }
        routeDisplay = routeDisplay.split(',');
    } else {
        useRouteAPI = false;
    }

    // Toggle: habilitar bloque de información lateral (infoblock)
    new Toggle({
        key: "enableInfoblock",
        display: "Enable Infoblock",
        container: "#settingsRight",
        init: true,
        setState: function (state) {
            adjustInfoBlock();
        }
    });
    // Toggle: infoblock ancho
    new Toggle({
        key: "wideInfoblock",
        display: "Wide Infoblock",
        container: "#settingsRight",
        init: wideInfoBlock,
        setState: function (state) {
            wideInfoBlock = state;
            adjustInfoBlock();
        }
    });
    // Si estamos en móvil, desactivar eventos por hover y ocultar contenedores innecesarios
    if (onMobile) {
        enableMouseover = false;
        (typeof hideById != 'undefined') && (hideById) && (hideById('tracking_leaderboard_container'));
    }
    // Toggle: activar/desactivar caja informativa al pasar el ratón
    new Toggle({
        key: "enableMouseover",
        display: "Enable mouse-over block",
        container: "#settingsRight",
        init: enableMouseover,
        setState: function (state) {
            enableMouseover = state;
            if (loadFinished) {
                checkPointermove();
            }
        }
    });


    // Checkbox: seleccionar/deseleccionar todos los aviones
    jQuery('#selectall_checkbox').on('click', function () {
        if (jQuery('#selectall_checkbox').hasClass('settingsCheckboxChecked')) {
            deselectAllPlanes();
        } else {
            selectAllPlanes();
        }
    })

    // Force map to redraw if sidebar container is resized - use a timer to debounce
    // Si la barra lateral cambia de tamaño, forzar redibujo del mapa (con debounce)
    jQuery("#sidebar_container").on("resize", function () {
        clearTimeout(mapResizeTimeout);
        mapResizeTimeout = setTimeout(updateMapSize, 20);
    });
    // Aplicar filtros iniciales: vehículos en tierra y MLAT bloqueado
    filterGroundVehicles(false);
    filterBlockedMLAT(false);
    // Inicializar el gráfico de altitud
    TAR.altitudeChart.init();
    // Si agregador, mostrar cabeceras adicionales y proteger uso en iframe
    if (aggregator) {
        jQuery('#aggregator_header').show();
        jQuery('#credits').show();
        if (!onMobile) {
            jQuery('#creditsSelected').show();
        }
        jQuery('#selected_infoblock').addClass('aggregator-selected-bg');

        // activate to prevent iframe use
        // evitar uso dentro de iframe si está prohibido
        if (inhibitIframe && window.self != window.top) {
            window.top.location.href = "https://www.aggregator.com/";
            return;
        }
    }
    // Si hay enlace para configuración de imágenes, reemplazar HOSTNAME por el host actual y mostrar enlace
    if (imageConfigLink != "") {
        let host = window.location.hostname;
        let configLink = imageConfigLink.replace('HOSTNAME', host);
        jQuery('#imageConfigLink').attr('href', configLink)
        jQuery('#imageConfigLink').text(imageConfigText)
        jQuery('#imageConfigHeader').show();
    }
    // Si existe servidor AIScatcher, sustituir HOSTNAME en su URL
    if (aiscatcher_server) {
        aiscatcher_server = aiscatcher_server.replace('HOSTNAME', window.location.hostname);
    }
    // Si se pidió ocultar botones, aplicarlo ahora y también después de la carga
    if (hideButtons) {
        showHideButtons();
        runAfterLoad(showHideButtons);
    }
}
// Inicializa la leyenda de colores mostrando cada fuente de datos con su color
function initLegend(colors) {
    // Crea contenido HTML para la entrada ADS-B con su color
    let html = '';
    // Añade entrada UAT/ADS-R
    html += '<div class="legendTitle" style="background-color:' + colors['adsb'] + ';">ADS-B</div>';
    html += '<div class="legendTitle" style="background-color:' + colors['uat'] + ';">UAT / ADS-R</div>';
    // Añade entrada MLAT
    html += '<div class="legendTitle" style="background-color:' + colors['mlat'] + ';">MLAT</div>';
    html += '<br>';
    // Añade entrada TIS-B
    html += '<div class="legendTitle" style="background-color:' + colors['tisb'] + ';">TIS-B</div>';
    // Si no es vista global, mostrar Mode-S
    if (!globeIndex)
        html += '<div class="legendTitle" style="background-color:' + colors['modeS'] + ';">Mode-S</div>';
    // Si es vista global, mostrar categoría "Other"
    if (globeIndex)
        html += '<div class="legendTitle" style="background-color:' + colors['other'] + ';">Other</div>';
    // Si hay AIScatcher, mostrar AIS con su color
    if (aiscatcher_server)
        html += '<div class="legendTitle" style="background-color:' + colors['ais'] + ';">AIS</div>';
    html += '<div class="legendTitle" style="background-color:' + colors['adsc'] + `;">${jaeroLabel}</div>`;
    // Inserta la leyenda completa en el DOM
    document.getElementById('legend').innerHTML = html;
}
// Inicializa el filtro por fuentes con elementos seleccionables
function initSourceFilter(colors) {
    // Creador rápido de una entrada de lista para el filtro
    const createFilter = function (color, text, key) {
        return '<li class="ui-widget-content" style="background-color:' + color + ';" id="source-filter-' + key + '">' + text + '</li>';
    };

    // Construye el HTML de opciones de fuente
    let html = '';
    html += createFilter(colors['adsb'], 'ADS-B', sources[0]);

    html += createFilter(colors['uat'], 'UAT / ADS-R', sources[1][0]);
    html += createFilter(colors['mlat'], 'MLAT', sources[2]);
    html += createFilter(colors['tisb'], 'TIS-B', sources[3]);
    html += createFilter(colors['modeS'], 'Mode-S', sources[4]);
    html += createFilter(colors['other'], 'Other', sources[5]);
    html += createFilter(colors['adsc'], jaeroLabel, sources[6]);
    // Si hay AIS, añadir opción AIS
    if (aiscatcher_server) {
        html += createFilter(colors['ais'], 'AIS', sources[7]);
    }
    // Pone el HTML en el contenedor del filtro
    document.getElementById('sourceFilter').innerHTML = html;
    // Hace que la lista sea seleccionable y actualiza sourcesFilter al terminar
    jQuery("#sourceFilter").selectable({
        stop: function () {
            sourcesFilter = [];
            jQuery(".ui-selected", this).each(function () {
                const index = jQuery("#sourceFilter li").index(this);
                if (Array.isArray(sources[index]))
                    sources[index].forEach(member => { sourcesFilter.push(member); });
                else
                    sourcesFilter.push(sources[index]);
            });
        }
    });
    // Forzar que la selección actúe como si se pulsara Ctrl (selección múltiple)
    jQuery("#sourceFilter").on("selectablestart", function (event, ui) {
        event.originalEvent.ctrlKey = true;
    });
}
// Inicializa el filtro por banderas (military, PIA, LADD)
function initFlagFilter(colors) {
    // Creador de elementos para el filtro de banderas
    const createFilter = function (color, text, key) {
        return '<li class="ui-widget-content" style="background-color:' + color + ';" id="flag-filter-' + key + '">' + text + '</li>';
    };
    // Construye HTML con opciones de flag
    let html = '';
    html += createFilter(colors['tisb'], 'Military', flagFilterValues[0]);
    //html += createFilter(colors['mlat'], 'Interesting');
    html += createFilter(colors['uat'], 'PIA', flagFilterValues[1]);
    html += createFilter(colors['adsb'], 'LADD', flagFilterValues[2]);
    // Inserta en DOM
    document.getElementById('flagFilter').innerHTML = html;
    // Hace la lista selectable y actualiza flagFilter cuando termina
    jQuery("#flagFilter").selectable({
        stop: function () {
            flagFilter = [];
            jQuery(".ui-selected", this).each(function () {
                const index = jQuery("#flagFilter li").index(this);
                if (Array.isArray(flagFilterValues[index]))
                    flagFilterValues[index].forEach(member => { flagFilter.push(member); });
                else
                    flagFilter.push(flagFilterValues[index]);
            });
        }
    });
    // Forzar comportamiento de selección múltiple
    jQuery("#flagFilter").on("selectablestart", function (event, ui) {
        event.originalEvent.ctrlKey = true;
    });
}
// Empuja en memoria la lista de archivos de historial para procesarlos después
function push_history() {
    // Contadores y buffer de posiciones inicializados
    HistoryItemsReturned = 0;
    PositionHistoryBuffer = [];
    // Llama a push_history_item para cada ítem esperado
    for (let i = 0; i < nHistoryItems; i++) {
        push_history_item(i);
    }
}
// Lanza la promesa deferHistory[i] y procesa respuesta o fallo
function push_history_item(i) {
    deferHistory[i]
        .done(function (json) {
            // Contador de items recibidos
            HistoryItemsReturned++;

            if (HistoryChunks) {
                if (json && json.files) {
                    //g.refreshHistory && console.log("itemsreturned chunk: " + HistoryItemsReturned + " chunklen: " + json.files.length);
                    // Si viene como chunk, añadir cada archivo del chunk
                    for (let i in json.files) {
                        PositionHistoryBuffer.push(json.files[i]);
                        if (i == 0 || i == json.files.length - 1) {
                            //g.refreshHistory && console.log("history buffer push: " + localTime(new Date(json.files[i].now * 1000)));
                        }
                    }
                } else if (json && json.now) {
                    //g.refreshHistory && console.log("itemsreturned simple json: " + HistoryItemsReturned);
                    // Si viene como un json simple, añadirlo
                    PositionHistoryBuffer.push(json);
                    //g.refreshHistory && console.log("history buffer push: " + localTime(new Date(json.now * 1000)));
                }
            } else {
                // Si no hay chunks, añadir directamente
                PositionHistoryBuffer.push(json);
            }
            // Si ya recibimos todos, parsear historial
            if (HistoryItemsReturned == nHistoryItems) {
                parseHistory();
            }
            // Comprobación de exceso (debug)
            if (HistoryItemsReturned > nHistoryItems) {
                console.log(localTime(new Date()) + " WARNING: (HistoryItemsReturned > nHistoryItems)");
            }
        })

        .fail(function (jqxhr, status, error) {

            //Doesn't matter if it failed, we'll just be missing a data point
            //console.log(error);
            // Si falla, contar como recibido pero faltará ese punto
            HistoryItemsReturned++;
            if (HistoryItemsReturned == nHistoryItems) {
                parseHistory();
            }
        });
}
// Parsea PositionHistoryBuffer y aplica las trazas históricas al estado actual
function parseHistory() {
    console.timeEnd("Downloaded History");
    console.time("Loaded aircraft tracks from History");
    // Liberar referencias a deferHistory
    for (let i in deferHistory)
        deferHistory[i] = null;
    deferHistory = null;

    // Si hay datos en el buffer
    if (PositionHistoryBuffer.length > 0) {

        // Sort history by timestamp
        // Ordenar por timestamp (más reciente primero)
        console.log(localTime(new Date()) + " Sorting history: " + PositionHistoryBuffer.length);
        PositionHistoryBuffer.sort(function (x, y) { return (y.now - x.now); });
        // Tiempo actual en segundos
        let currentTime = new Date().getTime() / 1000;
        // Si no estamos preservando tracks o evitando reap, construir lista de "keep" por reapTimeout
        if (!pTracks && !noVanish) {
            // get all planes within the reapTimeout
            g.historyKeep = {};
            for (let i = 0; i < PositionHistoryBuffer.length; i++) {
                let data = PositionHistoryBuffer[i];
                // Si el item es más antiguo que reapTimeout, dejamos de mirar
                if (currentTime - data.now > reapTimeout) {
                    break;
                }
                // Revisa cada aeronave en ese paquete y marca las que han enviado dentro del timeout
                for (let j = 0; j < data.aircraft.length; j++) {
                    const ac = data.aircraft[j];
                    const isArray = Array.isArray(ac);
                    const hex = isArray ? ac[0] : ac.hex;
                    const seen = isArray ? ac[6] : ac.seen;
                    if (currentTime - (data.now - seen) < reapTimeout) {
                        g.historyKeep[hex] = 1;
                    }
                }
                //console.log("hist: " + localTime(new Date(data.now * 1000)));
            }
            // También mantener los aviones actualmente en memoria
            for (let i in g.planesOrdered) {
                let hex = g.planesOrdered[i].icao;
                g.historyKeep[hex] = 1;
            }
        }

        // Process history
        // Variables para procesar el buffer
        let data;
        let h = 0;
        let pruneInt = 100;
        let lastTimestamp = 0;
        let counter = 0;
        // Procesa cada paquete desde el más antiguo (pop)
        while (data = PositionHistoryBuffer.pop()) {
            counter++;

            if (data.now < lastTimestamp) {
                console.log('parseHistory sorting issue');
            }
            // Si hay huecos grandes entre timestamps, mostrar aviso
            if (lastTimestamp && data.now - lastTimestamp > 15) {
                console.log("History " + String(counter).padStart(4) + " from: "
                    + localTime(new Date(data.now * 1000)) + " GAP: " + localTime(new Date(lastTimestamp * 1000)));
            }

            lastTimestamp = data.now;
            // Si pTracks limita por horas, saltar paquetes antiguos
            if (pTracks && currentTime - data.now > pTracks * 3600) {
                continue;
            }
            // Si se pide refrescar historial y el paquete es anterior a now, saltarlo
            if (g.refreshHistory && now > data.now) {
                continue;
            }

            // process new data
            // Procesar los datos: si quedan pocos items en el buffer, marcar init=false para optimizaciones
            if (PositionHistoryBuffer.length < 10) {
                processReceiverUpdate(data, false);
            } else {
                processReceiverUpdate(data, true);
            }

            ++h;
            // Log periódico durante el proceso
            if (h == 1 || h % pruneInt == 0 || PositionHistoryBuffer.length == 0) {
                console.log("Apply History " + String(counter).padStart(4) + " from: "
                    + localTime(new Date(data.now * 1000)));
            }
        }

        // only restrict aircraft process to this list while parsing history
        // Quitar restricción de procesado por historia
        g.historyKeep = null;
        // Ejecutar limpieza de aviones inactivos
        reaper();

        // Final pass to update all planes to their latest state
        //console.log("Final history cleanup pass");
        // Pasada final: actualizar distancias al sitio y ajustar tiempos TIS-B si aplica
        for (let i in g.planesOrdered) {
            let plane = g.planesOrdered[i];

            if (plane.position && SitePosition && !pTracks)
                plane.sitedist = ol.sphere.getDistance(SitePosition, plane.position);

            if (uatNoTISB && plane.uat && plane.type && plane.type.substring(0, 4) == "tisb") {
                plane.last_message_time -= 999;
            }
        }
    }

    console.timeEnd("Loaded aircraft tracks from History");
    // Si se pidió refrescar historial, terminar y restablecer UI
    if (g.refreshHistory) {
        g.refreshHistory = false;
        noLongerHidden();
        return;
    }
    // Marcar que el historial fue cargado
    historyLoaded.resolve();
}

let replay_was_active = false;


let timers = {};
let timersActive = false;
// Detiene todos los temporizadores activos (timers)
function clearIntervalTimers(arg) {
    // Si ya están apagados, mostrar traza y salir
    if (!timersActive) {
        console.trace();
        return;
    }
    // Si la carga terminó y no fue silencioso, mostrar aviso en UI
    if (loadFinished && arg != 'silent') {
        console.log(localTime(new Date()) + ' clear timers');
        jQuery("#timers_paused_detail").text('Timers paused (tab hidden).');
        jQuery("#timers_paused").css('display', 'block');
    }
    // Limpiar cada intervalo registrado
    const entries = Object.entries(timers);
    for (let i in entries) {
        clearInterval(entries[i][1]);
    }

    timersActive = false;

    // in case the visibility changed while this was running
    // En caso de que la visibilidad cambie mientras limpiamos, manejarlo
    handleVisibilityChange();
}
// Inicia los temporizadores periódicos necesarios para la app
function setIntervalTimers() {
    // Si ya están activos, salir
    if (timersActive) {
        return;
    }

    if (loadFinished) {
        jQuery("#timers_paused").css('display', 'none');
    }
    console.log(localTime(new Date()) + " set timers ");
    // Si dinámica de tasa para globo está activada y no es un UUID, preparar timer
    if (dynGlobeRate && !uuid) {
        timers.globeRateUpdate = setInterval(globeRateUpdate, 180000);
    }
    // Inicia polling de posición y autoselect
    pollPositionInterval();
    setAutoselect();
    // Chequeo de movimiento frecuente y tick por segundo
    timers.checkMove = setInterval(checkMovement, 50);
    timers.everySecond = setInterval(everySecond, 850);

    //timers.reaper = setInterval(reaper, 40000);
    // Reaper de trails si hay trails temporales activados
    if (tempTrails) {
        timers.trailReaper = window.setInterval(trailReaper, 10000);
        trailReaper(now);
    }
    // Obtener datos para "pf" si habilitado
    if (enable_pf_data && !pTracks && !globeIndex) {
        jQuery('#pf_info_container').removeClass('hidden');
        timers.pf_data = window.setInterval(fetchPfData, RefreshInterval * 10.314);
        fetchPfData();
    }
    // Si hay contorno real, acomodar su refresco
    if (actualOutline.enabled) {
        timers.drawOutline = window.setInterval(drawOutlineJson, actualOutline.refresh);
        setTimeout(drawOutlineJson, 50);
    }
    // AIScatcher y drones
    if (aiscatcher_server) {
        timers.aiscatcher = setInterval(updateAIScatcher, aiscatcher_refresh * 1000);
        updateAIScatcher();
    }
    if (droneJson) {
        timers.droneJson = setInterval(updateDrones, droneRefresh * 1000);
        updateDrones();
    }

    timersActive = true;
    // Hacer la primera petición de datos
    fetchData();

    // in case the visibility changed while this was running
    // Verificar visibilidad en caso de que haya cambiado
    handleVisibilityChange();
}
// Solicita actualizaciones de drones desde URLs configuradas
function updateDrones() {
    let jsons = Array.isArray(droneJson) ? droneJson : [droneJson];
    for (let i in jsons) {
        let req = jQuery.ajax({
            url: jsons[i],
            dataType: 'json',
        });

        req.done(function (data) {
            handleDrones(data);
        });
    }
}
// Maneja la respuesta de drones y manda cada uno a procesar
function handleDrones(data) {
    // Guarda timestamps de último/actual registro de drones
    g.droneLast = g.droneNow || 0;
    g.droneNow = new Date().getTime() / 1000;

    for (let i in data) {
        processDrone(data[i], g.droneNow, g.droneLast);
    }
}
// Convierte un objeto "drone" externo a la estructura interna y actualiza el plane object
function processDrone(drone, now, last) {
    const hex = drone.id;

    // Do we already have this plane object in g.planes?
    // If not make it.
    // Si no existe el objeto del "avión", crearlo
    let plane = g.planes[hex]

    if (!plane) {
        plane = new PlaneObject(hex);
    }

    let ac = drone;
    // Mapear campos del feed de drones a los campos esperados por el sistema
    ac.type = 'other';
    ac.t = 'DRON';
    ac.gs = drone.speed / 1852 * 3600; // m/s to knots
    ac.flight = drone.description;
    ac.alt_baro = drone.alt * 3.28; // m to ft
    ac.baro_rate = drone.vspeed * 3.28 * 60; // m/s to fpm
    // tiempo desde que fue observado
    ac.seen = now - new Date(drone.time).getTime() / 1000;
    // si tiene posición, incluirla
    if (drone.lat && drone.lon) {
        ac.lat = drone.lat;
        ac.lon = drone.lon
        ac.seen_pos = ac.seen;
    }
    //console.log(ac);
    // Actualiza datos del objeto plane
    plane.updateData(now, last, ac, false);
}
// Actualiza fuente AIScatcher y procesa su GeoJSON
function updateAIScatcher() {
    let req = jQuery.ajax({
        url: aiscatcher_server + '/geojson',
        dataType: 'text',
    });

    req.done(function (data) {
        // Pone la respuesta (texto) en la fuente y la refresca
        //console.log(data);
        g.aiscatcher_source.setUrl("data:text/plain;base64," + btoa(data));
        g.aiscatcher_source.refresh();
        // Procesa el GeoJSON como AIS
        if (1 || aiscatcher_test) {
            processAIS(JSON.parse(data));
        }
    });
}
// Procesa la respuesta AIS -> manda cada feature a processBoat
function processAIS(data) {
    g.ais_last = g.ais_now || 0;
    g.ais_now = new Date().getTime() / 1000;

    const features = data.features;
    aisTimeout = data.time_span || aisTimeout;
    for (let i in features) {
        processBoat(features[i], g.ais_now, g.ais_last);
    }
}
// Mapea número de tipo de barco a etiqueta corta legible
function shortShiptype(typeNumber) {
    if (typeNumber == 0) return "UNKN";
    if (typeNumber <= 19) return "RESE";
    if (typeNumber <= 28) return "WING";
    if (typeNumber <= 29) return "ASAR"; //Airborne SAR
    if (typeNumber <= 30) return "FISH";
    if (typeNumber <= 32) return "TUG";
    if (typeNumber <= 33) return "DRED";
    if (typeNumber <= 34) return "DIVE";
    if (typeNumber <= 35) return "MIL";
    if (typeNumber <= 36) return "SAIL";
    if (typeNumber <= 37) return "YACH";
    if (typeNumber <= 39) return "RESE";
    if (typeNumber <= 49) return "HSPD";
    if (typeNumber <= 50) return "PILO";
    if (typeNumber <= 50) return "PILO";
    if (typeNumber <= 51) return "SAR";
    if (typeNumber <= 52) return "TUG";
    if (typeNumber <= 53) return "TEND";
    if (typeNumber <= 54) return "POLC";
    if (typeNumber <= 55) return "LAW";
    if (typeNumber <= 57) return "LOC";
    if (typeNumber <= 58) return "MED";
    if (typeNumber <= 59) return "SPEC";
    if (typeNumber <= 69) return "PASS";
    if (typeNumber <= 79) return "CARG";
    if (typeNumber <= 89) return "TANK";
    if (typeNumber <= 99) return "OTHE";
    return "";
}
// Convierte una feature AIS a un objeto tipo "avión" y la actualiza
function processBoat(feature, now, last) {
    // Propiedades del feature
    const pr = feature.properties;
    // Crea identificador a partir de MMSI
    const hex = 'MMSI' + pr.mmsi;

    // Do we already have this plane object in g.planes?
    // If not make it.
    // Si no existe objeto plane, crearlo con escala menor
    let plane = g.planes[hex]

    if (!plane) {
        plane = new PlaneObject(hex);
        plane.country = pr.country;
        plane.country_code = pr.country;
        plane.baseScale = 0.2;
    }
    // Construir objeto ac con los campos esperados
    let ac = {};

    ac.type = 'ais';
    ac.gs = pr.speed;
    ac.flight = pr.callsign;
    ac.r = pr.shipname;
    ac.seen = now - pr.last_signal;

    ac.messages = pr.count;
    ac.rssi = pr.level;

    ac.track = pr.cog;
    // Si tiene destino, asignarlo como ruta
    if (pr.destination) { ac.route = pr.destination; }
    if (pr.shiptype !== undefined) { ac.t = shortShiptype(pr.shiptype); }
    // Identify Non-Ship Types
    // Identifica tipos no-ship por mmsi_type
    if (pr.mmsi_type == 6) { ac.t = "ANAV"; } // Aids to Navigation
    if (pr.mmsi_type == 5) { ac.t = "BASE"; } // Land Base Station
    if (pr.mmsi_type == 3) { ac.t = "COAS"; } // Coast Station

    // Si la geometría tiene coordenadas, mapear lat/lon
    if (feature.geometry && feature.geometry.coordinates) {
        const coords = feature.geometry.coordinates;
        ac.lat = coords[1];
        ac.lon = coords[0];
        ac.seen_pos = now - pr.last_signal;
    }
    //console.log(ac);
    // Actualiza el objeto plane con estos datos
    plane.updateData(now, last, ac, false);
}
// Variable usada para guardar JSON temporal
let djson;
// Cadena temporal usada para conversiones o debug
let dstring;
// Resultado temporal de operaciones con datos
let dresult;
// Inicia la página después de que todo esté listo
function startPage() {
    // Si no se usa heatmap, ocultar indicador de carga
    if (!heatmap)
        jQuery("#loader").hide();
    // Ajusta el zoom inicial según configuración
    changeZoom("init");
    // Centra el mapa según configuración inicial
    changeCenter("init");
    // Procesa parámetros de la URL (filtros, selección, etc.)
    processURLParams();
    // Si la URL pide registro por matrícula, descargar el mapa reg->icao
    if (usp.has('reg')) {
        let req = regIcaoDownload();
        req.done(function () {
            // Extrae consultas y guarda icaos derivadas
            const queries = usp.get('reg').split(',');
            for (let i in queries) {
                let icao = db.regCache[queries[i].toUpperCase()];
                if (icao) {
                    icao = icao.toLowerCase();
                    urlIcaos.push(icao);
                }
            }
            // Reprocesa parámetros ahora que cache está lista
            processURLParams();
        });
    }
    // Marca que la carga inicial terminó
    loadFinished = true;
    // Activa timers periódicos para la app
    setIntervalTimers();
    // Si se piden trazas temporales, seleccionar todos los aviones
    if (tempTrails)
        selectAllPlanes();
    // Si se pidió modo replay, mostrar barra y cargar replay
    if (replay) {
        showReplayBar();
        loadReplay(replay.ts);
    }
    // Si heatmap activo, dibujar mapa de calor
    if (heatmap) {
        drawHeatmap();
    }
    // Inicializa gestión de visibilidad de pestaña
    initVisibilityChange();
    // Si mostramos tracks persistentes, refrescar listado tras 10s
    if (pTracks)
        setTimeout(TAR.planeMan.refresh, 10000);
    // Limpiar timers al cerrar la página
    window.addEventListener("beforeunload", clearIntervalTimers);
    // Ejecutar tareas después del primer fetch con pequeño retraso
    setTimeout(afterFirstFetch, 50);
    // Marcar fin del tiempo de carga en consola
    console.timeEnd("Page Load");
}

//
// Utils begin
//
// Encapsula utilidades en el objeto TAR.utils
(function (global, jQuery, TAR) {
    let utils = TAR.utils = TAR.utils || {};

    // Make a LineString with 'points'-number points
    // that is a closed circle on the sphere such that the
    // great circle distance from 'center' to each point is
    // 'radius' meters
    // Crea una polilínea que forma un círculo geodésico alrededor de un punto
    utils.make_geodesic_circle = function (center, radius, points) {
        // Distancia angular equivalente al radio (en radianes)
        const angularDistance = radius / 6378137.0;
        // Longitud del centro en radianes
        const lon1 = center[0] * Math.PI / 180.0;
        // Latitud del centro en radianes
        const lat1 = center[1] * Math.PI / 180.0;
        // Variable que contendrá la geometría creada
        let geom;
        // Itera sobre el número de puntos solicitados para formar el círculo
        for (let i = 0; i <= points; ++i) {
            // Ángulo (bearing) desde el centro hasta el punto
            const bearing = i * 2 * Math.PI / points;
            // Calcula latitud del punto en la esfera
            let lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) +
                Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing));
            // Calcula longitud del punto en la esfera
            let lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
                Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));
            // Convertir de radianes a grados
            lat2 = lat2 * 180.0 / Math.PI;
            lon2 = lon2 * 180.0 / Math.PI;
            // Si es el primer punto, crear LineString; si no, añadir coordenada
            if (!geom)
                geom = new ol.geom.LineString([[lon2, lat2]]);
            else
                geom.appendCoordinate([lon2, lat2]);
        }
        // Devolver la geometría construida
        return geom;
    }

    return TAR;
}(window, jQuery, TAR || {}));
//
// Utils end
//
//
// Intenta añadir una capa WebGL para dibujar iconos con aceleración GPU
function webglAddLayer() {
    // Resultado de la creación
    let success = false;
    // Hex falso usado para pruebas iniciales
    const icao = 'c0ffee';
    // Si hay filtro de icao, incluir este temporal para evitar filtrarlo
    if (icaoFilter != null) {
        icaoFilter.push(icao);
    }
    // Crear un avión temporal centrado en la vista para inicializar WebGL
    processAircraft({
        hex: icao, lat: CenterLat, lon: CenterLon, type: 'tisb_other', seen: 0, seen_pos: 0,
        alt_baro: 25000,
    });
    // Recuperar el objeto plane creado
    let plane = g.planes[icao];
    // Elegir la fuente de sprites: generada o por defecto
    let spriteSrc = spritesDataURL ? spritesDataURL : 'images/sprites_193a0304570bcce84c40d8bd51c6397b.png';
    //console.log(spriteSrc);
    try {
        // Definir estilo para WebGL con icono, color y transformación
        let glStyle = {
            'icon-src': spriteSrc,
            'icon-color': [
                'color',
                ['get', 'r'],
                ['get', 'g'],
                ['get', 'b'],
                1
            ],
            'icon-size': [glIconSize, glIconSize],
            'icon-offset': [
                'array',
                ['get', 'sx'],
                ['get', 'sy']
            ],
            'icon-rotation': ['get', 'rotation'],
            'icon-rotate-with-view': false,
            //'icon-scale': [ 'array', ['get', 'scale'], ['get', 'scale'] ],
            'icon-scale': ['abs', ['get', 'scale']],
        };
        // Si estamos en modo heatmap, usar estilo de círculos en vez de iconos
        if (heatmap) {
            glStyle = {
                'circle-radius': heatmap.radius * globalScale * 1.25,
                'circle-displacement': [0, 0],
                'circle-opacity': heatmap.alpha || webglIconOpacity,
                'circle-fill-color': [
                    'color',
                    ['get', 'r'],
                    ['get', 'g'],
                    ['get', 'b'],
                    1
                ]
            }
        }
        // Crear la capa WebGL con la fuente vectorial y estilo definido
        webglLayer = new ol.layer.WebGLPoints({
            name: 'webglLayer',
            type: 'overlay',
            title: 'Aircraft pos. webGL',
            source: webglFeatures,
            declutter: false,
            zIndex: 200,
            style: glStyle,
            renderBuffer: renderBuffer,
        });
        // Si la capa no se creó, indicar fallo
        if (!webglLayer)
            return false;
        // Si no se ha probado WebGL antes y el renderer no existe, fallar
        if (loStore['webglTested'] != 'true' && !webglLayer.getRenderer()) {
            return false;
        }
        // Añadir la capa al conjunto de capas
        layers.push(webglLayer);
        // Marcar que WebGL está activo
        webgl = true;

        // only test webgl once in every browser
        // after that assume that it's working
        // Si no se había probado, forzar dibujo del marcador temporal
        if (loStore['webglTested'] != 'true') {
            plane.visible = true;
            plane.updateMarker();
            OLMap.renderSync();
        }
        // Marcar que WebGL fue exitoso en almacenamiento local
        loStore['webglTested'] = 'true';
        success = true;
    } catch (error) {
        // Si ocurre error, intentar limpiar la capa y registrar fallo
        try {
            layers.remove(webglLayer);
        } catch (error) {
            console.error(error);
        }
        console.error(error);
        success = false;
    }
    // Borrar el avión temporal creado para la prueba
    delete g.planes[plane.icao];
    g.planesOrdered.splice(g.planesOrdered.indexOf(plane), 1);
    plane.destroy();
    // Si se añadió al filtro, sacarlo
    if (icaoFilter != null) {
        icaoFilter.pop(icao);
    }
    // Devolver si fue exitoso
    return success;
}

function webglInit() {
    // Valor inicial por defecto (se puede leer de loStore en el Toggle)
    let init = true;
    // Crea un switch en la UI para activar/desactivar WebGL
    new Toggle({
        key: "webgl",
        display: "WebGL",
        container: "#settingsRight",
        init: init,
        setState: function (state) {
            if (state) {
                if (webglLayer) {
                    webgl = true;
                } else {
                    webgl = webglAddLayer();
                }

                if (!webgl) {
                    console.error('Unable to initialize the webGL Layer! Falling back to non-webGL icons, performance will be reduced significantly!');
                    webglLayer = null;
                }
                if (!webgl)
                    return false;
                // returning false means the toggle will flip back as the activation of the webgl layer was unsuccessful.
            } else {
                webgl = false;
                if (loadFinished) {
                    webglFeatures && webglFeatures.clear();
                    for (let i in g.planesOrdered) {
                        const plane = g.planesOrdered[i];
                        delete plane.glMarker;
                    }
                }
            }
            if (loadFinished) {
                refreshFilter();
                checkPointermove();
            }
        },
    });
}

//Inicializa OpenLayers para controlar el mapa
function ol_map_init() {

    if (0) {
        let canvas = iconTest();
        spritesDataURL = canvas.toDataURL();
        jQuery('#iconTestCanvas').remove();
        console.log(spritesDataURL);
    }
    // Crear mapa OpenLayers con vista y controles básicos
    OLMap = new ol.Map({
        target: 'map_canvas',
        layers: layers_group,
        view: new ol.View({
            center: ol.proj.fromLonLat([CenterLon, CenterLat]),
            zoom: g.zoomLvl,
            multiWorld: true,
        }),
        controls: [new ol.control.Zoom({ delta: 1, duration: 0, target: 'map_canvas', }),
        new ol.control.Attribution({ collapsed: true }),
        new ol.control.ScaleLine({ units: DisplayUnits })
        ],
        interactions: new ol.interaction.defaults({ altShiftDragRotate: false, pinchRotate: false, }),
        maxTilesLoading: 4,
    });
    // Inicializar WebGL y medir tiempo
    console.time('webglInit');
    webglInit();
    console.timeEnd('webglInit');

    // Buscar si el tipo de mapa configurado existe entre las capas base
    let foundType = false;
    ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
        if (lyr.get('name') && lyr.get('type') == 'base') {
            if (MapType_tar1090 == lyr.get('name')) {
                foundType = true;
            }
        }
    });
    // Si no se encontró, usar 'osm' por defecto
    if (!foundType) {
        MapType_tar1090 = "osm";
    }
    // Recorrer capas base y overlays para ajustar visibilidades iniciales
    ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
        if (!lyr.get('name'))
            return;
        // Registrar evento para cambios de visibilidad en capas base
        if (lyr.get('type') == 'base') {
            if (MapType_tar1090 == lyr.get('name')) {
                foundType = true;
                lyr.setVisible(true);

                mapTypeSettings();
                const onVisible = lyr.get('onVisible');
                onVisible && onVisible(lyr);
            } else {
                lyr.setVisible(false);
            }

            lyr.on('change:visible', function (evt) {
                if (evt.target.getVisible()) {
                    MapType_tar1090 = loStore['MapType_tar1090'] = evt.target.get('name');
                    mapTypeSettings();
                    const onVisible = lyr.get('onVisible');
                    onVisible && onVisible(lyr);

                    // --- LÓGICA DE EXCLUSIVIDAD POR GRUPOS ---
                    try {
                        // 1. Buscamos cuál es el grupo que contiene la capa base que se acaba de activar
                        let currentParentGroup = null;
                        layers_group.getLayers().forEach(group => {
                            if (group instanceof ol.layer.Group) {
                                const subLayers = group.getLayers().getArray();
                                if (subLayers.includes(evt.target)) {
                                    currentParentGroup = group;
                                }
                            }
                        });

                        // 2. Si la capa base pertenece a un grupo, desactivamos los overlays de los otros grupos
                        if (currentParentGroup) {
                            layers_group.getLayers().forEach(otherGroup => {
                                // Si es un grupo diferente al actual
                                if (otherGroup instanceof ol.layer.Group && otherGroup !== currentParentGroup) {
                                    otherGroup.getLayers().forEach(layer => {
                                        // Apagar solo si es tipo overlay
                                        if (layer.get('type') === 'overlay') {
                                            layer.setVisible(false);
                                        }
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        // Error silencioso para no interrumpir el mapa
                    }
                    // --- FIN LÓGICA EXCLUSIVIDAD ---
                }
            });
        } else if (lyr.get('type') === 'overlay') {
            // Decidir visibilidad inicial de overlays según almacenamiento local y defaults
            if (
                loStore['layer_' + lyr.get('name')] == 'true'
                || enableOverlays.indexOf(lyr.get('name')) >= 0
                || (loStore['layer_' + lyr.get('name')] != 'false' && defaultOverlays.indexOf(lyr.get('name')) >= 0)
            ) {
                lyr.setVisible(true);
            }
            if (loStore['layer_' + lyr.get('name')] == 'false') {
                lyr.setVisible(false);
            }
            // Actualizar almacenamiento local cuando cambie visibilidad
            lyr.on('change:visible', function (evt) {
                loStore['layer_' + evt.target.get('name')] = evt.target.getVisible();
            });
        }
    })
    // Si despues no se encontró ningún base visible, hacer visible la primera base encontrada
    if (!foundType) {
        ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
            if (foundType)
                return;
            if (lyr.get('type') === 'base') {
                lyr.setVisible(true);
                foundType = true;
            }
        });
    }
    // Guardar proyección y extensión actual del mapa
    OLProj = OLMap.getView().getProjection();
    OLProjExtent = OLProj.getExtent();
    // Aplicar rotación inicial del mapa
    OLMap.getView().setRotation(g.mapOrientation); // adjust orientation
    // Añadir control de selección de capas personalizado
    OLMap.addControl(new ol.control.LayerSwitcher({
        groupSelectStyle: 'none',
        activationMode: 'click', // click sucks in the current implementation
        target: 'layer-select',
    }));
    // Reducir opacidad de WebGL en mov. para mejorar rendimiento visual
    OLMap.on('movestart', function (event) {
        if (webgl) {
            if (TrackedAircraftPositions > webglIconMapMoveOpacityCrowdedThreshold) {
                webglLayer.setOpacity(webglIconMapMoveOpacityCrowded)
            } else {
                webglLayer.setOpacity(webglIconMapMoveOpacity)
            }
        }
    });
    // Al terminar el movimiento, restaurar opacidad y comprobar movimiento
    OLMap.on('moveend', function (event) {
        checkMovement();
        webgl && webglLayer.setOpacity(webglIconOpacity);
    });
    // Maneja clic simple y doble clic en el mapa para selección, trazas y modos especiales
    OLMap.on(['singleclick', 'dblclick'], function (evt) {
        // Guarda el identificador del avión encontrado en una traza (si hay).
        let trailHex = null;
        // Guarda el timestamp de la traza si se ha hecho clic en una traza.
        let trailTS = null;
        // Guarda el identificador (hex) del avión sobre el que se hizo clic (si hay).
        let planeHex = null;
        // Selecciona la fuente de features adecuada según si WebGL está activo.
        let source = webgl ? webglFeatures : PlaneIconFeatures;
        // Convierte el pixel del evento a coordenadas del mapa.
        let evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
        // Busca la feature (icono/traza) más cercana a la coordenada del clic.
        let feature = source.getClosestFeatureToCoordinate(evtCoords);
        // Si existe una feature cercana:
        if (feature) {
            // Calcula la posición en píxeles de la feature encontrada.
            let fPixel = evt.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates());
            // Diferencia horizontal entre feature y clic.
            let a = fPixel[0] - evt.pixel[0];
            // Diferencia vertical entre feature y clic.
            let b = fPixel[1] - evt.pixel[1];
            // Radio de tolerancia en píxeles adaptado a la escala y dispositivo.
            let c = globalScale * (onMobile ? 30 : 20);
            // Si la distancia al clic está dentro de la tolerancia, considerar que se hizo clic en el avión.
            if (a ** 2 + b ** 2 < c ** 2) {
                planeHex = feature.hex;
            } else {
                // Si está fuera de la tolerancia, no es clic sobre avión.
                planeHex = null;
            }
        }
        // Si no hay avión cercano o estamos en modo mostrar traza, buscar trazas cercanas.
        if (!planeHex || showTrace) {
            // Lista temporal de features de trazas cercanas.
            let features = [];
            // Feature de traza más cercana.
            let trailFeature = null;
            // Variante rápida: recorrer capas de trazas y buscar la más cercana.
            if (1) {
                for (const layer of trailGroup.getArray()) {
                    // Ignorar capas de trazas ocultas.
                    if (!layer.getVisible()) {
                        continue;
                    }
                    // Obtener la fuente de la capa de traza.
                    const source = layer.getSource();
                    // Buscar la feature de traza más cercana en esa fuente.
                    trailFeature = source.getClosestFeatureToCoordinate(evtCoords);
                    // Si encontró una, añadirla a la lista.
                    if (trailFeature) {
                        features.push(trailFeature);
                    }
                }
            } else {
                // old variant, slower in most cases
                // Variante antigua (no usada) para obtener features en el píxel.
                features = evt.map.getFeaturesAtPixel(
                    evt.pixel,
                    {
                        layerFilter: function (layer) { return (layer.get('isTrail') == true); },
                        hitTolerance: globalScale * (onMobile ? 30 : 20),
                    }
                );
            }
            // Si se encontraron features de traza cercanas:
            if (features.length > 0) {
                // Define tolerancia de impacto en píxeles (ajustada por escala y móvil).
                let hitTolerance = globalScale * (onMobile ? 30 : 20);
                // just rubber band to the closest trace for showTrace
                // Si estamos forzando modo traza, usar una tolerancia grande para "pegar" a la traza más cercana.
                if (showTrace) { hitTolerance = 10000; }
                // Guardar el cuadrado de la distancia de tolerancia para comparaciones.
                let close2 = hitTolerance * hitTolerance;
                // Variable para la feature más cercana.
                let closest = null;
                // Recorrer cada feature encontrada para hallar el punto más cercano.
                for (let j in features) {
                    let feature = features[j];
                    // Coordenadas a comprobar: si la feature es etiqueta, tratar su punto; si no, tomar todas las coords.
                    let coords;
                    if (feature.isLabel)
                        coords = [feature.getGeometry().getCoordinates()];
                    else
                        coords = feature.getGeometry().getCoordinates();
                    // Recorrer cada coordenada de la feature (polilíneas o puntos) para medir distancia al clic.
                    for (let k in coords) {
                        let fPixel = evt.map.getPixelFromCoordinate(coords[k]);
                        let a = fPixel[0] - evt.pixel[0];
                        let b = fPixel[1] - evt.pixel[1];
                        let distance2 = a ** 2 + b ** 2;
                        // Si esta coordenada está más cerca que la previa, guardarla como la más cercana.
                        if (distance2 < close2) {
                            closest = feature;
                            close2 = distance2;
                        }
                    }
                }
                // Si se halló la feature más cercana:
                if (closest) {
                    // Si estamos en modo traza, guardar el timestamp de la traza encontrada.
                    if (showTrace)
                        trailTS = closest.timestamp;
                    else
                        // En modo normal, guardar el hex del avión asociado a la traza.
                        trailHex = closest.hex;
                }
            }
        }
        // Indica si el evento fue doble clic y no estamos en modo traza.
        const dblclick = (evt.type === 'dblclick') && !showTrace;
        // Si estamos en modo mostrar traza y encontramos timestamp, saltar a ese tiempo.
        if (showTrace && trailTS) {
            // Evita seleccionar un avión actual.
            planeHex = null;
            // Ir al tiempo de la traza seleccionada.
            gotoTime(trailTS);
        }

        // Si el modo de elevación está activo, usar el clic para calcular el perfil.
        if (elevationMode) {
            if (elevationBusy) {
                showDistanceGuide('Generando panorama, espere…');
                evt.stopPropagation();
                return;
            }
            // Obtener la coordenada del clic en el mapa y convertir a lon/lat.
            const evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
            const lonlat = ol.proj.toLonLat(evtCoords);
        
            // Verificar que exista la posición del receptor.
            if (SiteLat == null || SiteLon == null) {
                showDistanceGuide('No hay posición del receptor disponible.');
                evt.stopPropagation();
                return;
            }

            // Actualizar el punto B en el mapa (manteniendo el punto A).
            if (elevationPointSource) {
                const feats = elevationPointSource.getFeatures().filter(f => f.get('role') !== 'B');
                elevationPointSource.clear();
                feats.forEach(f => elevationPointSource.addFeature(f));

                const fB = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([lonlat[0], lonlat[1]])));
                fB.set('role', 'B');
                elevationPointSource.addFeature(fB);
                elevationPointLayer && elevationPointLayer.setVisible(true);
            }

            // Dibujar línea A-B
            if (elevationLineSource) {
                elevationLineSource.clear();
                const a = ol.proj.fromLonLat([SiteLon, SiteLat]);
                const b = ol.proj.fromLonLat([lonlat[0], lonlat[1]]);
                elevationLineSource.addFeature(new ol.Feature(new ol.geom.LineString([a, b])));
                elevationLineLayer && elevationLineLayer.setVisible(true);
            }
        
            // Lanzar la consulta del perfil de elevación y evitar propagación del clic.
            hideDistanceGuide();
            getElevationProfileLine(SiteLat, SiteLon, lonlat[1], lonlat[0]);
            evt.stopPropagation();
            return;
        }

        // Si está activo el modo tierra‑aeronave
        if (distanceToGroundMode) {

            // Obtener las coordenadas del clic en el mapa
            const evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);

            // Si se hace click sobre un avión
            if (planeHex) {

                // Siempre marcar punto A antes que avión/es
                if (distanceToGroundModeType === '1A1B' && groundPoints.length === 0) {
                    showDistanceGuide('Primero marque el punto A.');
                    evt.stopPropagation();
                    return;
                }
                if (distanceToGroundModeType === '1A_nB' && groundPoints.length === 0) {
                    showDistanceGuide('Primero marque el punto A.');
                    evt.stopPropagation();
                    return;
                }
                if (distanceToGroundModeType === 'nA_1B' && groundPoints.length === 0) {
                    showDistanceGuide('Primero marque al menos un punto A.');
                    evt.stopPropagation();
                    return;
                }
                if (distanceToGroundModeType === 'nA_nB' && !taPendingGround) {
                    showDistanceGuide('Primero marque el punto A.');
                    evt.stopPropagation();
                    return;
                }

                // Modo nA_nB
                if (distanceToGroundModeType === 'nA_nB') {
                    // Si ya se alcanzó el máximo de pares
                    if (taPairs.length >= TA_MAX_nA_nB) {
                        // Avisar límite alcanzado
                        showDistanceGuide(`Máximo ${TA_MAX_nA_nB} pares.`);
                        // Detener propagación del evento
                        evt.stopPropagation();
                        return;
                    }
                    // Si había un punto A pendiente
                    if (taPendingGround) {
                        // Tomar el punto A pendiente
                        const lonlat = taPendingGround;
                        // Limpiar el pendiente
                        taPendingGround = null;
                        // Clave única A|B
                        const key = `${lonlat[0].toFixed(6)},${lonlat[1].toFixed(6)}|${planeHex}`;
                        // Guardar el par A‑B
                        taPairs.push({ hex: planeHex, gp: lonlat, key });
                        // Asegurar visibilidad de la capa de puntos A
                        if (groundPointLayer) groundPointLayer.setVisible(true);
                        // Añadir el punto A al mapa y guardar referencia
                        if (groundPointSource) {
                            const featA = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)));
                            groundPointSource.addFeature(featA);
                            const gpKey = `${lonlat[0].toFixed(6)},${lonlat[1].toFixed(6)}`;
                            groundPointFeaturesByCoord.set(gpKey, featA);
                        }
                        // Ocultar guía
                        hideDistanceGuide();

                        // Si no había punto A pendiente
                    } else {
                        // Guardar avión a la espera de marcar punto A
                        taPendingPlaneHex = planeHex;
                        // Mostrar guía paso 2
                        showDistanceGuide(taStep2Message());
                    }
                    // Modo 1A_nB
                } else if (distanceToGroundModeType === '1A_nB') {
                    // Evita duplicar el mismo avión B
                    if (planesForGround.includes(planeHex)) {
                        // Refrescar guía
                        showDistanceGuide(taStep2Message());
                        // Si supera el máximo de B
                    } else if (planesForGround.length >= TA_MAX_1A_nB) {
                        // Avisar el límite
                        showDistanceGuide(`Máximo ${TA_MAX_1A_nB} puntos B.`);
                        // Si aún se puede agregar este avión B
                    } else {
                        // Añadir el avión B
                        planesForGround.push(planeHex);
                        // Ocultar guía
                        hideDistanceGuide();
                    }
                    // Modo nA_1B
                } else if (distanceToGroundModeType === 'nA_1B') {
                    // Fijar el avión como único B
                    planesForGround = [planeHex];
                    // Ocultar guía
                    hideDistanceGuide();
                    // Modo 1A1B
                } else {
                    // Buscar el avión en memoria
                    const p = g.planes[planeHex];
                    // Solo si tiene posición válida
                    if (p && p.position) {
                        // Fijar este avión como B
                        planesForGround = [planeHex];
                        // Guardar referencia al avión
                        selectedPlaneForGround = p;
                        // Ocultar guía
                        hideDistanceGuide();
                        // Si no tiene posición válida
                    } else {
                        // Aviso de error
                        showDistanceGuide('Seleccione un avión con posición válida.');
                    }
                }
                // Si se hace clic sobre el mapa
            } else {
                // Convertir a lon/lat del clic
                const lonlat = ol.proj.toLonLat(evtCoords);
                // Modo nA_nB
                if (distanceToGroundModeType === 'nA_nB') {
                    // Si hay un punto A pendiente sin avión
                    if (taPendingGround && !taPendingPlaneHex) {
                        // Pedir escoger avión
                        showDistanceGuide('Seleccione un avión para completar el par.');
                        // Detener propagación
                        evt.stopPropagation();
                        return;
                    }
                    // Si hay avión pendiente de un punto A
                    if (taPendingPlaneHex) {
                        // Revisar límite de pares
                        if (taPairs.length >= TA_MAX_nA_nB) {
                            // Aviso de límite
                            showDistanceGuide(`Máximo ${TA_MAX_nA_nB} pares.`);
                            // Detener propagación
                            evt.stopPropagation();
                            return;
                        }
                        // Recuperar avión pendiente
                        const hex = taPendingPlaneHex;
                        // Limpiar pendiente
                        taPendingPlaneHex = null;
                        // Clave A|B
                        const key = `${lonlat[0].toFixed(6)},${lonlat[1].toFixed(6)}|${hex}`;
                        // Guardar el nuevo par
                        taPairs.push({ hex, gp: lonlat, key });

                        // Mostrar capa de puntos A
                        if (groundPointLayer) groundPointLayer.setVisible(true);
                        // Dibujar punto A
                        groundPointSource && groundPointSource.addFeature(
                            new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                        );
                        // Ocultar guía
                        hideDistanceGuide();
                        // Si no hay avión pendiente
                    } else {
                        // Verificar límite de pares
                        if (taPairs.length >= TA_MAX_nA_nB) {
                            showDistanceGuide(`Máximo ${TA_MAX_nA_nB} pares.`);
                            // Detener propagación
                            evt.stopPropagation();
                            return;
                        }
                        // Guardar el punto A pendiente
                        taPendingGround = lonlat;
                        // Asegurar visibilidad
                        if (groundPointLayer) groundPointLayer.setVisible(true);
                        // Dibujar punto A y guardar referencia
                        if (groundPointSource) {
                            const featA = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)));
                            groundPointSource.addFeature(featA);
                            const gpKey = `${lonlat[0].toFixed(6)},${lonlat[1].toFixed(6)}`;
                            groundPointFeaturesByCoord.set(gpKey, featA);
                        }
                        // Mostrar guía paso 2
                        showDistanceGuide(taStep2Message());
                    }
                    // Modo nA_1B
                } else if (distanceToGroundModeType === 'nA_1B') {
                    // Si alcanza el máximo de puntos A
                    if (groundPoints.length >= TA_MAX_nA_1B) {
                        // Aviso de límite
                        showDistanceGuide(`Máximo ${TA_MAX_nA_1B} puntos A.`);
                        // Si aún puede agregar punto A
                    } else {
                        // Mostrar capa de puntos
                        if (groundPointLayer) groundPointLayer.setVisible(true);
                        // Añadir nuevo punto A
                        groundPoints.push(lonlat);
                        // Dibujar punto A
                        groundPointSource && groundPointSource.addFeature(
                            new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                        );
                        // Actualizar guía
                        showDistanceGuide(taStep2Message());
                    }
                    // Modo 1A1B o 1A_nB
                } else {
                    // Reemplazar el punto A único
                    groundPoints = [lonlat];
                    // Guardar coordenada actual de A
                    groundPointCoord = lonlat;
                    // Asegurar visibilidad de capa
                    if (groundPointLayer) groundPointLayer.setVisible(true);
                    // Si hay fuente, limpiar y dibujar A
                    if (groundPointSource) {
                        groundPointSource.clear();
                        groundPointSource.addFeature(
                            new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                        );
                    }
                    // Mostrar siguiente instrucción
                    showDistanceGuide(taStep2Message());
                }
            }

            // Recalcular y mostrar distancias
            updateDistanceToGroundOverlay();
            // Si no hay intervalo activo
            if (!distanceGroundUpdateInterval) {
                // Refrescar cada segundo
                distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);
            }
            // Evitar que otros manejadores usen el clic
            evt.stopPropagation();
            return;
        }

        // Si el modo tierra‑tierra está activo
        if (groundToGroundMode) {
            // Obtener coordenadas del clic en el mapa 
            const evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
            // Convertir a lon/lat en grados
            const lonlat = ol.proj.toLonLat(evtCoords);

            // Asegurar que la capa de puntos esté visible
            if (ggPointLayer) ggPointLayer.setVisible(true);

            // Si aún no se fijó el punto A
            if (!ggPointA) {
                // Guardar este clic como punto A
                ggPointA = lonlat;

                // Limpiar puntos anteriores
                if (ggPointSource) ggPointSource.clear();
                // Dibujar punto A
                ggPointSource && ggPointSource.addFeature(
                    new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                );

                // Mostrar guía paso 2
                showDistanceGuide(ggStep2Message());
                // Si el modo es 1A1B
            } else if (groundToGroundModeType === '1A1B') {
                // Guardar clic como único punto B
                ggPointsB = [lonlat];

                // Si existe la fuente de puntos tierra‑tierra                
                if (ggPointSource) {
                    // Vaciar todas las features actuales
                    ggPointSource.clear();
                    // Si hay un punto A registrado
                    if (ggPointA) {
                        // Añadir la feature del punto A a la fuente y crear el punto en la proyección del mapa
                        ggPointSource.addFeature(
                            new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(ggPointA)))
                        );
                    }
                }

                // Dibujar punto B
                ggPointSource && ggPointSource.addFeature(
                    new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                );
                // Ocultar guía
                hideDistanceGuide();
                // 1A_nB
            } else {
                // Si ya alcanzó el máximo de puntos B
                if (ggPointsB.length >= GG_MAX_1A_nB) {
                    // Avisar el límite
                    showDistanceGuide(`Máximo ${GG_MAX_1A_nB} puntos B.`);
                    // Si aún se pueden agregar más puntos B
                } else {
                    // Añadir este clic a la lista de B
                    ggPointsB.push(lonlat);
                    // Dibujar el nuevo punto B
                    ggPointSource && ggPointSource.addFeature(
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                    );
                    // Ocultar guía
                    hideDistanceGuide();
                }
            }

            // Recalcular y pintar líneas/overlays A‑B
            updateGroundToGroundOverlay();
            // Si no hay intervalo de refresco activo
            if (!ggUpdateInterval) {
                // Programar refresco cada segundo
                ggUpdateInterval = setInterval(updateGroundToGroundOverlay, 1000);
            }
            // Evitar que el clic lo manejen otros listeners
            evt.stopPropagation();
            return;
        }

        //console.log(`planeHex: ${planeHex} trailHex: ${trailHex}`);
        if (distanceBetweenPlanesMode && planeHex) {

            // Modo 1A1B: seleccionar dos aviones
            if (planeDistanceModeType === '1A1B') {
                if (selectedPlanesForDistance.length >= 2) {
                    resetDistanceCalculation();
                }

                let plane = g.planes[planeHex];
                if (plane && plane.position && plane.altitude !== null) {
                    selectedPlanesForDistance.push({ hex: planeHex, coords: plane.position, altitude: plane.altitude });

                    if (selectedPlanesForDistance.length === 2) {
                        updateDistanceLine();
                        if (distanceUpdateInterval) clearInterval(distanceUpdateInterval);
                        distanceUpdateInterval = setInterval(updateDistanceLine, 1000);
                    }
                }

            // Modo 'pairs': permite pares independientes (A-B, C-D) y anchor A->B,C...
            } else if (planeDistanceModeType === 'pairs') {
                // If an anchor A is set, clicking adds pair A|planeHex (unless same or duplicate)
                if (selectedPlaneA) {
                    if (planeHex === selectedPlaneA) {
                        // clicking anchor again clears it
                        selectedPlaneA = null;
                        showDistanceGuide('Anchor desactivado.');
                        return;
                    }

                    if (pairMap.size >= PP_MAX_PAIRS) {
                        showDistanceGuide(`Máximo ${PP_MAX_PAIRS} pares alcanzado.`);
                        return;
                    }
                    const key = `${selectedPlaneA}|${planeHex}`;
                    if (pairMap.has(key)) {
                        showDistanceGuide('Par ya existente.');
                        return;
                    }
                    pairMap.set(key, { a: selectedPlaneA, b: planeHex });
                    pairOrder.push(key);
                    showDistanceGuide('Par añadido.');
                    updateDistanceLine();
                    if (distanceUpdateInterval) clearInterval(distanceUpdateInterval);
                    distanceUpdateInterval = setInterval(updateDistanceLine, 1000);
                    return;
                }

                // No anchor active: use pairBuffer to form independent pairs or set anchor by clicking same aircraft twice
                if (pairBuffer.length === 0) {
                    pairBuffer.push(planeHex);
                    showDistanceGuide('Primero seleccionado. Haga clic en otro avión para formar par, o haga clic de nuevo en este avión para anclarlo.');
                    return;
                } else {
                    const first = pairBuffer[0];
                    // Same clicked twice -> set anchor
                    if (first === planeHex) {
                        selectedPlaneA = planeHex;
                        pairBuffer = [];
                        showDistanceGuide('Avión anclado. Ahora haga clic en aviones B para crear pares con A. Clic en A otra vez para desanclar.');
                        return;
                    }

                    // Create independent pair first|planeHex
                    if (pairMap.size >= PP_MAX_PAIRS) {
                        showDistanceGuide(`Máximo ${PP_MAX_PAIRS} pares alcanzado.`);
                        pairBuffer = [];
                        return;
                    }
                    const newKey = `${first}|${planeHex}`;
                    if (pairMap.has(newKey)) {
                        showDistanceGuide('Par ya existente.');
                        pairBuffer = [];
                        return;
                    }
                    pairMap.set(newKey, { a: first, b: planeHex });
                    pairOrder.push(newKey);
                    pairBuffer = [];
                    showDistanceGuide('Par independiente añadido.');
                    updateDistanceLine();
                    if (distanceUpdateInterval) clearInterval(distanceUpdateInterval);
                    distanceUpdateInterval = setInterval(updateDistanceLine, 1000);
                    return;
                }
            }
        }
        // 2. Comportamiento normal de selección de avión 
        else if (planeHex) {
            selectPlaneByHex(planeHex, { noDeselect: dblclick, follow: dblclick });
        }
        else if (trailHex) {
            selectPlaneByHex(trailHex, { noDeselect: true });
        }

        if (!planeHex && !trailHex && !multiSelect && !showTrace) {
            if (onlySelected)
                toggleIsolation();
            deselect(SelectedPlane);
            refreshFilter();
        }
        evt.stopPropagation();
    });

    // show the hover box
    checkPointermove();
}
// Inicia configuración temprana del mapa antes de cargar todo lo demás
function initMapEarly() {

    // Load stored map settings if present
    // Si hay una preferencia fija de tipo de mapa, usarla
    if (overrideMapType)
        MapType_tar1090 = overrideMapType;
    // Si no, usar la última preferida guardada por el usuario
    else if (loStore['MapType_tar1090']) {
        MapType_tar1090 = loStore['MapType_tar1090'];
    }

    // Aplica ajustes visuales y de comportamiento según el tipo de mapa elegido
    mapTypeSettings();

    // Initialize OpenLayers
    // Crea las capas base del mapa y guarda el grupo resultante
    layers_group = createBaseLayers();
    // Extrae la lista manipulable de capas desde el grupo
    layers = layers_group.getLayers();

    //add_kml_overlay('https://developers.google.com/kml/documentation/KML_Samples.kml', 'samples', 0.8);

    // Crea una capa que dibuja círculos concéntricos alrededor del sitio (ej. rangos)
    siteCircleLayer = new ol.layer.Vector({
        name: 'siteCircles',
        type: 'overlay',
        title: 'Range rings',
        source: siteCircleFeatures,
        visible: SiteCircles,
        zIndex: 100,
        renderOrder: null,
        renderBuffer: renderBuffer,
    });
    layers.push(siteCircleLayer);
    // Cuando se muestre la capa de círculos, intentar obtener la posición del usuario
    siteCircleLayer.on('change:visible', function (evt) {
        if (evt.target.getVisible()) {
            runAfterLoad(geoFindMe);
        }
    });
}
// Muestra u oculta los botones y barras de la interfaz según la preferencia
function showHideButtons() {
    // Si la opción pide ocultar botones, esconder controles importantes de la UI
    if (hideButtons) {
        jQuery('#header_top').hide();
        jQuery('#header_side').hide();
        jQuery('#splitter').hide();
        jQuery('#tabs').hide();
        jQuery('#filterButton').hide();
        jQuery('.ol-zoom').hide();
        jQuery('.layer-switcher').hide();
    } else {
        jQuery('#header_top').show();
        jQuery('#header_side').show();
        jQuery('#splitter').show();
        jQuery('#tabs').show();
        jQuery('#filterButton').show();
        jQuery('.ol-zoom').show();
        jQuery('.layer-switcher').show();
    }
}

// Initalizes the map and starts up our timers to call various functions
// Inicializa el mapa y arranca temporizadores y capas
function initMap() {
    // Recupera centro longitudinal guardado o usa el valor por defecto
    CenterLon = Number(lopaStore['CenterLon']) || DefaultCenterLon;
    // Recupera centro latitudinal guardado o usa el valor por defecto
    CenterLat = Number(lopaStore['CenterLat']) || DefaultCenterLat;
    //console.log("initMap Centerlat: " + CenterLat);
    // Recupera nivel de zoom guardado o usa el por defecto
    g.zoomLvl = Number(lopaStore['zoomLvl']) || DefaultZoomLvl;
    // Guarda una copia del zoom actual
    g.zoomLvlCache = g.zoomLvl;

    // always hide this, it really only shows the number of positions saved
    // Oculta contador de historia que no se muestra normalmente
    jQuery('#dump1090_total_history_td').hide();
    // Si vista global con agregador, ocultar indicador de tasa
    if (globeIndex && aggregator) {
        jQuery('#dump1090_message_rate_td').hide();
    }
    // Crea la capa que mostrará la posición del receptor o la del usuario
    locationDotLayer = new ol.layer.Vector({
        name: 'locationDot',
        type: 'overlay',
        title: (receiverJson && receiverJson.lat != null) ? 'Site position' : 'Your position',
        source: locationDotFeatures,
        visible: SiteShow,
        zIndex: 100,
        renderOrder: null,
        renderBuffer: renderBuffer,
    });
    layers.push(locationDotLayer);
    // Cuando se muestre la capa de posición, intentar obtener la ubicación del navegador
    locationDotLayer.on('change:visible', function (evt) {
        if (evt.target.getVisible()) {
            runAfterLoad(geoFindMe);
        }
    });

    // Decide si usar contorno real del rango según configuración y datos del receptor
    actualOutline.enabled = multiOutline || (receiverJson && receiverJson.outlineJson);
    // Si se debe usar contorno real, configurar refresco, URL y estilo visual
    if (actualOutline.enabled) {
        // Frecuencia de actualización del contorno
        actualOutline.refresh = 15000;
        // Ruta del JSON con el contorno (puede ser múltiple o simple)
        actualOutline.url = multiOutline ? 'data/multiOutline.json' : 'data/outline.json';
        // Fuente donde se guardarán las features del contorno
        actualOutline.features = new ol.source.Vector();
        // Estilo visual para dibujar el contorno (color, grosor, guion)
        actualOutline.style = new ol.style.Style({
            fill: null,
            stroke: new ol.style.Stroke({
                color: actual_range_outline_color,
                width: actual_range_outline_width,
                lineDash: actual_range_outline_dash,
            }),
        });
        /*actualOutline.layer = new ol.layer.Vector({
            name: 'actualRangeOutline',
            type: 'overlay',
            title: 'actual range outline',
            source: actualOutline.features,
            zIndex: 101,
            renderBuffer: renderBuffer,
            style: actualOutline.style,
            visible: actual_range_show,
        });
        layers.push(actualOutline.layer);*/
    }
    // Si hay datos calculados del contorno (terrain-based), crear la capa y dibujar
    if (calcOutlineData) {
        calcOutlineLayer = new ol.layer.Vector({
            name: 'calcOutline',
            type: 'overlay',
            title: 'terrain-based range outline',
            source: calcOutlineFeatures,
            zIndex: 100,
            renderOrder: null,
            renderBuffer: renderBuffer,
        });
        layers.push(calcOutlineLayer);
        // Dibuja los contornos basados en datos externos
        drawUpintheair();
    }

    // Capa dummy vacía usada como placeholder para las trazas
    const dummyLayer = new ol.layer.Vector({
        name: 'dummy',
        renderOrder: null,
        source: new ol.source.Vector(),
    });

    trailGroup.push(dummyLayer);
    // Crea un grupo que contendrá todas las capas de trazas de aeronaves
    trailLayers = new ol.layer.Group({
        name: 'ac_trail',
        title: 'Aircraft trails',
        type: 'overlay',
        layers: trailGroup,
        zIndex: 150,
    });

    layers.push(trailLayers);

    // Crea la capa que contendrá los iconos/posiciones actuales de aeronaves
    iconLayer = new ol.layer.Vector({
        name: 'iconLayer',
        type: 'overlay',
        title: 'Aircraft positions',
        source: PlaneIconFeatures,
        declutter: false,
        zIndex: 200,
        renderBuffer: renderBuffer,
    });
    layers.push(iconLayer);
    // Capa que dibuja líneas entre aviones cuando se mide distancia aire‑aire
    distanceLineLayer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            })
        }),
        zIndex: 300
    });
    layers.push(distanceLineLayer);
    // Asegura la fuente para puntos del modo elevación y crea la capa para marcar A/B
    if (!elevationPointSource) elevationPointSource = new ol.source.Vector();
        elevationPointLayer = new ol.layer.Vector({
        name: 'elevPoints',
        type: 'overlay',
        title: 'Puntos A-B (elevación)',
        source: elevationPointSource,
        zIndex: 262,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: '#222' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        }),
        visible: true
    });
    layers.push(elevationPointLayer);
    // Asegura la fuente para la línea A-B de elevación y crea la capa que la dibuja
    if (!elevationLineSource) elevationLineSource = new ol.source.Vector();
    elevationLineLayer = new ol.layer.Vector({
        name: 'elevLine',
        type: 'overlay',
        title: 'Línea A-B (elevación)',
        source: elevationLineSource,
        zIndex: 265,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: '#00aaff', width: 2 })
        }),
        visible: true
    });
    layers.push(elevationLineLayer);

    try {
        // Asegura la fuente para puntos tierra‑tierra
        if (!ggPointSource) ggPointSource = new ol.source.Vector();
        // Si la capa no existe, crearla con estilo de punto; si existe, asignar la fuente y ocultarla por defecto
        if (!ggPointLayer) {
            ggPointLayer = new ol.layer.Vector({
                name: 'ggPoints',
                type: 'overlay',
                title: 'Puntos A-B (tierra-tierra)',
                source: ggPointSource,
                zIndex: 245,
                visible: true,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({ color: '#222' }),
                        stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
                    })
                })
            });
        } else {
            // Si ya existía la capa, re-conectar la fuente y esconderla hasta ser usada
            ggPointLayer.setSource(ggPointSource);
            ggPointLayer.setVisible(false);
        }
        layers.push(ggPointLayer);

        // Asegura la fuente para las líneas tierra‑tierra
        if (!ggLineSource) ggLineSource = new ol.source.Vector();
        // Si la capa de líneas no existe, crearla con estilo; si existe, reusar y ocultar
        if (!ggLineLayer) {
            ggLineLayer = new ol.layer.Vector({
                name: 'groundToGround',
                type: 'overlay',
                title: 'Línea A-B (tierra-tierra)',
                source: ggLineSource,
                zIndex: 255,
                visible: true,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({ color: 'blue', width: 2 })
                })
            });
        } else {
            ggLineLayer.setSource(ggLineSource);
            ggLineLayer.setVisible(false);
        }
        layers.push(ggLineLayer);

        // Manejar visibilidad de la capa de líneas TT: limpiar overlays al ocultar; regenerar al mostrar.
        ggLineLayer.on('change:visible', function (evt) {
            const vis = !!evt.target.getVisible();
            if (!vis) {
                try { ggOverlays.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } }); } catch (_) { }
                try { ggOverlays.clear(); } catch (_) { }
            } else {
                try {
                    updateGroundToGroundOverlay();
                    if (!ggUpdateInterval && groundToGroundMode) {
                        ggUpdateInterval = setInterval(updateGroundToGroundOverlay, 1000);
                    }
                } catch (e) { console.error(e); }
            }
        });
    } catch (e) {
        console.error('init TT layers', e);
    }

    // Si existe la capa de puntos en el mapa
    if (groundPointLayer) {
        // Registrar manejador para cuando cambie la visibilidad de la capa
        groundPointLayer.on('change:visible', function (evt) {
            // Convertir el valor de visibilidad a booleano (true = visible)
            const vis = !!evt.target.getVisible();
            try {
                if (!vis) {
                    return;
                }
                // Forzar una actualización inmediata de las líneas/overlays A‑B
                updateDistanceToGroundOverlay();
                // Si no hay intervalo activo y el modo está encendido
                if (!distanceGroundUpdateInterval && distanceToGroundMode) {
                    // Crear intervalo que actualice cada segundo
                    distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);
                }
            } catch (e) {}
        });
    }

    // Capa para el punto A (suelo)
    groundPointSource = new ol.source.Vector();
    groundPointLayer = new ol.layer.Vector({
        name: 'groundPoint',
        type: 'overlay',
        title: 'Punto A (tierra-aire)',
        source: groundPointSource,
        zIndex: 250,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: '#222' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });
    layers.push(groundPointLayer);

    // Capa para la línea entre punto y aeronave
    groundToPlaneLineSource = new ol.source.Vector();
    groundToPlaneLineLayer = new ol.layer.Vector({
        name: 'groundToPlane',
        type: 'overlay',
        title: 'Línea A-B (tierra-aire)',
        source: groundToPlaneLineSource,
        zIndex: 260,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'red', width: 2 })
        })
    });
    layers.push(groundToPlaneLineLayer);

    // Listener para reaccionar cuando cambia la visibilidad de la capa de líneas tierra-aeronave.
    groundToPlaneLineLayer.on('change:visible', function (evt) {
        // Obtener el estado visible de la capa y normalizar a booleano.
        const vis = !!evt.target.getVisible();
        // Si la capa fue ocultada, entrar en la rutina de limpieza.
        if (!vis) {
            try {
                // Quitar y limpiar overlays de pares A‑B
                groundPlaneOverlays.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
                groundPlaneOverlays.clear();
            } catch (_) { }
            try {
                // Quitar y limpiar overlays indexados por hex (modo multi)
                groundPlaneOverlaysByHex.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
                groundPlaneOverlaysByHex.clear();
            } catch (_) { }
            // Quitar y limpiar overlay único de distancia suelo‑avión
            if (distanceGroundOverlay) {
                try { distanceGroundOverlay.setPosition(undefined); } catch (_) { }
                try { OLMap && OLMap.removeOverlay(distanceGroundOverlay); } catch (_) { }
                distanceGroundOverlay = null;
            }
        } else {
            try {
                // Forzar una actualización inmediata para recrear overlays y líneas según el modo activo
                updateDistanceToGroundOverlay();

                // Si no hay intervalo activo y el modo está encendido, crearlo.
                if (!distanceGroundUpdateInterval && distanceToGroundMode) {
                    distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);
                }
            } catch (e) {}
        }
    });

    // Crear una capa vectorial para las líneas entre aviones
    distanceLineLayer = new ol.layer.Vector({
        name: 'distanceLines',
        type: 'overlay',
        title: 'Línea A-B (aire-aire)',
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            })
        }),
        zIndex: 300,
        renderBuffer: renderBuffer,
    });
    layers.push(distanceLineLayer);

    distanceLineLayer.on('change:visible', function (evt) {
        const vis = !!evt.target.getVisible();
        if (!vis) {
            try {
                if (distanceLineFeature) {
                    try { distanceLineLayer.getSource().removeFeature(distanceLineFeature); } catch (_) { }
                    distanceLineFeature = null;
                }
                if (distanceLineFeaturesMap && distanceLineFeaturesMap.size) {
                    distanceLineFeaturesMap.forEach(f => { try { distanceLineLayer.getSource().removeFeature(f); } catch (_) { } });
                    distanceLineFeaturesMap.clear();
                }
                if (distanceOverlay) {
                    try { distanceOverlay.setPosition(undefined); } catch (_) { }
                    try { OLMap && OLMap.removeOverlay(distanceOverlay); } catch (_) { }
                    distanceOverlay = null;
                }
                if (distanceOverlaysMap && distanceOverlaysMap.size) {
                    distanceOverlaysMap.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
                    distanceOverlaysMap.clear();
                }
                if (distanceUpdateInterval) {
                    clearInterval(distanceUpdateInterval);
                    distanceUpdateInterval = null;
                }
            } catch (e) { console.error(e); }
        } else {
            try {
                updateDistanceLine();
                if (!distanceUpdateInterval && distanceBetweenPlanesMode) {
                    distanceUpdateInterval = setInterval(updateDistanceLine, 1000);
                }
            } catch (e) { console.error(e); }
        }
    });

    ol_map_init();

    // handle the layer settings pane checkboxes
    //OLMap.once('postrender', function(e) {
    //toggleLayer('#nexrad_checkbox', 'nexrad');
    //toggleLayer('#sitepos_checkbox', 'site_pos');
    //toggleLayer('#actrail_checkbox', 'ac_trail');
    //toggleLayer('#acpositions_checkbox', 'webglLayer');
    //});

    // Si se cierra el panel de información, ejecutar acciones de limpieza y estado
    jQuery('#infoblock_close').on('click', function () {
        // Si se estaba viendo una traza histórica, salir de ese modo
        if (showTrace)
            toggleShowTrace();
        // Si estaba activo el modo "solo seleccionado", desactivarlo
        if (onlySelected)
            toggleIsolation();
        // Deseleccionar el avión actualmente seleccionado
        deselect(SelectedPlane);
        // Refrescar filtros/tabla tras el cambio
        refreshFilter();
    });


    // Crea un control Toggle para alternar colores más oscuros en la UI
    new Toggle({
        key: "darkerColors",
        display: "Darker Colors",
        container: "#settingsLeft",
        init: darkerColors,
        setState: function (state) {
            darkerColors = state;
            if (loadFinished) {
                refreshFeatures();
                remakeTrails();
            }
        }
    });
    // Guardar la paleta actual como versión "clara"
    tableColorsLight = tableColors;
    tableColorsDark = JSON.parse(JSON.stringify(tableColors));
    let darkVals = Object.values(tableColorsDark);
    for (let i in ['selected', 'unselected']) {
        let obj = darkVals[i];
        let keys = Object.keys(obj)
        for (let j in keys) {
            let key = keys[j];
            let hsl = hexToHSL(obj[key]);
            hsl[1] *= 0.4;
            hsl[2] *= 0.3;
            obj[key] = hslToRgb(hsl);
        }
    }
    // Crear el toggle para el modo oscuro (Dark Mode)
    new Toggle({
        key: "darkMode",
        display: "Dark Mode",
        container: "#settingsLeft",
        init: darkModeDefault,
        setState: function (state) {
            let root = document.documentElement;
            jQuery(".layer-switcher .panel").css("background", "var(--BGCOLOR1)");
            jQuery(".layer-switcher .panel").css("border", "4px solid var(--BGCOLOR1)");
            if (state) {
                root.style.setProperty("--BGCOLOR1", '#313131');
                root.style.setProperty("--BGCOLOR2", '#242424');
                root.style.setProperty("--TXTCOLOR1", "#BFBFBF");
                root.style.setProperty("--TXTCOLOR2", "#D8D8D8");
                root.style.setProperty("--TXTCOLOR3", "#a8a8a8");
                //invert the "x" images
                jQuery(".infoblockCloseBox").css('filter', 'invert(100%)');
                jQuery(".infoblockCloseBox").css(' -webkit-filter', 'invert(100%)');
                jQuery(".settingsCloseBox").css('filter', 'invert(100%)');
                jQuery(".settingsCloseBox").css(' -webkit-filter', 'invert(100%)');
                tableColors = tableColorsDark;
            } else {
                root.style.setProperty("--BGCOLOR1", '#F8F8F8');
                root.style.setProperty("--BGCOLOR2", '#CCCCCC');
                root.style.setProperty("--TXTCOLOR1", "#003f4b");
                root.style.setProperty("--TXTCOLOR2", "#050505");
                root.style.setProperty("--TXTCOLOR3", "#003f4b");
                jQuery(".infoblockCloseBox").css('filter', 'invert(0%)');
                jQuery(".infoblockCloseBox").css(' -webkit-filter', 'invert(0%)');
                jQuery(".settingsCloseBox").css('filter', 'invert(0%)');
                jQuery(".settingsCloseBox").css(' -webkit-filter', 'invert(0%)');

                tableColors = tableColorsLight;
            }
            if (loadFinished) {
                TAR.planeMan.redraw();
                refreshFilter();
                initLegend(tableColors.unselected);
                initSourceFilter(tableColors.unselected);
                initFlagFilter(tableColors.unselected);
            }
        }
    });

    // Inicializar la leyenda con colores para fuentes no seleccionadas
    initLegend(tableColors.unselected);

    // Inicializar filtros en la UI
    initFilters();

    // Registrar un manejador para cada capa base que permita atenuar el mapa al renderizar
    ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
        if (lyr.get('type') != 'base')
            return;
        lyr.dimKey = lyr.on('postrender', dim);
    });

    // Toggle para atenuar el mapa (Dim Map)
    new Toggle({
        key: "MapDim",
        display: "Dim Map",
        container: "#settingsLeft",
        init: MapDim,
        setState: function (state) {
            /*
            if (!state) {
                ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
                    if (lyr.get('type') != 'base')
                        return;
                    ol.Observable.unByKey(lyr.dimKey);
                });
            } else {
                ol.control.LayerSwitcher.forEachRecursive(layers_group, function(lyr) {
                    if (lyr.get('type') != 'base')
                        return;
                    lyr.dimKey = lyr.on('postrender', dim);
                });
            }
            */
            if (loadFinished) {
                OLMap.render();
            }
            buttonActive('#B', state);
        }
    });

    // Escucha teclas para atajos globales y acciones rápidas
    window.addEventListener('keydown', function (e) {
        // Marca que el usuario está activo (reset timeout)
        active();
        // Si el evento ya fue manejado, no hacer nada
        if (e.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        // Si el foco está en un campo de texto, no interpretar el atajo
        if (e.target.type == "text") {
            return;
        }
        // Si el foco está en un input, no interpretar el atajo
        if (e.srcElement.nodeName == 'INPUT') {
            return;
        }
        // Ignora combinaciones con Ctrl/Alt/Meta (evitar conflictos del navegador)
        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }
        // Variables temporales para mover/centrar el mapa
        let oldCenter, extent, newCenter;
        // Elegir acción según la tecla pulsada
        switch (e.key) {
            // Deselecciona todos los aviones
            case "c":
            case "Esc":
            case "Escape":
                deselectAllPlanes();
                break;
            // zoom and movement
            // Acercar/Alejar y atajos de zoom
            case "q":
            case "-":
            case "Subtract":
                zoomOut();
                break;
            case "e":
            case "+":
            case "Add":
                zoomIn();
                break;
            // Mover vista hacia arriba
            case "ArrowUp":
            case "w":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [oldCenter[0], (oldCenter[1] + extent[3]) / 2];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            // Mover vista hacia abajo
            case "ArrowDown":
            case "s":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [oldCenter[0], (oldCenter[1] + extent[1]) / 2];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            // Mover vista izquierda
            case "ArrowLeft":
            case "a":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [(oldCenter[0] + extent[0]) / 2, oldCenter[1]];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            // Mover vista derecha
            case "ArrowRight":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [(oldCenter[0] + extent[2]) / 2, oldCenter[1]];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            // Alterna modo de medir distancia entre aviones
            case "d":
                toggleDistance();
                break;
            // misc
            // Misc: alternar atenuado del mapa
            case "b":
                toggles['MapDim'].toggle();
                break;
            // Alternar selección múltiple
            case "m":
                toggleMultiSelect();
                break;
            // Mostrar/ocultar tabla en vista
            case "v":
                toggleTableInView();
                break;
            // Seguir o dibujar heatmap o elegir avión aleatorio
            case "r":
                if (heatmap)
                    drawHeatmap();
                else
                    followRandomPlane();
                break;
            // Forzar fetch de datos
            case "R":
                fetchData();
                break;
            // Seleccionar todos los aviones
            case "t":
                selectAllPlanes();
                break;
            // Alternar mostrar sólo sin GPS
            case "G":
                nogpsOnly = !nogpsOnly;
                refreshFilter();
                break;
            // Reset mapa
            case "h":
                resetMap();
                break;
            // Mostrar/ocultar botones de UI
            case "H":
                hideButtons = !hideButtons;
                showHideButtons();
                break;
            // Alternar seguimiento del avión seleccionado
            case "f":
                toggleFollow();
                break;
            // filters
            // Filtros y toggles varios (T, u, i, p, l, o, k)
            case "T":
                filterTISB = !filterTISB;
                refreshFilter();
                break;
            case "u":
                toggleMilitary();
                break;
            case "i":
                toggleIsolation();
                break;
            // persistence mode
            case "p":
                togglePersistence();
                break;
            // Labels
            case "l":
                toggleLabels();
                break;
            case "o":
                toggleExtendedLabels();
                break;
            case "k":
                toggleTrackLabels();
                break;
            // debug stuff
            // Debug: alterna último tramo
            case "L":
                toggles['lastLeg'].toggle();
                break;
            // Debug: activar log de depuración
            case "D":
                debug = !debug;
                loStore['debug'] = debug;
                console.log('debug = ' + debug);
                break;
            // Debug posición filtro
            case "P":
                debugPosFilter = !debugPosFilter;
                loStore['debugPosFilter'] = debugPosFilter;
                console.log('debugPosFilter = ' + debugPosFilter);
                break;
            // Muestra info detallada del avión seleccionado
            case "?":
                if (!SelectedPlane) {
                    console.log("No plane selected");
                    break;
                }
                console.log(SelectedPlane.icao + ": " + SelectedPlane.baseMarkerKey + "  " + SelectedPlane.shape);
                console.log(SelectedPlane);
                console.log(SelectedPlane.milRange());
                break;
            // Saltar a avión por hex y seguirlo
            case "j":
                selectPlaneByHex(jumpTo, { follow: true });
                break;
            // Debug jump toggle
            case "J":
                debugJump = !debugJump;
                loStore['debugJump'] = debugJump;
                console.log('debugJump = ' + debugJump);
                break;
            // Alternar uso de MLAT
            case "N":
                noMLAT = !noMLAT;
                loStore['noMLAT'] = noMLAT;
                console.log('noMLAT = ' + noMLAT);
                break;
        }
    }, true);

    // Decide si usar la ubicación del navegador o la posición del sitio según parámetros URL
    if (!usp.has('icao')
        && !usp.has("lat") && !usp.has("lon")
        && !usp.has('airport')
    ) {
        runAfterLoad(geoFindMe);
    } else {
        runAfterLoad(initSitePos);
    }

}

// This looks for planes to reap out of the master g.planes variable
// Busca y elimina aviones que no han enviado mensajes por mucho tiempo (limpieza de memoria)
let lastReap = 0;
let reapInProgress = false;
function reaper(all) {
    //console.log("Reaping started..");

    if (reapInProgress) {
        return;
    }

    // Marca el tiempo del último reap
    lastReap = now;

    // Si está activado noVanish y no se pide reap completo, no eliminar nada
    if (noVanish && !all) {
        return;
    }

    reapInProgress = true;

    if (!all) {
        releaseMem();
    }

    // Look for planes where we have seen no messages for >300 seconds
    // Recorre la lista y borra aviones que han estado inactivos más allá del timeout
    let plane;
    let length = g.planesOrdered.length;
    let temp = []
    for (let i in g.planesOrdered) {
        plane = g.planesOrdered[i];
        if (plane == null)
            continue;
        plane.seen = now - plane.last_message_time;
        if (all ||
            (
                (!plane.selected)
                && plane.seen > reapTimeout
                && (plane.dataSource != 'adsc' || plane.seen > jaeroTimeout)
                && (plane.dataSource != 'ais' || plane.seen > aisTimeout)
            )
        ) {
            // Reap it.
            //console.log("Removed " + plane.icao);
            delete g.planes[plane.icao];
            plane.destroy();
            continue;
        }

        // Keep it.
        // Mantener el avión
        temp.push(plane);

        // Si es vista tipo globo, gestionar limpieza de trazas diferida
        if (globeIndex) {
            if (plane.clearTraceAfter) {
                //console.log(now - plane.clearTraceAfter);
                if (now > plane.clearTraceAfter) {
                    plane.clearTrace();
                    //console.log("clearTrace: " + plane.icao);
                }
            } else if (!plane.linesDrawn) {
                plane.clearTraceAfter = now + 300;
            }
        }
    }
    g.planesOrdered = temp;

    reapInProgress = false;
    const removed = length - g.planesOrdered.length;
    if (removed > 0) {
        //console.log(`reaper removed ${removed} planes.`);
    }

    return removed;
}

// Page Title update function
// Actualiza el título de la pestaña con número de aviones y tasa de mensajes si corresponde
function refreshPageTitle() {
    if (pTracks)
        return;
    if (!PlaneCountInTitle && !MessageRateInTitle) {
        return;
    }

    let subtitle = "";

    if (PlaneCountInTitle) {
        if (globeIndex) {
            subtitle += 'tracking ' + globeTrackedAircraft + ' aircraft';
        } else {
            subtitle += TrackedAircraftPositions + '/' + TrackedAircraft;
        }
    }

    if (MessageRateInTitle && MessageRate != null) {
        if (subtitle) subtitle += ' | ';
        subtitle += MessageRate.toFixed(1) + '/s';
    }

    if (PageName) {
        document.title = PageName + ' - ' + subtitle;
    } else {
        document.title = subtitle;
    }
}
// Muestra la silueta del avión seleccionado cuando no hay foto disponible
function displaySil() {
    jQuery('#copyrightInfo').html("");
    if (!showSil) {
        setPhotoHtml("");
        return;
    }
    let selected = SelectedPlane;
    let new_html = "";
    let type = selected.icaoType ? selected.icaoType : 'ZZZZ';
    let hex = selected.icao.toUpperCase();
    new_html = "<img id='silhouette' width='" + 151 * globalScale + "' src='aircraft_sil/" + type + ".png' />";
    setPhotoHtml(new_html);
    selected.icao.toUpperCase();
}
// Muestra la foto real del avión si la API devolvió imágenes
function displayPhoto() {
    if (!SelectedPlane)
        return;
    if (!SelectedPlane.psAPIresponse) {
        displaySil();
        return;
    }
    let photos = SelectedPlane.psAPIresponse["photos"] || SelectedPlane.psAPIresponse["images"];
    if (!photos || photos.length == 0) {
        displaySil();
        adjustInfoBlock();
        return;
    }
    let new_html = "";
    let photoToPull = photos[0]["thumbnail"]["src"] || photos[0]["thumbnail"];
    let linkToPicture = photos[0]["link"];
    //console.log(linkToPicture);
    new_html = '<a class=\"link\" href="' + linkToPicture + '" target="_blank" rel="noopener noreferrer"><img id="airplanePhoto" src=' + photoToPull + '></a>';
    let copyright = photos[0]["photographer"] || photos[0]["user"];
    jQuery('#copyrightInfo').html("<span>Image © " + copyright + "</span>");
    setPhotoHtml(new_html);
    adjustInfoBlock();
}
// Consulta APIs externas (planespotters / planespotting) para obtener fotos y actualizar la UI
function refreshPhoto(selected) {
    if (!showPictures || selected.icao[0] == '~' || (!planespottingAPI && !planespottersAPI)) {
        displaySil();
        return;
    }
    let urlTail;
    let param;
    if (!selected.dbinfoLoaded) {
        displaySil();
        return;
    } else if (false && selected.registration != null && selected.registration.match(/^[0-9]{0,2}\+?[0-9]{0,2}$/)) {
        urlTail = '/hex/' + selected.icao.toUpperCase();
    } else if (selected.registration != null) {
        urlTail = '/hex/' + selected.icao.toUpperCase() + '?reg=' + selected.registration;
        const type = selected.icaoType;
        // && type != 'E170' && !type.startsWith('E75')
        if (type) {
            urlTail += '&icaoType=' + type;
        }
        param = 'DB';
    } else {
        urlTail = 'hex/' + selected.icao.toUpperCase();
        param = 'hex';
    }


    const ts = new Date().getTime();
    if (param == selected.psAPIparam) {
        if (selected.psAPIresponse) {
            displayPhoto();
            return;
        }
        if (selected.psAPIresponseTS && selected.psAPIresponseTS - ts < 10000) {
            return;
        }
    }
    selected.psAPIparam = param;

    setPhotoHtml("<p>Loading image...</p>");
    jQuery('#copyrightInfo').html("<span></span>");
    //console.log(ts/1000 + 'sending psAPI request');
    selected.psAPIresponseTS = ts;

    if (planespottersAPI) {
        let req = jQuery.ajax({
            url: planespottersAPIurl + urlTail,
            dataType: 'json',
            plane: selected,
        });

        req.done(function (data) {
            this.plane.psAPIresponse = data;
            if (SelectedPlane == this.plane) {
                displayPhoto();
            }
        });
    } else if (planespottingAPI) {
        let req = jQuery.ajax({
            url: 'https://www.planespotting.be/api/objects/imagesRegistration.php?registration=' + selected.registration,
            dataType: 'json',
            plane: selected,
        });

        req.done(function (data) {
            this.plane.psAPIresponse = data;
            if (SelectedPlane == this.plane) {
                displayPhoto();
            }
        });
        req.fail(function () {
            this.plane.psAPIresponse = { 'photos': [] };
            if (SelectedPlane == this.plane) {
                displayPhoto();
            }
        });
    }
}
// Variables auxiliares para la selección actual (llamadas, icao, registro)
let selCall = null;
let selIcao = null;
let selReg = null;

let somethingSelected = false;
// Refresh the detail window about the plane
// Actualiza el panel lateral con toda la información del avión seleccionado
function refreshSelected() {
    const selected = SelectedPlane;

    if (!selected || !selected.nav_qnh) {
        jQuery('#altimeter_set_selected').prop("disabled", true);
    } else {
        jQuery('#altimeter_set_selected').prop("disabled", false);
    }

    if (!selected) {
        if (somethingSelected) {
            adjustInfoBlock();
            buttonActive('#F', FollowSelected);
        }
        somethingSelected = false;
        return;
    }
    somethingSelected = true;
    buttonActive('#F', FollowSelected);

    selected.updateVisible();
    selected.checkForDB();

    refreshPhoto(selected);

    jQuery('#selected_callsign').updateText(selected.name);

    if (showTrace) {
        if (selected.position_time) {
            const date = new Date(selected.position_time * 1000);
            let timestamp = utcTimesHistoric ? (zuluTime(date) + NBSP + 'Z') : (lDateString(date) + ' ' + localTime(date) + NBSP + TIMEZONE);
            jQuery('#trace_time').updateText('Time:\n' + timestamp);
        } else {
            jQuery('#trace_time').updateText('Time:\n');
        }
    }

    if (flightawareLinks) {
        jQuery('#selected_flightaware_link').html(getFlightAwareModeSLink(selected.icao, selected.flight, "Visit Flight Page"));
    }

    if (selected.isNonIcao() && selected.source != 'mlat') {
        jQuery('#anon_mlat_info').addClass('hidden');
        jQuery('#reg_info').addClass('hidden');
        jQuery('#tisb_info').removeClass('hidden');
    } else if (selected.isNonIcao() && selected.source == 'mlat') {
        jQuery('#reg_info').addClass('hidden');
        jQuery('#tisb_info').addClass('hidden');
        jQuery('#anon_mlat_info').removeClass('hidden');
    } else {
        jQuery('#tisb_info').addClass('hidden');
        jQuery('#anon_mlat_info').addClass('hidden');
        jQuery('#reg_info').removeClass('hidden');
    }

    let checkReg = selected.registration + ' ' + selected.dbinfoLoaded;
    if (checkReg != selReg) {
        selReg = checkReg;
        if (selected.registration) {
            if (flightawareLinks) {
                jQuery('#selected_registration').html(getFlightAwareIdentLink(selected.registration, selected.registration));
            } else if (registrationLinks && registrationLink(selected)) {
                jQuery('#selected_registration').html(`<a class="link" target="_blank" href="${registrationLink(selected)}">${selected.registration}</a>`);
            } else {
                jQuery('#selected_registration').updateText(selected.registration);
            }
        } else {
            jQuery('#selected_registration').updateText("n/a");
        }
    }
    let dbFlags = "";
    if (selected.ladd)
        dbFlags += ' <a class="link" target="_blank" href="https://www.faa.gov/pilots/ladd/" rel="noreferrer">LADD</a> / ';
    if (selected.pia)
        dbFlags += '<a class="link" target="_blank" href="https://www.faa.gov/air_traffic/technology/equipadsb/privacy/" rel="noreferrer">PIA</a> / ';
    if (selected.military)
        dbFlags += 'military / ';
    if (dbFlags.length == 0) {
        jQuery('#selected_dbFlags').updateText("none");
    } else {
        jQuery('#selected_dbFlags').html(dbFlags.slice(0, -3));
    }

    if (selected.icaoType) {
        jQuery('#selected_icaotype').updateText(selected.icaoType);
    } else {
        jQuery('#selected_icaotype').updateText("n/a");
    }
    if (selected.typeDescription)
        jQuery('#selected_typedesc').updateText(selected.typeDescription);
    else
        jQuery('#selected_typedesc').updateText("n/a");

    let typeLine = "";
    if (selected.year)
        typeLine += selected.year + " "
    if (selected.typeLong)
        typeLine += selected.typeLong;
    if (!typeLine)
        typeLine = "n/a"

    jQuery('#selected_typelong').updateText(typeLine);

    if (selected.ownOp)
        jQuery('#selected_ownop').updateText(selected.ownOp);
    else
        jQuery('#selected_ownop').updateText("");

    if (selected.rId && show_rId) {
        jQuery('#receiver_id').updateText(selected.rId);
        jQuery('#receiver_id_div').removeClass('hidden');
    } else {
        jQuery('#receiver_id_div').addClass('hidden');
    }


    jQuery("#selected_altitude1").updateText(format_altitude_long(adjust_baro_alt(selected.altitude), selected.vert_rate, DisplayUnits));
    jQuery("#selected_altitude2").updateText(format_altitude_long(adjust_baro_alt(selected.altitude), selected.vert_rate, DisplayUnits));

    jQuery('#selected_onground').updateText(format_onground(selected.altitude));

    if (selected.squawk == null || selected.squawk == '0000') {
        jQuery('#selected_squawk1').updateText('n/a');
        jQuery('#selected_squawk2').updateText('n/a');
    } else {
        jQuery('#selected_squawk1').updateText(selected.squawk);
        jQuery('#selected_squawk2').updateText(selected.squawk);
    }

    if (useRouteAPI) {
        if (selected.routeString) {
            jQuery('#selected_route').updateText(selected.routeString);
            jQuery('#selected_route').attr('title', selected.routeVerbose);
        } else {
            jQuery('#selected_route').updateText('n/a');
        }
    }

    let magResult = null;

    if (geoMag && selected.position != null) {
        let lon = selected.position[0];
        let lat = selected.position[1];
        let alt = selected.altitude == "ground" ? 0 : selected.altitude;
        magResult = geoMag(lat, lon, alt);
        jQuery('#selected_mag_declination').updateText(format_track_brief(magResult.dec));
    } else {
        jQuery('#selected_mag_declination').updateText('n/a');
    }

    let heading = null;
    if (selected.true_heading != null && selected.track != null) {
        heading = selected.true_heading;
    } else if (magResult && selected.mag_heading != null && selected.track != null) {
        heading = selected.mag_heading + magResult.dec;
    }
    if (heading != null && heading < 0)
        heading += 360;
    if (heading != null && heading > 360)
        heading -= 360;

    jQuery('#selected_mag_heading').updateText(format_track_brief(selected.mag_heading));

    if (selected.wd != null && selected.ws != null) {
        jQuery('#selected_wd').updateText(format_track_brief(selected.wd, true));
        jQuery('#selected_ws').updateText(format_speed_long(selected.ws, DisplayUnits));
    } else if (!globeIndex && magResult && selected.gs != null && selected.tas != null && selected.track != null && selected.mag_heading != null) {

        const trk = (Math.PI / 180) * selected.track;
        const hdg = (Math.PI / 180) * heading;
        const tas = selected.tas;
        const gs = selected.gs;
        const ws = Math.round(Math.sqrt(Math.pow(tas - gs, 2) + 4 * tas * gs * Math.pow(Math.sin((hdg - trk) / 2), 2)));
        let wd = trk + Math.atan2(tas * Math.sin(hdg - trk), tas * Math.cos(hdg - trk) - gs);
        if (wd < 0) {
            wd = wd + 2 * Math.PI;
        }
        if (wd > 2 * Math.PI) {
            wd = wd - 2 * Math.PI;
        }
        wd = Math.round((180 / Math.PI) * wd);
        jQuery('#selected_wd').updateText(format_track_brief(wd, true));
        jQuery('#selected_ws').updateText(format_speed_long(ws, DisplayUnits));
    } else {
        jQuery('#selected_wd').updateText('n/a');
        jQuery('#selected_ws').updateText('n/a');
    }


    if (!globeIndex && selected.true_heading == null && heading != null)
        jQuery('#selected_true_heading').updateText(format_track_brief(heading));
    else
        jQuery('#selected_true_heading').updateText(format_track_brief(selected.true_heading));


    let oat = null;
    let tat = null;

    if (selected.tat != null && selected.oat != null) {
        oat = selected.oat;
        tat = selected.tat;
    } else if (!globeIndex && selected.mach != null && selected.tas != null && selected.mach > 0.395) {
        oat = Math.pow((selected.tas / 661.47 / selected.mach), 2) * 288.15 - 273.15;
        tat = -273.15 + (oat + 273.15) * (1 + 0.2 * selected.mach * selected.mach);
    }


    if (oat != null)
        jQuery('#selected_temp').updateText(Math.round(tat) + ' / ' + Math.round(oat) + ' °C');
    else
        jQuery('#selected_temp').updateText('n/a');

    jQuery('#selected_speed1').updateText(format_speed_long(selected.gs, DisplayUnits));
    jQuery('#selected_speed2').updateText(format_speed_long(selected.gs, DisplayUnits));
    jQuery('#selected_ias').updateText(format_speed_long(selected.ias, DisplayUnits));
    jQuery('#selected_tas').updateText(format_speed_long(selected.tas, DisplayUnits));
    jQuery('#selected_vert_rate').updateText(format_vert_rate_long(selected.vert_rate, DisplayUnits));
    jQuery('#selected_baro_rate').updateText(format_vert_rate_long(selected.baro_rate, DisplayUnits));
    jQuery('#selected_geom_rate').updateText(format_vert_rate_long(selected.geom_rate, DisplayUnits));

    setSelectedIcao();

    jQuery('#selected_pf_info').updateText((selected.pfRoute ? selected.pfRoute : ""));
    //+" "+ (selected.pfFlightno ? selected.pfFlightno : "")
    jQuery('#airframes_post_icao').attr('value', selected.icao);
    jQuery('#selected_track1').updateText(format_track_brief(selected.track));
    jQuery('#selected_track2').updateText(format_track_brief(selected.track));

    if (selected.seen != null && selected.seen < 1000000) {
        jQuery('#selected_seen').updateText(format_duration(selected.seen));
    } else {
        jQuery('#selected_seen').updateText('n/a');
    }
    if (selected.position_time != null) {
        jQuery('#selected_pos_epoch').updateText(Math.round(selected.position_time));
    } else {
        jQuery('#selected_pos_epoch').updateText('n/a');
    }
    if (selected.seen_pos != null && selected.seen_pos < 1000000) {
        jQuery('#selected_seen_pos').updateText(format_duration(selected.seen_pos));
    } else {
        jQuery('#selected_seen_pos').updateText('n/a');
    }

    jQuery('#selected_country').updateText(selected.country.replace("special use", "special"));

    if (selected.position == null) {
        jQuery('#selected_position').updateText('n/a');
    } else {

        if (selected.seen_pos > -1) {
            jQuery('#selected_position').updateText(format_latlng(selected.position));
        } else {
            jQuery('#selected_position').updateText(format_latlng(selected.position));
        }
    }
    let sitedist;
    if (selected.position && SitePosition) {
        sitedist = ol.sphere.getDistance(SitePosition, selected.position);
    }
    jQuery('#selected_source').updateText(format_data_source(selected.dataSource));
    jQuery('#selected_category').updateText(selected.category ? selected.category : "n/a");
    jQuery('#selected_category_label').updateText(get_category_label(selected.category));
    jQuery('#selected_sitedist1').updateText(format_distance_long(sitedist, DisplayUnits));
    jQuery('#selected_sitedist2').updateText(format_distance_long(sitedist, DisplayUnits));
    jQuery('#selected_rssi1').updateText(selected.rssi != null ? selected.rssi.toFixed(1) : "n/a");
    if (
        ((selected.messages == undefined && selected.receiverCount) || (globeIndex && binCraft))
        && !showTrace
    ) {
        jQuery('#selected_message_count').prev().updateText('Receivers:');
        jQuery('#selected_message_count').prop('title', 'Number of receivers receiving this aircraft');
        if (selected.receiverCount >= 5 && selected.dataSource != 'mlat') {
            jQuery('#selected_message_count').updateText('> ' + selected.receiverCount);
        } else {
            jQuery('#selected_message_count').updateText(selected.receiverCount);
        }
    } else {
        jQuery('#selected_message_count').prev().updateText('Messages:');
        jQuery('#selected_message_count').prop('title', 'The total number of messages received from this aircraft');
        jQuery('#selected_message_count').updateText(selected.messages);
    }
    jQuery('#selected_message_rate').updateText((selected.messageRate != null) ? (selected.messageRate.toFixed(1)) : "n/a");
    jQuery('#selected_photo_link').html(getPhotoLink(selected));

    jQuery('#selected_altitude_geom1').updateText(format_altitude_long(adjust_geom_alt(selected.alt_geom, selected.position), selected.geom_rate, DisplayUnits));
    jQuery('#selected_altitude_geom2').updateText(format_altitude_long(adjust_geom_alt(selected.alt_geom, selected.position), selected.geom_rate, DisplayUnits));
    jQuery('#selected_ias').updateText(format_speed_long(selected.ias, DisplayUnits));
    jQuery('#selected_tas').updateText(format_speed_long(selected.tas, DisplayUnits));
    if (selected.mach == null) {
        jQuery('#selected_mach').updateText('n/a');
    } else {
        jQuery('#selected_mach').updateText(selected.mach.toFixed(3));
    }
    if (selected.roll == null) {
        jQuery('#selected_roll').updateText('n/a');
    } else {
        jQuery('#selected_roll').updateText(selected.roll.toFixed(1));
    }
    if (selected.track_rate == null) {
        jQuery('#selected_trackrate').updateText('n/a');
    } else {
        jQuery('#selected_trackrate').updateText(selected.track_rate.toFixed(2));
    }
    jQuery('#selected_geom_rate').updateText(format_vert_rate_long(selected.geom_rate, DisplayUnits));
    if (selected.nav_qnh == null) {
        jQuery('#selected_nav_qnh').updateText("n/a");
    } else {
        jQuery('#selected_nav_qnh').updateText(selected.nav_qnh.toFixed(1) + " hPa");
    }
    jQuery('#selected_nav_altitude').updateText(format_altitude_long(selected.nav_altitude, 0, DisplayUnits));
    jQuery('#selected_nav_heading').updateText(format_track_brief(selected.nav_heading));
    if (selected.nav_modes == null) {
        jQuery('#selected_nav_modes').updateText("n/a");
    } else {
        jQuery('#selected_nav_modes').updateText(selected.nav_modes.join());
    }
    if (selected.nic_baro == null) {
        jQuery('#selected_nic_baro').updateText("n/a");
    } else {
        if (selected.nic_baro == 1) {
            jQuery('#selected_nic_baro').updateText("cross-checked");
        } else {
            jQuery('#selected_nic_baro').updateText("not cross-checked");
        }
    }

    jQuery('#selected_nac_p').updateText(format_nac_p(selected.nac_p));
    jQuery('#selected_nac_v').updateText(format_nac_v(selected.nac_v));
    if (selected.rc == null) {
        jQuery('#selected_rc').updateText("n/a");
    } else if (selected.rc == 0) {
        jQuery('#selected_rc').updateText("unknown");
    } else {
        jQuery('#selected_rc').updateText(format_distance_short(selected.rc, DisplayUnits));
    }

    if (selected.sil == null || selected.sil_type == null) {
        jQuery('#selected_sil').updateText("n/a");
    } else {
        let sampleRate = "";
        let silDesc = "";
        if (selected.sil_type == "perhour") {
            sampleRate = " per flight hour";
        } else if (selected.sil_type == "persample") {
            sampleRate = " per sample";
        }

        switch (selected.sil) {
            case 0:
                silDesc = "&gt; 1e-3";
                break;
            case 1:
                silDesc = "≤ 1e-3";
                break;
            case 2:
                silDesc = "≤ 1e-5";
                break;
            case 3:
                silDesc = "≤ 1e-7";
                break;
            default:
                silDesc = "n/a";
                sampleRate = "";
                break;
        }
        jQuery('#selected_sil').html(silDesc + sampleRate);
    }

    if (selected.version == null) {
        jQuery('#selected_version').updateText('none');
    } else if (selected.version == 0) {
        jQuery('#selected_version').updateText('v0 (DO-260)');
    } else if (selected.version == 1) {
        jQuery('#selected_version').updateText('v1 (DO-260A)');
    } else if (selected.version == 2) {
        jQuery('#selected_version').updateText('v2 (DO-260B)');
    } else {
        jQuery('#selected_version').updateText('v' + selected.version);
    }

    adjustInfoBlock();
}

// Indica si hay actualmente un avión resaltado por el cursor
let somethingHighlighted = false;
// Muestra información breve junto al cursor para el avión resaltado
function refreshHighlighted() {
    // this is following nearly identical logic, etc, as the refreshSelected function, but doing less junk for the highlighted pane
    let highlighted = HighlightedPlane;

    if (!highlighted) {
        if (somethingHighlighted)
            jQuery('#highlighted_infoblock').hide();
        somethingHighlighted = false;
        return;
    }
    somethingHighlighted = true;

    highlighted.checkVisible();

    jQuery('#highlighted_infoblock').show();

    let infoBox = jQuery('#highlighted_infoblock');

    let marker = highlighted.marker || highlighted.glMarker;
    let geom;
    let markerCoordinates;
    if (!marker || !(geom = marker.getGeometry()) || !(markerCoordinates = geom.getCoordinates())) {
        jQuery('#highlighted_infoblock').hide();
        return;
    }
    let markerPosition = OLMap.getPixelFromCoordinate(markerCoordinates);
    if (!markerPosition)
        return;

    let mapSize = OLMap.getSize();
    let infoBoxLeft = markerPosition[0];
    let infoBoxTop = markerPosition[1];
    if ((infoBoxLeft + 20 + infoBox.width()) < mapSize[0])
        infoBoxLeft += 20;
    else if ((infoBoxLeft - 20 - infoBox.width()) > 0)
        infoBoxLeft -= (20 + infoBox.width());
    else
        infoBoxLeft = 0;
    if ((infoBoxTop + 20 + infoBox.height()) < mapSize[1])
        infoBoxTop += 20;
    else if (infoBoxTop - (20 + infoBox.height()) > 0)
        infoBoxTop -= (20 + infoBox.height());
    else
        infoBoxTop = 0;
    infoBox.css("left", infoBoxLeft);
    infoBox.css("top", infoBoxTop);

    jQuery('#highlighted_callsign').text(highlighted.name);

    if (highlighted.icaoType !== null) {
        jQuery('#highlighted_icaotype').text(highlighted.icaoType);
    } else {
        jQuery('#highlighted_icaotype').text("n/a");
    }

    if (useRouteAPI) {
        if (highlighted.routeString) {
            jQuery('#highlighted_route').updateText(highlighted.routeString);
        } else {
            jQuery('#highlighted_route').updateText('n/a');
        }
    }

    jQuery('#highlighted_source').text(format_data_source(highlighted.getDataSource()));

    if (highlighted.registration !== null) {
        jQuery('#highlighted_registration').text(highlighted.registration);
    } else {
        jQuery('#highlighted_registration').text("n/a");
    }

    jQuery('#highlighted_speed').text(format_speed_long(highlighted.gs, DisplayUnits));

    jQuery("#highlighted_altitude").text(format_altitude_long(adjust_baro_alt(highlighted.altitude), highlighted.vert_rate, DisplayUnits));

    jQuery('#highlighted_pf_route').text((highlighted.pfRoute ? highlighted.pfRoute : highlighted.icao.toUpperCase()));

    jQuery('#highlighted_rssi').text(highlighted.rssi != null ? highlighted.rssi.toFixed(1) + ' dBFS' : "n/a");
}
// Quita cualquier avión resaltado
function removeHighlight() {
    HighlightedPlane = null;
    refreshHighlighted();
}
// Devuelve la hora actual en milisegundos
function mstime() {
    return new Date().getTime();
}

// recreating all OpenLayers Features for the planes every now and then releases some retained memory
// Haven't been able to create a reproducer ... regardless let's stick with this workaround
// in other words: probably not an issue with OpenLayers.
// Frecuencia próxima para limpieza de cachés
let nextCacheClear = mstime() + 300 * 1000;

// Libera memoria recreando estilos y marcadores para evitar fugas
function releaseMem() {
    if (!loadFinished || mstime() < nextCacheClear) {
        return;
    }

    nextCacheClear = mstime() + 300 * 1000;
    lineStyleCache = {};
    iconCache = {};

    //console.trace();
    //console.log('releaseMem()');
    for (let i in g.planesOrdered) {
        let plane = g.planesOrdered[i];
        plane.clearMarker();
        plane.destroyTR();
    }
    refreshFeatures();
    TAR.planeMan.redraw();
    refresh();
}
// Fuerza la actualización de "features" (marcadores/trazas) de todos los aviones
function refreshFeatures() {
    if (!loadFinished) {
        return;
    }
    updateVisible();
    for (let i in g.planesOrdered) {
        g.planesOrdered[i].updateFeatures(true);
    }
}

//
// g.planes table begin
//
// Módulo que gestiona la tabla lateral de aviones (definición de columnas, orden, render)
(function (global, jQuery, TAR) {
    let planeMan = TAR.planeMan = TAR.planeMan || {};

    // Comparador simple alfabético (A < B)
    function compareAlpha(xa, ya) {
        if (xa === ya)
            return 0;
        if (xa < ya)
            return -1;
        return 1;
    }

    // Comparador que tiene en cuenta orden ascendente/descendente y una heurística secundaria
    function compareBeta(xa, ya) {
        if (xa === ya)
            return 0;
        if (planeMan.sortAscending && xa < ya)
            return -1;
        if (!planeMan.sortAscending && (xa.replace(/ /g, "").split("").reverse().join("") > ya.replace(/ /g, "").split("").reverse().join("")))
            return -1;
        return 1;
    }

    // Comparador numérico para ordenar valores numéricos
    function compareNumeric(xf, yf) {
        if (Math.abs(xf - yf) < 1e-9)
            return 0;

        return xf - yf;
    }

    // Definición de columnas: texto, cómo ordenar, cómo extraer valor y estilo
    const cols = planeMan.cols = {};

    cols.icao = {
        text: 'Hex ID',
        sort: function () { sortBy('icao', compareAlpha, function (x) { return x.icao; }); },
        value: function (plane) { return plane.icao; },
        td: '<td class="icaoCodeColumn">',
    };
    cols.country = {
        text: 'Flag',
        header: function () { return ""; },
        sort: function () { sortBy('country', compareAlpha, function (x) { return x.country; }); },
        value: function (plane) { return (plane.country_code ? ('<img width="18" height="12" style="display: block;margin: auto;" src="flags/3x2/' + plane.country_code.toUpperCase() + '.svg" title="' + plane.country + '"></img>') : ''); },
        hStyle: 'style="width: 18px; padding: 3px;"',
        html: true,
    };
    cols.flight = {
        sort: function () { sortBy('flight', compareAlpha, function (x) { return x.flight }); },
        value: function (plane) {
            if (flightawareLinks)
                return getFlightAwareModeSLink(plane.icao, plane.flight, plane.name);
            return (plane.flight || '');
        },
        html: flightawareLinks,
        text: 'Callsign'
    };
    if (routeApiUrl) {
        cols.route = {
            sort: function () { sortBy('route', compareAlpha, function (x) { return x.routeColumn }); },
            value: function (plane) {
                if (!useRouteAPI) return '';
                if (plane.routeString) {
                    return '<span title="' + plane.routeVerbose + '">' + plane.routeColumn + '</span>';
                } else {
                    return '';
                }
            },
            html: true,
            text: 'Route'
        };
    }
    cols.registration = {
        sort: function () { sortBy('registration', compareAlpha, function (x) { return x.registration; }); },
        value: function (plane) { return (flightawareLinks ? getFlightAwareIdentLink(plane.registration, plane.registration) : (plane.registration ? plane.registration : "")); },
        html: flightawareLinks,
        text: 'Registration'
    };
    cols.type = {
        sort: function () { sortBy('type', compareAlpha, function (x) { return x.icaoType; }); },
        value: function (plane) { return (plane.icaoType != null ? plane.icaoType : ""); },
        text: 'Type'
    };
    cols.squawk = {
        text: 'Squawk',
        sort: function () { sortBy('squawk', compareAlpha, function (x) { return x.squawk; }); },
        value: function (plane) { return (plane.squawk != null ? plane.squawk : ""); },
        align: 'right'
    };
    cols.altitude = {
        text: 'Altitude',
        sort: function () { sortBy('altitude', compareNumeric, function (x) { return (x.altitude == "ground" ? -100000 : x.altitude); }); },
        value: function (plane) { return format_altitude_brief(adjust_baro_alt(plane.altitude), plane.vert_rate, DisplayUnits); },
        align: 'right',
        header: function () { return 'Alt.' + NBSP + '(' + get_unit_label("altitude", DisplayUnits) + ')'; },
    };
    cols.speed = {
        text: pTracks ? 'Max. Speed' : 'Speed',
        sort: function () { sortBy('speed', compareNumeric, function (x) { return x.speed; }); },
        value: function (plane) { return format_speed_brief(plane.speed, DisplayUnits); },
        align: 'right',
        header: function () { return (pTracks ? 'Max. ' : '') + 'Spd.' + NBSP + '(' + get_unit_label("speed", DisplayUnits) + ')'; },
    };
    cols.vert_rate = {
        text: 'Vertical Rate',
        sort: function () { sortBy('vert_rate', compareNumeric, function (x) { return x.vert_rate; }); },
        value: function (plane) { return format_vert_rate_brief(plane.vert_rate, DisplayUnits); },
        align: 'right',
        header: function () { return 'V. Rate(' + get_unit_label("verticalRate", DisplayUnits) + ')'; },
    };
    cols.sitedist = {
        text: pTracks ? 'Max. Distance' : 'Distance',
        sort: function () { sortBy('sitedist', compareNumeric, function (x) { return x.sitedist; }); },
        value: function (plane) { return format_distance_brief(plane.sitedist, DisplayUnits); },
        align: 'right',
        header: function () { return (pTracks ? 'Max. ' : '') + 'Dist.' + NBSP + '(' + get_unit_label("distance", DisplayUnits) + ')'; },
    };
    cols.track = {
        text: 'Track',
        sort: function () { sortBy('track', compareNumeric, function (x) { return x.track; }); },
        value: function (plane) { return format_track_brief(plane.track); },
        align: 'right'
    };
    cols.msgs = {
        text: 'Messages',
        sort: function () { sortBy('msgs', compareNumeric, function (x) { return x.messages; }); },
        value: function (plane) { return plane.messages; },
        align: 'right'
    };
    cols.seen = {
        text: 'Seen',
        sort: function () { sortBy('seen', compareNumeric, function (x) { return x.seen; }); },
        value: function (plane) { return plane.seen.toFixed(0); },
        align: 'right'
    };
    cols.rssi = {
        text: 'RSSI',
        sort: function () { sortBy('rssi', compareNumeric, function (x) { return x.rssi; }); },
        value: function (plane) { return (plane.rssi != null ? plane.rssi.toFixed(1) : ""); },
        align: 'right'
    };
    cols.lat = {
        text: 'Latitude',
        sort: function () { sortBy('lat', compareNumeric, function (x) { return (x.position !== null ? x.position[1] : null); }); },
        value: function (plane) { return (plane.position != null ? plane.position[1].toFixed(4) : ""); },
        align: 'right'
    };
    cols.lon = {
        text: 'Longitude',
        sort: function () { sortBy('lon', compareNumeric, function (x) { return (x.position !== null ? x.position[0] : null); }); },
        value: function (plane) { return (plane.position != null ? plane.position[0].toFixed(4) : ""); },
        align: 'right'
    };
    cols.data_source = {
        text: 'Source',
        sort: function () { sortBy('data_source', compareNumeric, function (x) { return x.getDataSourceNumber(); }); },
        value: function (plane) { return format_data_source(plane.getDataSource()); },
        align: 'right'
    };
    cols.military = {
        text: 'Mil.',
        sort: function () { sortBy('military', compareAlpha, function (x) { return (x.military ? 'yes' : 'no'); }); },
        value: function (plane) { return (plane.military ? 'yes' : 'no'); },
        align: 'right'
    };
    cols.wd = {
        text: 'Wind D.',
        sort: function () { sortBy('wd', compareNumeric, function (x) { return x.wd; }); },
        value: function (plane) { return plane.wd != null ? (plane.wd + '°') : ''; },
        align: 'right'
    };
    cols.ws = {
        text: 'Wind S.',
        sort: function () { sortBy('ws', compareNumeric, function (x) { return x.ws; }); },
        value: function (plane) { return format_speed_brief(plane.ws, DisplayUnits); },
        align: 'right',
        header: function () { return 'Wind' + NBSP + '(' + get_unit_label("speed", DisplayUnits) + ')'; },
    };

    // Normaliza columnas para uso interno (id, header, td por defecto)
    const colsEntries = Object.entries(cols);
    for (let i in colsEntries) {
        let key = colsEntries[i][0];
        let value = colsEntries[i][1];
        value.id = key;
        value.text = value.text ? value.text : "";
        value.header = value.header ? value.header : function () { return value.text; };
        value.hStyle = value.hStyle ? value.hStyle : "";
        if (!value.td)
            value.td = value.align ? ('<td style="text-align: ' + value.align + '">') : '<td>';
    }
    // Construye la lista de columnas en orden guardado o por defecto
    let columns = createOrderedColumns();
    let activeCols = null;

    let initializing = true;

    let planeRowTemplate = null;
    let htmlTable = null;
    let tbody = null;

    // Inicializa la tabla: obtiene la tabla DOM y prepara visibilidades
    planeMan.init = function () {
        // initialize columns
        htmlTable = document.getElementById('planesTable');
        for (let i in columns) {
            let col = columns[i];
            col.visible = true;
            col.toggleKey = 'column_' + col.id;

            if (HideCols.includes('#' + col.id)) {
                planeMan.setColumnVis(col.id, false);
            }
        }

        createColumnToggles();

        if (!ShowFlags) {
            planeMan.setColumnVis('flag', false);
        }
    }

    // Reconstruye la estructura HTML de la tabla y plantilla de fila, sin rellenar datos
    planeMan.redraw = function () {
        activeCols = [];
        for (let i in columns) {
            let col = columns[i];
            if (col.visible || !mapIsVisible) {
                activeCols.push(col);
            }
        }
        for (let i = 0; i < g.planesOrdered.length; ++i) {
            g.planesOrdered[i].destroyTR();
        }
        let table = '';
        table += '<thead class="aircraft_table_header">';
        table += '  <tr>';
        for (let i in activeCols) {
            let col = activeCols[i];
            table += '<td id="' + col.id + '" onclick="TAR.planeMan.cols.' + col.id + '.sort();"' + col.hStyle + '>' + col.header() + '</td>';
        }
        table += '  </tr>';
        table += '</thead>';
        table += '<tbody>';
        table += '</tbody>';
        htmlTable.innerHTML = table;
        tbody = htmlTable.tBodies[0];

        planeRowTemplate = document.createElement('tr');
        let template = ''
        for (let i in activeCols) {
            let col = activeCols[i];
            template += col.td;
            template += '</td>';
        }
        planeRowTemplate.innerHTML = template;

        if (!initializing) {
            planeMan.refresh();
        }
    }

    // Cambia visibilidad de una columna y redibuja si corresponde
    planeMan.setColumnVis = function (col, visible) {
        cols[col].visible = visible;

        if (!initializing)
            planeMan.redraw();
    }

    // Refreshes the larger table of all the planes
    // Rellena o actualiza las filas de la tabla con los datos actuales de g.planesOrdered
    planeMan.refresh = function () {
        if (!loadFinished) {
            return;
        }
        //console.trace();

        if (initializing) {
            planeMan.redraw();
            initializing = false;
        }

        const atime = false;
        atime && console.time("planeMan.refresh()");

        const ctime = false; // gets enabled for debugging table refresh speed
        // globeTableLimit = 1000; for testing performance

        ctime && console.time("planeMan.refresh()");


        TrackedAircraft = 0;
        TrackedAircraftPositions = 0;
        TrackedHistorySize = 0;

        ctime && console.time("inView");
        let pList = []; // list of planes that might go in the table and need sorting
        for (let i = 0; i < g.planesOrdered.length; ++i) {
            const plane = g.planesOrdered[i];

            TrackedHistorySize += plane.history_size;

            if (tableInView) {
                if (plane.visible)
                    TrackedAircraft++;
                if ((plane.inView && plane.visible) || plane.selected) {
                    pList.push(plane);
                    TrackedAircraftPositions++;
                }
            } else {
                if (plane.visible) {
                    TrackedAircraft++;
                    pList.push(plane);
                    if (plane.position != null)
                        TrackedAircraftPositions++;
                }
            }
        }

        ctime && console.timeEnd("inView");

        ctime && console.time("resortTable");
        resortTable(pList);
        ctime && console.timeEnd("resortTable");

        const sidebarVisible = toggles['sidebar_visible'].state;

        let inTable = []; // list of planes that will actually be displayed in the table

        ctime && console.time("modTRs");
        for (let i in pList) {
            const plane = pList[i];

            if (!sidebarVisible || (inTable.length > globeTableLimit && mapIsVisible && globeIndex)) {
                break;
            }
            inTable.push(plane);

            if (plane.tr == null) {
                plane.makeTR(planeRowTemplate.cloneNode(true));
                plane.tr.id = plane.icao;
                plane.refreshTR = 0;
            }

            if (now - plane.refreshTR > 5 || plane.selected != plane.selectCache) {
                plane.refreshTR = now;
                let colors = tableColors.unselected;
                let bgColor = "#F8F8F8"

                plane.selectCache = plane.selected;
                if (plane.selected)
                    colors = tableColors.selected;

                if (plane.dataSource && plane.dataSource in colors)
                    bgColor = colors[plane.dataSource];

                if (plane.squawk in tableColors.special) {
                    bgColor = tableColors.special[plane.squawk];
                    plane.bgColorCache = bgColor;
                    plane.tr.style = "background-color: " + bgColor + "; color: black;";
                } else if (plane.bgColorCache != bgColor) {
                    plane.bgColorCache = bgColor;
                    plane.tr.style = "background-color: " + bgColor + ";";
                }

                for (let cell in activeCols) {
                    let col = activeCols[cell];
                    if (!col.value)
                        continue;
                    let newValue = col.value(plane);
                    if (newValue != plane.trCache[cell]) {
                        plane.trCache[cell] = newValue;
                        if (col.html) {
                            plane.tr.cells[cell].innerHTML = newValue;
                        } else {
                            plane.tr.cells[cell].textContent = newValue;
                        }
                    }
                }
            }
        }
        ctime && console.timeEnd("modTRs");

        global.refreshPageTitle();
        jQuery('#dump1090_total_history').updateText(TrackedHistorySize);
        jQuery('#dump1090_message_rate').updateText(MessageRate === null ? 'n/a' : MessageRate.toFixed(1));
        jQuery('#dump1090_total_ac').updateText(globeIndex ? globeTrackedAircraft : TrackedAircraft);
        jQuery('#dump1090_total_ac_positions').updateText(TrackedAircraftPositions);



        ctime && console.time("DOM1");

        let newBody = document.createElement('tbody');
        for (let i in inTable) {
            const plane = inTable[i];
            newBody.appendChild(plane.tr);
        }

        ctime && console.timeEnd("DOM1");
        ctime && console.time("DOM2");

        htmlTable.replaceChild(newBody, tbody);
        tbody.remove();
        tbody = newBody;

        ctime && console.timeEnd("DOM2");

        ctime && console.timeEnd("planeMan.refresh()");
        atime && console.timeEnd("planeMan.refresh()");
    }

    //
    // ---- table sorting begin ----
    //

    // Estado actual de ordenado: columna, comparador, extractor y dirección
    planeMan.sortId = '';
    planeMan.sortCompare = null;
    planeMan.sortExtract = null;
    planeMan.sortAscending = true;

    // Función de comparación estable usada tras extraer valores de fila
    function sortFunction(x, y) {
        const xv = x._sort_value;
        const yv = y._sort_value;

        // always sort missing values at the end, regardless of
        // ascending/descending sort
        if (xv == null && yv == null) return x._sort_pos - y._sort_pos;
        if (xv == null) return 1;
        if (yv == null) return -1;

        const c = planeMan.sortAscending ? planeMan.sortCompare(xv, yv) : planeMan.sortCompare(yv, xv);
        if (c !== 0) return c;

        return x._sort_pos - y._sort_pos;
    }

    // Prepara la lista pList antes de aplicar sort(), aplicando ordenaciones preliminares
    function resortTable(pList) {
        if (!planeMan.sortExtract)
            return;
        if (globeIndex) {
            // don't presort for globeIndex
        }
        // presort by dataSource
        else if (planeMan.sortId == "sitedist") {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = i;
            }
            pList.sort(function (x, y) {
                const a = x.getDataSourceNumber();
                const b = y.getDataSourceNumber();
                if (a == b)
                    return (x._sort_pos - y._sort_pos);

                return (a - b);
            });
        }
        // or distance
        else if (planeMan.sortId == "data_source") {
            pList.sort(function (x, y) {
                return (x.sitedist - y.sitedist);
            });
        }
        // or longitude
        else {
            pList.sort(function (x, y) {
                return (x.position ? x.position[0] : 500) - (y.position ? y.position[0] : 500);
            });
        }

        // number the existing rows so we can do a stable sort
        // regardless of whether sort() is stable or not.
        // Also extract the sort comparison value.
        if (globeIndex) {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = pList[i].numHex;
                pList[i]._sort_value = planeMan.sortExtract(pList[i]);
            }
        } else {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = i;
                pList[i]._sort_value = planeMan.sortExtract(pList[i]);
            }
        }

        pList.sort(sortFunction);

        // In multiSelect put selected planes on top, do a stable sort!
        if (multiSelect) {
            for (let i = 0; i < pList.length; ++i) {
                pList[i]._sort_pos = i;
            }
            pList.sort(function (x, y) {
                if (x.selected && y.selected) {
                    return (x._sort_pos - y._sort_pos);
                }
                if (x.selected)
                    return -1;
                if (y.selected)
                    return 1;

                return (x._sort_pos - y._sort_pos);
            });
        }
    }

    // Cambia la columna de orden actual, guarda la preferencia y refresca tabla
    function sortBy(id, sc, se) {
        loStore['sortCol'] = id;

        if (id === planeMan.sortId) {
            planeMan.sortAscending = !planeMan.sortAscending;
            g.planesOrdered.reverse(); // this correctly flips the order of rows that compare equal
        }

        loStore['sortAscending'] = planeMan.sortAscending ? 'true' : '';

        planeMan.sortId = id;
        planeMan.sortCompare = sc;
        planeMan.sortExtract = se;

        planeMan.refresh();
    }

    //
    // ---- table sorting end ----
    //

    // Crea toggles en la UI para mostrar/ocultar columnas y permite reordenarlas por drag'n'drop
    function createColumnToggles() {
        const prefix = 'dd_';
        const sortableColumns = jQuery('#sortableColumns').sortable({
            update: function (event, ui) {
                const order = [];
                jQuery('#sortableColumns li').each(function (e) {
                    order.push(jQuery(this).attr('id').replace(prefix, ''));
                });

                loStore['columnOrder'] = JSON.stringify(order);
                columns = createOrderedColumns();

                planeMan.redraw();
            }
        });

        for (let col of columns) {
            sortableColumns.append(`<li class="ui-state-default" id="${prefix + col.id}"></li>`);

            new Toggle({
                key: col.toggleKey,
                display: col.text,
                container: jQuery(`#${prefix + col.id}`),
                init: col.visible,
                setState: function (state) {
                    planeMan.setColumnVis(col.id, state);
                }
            });
        }
    }

    // Devuelve columnas en el orden guardado por el usuario o el orden por defecto
    function createOrderedColumns() {
        const order = loStore['columnOrder'];
        if (order !== undefined) {
            const columns = [];
            for (let col of JSON.parse(order)) {
                const column = cols[col];
                if (column !== undefined) {
                    columns.push(column);
                }
            }
            if (columns.length > 0) {
                return columns;
            }
        }
        return Object.values(cols);
    }

    return TAR;
}(window, jQuery, TAR || {}));
//
// g.planes table end
//
// Último avión que fue deseleccionado (para posible reuso)
let lastSelected = null;
// Quita un avión de la selección y actualiza la interfaz
function deselect(plane) {
    if (!plane || !plane.selected)
        return;
    plane.selected = false;
    const index = SelPlanes.indexOf(plane);
    if (index > -1) {
        SelPlanes.splice(index, 1);
    }
    lastSelected = plane;
    if (plane == SelectedPlane) {
        if (SelPlanes.length > 0) {
            sp = SelectedPlane = SelPlanes[0];
        } else {
            sp = SelectedPlane = null;
        }
        refreshSelected();
    }

    plane.updateTick('redraw');
    updateAddressBar();
}
let scount = 0;
// Marca un avión como seleccionado, lo muestra en el panel y opcionalmente activa seguimiento
function select(plane, options) {
    if (!plane)
        return;
    options = options || {};
    //console.log("select()", plane.icao, options);
    plane.selected = true;
    if (!SelPlanes.includes(plane))
        SelPlanes.push(plane);

    sp = SelectedPlane = plane;
    updateAddressBar();
    refreshSelected();
    plane.updateTick('redraw');

    if (options.follow) {
        toggleFollow(true);
        if (!options.zoom)
            options.zoom = 'follow';
    } else {
        toggleFollow(false);
    }
}
// Selecciona un avión por su identificador hex (usa trazas si es necesario)
function selectPlaneByHex(hex, options) {
    active();
    options = options || {};
    console.log(`SELECTING ${hex} follow: ${options.follow}`);
    //console.log("select: " + hex);
    // If SelectedPlane has something in it, clear out the selected
    if (SelectedAllPlanes) {
        deselectAllPlanes();
    }
    // already selected plane
    let oldPlane = SelectedPlane;
    // plane to be selected
    let newPlane = g.planes[hex];

    const multiDeselect = multiSelect && newPlane && newPlane.selected && !onlySelected;

    if (!options.noFetch && (globeIndex || showTrace || haveTraces) && hex) {
        newPlane = getTrace(newPlane, hex, options);
    }

    // If we are clicking the same plane, we are deselecting it unless noDeselect is specified
    if (oldPlane == newPlane && (options.noDeselect || showTrace)) {
        oldPlane = null;
    } else {
        if (multiSelect) {
            // multiSelect deselect
            if (multiDeselect) {
                deselect(newPlane);
                newPlane = null;
                hex = null;
            }
        } else if (oldPlane) {
            // normal deselect
            if (oldPlane != newPlane) {
                deselect(oldPlane);
                oldPlane = null;
            }
            if (oldPlane == newPlane) {
                console.log('oldplane == newplane');
                deselect(newPlane);
                oldPlane = null;
                newPlane = null;
                hex = null;
            }
        }
    }

    // Assign the new selected
    select(newPlane, options);

    if (!newPlane) {
        toggleFollow(false);
    }

    if (options.zoom == 'follow') {
        //if (OLMap.getView().getZoom() < 8)
        //    OLMap.getView().setZoom(8);
    } else if (options.zoom) {
        OLMap.getView().setZoom(options.zoom);
    }

    pTracks || TAR.planeMan.refresh();

    return newPlane !== undefined;
}

// loop through the planes and mark them as selected to show the paths for all planes
// Selecciona todos los aviones (muestra sus trazas) o los desactiva si ya está activo
function selectAllPlanes() {
    HighlightedPlane = null;
    // if all planes are already selected, deselect them all
    if (SelectedAllPlanes) {
        deselectAllPlanes();
        return;
    }
    buttonActive('#T', true);
    // If SelectedPlane has something in it, clear out the selected
    if (SelectedPlane)
        deselect(SelectedPlane);

    toggleIsolation("off");

    SelectedAllPlanes = true;

    // disable this for the moment
    if (0 && globeIndex) {
        for (let i in g.planesOrdered) {
            let plane = g.planesOrdered[i];
            if (plane.visible && plane.inView) {
                plane.processTrace();
            }
        }
    }
    refreshFeatures();

    refreshSelected();
    refreshHighlighted();
    pTracks || TAR.planeMan.refresh();
}

// deselect all the planes
// Deselecciona todos los aviones; puede mantener el principal si se pide
function deselectAllPlanes(keepMain) {
    if (showTrace && !keepMain)
        return;
    if (!multiSelect && SelectedPlane)
        toggleIsolation("off");

    clearTimeout(getTraceTimeout);

    if (SelectedAllPlanes) {
        buttonActive('#T', false);
        jQuery('#selectall_checkbox').removeClass('settingsCheckboxChecked');
        SelectedAllPlanes = false;
        refreshFilter();
        return;
    }

    let bounce = [];
    for (let i in SelPlanes) {
        const plane = SelPlanes[i];
        if (keepMain && plane == SelectedPlane)
            continue;
        bounce.push(plane);
    }
    for (let i in bounce) {
        deselect(bounce[i]);
    }
    refreshFilter();
    updateAddressBar();
}
// Activa o desactiva el seguimiento del avión seleccionado (centra la vista)
function toggleFollow(override) {
    if (override == true)
        FollowSelected = true;
    else if (override == false)
        FollowSelected = false;
    else
        FollowSelected = !FollowSelected;

    traceOpts.follow = FollowSelected;

    if (FollowSelected) {
        if (!SelectedPlane || !SelectedPlane.position)
            FollowSelected = false;
    }
    if (FollowSelected) {
        //if (override == undefined && OLMap.getView().getZoom() < 8)
        //    OLMap.getView().setZoom(8);
        SelectedPlane.setProjection('follow');
    }
    buttonActive('#F', FollowSelected);
}
// Centra y restablece el mapa al sitio por defecto o al receptor
function resetMap() {
    geoFindMe().always(function () {
        if (SitePosition) {
            CenterLon = SiteLon;
            CenterLat = SiteLat;
        } else {
            CenterLon = DefaultCenterLon;
            CenterLat = DefaultCenterLat;
        }
        // Reset loStore values and map settings
        lopaStore['CenterLat'] = CenterLat
        lopaStore['CenterLon'] = CenterLon
        //lopaStore['zoomLvl']   = g.zoomLvl = DefaultZoomLvl;

        // Set and refresh
        //OLMap.getView().setZoom(g.zoomLvl);

        //console.log('resetMap setting center ' + [CenterLat, CenterLon]);
        OLMap.getView().setCenter(ol.proj.fromLonLat([CenterLon, CenterLat]));
        OLMap.getView().setRotation(g.mapOrientation);

        //selectPlaneByHex(null,false);
        jQuery("#update_error").css('display', 'none');
    });
}
// Avisa al mapa que su tamaño cambió (ej. al mostrar/ocultar sidebar)
function updateMapSize() {
    if (OLMap)
        OLMap.updateSize();

    updatePanoramaOverlayBounds();
}
// Oculta el mapa y expande la barra lateral (modo solo lista)
function expandSidebar(e) {
    e.preventDefault();
    jQuery("#map_container").hide()
    mapIsVisible = false;
    jQuery("#toggle_sidebar_control").hide();
    jQuery("#splitter").hide();
    jQuery("#shrink_sidebar_button").show();
    jQuery("#sidebar_container").width("100%");
    TAR.planeMan.redraw();
    updateMapSize();
    adjustInfoBlock();
}
// Muestra el mapa y restaura la barra lateral a su anchura guardada
function showMap() {
    jQuery('#sidebar_container').width(loStore['sidebar_width']).css('margin-left', '0');
    jQuery("#map_container").show()
    mapIsVisible = true;
    jQuery("#toggle_sidebar_control").show();
    jQuery("#splitter").show();
    jQuery("#shrink_sidebar_button").hide();
    TAR.planeMan.redraw();
    updateMapSize();
}

let selectedPhotoCache = null;
// Pone la foto (HTML) del avión seleccionado en el contenedor, evitando recargas iguales
function setPhotoHtml(source) {
    if (selectedPhotoCache == source)
        return;
    //console.log(source + ' ' + selectedPhotoCache);
    selectedPhotoCache = source;
    jQuery('#selected_photo').html(source);
}
// Ajusta tamaño y disposición del bloque de información lateral según espacio y opciones
function adjustInfoBlock() {
    if (wideInfoBlock) {
        infoBlockWidth = baseInfoBlockWidth + 40;
    } else {
        infoBlockWidth = baseInfoBlockWidth;
    }
    jQuery('#selected_infoblock').css("width", infoBlockWidth * globalScale + 'px');

    jQuery('.ol-scale-line').css('left', (infoBlockWidth * globalScale + 8) + 'px');
    jQuery('#replayBar').css('left', (infoBlockWidth * globalScale + 8) + 'px');

    if (SelectedPlane && toggles['enableInfoblock'].state) {

        if (!mapIsVisible)
            jQuery("#sidebar_container").css('margin-left', '140pt');
        //jQuery('#sidebar_canvas').css('margin-bottom', jQuery('#selected_infoblock').height() + 'px');
        //
        if (mapIsVisible && document.getElementById('map_canvas').clientWidth < parseFloat(jQuery('#selected_infoblock').css('width')) * 3) {
            jQuery('#selected_infoblock').css('height', '290px');
            jQuery('#selected_typedesc').parent().parent().hide();
            jQuery('#credits').css('bottom', '295px');
            jQuery('#credits').css('left', '5px');
        } else {
            jQuery('#selected_infoblock').css('height', '100%');
            jQuery('#credits').css('bottom', '');
            jQuery('#credits').css('left', '');
        }

        jQuery('#selected_infoblock').show();
    } else {
        if (!mapIsVisible)
            jQuery("#sidebar_container").css('margin-left', '0');
        //jQuery('#sidebar_canvas').css('margin-bottom', 0);

        jQuery('.ol-scale-line').css('left', '8px');
        jQuery('#replayBar').css('left', '0px');
        jQuery('#credits').css('bottom', '');
        jQuery('#credits').css('left', '');

        jQuery('#selected_infoblock').hide();
    }

    let photoWidth = document.getElementById('photo_container').clientWidth;
    let refWidth = infoBlockWidth * globalScale - 29;
    if (Math.abs(photoWidth / refWidth - 1) > 0.05)
        photoWidth = refWidth;

    jQuery('#airplanePhoto').css("width", photoWidth + 'px');
    jQuery('#selected_photo').css("width", photoWidth + 'px');

    if (showPictures) {
        if (planespottersAPI || planespottingAPI) {
            jQuery('#photo_container').css('height', photoWidth * 0.883 + 'px');
        } else {
            jQuery('#photo_container').css('height', '40px');
        }
    }

    updatePanoramaOverlayBounds();
}
// Inicializa el selector de unidades (métrico/imperial) y sus etiquetas
function initializeUnitsSelector() {
    // Get display unit preferences from local storage otherwise use value previously set defaults_86d9793e4a0945a79fb7bffb2437e312.js or config.js
    if (loStore.getItem('displayUnits')) {
        DisplayUnits = loStore['displayUnits'];
    }

    // Initialize drop-down
    jQuery('#units_selector')
        .val(DisplayUnits)
        .on('change', onDisplayUnitsChanged);

    jQuery(".altitudeUnit").text(get_unit_label("altitude", DisplayUnits));
    jQuery(".speedUnit").text(get_unit_label("speed", DisplayUnits));
    jQuery(".distanceUnit").text(get_unit_label("distance", DisplayUnits));
    jQuery(".verticalRateUnit").text(get_unit_label("verticalRate", DisplayUnits));
}

// Cambia la unidad mostrada y actualiza todo lo que depende de ello
function onDisplayUnitsChanged(e) {
    loStore['displayUnits'] = DisplayUnits = e.target.value;

    TAR.altitudeChart.render();

    // Update filters
    updateAltFilter();

    // Refresh data
    refreshFilter();

    // Draw range rings
    drawSiteCircle();

    // Reset map scale line units
    OLMap.getControls().forEach(function (control) {
        if (control instanceof ol.control.ScaleLine) {
            control.setUnits(DisplayUnits);
        }
    });

    jQuery(".altitudeUnit").text(get_unit_label("altitude", DisplayUnits));
    jQuery(".speedUnit").text(get_unit_label("speed", DisplayUnits));
    jQuery(".distanceUnit").text(get_unit_label("distance", DisplayUnits));
    jQuery(".verticalRateUnit").text(get_unit_label("verticalRate", DisplayUnits));
    TAR.planeMan.redraw();

    remakeTrails();
    refreshSelected();
}
// Aplica el filtro de altitud desde el formulario y refresca la vista
function onFilterByAltitude(e) {
    e.preventDefault();
    jQuery("#altitude_filter_min").blur();
    jQuery("#altitude_filter_max").blur();

    updateAltFilter();
    refreshFilter();
}
// Alterna el filtro para vehículos en tierra y lo guarda
function filterGroundVehicles(switchFilter) {
    if (typeof loStore['groundVehicleFilter'] === 'undefined') {
        loStore['groundVehicleFilter'] = 'not_filtered';
    }
    let groundFilter = loStore['groundVehicleFilter'];
    if (switchFilter === true) {
        groundFilter = (groundFilter === 'not_filtered') ? 'filtered' : 'not_filtered';
    }
    if (groundFilter === 'not_filtered') {
        jQuery('#groundvehicle_filter').addClass('settingsCheckboxChecked');
    } else {
        jQuery('#groundvehicle_filter').removeClass('settingsCheckboxChecked');
    }
    loStore['groundVehicleFilter'] = groundFilter;
    PlaneFilter.groundVehicles = groundFilter;
}
// Alterna el filtro para MLAT bloqueado y lo guarda
function filterBlockedMLAT(switchFilter) {
    if (typeof loStore['blockedMLATFilter'] === 'undefined') {
        loStore['blockedMLATFilter'] = 'not_filtered';
    }
    let blockedMLATFilter = loStore['blockedMLATFilter'];
    if (switchFilter === true) {
        blockedMLATFilter = (blockedMLATFilter === 'not_filtered') ? 'filtered' : 'not_filtered';
    }
    if (blockedMLATFilter === 'not_filtered') {
        jQuery('#blockedmlat_filter').addClass('settingsCheckboxChecked');
    } else {
        jQuery('#blockedmlat_filter').removeClass('settingsCheckboxChecked');
    }
    loStore['blockedMLATFilter'] = blockedMLATFilter;
    PlaneFilter.blockedMLAT = blockedMLATFilter;
}
// Marca visualmente un botón como activo/inactivo
function buttonActive(id, state) {
    if (state) {
        jQuery(id).addClass('activeButton');
        jQuery(id).removeClass('inActiveButton');
    } else {
        jQuery(id).addClass('inActiveButton');
        jQuery(id).removeClass('activeButton');
    }
}
// Activa/desactiva "solo seleccionados" y fuerza recarga de datos si hace falta
function toggleIsolation(state, noRefresh) {
    let prevState = onlySelected;
    if (showTrace && state !== "on")
        return;
    onlySelected = !onlySelected;
    if (state === "on")
        onlySelected = true;
    if (state === "off")
        onlySelected = false;

    buttonActive('#I', onlySelected);

    if (prevState != onlySelected && noRefresh != "noRefresh")
        refreshFilter();

    fetchData({ force: true });
}
// Muestra solo militares o no, y fuerza actualización
function toggleMilitary() {
    onlyMilitary = !onlyMilitary;
    buttonActive('#U', onlyMilitary);

    refreshFilter();
    active();
    fetchData({ force: true });
}

function togglePersistence() {
    noVanish = !noVanish;
    //filterTracks = noVanish;

    buttonActive('#P', noVanish);

    remakeTrails();

    if (!noVanish)
        reaper();
    loStore['noVanish'] = noVanish;
    console.log('noVanish = ' + noVanish);

    refreshFilter();
}
// Evita que aviones "desaparezcan" y reconstruye trazas
function toggleDistance() {
    // Si está apagado, activarlo en el primer modo
    if (!distanceBetweenPlanesMode) {
        distanceBetweenPlanesMode = true;
        planeDistanceModeType = PP_MODES[0];
        selectedPlanesForDistance = [];
        selectedPlaneA = null;
        // Asegurar limpieza de restos
        resetDistanceCalculation();
        showDistanceGuide(`<center>Modo ${planeDistanceModeType}</center><br>Haga clic en dos aviones para medir la distancia.`);
        buttonActive('#D', true);
        return;
    }

    // Si está activo, ciclar al siguiente modo disponible
    const idx = PP_MODES.indexOf(planeDistanceModeType);
    if (idx >= 0 && idx < PP_MODES.length - 1) {
        planeDistanceModeType = PP_MODES[idx + 1];
        // Limpiar selecciones previas
        resetDistanceCalculation();
        selectedPlaneA = null;
        selectedPlanesForDistance = [];
        // Mostrar guía según modo
        if (planeDistanceModeType === 'pairs') {
            showDistanceGuide('<center>Modo Pares</center><br>Haga clic en dos aviones consecutivos para crear pares independientes (A-B, C-D), o haga clic dos veces en un avión para anclarlo y luego seleccione varios puntos B.');
        } else {
            showDistanceGuide(`<center>Modo ${planeDistanceModeType}</center>`);
        }
        buttonActive('#D', true);
    } else {
        // Si es el último modo, apagar la herramienta
        DistanceBetweenPlanes();
        hideDistanceGuide();
    }
}
// Aplica atenuado/contraste al lienzo del mapa según ajustes
function dim(evt) {
    try {
        let currentDimPercentage = mapDimPercentage * layerDimFactor;
        let currentContrastPercentage = mapContrastPercentage + layerExtraContrast;

        if (!toggles['MapDim'].state) {
            // slight dim even if disabled
            currentDimPercentage /= 4;
            currentContrastPercentage /= 4;
        }

        const dim = currentDimPercentage * (1 + 0.25 * toggles['darkerColors'].state);
        const contrast = currentContrastPercentage * (1 + 0.1 * toggles['darkerColors'].state);
        if (dim > 0.0001) {
            evt.context.globalCompositeOperation = 'multiply';
            evt.context.fillStyle = 'rgba(0,0,0,' + dim + ')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        } else if (dim < -0.0001) {
            evt.context.globalCompositeOperation = 'screen';
            console.log(evt.context.globalCompositeOperation);
            evt.context.fillStyle = 'rgba(255, 255, 255,' + (-dim) + ')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        }
        if (contrast > 0.0001) {
            evt.context.globalCompositeOperation = 'overlay';
            evt.context.fillStyle = 'rgba(0,0,0,' + contrast + ')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        } else if (contrast < -0.0001) {
            evt.context.globalCompositeOperation = 'overlay';
            evt.context.fillStyle = 'rgba(255, 255, 255,' + (-contrast) + ')';
            evt.context.fillRect(0, 0, evt.context.canvas.width, evt.context.canvas.height);
        }
        evt.context.globalCompositeOperation = 'source-over';
    } catch (error) {
        console.error(error);
    }
}
// Invierte colores del mapa (efecto visual)
function invertMap(evt) {
    const ctx = evt.context;
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = "white";
    ctx.globalAlpha = alpha;  // alpha 0 = no effect 1 = full effect
    ctx.fillRect(0, 0, evt.ctx.canvas.width, ctx.canvas.height);


}
//
// Altitude Chart begin
// Crea gradientes de color que representan alturas para la leyenda
(function (global, jQuery, TAR) {
    let altitudeChart = TAR.altitudeChart = TAR.altitudeChart || {};

    function createLegendGradientStops() {
        const mapOffsetToAltitude = [[0.033, 500], [0.066, 1000], [0.126, 2000], [0.19, 4000], [0.253, 6000], [0.316, 8000], [0.38, 10000], [0.59, 20000], [0.79, 30000], [1, 40000]];

        let stops = '';
        for (let i in mapOffsetToAltitude) {
            let map = mapOffsetToAltitude[i];
            const color = altitudeColor(map[1]);
            stops += '<stop offset="' + map[0] + '" stop-color="hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)" />';
        }
        return stops;
    }
    // Convierte el SVG de la leyenda en una URL para background-image
    function createLegendUrl(data) {
        jQuery(data).find('#linear-gradient').html(createLegendGradientStops());

        const svg = jQuery('svg', data).prop('outerHTML');

        return 'url("data:image/svg+xml;base64,' + global.btoa(svg) + '")';
    }
    // Carga el SVG base de la leyenda y lo pinta según unidades
    function loadLegend() {
        let baseLegend = (DisplayUnits === 'metric') ? 'images/alt_legend_m.svg' : 'images/alt_legend_ft.svg';

        jQuery.get(baseLegend, function (data) {
            jQuery('#altitude_chart_button').css("background-image", createLegendUrl(data));
            jQuery('#altitude_chart').show();
        });
    }
    // Muestra/oculta la leyenda según toggle
    altitudeChart.render = function () {
        if (toggles['altitudeChart'].state) {
            runAfterLoad(loadLegend);
        } else {
            jQuery('#altitude_chart').hide();
        }
    }
    // Inicializa el toggle y estado por defecto del gráfico de altitud
    altitudeChart.init = function () {
        let chartOn = (onMobile ? false : altitudeChartDefaultState);
        if (usp.has('altitudeChart')) {
            chartOn = Boolean(parseInt(usp.get('altitudeChart')));
        }
        new Toggle({
            key: "altitudeChart",
            display: "Altitude Chart",
            container: "#settingsRight",
            init: chartOn,
            setState: altitudeChart.render
        });
    }

    return TAR;
}(window, jQuery, TAR || {}));
//
// Altitude Chart end
//
// Selecciona un avión aleatorio válido y lo sigue
function followRandomPlane() {
    if (showTrace)
        return;
    let this_one = null;
    let tired = 0;
    do {
        this_one = g.planesOrdered[Math.floor(Math.random() * g.planesOrdered.length)];
        if (!this_one || tired++ > 1000)
            break;
    } while ((this_one.isFiltered() && !onlySelected) || !this_one.position || (now - this_one.position_time > 30));
    //console.log(this_one.icao);
    if (this_one)
        selectPlaneByHex(this_one.icao, { follow: true });
}
// Alterna la forma en que la tabla lista aviones (solo los visibles o todos)
function toggleTableInView(arg) {
    if (arg == 'enable') {
        tableInView = true;
    } else if (arg == 'disable') {
        tableInView = false;
    } else if (!globeIndex) {
        tableInView = !tableInView;
    }

    TAR.planeMan.refresh();

    if (!globeIndex) {
        loStore['tableInView'] = tableInView;
    }

    jQuery('#with_positions').text(tableInView ? "On Screen:" : "With Position:");

    buttonActive('#V', tableInView);
}
// Enciende/apaga etiquetas en el mapa y actualiza marcadores
function toggleLabels() {
    g.enableLabels = !g.enableLabels;
    loStore['enableLabels'] = g.enableLabels;
    for (let key in g.planesOrdered) {
        g.planesOrdered[key].updateMarker();
    }
    refreshFeatures();
    buttonActive('#L', g.enableLabels);

    if (showTrace)
        remakeTrails();
}
// Cicla modos de etiquetas extendidas (varios niveles)
function toggleExtendedLabels(options) {
    if (isNaN(g.extendedLabels))
        g.extendedLabels = 0;

    options = options || {};
    if (!options.noIncrement) {
        g.extendedLabels++;
    }
    g.extendedLabels %= 4;
    //console.log(extendedLabels);
    loStore['extendedLabels'] = g.extendedLabels;
    for (let key in g.planesOrdered) {
        g.planesOrdered[key].updateMarker();
    }
    buttonActive('#O', g.extendedLabels);
}
// Activa/desactiva etiquetas en las trazas (texto sobre líneas)
function toggleTrackLabels() {
    trackLabels = !trackLabels;
    loStore['trackLabels'] = trackLabels;

    remakeTrails();

    buttonActive('#K', trackLabels);
}
// Enciende/apaga selección múltiple de aviones
function toggleMultiSelect(newState) {
    let prevState = multiSelect;
    multiSelect = !multiSelect;

    if (newState == "on")
        multiSelect = true;
    if (newState == "off")
        multiSelect = false;

    if (!multiSelect) {
        if (!SelectedPlane)
            toggleIsolation("off");
        if (prevState != multiSelect)
            deselectAllPlanes("keepMain");
    }

    buttonActive('#M', multiSelect);
}

/*
function onJump(e) {
    toggleFollow(false);
    if (e) {
        e.preventDefault();
        onJumpInput = jQuery("#jump_input").val();
        jQuery("#jump_input").val("");
        jQuery("#jump_input").blur();
    }
    let coords = null;
    let airport = null;
    if (onJumpInput.indexOf(",") >= 0) {
        let values = onJumpInput.split(',');
        if (!values || values.length != 2) {
            showSearchWarning('Input format decimal coordinates: LATI.TUDE, LONGI.TUDE');
        }
        coords = [parseFloat(values[0]), parseFloat(values[1])];
    } else {
        airport = onJumpInput.trim().toUpperCase();
    }
    if (airport) {
        if (!g.airport_cache) {
            jQuery.getJSON(databaseFolder + "/airport-coords.js")
                .done(function (data) {
                    g.airport_cache = data;
                    onJump();
                });
            return;
        }
        coords = g.airport_cache[airport];
    }
    if (coords) {
        console.log("jumping to: " + coords[0] + " " + coords[1]);
        OLMap.getView().setCenter(ol.proj.fromLonLat([coords[1], coords[0]]));
 
        if (g.zoomLvl >= 7) {
            fetchData({ force: true });
        }
 
        refreshFilter();
        hideSearchWarning();
    } else {
        showSearchWarning('Failed to find airport ' + airport);
    }
}
 
function onSearch(e) {
    e.preventDefault();
    const searchTerm = jQuery("#search_input").val().trim();
    jQuery("#search_input").val("");
    jQuery("#search_input").blur();
    let results = [];
    if (searchTerm)
        results = findPlanes(searchTerm, "byIcao", "byCallsign", "byReg", "byType", true);
    if (results.length > 0 && haveTraces) {
        toggleIsolation("on");
        if (results.length < 100) {
            getTrace(null, null, {list: results});
        }
    }
    return false;
}
*/
// Oculta el aviso de búsqueda si está visible
function hideSearchWarning() {
    const searchWarning = jQuery('#search_warning');
    if (searchWarning.css('display') !== 'none') {
        searchWarning.hide('slow');
    }
}
// Muestra un aviso de búsqueda simple y lo oculta luego automáticamente
function showSearchWarning(message) {
    const searchWarning = jQuery('#search_warning');
    searchWarning.text(message)
    if (searchWarning.css('display') === 'none') {
        searchWarning.show();
    }

    //auto hide after 15 seconds
    setTimeout(() => hideSearchWarning(), 15000);
}



// 1. La función principal (Definida fuera para que sea global)
function unifiedSearch(e) {
    if (e) e.preventDefault();

    const inputField = jQuery("#search_input");
    const query = inputField.val().trim();

    if (!query) return;

    // Limpiar UI
    inputField.val("").blur();
    toggleFollow(false);

    // --- 1. INTENTAR COORDENADAS ---
    if (query.indexOf(",") >= 0) {
        const values = query.split(',');
        const lat = parseFloat(values[0]);
        const lon = parseFloat(values[1]);
        if (!isNaN(lat) && !isNaN(lon)) {
            executeJump([lat, lon]);
            return;
        }
    }

    // --- 2. INTENTAR AVIONES ---
    const planeResults = findPlanes(query, "byIcao", "byCallsign", "byReg", "byType", false);

    // --- 3. SI NO HUBO AVIONES, INTENTAR AEROPUERTO ---
    if (!planeResults || planeResults.length === 0) {
        searchAirport(query.toUpperCase());
    }
}

// 2. Función puente para compatibilidad con URL (?airport=...)
function onJump() {
    if (typeof onJumpInput !== 'undefined' && onJumpInput) {
        searchAirport(onJumpInput.trim().toUpperCase());
    }
}

// 3. Inicialización de los eventos
jQuery(document).ready(function () {
    // Ahora 'unifiedSearch' sí existe en el scope global
    jQuery("#search_form").on("submit", unifiedSearch);

    // Limpieza de antiguos botones si existen
    jQuery("#search_clear_button").click(function () {
        jQuery("#search_input").val("");
    });
});

// 4. Funciones de apoyo (executeJump y searchAirport se quedan como las tienes)
function executeJump(coords) {
    OLMap.getView().setCenter(ol.proj.fromLonLat([coords[1], coords[0]]));
    if (g.zoomLvl >= 7) fetchData({ force: true });
    refreshFilter();
    hideSearchWarning();
}

function searchAirport(airport) {
    if (!g.airport_cache) {
        jQuery.getJSON(databaseFolder + "/airport-coords.js").done(function (data) {
            g.airport_cache = data;
            searchAirport(airport);
        });
        return;
    }
    const coords = g.airport_cache[airport];
    if (coords) executeJump(coords);
    else showSearchWarning('No se encontró: ' + airport);
}
// Deselecciona todo y resetea modos relacionados con búsqueda
function onSearchClear(e) {
    deselectAllPlanes();
    toggleIsolation("off");
    toggleMultiSelect("off");
    jQuery("#search_input").val("");
    jQuery("#search_input").blur();
}
// Resetea filtros de altitud en la UI y aplica cambios
function onResetAltitudeFilter(e) {
    jQuery("#altitude_filter_min").val("");
    jQuery("#altitude_filter_max").val("");
    jQuery("#altitude_filter_min").blur();
    jQuery("#altitude_filter_max").blur();

    updateAltFilter();
    refreshFilter();
}
// Lee y normaliza valores del filtro de altitud; convierte si hace falta a pies
function updateAltFilter() {
    let minAltitude = parseFloat(jQuery("#altitude_filter_min").val().trim());
    let maxAltitude = parseFloat(jQuery("#altitude_filter_max").val().trim());
    let enabled = false;

    if (minAltitude < -1e6 || minAltitude > 1e6 || isNaN(minAltitude))
        minAltitude = -1e6;
    else
        enabled = true;
    if (maxAltitude < -1e6 || maxAltitude > 1e6 || isNaN(maxAltitude))
        maxAltitude = 1e6;
    else
        enabled = true;

    if (!enabled) {
        PlaneFilter.enabled = false;
        PlaneFilter.minAltitude = undefined;
        PlaneFilter.maxAltitude = undefined;
    }

    PlaneFilter.enabled = enabled;

    if (DisplayUnits == "metric") {
        PlaneFilter.minAltitude = minAltitude * 3.2808;
        PlaneFilter.maxAltitude = maxAltitude * 3.2808;
    } else {
        PlaneFilter.minAltitude = minAltitude;
        PlaneFilter.maxAltitude = maxAltitude;
    }
}
// Crea un enlace a FlightAware para un identificador (callsign)
function getFlightAwareIdentLink(ident, linkText) {
    if (ident !== null && ident !== "") {
        if (!linkText) {
            linkText = ident;
        }
        return '<a class="link" target="_blank" href="https://flightaware.com/live/flight/' + ident.trim() + '" rel="noreferrer">' + linkText + '</a>';
    }

    return "";
}
// Resetea selección del filtro por fuente
function onResetSourceFilter(e) {
    jQuery('#sourceFilter .ui-selected').removeClass('ui-selected');

    sourcesFilter = null;

    updateSourceFilter();
}
// Aplica el filtro por fuentes y refresca la lista
function updateSourceFilter(e) {
    if (e)
        e.preventDefault();

    PlaneFilter.sources = sourcesFilter;

    refreshFilter();
}
// Resetea filtro por banderas (military/PIA/LADD)
function onResetFlagFilter(e) {
    jQuery('#flagFilter .ui-selected').removeClass('ui-selected');

    flagFilter = null;

    updateFlagFilter();
}
// Guarda filtro por banderas y refresca
function updateFlagFilter(e) {
    if (e)
        e.preventDefault();

    PlaneFilter.flagFilter = flagFilter;

    refreshFilter();
}
// Container para filtros definidos en UI
const filters = {};
const filter_list = [];
const filters_active = [];
// Constructor para crear un filtro de texto reutilizable en la UI
function Filter(arg) {
    this.key = arg.key;
    this.field = arg.field;
    this.name = arg.name;
    this.tbody = document.getElementById(arg.table).getElementsByTagName('tbody')[0];

    this.id = 'filters_' + this.key;
    this.sid = '#' + this.id;

    filters[this.key] = this;
    filter_list.push(this);

    this.init();
}
// Al enviar el formulario de filtro, toma el texto y aplica el patrón
Filter.prototype.update = function (e) {
    if (e) {
        e.preventDefault();
    }

    this.input.blur();
    const val = this.input.val().trim();

    this.set(val);

    return false;
}
// Aplica el patrón de filtro y actualiza la lista activa
Filter.prototype.set = function (val) {

    this.input.val(val);
    this.pattern = val;
    this.PATTERN = this.pattern.toUpperCase();

    const list_index = filters_active.indexOf(this);
    if (val && list_index < 0) {
        filters_active.push(this);
    }
    if (!val && list_index >= 0) {
        filters_active.splice(list_index);
    }

    refreshFilter();
}
// Resetea el filtro (vacía campo y lo desactiva)
Filter.prototype.reset = function (e) {
    if (e) {
        e.preventDefault();
    }
    this.set("");
    return false;
}
// Crea la fila HTML del filtro en la tabla indicada y vincula eventos
Filter.prototype.init = function () {
    // don't F directly with the innerhtml of the body because it will drop event listeners / recreate dom elements
    const row = this.tbody.insertRow();
    row.innerHTML =
        `<td><form id="${this.id}">`
        + '<div class="infoBlockTitleText">Filter by ' + this.name + ':</div>'
        + `<input id="${this.id}_input" name="${this.id}_name" type="text" class="searchInput" maxlength="1024">`
        + '<button class="formButton" type="submit">Filter</button>'
        + `<button class="formButton" id="${this.id}_reset">Reset</button>`
        + '</form></td>'
        ;
    this.input = jQuery(this.sid + '_input');
    this.form = document.getElementById(this.id)
    this.form.onsubmit = (e) => { return this.update(e); };
    jQuery(this.sid + '_reset').click((e) => { return this.reset(e); });
}
// Crea todos los filtros disponibles en la UI y restaura valores guardados
function initFilters() {
    initSourceFilter(tableColors.unselected);
    initFlagFilter(tableColors.unselected);
    new Filter({
        key: 'callsign',
        field: 'name',
        name: 'callsign',
        table: "filterTable",
    });
    new Filter({
        key: 'squawk',
        field: 'squawk',
        name: 'squawk',
        table: "filterTable",
    });
    new Filter({
        key: 'type',
        field: 'icaoType',
        name: 'type code',
        table: "filterTable",
    });
    new Filter({
        key: 'description',
        field: 'typeDescription',
        name: 'type description',
        table: "filterTable",
    });
    new Filter({
        key: 'icao',
        field: 'icao',
        name: 'ICAO hex id',
        table: "filterTable",
    });


    new Filter({
        key: 'registration',
        field: 'registration',
        name: 'registration',
        table: 'filterTable3'
    });
    if (routeApiUrl) {
        new Filter({
            key: 'route',
            field: 'routeString',
            name: 'route',
            table: 'filterTable3'
        });
    }
    new Filter({
        key: 'country',
        field: 'country',
        name: 'country of registration',
        table: 'filterTable3'
    });
    new Filter({
        key: 'category',
        field: 'category',
        name: 'category (A3,B0,..)',
        table: 'filterTable3'
    });

    if (PlaneFilter) {
        if (PlaneFilter.minAltitude && PlaneFilter.minAltitude > -1000000) {
            jQuery('#altitude_filter_min').val(PlaneFilter.minAltitude);
        }
        if (PlaneFilter.maxAltitude && PlaneFilter.maxAltitude < 1000000) {
            jQuery('#altitude_filter_max').val(PlaneFilter.maxAltitude);
        }

        for (const filter of filter_list) {
            if (usp.has(`filter${filter.key}`)) {
                filter.set(usp.get(`filter${filter.key}`));
            }
        }

        if (PlaneFilter.sources) {
            sourcesFilter = PlaneFilter.sources
            sourcesFilter.map((f) => jQuery('#source-filter-' + f).addClass('ui-selected'))
        }

        if (PlaneFilter.flagFilter) {
            flagFilter = PlaneFilter.flagFilter
            flagFilter.map((f) => jQuery('#flag-filter-' + f).addClass('ui-selected'))
        }
    }
}




// Enlace a FlightAware para ver datos por código MODE‑S (si está disponible)
function getFlightAwareModeSLink(code, ident, linkText) {
    if (code !== null && code.length > 0 && code[0] !== '~' && code !== "000000") {
        if (!linkText) {
            linkText = "FlightAware: " + code.toUpperCase();
        }

        let linkHtml = "<a class=\"link\" target=\"_blank\" href=\"https://flightaware.com/live/modes/" + code;
        if (ident != null && ident !== "") {
            linkHtml += "/ident/" + ident.trim();
        }
        linkHtml += "/redirect\" rel=\"noreferrer\">" + linkText + "</a>";
        return linkHtml;
    }

    return "";
}
// Enlace a la foto/galería del avión según el servicio habilitado
function getPhotoLink(ac) {
    if (jetphotoLinks) {
        if (ac.registration == null || ac.registration == "")
            return "";
        return "<a class=\"link\" target=\"_blank\" href=\"https://www.jetphotos.com/photo/keyword/" + ac.registration.replace(/[^0-9a-z]/ig, '') + "\" rel=\"noreferrer\">Jetphotos</a>";
    } else if (flightawareLinks) {
        if (ac.registration == null || ac.registration == "")
            return "";
        return "<a class=\"link\" target=\"_blank\" href=\"https://flightaware.com/photos/aircraft/" + ac.registration.replace(/[^0-9a-z]/ig, '') + "\" rel=\"noreferrer\">FA Photos</a>";
    } else if (showPictures) {
        return "<a class=\"link\" target=\"_blank\" href=\"https://www.planespotters.net/hex/" + ac.icao.toUpperCase() + "\" rel=\"noreferrer\">View on g.planespotters</a>";
    }
}

// takes in an elemnt jQuery path and the OL3 layer name and toggles the visibility based on clicking it
// Conecta un control de la UI con una capa del mapa para alternar su visibilidad
function toggleLayer(element, layer) {
    // set initial checked status
    ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
        if (lyr.get('name') === layer && lyr.getVisible()) {
            jQuery(element).addClass('settingsCheckboxChecked');
        }
    });
    jQuery(element).on('click', function () {
        let visible = false;
        if (jQuery(element).hasClass('settingsCheckboxChecked')) {
            visible = true;
        }
        ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
            if (lyr.get('name') === layer) {
                if (visible) {
                    lyr.setVisible(false);
                    jQuery(element).removeClass('settingsCheckboxChecked');
                } else {
                    lyr.setVisible(true);
                    jQuery(element).addClass('settingsCheckboxChecked');
                }
            }
        });
    });
}

let fetchingPf = false;
// Descarga datos "pf" (ruta, mach, flightno) y los aplica a los aviones existentes
function fetchPfData() {
    if (fetchingPf)
        return;
    fetchingPf = true;
    for (let i in pf_data) {
        const req = jQuery.ajax({
            url: pf_data[i],
            dataType: 'json'
        });
        jQuery.when(req).done(function (data) {
            for (let i in g.planesOrdered) {
                const plane = g.planesOrdered[i];
                const ac = data.aircraft[plane.icao.toUpperCase()];
                if (!ac) {
                    continue;
                }
                plane.pfRoute = ac.route;
                plane.pfMach = ac.mach;
                plane.pfFlightno = ac.flightno;
                if (!plane.registration && ac.reg && ac.reg != "????" && ac.reg != "z.NO-REG")
                    plane.registration = ac.reg;
                if (!plane.icaoType && ac.type && ac.type != "????" && ac.type != "ZVEH") {
                    plane.icaoType = ac.type;
                    plane.setTypeData();
                }
            }
            fetchingPf = false;
        });
    }
}
// Divide los aviones visibles en 4 grupos y solicita trazas para cada grupo
function solidGoldT(arg) {
    solidT = true;
    let list = [[], [], [], []];
    for (let i = 0; i < g.planesOrdered.length; i++) {
        let plane = g.planesOrdered[i];
        //console.log(plane);
        if (plane.visible) {
            list[Math.floor(4 * i / g.planesOrdered.length)].push(plane);
        }
    }
    getTrace(null, null, { onlyRecent: arg == 2, onlyFull: arg == 1, list: list[0], });
    getTrace(null, null, { onlyRecent: arg == 2, onlyFull: arg == 1, list: list[1], });
    getTrace(null, null, { onlyRecent: arg == 2, onlyFull: arg == 1, list: list[2], });
    getTrace(null, null, { onlyRecent: arg == 2, onlyFull: arg == 1, list: list[3], });
}
// Calcula el rumbo en grados desde position1 hacia position2 (lon,lat)
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
// Acerca el mapa un nivel (mantiene seguimiento si está activo)
function zoomIn() {
    const zoom = OLMap.getView().getZoom();
    OLMap.getView().setZoom((zoom + 1).toFixed());
    if (FollowSelected)
        toggleFollow(true);
}
// Aleja el mapa un nivel (mantiene seguimiento si está activo)
function zoomOut() {
    const zoom = OLMap.getView().getZoom();
    OLMap.getView().setZoom((zoom - 1).toFixed());
    if (FollowSelected)
        toggleFollow(true);
}
// Actualiza estado interno cuando cambia el zoom del mapa
function changeZoom(init) {
    if (!OLMap)
        return;

    g.zoomLvl = OLMap.getView().getZoom();

    checkScale();

    // small zoomstep, no need to change aircraft scaling
    if (!init && Math.abs(g.zoomLvl - g.zoomLvlCache) < 0.4)
        return;

    lopaStore['zoomLvl'] = g.zoomLvl;
    g.zoomLvlCache = g.zoomLvl;

    if (!init && showTrace)
        updateAddressBar();

    checkPointermove();
}
// Ajusta tamaño de iconos y factores según zoom y recuentos
function checkScale() {
    if (g.zoomLvl > markerZoomDivide) {
        iconSize = markerBig;
    } else if (g.zoomLvl > markerZoomDivide - 1) {
        iconSize = markerSmall;
    } else {
        iconSize = markerSmall;
        if (aircraftShown > 700) {
            iconSize *= 0.9;
        }
    }

    // scale markers according to global scaling
    iconSize *= Math.pow(1.3, globalScale) * globalScale * iconScale;
    // disable, doesn't work well
    // iconSize *= 1 - 0.37 * Math.pow(TrackedAircraftPositions + 1, 0.8) / Math.pow(10000, 0.8);
}
// Aplica escala global a variables visibles y redibuja si corresponde
function setGlobalScale(scale, init) {
    globalScale = scale;
    document.documentElement.style.setProperty("--SCALE", globalScale);

    labelFont = `${labelStyle} ${(12 * globalScale * labelScale)}px/${(14 * globalScale * labelScale)}px ${labelFamily}`;

    checkScale();
    setLineWidth();
    if (!init) {
        refreshFeatures();
        refreshSelected();
        refreshHighlighted();
        remakeTrails();
    }
}
// Activa o desactiva el evento de mover el puntero según condiciones
function checkPointermove() {
    if ((webgl || g.zoomLvl > 5.5) && enableMouseover && !onMobile) {
        OLMap.on('pointermove', onPointermove);
    } else {
        OLMap.un('pointermove', onPointermove);
        removeHighlight();
    }
}

// Guarda el nuevo centro del mapa en variables y evita salirse de latitudes válidas
function changeCenter(init) {
    const rawCenter = OLMap.getView().getCenter();
    const center = ol.proj.toLonLat(rawCenter);

    const centerChanged = (Math.abs(center[1] - CenterLat) > 0.000001 || Math.abs(center[0] - CenterLon) > 0.000001);

    if (!init && !centerChanged) {
        return;
    }

    lopaStore['CenterLon'] = CenterLon = center[0];
    lopaStore['CenterLat'] = CenterLat = center[1];

    if (!init) {
        updateAddressBar();
    }

    if (rawCenter[0] < OLProjExtent[0] || rawCenter[0] > OLProjExtent[2]) {
        OLMap.getView().setCenter(ol.proj.fromLonLat(center));
        refresh();
    }
    if (CenterLat < -85)
        OLMap.getView().setCenter(ol.proj.fromLonLat([center[0], -85]));
    if (CenterLat > 85)
        OLMap.getView().setCenter(ol.proj.fromLonLat([center[0], 85]));
}

let lastMovement = 0;
let checkMoveZoom;
let checkMoveCenter = [0, 0];
let checkMoveDone = 0;
// Tarea que se ejecuta frecuentemente: mira cambios de mapa, busca rutas y decide refesh/fetch
function checkMovement() {
    if (!OLMap)
        return;

    if (!g.firstFetchDone) {
        return;
    }

    let currentTime = Date.now() / 1000;
    if (currentTime > g.route_next_lookup && !g.route_check_in_flight) {
        // check if it's time to send a batch of request to the API server
        g.route_next_lookup = currentTime + 1;
        routeDoLookup();
    }

    const zoom = OLMap.getView().getZoom();
    const center = ol.proj.toLonLat(OLMap.getView().getCenter());
    const ts = new Date().getTime();

    if (
        checkMoveZoom != zoom ||
        checkMoveCenter[0] != center[0] ||
        checkMoveCenter[1] != center[1]
    ) {
        checkMoveDone = 0;
        if (FollowSelected) {
            checkFollow();
        }
        active();
        lastMovement = ts;
    }

    checkMoveZoom = zoom;
    checkMoveCenter[0] = center[0];
    checkMoveCenter[1] = center[1];

    changeZoom();
    changeCenter();

    const elapsed = Math.abs(ts - lastMovement);

    if (!checkMoveDone && heatmap && elapsed > 300) {
        if (!heatmap.manualRedraw)
            drawHeatmap();
        checkMoveDone = 1;
    }
    if (elapsed > 500 || (!onMobile && elapsed > 45)) {
        checkRefresh();
    }

    fetchData();
}
// Devuelve zoom actual
function getZoom() {
    return OLMap.getView().getZoom();
}
// Devuelve centro actual en lon/lat
function getCenter() {
    return ol.proj.toLonLat(OLMap.getView().getCenter());
}

let lastRefresh = 0;
let refreshZoom, refreshCenter;
// Decide si hacer 'refresh' completo según posición, zoom y tiempo transcurrido
function checkRefresh() {
    if (showTrace)
        return;

    if (!g.firstFetchDone) {
        return;
    }
    if (triggerRefresh) {
        refresh();
        return;
    }
    const center = getCenter();
    const zoom = getZoom();
    if (zoom != refreshZoom || !refreshCenter || center[0] != refreshCenter[0] || center[1] != refreshCenter[1]) {
        const ts = new Date().getTime();
        const elapsed = Math.abs(ts - lastRefresh);
        let num = Math.min(1500, Math.max(250, TrackedAircraftPositions / 300 * 250));
        if (elapsed > num) {
            refresh();
        }
    }
}
// Redibuja mapa, tabla y detalles (actualiza visibilidad antes)
function refresh(redraw) {
    lastRefresh = new Date().getTime();

    refreshZoom = getZoom();
    refreshCenter = getCenter();

    if (replay) {
        for (let i in SelPlanes) {
            const plane = SelPlanes[i];
            plane.processTrace();
        }
    }

    // before planeman refresh / mapRefresh
    updateVisible();

    mapRefresh(redraw);

    //console.time("refreshTable");
    TAR.planeMan.refresh();
    //console.timeEnd("refreshTable");


    refreshSelected();
    refreshHighlighted();

    triggerRefresh = 0;
}
// Refresca filtros, trazas y heatmap; actualiza URL si está activado compartir filtros
function refreshFilter() {
    if (filterTracks)
        remakeTrails();

    refresh(true);

    drawHeatmap();
    if (toggles.shareFilters && toggles.shareFilters.state) {
        updateAddressBar();
    }
}

// Marca qué aviones están actualmente en vista y cuenta cuántos
function updateVisible() {
    if (mapIsVisible || !lastRenderExtent) {
        lastRenderExtent = getRenderExtent();
    }
    aircraftShown = 0;
    for (let i in g.planesOrdered) {
        const plane = g.planesOrdered[i];
        plane.updateVisible();
        aircraftShown += (plane.visible && plane.inView);
    }
    checkScale();
}
// Prepara lista de aviones a dibujar en el mapa y actualiza sus features
function mapRefresh(redraw) {
    if (!mapIsVisible || heatmap)
        return;
    let addToMap = [];
    let nMapPlanes = 0;
    let count = 0;

    if (globeIndex && !icaoFilter) {
        for (let i in g.planesOrdered) {
            count++;
            const plane = g.planesOrdered[i];
            delete plane.glMarker;
            // disable mobile limitations when using webGL
            if (plane.selected || (plane.inView && plane.visible && (!onMobile || webgl || (nMapPlanes < 150 && (!plane.onGround || g.zoomLvl > 10))))) {
                addToMap.push(plane);
                nMapPlanes++;
            } else {
                plane.markerDrawn && plane.clearMarker();
                !SelectedAllPlanes && plane.linesDrawn && plane.clearLines();
            }
        }
    } else {
        for (let i in g.planesOrdered) {
            const plane = g.planesOrdered[i];
            delete plane.glMarker;
            addToMap.push(plane);
        }
    }

    //console.log('planes on map: ' + nMapPlanes + ' / ' + count);

    // webGL zIndex hack:
    // sort all planes by altitude
    // clear the vector source
    // delete all feature objects so they are recreated, this is important
    // draw order will be insertion / updateFeatures order

    addToMap.sort(function (x, y) { return x.zIndex - y.zIndex; });
    //console.log('maprefresh(): ' + addToMap.length);
    if (webgl) {
        webglFeatures.clear();
    }

    for (let i in addToMap) {
        addToMap[i].updateFeatures(redraw);
    }
}

function onPointermove(evt) {
    //clearTimeout(pointerMoveTimeout);
    //pointerMoveTimeout = setTimeout(highlight(evt), 100);
    highlight(evt);
}
// Resalta avión bajo el cursor y actualiza el panel de info breve
function highlight(evt) {
    let evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
    let source = webgl ? webglFeatures : PlaneIconFeatures;
    let feature = source.getClosestFeatureToCoordinate(evtCoords);
    if (feature) {
        let fPixel = evt.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates());
        let a = fPixel[0] - evt.pixel[0];
        let b = fPixel[1] - evt.pixel[1];
        let c = globalScale * 20;
        if (a ** 2 + b ** 2 > c ** 2) {
            feature = null;
        }
    }
    if (!feature) {
        HighlightedPlane = null;
        refreshHighlighted();
        return;
    }
    const hex = feature.hex;

    const values = feature.values_;
    const mmsi = values ? values.mmsi : null;
    if (hex) {
        //console.log(hex);
    }
    if (mmsi) {
        //console.log(mmsi);
    }

    if (HighlightedPlane && hex == HighlightedPlane.icao)
        return;

    //clearTimeout(pointerMoveTimeout);

    if (hex) {
        HighlightedPlane = g.planes[hex];
    } else {
        HighlightedPlane = null;
    }
    //pointerMoveTimeout = setTimeout(refreshHighlighted(), 300);
    refreshHighlighted();
}
let urlIcaos = [];
// Parsea parámetro 'icao' de la URL y marca aviones para selección inicial
function parseURLIcaos() {
    if (usp.has('icao')) {
        let inArray = usp.get('icao').toLowerCase().split(',');
        for (let i = 0; i < inArray.length; i++) {
            const icao = inArray[i].toLowerCase();
            if (icao && (icao.length == 7 || icao.length == 6) && icao.toLowerCase().match(/[a-f,0-9]{6}/)) {
                urlIcaos.push(icao);
                let newPlane = g.planes[icao] || new PlaneObject(icao);
                newPlane.last_message_time = NaN;
                newPlane.position_time = NaN;
                newPlane.selected = true;
                SelPlanes.push(newPlane);
                //console.log(newPlane);
                // preliminary adding of URL specified icaos
            }
        }
    }
}
// Procesa parámetros de la URL (zoom, lat/lon, seleccion, colores, modos) y los aplica
function processURLParams() {
    if (usp.has('showTrace')) {
        let date = setTraceDate({ string: usp.get('showTrace') });
        if (date && usp.has('startTime')) {
            let numbers = usp.get('startTime').split(':');
            traceOpts.startHours = numbers[0] ? parseInt(numbers[0]) : 0;
            traceOpts.startMinutes = numbers[1] ? parseInt(numbers[1]) : 0;
            traceOpts.startSeconds = numbers[2] ? parseInt(numbers[2]) : 0;
        }
        if (date && usp.has('endTime')) {
            let numbers = usp.get('endTime').split(':');
            traceOpts.endHours = numbers[0] ? parseInt(numbers[0]) : 24;
            traceOpts.endMinutes = numbers[1] ? parseInt(numbers[1]) : 0;
            traceOpts.endSeconds = numbers[2] ? parseInt(numbers[2]) : 0;
        }
        if (date && usp.getFloat('timestamp')) {
            showTraceTimestamp = usp.getFloat('timestamp');
        }
    }

    const callsign = usp.get('callsign');
    let zoom = null;
    let follow = true;
    if (usp.get("zoom")) {
        try {
            zoom = parseFloat(usp.get("zoom"));
            if (zoom === 0)
                zoom = 8;
        } catch (error) {
            console.log("Error parsing zoom:", error);
        }
    }

    if (usp.get("lat") && usp.get("lon")) {
        try {
            const lat = parseFloat(usp.get("lat"));
            const lon = parseFloat(usp.get("lon"));
            OLMap.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
            follow = false;
            traceOpts.noFollow = new Date().getTime() / 1000;
        }
        catch (error) {
            console.log("Error parsing lat/lon:", error);
        }
    }

    lastRenderExtent = getRenderExtent();

    if (urlIcaos.length > 0) {
        const icaos = urlIcaos;
        if (!usp.has('noIsolation') && !usp.has('replay'))
            toggleIsolation("on");
        if (icaos.length > 1) {
            toggleMultiSelect("on");
            //follow = false;
        }
        for (let i = 0; i < icaos.length; i++) {
            const icao = icaos[i];
            console.log('Selected ICAO id: ' + icao + ' traceDate: ' + traceDateString);
            let options = { follow: follow, noDeselect: true };
            if (traceDate != null) {
                let newPlane = g.planes[icao] || new PlaneObject(icao);
                newPlane.last_message_time = NaN;
                newPlane.position_time = NaN;
                newPlane.selected = true;
                select(newPlane, options);

                (!zoom) && (zoom = 5);
            } else {
                (!zoom) && (zoom = 7);
                selectPlaneByHex(icao, options);
            }
        }
        if (traceDate != null) {
            toggleShowTrace();
            toggleFollow(follow);
        }
        updateAddressBar();
    } else if (callsign != null) {
        findPlanes(callsign, false, true, false, false, false);
    }

    if (zoom) {
        OLMap.getView().setZoom(zoom);
    }

    if (usp.has('mil'))
        toggleMilitary();

    if (usp.has('airport')) {
        onJumpInput = usp.get('airport').trim().toUpperCase();
        onJump();
    }

    if (usp.has('leg')) {
        legSel = parseInt(usp.get('leg'), 10);
        if (isNaN(legSel) || legSel < -1)
            legSel = -1;
        else
            legSel--;
    }

    let tracks = usp.get('monochromeTracks');
    if (tracks != undefined) {
        if (tracks.length == 6)
            monochromeTracks = '#' + tracks;
        else
            monochromeTracks = "#000000";
    }

    let markers = usp.get('monochromeMarkers');
    if (markers != undefined) {
        if (markers.length == 6)
            monochromeMarkers = '#' + markers;
        else
            monochromeMarkers = "#FFFFFF";
    }

    let outlineColor = usp.get('outlineColor');
    if (outlineColor != undefined) {
        if (outlineColor.length == 6)
            OutlineADSBColor = '#' + outlineColor;
        else
            OutlineADSBColor = "#000000";
    }

    if (usp.has('centerReceiver')) {
        OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
    }
    if (usp.has('lockDotCentered')) {
        lockDotCentered = true;
        OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
    }
}

let regIcaoDownloadRunning = false;
// Descarga el fichero regIcao.js y lo guarda en la caché local 'db.regCache'
function regIcaoDownload(opts) {
    regIcaoDownloadRunning = true;
    let req = jQuery.ajax({
        url: databaseFolder + "/regIcao.js",
        cache: true,
        timeout: 60000,
        dataType: 'json',
        opts: opts,
    });
    req.done(function (data) {
        db.regCache = data;
    });
    req.always(function () {
        regIcaoDownloadRunning = false;
    });
    return req;
}
// Busca aviones por ICAO, callsign, matrícula o tipo y maneja selección/advertencias
function findPlanes(queries, byIcao, byCallsign, byReg, byType, showWarnings) {
    if (queries == null)
        return;
    queries = queries.toLowerCase();
    queries = queries.split(',');
    if (queries.length > 1)
        toggleMultiSelect("on");
    let results = [];
    for (let i in queries) {
        const query = queries[i];
        if (byReg) {
            let upper = query.toUpperCase().replace("-", "");
            if (db.regCache) {
                if (db.regCache[upper]) {
                    selectPlaneByHex(db.regCache[upper].toLowerCase(), { noDeselect: true, follow: true });
                }
            } else if (!regIcaoDownloadRunning) {
                let req = regIcaoDownload({ upper: `${upper}` });
                req.done(function () {
                    if (db.regCache[this.opts.upper]) {
                        selectPlaneByHex(db.regCache[this.opts.upper].toLowerCase(), { noDeselect: true, follow: true });
                    }
                });
            }
        }
        for (let i in g.planesOrdered) {
            const plane = g.planesOrdered[i];
            if (
                (byCallsign && plane.flight != null && plane.flight.toLowerCase().match(query))
                || (byIcao && plane.icao.toLowerCase().match(query))
                || (byReg && plane.registration != null && plane.registration.toLowerCase().match(query))
                || (byType && plane.icaoType != null && plane.icaoType.toLowerCase().match(query))
            ) {
                results.push(plane);
                /* leaving this code in place just in case, not sure what this limitation to planes on screen is for when searching
                if (globeIndex) {
                    if (plane.inView)
                        results.push(plane);
                } else {
                    if (plane.checkVisible())
                        results.push(plane);
                }
                */
            }
        }
    }
    if (results.length > 1) {
        toggleMultiSelect("on");
        for (let i in results) {
            select(results[i], {});
            results[i].updateTick(true);
            sp = SelectedPlane = null;
        }
        showWarnings && hideSearchWarning();
    } else if (results.length == 1) {
        selectPlaneByHex(results[0].icao, { noDeselect: true, follow: true });
        console.log("query selected: " + queries);
        showWarnings && hideSearchWarning();
    } else {
        console.log("No match found for query: " + queries);
        let foundByHex = 0;
        if (haveTraces) {
            for (let i in queries) {
                const query = queries[i];
                if (query.toLowerCase().match(/~?[a-f,0-9]{6}/)) {
                    console.log("maybe it's an icao, let's try to fetch the history for it!");
                    selectPlaneByHex(query, { noDeselect: true, follow: true }) && foundByHex++
                }
            }
        }
        if (foundByHex === 0 && showWarnings) {
            if (globeIndex) {
                showSearchWarning("No match found in current view: " + queries);
            } else {
                showSearchWarning("No match found for query: " + queries);
            }
        }
    }
    return results;
}

function trailReaper() {
    for (let i in g.planesOrdered) {
        g.planesOrdered[i].reapTrail();
    }
}
// Calcula y guarda la distancia desde 'center' a un tile del globo (para priorizar peticiones)
function setIndexDistance(index, center, coords) {
    if (index >= 1000) {
        globeIndexDist[index] = ol.sphere.getDistance(center, coords);
        return;
    }
    let tile = globeIndexSpecialTiles[index];
    let min = ol.sphere.getDistance(center, [tile[1], tile[0]]);
    min = Math.min(min, ol.sphere.getDistance(center, [tile[1], tile[2]]));
    min = Math.min(min, ol.sphere.getDistance(center, [tile[3], tile[0]]));
    min = Math.min(min, ol.sphere.getDistance(center, [tile[3], tile[2]]));
    globeIndexDist[index] = min;
}
// Devuelve los índices de tiles del globo que están dentro de la vista actual
function globeIndexes() {
    const center = ol.proj.toLonLat(OLMap.getView().getCenter());
    if (mapIsVisible || lastGlobeExtent == null) {
        lastGlobeExtent = getViewOversize(1.02);
    }
    let extent = lastGlobeExtent.extent;
    const bottomLeft = ol.proj.toLonLat([extent[0], extent[1]]);
    const topRight = ol.proj.toLonLat([extent[2], extent[3]]);
    let x1 = bottomLeft[0];
    let y1 = bottomLeft[1];
    let x2 = topRight[0];
    let y2 = topRight[1];
    if (Math.abs(extent[2] - extent[0]) > 40075016) {
        // all longtitudes in view, only check latitude
        x1 = -179;
        x2 = 179;
    }
    if (y1 < -89.5)
        y1 = -89.5;
    if (y2 > 89.5)
        y2 = 89.5;
    let indexes = [];
    //console.log(x1 + ' ' + x2);
    let grid = globeIndexGrid;

    let x3 = x1 < x2 ? x2 : 199;
    let count = 0;

    //console.time('indexes');
    for (let lon = x1; lon < x3 + grid; lon += grid) {
        if (x1 > x2 && lon > 180) {
            lon -= 360;
            x3 = x2;
        }
        if (lon > x3)
            lon = x3 + 0.01;
        if (count++ > 360 / grid) {
            console.log("globeIndexes fail, lon: " + lon);
        }
        let count2 = 0;
        for (let lat = y1; lat < y2 + grid; lat += grid) {
            if (count2++ > 180 / grid) {
                console.log("globeIndexes fail, lon: " + lon + ", lat: " + lat);
                break;
            }
            if (lat > y2)
                lat = y2 + 0.01;
            if (lat > 90)
                break;
            let index = globe_index(lat, lon);
            //console.log(lat + ' ' + lon + ' ' + index);
            if (!indexes.includes(index)) {
                setIndexDistance(index, center, [lon, lat]);
                indexes.push(index);
            }
        }
    }
    //console.timeEnd('indexes');
    globeTilesViewCount = indexes.length;
    return indexes;
}
// Transforma lat/lon a un índice de tile del globo, teniendo en cuenta tiles especiales
function globe_index(lat, lon) {
    let grid = globeIndexGrid;

    lat = grid * Math.floor((lat + 90) / grid) - 90;
    lon = grid * Math.floor((lon + 180) / grid) - 180;

    let i = Math.floor((lat + 90) / grid);
    let j = Math.floor((lon + 180) / grid);

    let lat_multiplier = Math.floor(360 / grid + 1);
    let defaultIndex = i * lat_multiplier + j + 1000;

    let index = globeIndexSpecialLookup[defaultIndex];
    if (index) {
        return index;
    }

    // not yet in lookup, check special tiles
    for (let i = 0; i < globeIndexSpecialTiles.length; i++) {
        let tile = globeIndexSpecialTiles[i];
        if ((lat >= tile[0] && lat < tile[2])
            && ((tile[1] < tile[3] && lon >= tile[1] && lon < tile[3])
                || (tile[1] > tile[3] && (lon >= tile[1] || lon < tile[3])))) {
            globeIndexSpecialLookup[defaultIndex] = index = i;
        }
    }
    if (index == null) {
        // not a special tile, set lookup to default index
        globeIndexSpecialLookup[defaultIndex] = index = defaultIndex;
    }

    return index;
}
// Devuelve un objeto con los límites en lon/lat a partir de una extensión del mapa
function myExtent(extent) {
    let bottomLeft = ol.proj.toLonLat([extent[0], extent[1]]);
    let topRight = ol.proj.toLonLat([extent[2], extent[3]]);
    return {
        extent: extent,
        minLon: bottomLeft[0],
        maxLon: topRight[0],
        minLat: bottomLeft[1],
        maxLat: topRight[1],
    }
}
// Indica si una posición (lon,lat) está dentro de la vista dada (maneja el cruce por +/-180°)
function inView(pos, ex) {
    if (pos == null)
        return false;

    if (solidT)
        return true;

    let extent = ex.extent;
    let lon = pos[0];
    let lat = pos[1];

    //console.log((currExtent[2]-currExtent[0])/40075016);
    //console.log([bottomLeft[0], topRight[0]]);
    //console.log([bottomLeft[1], topRight[1]]);
    //const proj = ol.proj.fromLonLat(pos);
    if (lat < ex.minLat || lat > ex.maxLat)
        return false;

    if (extent[2] - extent[0] > 40075016) {
        // all longtitudes in view, only check latitude
        return true;
    } else if (ex.minLon < ex.maxLon) {
        // no wraparound: view not crossing 179 to -180 transition line
        return (lon > ex.minLon && lon < ex.maxLon);
    } else {
        // wraparound: view crossing 179 to -180 transition line
        return (lon > ex.minLon || lon < ex.maxLon);
    }
}
let lastAddressBarUpdate = 0;
let updateAddressBarTimeout;
let updateAddressBarPushed = false;
let updateAddressBarString = "";
// Construye la URL que representa el estado actual (selección, zoom, filtros) y la escribe en la barra del navegador
function updateAddressBar() {
    if (!window.history || !window.history.replaceState)
        return;
    if (heatmap || (pTracks && !haveTraces) || !CenterLat || uuid)
        return;

    let string = '';

    if (replay) {
        string += '?replay=';
        string += zDateString(replay.ts);
        string += '-' + replay.ts.getUTCHours().toString().padStart(2, '0');
        string += ':' + replay.ts.getUTCMinutes().toString().padStart(2, '0');
    }

    if (SelPlanes.length > 0) {
        string += (string ? '&' : '?');
        string += 'icao=' + SelPlanes.map((s) => encodeURIComponent(s.icao)).join(',')
    }

    if (showTrace || replay) {
        string += (string ? '&' : '?');
        string += 'lat=' + CenterLat.toFixed(3) + '&lon=' + CenterLon.toFixed(3) + '&zoom=' + g.zoomLvl.toFixed(1);
    }

    if (SelPlanes.length > 0 && (showTrace)) {
        string += (string ? '&' : '?');
        string += 'showTrace=' + traceDateString;
        if (legSel != -1)
            string += '&leg=' + (legSel + 1);
        if (traceOpts.startHours != null) {
            string += '&startTime=';
            string += traceOpts.startHours.toString().padStart(2, '0');
            string += ':' + traceOpts.startMinutes.toString().padStart(2, '0');
            if (traceOpts.startSeconds) {
                string += ':' + traceOpts.startSeconds.toString().padStart(2, '0');
            }
        }
        if (traceOpts.endHours != null) {
            string += '&endTime=';
            string += traceOpts.endHours.toString().padStart(2, '0');
            string += ':' + traceOpts.endMinutes.toString().padStart(2, '0');
            if (traceOpts.endSeconds) {
                string += ':' + traceOpts.endSeconds.toString().padStart(2, '0');
            }
        }
        if (trackLabels) {
            string += '&trackLabels';
            if (labelsGeom) {
                string += '&labelsGeom';
            }
            if (geomUseEGM) {
                string += '&geomEGM';
            }
        }
        if (traceOpts.showTime) {
            string += '&timestamp=';
            string += Math.ceil(traceOpts.showTime);
        }
    }

    let shareFilter = '';
    if (shareFiltersParam || (toggles.shareFilters && toggles.shareFilters.state)) {
        let filterStrings = [];

        if (PlaneFilter.minAltitude > -1000000) {
            filterStrings.push('filterAltMin=' + PlaneFilter.minAltitude);
        }
        if (PlaneFilter.maxAltitude < 1000000) {
            filterStrings.push('filterAltMax=' + PlaneFilter.maxAltitude);
        }

        for (const filter of filters_active) {
            filterStrings.push(`filter${filter.key}=${encodeURIComponent(filter.pattern)}`);
        }

        if (PlaneFilter.sources) {
            filterStrings.push('filterSources=' + PlaneFilter.sources.map(f => encodeURIComponent(f)).join(','));
        }
        if (PlaneFilter.flagFilter) {
            filterStrings.push('filterDbFlag=' + PlaneFilter.flagFilter.map(f => encodeURIComponent(f)).join(','));
        }

        if (filterStrings.length > 0) {
            shareFilter = shareFilter + filterStrings.join('&');
        } else {
            shareFilter = '';
        }

        //console.log(shareFilter);

        if (shareFilter) {
            string += (string ? '&' : '?');
            string += shareFilter;
        }
    }

    if (icaoFilter && !showTrace) {
        string += (string ? '&' : '?');
        string += 'icaoFilter=' + icaoFilter.join(',')
    }

    if (shareBaseUrl) {
        shareLink = shareBaseUrl + string;
    } else {
        shareLink = window.location.origin + pathName + string;
    }
    //console.log(shareLink);

    if (!string && !usp.has('showTrace') && !usp.has('icao')) {
        string = initialURL;
    } else {
        string = pathName + string;
    }

    // Update URL bar
    /*
    let time = new Date().getTime();
    if (time < lastAddressBarUpdate + 200) {
        clearTimeout(updateAddressBarTimeout);
        updateAddressBarTimeout = setTimeout(updateAddressBar, 205);
        return;
    }
 
    lastAddressBarUpdate = time;
    */

    if (string == updateAddressBarString) {
        return;
    }
    updateAddressBarString = string;

    if (!updateAddressBarPushed) {
        // make sure we keep the thing we clicked on first in the browser history
        window.history.pushState("object or string", "Title", string);
        updateAddressBarPushed = true;
    } else {
        // but don't create a new history entry for every plane we click on
        window.history.replaceState("object or string", "Title", string);
    }
}
// Calcula el intervalo de refresco recomendado según contexto (globo, carga, visibilidad)
function refreshInt() {
    let refresh = RefreshInterval;

    if (uuid)
        return 5050;

    // handle non globe case
    if (!globeIndex) {
        return refresh;
    }

    // handle globe case

    if (reApi && (binCraft || zstd)) {
        refresh = RefreshInterval * lastRequestSize / 35000;
        let extent = getViewOversize(1.03);
        const latDiff = extent.maxLat - extent.minLat;
        const lonDiff = extent.maxLon - extent.minLon;
        const area = latDiff * lonDiff;
        const areaThreshold = 30 * 30;
        let min = 1;
        let max = 7;
        if (area > areaThreshold && !onlySelected) {
            const factor2 = Math.min(4, (latDiff * lonDiff) / areaThreshold);
            min *= factor2;
        }
        if (refresh < RefreshInterval * min) {
            refresh = RefreshInterval * min;
        }
        if (refresh > RefreshInterval * max) {
            refresh = RefreshInterval * max;
        }
        if (onlySelected && SelPlanes.length == 0 && reApi) {
            // no aircraft selected, none shown
            refresh = RefreshInterval * max * 2;
        }
        if (!FollowSelected && lastRequestBox != requestBoxString()) {
            refresh = Math.min(RefreshInterval, refresh / 4);
        }
    }

    if (!reApi && binCraft && globeIndex && onlyMilitary && OLMap.getView().getZoom() < 5.5) {
        refresh = 5000;
    }

    let inactive = getInactive();

    const base = 70;

    if (inactive < base)
        inactive = base;
    if (inactive > 4 * base)
        inactive = 4 * base;


    if (globeIndex) {
        refresh *= inactive / base;
    }

    if (!mapIsVisible)
        refresh *= 2;

    if (aggregator && window.self != window.top) {
        refresh *= 1.5;
    } else if (onMobile && TrackedAircraftPositions > 800) {
        refresh *= 1.5;
    }

    if (document.visibilityState === 'hidden') { refresh *= 4; } // in case visibility change events don't work, reduce refresh rate if visibilityState works

    //console.log(refresh);

    return refresh;
}
// Enciende/apaga el modo que muestra trazas históricas y ajusta la UI/selección
function toggleShowTrace() {
    showTrace = !showTrace;
    if (showTrace) {
        jQuery("#selected_showTrace_hide").hide();

        toggleFollow(false);
        showTraceWasIsolation = onlySelected;
        toggleIsolation("on", "noRefresh");
        shiftTrace();
        refreshFilter();
    } else {
        jQuery("#selected_showTrace_hide").show();

        traceOpts = {};
        fetchData();
        legSel = -1;
        jQuery('#leg_sel').text('Legs: All');
        if (!showTraceWasIsolation)
            toggleIsolation("off");
        //let string = pathName + '?icao=' + SelectedPlane.icao;
        //window.history.replaceState("object or string", "Title", string);
        //shareLink = string;
        updateAddressBar();
        const hex = SelectedPlane.icao;
        sp = SelectedPlane = null;
        showTraceExit = true;
        for (let i in SelPlanes) {
            const plane = SelPlanes[i];
            plane.setNull();
        }
        selectPlaneByHex(hex, { noDeselect: true, follow: true, zoom: g.zoomLvl, });
        if (replay) {
            replayStep();
        }
    }

    jQuery('#history_collapse').toggle();
    jQuery('#show_trace').toggleClass('active');
}
// Cambia el tramo (leg) mostrado dentro de la traza histórica del avión
function legShift(offset, plane) {
    if (!offset)
        offset = 0;
    if (!plane) {
        legSel += offset;
        for (let i in SelPlanes) {
            legShift(offset, SelPlanes[i]);
        }
        return;
    }


    if (offset != 0)
        traceOpts.showTime = null;

    if (!multiSelect && !plane.fullTrace) {
        jQuery('#leg_sel').text('No Data available for\n' + traceDateString);
        jQuery('#trace_time').text('UTC:\n');
    }
    if (!plane.fullTrace) {
        plane.processTrace();
        return;
    }

    let trace = plane.fullTrace.trace;
    let legStart = null;
    let legEnd = null;
    let count = 0;

    for (let i = 0; i < trace.length; i++) {
        let timestamp = trace[i][0];
        if (traceOpts.startStamp != null && timestamp < traceOpts.startStamp) {
            continue;
        }
        if (traceOpts.endStamp != null && timestamp > traceOpts.endStamp) {
            break;
        }
        if (legStart == null) {
            legStart = i;
            i++;
            if (i >= trace.length)
                break;
        }
        if (trace[i][6] & 2) {
            count++;
        }
    }
    if (legSel < -1)
        legSel = count;
    if (legSel > count)
        legSel = -1;

    if (legSel == -1) {
        jQuery('#leg_sel').text('Legs: All');
        traceOpts.legStart = null;
        traceOpts.legEnd = null;
        plane.processTrace();
        updateAddressBar();
        return;
    }

    count = 0;
    for (let i = legStart + 1; i < trace.length; i++) {
        let timestamp = trace[i][0];
        if (traceOpts.endStamp != null && timestamp > traceOpts.endStamp)
            break;
        if (trace[i][6] & 2) {
            if (count == legSel - 1)
                legStart = i;
            if (count == legSel)
                legEnd = i; // exclusive
            count++;
        }
    }
    jQuery('#leg_sel').text('Leg: ' + (legSel + 1));
    traceOpts.legStart = legStart;
    traceOpts.legEnd = legEnd;
    plane.processTrace();

    updateAddressBar();
}
// Selecciona y valida la fecha para buscar trazas históricas
function setTraceDate(options) {
    options = options || {};
    let numbers = options.string ? options.string.split('-') : [];
    if (numbers.length == 3) {
        traceDate = new Date();
        traceDate.setUTCFullYear(numbers[0]);
        traceDate.setUTCMonth(numbers[1] - 1, numbers[2]);
    } else if (options.ts) {
        traceDate = new Date(options.ts);
    } else {
        return null;
    }
    traceDate.setUTCHours(0);
    traceDate.setUTCMinutes(0);
    traceDate.setUTCSeconds(0);
    traceDate.setUTCMilliseconds(0);

    let tomorrow = (new Date()).getTime() + 86400e3;
    if (traceDate.getTime() > tomorrow) {
        traceDate = new Date(tomorrow);
    }

    traceDateString = zDateString(traceDate);

    return traceDate;
}
// Cambia la fecha de trazas (por días) y solicita recarga de trazas para los seleccionados
function shiftTrace(offset) {
    if (traceRate > 180) {
        jQuery('#leg_sel').text('Slow down! ...');
        return;
    }

    // reset some traceOpts stuff (important)
    traceOpts.startStamp = null;
    traceOpts.endStamp = null;
    traceOpts.showTimeEnd = null;
    traceOpts.showTime = null;

    jQuery('#leg_sel').text('Loading ...');
    if (!traceDate || offset == "today") {
        setTraceDate({ ts: new Date().getTime() });
    } else if (offset) {
        setTraceDate({ ts: traceDate.getTime() + offset * 86400 * 1000 });
    }

    //jQuery('#trace_date').text('UTC day:\n' + traceDateString);
    jQuery("#histDatePicker").datepicker('setDate', traceDateString);

    for (let i in SelPlanes) {
        selectPlaneByHex(SelPlanes[i].icao, { noDeselect: true, zoom: g.zoomLvl });
    }

    updateAddressBar();
}

// Calcula y crea estilos (grosor, puntos) usados para dibujar trazas y marcar fallos
function setLineWidth() {
    newWidth = lineWidth * Math.pow(2, globalScale) / 2 * globalScale

    estimateStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#808080',
            width: 1.2 * newWidth,
        })
    });
    estimateStyleSlim = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#808080',
            width: 0.4 * newWidth,
        })
    });

    badLine = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FF0000',
            width: 2 * newWidth,
        })
    });
    badLineMlat = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FFA500',
            width: 2 * newWidth,
        })
    });

    badDot = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 3.5 * newWidth,
            fill: new ol.style.Fill({
                color: '#FF0000',
            })
        }),
    });
    badDotMlat = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 3.5 * newWidth,
            fill: new ol.style.Fill({
                color: '#FFA500',
            })
        }),
    });

    labelFill = new ol.style.Fill({ color: 'white' });
    blackFill = new ol.style.Fill({ color: 'black' });
    labelStroke = new ol.style.Stroke({ color: 'rgba(0,0,0,0.7', width: 4 * globalScale });
    labelStrokeNarrow = new ol.style.Stroke({ color: 'rgba(0,0,0,0.7', width: 2.5 * globalScale });
    bgFill = new ol.style.Stroke({ color: 'rgba(0,0,0,0.25' });
}
let lastCallLocationChange = 0;
// Actualiza la posición del "sitio" (receptor/usuario) con los datos del GPS del navegador
function onLocationChange(position) {
    if (SiteOverride) {
        return;
    }
    lastCallLocationChange = new Date().getTime();
    changeCenter();
    const moveMap = (Math.abs(SiteLat - CenterLat) < 0.000001 && Math.abs(SiteLon - CenterLon) < 0.000001);
    SiteLat = DefaultCenterLat = position.coords.latitude;
    SiteLon = DefaultCenterLon = position.coords.longitude;
    SitePosition = [SiteLon, SiteLat];

    drawSiteCircle();
    createLocationDot();

    if (moveMap || lockDotCentered) {
        OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
    }
    console.log('Changed Site Location to: ' + SiteLat + ', ' + SiteLon);
    //followRandomPlane();
    //togglePersistence();
}
// Simple wrapper para logear errores de geolocalización
function logArg(error) {
    console.log(error);
}

let watchPositionId;
let pollPositionSeconds = 10;
// Si está activado, consulta la ubicación periódicamente (fallback para navegadores que no actualizan bien)
function pollPositionInterval() {
    if (!updateLocation || !geoFindEnabled()) {
        return;
    }
    // interval position polling every half minute for browsers that are shit
    //console.trace();
    clearInterval(timers.pollPosition);
    timers.pollPosition = window.setInterval(function () {

        // if we recently got a new location via watchPosition(), don't query
        if (new Date().getTime() - lastCallLocationChange < pollPositionSeconds * 0.85 * 1000)
            return;

        if (tabHidden)
            return;

        console.log('pollPositionInterval: querying position');
        const geoposOptions = {
            enableHighAccuracy: false,
            timeout: pollPositionSeconds * 1000,
            maximumAge: pollPositionSeconds * 1000,
        };
        navigator.geolocation.getCurrentPosition(function (position) {
            onLocationChange(position);
        }, logArg, geoposOptions);
    }, pollPositionSeconds * 1000);
}
// Activa el watchPosition del navegador para recibir actualizaciones continuas de ubicación
function watchPosition() {
    if (watchPositionId != null) {
        navigator.geolocation.clearWatch(watchPositionId);
    }
    if (!updateLocation || !geoFindEnabled()) {
        return;
    }
    const geoposOptions = {
        enableHighAccuracy: false,
        timeout: Infinity,
        maximumAge: 25 * 1000,
    };
    console.log("watching position");
    watchPositionId = navigator.geolocation.watchPosition(function (position) {
        onLocationChange(position);
        pollPositionSeconds = 60;
    }, logArg, geoposOptions);
    pollPositionInterval();
}

let geoFindInterval = null;
// Pide una vez la ubicación actual al navegador y programa actualizaciones periódicas cada 15 minutos
function geoFindMe() {
    //console.trace();

    g.geoFindDefer = jQuery.Deferred();
    function success(position) {
        SiteLat = DefaultCenterLat = position.coords.latitude;
        SiteLon = DefaultCenterLon = position.coords.longitude;
        if (loStore['geoFindMeFirstVisit'] != 'no' && !(usp.has("lat") && usp.has("lon"))) {
            OLMap.getView().setCenter(ol.proj.fromLonLat([SiteLon, SiteLat]));
            loStore['geoFindMeFirstVisit'] = 'no';
        }

        initSitePos();
        console.log('Location from browser: ' + SiteLat + ', ' + SiteLon);

        g.geoFindDefer.resolve();


        {
            // always update user location every 15 minutes
            clearInterval(geoFindInterval);
            geoFindInterval = window.setInterval(function () {
                if (tabHidden)
                    return;
                const geoposOptions = {
                    enableHighAccuracy: false,
                    timeout: 15 * 60 * 1000,
                    maximumAge: 5 * 60 * 1000,
                };
                console.log('geoFindInterval: querying position');
                navigator.geolocation.getCurrentPosition(onLocationChange, logArg, geoposOptions);
            }, 15 * 60 * 1000);
        }
    }

    function error() {
        console.log("Unable to query location.");
        initSitePos();
        g.geoFindDefer.reject();
    }

    if (!geoFindEnabled()) {
        //console.log('Geolocation is not enabled');
        initSitePos();
        g.geoFindDefer.reject();
    } else if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
        initSitePos();
        g.geoFindDefer.reject();
    } else {
        // change SitePos on location change
        console.log('Locating…');
        const geoposOptions = {
            enableHighAccuracy: false,
            timeout: Infinity,
            maximumAge: 300 * 1000,
        };
        navigator.geolocation.getCurrentPosition(success, error, geoposOptions);
    }

    return g.geoFindDefer;
}

let initSitePosFirstRun = true;
// Inicializa la posición del sitio desde almacenamiento o valores detectados y ajusta tabla/ordenación
function initSitePos() {
    // fall back to loStore position
    if (loStore['SiteLat'] != null && loStore['SiteLon'] != null && SiteLat == null && SiteLon == null) {
        SiteLat = CenterLat = DefaultCenterLat = parseFloat(loStore['SiteLat']);
        SiteLon = CenterLon = DefaultCenterLon = parseFloat(loStore['SiteLon']);
    }
    // Set SitePosition
    if (SiteLat != null && SiteLon != null) {
        SitePosition = [SiteLon, SiteLat];
        // Add home marker if requested
        drawSiteCircle();
        createLocationDot();
    } else {
        TAR.planeMan.setColumnVis('sitedist', false);
    }

    if (initSitePosFirstRun) {
        initSitePosFirstRun = false;
        const sortBy = usp.get('sortBy');
        if (sortBy == "nosort") {
            // no sorting
        } else if (sortBy) {
            TAR.planeMan.ascending = true;
            TAR.planeMan.cols[sortBy].sort();
            if (usp.has('sortByReverse')) {
                TAR.planeMan.cols[sortBy].sort();
            }
        } else if (loStore['sortCol']) {
            TAR.planeMan.sortAscending = Boolean(loStore['sortAscending']);
            TAR.planeMan.cols[loStore['sortCol']].sort();
        } else {
            if (SitePosition) {
                TAR.planeMan.cols.sitedist.sort();
            } else {
                TAR.planeMan.sortAscending = false;
                TAR.planeMan.cols.altitude.sort();
            }
        }
    }
}

/*
function drawAlt() {
    processAircraft({hex: 'c0ffee', });
    let plane = g.planes['c0ffee'];
    newWidth = 4;
    for (let i = 0; i <= 50000; i += 500) {
        plane.position = [i/10000, 0];
        plane.altitude = i;
        plane.alt_rounded = calcAltitudeRounded(plane.altitude);
        plane.updateTrack(now - i, now - i - 5000, { serverTrack: true });
    }
}
*/
// Fuerza la recreación de todas las trazas para que se redibujen
function remakeTrails() {
    for (let i in g.planesOrdered) {
        const plane = g.planesOrdered[i];
        plane.removeTrail();
        plane.linesDrawn && (plane.drawLine = 1);
        plane.updateFeatures();
    }
}
// Dibuja el punto que representa la ubicación del receptor/usuario en el mapa
function createLocationDot() {
    locationDotFeatures.clear();
    let markerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 7,
            snapToPixel: false,
            fill: new ol.style.Fill({ color: 'black' }),
            stroke: new ol.style.Stroke({
                color: 'white', width: 2
            })
        })
    });

    let feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(SitePosition)));
    feature.setStyle(markerStyle);
    locationDotFeatures.addFeature(feature);
}
// Dibuja anillos de distancia alrededor del sitio y etiqueta cada anillo con su distancia
function drawSiteCircle() {
    //console.trace();
    siteCircleFeatures.clear();

    if (!SitePosition)
        return;

    let circleColor = '#FD5404';

    for (let i = 0; i < SiteCirclesDistances.length; i++) {
        circleColor = i < SiteCirclesColors.length ? SiteCirclesColors[i] : circleColor;

        let conversionFactor = 1000.0;
        if (DisplayUnits === "nautical") {
            conversionFactor = 1852.0;
        } else if (DisplayUnits === "imperial") {
            conversionFactor = 1609.0;
        }

        let distance = SiteCirclesDistances[i] * conversionFactor;
        let circle = TAR.utils.make_geodesic_circle(SitePosition, distance, 180);
        circle.transform('EPSG:4326', 'EPSG:3857');
        let feature = new ol.Feature(circle);

        let circleStyle = new ol.style.Style({
            fill: null,
            stroke: new ol.style.Stroke({
                color: '#FD5404',
                lineDash: SiteCirclesLineDash,
                width: globalScale,
            }),
            text: new ol.style.Text({
                font: ((10 * globalScale) + 'px Helvetica Neue, Helvetica, Tahoma, Verdana, sans-serif'),
                fill: new ol.style.Fill({ color: '#FD5404' }),
                offsetY: -8,
                text: format_distance_long(distance, DisplayUnits, 0),
            })
        });

        feature.setStyle(circleStyle);
        siteCircleFeatures.addFeature(feature);
    }
}

let calcOutlineFeatures = new ol.source.Vector();
let calcOutlineLayer;
// Dibuja anillos de visibilidad basados en datos de terreno (si se proporcionaron)
function drawUpintheair() {
    // Add terrain-limit rings. To enable this:
    //
    //  create a panorama for your receiver location on heywhatsthat.com
    //
    //  note the "view" value from the URL at the top of the panorama
    //    i.e. the XXXX in http://www.heywhatsthat.com/?view=XXXX
    //
    // fetch a json file from the API for the altitudes you want to see:
    //
    //  wget -O /usr/local/share/tar1090/html/upintheair.json \
    //    'http://www.heywhatsthat.com/api/upintheair.json?id=XXXX&refraction=0.25&alts=3048,9144'
    //
    // NB: altitudes are in _meters_, you can specify a list of altitudes
    //
    if (!calcOutlineData)
        return;

    let data = calcOutlineData;
    for (let i = 0; i < data.rings.length; ++i) {
        let geom = null;
        let points = data.rings[i].points;
        let altitude = (3.28084 * data.rings[i].alt).toFixed(0);
        let color = range_outline_color;
        if (range_outline_colored_by_altitude) {
            let colorArr = altitudeColor(altitude);
            color = 'hsla(' + colorArr[0].toFixed(0) + ',' + colorArr[1].toFixed(0) + '%,' + colorArr[2].toFixed(0) + '%,' + range_outline_alpha + ')';
        }
        let outlineStyle = new ol.style.Style({
            fill: null,
            stroke: new ol.style.Stroke({
                color: color,
                width: range_outline_width,
                lineDash: range_outline_dash,
            })
        });
        if (points.length > 0) {
            geom = new ol.geom.LineString([[points[0][1], points[0][0]]]);
            for (let j = 0; j < points.length; ++j) {
                geom.appendCoordinate([points[j][1], points[j][0]]);
            }
            geom.appendCoordinate([points[0][1], points[0][0]]);
            geom.transform('EPSG:4326', 'EPSG:3857');

            let feature = new ol.Feature(geom);
            feature.setStyle(outlineStyle);
            calcOutlineFeatures.addFeature(feature);
        }
    }
}
// Descarga un JSON con contornos reales (rango) y lo dibuja en la capa correspondiente
function drawOutlineJson() {
    let request = jQuery.ajax({
        url: actualOutline.url,
        cache: false,
        timeout: actualOutline.refresh,
        dataType: 'json'
    });
    request.done(function (data) {
        actualOutline.features.clear();
        let points = [];
        if (data.multiRange) {
            points = data.multiRange
        } else if (data.actualRange && data.actualRange.last24h) {
            points[0] = data.actualRange.last24h.points;
        } else {
            points[0] = data.points;
        }
        if (!points[0] || !points[0].length)
            return;
        for (let p = 0; p < points.length; ++p) {
            let geom = null;
            let lastLon = null;
            for (let j = 0; j < points[p].length + 1; ++j) {
                const k = j % points[p].length;
                const lat = points[p][k][0];
                const lon = points[p][k][1];
                const proj = ol.proj.fromLonLat([lon, lat]);
                if (!geom || (lastLon && Math.abs(lon - lastLon) > 270)) {
                    geom = new ol.geom.LineString([proj]);
                    actualOutline.features.addFeature(new ol.Feature(geom));
                } else {
                    geom.appendCoordinate(proj);
                }
                lastLon = lon;
            }
        }
    });

    request.fail(function () {
        // no rings available, do nothing
    });
}
// En modo traza, mueve la visualización al tiempo indicado o anima el marcador si corresponde
function gotoTime(timestamp) {
    //console.log(`gotoTime(${timestamp}) animate: {${traceOpts.animate}}`);
    clearTimeout(traceOpts.showTimeout);
    if (timestamp) {
        traceOpts.showTime = timestamp;
        traceOpts.animate = false;
    }
    if (!traceOpts.animate) {
        legShift(0);
    } else {
        let marker = SelectedPlane.glMarker || SelectedPlane.marker;
        if (marker) {

            traceOpts.animatePos[0] += (traceOpts.animateToLon - traceOpts.animateFromLon) / traceOpts.animateSteps;
            traceOpts.animatePos[1] += (traceOpts.animateToLat - traceOpts.animateFromLat) / traceOpts.animateSteps;

            SelectedPlane.updateMarker();
        }
        if (--traceOpts.animateCounter == 1) {
            traceOpts.animate = false;
            traceOpts.showTime = traceOpts.showTimeEnd;
        }

        traceOpts.animateStepTime = traceOpts.animateRealtime / traceOpts.replaySpeed / traceOpts.animateSteps;
        clearTimeout(traceOpts.showTimeout);
        //console.log(`setTimeout(gotoTime, (${traceOpts.animateStepTime}))`);
        traceOpts.showTimeout = setTimeout(gotoTime, traceOpts.animateStepTime);
    }
}
// Comprueba si el mapa sigue centrado en el avión que estamos siguiendo; si no, apaga el seguimiento
function checkFollow() {
    if (!FollowSelected)
        return false;
    if (!SelectedPlane || !SelectedPlane.position) {
        toggleFollow(false);
        return false;
    }
    const center = OLMap.getView().getCenter();
    let proj = SelectedPlane.proj;

    if (!proj) {
        return false;
    }

    if (Math.abs(center[0] - proj[0]) > 1 ||
        Math.abs(center[1] - proj[1]) > 1) {
        toggleFollow(false);
        return false;
    }
    return true;
}
// Ejecuta tareas cortas que deben ocurrir cada segundo (por ejemplo ajustar contadores y caché)
function everySecond() {
    if (traceRate > 0)
        traceRate = traceRate * 0.985 - 1;
    updateIconCache();

}

let getTraceTimeout = null;
// Solicita (o recupera) la traza histórica o reciente de un avión, gestiona reintentos y callbacks
function getTrace(newPlane, hex, options) {

    if (options.list) {
        newPlane = options.list.pop()
        if (!newPlane) {
            return;
        }
        hex = newPlane.icao;
    }

    if (!newPlane) {
        newPlane = g.planes[hex] || new PlaneObject(hex);
        newPlane.last_message_time = NaN;
        newPlane.position_time = NaN;
        select(newPlane, options);
    }

    let time = new Date().getTime();
    let backoff = 200;
    if (!showTrace && !solidT && traceRate > 140 && time < lastTraceGet + backoff) {
        clearTimeout(getTraceTimeout);
        getTraceTimeout = setTimeout(getTrace, lastTraceGet + backoff + 20 - time, newPlane, hex, options);
        return newPlane;
    }

    lastTraceGet = time;

    let URL1;
    let URL2;
    //console.log('Requesting trace: ' + hex);

    // use non historic traces until 60 min after midnight
    let today = new Date();
    let refDate = (replay ? replay.ts : traceDate) || today;

    if ((showTrace || replay) && !(today.getTime() > refDate.getTime() && today.getTime() < refDate.getTime() + (24 * 3600 + 60 * 60) * 1000)) {
        URL1 = null;
        URL2 = 'globe_history/' + zDateString(refDate).replace(/-/g, '/') + '/traces/' + hex.slice(-2) + '/trace_full_' + hex + '.json';
        traceRate += 3;
    } else {
        URL1 = 'data/traces/' + hex.slice(-2) + '/trace_recent_' + hex + '.json';
        URL2 = 'data/traces/' + hex.slice(-2) + '/trace_full_' + hex + '.json';
        traceRate += 2;
    }
    if (showTrace && trace_hist_only) {
        URL2 = 'globe_history/' + zDateString(refDate).replace(/-/g, '/') + '/traces/' + hex.slice(-2) + '/trace_full_' + hex + '.json';
    }

    traceOpts.follow = (options.follow == true);

    if (showTrace) {
        //console.log(today.toUTCString() + ' ' + traceDate.toUTCString());

        if (traceOpts.startHours == null || traceOpts.startHours < 0)
            traceOpts.startStamp = traceDate.getTime() / 1000;
        else
            traceOpts.startStamp = traceDate.getTime() / 1000 + traceOpts.startHours * 3600 + traceOpts.startMinutes * 60 + traceOpts.startSeconds;

        if (traceOpts.endHours == null || traceOpts.endHours >= 24)
            traceOpts.endStamp = traceDate.getTime() / 1000 + 24 * 3600;
        else
            traceOpts.endStamp = traceDate.getTime() / 1000 + traceOpts.endHours * 3600 + traceOpts.endMinutes * 60 + traceOpts.endSeconds;
    }

    if (newPlane && (showTrace || showTraceExit)) {
        newPlane.trace = [];
        newPlane.recentTrace = null;
        newPlane.fullTrace = null;
    }

    //console.log(URL2);

    //options = JSON.parse(JSON.stringify(options));
    options.plane = `${newPlane.icao}`;
    options.defer = jQuery.Deferred();

    if (URL1 && !options.onlyFull) {
        jQuery.ajax({
            url: `${URL1}`,
            dataType: 'json',
            options: options,
        })
            .done(function (data) {
                const options = this.options;
                const plane = g.planes[options.plane];
                plane.recentTrace = normalizeTraceStamps(data);
                if (!showTrace) {
                    plane.processTrace();
                    if (options.follow)
                        toggleFollow(true);
                }
                options.defer.resolve(options);
                if (options.onlyRecent && options.list) {
                    newPlane.updateLines();
                    getTrace(null, null, options);
                }
                this.options = null;
            });
    } else {
        options.defer.resolve(options);
    }

    if (options.onlyRecent)
        return newPlane;

    jQuery.ajax({
        url: `${URL2}`,
        dataType: 'json',
        options: options,
    })
        .done(function (data) {
            const options = this.options;
            const plane = g.planes[options.plane];
            plane.fullTrace = normalizeTraceStamps(data);
            options.defer.done(function (options) {
                const plane = g.planes[options.plane];
                if (showTrace) {
                    legShift(0, plane);
                    if (!multiSelect && showTraceTimestamp) {
                        gotoTime(showTraceTimestamp);
                    }
                } else {
                    plane.processTrace();
                    if (options.follow)
                        toggleFollow(true);
                }
            });
            if (options.list) {
                newPlane.updateLines();
                getTrace(null, null, options);
            }
            options.defer = null;
            this.options = null;
        })
        .fail(function () {
            const options = this.options;
            const plane = g.planes[options.plane];
            if (showTrace)
                legShift(0, plane);
            else
                plane.processTrace();

            if (options.list) {
                getTrace(null, null, options);
            } else {
                plane.getAircraftData();
                refreshSelected();
            }
            this.options = null;
        });

    return newPlane;
}
// Prepara las capas y fuentes necesarias para dibujar el mapa de calor
function initHeatmap() {
    heatmap.init = false;
    if (heatFeatures.length == 0) {
        for (let i = 0; i < heatFeaturesSpread; i++) {
            heatFeatures.push(new ol.source.Vector());
            heatLayers.push(new ol.layer.Vector({
                name: ('heatLayer' + i),
                isTrail: true,
                source: heatFeatures[i],
                declutter: (heatmap.declutter ? true : false),
                zIndex: 150,
                renderOrder: null,
                renderBuffer: 5,
            }));
            trailGroup.push(heatLayers[i]);
        }
    }
    realHeat = new ol.layer.Heatmap({
        source: realHeatFeatures,
        name: realHeat,
        isTrail: true,
        zIndex: 150,
        weight: x => heatmap.weight,
        radius: heatmap.radius,
        blur: heatmap.blur,
    });
    trailGroup.push(realHeat);
}
// Devuelve el número de elementos en un Set o Map (fallback simple)
function setSize(set) {
    let count = 0;
    for (const i in set.values())
        count++;
    return count;
}
// Lee los datos del heatmap y dibuja puntos dentro del área visible, aplicando filtros y límites
function drawHeatmap() {
    if (!heatmap)
        return;
    if (heatmap.init) {
        initHeatmap();
    }

    console.time("drawHeat");

    let ext = myExtent(OLMap.getView().calculateExtent(OLMap.getSize()));
    let maxLat = ext.maxLat * 1000000;
    let minLat = ext.minLat * 1000000;

    webglFeatures.clear();
    for (let i = 0; i < heatFeaturesSpread; i++)
        heatFeatures[i].clear();
    realHeatFeatures.clear();

    let pointCount = 0;
    let features = [];
    if (lineStyleCache["scale"] != globalScale) {
        lineStyleCache = {};
        lineStyleCache["scale"] = globalScale;
    }
    let done = new Set();
    let iterations = 0;
    let maxIter = 1000 * 1000;


    let tempPoints = [];
    for (let k = 0; k < heatChunks.length; k++) {
        if (heatPoints[k] != null) {
            true; // do nothing
        } else if (heatChunks[k] != null) {
            if (heatChunks[k].byteLength % 16 != 0) {
                console.log("Invalid heatmap file (byteLength): " + k);
                continue;
            }
            let points = heatPoints[k] = new Int32Array(heatChunks[k]);
            let found = 0;
            for (let i = 0; i < points.length; i += 4) {
                if (points[i] == 0xe7f7c9d) {
                    found = 1;
                    break;
                }
            }
            if (!found) {
                heatPoints[k] = heatChunks[k] = null;
                console.log("Invalid heatmap file (magic number): " + k);
            }
        } else {
            continue;
        }
        tempPoints.push(heatPoints[k]);
    }

    //console.log('tempPoints.length: ' + tempPoints.length);
    let myPoints = [];
    if (tempPoints.length <= 2) {
        myPoints = tempPoints;
    } else {
        let len = tempPoints.length;
        let arr1 = tempPoints.splice(0, Math.round(tempPoints.length / 3));
        let arr2 = tempPoints.splice(0, Math.round(tempPoints.length / 2));
        let arr3 = tempPoints;
        myPoints.push(arr2.splice(0, 1));
        myPoints.push(arr3.splice(0, 1));
        myPoints.push(arr1.splice(0, 1));
        len -= 3;
        for (let i = 0; i < Math.ceil(len / 3); i++) {
            myPoints.push(arr2.splice(0, 1));
            myPoints.push(arr3.splice(0, 1));
            myPoints.push(arr1.splice(0, 1));
        }
    }
    myPoints = myPoints.flat();

    //console.log('myPoints.length: ' + myPoints.length);

    let indexes = [];
    for (let k = 0; k < myPoints.length; k++) {
        let points = myPoints[k];
        let index = [];
        let i = 0;
        if (!points)
            continue;
        while (points[i] != 0xe7f7c9d && i < points.length) {
            index.push(points[i]);
            //console.log(points[i]);
            i += 4;
        }
        if (!heatmap.lines)
            index.sort((a, b) => (Math.random() - 0.5));
        indexes.push(index);
    }

    let offsets = Array(myPoints.length).fill(0);

    while (pointCount < heatmap.max && done.size < myPoints.length && iterations++ < maxIter) {
        for (let k = 0; k < myPoints.length && pointCount < heatmap.max; k++) {

            if (offsets[k] > indexes[k].length) {
                continue;
            }
            if (offsets[k] == indexes[k].length) {
                done.add(k);
                offsets[k]++;
                continue;
            }

            let points = myPoints[k];
            let pointsU = new Uint32Array(points.buffer);

            let i = 4 * indexes[k][offsets[k]];

            if (points[i] == 0xe7f7c9d)
                i += 4;

            if (i < 0) {
                console.log('wat ' + i);
                break;
            }
            for (; i < points.length; i += 4) {
                if (points[i] == 0xe7f7c9d)
                    break;
                let lat = points[i + 1];
                if (lat > maxLat || lat < minLat)
                    continue;

                lat /= 1000000;
                let lon = points[i + 2] / 1000000;
                let pos = [lon, lat];

                if (!inView(pos, ext))
                    continue;

                let alt = points[i + 3] & 65535;
                if (alt & 32768)
                    alt |= -65536;
                if (alt == -123)
                    alt = 'ground';
                else if (alt == -124)
                    alt = null;
                else
                    alt *= 25;

                let gs = points[i + 3] >> 16;
                if (gs == -1)
                    gs = null;
                else
                    gs /= 10;

                if (PlaneFilter.enabled && altFiltered(alt))
                    continue;

                if (heatmap.filters) {
                    let type = (pointsU[i] >> 27) & 0x1F;
                    let dataSource;
                    switch (type) {
                        case 0: dataSource = 'adsb'; break;
                        case 1: dataSource = 'modeS'; break;
                        case 2: dataSource = 'adsr'; break;
                        case 3: dataSource = 'tisb'; break;
                        case 4: dataSource = 'adsc'; break;
                        case 5: dataSource = 'mlat'; break;
                        case 6: dataSource = 'other'; break;
                        case 7: dataSource = 'modeS'; break;
                        case 8: dataSource = 'adsb'; break;
                        case 9: dataSource = 'adsr'; break;
                        case 10: dataSource = 'tisb'; break;
                        case 11: dataSource = 'tisb'; break;
                        default: dataSource = 'unknown';
                    }
                    let hex = (pointsU[i] & 0xFFFFFF).toString(16).padStart(6, '0');
                    hex = (pointsU[i] & 0x1000000) ? ('~' + hex) : hex;
                    let plane = g.planes[hex] || new PlaneObject(hex);
                    plane.dataSource = dataSource;
                    if (plane.isFiltered()) {
                        continue;
                    }
                }

                pointCount++;
                //console.log(pos);

                alt = calcAltitudeRounded(alt);
                let projHere = ol.proj.fromLonLat(pos);
                let style = lineStyleCache[alt];
                let hsl = altitudeColor(alt);
                hsl[1] = hsl[1] * 0.85;
                hsl[2] = hsl[2] * 0.8;
                if (!style) {
                    let col;
                    if (heatmap.alpha == null)
                        col = hslToRgb(hsl);
                    else
                        col = hslToRgb(hsl, heatmap.alpha);

                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: heatmap.radius * globalScale,
                            fill: new ol.style.Fill({
                                color: col,
                            }),
                        }),
                        zIndex: i,
                    });
                    lineStyleCache[alt] = style;
                }
                let feat = new ol.Feature(new ol.geom.Point(projHere));
                if (webgl) {
                    let rgb = hslToRgb(hsl, 'array');
                    feat.set('r', rgb[0]);
                    feat.set('g', rgb[1]);
                    feat.set('b', rgb[2]);
                } else {
                    feat.setStyle(style);
                }
                features.push(feat);
                //console.log(alt);
            }
            offsets[k] += 1;
        }
    }
    if (iterations >= maxIter)
        console.log("drawHeatmap: MAX_ITERATIONS!");
    //console.log(setSize(done));
    console.log("files: " + myPoints.length + ", points drawn: " + pointCount);
    if (heatmap.real) {
        realHeatFeatures.addFeatures(features);
    } else {

        if (webgl) {
            webglFeatures.addFeatures(features);
        } else {
            for (let i = 0; i < heatFeaturesSpread; i++) {

                heatFeatures[i].addFeatures(features.splice(0, pointCount / heatFeaturesSpread + 1));
                //console.log(features.length);
            }
        }
    }
    console.timeEnd("drawHeat");
    jQuery("#loader").hide();
}
// Devuelve el área visible actual del mapa, opcionalmente escalada
function currentExtent(factor) {
    let size = OLMap.getSize();
    if (factor != null)
        size = [size[0] * factor, size[1] * factor];
    return myExtent(OLMap.getView().calculateExtent(size));
}
// Genera valores por defecto para el modo "replay" (reproducción histórica)
function replayDefaults(ts) {
    jQuery("#replayPlay").html("Pause");
    let playing = true;
    let speed = 30;
    if (usp.has("replaySpeed")) {
        speed = usp.getFloat("replaySpeed");
    }
    if (speed == 0) {
        speed = 30;
        playing = false;
    }
    if (usp.has("replayPaused")) {
        playing = false;
    }
    return {
        playing: playing,
        ts: ts,
        ival: 60 * 1000,
        speed: speed,
        dateText: zDateString(ts),
        hours: ts.getUTCHours(),
        minutes: ts.getUTCMinutes(),
    };
}
// Detiene y limpia lo necesario al quitar el modo replay
function replayClear() {
    clearTimeout(refreshId);
    reaper(true);
    refreshFilter();
    replayPlanes = {};
}
// Calcula qué archivo binario (chunk) corresponde a un timestamp de replay
function replayGetChunk(ts) {
    let time = new Date(ts);
    let sDate = sDateString(time);
    let index = 2 * time.getUTCHours() + Math.floor(time.getUTCMinutes() / 30);
    let key = `${sDate} chunk ${index}`;
    let url = "globe_history/" + sDate + "/heatmap/" + index.toString().padStart(2, '0') + ".bin.ttf";
    return { date: sDate, index: index, key: key, url: url, };
}
// Carga (y valida) el chunk de replay necesario; gestiona caché y errores
function loadReplay(ts) {
    if (isNaN(ts.getTime())) {
        ts = new Date();
    }
    let lastAvailable = new Date();
    lastAvailable.setUTCMinutes(Math.floor(lastAvailable.getUTCMinutes() / 30) * 30);
    lastAvailable.setUTCSeconds(0);
    lastAvailable = lastAvailable.getTime() - 10 * 1000;
    if (ts.getTime() > lastAvailable) {
        ts = new Date(lastAvailable);
        ts.setUTCMinutes(Math.floor(ts.getUTCMinutes() / 30) * 30 + 1);
        ts.setUTCSeconds(0);
        console.log('not available, using this time: ' + ts);
        replayClear();
    }

    replay.ts = ts;
    replaySetTimeHint();

    if (!g.replayCache) {
        g.replayCache = new ItemCache(onMobile ? 12 : 24);
    }

    let chunk = replayGetChunk(ts);

    let rKey = chunk.key;
    let data = g.replayCache.get(rKey);

    if (data) {
        initReplay(chunk, data);
    } else {
        if (rKey == replay.loadingKey) {
            // console.log('if (rKey == replay.loadingKey) {');
            // download already in progress, do nothing
            return;
        }
        if (replay.abortController) {
            replay.abortController.abort();
        }

        replay.loadingKey = rKey;

        jQuery('#replayLoading').text('Loading ...');

        replay.abortController = new AbortController();

        jQuery("#update_error").css('display', 'none');
        clearTimeout(replay.errorTimeout);

        const ff = () => {
            //console.log(`finally ${rKey}`);
            delete replay.loadingKey;
            jQuery('#replayLoading').text('');
        };

        const errorFunc = (error) => {
            ff();
            if (error.name == 'AbortError') {
                //console.log(`aborted: ${rKey}`);
                return;
            }
            jQuery("#update_error_detail").text(error.message + ' --> No data for this timestamp!');
            jQuery("#update_error").css('display', 'block');
            replay.errorTimeout = setTimeout(() => { jQuery("#update_error").css('display', 'none'); }, 5000);
        };

        fetch(chunk.url, { signal: replay.abortController.signal })
            .then(
                (response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error, status = ${response.status}`);
                    }
                    response.arrayBuffer()
                        .then((data) => {
                            delete replay.abortController;
                            g.replayCache.add(rKey, data);
                            initReplay(chunk, data);
                            //console.log(`loaded: ${rKey}`);
                            ff();
                        })
                        .catch(errorFunc)
                        ;
                },
                errorFunc
            )
            .catch(errorFunc)
            ;

    }
}
function initReplay(chunk, data) {
    if (data.byteLength % 16 != 0) {
        console.log("Invalid heatmap file (byteLength)");
        return;
    }

    replay.loadedKey = chunk.key;

    let points = new Int32Array(data);
    let pointsU = new Uint32Array(data);
    let pointsU8 = new Uint8Array(data);
    let found = 0;
    replay.slices = [];
    for (let i = 0; i < points.length; i += 4) {
        if (points[i] == 0xe7f7c9d) {
            found = 1;
            replay.slices.push(i);
        }
    }
    if (!found) {
        console.log("Invalid heatmap file (magic number)");
        replay.points = null;
        replay.pointsU = null;
        replay.pointsU8 = null;
        return;
    }
    replay.points = points;
    replay.pointsU = pointsU;
    replay.pointsU8 = pointsU8;

    refreshFilter();

    replay.ival = (replay.pointsU[replay.slices[0] + 3] & 65535) / 1000;
    replay.halfHour = (replay.ts.getUTCMinutes() >= 30) ? 1 : 0;
    let index = Math.round(((replay.ts.getUTCMinutes() % 30) * 60 + replay.ts.getUTCSeconds()) / replay.ival);
    //console.log("init with index" + replay.index);
    if (index > 0) {
        if (false && index > 1) {
            replay.index = 0
            replayStep("fast");
        }
        replay.index = index - 1;
        replayStep("fast");
    }
    replay.index = index;
    replayStep();
}
// Actualiza pistas/etiquetas de tiempo del replay en la UI
function setReplayTimeHint(date) {
    if (true || utcTimesHistoric) {
        jQuery("#replayDateHintLocal").html(TIMEZONE + " Date: " + lDateString(date));
        jQuery("#replayDateHint").html("" + zDateString(date));
        jQuery("#replayTimeHint").html("UTC:" + NBSP + zuluTime(date) + ' / ' + TIMEZONE + ":" + NBSP + localTime(date));
    } else {
        jQuery("#replayDateHintLocal").html("");
        jQuery("#replayDateHint").html("Date: " + lDateString(date));
        jQuery("#replayTimeHint").html("Time: " + localTime(date) + NBSP + TIMEZONE);
    }
}
function replayOnSliderMove() {
    clearTimeout(refreshId);

    let date = new Date(replay.dateText);
    date.setUTCHours(Number(replay.hours));
    date.setUTCMinutes(Number(replay.minutes));
    replay.seconds = 0;
    date.setUTCSeconds(Number(replay.seconds));

    setReplayTimeHint(date);
}
let replayJumpEnabled = true;
// Ordena y carga el replay para la hora indicada por los controles; evita saltos pequeños innecesarios
function replayJump() {
    if (!showingReplayBar)
        return;
    if (!replayJumpEnabled)
        return;
    let date = new Date(replay.dateText);
    date.setUTCHours(Number(replay.hours));
    date.setUTCMinutes(Number(replay.minutes));
    date.setUTCSeconds(Number(replay.seconds));

    let ts = new Date(replay.ts.getTime());

    // diff less 10 seconds
    if (Math.abs(date.getTime() - ts.getTime()) < 10000) {
        return;
    }
    //console.log(replay.minutes.toString() + ' ' + ts.toString() + ' ' + (date.getTime() - ts.getTime()).toString());

    //console.trace();
    console.log('jump: ' + date.toUTCString());

    replayClear();
    loadReplay(date);
}
function replaySetTimeHint(arg) {
    replayJumpEnabled = false;
    let dateString;
    let timeString;

    dateString = zDateString(replay.ts);
    timeString = zuluTime(replay.ts) + NBSP + 'Z';

    setReplayTimeHint(replay.ts);

    if (replay.datepickerDate != dateString) {
        replay.datepickerDate = dateString;
        jQuery("#replayDatepicker").datepicker('setDate', dateString);
    }


    let hours = replay.ts.getUTCHours();
    jQuery('#hourSelect').slider("option", "value", hours);

    let minutes = replay.ts.getUTCMinutes();
    jQuery('#minuteSelect').slider("option", "value", minutes);
    replayJumpEnabled = true;
}
// Avanza un paso en el replay: procesa un slice, actualiza tiempos y procesa aeronaves del slice
function replayStep(arg) {
    if (!replay || showTrace) {
        return;
    }
    if (replay.loadedKey != replayGetChunk(replay.ts).key) {
        console.error('no data loaded for current timestamp, can\'t play!');
        return;
    }

    if (replay.playing) {
        clearTimeout(refreshId);
        refreshId = setTimeout(replayStep, replay.ival / replay.speed * 1000);
    }

    if (isNaN(replay.ts.getTime())) {
        loadReplay(new Date());
        return;
    }
    let index = replay.index;
    if (index >= replay.slices.length) {
        console.log('next half hour');
        let date = new Date(replay.ts.getTime() + 30 * 60 * 1000);
        date.setUTCMinutes(Math.floor(date.getUTCMinutes() / 30) * 30);
        date.setUTCSeconds(0);
        clearTimeout(refreshId);
        loadReplay(date);
        return;
    }

    let minutes = replay.halfHour * 30 + Math.floor(replay.ival * index / 60);
    let seconds = (replay.ival * index) % 60;
    //console.log(minutes.toString() + ' ' + seconds.toString());
    replay.ts.setUTCMinutes(minutes)
    replay.ts.setUTCSeconds(seconds)

    replay.hours = replay.ts.getUTCHours();
    replay.minutes = minutes;
    replay.seconds = seconds;

    let points = replay.points;
    let pointsU = replay.pointsU;
    let i = replay.slices[index];

    //console.log('index: ' + index + ', i: ' + i);

    last = now;
    now = replay.pointsU[i + 2] / 1000 + replay.pointsU[i + 1] * 4294967.296;
    g.now = now;

    traceOpts.endStamp = now + replay.ival;

    replay.ival = (replay.pointsU[i + 3] & 65535) / 1000;

    if (arg != 'fast') {
        replaySetTimeHint();
        if (replay.addressMinutes != replay.minutes) {
            replay.addressMinutes = replay.minutes;
            updateAddressBar();
        }
        //console.log(replay.ts.toUTCString());
        if (now - lastReap > 60) {
            reaper();
        }
    }

    i += 4;

    let ext;
    if (g.zoomLvl > 10) {
        ext = currentExtent(1.6);
    } else if (g.zoomLvl > 8) {
        ext = currentExtent(1.2);
    } else {
        ext = currentExtent(1.1);
    }
    ext.maxLat *= 1e6;
    ext.maxLon *= 1e6;
    ext.minLat *= 1e6;
    ext.minLon *= 1e6;
    for (; i < points.length && points[i] != 0xe7f7c9d; i += 4) {
        let lat = points[i + 1];
        let lon = points[i + 2];
        let pos = [lon, lat];
        if (lat >= 1073741824) {
            let hex = (points[i] & ((1 << 24) - 1)).toString(16).padStart(6, '0');
            hex = (points[i] & (1 << 24)) ? ('~' + hex) : hex;
            let ac = { hex: hex, seen: 0, seen_pos: 0, };
            if (replay.pointsU8[4 * (i + 2)] != 0) {
                ac.flight = "";
                for (let j = 0; j < 8; j++) {
                    ac.flight += String.fromCharCode(replay.pointsU8[4 * (i + 2) + j]);
                }
            }
            ac.squawk = (lat & 0xFFFF).toString(10).padStart(4, '0');
            if (!g.planes[hex]) {
                replayPlanes[hex] = ac;
                continue;
            }
            processAircraft(ac, false, false);
            continue;
        }
        if (!inView(pos, ext)) {
            continue;
        }

        lat /= 1e6;
        lon /= 1e6;
        pos = [lon, lat];

        let type = (pointsU[i] >> 27) & 0x1F;
        switch (type) {
            case 0: type = 'adsb_icao'; break;
            case 1: type = 'adsb_icao_nt'; break;
            case 2: type = 'adsr_icao'; break;
            case 3: type = 'tisb_icao'; break;
            case 4: type = 'adsc'; break;
            case 5: type = 'mlat'; break;
            case 6: type = 'other'; break;
            case 7: type = 'mode_s'; break;
            case 8: type = 'adsb_other'; break;
            case 9: type = 'adsr_other'; break;
            case 10: type = 'tisb_trackfile'; break;
            case 11: type = 'tisb_other'; break;
            case 12: type = 'mode_ac'; break;
            default: type = 'unknown';
        }
        let hex = (pointsU[i] & 0xFFFFFF).toString(16).padStart(6, '0');
        hex = (pointsU[i] & 0x1000000) ? ('~' + hex) : hex;

        if (icaoFilter && !icaoFilter.includes(hex))
            continue;

        let alt = points[i + 3] & 65535;
        if (alt & 32768)
            alt |= -65536;
        if (alt == -123)
            alt = 'ground';
        else if (alt == -124)
            alt = null;
        else
            alt *= 25;

        let gs = points[i + 3] >> 16;
        if (gs == -1)
            gs = null;
        else
            gs /= 10;

        let ac = {
            seen: 0,
            seen_pos: 0,
        };

        if (!g.planes[hex]) {
            const cached = replayPlanes[hex];
            if (cached) {
                ac = cached;
                //delete replayPlanes[hex];
            }
        }

        ac.hex = hex;
        ac.lat = lat;
        ac.lon = lon;
        ac.alt_baro = alt;
        ac.gs = gs;
        ac.type = type;

        processAircraft(ac, false, false);
    }

    if (arg != "fast") {
        triggerRefresh = 1;
        checkMovement();
        checkRefresh();
    }
    replay.index = index + 1;
}
// Intenta cargar imágenes SVG en la caché si están listas, reintenta si no aún
function updateIconCache() {
    let item;
    let tryAgain = [];
    while (item = addToIconCache.pop()) {
        let svgKey = item[0];
        let element = item[1];
        if (iconCache[svgKey] != undefined) {
            continue;
        }
        if (!element) {
            element = new Image();
            element.src = item[2];
            item[1] = element;
            tryAgain.push(item);
            continue;
        }
        if (!element.complete) {
            console.log("moep");
            tryAgain.push(item);
            continue;
        }

        iconCache[svgKey] = element;
    }
    addToIconCache = tryAgain;
}
// Devuelve el tiempo en segundos desde la última interacción del usuario
function getInactive() {
    return (new Date().getTime() - lastActive) / 1000;
}
// Marca al usuario como activo (resetea el contador de inactividad)
function active() {
    lastActive = new Date().getTime();
}
// Dibuja los bordes de un tile del globo en el mapa (mostrar límites de petición)
function drawTileBorder(data) {
    let southWest = ol.proj.fromLonLat([data.west, data.south]);
    let south180p = ol.proj.fromLonLat([180, data.south]);
    let south180m = ol.proj.fromLonLat([-180, data.south]);
    let southEast = ol.proj.fromLonLat([data.east, data.south]);
    let northEast = ol.proj.fromLonLat([data.east, data.north]);
    let north180p = ol.proj.fromLonLat([180, data.north]);
    let north180m = ol.proj.fromLonLat([-180, data.north]);
    let northWest = ol.proj.fromLonLat([data.west, data.north]);
    const estimateStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#303030',
            width: 1.5,
        })
    });
    if (data.west < data.east) {
        let tile = new ol.geom.LineString([southWest, southEast, northEast, northWest, southWest]);
        let tileFeature = new ol.Feature(tile);
        tileFeature.setStyle(estimateStyle);
        siteCircleFeatures.addFeature(tileFeature);
    } else {
        let west = new ol.geom.LineString([south180p, southWest, northWest, north180p]);
        let east = new ol.geom.LineString([south180m, southEast, northEast, north180m]);
        let westF = new ol.Feature(west);
        let eastF = new ol.Feature(east);
        westF.setStyle(estimateStyle);
        eastF.setStyle(estimateStyle);
        siteCircleFeatures.addFeature(westF);
        siteCircleFeatures.addFeature(eastF);
    }
}
// Actualiza la tasa de mensajes usando diferentes formatos de datos (mensajes directos o contadores)
function updateMessageRate(data) {
    if (data.messageRate && data.messageRate > 0) {
        MessageRate = data.messageRate;
    } else if (data.messages && data.messages > 1) {
        // Detect stats reset
        if (MessageCountHistory.length > 0 && MessageCountHistory[MessageCountHistory.length - 1].messages > data.messages) {
            MessageCountHistory = [];
        }

        // Note the message count in the history
        MessageCountHistory.push({ 'time': data.now, 'messages': data.messages });

        if (MessageCountHistory.length > 1) {
            // .. and clean up any old values
            while ((now - MessageCountHistory[0].time) > 10.5) {
                MessageCountHistory.shift();
            }
            let message_time_delta = MessageCountHistory[MessageCountHistory.length - 1].time - MessageCountHistory[0].time;
            let message_count_delta = MessageCountHistory[MessageCountHistory.length - 1].messages - MessageCountHistory[0].messages;
            if (message_time_delta > 0) {
                MessageRate = message_count_delta / message_time_delta;
            }
            //console.log(message_time_delta);
        }

    } else if (uuid != null && data.messages == 1) {
        const cache = uuidCache[data.urlIndex] || { now: 0 };
        let time_delta = now - cache.now;
        if (time_delta > 0.5) {
            let newCache = uuidCache[data.urlIndex] = { now: now };
            let message_delta = 0;
            let acs = data.aircraft;
            for (let j = 0; j < acs.length; j++) {
                const hex = acs[j].hex;
                const messages = acs[j].messages
                let cachedMessages = cache[hex];
                if (cachedMessages) {
                    message_delta += (messages - cachedMessages);
                }
                newCache[hex] = messages;
            }
            newCache.rate = message_delta / time_delta;
        }
        MessageRate = 0;
        for (let i in uuidCache) {
            const c = uuidCache[i];
            MessageRate += c ? c.rate : 0;
        }
    } else {
        MessageRate = null;
    }
}
// Controla si el replay está en marcha o en pausa
function playReplay(state) {
    if (!replay) {
        return;
    }
    if (state) {
        if (replay.loadedKey != replayGetChunk(replay.ts).key) {
            console.error('no data loaded for current timestamp, can\'t play!');
            return;
        }
        replay.playing = true;
        jQuery("#replayPlay").html("Pause");
        replayStep();
    } else {
        replay.playing = false;
        jQuery("#replayPlay").html("Play");
        clearTimeout(refreshId);
    }
};
// Muestra u oculta la barra de controles del replay y prepara sus elementos
function showReplayBar() {
    console.log('showReplayBar()');
    showingReplayBar = !showingReplayBar;
    if (!showingReplayBar) {
        jQuery("#replayBar").hide();
        replay = null;
        jQuery('#map_canvas').height('100%');
        jQuery('#sidebar_canvas').height('100%');
        jQuery("#selected_showTrace_hide").show();
    } else {
        jQuery("#replayBar").show();
        jQuery("#replayBar").css('display', 'grid');
        jQuery('#replayBar').height('100px');
        jQuery('#map_canvas').height('calc(100% - 100px)');
        jQuery('#sidebar_canvas').height('calc(100% - 110px)');
        if (!replay) {
            replay = replayDefaults(new Date());
            replay.playing = false;
        }
        //ts.setUTCMinutes((parseInt((ts.getUTCMinutes() + 7.5)/15) * 15) % 60);
        let datepickerOptions = {
            maxDate: '+1d',
            dateFormat: "yy-mm-dd",
            autoSize: true,
            onSelect: function (dateText) {
                replay.dateText = dateText;
                replayJump();
            },
        };
        if (onMobile) {
            datepickerOptions.onClose = function (dateText, inst) {
                jQuery("replayDatepicker").attr("disabled", false);
            };
            datepickerOptions.beforeShow = function (input, inst) {
                jQuery("replayDatepicker").attr("disabled", true);
            };
        } else {
            //
        }

        jQuery("#replayDatepicker").datepicker(datepickerOptions);

        // --- SLIDER DE HORAS ---
        jQuery('#hourSelect').slider({
            step: 1, min: 0, max: 23,
            slide: function (event, ui) {
                replay.hours = ui.value;
                updateSliderTip(ui.handle, ui.value, "h");
                replayOnSliderMove();
            },
            change: function (event, ui) {
                updateSliderTip(jQuery(this).find('.ui-slider-handle'), ui.value, "h");
                replayJump();
            }
        });

        // Inyección de etiquetas
        setupSliderDecorations('#hourSelect', '00h', '23h');

        // --- SLIDER DE MINUTOS ---
        jQuery('#minuteSelect').slider({
            step: 1, min: 0, max: 59,
            slide: function (event, ui) {
                replay.minutes = ui.value;
                updateSliderTip(ui.handle, ui.value, "m");
                replayOnSliderMove();
            },
            change: function (event, ui) {
                updateSliderTip(jQuery(this).find('.ui-slider-handle'), ui.value, "m");
                replayJump();
            }
        });

        // Inyección de etiquetas
        setupSliderDecorations('#minuteSelect', '00m', '59m');

        const slideBase = 3.0;
        jQuery('#replaySpeedSelect').slider({
            value: Math.pow(replay.speed, 1 / slideBase),
            step: 0.07,
            min: Math.pow(1, 1 / slideBase),
            max: Math.pow(1000, 1 / slideBase),
            slide: function (event, ui) {
                replay.speed = Math.pow(ui.value, slideBase).toFixed(1);
                jQuery('#replaySpeedHint').text('Speed: ' + replay.speed + 'x');
            },
            change: function (event, ui) {
                replayStep();
            },
        });
        jQuery('#replaySpeedHint').text('Speed: ' + replay.speed + 'x');

        jQuery("#selected_showTrace_hide").hide();
    }

    updatePanoramaOverlayBounds();
};

// Actualiza el texto de la etiqueta del slider
function updateSliderTip(handle, value, suffix) {
    const formatted = value.toString().padStart(2, '0') + suffix;
    jQuery(handle).find('.slider-tip').text(formatted);
}

// Configura las decoraciones (etiquetas) del slider
function setupSliderDecorations(selector, minTxt, maxTxt) {
    const el = jQuery(selector);
    const handle = el.find('.ui-slider-handle');
    if (handle.find('.slider-tip').length === 0) {
        handle.append('<span class="slider-tip">00</span>');
    }

}
// Se llama periódicamente cuando hay un timeout global; fuerza nueva consulta de datos
function timeoutFetch() {
    console.log("timeoutFetch " + localTime(new Date()));
    fetchData();
    if (timers.timeoutFetch) {
        clearTimeout(timers.checkMove);
    }
    timers.timeoutFetch = setTimeout(timeoutFetch, Math.max(RefreshInterval, 10000));
    if (now - lastReap > 120) {
        reaper();
    }
}
// Si la pestaña vuelve a estar visible, carga el historial si hace falta y gestiona UI
function refreshHistory() {
    if (heatmap || replay || globeIndex || pTracks || uuid || !HistoryChunks) {
        noLongerHidden();
        return;
    }

    if (1 && (new Date().getTime() - g.hideStamp) / 1000 < 5) {
        console.log('short tab change, not loading history');
        noLongerHidden();
        return;
    }

    jQuery("#loader_progress").attr('value', 0);

    setTimeout(() => {
        if (!timersActive) {
            jQuery("#loader").show();
        }
    }, 200);

    chunksDefer().done(function (data) {
        console.log(localTime(new Date()) + ' tab change, loading history');
        g.refreshHistory = true;
        HistoryChunks = true;
        chunkNames = [];
        jQuery("#loader_progress").attr('value', 1);
        try {
            for (let i = data.chunks.length - 1; i >= 0; i--) {
                let f = data.chunks[i];
                chunkNames.push(f);

                // break after we found a chunk that's older than now
                // chunk timestamp is the start of its data, not the end
                // so we need to include the first chunk that's older
                // which is done above

                let parts = f.split(".")[0].split("_");
                if (parts[0] == "chunk") {
                    if (now > parts[1] / 1e3) {
                        break;
                    }
                }
            }
            //console.log(chunkNames);
            nHistoryItems = chunkNames.length;
            get_history();
            push_history();
        } catch (e) {
            console.error(e);
            noLongerHidden();
        }
    }).fail(function () {
        setTimeout(refreshHistory, 500);
    });
}

// Detecta cuando la pestaña del navegador cambia de visible a oculta y ajusta timers/estado
function handleVisibilityChange() {
    const prevHidden = tabHidden;
    if (document[hideName])
        tabHidden = true;
    else
        tabHidden = false;

    if (tabHidden && timersActive) {
        g.hideStamp = new Date().getTime();
        clearIntervalTimers();
        if (!globeIndex) {
            //timeoutFetch();
        }

        replay_was_active = replay.playing;
        if (replay.playing) {
            playReplay(false);
        }
    }

    // tab is no longer hidden
    if (!tabHidden && !timersActive) {
        loadFinished && jQuery("#timers_paused").css('display', 'none');
        globeRateUpdate();
        if (heatmap || replay || globeIndex || pTracks) {
            noLongerHidden();
        } else {
            refreshHistory();
        }
    }
}
// Restaura timers y refresca cuando la pestaña vuelve a estar activa
function noLongerHidden() {
    active();
    setIntervalTimers();

    jQuery("#loader").hide();

    refresh();

    if (replay_was_active) {
        playReplay(true);
    }

    if (showTrace)
        return;
    if (heatmap)
        return;

    if (!haveTraces)
        return;

    let count = 0;
    if (multiSelect && !SelectedAllPlanes) {
        for (let i = 0; i < g.planesOrdered.length; ++i) {
            let plane = g.planesOrdered[i];
            if (plane.selected) {
                getTrace(plane, plane.icao, {});
                if (count++ > 20)
                    break;
            }
        }
    } else if (SelectedPlane) {
        getTrace(SelectedPlane, SelectedPlane.icao, {});
    }
}

let hideName;
// Configura el detector de visibilidad de la pestaña (API Page Visibility)
function initVisibilityChange() {
    // Set the name of the hidden property and the change event for visibility
    let visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hideName = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hideName = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hideName = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || hideName === undefined) {
        console.log("hidden tab handler requires a browser that supports the Page Visibility API.");
    } else {
        // Handle page visibility change
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
    handleVisibilityChange();
}
// for debugging visibilitychange:
// Forzar estado "oculto" para pruebas
function testHide() {
    Object.defineProperty(window.document, 'hidden', { get: function () { return true; }, configurable: true });
    Object.defineProperty(window.document, 'visibilityState', { get: function () { return 'hidden'; }, configurable: true });
    window.document.dispatchEvent(new Event('visibilitychange'));
}
// Forzar estado "visible" para pruebas
function testUnhide() {
    Object.defineProperty(window.document, 'hidden', { get: function () { return false; }, configurable: true });
    Object.defineProperty(window.document, 'visibilityState', { get: function () { return 'visible'; }, configurable: true });
    window.document.dispatchEvent(new Event('visibilitychange'));
}
// Busca el avión más cercano a la posición de referencia y lo selecciona automáticamente
function autoSelectClosest() {
    if (!loadFinished)
        return;
    let closest = null;
    let closestDistance = null;
    checkMovement();
    for (let key in g.planesOrdered) {
        const plane = g.planesOrdered[key];
        if (!plane.visible)
            continue;
        if (!closest)
            closest = plane;
        if (plane.position == null || plane.seen_pos > 20)
            continue;
        let refLoc = [CenterLon, CenterLat];
        if (autoselectCoords && autoselectCoords.length == 2) {
            refLoc = [autoselectCoords[1], autoselectCoords[0]];
        }
        const dist = ol.sphere.getDistance(refLoc, plane.position);
        if (dist == null || isNaN(dist))
            continue;
        if (closestDistance == null || dist < closestDistance) {
            closestDistance = dist;
            closest = plane;
        }
    }
    if (!closest)
        return;
    selectPlaneByHex(closest.icao, { noDeselect: true, follow: FollowSelected, });
}
// Activa el autoselect en un intervalo periódico
function setAutoselect() {
    clearInterval(timers.autoselect);
    if (!autoselect)
        return;
    timers.autoselect = window.setInterval(autoSelectClosest, 5000);
    autoSelectClosest();
}
// Construye enlace para buscar matrícula en ANAC (Brasil) si aplica
function registrationLink(plane) {
    if (plane.country === 'Brazil') {
        return `https://sistemas.anac.gov.br/aeronaves/cons_rab_resposta_en.asp?textMarca=${plane.registration}`;
    } else {
        return '';
    }
}


//simple jquery plugin to only update the text when it changes
jQuery.fn.updateText = function (text) {
    this.text() !== String(text) && this.text(text);
}
// Añade ceros a la izquierda a un número (formato simple)
function zeroPad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

// Converts "hiccup"-style structures (https://github.com/weavejester/hiccup)
// to XML.
// Convierte estructura tipo "hiccup" a XML (usado para exportar KML)
function hiccup(node) {
    if (Array.isArray(node)) {
        const [tag, attribs, ...children] = node;
        let attribStrings = [];
        for (const prop in attribs) {
            if (!attribs.hasOwnProperty(prop) || attribs[prop] === undefined) {
                continue;
            }
            attribStrings.push(`${prop}="${attribs[prop]}"`);
        }
        let xml = `<${tag} ${attribStrings.join(' ')}>`;
        for (const child of children) {
            xml += hiccup(child);
        }
        xml += `</${tag}>\n`;
        return xml;
    } else {
        return '' + node;
    }
}

// Prompts a browser to download a data: URL.
// Forzar descarga de un archivo generado en la página (data URL)
function download(name, contentType, data) {
    var link = document.createElement("a");
    link.download = name;
    link.href = 'data:' + contentType + ',' + encodeURIComponent(data);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Genera nombre base para exportar múltiples aeronaves (por matrícula o hex)
function baseExportFilenameForAircrafts(aircrafts) {
    return aircrafts.map((a) => (a.registration || a.icao).toUpperCase()).join('-');
}

// Returns an array of {pos, alt, ts} for an aircraft.
// Prepara una lista de coordenadas/altitudes/tiempos para exportar la traza de un avión
function coordsForExport(plane) {
    let coords = [];
    let numSegs = plane.track_linesegs.length;
    let segs = plane.track_linesegs;
    let runningAverage = 0;
    let lastTimestamp = 0;
    let delta;
    //console.log(kmlStyle);
    if (kmlStyle == 'geom_avg') {
        //console.log('averaging');
        const avgWindow = 8;
        for (let i = 0; i < numSegs; i++) {
            const seg = segs[i];
            const geom = seg.alt_geom;
            const baro = seg.alt_real;
            let geomOffset = null;
            if (!seg.ground && baro != null && geom != null) {
                seg.geomOffset = geom - baro;
                delta = (seg.geomOffset - runningAverage);
                if (delta <= 50) {
                    runningAverage += delta * Math.min(1, (seg.ts - lastTimestamp) / avgWindow);
                } else {
                    runningAverage = seg.geomOffset;
                }
                seg.geomOffAverage = runningAverage;
                lastTimestamp = seg.ts;
            }
        }
        lastTimestamp = 1e12;
        for (let i = numSegs - 1; i >= 0; i--) {
            const seg = segs[i];
            const geom = seg.alt_geom;
            const baro = seg.alt_real;
            let geomOffset = null;
            if (seg.geomOffset != null) {
                delta = (seg.geomOffset - runningAverage);
                if (delta <= 50) {
                    runningAverage += delta * Math.min(1, (lastTimestamp - seg.ts) / avgWindow);
                } else {
                    runningAverage = seg.geomOffset;
                }
                //console.log(seg.geomOffAverage + ' ' + runningAverage);
                seg.geomOffAverage = (seg.geomOffAverage + runningAverage) / 2;
                lastTimestamp = seg.ts;
            }
        }
    }
    for (let i = 0; i < numSegs; i++) {
        const seg = segs[i];
        const pos = seg.position;
        if (pos) {
            let alt = null;
            const baro = seg.alt_real;
            const geom = seg.alt_geom;
            const geomOffAverage = seg.geomOffAverage;
            let using_baro = false;
            if (kmlStyle == 'geom_avg' && geomOffAverage != null) {
                const betterGeom = baro + geomOffAverage;
                alt = Math.round(betterGeom * 0.3048); // convert ft to m
            } else if (kmlStyle != 'baro' && geom != null) {
                alt = Math.round(geom * 0.3048); // convert ft to m
            } else if (kmlStyle == 'baro' && baro != null && baro != 'ground') {
                alt = Math.round(baro * 0.3048);
                using_baro = true;
            }
            if (seg.ground) {
                alt = "ground";
            } else if (alt != null && egmLoaded && !using_baro) {
                // alt is in meters at this point
                alt = Math.round(egm96.ellipsoidToEgm96(pos[1], pos[0], alt));
            }

            const ts = new Date(seg.ts * 1000.0);
            if (alt == null) {
                console.log(`Skipping, no altitude: ${i} ${pos} ${ts}`);
                continue;
            }
            //console.log(`exporting coord: ${i} ${pos} ${alt} ${ts}`);
            coords.push({ pos: pos, alt: alt, ts: ts });
        } else {
            console.log(`Skipping ${i}`);
        }
    }
    return coords;
}

// We use this to give each aircraft a different color track in a
// multi-select export scenario. From colorbrewer, but I moved the red
// to be first.
// Paleta de colores usada para colorear las trazas al exportar (lista corta de colores)
const EXPORT_RGB_COLORS = [
    'e31a1c',
    'a6cee3',
    '1f78b4',
    'b2df8a',
    '33a02c',
    'fb9a99',
    'fdbf6f',
    'ff7f00',
    'cab2d6',
    '6a3d9a',
    'ffff99',
    'b15928'
];

// Converts "rrggbb" colors to KML format, "aabbggrr".
// Convierte un color RGB (hex rrggbb) al formato que entiende KML (aabbggrr)
// (sirve para poner colores correctos en archivos KML)
let RGBColorToKMLColor = function (c) {
    return 'ff' + c.substring(4, 6) + c.substring(2, 4) + c.substring(0, 2);
}

// Returns an array of selected planes, ordered by registration-or-ICAO.
// Devuelve la lista de aviones actualmente seleccionados, ordenada por matrícula o hex
function selectedPlanes() {
    const planes = [];
    for (let key in SelPlanes) {
        let plane = SelPlanes[key];
        if (plane.selected) {
            planes.push(plane);
        }
    }
    planes.sort((a, b) => {
        const keyA = (a.registration || a.icao).toUpperCase();
        const keyB = (b.registration || b.icao).toUpperCase();
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    return planes;
}

// Exports currently selected aircraft as KML.
// Variables para controlar la carga de la librería EGM (corrección de altitudes)
let egmScript = null;
let egmLoaded = false;
// Carga la librería que convierte altitudes geométricas a EGM96 (si se necesita)
function loadEGM() {
    if (egmScript) {
        return null;
    }
    egmScript = document.createElement('script');
    egmScript.src = "libs/egm96-universal-1.1.0.min.js";
    egmScript.addEventListener('load', function () {
        egmLoaded = true;
    });
    document.body.appendChild(egmScript);
    return egmScript;
}
// Ajusta una altitud geométrica usando EGM96 si está habilitado (devuelve alt corregida)
function adjust_geom_alt(alt, pos) {
    if (geomUseEGM && egmLoaded) {
        if (alt == null) {
            return alt;
        }
        return egm96.ellipsoidToEgm96(pos[1], pos[0], alt * 0.3048) / 0.3048;
    } else {
        return alt;
    }
}
let kmlStyle = '';
// Exporta las aeronaves seleccionadas a KML; soporta varias opciones de altitud
function exportKML(altStyle) {
    if (altStyle) {
        kmlStyle = altStyle;
    }
    if (!egmLoaded) {
        let egm = loadEGM();
        if (egm) {
            egm.addEventListener('load', function () {
                exportKML();
            });
        }
        return;
    }

    const planes = selectedPlanes();
    const folders = [];
    for (let planeIndex = 0; planeIndex < planes.length; planeIndex++) {
        const plane = planes[planeIndex];
        let folder = ["Folder", {},
            ["name", {}, `${(plane.registration || plane.icao).toUpperCase()} track`]
        ];
        const coords = coordsForExport(plane);
        let sections = [];
        let currentSection = null;
        let lastGround = null;
        let lastC = null;
        for (let i in coords) {
            const c = coords[i];
            const ground = (c.alt == "ground");
            if (ground !== lastGround) {
                // when changing between airborne and ground, create new section
                if (lastC && currentSection) {
                    // double up last coordinate to work around strange google earth transparency
                    currentSection.coords.push(lastC);
                }
                currentSection = { ground: ground, coords: [] };
                sections.push(currentSection);
            }
            lastGround = ground;
            if (ground) {
                c.alt = 0; // set KML altitude to zero
            }
            currentSection.coords.push(c);
            lastC = c;
        }
        if (lastC && currentSection) {
            // double up last coordinate to work around strange google earth transparency
            currentSection.coords.push(lastC);
        }
        for (let i in sections) {
            console.log("section " + i);
            const s = sections[i];
            const coords = s.coords;
            const ground = s.ground;
            const whenObjs = coords.map((c) => {
                const date = `${c.ts.getUTCFullYear()}-${zeroPad(c.ts.getUTCMonth() + 1, 2)}-${zeroPad(c.ts.getUTCDate(), 2)}`;
                const time = `T${zeroPad(c.ts.getUTCHours(), 2)}:${zeroPad(c.ts.getUTCMinutes(), 2)}:${zeroPad(c.ts.getUTCSeconds(), 2)}.${zeroPad(c.ts.getUTCMilliseconds(), 3)}Z`;
                return ["when", {}, date + time];
            });
            const coordObjs = coords.map((c) => {
                return ["gx:coord", {}, `${c.pos[0]} ${c.pos[1]} ${c.alt}`];
            });
            // splice together the xml track with / without altitude mode
            // clamptoground is google earth default while other programs error on having that option set specifically
            // so let google earth default to clamp to ground for ground track
            let xmlTrack = ["gx:Track", {}];
            if (!ground) {
                xmlTrack.push(["altitudeMode", {}, "absolute"]);
            }
            xmlTrack = xmlTrack.concat([
                ["extrude", {}, ground ? "0" : "1"],
                ...whenObjs,
                ...coordObjs
            ]);
            folder.push(
                ["Placemark", {},
                    ["name", {}, (plane.registration || plane.icao).toUpperCase()],
                    ["Style", {},
                        ["LineStyle", {},
                            ["color", {}, RGBColorToKMLColor(EXPORT_RGB_COLORS[planeIndex % EXPORT_RGB_COLORS.length])],
                            ["width", {}, 4]
                        ],
                        ["IconStyle", {},
                            ["Icon", {},
                                ["href", {}, "http://maps.google.com/mapfiles/kml/shapes/airports.png"]
                            ]
                        ]
                    ],
                    xmlTrack
                ]
            );
        }
        folders.push(folder);
    }
    const filename = baseExportFilenameForAircrafts(planes);
    const prologue = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlObj = ["kml", {
        "xmlns": "http://www.opengis.net/kml/2.2",
        "xmlns:gx": "http://www.google.com/kml/ext/2.2"
    },
        ["Folder", {},
            ...folders
        ]
    ];
    const xml = prologue + hiccup(xmlObj);
    let styleName = '';
    if (kmlStyle == 'geom') { styleName = 'EGM96'; };
    if (kmlStyle == 'geom_avg') { styleName = 'EGM96_avg'; };
    if (kmlStyle == 'baro') { styleName = 'press_alt_uncorrected'; };
    //console.log(kmlStyle + ' ' + styleName);
    download(
        filename + '-track-' + styleName + '.kml',
        'application/vnd.google-earth.kml+xml',
        xml);
}
// Borra las trazas almacenadas en memoria para todos los aviones
function deleteTraces() {
    for (let i in g.planesOrdered) {
        let plane = g.planesOrdered[i];
        delete plane.recentTrace;
        delete plane.fullTrace;
    }
}
// Controla si las imágenes de aviones se muestran en la interfaz según APIs disponibles
function setPictureVisibility() {
    showPictures = planespottersAPI || planespottingAPI;
    if (showPictures) {
        jQuery('#photo_container').removeClass('hidden');
    } else {
        jQuery('#photo_container').addClass('hidden');
    }
    if (planespottersLinks && !showPictures) {
        jQuery('#photoLinkRow').removeClass('hidden');
    } else {
        jQuery('#photoLinkRow').addClass('hidden');
    }
}

// just an idea, unused
// Objeto de ejemplo con información para mostrar (no usado activamente)
let infoBits = {
    type: {
        head: 'Type:',
        title: '4 character ICAO type code (i.e.: A320,B738,G550)',
        value: function (plane) { return plane.icaoType || 'n/a'; },
    },
};
// Indica si la búsqueda de ubicación por navegador está permitida en este contexto
function geoFindEnabled() {
    return (!disableGeoLocation && !SiteOverride && (globeIndex || uuid || askLocation) && (window && window.location && window.location.protocol == 'https:'));
}
// Imprime en consola una traza para depuración (formato interno)
function _printTrace(trace) {
    for (let i = 0; i < trace.length; i++) {
        const state = trace[i];
        const timestamp = state[0];
        let stale = state[6] & 1;
        const leg_marker = state[6] & 2;
        console.log(zuluTime(new Date(timestamp * 1000)) + ' ' + (state[1] + ',' + state[2]).padStart(26, ' ') + ' ' + String(state[3]).padStart(6, ' ') + ' ' + state[6]);
    }
}
// Muestra las trazas completas y recientes del avión seleccionado en la consola
function printTrace() {
    console.log('full trace');
    _printTrace(SelectedPlane.fullTrace.trace);
    console.log('recent trace');
    _printTrace(SelectedPlane.recentTrace.trace);
}
// Copia el enlace de compartir al portapapeles y marca tiempo/avión copiado
function copyShareLink() {
    navigator.clipboard.writeText(shareLink);

    copyLinkTime = new Date().getTime();
    copiedIcao = SelectedPlane.icao;
    setSelectedIcao();
}

let copyLinkTime = 0;
let copiedIcao = null;
// Actualiza la visualización del identificador ICAO/Hex del avión seleccionado, y añade enlace para copiar
function setSelectedIcao() {
    const selected = SelectedPlane;
    if (selected.icao == selIcao && copiedIcao == null) {
        return;
    }
    selIcao = selected.icao;
    let hex_html = "<span style='font-family: monospace;' class=identSmall>Hex:" + NBSP + selected.icao.toUpperCase() + "</span>";
    if (globeIndex || shareBaseUrl) {
        if (copiedIcao && (copiedIcao != selected.icao || new Date().getTime() - copyLinkTime > 2000)) {
            copiedIcao = null;
        }
        let copy_link_text = (copiedIcao != null) ? "Copied" : ("Copy" + NBSP + "Link");
        let icao_link = "<span  class=identSmall><a class='link identSmall' target=\"_blank\" href=\"" + shareLink +
            "\" onclick=\"copyShareLink(); return false;\">" + copy_link_text + "</a></span>";
        hex_html = hex_html + NBSP + NBSP + NBSP + icao_link;
    }
    jQuery('#selected_icao').html(hex_html);

    jQuery('a.identSmall').prop('href', shareLink);
}
// Ajustes visuales según el tipo de mapa seleccionado (modifica atenuado y contraste)
function mapTypeSettings() {
    if (MapType_tar1090.startsWith('maptiler_sat') || MapType_tar1090.startsWith('maptiler_hybrid')) {
        layerDimFactor = 0.25;
    } else if (MapType_tar1090 == 'esri') {
        layerDimFactor = 0.5;
    } else if (MapType_tar1090 == 'gibs') {
        layerDimFactor = 0.5;
    } else if (MapType_tar1090.startsWith('carto_raster')) {
        layerDimFactor = 0.70;
        layerExtraContrast = 0.6;
    } else if (MapType_tar1090.startsWith('carto_light')) {
        layerDimFactor = 0.80;
        layerExtraContrast = 0.2;
    } else if (MapType_tar1090.startsWith('carto_dark')) {
        layerDimFactor = 0.25;
        layerExtraContrast = 0.05;
    } else {
        layerDimFactor = 1;
        layerExtraContrast = 0;
    }
}
// Devuelve el área visible del mapa ampliada por un factor (útil para cálculo de peticiones)
function getViewOversize(factor) {
    factor || (factor = 1);
    let mapSize = OLMap.getSize();
    let size = [mapSize[0] * factor, mapSize[1] * factor];
    return myExtent(OLMap.getView().calculateExtent(size));
}
// Devuelve el área de renderizado teniendo en cuenta un extra en píxeles
function getRenderExtent(extra) {
    extra || (extra = 0);
    const mapSize = OLMap.getSize();
    const over = renderBuffer + extra;
    const size = [mapSize[0] + over, mapSize[1] + over];
    return myExtent(OLMap.getView().calculateExtent(size));
}
// Construye la caja de petición (lat/lon min/max) usada para pedir datos al servidor
function requestBoxString() {
    if (!mapIsVisible && lastRequestBox) {
        return lastRequestBox;
    }
    let extent = getRenderExtent(80);
    let minLon = extent.minLon.toFixed(6);
    let maxLon = extent.maxLon.toFixed(6);
    if (Math.abs(extent.extent[2] - extent.extent[0]) > 40075016) { // all longtitudes in view
        minLon = -180, maxLon = 180;
    }
    return `${extent.minLat.toFixed(6)},${extent.maxLat.toFixed(6)},${minLon},${maxLon}`;
}
// Muestra advertencia en la UI si el agregador está en modo 'inaccurate'
if (aggregator && window.location.hostname.startsWith('inaccurate')) {
    jQuery('#inaccurate_warning').removeClass('hidden');
    document.getElementById('inaccurate_warning').innerHTML = `
<br>
This map includes inaccurate / very approximate positions, errors of 200 nmi or more are not unusual.
<br>
If no ADS-B / MLAT info is available but at least 1 receiver is receiving ModeS data from a hex, the aircraft is placed where the receiving station on average receives planes which do have a location.
<br>
Please add a disclaimer to any screenshots of this website or better yet just report that an aircraft was spotted in the approximate area WITHOUT using screenshots.
<br>
<br>
        `;

}
// Ajusta contadores de actualización (uso manual, debug)
function getn(n) {
    limitUpdates = n; RefreshInterval = 0; fetchCalls = 0;
}
// Maneja el formulario/acción para poner QNH estándar (1013.25)
function onAltimeterSetStandard(e) {
    e.preventDefault();
    jQuery("#altimeter_input").val(1013.25);
    onAltimeterChange(e);
}
// Usa la QNH del avión seleccionado para rellenar el input del altímetro
function onAltimeterSetSelected(e) {
    e.preventDefault();
    if (!SelectedPlane || !SelectedPlane.nav_qnh) {
        return;
    }
    jQuery("#altimeter_input").val(SelectedPlane.nav_qnh);
    onAltimeterChange(e);
}
// Aplica la QNH introducida en el formulario a las correcciones de altitud y actualiza la UI
function onAltimeterChange(e) {
    e.preventDefault();
    jQuery("#altimeter_input").blur();
    let altimeter = parseFloat(jQuery("#altimeter_input").val().trim());

    if (altimeter < 100) {
        // assume inHg, convert to mbar
        baroCorrectQNH = 33.8639 * altimeter;
    } else {
        // assume mbar / hPa
        baroCorrectQNH = altimeter;
    }

    remakeTrails();
    refreshSelected();
    refreshFeatures();
    TAR.planeMan.redraw();
    refresh();
}

// Using formula from: https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
// See also: https://en.wikipedia.org/wiki/Pressure_altitude
// Inverse equation on wikipedia seems imprecise,
// used the the weather.gov pdf and inverted the equation myself
// This uses ISA atmosphere (should be the same as altimeters in planes)
// Convierte altitud barométrica según QNH activo (devuelve alt corregida)
function adjust_baro_alt(alt) {
    if (!baroUseQNH || alt == null || alt == "ground") {
        return alt;
    }
    let station_pressure = Math.pow(1 - alt / 145366.45, 5.2553026) * 1013.25;

    let res = (1 - Math.pow(station_pressure / baroCorrectQNH, 0.190284)) * 145366.45;
    return res;
}
// Consulta al servidor rates/config del globo si procede y actualiza variables locales
function globeRateUpdate() {
    if (aggregator) {
        dynGlobeRate = true;
        if (0) {
            const cookieExp = getCookie('asdf_id').split('_')[0];
            const ts = new Date().getTime();
            if (!cookieExp || cookieExp < ts + 3600 * 1000)
                setCookie('adsbx_sid', ((ts + 2 * 86400 * 1000) + '_' + Math.random().toString(36).substring(2, 15)), 2);
        }
    }
    if (dynGlobeRate) {
        return jQuery.ajax({ url: '/globeRates.json', cache: false, dataType: 'json', }).done(function (data) {
            if (data.simload != null)
                globeSimLoad = data.simload;
            if (data.refresh != null && globeIndex)
                RefreshInterval = data.refresh;
        });
    } else {
        return jQuery.Deferred().resolve();
    }
}
globeRateUpdate();



parseURLIcaos();
initialize();
// Actualiza el reloj UTC visible en la interfaz cada segundo
function updateTime() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    document.getElementById('utc_clock').innerHTML = `${h}:${m} <span>UTC</span>`;
}
setInterval(updateTime, 1000);
updateTime();

// Función para plegar/desplegar los menús de información en el sidebar izquierdo
document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.section-toggle');

    toggles.forEach(btn => {
        const targetId = btn.dataset.target;
        const block = document.getElementById(targetId) || btn.closest('.sectionTitle')?.nextElementSibling;
        if (!block) return;

        const icon = btn.querySelector('.section-toggle-icon') || btn;

        // Guarda paddings originales
        const initialPadTop = getComputedStyle(block).paddingTop;
        const initialPadBottom = getComputedStyle(block).paddingBottom;
        const collapsedPad = '0.2rem';

        block.style.overflow = 'hidden';
        block.style.transition = 'height 220ms ease, opacity 220ms ease';
        block.style.height = '0px';
        block.style.opacity = '0';
        block.style.paddingTop = collapsedPad;
        block.style.paddingBottom = collapsedPad;
        block.style.display = 'block';
        block.style.boxSizing = 'border-box';

        const setState = (expanded) => {
            btn.setAttribute('aria-expanded', expanded);
            if (icon) icon.textContent = expanded ? '▼' : '▶';

            const startHeight = block.scrollHeight;
            if (expanded) {
                block.style.paddingTop = initialPadTop;
                block.style.paddingBottom = initialPadBottom;
                const targetHeight = startHeight > 0 ? startHeight : 'auto';

                block.style.height = startHeight + 'px';
                block.style.opacity = '1';
                const onEnd = (e) => {
                    if (e.propertyName === 'height') {
                        block.style.height = 'auto';
                        block.removeEventListener('transitionend', onEnd);
                    }
                };
                block.addEventListener('transitionend', onEnd);
            } else {
                const currentHeight = block.scrollHeight;
                block.style.height = currentHeight + 'px';
                block.style.opacity = '0';
                requestAnimationFrame(() => {
                    block.style.height = '0px';
                    block.style.paddingTop = collapsedPad;
                    block.style.paddingBottom = collapsedPad;
                });
            }
        };

        setState(false);

        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            setState(!expanded);
        });
    });
});
// Limpia y resetea todo lo relacionado con el cálculo de distancia entre aviones
function resetDistanceCalculation() {
    selectedPlanesForDistance = [];
    planesMissingSince = null;

    if (distanceUpdateInterval) {
        clearInterval(distanceUpdateInterval);
        distanceUpdateInterval = null;
    }

    if (distanceLineFeature) {
        distanceLineLayer.getSource().removeFeature(distanceLineFeature);
        distanceLineFeature = null;
    }

    if (distanceOverlay) {
        OLMap.removeOverlay(distanceOverlay);
        distanceOverlay = null;
    }

    // Limpieza manual por ID por si OpenLayers falló
    let extraDiv = document.getElementById('distance-label-tag');
    if (extraDiv) extraDiv.remove();

    // Limpiar múltiples líneas y overlays si existen (modo 1A_nB)
    if (distanceLineFeaturesMap && distanceLineFeaturesMap.size) {
        for (const f of distanceLineFeaturesMap.values()) {
            try { distanceLineLayer.getSource().removeFeature(f); } catch (_) { }
        }
        distanceLineFeaturesMap.clear();
    }
    if (distanceOverlaysMap && distanceOverlaysMap.size) {
        for (const ov of distanceOverlaysMap.values()) {
            try { OLMap && OLMap.removeOverlay(ov); } catch (_) { }
        }
        distanceOverlaysMap.clear();
    }

    // Reset de selección A en modos multi
    selectedPlaneA = null;
    // Limpiar mapas de señal perdida
    ppMissingSince && ppMissingSince.clear();
    ppRemoved && ppRemoved.clear();
    // Limpiar pares y buffer
    pairMap && pairMap.clear();
    pairOrder = [];
    pairBuffer = [];
}

function DistanceBetweenPlanes() {
    // Cambiamos el estado (On/Off)
    distanceBetweenPlanesMode = !distanceBetweenPlanesMode;

    // Limpiamos todo lo anterior (líneas, overlays, intervalos y el array)
    resetDistanceCalculation();

    // Cambiamos el color del botón en la UI
    buttonActive('#D', distanceBetweenPlanesMode);
}


// Función que coloca una imagen genérica al selected_infoblock si el avión no tiene imagen
(function () {
    const fallbackSrc = 'images/no-plane.jpg';
    const container = document.getElementById('selected_photo');
    if (!container) return;

    function bindError(img) {
        if (!img || img.dataset.fallbackBound) return;
        img.addEventListener('error', () => {
            if (!img.src.endsWith('no-plane.jpg')) img.src = fallbackSrc;
        });
        img.dataset.fallbackBound = '1';
    }

    function ensurePhoto() {
        const img = container.querySelector('img');
        if (!img) {
            const el = new Image();
            el.src = fallbackSrc;
            el.alt = 'No photo available';
            el.loading = 'lazy';
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
            el.style.display = 'block';
            container.innerHTML = '';
            container.appendChild(el);
        } else {
            bindError(img);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensurePhoto, { once: true });
    } else {
        ensurePhoto();
    }

    new MutationObserver(ensurePhoto).observe(container, { childList: true, subtree: true });
})();