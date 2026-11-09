// Some global variables are defined in early_2fb3798b27b8a81aea55bad8e31f020b.js
// early_2fb3798b27b8a81aea55bad8e31f020b.js takes care of getting some history files while the html page and
// some javascript libraries are still loading, hopefully speeding up loading

"use strict";

// ***** GARANTIZAR ACTUALIZACIÓN DE TEXTOS AL TRADUCIR *****
jQuery.fn.updateText = function (text) {
    this.text() !== String(text) && this.text(text);
    return this;
}

g.planes = {};
g.planesOrdered = [];
g.route_cache = [];
g.route_check_todo = {};
g.route_check_in_flight = false;
g.route_next_lookup = 0;
g.route_last_lookup = 0;

g.mapOrientation = mapOrientation;

// Define our global variables
let tabHidden = false;
let webgl = false;
let webglFeatures = new ol.source.Vector();
let webglLayer;
let OLMap = null;
let OLProj = null;
let OLProjExtent = null;
let PlaneIconFeatures = new ol.source.Vector();
let trailGroup = new ol.Collection();
let siteCircleLayer;
let siteCircleFeatures = new ol.source.Vector();
let locationDotLayer;
let locationDotFeatures = new ol.source.Vector();
let iconLayer;
let trailLayers;
let heatFeatures = [];
let heatFeaturesSpread = 1024;
let heatLayers = [];
let realHeatFeatures = new ol.source.Vector();
let realHeat;
let iconCache = {};
let addToIconCache = [];
let lineStyleCache = {};
let replayPlanes = {};
let PlaneFilter = {};
let SelectedPlane = null;
let sp = null;
let SelPlanes = [];
let SelectedAllPlanes = false;
let HighlightedPlane = null;
let FollowSelected = false;
let followPos = [];

let replayEditLock = false;
let replayPendingJump = false;
// ***** EXPONER FUNCIÓN QUE BLOQUEA EL REPLAY AL EDITAR *****
Object.defineProperty(window, 'replayEditLock', {
    get() { return replayEditLock; },
    set(v) { replayEditLock = v; },
    configurable: true,
});
// ***** EXPONER REPLAY PARA MÓDULOS EXTERNOS *****
Object.defineProperty(window, 'replay', {
    get() { return (typeof replay !== 'undefined') ? replay : null; },
    configurable: true,
});
let replayHourValue = 0;
let replayMinuteValue = 0;

// ***** DISTANCIA AERONAVE-AERONAVE *****
let distanceBetweenPlanesMode = false;
let selectedPlanesForDistance = [];
let distanceLineLayer = null;
let distanceLineFeature = null;
let distanceOverlay = null;
let distanceUpdateInterval = null;
let distance1A1BHidden = false;
let pairHiddenState = new Map();
let planeDistanceModeType = '1A1B';
const PP_MODES = ['1A1B', 'pairs'];
let distanceLineFeaturesMap = new Map();
let distanceOverlaysMap = new Map();
let selectedPlaneA = null;
let pairMap = new Map();
let pairOrder = [];
let pairBuffer = [];
const planePointFeatures = new Map();
const planePointOverlays = new Map();
let pointNumberSourceAA = null;
let pointNumberSourceTA = null;
let pointNumberSourceTT = null;
let pointNumberLayerAA = null;
let pointNumberLayerTA = null;
let pointNumberLayerTT = null;
let planePointSourceAA = null;
let planePointSourceTA = null;
let planePointLayerAA = null;
let planePointLayerTA = null;
let ppMissingSince = new Map();
let ppRemoved = new Set();

// ***** DISTANCIA TIERRA-AERONAVE *****
let distanceToGroundMode = false;
let distanceGroundOverlay = null;
let distanceGroundUpdateInterval = null;
let selectedPlaneForGround = null;
let groundPointCoord = null;
let groundPointSource = null;
let groundPointLayer = null;
let groundToPlaneLineLayer = null;
let groundToPlaneLineSource = null;
let groundToPlaneLineFeature = null;
let distanceToGroundModeType = '1A1B';
let planesForGround = [];
let groundPoints = [];
const groundPlaneFeaturesByHex = new Map();
const groundPlaneOverlaysByHex = new Map();
const groundPlaneFeatures = new Map();
const groundPlaneOverlays = new Map();
let taPairs = [];
const groundPointFeaturesByCoord = new Map();
let taPendingPlaneHex = null;
let taPendingGround = null;
const TA_MODES = ['1A1B', '1A_nB', 'nA_1B', 'nA_nB'];
const groundPlaneMissingSince = new Map();
const groundPlaneRemoved = new Set();
let groundPlaneHiddenState = new Map();
let distanceGuideEl = null;
let taFirstPointType = null;
const hasGroundFirst = groundPoints.length > 0 || groundPointCoord;
const hasPlaneFirst = planesForGround.length > 0;

// ***** DISTANCIA TIERRA-TIERRA *****
let groundToGroundMode = false;
let groundToGroundModeType = '1A1B';
const GG_MODES = ['1A1B', '1A_nB', 'nA_nB'];
let ggPointA = null;
let ggPointsB = [];
let ggPairs = [];
let ggPendingA = null;
let ggLineSource = null;
let ggLineLayer = null;
let ggPointSource = null;
let ggPointLayer = null;
const ggLineFeatures = new Map();
const ggOverlays = new Map();
let ggUpdateInterval = null;
let ggHiddenState = new Map();
let ggMissingSince = new Map();
let ggRemoved = new Set();
let ggPairMap = new Map();
let ggPairOrder = [];
const firData = {};
let ggNumberSource = null;
let ggNumberLayer = null;

// ***** ELEVACIÓN TIERRA-TIERRA *****
let elevationMode = false;
let elevationPointSource = null;
let elevationPointLayer = null;
let elevationLineSource = null;
let elevationLineLayer = null;
let lastPanoramaData = null;
let lastPanoramaTotalNm = null;
let panoramaResizeObs = null;
let elevationBusy = false;
let elevationNumberSourceGG = null;
let elevationNumberLayerGG = null;
// ***** ELEVACIÓN TIERRA-AERONAVE *****
let elevationAnchor = null;
let elevationGroundAircraftMode = false;
let elevationGroundAircraftModeType = 'aircraft';
const ELEVATION_GA_MODES = ['aircraft', 'ground_aircraft'];
let elevationGroundAnchor = null;
let elevationAircraftHex = null;
let elevationPendingGround = null;
let elevationPendingAircraftHex = null;
let elevationGAAircraftWasFirst = false;
let elevationGroundAircraftUpdateInterval = null;
let elevationCountdownInterval = null;
let elevationCountdownValue = 0;
let elevationNumberSourceGA = null;
let elevationNumberLayerGA = null;

// ***** INDICADOR DE ZOOM *****
let zoomIndicatorBaseline = null;
let ZOOM_BASELINE_KEY = 'zoomIndicatorBaseline_v2';

// ***** MARCADOR DE ELEMENTOS DE BÚSQUEDA *****
let airportMarkerFeature = null;
let airportMarkerLayer = null;
let airportMarkerTimeout = null;
let airportFadeInterval = null;

// ***** AVIONES DE INTERÉS *****
let columns = [];
let starredAircraft = new Set();
let starredListCollapsed = false;

// ***** CONFIGURACIONES COMO VENTANA FLOTANTE *****
let settingsWindowState = {
    isMaximized: false,
    isMinimized: false,
    savedLeft: null,
    savedTop: null,
    savedWidth: null,
    savedHeight: null
};
let settingsResizeHandle = null;

let appReady = false;

let loadStart = new Date().getTime();
let mapResizeTimeout;
let pointerMoveTimeout;
let iconSize = 1;
let debugTracks = false;
let verboseUpdateTrack = false;
let debugAll = false;
let trackLabels = false;
let multiSelect = false;
let uat_data = null;
g.enableLabels = false;
g.extendedLabels = 0;
let mapIsVisible = true;
let onlyMilitary = false;
let onlySelected = false;
let debug = false;
let debugJump = false;
let jumpTo = null;
let noMLAT = false;
let noVanish = false;
let filterTracks = false; // altitude filter: don't filter planes but rather their tracks by altitude
let planesMissingSince = null;
let refreshId = 0;
let lastFetch = 0;
let actualOutline = {};
let globeIndexNow = {};
let globeIndexDist = {};
let globeIndexSpecialLookup = {};
let globeTilesViewCount = 0;
let globeTableLimitBase = 80;
let globeTableLimit = 80;
let fetchCounter = 0;
let lastGlobeExtent;
let lastRenderExtent;
let pendingFetches = 0;
let firstFetch = true;
let debugCounter = 0;
let pathName = window.location.pathname.replace(/\/+/, '/') || "/";
let sourcesFilter = null;
// ***** FILTRO POR RECEPTOR *****
let receiverFilter = null;
let sources = ['adsb', ['uat', 'adsr'], 'mlat', 'tisb', 'modeS', 'other', 'adsc', 'ais'];
let flagFilter = null;
let flagFilterValues = ['military', 'pia', 'ladd'];
let showTrace = false;
let showTraceExit = false;
let showTraceWasIsolation = false;
let showTraceTimestamp = null;
let traceDate = null;
let traceDateString = null;
let traceOpts = {};
let icaoParam = null;
let newWidth = lineWidth;
let SiteOverride = (SiteLat != null && SiteLon != null);
let onJumpInput = null;
let labelFill = null;
let blackFill = null;
let labelStroke = null;
let labelStrokeNarrow = null;
let bgFill = null;
let legSel = -1;
let geoMag = null;
let solidT = false;
let lastActive = new Date().getTime();
let enableOverlays = [];
let halloween = false;
let noRegOnly = false;
let triggerRefresh = 0;
let firstDraw = true;
let darkerColors = false;
let autoselect = false;
let nogpsOnly = false;
let spritesDataURL = null;
let trace_hist_only = false;
let traces_high_res = false;
let show_rId = true;
let labels_top = false;
let lockDotCentered = false;
let overrideMapType = null;
let layerMoreContrast = false;
let layerDimFactor = 0;
let layerExtraContrast = 0;
let shareFiltersParam = false;
let lastRequestSize = 0;
let lastRequestBox = '';
let nextQuerySelected = 0;
let enableDynamicCachebusting = false;
g.lastRefreshInt = 1000;
let reapTimeout = globeIndex ? 240 : 480;
let baroCorrectQNH = 1013.25;
let limitUpdates = -1;
let infoBlockWidth = baseInfoBlockWidth;
const renderBuffer = 60;
let shareLink = '';
let CenterLat = 0;
let CenterLon = 0;
g.zoomLvl = 5;
g.zoomLvlCache;
let TrackedAircraft = 0;
let globeTrackedAircraft = 0;
let TrackedAircraftPositions = 0;
let TrackedHistorySize = 0;
let aircraftShown = 0;
let SitePosition = null;
let infoBlockMinimized = false;
// timestamps
let now = 0;
let last = 0;
let uat_now = 0;
let uat_last = 0;
let FetchPending = [];
let FetchPendingUAT = null;
let MessageCountHistory = [];
let MessageRate = 0;
let ReceiverMessageRates = Object.create(null);
let layers;
let layers_group;
const nullStyle = new ol.style.Style({});
let estimateStyle;
let estimateStyleSlim;
let badLine;
let badLineMlat;
let badDot;
let badDotMlat;
let showingReplayBar = false;

// ***** EXPONER OLMAP PARA USO DE MÓDULOS EXTERNOS *****
Object.defineProperty(window, 'OLMap', {
    get() { return OLMap; },
    set(v) { OLMap = v; },
    configurable: true,
});
window.ol = ol;

// function stableOverlayOffset(key) {
//     // Deterministic, small scatter around the anchor to avoid overlap
//     let h = 0;
//     for (let i = 0; i < key.length; i++) {
//         h = (h * 31 + key.charCodeAt(i)) >>> 0;
//     }
//     const dx = (h % 7 - 3) * 12;                // -36 .. +36 px
//     const dy = -10 - (Math.floor(h / 7) % 3) * 14; // -10, -24, -38 px
//     return [dx, dy];
// }

// ***** INDICADOR DE ZOOM *****
function updateZoomIndicator() {
    const el = document.getElementById('zoom_indicator');
    if (!el || !OLMap || !OLMap.getView) return;

    const view = OLMap.getView();
    const z = Number(view.getZoom()) || 0;

    if (zoomIndicatorBaseline === null) {
        try {
            const saved = localStorage.getItem(ZOOM_BASELINE_KEY);
            if (saved !== null) {
                zoomIndicatorBaseline = parseFloat(saved);
            } else {
                zoomIndicatorBaseline = z;
                localStorage.setItem(ZOOM_BASELINE_KEY, zoomIndicatorBaseline);
            }
        } catch (e) {
            zoomIndicatorBaseline = z;
        }
    }

    const factor = Math.pow(2, z - zoomIndicatorBaseline);
    const pct = Math.round(100 * factor);

    el.textContent = 'Zoom: ' + pct + '%';

    let tooltipText = 'Current zoom level: {zoom} ({pct}% relative to base zoom {baseline})';

    if (typeof window.translate !== 'undefined' && window.translate.t) {
        tooltipText = window.translate.t('zoom_tooltip_text') || tooltipText;
    } else if (typeof window.t === 'function') {
        tooltipText = window.t('zoom_tooltip_text') || tooltipText;
    }

    tooltipText = tooltipText
        .replace(/\{zoom\}/g, z.toFixed(2))
        .replace(/\{pct\}/g, pct)
        .replace(/\{baseline\}/g, zoomIndicatorBaseline.toFixed(2));

    el.title = tooltipText;
}

// ***** HACER ZOOM IN AL USAR BOTÓN *****
function zoomInMap() {
    if (!OLMap || !OLMap.getView) return;
    const v = OLMap.getView();
    v.setZoom((v.getZoom() ?? 0) + 1);
    updateZoomIndicator();
    if (FollowSelected) toggleFollow(true);
}

// ***** HACER ZOOM OUT AL USAR BOTÓN *****
function zoomOutMap() {
    if (!OLMap || !OLMap.getView) return;
    const v = OLMap.getView();
    v.setZoom((v.getZoom() ?? 0) - 1);
    updateZoomIndicator();
    if (FollowSelected) toggleFollow(true);
}

// ***** VINCULAR BOTÓN CON ESTADO ACTIVO PARA APLICAR CLASE DE COLOR INVERTIDO *****
function bindToggleButton(options) {
    const buttonSelector = options.button;
    const panelSelector = options.panel;
    const mode = options.mode || 'panel';
    const closeSelectors = options.closeButtons || [];
    const activeClass = options.activeClass || 'btn-active';
    const activeWhen = options.activeWhen || null;

    const $button = jQuery(buttonSelector);
    const $panel = panelSelector ? jQuery(panelSelector) : null;

    if (!$button.length) {
        console.warn('bindToggleButton: no se encontró', buttonSelector);
        return;
    }

    // ***** BOTONES TIPO DROPDOWN *****
    if (mode === 'dropdown') {
        const $container = $button.closest('.dropdown');

        function syncDropdownState() {
            const isOpen = $container.length && $container[0].matches(':focus-within');
            const hasActiveItem = typeof activeWhen === 'function' ? !!activeWhen() : false;
            $button.toggleClass(activeClass, isOpen || hasActiveItem);
        }

        $button[0].__syncBtnState = syncDropdownState;

        $container.off('.bindToggleBtn');
        $container.on('focusin.bindToggleBtn', syncDropdownState);
        $container.on('focusout.bindToggleBtn', function () {
            setTimeout(syncDropdownState, 0);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setTimeout(syncDropdownState, 0);
        });
        document.addEventListener('click', function () {
            setTimeout(syncDropdownState, 0);
        });

        const observer = new MutationObserver(function () {
            syncDropdownState();
        });
        $container.find('[id]').each(function () {
            observer.observe(this, { attributes: true, attributeFilter: ['class'] });
        });
        observer.observe($container[0], { childList: true, subtree: true });

        syncDropdownState();
        return;
    }

    // ***** BOTONES TIPO PANEL *****
    if (!$panel || !$panel.length) {
        console.warn('bindToggleButton: no se encontró el panel', panelSelector);
        return;
    }

    function syncButtonState() {
        const isVisible = $panel.is(':visible');
        const hasActiveItem = typeof activeWhen === 'function' ? !!activeWhen() : false;
        $button.toggleClass(activeClass, isVisible || hasActiveItem);
    }

    $button[0].__syncBtnState = syncButtonState;

    $button.off('click.bindToggleBtn').on('click.bindToggleBtn', function (e) {
        e.preventDefault();
        $panel.toggle();
        syncButtonState();
    });

    closeSelectors.forEach(function (sel) {
        jQuery(sel).off('click.bindToggleBtn').on('click.bindToggleBtn', function () {
            $panel.hide();
            syncButtonState();
        });
    });

    syncButtonState();
}

// ***** RESTAURAR ANCHO DEL SIDEBAR DESDE BOTÓN *****
function resetSidebarWidth() {
    const sidebar = document.getElementById('sidebar_container');
    if (!sidebar) return;

    const windowWidth = window.innerWidth;
    let baseWidth = windowWidth * 0.25;

    const minWidth = 200;
    const maxWidth = windowWidth * 0.6;
    baseWidth = Math.min(maxWidth, Math.max(minWidth, baseWidth));

    sidebar.style.width = baseWidth + 'px';

    localStorage.setItem('sidebar_width', baseWidth);

    if (typeof updateMapSize === 'function') {
        updateMapSize();
    }

    if (typeof TAR !== 'undefined' && TAR.planeMan && TAR.planeMan.redraw) {
        TAR.planeMan.redraw();
    }

    sidebar.style.transition = 'width 0.2s ease';
    setTimeout(() => {
        sidebar.style.transition = '';
    }, 200);
}

// ***** DIBUJAR BOTÓN PARA RESTAURAR ANCHO DEL SIDEBAR *****
function initSidebarResetTab() {
    const resetTab = document.getElementById('reset-sidebar-tab');
    const resetLink = document.getElementById('reset-sidebar-link');

    if (!resetTab || !resetLink) return;

    if (typeof jQuery !== 'undefined' && jQuery.ui && jQuery.ui.tabs) {
        resetTab.setAttribute('aria-controls', '');
        resetTab.setAttribute('aria-labelledby', '');
    }

    resetLink.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        resetSidebarWidth();

    });
}

// ***** ESPERAR A QUE EL DOM ESTÉ CARGADO PARA INICIALIZAR EL BOTÓN *****
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(initSidebarResetTab, 100);
    });
} else {
    setTimeout(initSidebarResetTab, 100);
}

// ***** RESTAURAR TODAS LAS CONFIGURACIONES A SU DEFINICIÓN POR DEFECTO *****
(function () {
    const initResetButton = function () {
        const resetBtn = document.getElementById('reset-all-settings-btn');
        if (!resetBtn) return;

        resetBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const overlay = document.createElement('div');
            overlay.id = 'reset-confirm-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 20000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(3px);
            `;

            const modal = document.createElement('div');
            modal.style.cssText = `
                background: var(--BGCOLOR1, #fff);
                border-radius: 12px;
                padding: 24px 28px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                text-align: center;
                border: 1px solid var(--LIGHTER-BASE-COLOR, #ccc);
            `;

            modal.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: bold;">${getTranslatedText('reset_all_settings', 'Reset all settings')}</h3>
                <p style="margin: 0 0 8px 0; line-height: 1.5;">
                    ${getTranslatedText('reset_all_settings_confirm', 'This will restore all settings to their default values.')}
                </p>
                <p style="margin: 0 0 20px 0; color: #e74c3c; font-weight: bold;">
                    ${getTranslatedText('reset_all_settings_reload', 'The page will reload to apply the changes.')}
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="reset-confirm-cancel" style="
                        padding: 10px 24px;
                        border: 1px solid var(--LIGHTER-BASE-COLOR, #ccc);
                        background: transparent;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        color: var(--TXTCOLOR2, #333);
                    ">${getTranslatedText('cancel', 'Cancel')}</button>
                    <button id="reset-confirm-ok" style="
                        padding: 10px 24px;
                        border: none;
                        background: #e74c3c;
                        color: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    ">${getTranslatedText('reset_reload', 'Reset & Reload')}</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const closeModal = function () {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            };

            const cancelBtn = document.getElementById('reset-confirm-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', closeModal);
            }

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeModal();
            });

            const confirmBtn = document.getElementById('reset-confirm-ok');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function () {
                    if (typeof resetSettings === 'function') {
                        resetSettings();
                    } else {
                        try {
                            localStorage.clear();
                        } catch (e) { }
                    }

                    setTimeout(function () {
                        window.location.reload();
                    }, 300);
                });
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResetButton);
    } else {
        initResetButton();
    }
})();

// ***** ACTUALIZAR TÍTULOS DE LAS CAPAS AL CAMBIAR IDIOMA *****
function updateLayerTitles() {
    if (!OLMap) return;
    const layers = OLMap.getLayers().getArray();
    let updatedCount = 0;

    function translateLayer(layer) {
        if (!layer) return;

        if (typeof layer.getLayers === 'function') {
            const groupName = layer.get('name');
            const groupTitle = layer.get('title');

            if (groupName) {
                const translatedTitle = getLayerTitle('group_' + groupName, groupTitle);
                if (translatedTitle !== groupTitle) {
                    layer.set('title', translatedTitle);
                    updatedCount++;
                    console.log(`Grupo actualizado: ${groupName} -> ${translatedTitle}`);
                }
            } else if (groupTitle) {
                const translatedTitle = getLayerTitle(groupTitle, groupTitle);
                if (translatedTitle !== groupTitle) {
                    layer.set('title', translatedTitle);
                    updatedCount++;
                    console.log(`Grupo actualizado (por título): ${groupTitle} -> ${translatedTitle}`);
                }
            }

            const subLayers = layer.getLayers();
            if (subLayers) {
                subLayers.forEach(subLayer => {
                    translateLayer(subLayer);
                });
            }
        } else if (typeof layer.get === 'function') {
            const name = layer.get('name');
            const title = layer.get('title');

            if (name) {
                const translatedTitle = getLayerTitle(name, title);
                if (translatedTitle !== title) {
                    layer.set('title', translatedTitle);
                    updatedCount++;
                    console.log(`Capa actualizada: ${name} -> ${translatedTitle}`);
                }
            } else if (title) {
                const translatedTitle = getLayerTitle(title, title);
                if (translatedTitle !== title) {
                    layer.set('title', translatedTitle);
                    updatedCount++;
                    console.log(`Capa actualizada (por título): ${title} -> ${translatedTitle}`);
                }
            }
        }
    }

    layers.forEach(layer => {
        translateLayer(layer);
    });

    refreshLayerSwitcher();
}

// ***** ACTUALIZAR MENÚ DE CAPAS *****
function refreshLayerSwitcher() {
    if (!OLMap) {
        console.warn('refreshLayerSwitcher: OLMap no está inicializado');
        return;
    }
    let layerSwitcherControl = null;
    OLMap.getControls().forEach(control => {
        if (control && control.constructor) {
            const name = control.constructor.name || control.constructor.displayName || '';
            if (name === 'LayerSwitcher' ||
                (control.element && control.element.className &&
                    control.element.className.includes('layer-switcher'))) {
                layerSwitcherControl = control;
            }
        }
    });
    if (layerSwitcherControl) {
        try {
            if (typeof layerSwitcherControl.renderPanel === 'function') {
                layerSwitcherControl.renderPanel();
            }
            if (typeof layerSwitcherControl.updateLayers === 'function') {
                layerSwitcherControl.updateLayers();
            }
            if (layerSwitcherControl.element) {
                const panel = layerSwitcherControl.element.querySelector('.panel');
                if (panel) {
                    const list = panel.querySelector('.layer-switcher-list');
                    if (list) {
                        if (list.dispatchEvent) {
                            list.dispatchEvent(new Event('change'));
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Error al actualizar LayerSwitcher:', e);
        }
    } else {
        forceRecreateLayerSwitcher();
    }
    if (OLMap) {
        OLMap.render();
    }
}

// ***** FORZAR ACTUALIZACIÓN DEL MENÚ DE CAPAS *****
function forceRecreateLayerSwitcher() {
    if (!OLMap) return;
    let oldControl = null;
    let target = null;
    OLMap.getControls().forEach(control => {
        if (control && control.constructor) {
            const name = control.constructor.name || control.constructor.displayName || '';
            if (name === 'LayerSwitcher' ||
                (control.element && control.element.className &&
                    control.element.className.includes('layer-switcher'))) {
                oldControl = control;
                target = control.target;
            }
        }
    });
    if (oldControl) {
        OLMap.removeControl(oldControl);
    }
    setTimeout(function () {
        const newControl = new ol.control.LayerSwitcher({
            groupSelectStyle: 'none',
            activationMode: 'click',
            target: target || 'layer-select',
        });
        OLMap.addControl(newControl);
        OLMap.render();
        setTimeout(function () {
            if (typeof window.updateLayerTitles === 'function') {
                window.updateLayerTitles();
            }
        }, 100);
    }, 50);
}

function processAircraft(ac, init, uat) {
    const isArray = Array.isArray(ac);
    let hex = isArray ? ac[0] : ac.hex;

    if (debugAll) {
        console.log(`[DEBUG ALL] Processing aircraft: ${hex}`, {
            lat: isArray ? ac[4] : ac.lat,
            lon: isArray ? ac[5] : ac.lon,
            alt: isArray ? ac[1] : ac.alt_baro,
            type: isArray ? ac[7] : ac.type,
            init: init,
            timestamp: new Date().toISOString()
        });
    }

    if (icaoFilter && !icaoFilter.includes(hex))
        return;

    if (icaoBlacklist && icaoBlacklist.includes(hex))
        return;

    if (MergeNonIcao && hex.startsWith('~')) {
        hex = hex.slice(1);
    }

    const type = isArray ? ac[7] : ac.type;
    if (g.historyKeep && !g.historyKeep[hex] && type != 'adsc') {
        return;
    }

    if (uat && uatNoTISB && ac.type && ac.type.substring(0, 4) == "tisb") {
        // drop non ADS-B planes from UAT (TIS-B)
        return;
    }

    // Do we already have this plane object in g.planes?
    // If not make it.
    // let plane = g.planes[hex]

    // if (!plane) {
    //     plane = new PlaneObject(hex);
    //     if (uat)
    //         plane.uat = true;
    // }

    let plane = g.planes[hex]

    if (!plane) {
        plane = new PlaneObject(hex);
        if (uat)
            plane.uat = true;
    }

    // ***** ACUMULAR RECEPTORES QUE VEN ESTA AERONAVE *****
    const receiverId = ac._receiver || null;
    if (receiverId) {
        if (!plane.receivers) {
            plane.receivers = new Set();
        }
        plane.receivers.add(receiverId);
    }

    if (showTrace)
        return;

    // Call the function update
    if (globeIndex || replay) {
        if (!onlyMilitary || plane.military || (ac.dbFlags && ac.dbFlags & 1)) {
            plane.updateData(now, last, ac, init);
        } else {
            plane.last_message_time = now - ac.seen;
        }
        return;
    }
    if (uat_now == 0) {
        plane.updateData(now, last, ac, init);
        return;
    }

    // UAT dual source stuff below

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

    if (!uat) {
        if (!plane.uat // plane isn't uat, new data isn't uat, accept immediately
            || (prefer978 < 0 && newPos < -prefer978)
            || (newPos < 2 && oldPos > 4 + prefer978)
            || (oldPos > 60 && newSeen < 2 && oldSeen > 4 + prefer978)
            || init) {
            plane.uat = false;
            plane.updateData(now, last, ac, init);
        }
    } else {
        if (plane.uat // plane is uat, new data is uat, accept immediately
            || (prefer978 > 0 && newPos < prefer978)
            || (newPos < 2 && (oldPos > 4 - prefer978 || plane.dataSource == "mlat"))
            || (oldPos > 60 && newSeen < 2 && oldSeen > 4 - prefer978)
            || init) {
            let tisb = Array.isArray(ac) ? (ac[7] == "tisb") : (ac.tisb != null && ac.tisb.indexOf("lat") >= 0);
            if (tisb && plane.dataSource == "adsb") {
                // ignore TIS-B data for current ADS-B 1090 planes
            } else {
                plane.uat = true;
                plane.updateData(uat_now, uat_last, ac, init);
            }
        }
    }

    if (debugAll) {
        console.log(`[DEBUG ALL] Processing aircraft: ${hex}`, {
            lat: ac.lat,
            lon: ac.lon,
            alt: ac.alt_baro,
            type: ac.type,
            init: init
        });
    }
}

function updateReceiverMessageRate(data) {
    const receiverId = data._fromReceiver;
    const messageCount = Number(data.messages);
    if (!receiverId || !Number.isFinite(messageCount) || !Number.isFinite(data.now)) {
        return;
    }

    const previous = ReceiverMessageRates[receiverId];
    let rate = 0;
    if (previous && data.now > previous.time && messageCount >= previous.messages) {
        rate = (messageCount - previous.messages) / (data.now - previous.time);
    }

    ReceiverMessageRates[receiverId] = {
        time: data.now,
        messages: messageCount,
        rate,
    };

    MessageRate = Object.values(ReceiverMessageRates).reduce((total, receiver) => {
        if (data.now - receiver.time <= 10.5) {
            return total + receiver.rate;
        }
        return total;
    }, 0);
}

let notNewCounter = 0;
let backwardsCounter = 0;
function processReceiverUpdate(data, init) {
    // ***** SI VIENE DE UN RECEPTOR, PROCESAR SIN FILTRO DE TIMESTEP *****
    if (data._fromReceiver) {
        updateReceiverMessageRate(data);
        if (data.now > now) {
            last = now;
            now = data.now;
            g.now = now;
        }
        for (let j = 0; j < data.aircraft.length; j++) {
            processAircraft(data.aircraft[j], init, false);
        }
        return;
    }

    // update now and last
    let uat = data.uat_978;
    if (uat) {
        if (data.now <= uat_now)
            return;
        uat_last = uat_now;
        uat_now = data.now;
    } else {
        if (uat_now && now - uat_now > 15) {
            uat_now = now;
        }
        if (data.now <= now && !globeIndex) {
            if (data.now < now) {
                backwardsCounter++;
                console.log('timestep backwards or the same, ignoring data: ' + now + ' -> ' + data.now);
                if (backwardsCounter >= 5) {
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
                enableDynamicCachebusting = true;
            }
            return;
        }
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
    g.now = now;

    if (globeIndex) {
        if ((showGrid || loStore['globeGrid'] == 'true')
            && globeIndexNow[data.globeIndex] == null)
            drawTileBorder(data);
        globeTrackedAircraft = data.global_ac_count_withpos;
        globeIndexNow[data.globeIndex] = data.now;
    }

    if (!(uat || init || (globeIndex && aggregator))) {
        updateMessageRate(data);
    }

    // Loop through all the planes in the data packet
    for (let j = 0; j < data.aircraft.length; j++) {
        processAircraft(data.aircraft[j], init, uat);
    }
}
function fetchFail(jqxhr, status, error) {
    try {
        pendingFetches--;
        if (pendingFetches <= 0 && !tabHidden) {
            triggerRefresh++;
            checkMovement();
        }
        status = jqxhr.status;
        // if (jqxhr.readyState == 0) error = "Can't connect to server, check your network!";
        if (jqxhr.readyState == 0) error = getTranslatedText('error_connect_server', "Can't connect to server, check your network!");
        let errText = status + (error ? (": " + error) : "");
        console.log(jqxhr);
        console.log(error);
        if (status != 429 && status != '429') {
            jQuery("#update_error_detail").text(errText);
            jQuery("#update_error").css('display', 'block');
            StaleReceiverCount++;
        } else {
            if (C429++ > 16) {
                globeRateUpdate();
                C429 = 0;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

function fetchDone(data, receiverId) {
    try {
        pendingFetches--;
        if (data == null) {
            return;
        }

        // ***** OBTENER EL ID DEL RECEPTOR *****
        if (!receiverId) {
            receiverId = this.receiverId || null;
        }

        // ***** DECODIFICAR PRIMERO *****
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
            data = { buffer: arrayBuffer, };
            wqi(data);
        } else if (binCraft) {
            lastRequestSize = data.byteLength / 2;
            data = { buffer: data, };
            wqi(data);
        }
        data.urlIndex = this.urlIndex;

        // ***** INYECTAR RECEPTOR *****
        if (receiverId && data.aircraft) {
            for (let i = 0; i < data.aircraft.length; i++) {
                data.aircraft[i]._receiver = receiverId;
            }
        }

        // ***** MARCAR EL DATA COMO PROVENIENTE DE UN RECEPTOR *****
        if (receiverId) {
            data._fromReceiver = receiverId;
        }

        if (!data.aircraft || !data.now) {
            let error = data.error;
            if (error) {
                jQuery("#update_error_detail").text(error);
                jQuery("#update_error").css('display', 'block');
                StaleReceiverCount++;
            }
            return;
        }

        if (!timersActive) {
            //console.log(localTime(new Date()) + " fetchDone: not applying data due to !timersActive");
            return;
        }

        //console.time("Process " + data.globeIndex);
        processReceiverUpdate(data);
        //console.timeEnd("Process " + data.globeIndex);
        data = null;

        if (uat_data) {
            processReceiverUpdate(uat_data);
            uat_data = null;
        }

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
        fetchDoneCount++;
        if (fetchDoneCount == 1) { console.timeEnd("first fetch()"); };

        if (!g.firstFetchDone) { afterFirstFetch(); };

        // Check for stale receiver data
        if (last == now && !globeIndex) {
            StaleReceiverCount++;
            if (StaleReceiverCount > 5) {
                let errorMsg = getTranslatedText('error_data_not_updated', "The data from the server hasn't been updated in a while.");
                jQuery("#update_error_detail").text(errorMsg);
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

function db_load_type_cache() {
    return jQuery.getJSON(databaseFolder + "/icao_aircraft_types2.js").done(function (typeLookupData) {
        g.type_cache = typeLookupData;
        for (let i in g.planesOrdered) {
            g.planesOrdered[i].setTypeData();
        }
    });
}

g.afterLoadDone = false;
g.afterLoad = [];
function runAfterLoad(func) {
    if (g.afterLoadDone) {
        func()
    } else {
        g.afterLoad.push(func);
    }
}

function afterFirstFetch() {
    if (g.firstFetchDone) { return; }

    g.firstFetchDone = true;

    updateVisible();
    mapRefresh();

    setTimeout(() => {
        console.time('afterFirstFetch()');


        let func;
        while ((func = g.afterLoad.pop())) {
            func();
        }
        g.afterLoadDone = true;
        while ((func = g.afterLoad.pop())) {
            func();
        }


        geoMag = geoMagFactory(cof2Obj());

        db_load_type_cache().always(function () {
            refresh();
        });

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
function fetchData(options) {
    options = options || {};

    if (debugAll) {
        console.log(`[DEBUG ALL] Fetching data at ${new Date().toISOString()}, pendingFetches: ${pendingFetches}`);
    }

    if (!timersActive) {
        //console.log(localTime(new Date()) + " fetchData inhibited by !timersActive");
        return;
    }
    if (heatmap || replay || showTrace || pTracks || !loadFinished || inhibitFetch) {
        return;
    }
    let currentTime = new Date().getTime();
    const refreshMs = refreshInt()
    g.lastRefreshInt = refreshMs;

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
    setTimeout(fetchData, refreshMs);
    if (debugFetch) {
        console.log('Time since last fetch: ' + (currentTime - lastFetch) + ' ms');
    }
    lastFetch = currentTime;

    FetchPending = [];
    if (FetchPendingUAT != null) {
        // don't double up on fetches, let the last one resolve
        return;
    }

    //console.timeEnd("Starting Fetch");
    //console.time("Starting Fetch");

    if (limitUpdates != -1 && fetchCalls > limitUpdates) {
        return;
    }
    fetchCalls++;

    if (fetchCalls == 1) { console.time("first fetch()"); };

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

    let suffix = zstd ? '.binCraft.zst' : (binCraft ? '.binCraft' : '.json');
    if (enableDynamicCachebusting) {
        suffix += `?${currentTime}`;
    }

    let ac_url = [];
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
        // ac_url.push('data/aircraft' + suffix);
        // ***** MÚLTIPLES RECEPTORES *****
        ac_url.push('data-receiver-a/aircraft.json');
        ac_url.push('data-receiver-b/aircraft.json');
        ac_url.push('data-receiver-c/aircraft.json');
        ac_url.push('data-receiver-d/aircraft.json');
    }

    pendingFetches += ac_url.length;
    fetchCounter += ac_url.length;

    for (let i in ac_url) {
        if (debugFetch) {
            console.log('Fetching: ' + ac_url[i]);
        }

        let req;
        // ***** IDENTIFICAR RECEPTOR POR ÍNDICE DE URL *****
        const receiverNames = ['a', 'b', 'c', 'd'];
        const receiverId = receiverNames[i] || null;

        // ***** FORZAR JSON DE TEXTO PARA LOS ARCHIVOS DE RECEPTORES *****
        const isReceiverFile = typeof ac_url[i] === 'string' && ac_url[i].startsWith('data-receiver-');

        if ((binCraft || zstd) && !isReceiverFile) {
            req = jQuery.ajax({
                url: `${ac_url[i]}`, method: 'GET',
                xhr: arraybufferRequest,
                timeout: 15000,
                urlIndex: i,
            });
        } else {
            req = jQuery.ajax({
                url: `${ac_url[i]}`,
                dataType: 'json',
                timeout: 15000,
                urlIndex: i,
            });
        }

        // ***** PASAR ID DE RECEPTOR COMO ARGUMENTO *****
        const reqReceiverId = receiverId;

        FetchPending.push(req);

        req
            .done(function (data) {
                fetchDone.call(this, data, reqReceiverId);
            })
            .fail(fetchFail);
    }


    if (now - lastReap > 60) {
        reaper();
    }
}

// this function is called from index.html on body load
// kicks off the whole rabbit hole
function initialize() {
    if (usp.has('iconTest') || usp.has('iconTestLabels')) {
        jQuery('#iconTestCanvas').show();
        iconTest();
        return;
    }

    // things that can run without receiver json being known
    earlyInitPage();
    initMapEarly();

    jQuery.when(configureReceiver, heatmapDefer).done(function () {

        if (receiverJson) {
            if (receiverJson.trace_hist_only)
                trace_hist_only = true;
            if (receiverJson.json_trace_interval < 2)
                traces_high_res = true;
            if (receiverJson.lat != null && !SiteOverride) {
                //console.log("receiver.json lat: " + receiverJson.lat)
                SiteLat = receiverJson.lat;
                SiteLon = receiverJson.lon;
            }
            if (receiverJson.jaeroTimeout) {
                jaeroTimeout = receiverJson.jaeroTimeout * 60;
            }


            if (receiverJson.readsb) {
                positionFilter = false;
                altitudeFilter = false;
            }
        }

        if (SiteLat && SiteLon) {
            SitePosition = [SiteLon, SiteLat];
            DefaultCenterLat = SiteLat;
            DefaultCenterLon = SiteLon;
        }

        configureReceiver = null;

        // Initialize stuff
        initPage();
        initMap();

        processQueryToggles();

        jQuery.when(historyQueued).done(push_history);

        if (!nHistoryItems) {
            historyLoaded.resolve();
        }

        jQuery.when(historyLoaded, zstdDefer).done(startPage);
    });
}


function processQueryToggles() {
    if (!usp.has('toggles')) {
        return;
    }
    let todo;
    try {
        todo = usp.get('toggles').split(',');;
    } catch (e) {
        console.error(e);
        return;
    }
    while (todo.length >= 2) {
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

function replaySpeedChange(arg) {
    traceOpts.replaySpeed = arg;
    console.log(arg);
    if (traceOpts.animate)
        return;
    legShift(0);
};

// ***** OBTENER CLAVE DE TRADUCCIÓN *****
function getTranslatedText(key, fallback) {
    if (typeof window.translate !== 'undefined' && window.translate.t) {
        const translated = window.translate.t(key);
        if (translated !== key) return translated;
    }

    if (typeof window.t === 'function') {
        const translated = window.t(key);
        if (translated !== key) return translated;
    }

    return fallback || key;
}

// ***** CREAR TOGGLE DE TRADUCCIÓN A PARTIR DE LAS CLAVES *****
function createToggle(options) {
    if (!options.displayKey && options.display) {
        if (options.display.includes('_') || options.display !== options.display.toLowerCase()) {
            options.displayKey = options.display;
        }
    }

    if (!options.tooltipKey && options.tooltip) {
        if (options.tooltip.includes('_') || options.tooltip !== options.tooltip.toLowerCase()) {
            options.tooltipKey = options.tooltip;
        }
    }

    if (options.displayKey && typeof window.getTranslatedText === 'function') {
        options.display = window.getTranslatedText(options.displayKey, options.display);
    }
    if (options.tooltipKey && typeof window.getTranslatedText === 'function') {
        options.tooltip = window.getTranslatedText(options.tooltipKey, options.tooltip);
    }

    return new Toggle(options);
}

function initPage() {

    if (globeIndex) {
        // ***** TABS PARA VER MÁS FILAS DE LA TABLA DE AERONAVES *****
        window.setGlobeTableLimit = function () {
            let mult = 1 + 4 * (toggles['moreTableLines1'] ? toggles['moreTableLines1'].state : 0) + 16 * (toggles['moreTableLines2'] && toggles['moreTableLines2'].state);
            globeTableLimit = globeTableLimitBase * mult;
            if (toggles['allTableLines'] && toggles['allTableLines'].state)
                globeTableLimit = 1e9;
            if (onMobile)
                globeTableLimit /= 2;

            if (typeof TAR !== 'undefined' && TAR.planeMan && TAR.planeMan.refresh) {
                TAR.planeMan.refresh();
            }
        };
        new Toggle({
            key: "moreTableLines1",
            display: "More Table Lines",
            container: null,
            init: false,
            setState: window.setGlobeTableLimit,
        });
        new Toggle({
            key: "moreTableLines2",
            display: "Even More Table Lines",
            container: null,
            init: false,
            setState: window.setGlobeTableLimit,
        });
        new Toggle({
            key: "allTableLines",
            display: "All Table Lines",
            container: null,
            init: false,
            setState: window.setGlobeTableLimit,
        });
    }

    if (!globeIndex && !haveTraces) {
        jQuery("#lastLeg_cb").parent().hide();
        // jQuery('#show_trace').hide();
    }
    if (globeIndex) {
        toggleTableInView('enable');
        if (icaoFilter) {
            toggleTableInView('disable');
        }
    } else {
        jQuery('#V').show();
    }

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
        CenterLat = DefaultCenterLat;
        CenterLon = DefaultCenterLon;
    }

}

function earlyInitPage() {
    // things that can run without receiver json being known
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

    if (uk_advisory) {
        defaultOverlays.push('uka_airports');
        defaultOverlays.push('uka_airspaces');
        defaultOverlays.push('uka_runways');
        defaultOverlays.push('uka_shoreham');
        atcStyle = true;
    }

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
        tempTrails = true;
        hideButtons = true;
        userScale = 2;
    }

    if (pTracks) {
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

    if (usp.has('mapDim')) {
        let dim = parseFloat(usp.get('mapDim'));
        if (!isNaN(dim))
            mapDimPercentage = dim;
    } else if (heatmap) {
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

    // avoid extreme minimum sizes that break readability
    iconScale = Math.max(iconScale, 0.4);
    userScale = Math.max(userScale, 0.75);

    const slideBase = 0.6;
    jQuery('#iconScaleSlider').slider({
        value: Math.pow(iconScale, 1 / slideBase),
        step: 0.02,
        min: 0.4,
        max: 3,
        change: function (event, ui) {
            iconScale = Math.max(Math.pow(ui.value, slideBase), 0.4);
            checkScale();
            mapRefresh();
            loStore['iconScale'] = iconScale;
        },
    });

    jQuery('#userScaleSlider').slider({
        value: Math.pow(userScale, 1 / slideBase),
        step: 0.02,
        min: 0.75,
        max: 3,
        change: function (event, ui) {
            userScale = Math.max(Math.pow(ui.value, slideBase), 0.75);
            checkScale();
            mapRefresh();
            loStore['userScale'] = userScale;

            setGlobalScale(userScale);
        },
    });

    // ***** RESETEAR "TEXT AND ICON SIZE" A SU CONFIGURACIÓN POR DEFECTO *****
    const resetUserScaleBtn = document.getElementById('resetUserScaleBtn');
    if (resetUserScaleBtn) {
        resetUserScaleBtn.addEventListener('click', function () {
            const defaultValue = 1.0;
            userScale = defaultValue;
            checkScale();
            mapRefresh();
            loStore['userScale'] = userScale;
            setGlobalScale(userScale);
            const slideBase = 0.6;
            jQuery('#userScaleSlider').slider('value', Math.pow(userScale, 1 / slideBase));
        });
    }

    // ***** RESETEAR "ICON SIZE MULTIPLIER" A SU CONFIGURACIÓN POR DEFECTO *****
    const resetIconScaleBtn = document.getElementById('resetIconScaleBtn');
    if (resetIconScaleBtn) {
        resetIconScaleBtn.addEventListener('click', function () {
            const defaultValue = 1.0;
            iconScale = defaultValue;
            checkScale();
            mapRefresh();
            loStore['iconScale'] = iconScale;
            const slideBase = 0.6;
            jQuery('#iconScaleSlider').slider('value', Math.pow(iconScale, 1 / slideBase));
        });
    }

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
    filterMaxRange *= 1852; // convert from nmi to meters


    if (value = usp.getFloat('mapOrientation')) {
        g.mapOrientation = value;
    }
    g.mapOrientation *= (Math.PI / 180); // adjust to radians

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
        jQuery("#generic_error_detail").text("Enable Settings - Safari - Advanced - Experimental features - Pointer Events");
        jQuery("#generic_error").css('display', 'block');
        setTimeout(function () {
            jQuery("#generic_error").css('display', 'none');
        }, 30000);
    }

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

    jQuery('#tabs').tabs({
        active: (loStore['active_tab'] !== undefined) ? loStore['active_tab'] : false,

        activate: function (event, ui) {
            loStore['active_tab'] = jQuery("#tabs").tabs("option", "active");
        },
        collapsible: true
    });

    // Set page basics
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

    // jQuery("#show_trace").click(toggleShowTrace);
    jQuery("#trace_back_1d").click(function () { shiftTrace(-1) });
    jQuery("#trace_jump_1d").click(function () { shiftTrace(1) });

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

    if (onMobile) {
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

    jQuery('#groundvehicle_filter').on('click', function () {
        filterGroundVehicles(true);
        refresh();
    });

    jQuery('#blockedmlat_filter').on('click', function () {
        filterBlockedMLAT(true);
        refresh();
    });


    // ***** ORDENAR LOS BOTONES DE CONFIGURACIONES POR CATEGORÍAS *****

    // ***** CATEGORÍA FILTERS *****

    // ***** FUNCIONES DE AERONAVE *****
    createToggle({
        key: "hideAircraftFunctions",
        display: 'hide_aircraft_functions',
        displayKey: 'hide_aircraft_functions',
        tooltip: 'hide_aircraft_functions_tooltip',
        tooltipKey: 'hide_aircraft_functions_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#aircraft_dropdown").toggle(!state);
        }
    });

    // ***** FUNCIONES DE ELEVACIÓN *****
    createToggle({
        key: "hideElevationFunction",
        display: 'hide_elevation_function',
        displayKey: 'hide_elevation_function',
        tooltip: 'hide_elevation_function_tooltip',
        tooltipKey: 'hide_elevation_function_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#elevation_dropdown").toggle(!state);
        }
    });

    // ***** FUNCIONES DE DISTANCIA *****
    createToggle({
        key: "hideDistanceFunctions",
        display: 'hide_distance_functions',
        displayKey: 'hide_distance_functions',
        tooltip: 'hide_distance_functions_tooltip',
        tooltipKey: 'hide_distance_functions_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#measurement_dropdown").toggle(!state);
        }
    });

    // ***** FUNCIONES DE ETIQUETAS *****
    createToggle({
        key: "hideLabelFunctions",
        display: 'hide_label_functions',
        displayKey: 'hide_label_functions',
        tooltip: 'hide_label_functions_tooltip',
        tooltipKey: 'hide_label_functions_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#label_dropdown").toggle(!state);
        }
    });

    // ***** FUNCIONES DE CAPAS *****
    createToggle({
        key: "hideLayerFunctions",
        display: 'hide_layer_functions',
        displayKey: 'hide_layer_functions',
        tooltip: 'hide_layer_functions_tooltip',
        tooltipKey: 'hide_layer_functions_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#layer-select").toggle(!state);
        }
    });

    // ***** FUNCIÓN DE RE-CENTRAR *****
    createToggle({
        key: "hideRecenterFunction",
        display: 'hide_recenter_function',
        displayKey: 'hide_recenter_function',
        tooltip: 'hide_recenter_function_tooltip',
        tooltipKey: 'hide_recenter_function_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#H").toggle(!state);
        }
    });

    // ***** FUNCIÓN DE REPLAY *****
    createToggle({
        key: "hideReplayFunction",
        display: 'hide_replay_function',
        displayKey: 'hide_replay_function',
        tooltip: 'hide_replay_function_tooltip',
        tooltipKey: 'hide_replay_function_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#RP").toggle(!state);
        }
    });

    // ***** FUNCIÓN DE RUMBOS *****
    createToggle({
        key: "hideTrackFunctions",
        display: 'hide_track_functions',
        displayKey: 'hide_track_functions',
        tooltip: 'hide_track_functions_tooltip',
        tooltipKey: 'hide_track_functions_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#track_dropdown").toggle(!state);
        }
    });

    // ***** FUNCIONES DE ZOOM *****
    createToggle({
        key: "hideZoomFunctions",
        display: 'hide_zoom_functions',
        displayKey: 'hide_zoom_functions',
        tooltip: 'hide_zoom_functions_tooltip',
        tooltipKey: 'hide_zoom_functions_tooltip',
        container: "#category-filters-container",
        init: false,
        setState: function (state) {
            jQuery("#ZI, #ZO").toggle(!state);
        }
    });

    // ***** CATEGORÍA DATA *****

    // ***** ALTITUD BAROMÉTRICA *****
    createToggle({
        key: "baroUseQNH",
        display: 'baro_alt_correct_qnh',
        displayKey: 'baro_alt_correct_qnh',
        tooltip: 'baro_alt_correct_qnh_tooltip',
        tooltipKey: 'baro_alt_correct_qnh_tooltip',
        container: "#category-data-container",
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

    // ***** ALTITUD GEOMÉTRICA *****
    createToggle({
        key: "geomUseEGM",
        display: 'geom_alt_wgs84_egm',
        displayKey: 'geom_alt_wgs84_egm',
        tooltip: 'geom_alt_wgs84_egm_tooltip',
        tooltipKey: 'geom_alt_wgs84_egm_tooltip',
        container: "#category-data-container",
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

    // ***** HISTÓRICO DE TRAZAS *****
    createToggle({
        key: "utcTimesHistoric",
        display: 'historic_track_labels_utc',
        displayKey: 'historic_track_labels_utc',
        tooltip: 'historic_track_labels_utc_tooltip',
        tooltipKey: 'historic_track_labels_utc_tooltip',
        container: "#category-data-container",
        init: utcTimesHistoric,
        setState: function (state) {
            utcTimesHistoric = state;
            remakeTrails();
            refreshSelected();
        }
    });

    if (usp.has('labelsGeom')) {
        toggles['labelsGeom'].toggle(true, 'init');
    }

    if (usp.has('geomEGM')) {
        toggles['geomUseEGM'].toggle(true, 'init');
    }

    // ***** ETIQUETAS GEOMÉTRICAS *****
    createToggle({
        key: "labelsGeom",
        display: 'labels_geom_alt',
        displayKey: 'labels_geom_alt',
        tooltip: 'labels_geom_alt_tooltip',
        tooltipKey: 'labels_geom_alt_tooltip',
        container: "#category-data-container",
        init: labelsGeom,
        setState: function (state) {
            labelsGeom = state;
            if (loadFinished) {
                remakeTrails();
                refreshSelected();
            }
        }
    });

    // ***** TRAZAS EN VIVO *****
    createToggle({
        key: "utcTimesLive",
        display: 'live_track_labels_utc',
        displayKey: 'live_track_labels_utc',
        tooltip: 'live_track_labels_utc_tooltip',
        tooltipKey: 'live_track_labels_utc_tooltip',
        container: "#category-data-container",
        init: utcTimesLive,
        setState: function (state) {
            utcTimesLive = state;
            remakeTrails();
            refreshSelected();
        }
    });

    // ***** FUNCIÓN DE AVIONES DE INTERÉS *****
    createToggle({
        key: "enableStarredAircraft",
        display: 'notable_aircraft',
        displayKey: 'notable_aircraft',
        tooltip: 'notable_aircraft_tooltip',
        tooltipKey: 'notable_aircraft_tooltip',
        container: "#category-data-container",
        init: false,
        setState: function (state) {
            const starredSection = document.getElementById('starred-aircraft-section');
            if (state) {
                if (starredSection) {
                    starredSection.classList.remove('hidden-by-setting');
                }
                const starredContainer = document.getElementById('starred-list-container');
                if (starredContainer) {
                    starredContainer.style.display = 'block';
                }
                if (SelectedPlane) {
                    updateStarredButtonInInfoblock();
                }
            } else {
                if (starredSection) {
                    starredSection.classList.add('hidden-by-setting');
                }
            }
            updateStarredButtonInInfoblock();
        }
    });

    // ***** FUNCIÓN PARA OCULTAR TOOLTIPS DEL MENÚ DE CONFIGURACIONES *****
    function setHideSettingsTooltips(state) {
        try {
            const sel = '#settings_infoblock [title], #settingsLeft [title], #settingsRight [title]';
            if (state) {
                document.querySelectorAll(sel).forEach(n => {
                    if (!n.dataset.origTitle) n.dataset.origTitle = n.getAttribute('title') || '';
                    n.removeAttribute('title');
                });
            } else {
                if (document.body.classList.contains('hide-tooltips-all')) return;
                const sel2 = '#settings_infoblock [data-orig-title], #settingsLeft [data-orig-title], #settingsRight [data-orig-title]';
                document.querySelectorAll(sel2).forEach(n => {
                    if (n.dataset.origTitle !== undefined) {
                        n.setAttribute('title', n.dataset.origTitle);
                        delete n.dataset.origTitle;
                    }
                });
            }
        } catch (e) { console.error(e); }
    };

    // ***** FUNCIÓN PARA OCULTAR TODOS LOS TOOLTIPS *****
    function setHideAllTooltips(state) {
        try {
            if (state) {
                document.body.classList.add('hide-tooltips-all');
                document.querySelectorAll('[title]').forEach(n => {
                    if (!n.dataset.origTitle) n.dataset.origTitle = n.getAttribute('title') || '';
                    n.removeAttribute('title');
                });
            } else {
                document.body.classList.remove('hide-tooltips-all');
                document.querySelectorAll('[data-orig-title]').forEach(n => {
                    if (n.dataset.origTitle !== undefined) {
                        n.setAttribute('title', n.dataset.origTitle);
                        delete n.dataset.origTitle;
                    }
                });
            }
        } catch (e) { console.error(e); }
    };


    // ***** BOTONES DE VELOCIDAD Y DETENER DEL HISTORIAL *****
    jQuery('#tStop').on('click', function () {
        traceOpts.animate = false;
        traceOpts.replaySpeed = 0;
        if (traceOpts.showTimeout) {
            clearTimeout(traceOpts.showTimeout);
            traceOpts.showTimeout = null;
        }
        gotoTime(traceOpts.showTime);
    });
    jQuery('#t1x').on('click', function () { traceOpts.animate = true; traceOpts.replaySpeed = 1; if (traceOpts.showTime != null) playTraceFrom(traceOpts.showTime); });
    jQuery('#t5x').on('click', function () { traceOpts.animate = true; traceOpts.replaySpeed = 5; if (traceOpts.showTime != null) playTraceFrom(traceOpts.showTime); });
    jQuery('#t10x').on('click', function () { traceOpts.animate = true; traceOpts.replaySpeed = 10; if (traceOpts.showTime != null) playTraceFrom(traceOpts.showTime); });
    jQuery('#t20x').on('click', function () { traceOpts.animate = true; traceOpts.replaySpeed = 20; if (traceOpts.showTime != null) playTraceFrom(traceOpts.showTime); });
    jQuery('#t40x').on('click', function () { traceOpts.animate = true; traceOpts.replaySpeed = 40; if (traceOpts.showTime != null) playTraceFrom(traceOpts.showTime); });

    // ***** CATEGORÍA SYSTEM *****

    // ***** AUTOSELECCIONAR AVIÓN *****
    createToggle({
        key: "autoselect",
        display: 'auto_select_plane',
        displayKey: 'auto_select_plane',
        tooltip: 'auto_select_plane_tooltip',
        tooltipKey: 'auto_select_plane_tooltip',
        container: "#category-system-container",
        init: autoselect,
        setState: function (state) {
            autoselect = state;
            setAutoselect();
        }
    });

    if (usp.has('autoselect')) {
        autoselect = true;
        setAutoselect();
    }

    // ***** MOSTRAR TODOS LOS LOGS DE DEBUG *****
    createToggle({
        key: "debugAll",
        display: 'debug_show_all',
        displayKey: 'debug_show_all',
        tooltip: 'debug_show_all_tooltip',
        tooltipKey: 'debug_show_all_tooltip',
        container: "#category-system-container",
        init: false,
        setState: function (state) {
            if (state)
                debugAll = true;
            else
                debugAll = false;
        }
    });

    // ***** MOSTRAR LOS LOGS DE DEBUG DE LAS TRAZAS *****
    createToggle({
        key: "debugTracks",
        display: 'debug_tracks',
        displayKey: 'debug_tracks',
        tooltip: 'debug_tracks_tooltip',
        tooltipKey: 'debug_tracks_tooltip',
        container: "#category-system-container",
        init: false,
        setState: function (state) {
            debugTracks = state;
            remakeTrails();
        }
    });

    // ***** OCULTAR TODOS LOS TOOLTIPS *****
    createToggle({
        key: "hideAllTooltips",
        display: 'hide_all_tooltips',
        displayKey: 'hide_all_tooltips',
        tooltip: 'hide_all_tooltips_tooltip',
        tooltipKey: 'hide_all_tooltips_tooltip',
        container: "#category-system-container",
        init: false,
        setState: function (state) {
            setHideAllTooltips(state);
        }
    });

    // ***** OCULTAR LOS TOOLTIPS DEL MENÚ DE CONFIGURACIONES *****
    createToggle({
        key: "hideSettingsTooltips",
        display: 'hide_settings_tooltips',
        displayKey: 'hide_settings_tooltips',
        tooltip: 'hide_settings_tooltips_tooltip',
        tooltipKey: 'hide_settings_tooltips_tooltip',
        container: "#category-system-container",
        init: false,
        setState: function (state) {
            setHideSettingsTooltips(state);
        }
    });

    // ***** MOSTRAR EN LA URL LOS FILTROS APLICADOS AL SISTEMA *****
    createToggle({
        key: "shareFilters",
        display: 'include_filters_in_urls',
        displayKey: 'include_filters_in_urls',
        tooltip: 'include_filters_in_urls_tooltip',
        tooltipKey: 'include_filters_in_urls_tooltip',
        container: "#category-system-container",
        init: false,
        setState: function (state) {
            updateAddressBar();
        }
    });

    // ***** ACTUALIZAR UBICACIÓN DEL GPS *****
    createToggle({
        key: "updateLocation",
        display: 'update_gps_location',
        displayKey: 'update_gps_location',
        tooltip: 'update_gps_location_tooltip',
        tooltipKey: 'update_gps_location_tooltip',
        container: "#category-system-container",
        init: updateLocation,
        setState: function (state) {
            updateLocation = state;
            runAfterLoad(watchPosition);
        }
    });

    // ***** CATEGORÍA DISPLAY *****

    // ***** AVIONES COLOREADOS SEGÚN LEYENDA DE LA TABLA DE ALTITUD *****
    createToggle({
        key: "ColoredPlanes",
        display: 'colored_planes',
        displayKey: 'colored_planes',
        tooltip: 'colored_planes_tooltip',
        tooltipKey: 'colored_planes_tooltip',
        container: "#category-display-container",
        init: true,
        setState: function (state) {
            if (state)
                monochromeMarkers = null;
            else
                monochromeMarkers = "#EEEEEE";

            refreshFeatures();
        }
    });

    // ***** TRAZAS COLOREADAS SEGÚN LEYENDA DE LA TABLA DE ALTITUD *****
    createToggle({
        key: "ColoredTrails",
        display: 'colored_trails',
        displayKey: 'colored_trails',
        tooltip: 'colored_trails_tooltip',
        tooltipKey: 'colored_trails_tooltip',
        container: "#category-display-container",
        init: true,
        setState: function (state) {
            if (state)
                monochromeTracks = null;
            else
                monochromeTracks = "#000000";

            remakeTrails();
        }
    });

    // ***** MANEJAR VISIBILIDAD DEL SIDEBAR DERECHO *****
    new Toggle({
        key: "sidebar_visible",
        display: "Sidebar visible",
        container: null,
        checkbox: null,
        button: '#toggle_sidebar_button',
        init: false,
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

    if (!showPictures) {
        planespottingAPI = false;
        planespottersAPI = false;
    }

    // ***** CATEGORÍA INFORMATION *****

    // ***** MOSTRAR INFOBLOCK IZQUIERDO DE LA AEROANVE SELECCIONADA *****
    createToggle({
        key: "enableInfoblock",
        display: 'enable_infoblock',
        displayKey: 'enable_infoblock',
        tooltip: 'enable_infoblock_tooltip',
        tooltipKey: 'enable_infoblock_tooltip',
        container: "#category-info-container",
        init: true,
        setState: function (state) {
            adjustInfoBlock();
        }
    });

    // ***** BLOQUEAR LA APARICIÓN DEL INFOBLOCK HOVER AL HACER MOUSEOVER *****
    createToggle({
        key: "enableMouseover",
        display: 'enable_mouseover_block',
        displayKey: 'enable_mouseover_block',
        tooltip: 'enable_mouseover_block_tooltip',
        tooltipKey: 'enable_mouseover_block_tooltip',
        container: "#category-info-container",
        init: enableMouseover,
        setState: function (state) {
            enableMouseover = state;
            if (loadFinished) {
                checkPointermove();
            }
        }
    });

    // ***** MOSTRAR RUTA DE LA AERONAVE SELECCIONADA *****
    if (routeApiUrl) {
        if (location.protocol == 'http:' && routeApiUrl == "https://adsb.im/api/0/routeset") {
            // adsb.im API provider kindly asks that tar1090 uses http for the route API if possible
            routeApiUrl = "https://adsb.im/api/0/routeset";
        }
        createToggle({
            key: "useRouteAPI",
            display: 'lookup_route',
            displayKey: 'lookup_route',
            tooltip: 'lookup_route_tooltip',
            tooltipKey: 'lookup_route_tooltip',
            container: "#category-info-container",
            init: useRouteAPI,
            setState: function (state) {
                useRouteAPI = state;
                if (useRouteAPI) {
                    jQuery('#routeRow').show();
                    jQuery('#routeRowHighlight').show();
                    jQuery('#routeRowHighlighted').show();
                } else {
                    jQuery('#routeRow').hide();
                    jQuery('#routeRowHighlight').hide();
                    jQuery('#routeRowHighlighted').hide();
                }
            }
        });
        if (useIataAirportCodes == false) {
            routeDisplay = 'icao'; // cope with deprecated useIata var
        }
        if (usp.has('routeDisplay')) {
            routeDisplay = usp.get('routeDisplay');
        }
        routeDisplay = routeDisplay.split(',');
    } else {
        useRouteAPI = false;
    }

    // ***** UTILIZAR LAS FOTOS DE LA FUENTE PLANESPOTTING *****
    createToggle({
        key: "planespottingAPI",
        display: 'pictures_planespotting_be',
        displayKey: 'pictures_planespotting_be',
        tooltip: 'pictures_planespotting_be_tooltip',
        tooltipKey: 'pictures_planespotting_be_tooltip',
        container: "#category-info-container",
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

    // ***** USAR LAS FOTOS DE LA FUENTE PLANESPOTTERS *****
    createToggle({
        key: "planespottersAPI",
        display: 'pictures_planespotters_net',
        displayKey: 'pictures_planespotters_net',
        tooltip: 'pictures_planespotters_net_tooltip',
        tooltipKey: 'pictures_planespotters_net_tooltip',
        container: "#category-info-container",
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

    // ***** QUE EL INFOBLOCK SEA MÁS ANCHO *****
    createToggle({
        key: "wideInfoblock",
        display: 'wide_infoblock',
        displayKey: 'wide_infoblock',
        tooltip: 'wide_infoblock_tooltip',
        tooltipKey: 'wide_infoblock_tooltip',
        container: "#category-info-container",
        init: true,
        setState: function (state) {
            wideInfoBlock = state;
            adjustInfoBlock();
        }
    });

    if (onMobile) {
        enableMouseover = false;
        (typeof hideById != 'undefined') && (hideById) && (hideById('tracking_leaderboard_container'));
    }

    jQuery('#selectall_checkbox').on('click', function () {
        if (jQuery('#selectall_checkbox').hasClass('settingsCheckboxChecked')) {
            deselectAllPlanes();
        } else {
            selectAllPlanes();
        }
    })

    jQuery("#sidebar_container").on("resize", function () {
        clearTimeout(mapResizeTimeout);
        mapResizeTimeout = setTimeout(updateMapSize, 20);
    });

    filterGroundVehicles(false);
    filterBlockedMLAT(false);

    TAR.altitudeChart.init();

    if (aggregator) {
        jQuery('#aggregator_header').show();
        jQuery('#credits').show();
        if (!onMobile) {
            jQuery('#creditsSelected').show();
        }
        jQuery('#selected_infoblock').addClass('aggregator-selected-bg');

        // activate to prevent iframe use
        if (inhibitIframe && window.self != window.top) {
            window.top.location.href = "https://www.aggregator.com/";
            return;
        }
    }
    if (imageConfigLink != "") {
        let host = window.location.hostname;
        let configLink = imageConfigLink.replace('HOSTNAME', host);
        jQuery('#imageConfigLink').attr('href', configLink)
        jQuery('#imageConfigLink').text(imageConfigText)
        jQuery('#imageConfigHeader').show();
    }
    if (aiscatcher_server) {
        aiscatcher_server = aiscatcher_server.replace('HOSTNAME', window.location.hostname);
    }

    if (hideButtons) {
        showHideButtons();
        runAfterLoad(showHideButtons);
    }

    initCategoryResetButtons();

    // ***** REDIMENSIONAR SIDEBAR *****
    (function () {
        const settingsWindow = document.getElementById('settings_infoblock');
        const dragHandle = document.getElementById('settings_window_header');
        const resetSizeBtn = document.getElementById('settings_reset_size_btn');

        if (!settingsWindow || !dragHandle) return;

        const DEFAULT_WIDTH = '453px';
        const DEFAULT_HEIGHT = 'auto';

        if (!document.getElementById('settings_resize_handle')) {
            const handle = document.createElement('div');
            handle.id = 'settings_resize_handle';
            handle.style.cssText = 'position: absolute; bottom: 0; right: 0; width: 16px; height: 16px; cursor: nw-resize; background: linear-gradient(135deg, transparent 50%, #888 50%); border-radius: 0 0 8px 0; z-index: 10002;';
            settingsWindow.appendChild(handle);
        }

        settingsWindow.style.position = 'fixed';
        settingsWindow.style.top = '80px';
        settingsWindow.style.left = '20px';
        settingsWindow.style.resize = 'both';
        settingsWindow.style.overflow = 'auto';
        settingsWindow.style.minWidth = '400px';
        settingsWindow.style.minHeight = '300px';
        const savedWidth = localStorage.getItem('settings_window_width');
        const savedHeight = localStorage.getItem('settings_window_height');

        if (savedWidth && savedHeight) {
            settingsWindow.style.width = savedWidth;
            settingsWindow.style.height = savedHeight;
        } else {
            settingsWindow.style.width = DEFAULT_WIDTH;
            settingsWindow.style.height = DEFAULT_HEIGHT;
        }

        if (resetSizeBtn) {
            resetSizeBtn.onclick = function (e) {
                e.stopPropagation();
                settingsWindow.style.width = DEFAULT_WIDTH;
                settingsWindow.style.height = DEFAULT_HEIGHT;
                localStorage.removeItem('settings_window_width');
                localStorage.removeItem('settings_window_height');
            };
        }

        const resizeHandle = document.getElementById('settings_resize_handle');
        if (resizeHandle) {
            let isResizing = false;
            let startX, startY, startWidth, startHeight;

            resizeHandle.onmousedown = function (e) {
                e.preventDefault();
                e.stopPropagation();
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = settingsWindow.offsetWidth;
                startHeight = settingsWindow.offsetHeight;
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'nw-resize';
            };

            document.onmousemove = function (e) {
                if (!isResizing) return;
                let newWidth = startWidth + (e.clientX - startX);
                let newHeight = startHeight + (e.clientY - startY);
                newWidth = Math.min(Math.max(400, newWidth), window.innerWidth - 40);
                newHeight = Math.min(Math.max(300, newHeight), window.innerHeight - 40);
                settingsWindow.style.width = newWidth + 'px';
                settingsWindow.style.height = newHeight + 'px';
            };

            document.onmouseup = function () {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.userSelect = '';
                    document.body.style.cursor = '';
                    localStorage.setItem('settings_window_width', settingsWindow.style.width);
                    localStorage.setItem('settings_window_height', settingsWindow.style.height);
                }
            };
        }
    })();
}

// ***** RESETEAR CATEGORÍAS A SU ESTADO POR DEFECTO *****
function resetCategory(category) {
    switch (category) {
        // ***** UNITS *****
        case 'units':
            DisplayUnits = 'nautical';
            loStore['displayUnits'] = DisplayUnits;
            jQuery('#units_selector').val(DisplayUnits).trigger('change');
            break;

        // ***** DISPLAY *****
        case 'display':
            if (toggles['ColoredPlanes']) toggles['ColoredPlanes'].toggle(true);
            if (toggles['ColoredTrails']) toggles['ColoredTrails'].toggle(true);
            if (toggles['altitudeChart']) toggles['altitudeChart'].toggle(false);
            if (toggles['webgl']) toggles['webgl'].toggle(true);
            if (toggles['MapDim']) toggles['MapDim'].toggle(false);
            if (toggles['showLabelUnits']) toggles['showLabelUnits'].toggle(true);
            if (toggles['windLabelsSlim']) toggles['windLabelsSlim'].toggle(false);
            break;

        // ***** FILTERS *****
        case 'filters':
            if (toggles['hideAircraftFunctions']) toggles['hideAircraftFunctions'].toggle(false);
            if (toggles['hideElevationFunction']) toggles['hideElevationFunction'].toggle(false);
            if (toggles['hideDistanceFunctions']) toggles['hideDistanceFunctions'].toggle(false);
            if (toggles['hideLabelFunctions']) toggles['hideLabelFunctions'].toggle(false);
            if (toggles['hideLayerFunctions']) toggles['hideLayerFunctions'].toggle(false);
            if (toggles['hideRecenterFunction']) toggles['hideRecenterFunction'].toggle(false);
            if (toggles['hideReplayFunction']) toggles['hideReplayFunction'].toggle(false);
            if (toggles['hideTrackFunctions']) toggles['hideTrackFunctions'].toggle(false);
            if (toggles['hideZoomFunctions']) toggles['hideZoomFunctions'].toggle(false);
            break;

        // ***** DATA *****
        case 'data':
            if (toggles['baroUseQNH']) toggles['baroUseQNH'].toggle(false);
            if (toggles['geomUseEGM']) toggles['geomUseEGM'].toggle(false);
            if (toggles['utcTimesHistoric']) toggles['utcTimesHistoric'].toggle(true);
            if (toggles['labelsGeom']) toggles['labelsGeom'].toggle(false);
            if (toggles['utcTimesLive']) toggles['utcTimesLive'].toggle(false);
            if (toggles['enableStarredAircraft']) toggles['enableStarredAircraft'].toggle(false);
            break;

        // ***** SYSTEM *****
        case 'system':
            if (toggles['autoselect']) toggles['autoselect'].toggle(false);
            if (toggles['debugAll']) toggles['debugAll'].toggle(false);
            if (toggles['debugTracks']) toggles['debugTracks'].toggle(false);
            if (toggles['hideAllTooltips']) toggles['hideAllTooltips'].toggle(false);
            if (toggles['hideSettingsTooltips']) toggles['hideSettingsTooltips'].toggle(false);
            if (toggles['shareFilters']) toggles['shareFilters'].toggle(false);
            if (toggles['updateLocation']) toggles['updateLocation'].toggle(false);
            break;

        // ***** INFORMATION *****
        case 'info':
            if (toggles['enableInfoblock']) toggles['enableInfoblock'].toggle(true);
            if (toggles['enableMouseover']) toggles['enableMouseover'].toggle(true);
            if (toggles['useRouteAPI']) toggles['useRouteAPI'].toggle(true);
            if (toggles['planespottingAPI']) toggles['planespottingAPI'].toggle(false);
            if (toggles['planespottersAPI']) toggles['planespottersAPI'].toggle(true);
            if (toggles['wideInfoblock']) toggles['wideInfoblock'].toggle(true);
            break;
    }

    if (typeof refreshFilter === 'function') refreshFilter();
    if (typeof adjustInfoBlock === 'function') adjustInfoBlock();
    if (typeof refreshSelected === 'function') refreshSelected();
}

// ***** BOTÓN PARA RESTABLECER CATEGORÍA A SU ESTADO POR DEFECTO *****
function initCategoryResetButtons() {
    const resetBtns = document.querySelectorAll('.category-reset-btn');

    resetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = btn.dataset.category;
            if (category) {
                resetCategory(category);
            }
        });
    });
}

function initLegend(colors) {
    let html = '';
    html += '<div class="legendTitle" style="background-color:' + colors['adsb'] + ';">ADS-B</div>';
    html += '<div class="legendTitle" style="background-color:' + colors['uat'] + ';">UAT / ADS-R</div>';
    html += '<div class="legendTitle" style="background-color:' + colors['mlat'] + ';">MLAT</div>';
    html += '<br>';
    html += '<div class="legendTitle" style="background-color:' + colors['tisb'] + ';">TIS-B</div>';
    if (!globeIndex)
        html += '<div class="legendTitle" style="background-color:' + colors['modeS'] + ';">Mode-S</div>';
    if (globeIndex)
        html += '<div class="legendTitle" style="background-color:' + colors['other'] + ';">Other</div>';
    if (aiscatcher_server)
        html += '<div class="legendTitle" style="background-color:' + colors['ais'] + ';">AIS</div>';
    html += '<div class="legendTitle" style="background-color:' + colors['adsc'] + `;">${jaeroLabel}</div>`;

    document.getElementById('legend').innerHTML = html;
}

function initSourceFilter(colors) {
    const createFilter = function (color, text, key) {
        return '<li class="ui-widget-content" style="background-color:' + color + ';" id="source-filter-' + key + '">' + text + '</li>';
    };

    let html = '';
    html += createFilter(colors['adsb'], 'ADS-B', sources[0]);

    html += createFilter(colors['uat'], 'UAT / ADS-R', sources[1][0]);
    html += createFilter(colors['mlat'], 'MLAT', sources[2]);
    html += createFilter(colors['tisb'], 'TIS-B', sources[3]);
    html += createFilter(colors['modeS'], 'Mode-S', sources[4]);
    html += createFilter(colors['other'], 'Other', sources[5]);
    html += createFilter(colors['adsc'], jaeroLabel, sources[6]);

    if (aiscatcher_server) {
        html += createFilter(colors['ais'], 'AIS', sources[7]);
    }

    document.getElementById('sourceFilter').innerHTML = html;

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

    jQuery("#sourceFilter").on("selectablestart", function (event, ui) {
        event.originalEvent.ctrlKey = true;
    });
}

function initFlagFilter(colors) {
    const createFilter = function (color, text, key) {
        return '<li class="ui-widget-content" style="background-color:' + color + ';" id="flag-filter-' + key + '">' + text + '</li>';
    };

    let html = '';
    html += createFilter(
        colors['tisb'],
        '<span data-i18n="military">Military</span>',
        flagFilterValues[0]
    );
    //html += createFilter(colors['mlat'], 'Interesting');
    html += createFilter(colors['uat'], 'PIA', flagFilterValues[1]);
    html += createFilter(colors['adsb'], 'LADD', flagFilterValues[2]);

    document.getElementById('flagFilter').innerHTML = html;

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

    jQuery("#flagFilter").on("selectablestart", function (event, ui) {
        event.originalEvent.ctrlKey = true;
    });
}

function push_history() {
    HistoryItemsReturned = 0;
    PositionHistoryBuffer = [];

    for (let i = 0; i < nHistoryItems; i++) {
        push_history_item(i);
    }
}

function push_history_item(i) {
    deferHistory[i]
        .done(function (json) {
            HistoryItemsReturned++;

            if (HistoryChunks) {
                if (json && json.files) {
                    //g.refreshHistory && console.log("itemsreturned chunk: " + HistoryItemsReturned + " chunklen: " + json.files.length);
                    for (let i in json.files) {
                        PositionHistoryBuffer.push(json.files[i]);
                        if (i == 0 || i == json.files.length - 1) {
                            //g.refreshHistory && console.log("history buffer push: " + localTime(new Date(json.files[i].now * 1000)));
                        }
                    }
                } else if (json && json.now) {
                    //g.refreshHistory && console.log("itemsreturned simple json: " + HistoryItemsReturned);
                    PositionHistoryBuffer.push(json);
                    //g.refreshHistory && console.log("history buffer push: " + localTime(new Date(json.now * 1000)));
                }
            } else {
                PositionHistoryBuffer.push(json);
            }

            if (HistoryItemsReturned == nHistoryItems) {
                parseHistory();
            }
            if (HistoryItemsReturned > nHistoryItems) {
                console.log(localTime(new Date()) + " WARNING: (HistoryItemsReturned > nHistoryItems)");
            }
        })

        .fail(function (jqxhr, status, error) {

            //Doesn't matter if it failed, we'll just be missing a data point
            //console.log(error);
            HistoryItemsReturned++;
            if (HistoryItemsReturned == nHistoryItems) {
                parseHistory();
            }
        });
}

function parseHistory() {
    console.timeEnd("Downloaded History");
    console.time("Loaded aircraft tracks from History");

    for (let i in deferHistory)
        deferHistory[i] = null;
    deferHistory = null;


    if (PositionHistoryBuffer.length > 0) {

        // Sort history by timestamp
        console.log(localTime(new Date()) + " Sorting history: " + PositionHistoryBuffer.length);
        PositionHistoryBuffer.sort(function (x, y) { return (y.now - x.now); });

        let currentTime = new Date().getTime() / 1000;

        if (!pTracks && !noVanish) {
            // get all planes within the reapTimeout
            g.historyKeep = {};
            for (let i = 0; i < PositionHistoryBuffer.length; i++) {
                let data = PositionHistoryBuffer[i];
                if (currentTime - data.now > reapTimeout) {
                    break;
                }
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
            for (let i in g.planesOrdered) {
                let hex = g.planesOrdered[i].icao;
                g.historyKeep[hex] = 1;
            }
        }

        // Process history
        let data;
        let h = 0;
        let pruneInt = 100;
        let lastTimestamp = 0;
        let counter = 0;

        while (data = PositionHistoryBuffer.pop()) {
            counter++;

            if (data.now < lastTimestamp) {
                console.log('parseHistory sorting issue');
            }

            if (lastTimestamp && data.now - lastTimestamp > 15) {
                console.log("History " + String(counter).padStart(4) + " from: "
                    + localTime(new Date(data.now * 1000)) + " GAP: " + localTime(new Date(lastTimestamp * 1000)));
            }

            lastTimestamp = data.now;

            if (pTracks && currentTime - data.now > pTracks * 3600) {
                continue;
            }

            if (g.refreshHistory && now > data.now) {
                continue;
            }

            // process new data
            if (PositionHistoryBuffer.length < 10) {
                processReceiverUpdate(data, false);
            } else {
                processReceiverUpdate(data, true);
            }

            ++h;
            if (h == 1 || h % pruneInt == 0 || PositionHistoryBuffer.length == 0) {
                console.log("Apply History " + String(counter).padStart(4) + " from: "
                    + localTime(new Date(data.now * 1000)));
            }
        }

        // only restrict aircraft process to this list while parsing history
        g.historyKeep = null;

        reaper();

        // Final pass to update all planes to their latest state
        //console.log("Final history cleanup pass");
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

    if (g.refreshHistory) {
        g.refreshHistory = false;
        noLongerHidden();
        return;
    }

    historyLoaded.resolve();
}

let replay_was_active = false;


let timers = {};
let timersActive = false;
function clearIntervalTimers(arg) {
    if (!timersActive) {
        console.trace();
        return;
    }

    if (loadFinished && arg != 'silent') {
        console.log(localTime(new Date()) + ' clear timers');
        jQuery("#timers_paused_detail").text('Timers paused (tab hidden).');
        jQuery("#timers_paused").css('display', 'block');
    }
    const entries = Object.entries(timers);
    for (let i in entries) {
        clearInterval(entries[i][1]);
    }

    timersActive = false;

    // in case the visibility changed while this was running
    handleVisibilityChange();
}

function setIntervalTimers() {
    if (timersActive) {
        return;
    }

    if (loadFinished) {
        jQuery("#timers_paused").css('display', 'none');
    }
    console.log(localTime(new Date()) + " set timers ");
    if (dynGlobeRate && !uuid) {
        timers.globeRateUpdate = setInterval(globeRateUpdate, 180000);
    }
    pollPositionInterval();
    setAutoselect();

    timers.checkMove = setInterval(checkMovement, 50);
    timers.everySecond = setInterval(everySecond, 850);

    //timers.reaper = setInterval(reaper, 40000);

    if (tempTrails) {
        timers.trailReaper = window.setInterval(trailReaper, 10000);
        trailReaper(now);
    }
    if (enable_pf_data && !pTracks && !globeIndex) {
        jQuery('#pf_info_container').removeClass('hidden');
        timers.pf_data = window.setInterval(fetchPfData, RefreshInterval * 10.314);
        fetchPfData();
    }
    if (actualOutline.enabled) {
        timers.drawOutline = window.setInterval(drawOutlineJson, actualOutline.refresh);
        setTimeout(drawOutlineJson, 50);
    }

    if (aiscatcher_server) {
        timers.aiscatcher = setInterval(updateAIScatcher, aiscatcher_refresh * 1000);
        updateAIScatcher();
    }
    if (droneJson) {
        timers.droneJson = setInterval(updateDrones, droneRefresh * 1000);
        updateDrones();
    }

    timersActive = true;

    fetchData();

    // in case the visibility changed while this was running
    handleVisibilityChange();
}

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

function handleDrones(data) {
    g.droneLast = g.droneNow || 0;
    g.droneNow = new Date().getTime() / 1000;

    for (let i in data) {
        processDrone(data[i], g.droneNow, g.droneLast);
    }
}

function processDrone(drone, now, last) {
    const hex = drone.id;

    // Do we already have this plane object in g.planes?
    // If not make it.
    let plane = g.planes[hex]

    if (!plane) {
        plane = new PlaneObject(hex);
    }

    let ac = drone;

    ac.type = 'other';
    ac.t = 'DRON';
    ac.gs = drone.speed / 1852 * 3600; // m/s to knots
    ac.flight = drone.description;
    ac.alt_baro = drone.alt * 3.28; // m to ft
    ac.baro_rate = drone.vspeed * 3.28 * 60; // m/s to fpm

    ac.seen = now - new Date(drone.time).getTime() / 1000;

    if (drone.lat && drone.lon) {
        ac.lat = drone.lat;
        ac.lon = drone.lon
        ac.seen_pos = ac.seen;
    }
    //console.log(ac);

    plane.updateData(now, last, ac, false);
}

function updateAIScatcher() {
    let req = jQuery.ajax({
        url: aiscatcher_server + '/geojson',
        dataType: 'text',
    });

    req.done(function (data) {
        //console.log(data);
        g.aiscatcher_source.setUrl("data:text/plain;base64," + btoa(data));
        g.aiscatcher_source.refresh();

        if (1 || aiscatcher_test) {
            processAIS(JSON.parse(data));
        }
    });
}

function processAIS(data) {
    g.ais_last = g.ais_now || 0;
    g.ais_now = new Date().getTime() / 1000;

    const features = data.features;
    aisTimeout = data.time_span || aisTimeout;
    for (let i in features) {
        processBoat(features[i], g.ais_now, g.ais_last);
    }
}

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

function processBoat(feature, now, last) {
    const pr = feature.properties;
    const hex = 'MMSI' + pr.mmsi;

    // Do we already have this plane object in g.planes?
    // If not make it.
    let plane = g.planes[hex]

    if (!plane) {
        plane = new PlaneObject(hex);
        plane.country = pr.country;
        plane.country_code = pr.country;
        plane.baseScale = 0.2;
    }

    let ac = {};

    ac.type = 'ais';
    ac.gs = pr.speed;
    ac.flight = pr.callsign;
    ac.r = pr.shipname;
    ac.seen = now - pr.last_signal;

    ac.messages = pr.count;
    ac.rssi = pr.level;

    ac.track = pr.cog;

    if (pr.destination) { ac.route = pr.destination; }
    if (pr.shiptype !== undefined) { ac.t = shortShiptype(pr.shiptype); }
    // Identify Non-Ship Types
    if (pr.mmsi_type == 6) { ac.t = "ANAV"; } // Aids to Navigation
    if (pr.mmsi_type == 5) { ac.t = "BASE"; } // Land Base Station
    if (pr.mmsi_type == 3) { ac.t = "COAS"; } // Coast Station


    if (feature.geometry && feature.geometry.coordinates) {
        const coords = feature.geometry.coordinates;
        ac.lat = coords[1];
        ac.lon = coords[0];
        ac.seen_pos = now - pr.last_signal;
    }
    //console.log(ac);

    plane.updateData(now, last, ac, false);
}

let djson;
let dstring;
let dresult;

function startPage() {
    if (!heatmap)
        jQuery("#loader").hide();

    changeZoom("init");
    changeCenter("init");

    processURLParams();
    if (usp.has('reg')) {
        let req = regIcaoDownload();
        req.done(function () {
            const queries = usp.get('reg').split(',');
            for (let i in queries) {
                let icao = db.regCache[queries[i].toUpperCase()];
                if (icao) {
                    icao = icao.toLowerCase();
                    urlIcaos.push(icao);
                }
            }
            processURLParams();
        });
    }

    loadFinished = true;
    appReady = true;
    setIntervalTimers();

    if (tempTrails)
        selectAllPlanes();

    if (replay) {
        showReplayBar();
        loadReplay(replay.ts);
    }

    if (heatmap) {
        drawHeatmap();
    }

    initVisibilityChange();

    if (pTracks)
        setTimeout(TAR.planeMan.refresh, 10000);

    window.addEventListener("beforeunload", clearIntervalTimers);

    setTimeout(afterFirstFetch, 50);

    console.timeEnd("Page Load");
}

//
// Utils begin
//
(function (global, jQuery, TAR) {
    let utils = TAR.utils = TAR.utils || {};

    // Make a LineString with 'points'-number points
    // that is a closed circle on the sphere such that the
    // great circle distance from 'center' to each point is
    // 'radius' meters
    utils.make_geodesic_circle = function (center, radius, points) {
        const angularDistance = radius / 6378137.0;
        const lon1 = center[0] * Math.PI / 180.0;
        const lat1 = center[1] * Math.PI / 180.0;

        let geom;
        for (let i = 0; i <= points; ++i) {
            const bearing = i * 2 * Math.PI / points;

            let lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) +
                Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing));
            let lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
                Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));

            lat2 = lat2 * 180.0 / Math.PI;
            lon2 = lon2 * 180.0 / Math.PI;

            if (!geom)
                geom = new ol.geom.LineString([[lon2, lat2]]);
            else
                geom.appendCoordinate([lon2, lat2]);
        }
        return geom;
    }

    return TAR;
}(window, jQuery, TAR || {}));
//
// Utils end
//
//

function webglAddLayer() {
    let success = false;

    const icao = 'c0ffee';

    if (icaoFilter != null) {
        icaoFilter.push(icao);
    }

    processAircraft({
        hex: icao, lat: CenterLat, lon: CenterLon, type: 'tisb_other', seen: 0, seen_pos: 0,
        alt_baro: 25000,
    });
    let plane = g.planes[icao];

    let spriteSrc = spritesDataURL ? spritesDataURL : 'images/sprites_193a0304570bcce84c40d8bd51c6397b.png';
    //console.log(spriteSrc);
    try {
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
        if (!webglLayer)
            return false;
        if (loStore['webglTested'] != 'true' && !webglLayer.getRenderer()) {
            return false;
        }

        layers.push(webglLayer);

        webgl = true;

        // only test webgl once in every browser
        // after that assume that it's working

        if (loStore['webglTested'] != 'true') {
            plane.visible = true;
            plane.updateMarker();
            OLMap.renderSync();
        }

        loStore['webglTested'] = 'true';
        success = true;
    } catch (error) {
        try {
            layers.remove(webglLayer);
        } catch (error) {
            console.error(error);
        }
        console.error(error);
        success = false;
    }
    delete g.planes[plane.icao];
    g.planesOrdered.splice(g.planesOrdered.indexOf(plane), 1);
    plane.destroy();

    if (icaoFilter != null) {
        icaoFilter.pop(icao);
    }

    return success;
}

function webglInit() {
    let init = true;

    // ***** WEBGL - PARTE DE LA CATEGORÍA DISPLAY *****
    createToggle({
        key: "webgl",
        display: 'webgl',
        displayKey: 'webgl',
        tooltip: 'webgl_tooltip',
        tooltipKey: 'webgl_tooltip',
        container: "#category-display-container",
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

function ol_map_init() {

    if (0) {
        let canvas = iconTest();
        spritesDataURL = canvas.toDataURL();
        jQuery('#iconTestCanvas').remove();
        console.log(spritesDataURL);
    }

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

    console.time('webglInit');
    webglInit();
    console.timeEnd('webglInit');


    let foundType = false;
    ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
        if (lyr.get('name') && lyr.get('type') == 'base') {
            if (MapType_tar1090 == lyr.get('name')) {
                foundType = true;
            }
        }
    });
    if (!foundType) {
        MapType_tar1090 = "osm";
    }

    ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
        if (!lyr.get('name'))
            return;

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

                    // ***** ACTIVAR/DESACTIVAR GRUPOS DE CAPAS *****
                    try {
                        let currentParentGroup = null;
                        layers_group.getLayers().forEach(group => {
                            if (group instanceof ol.layer.Group) {
                                if (group.getLayers().getArray().includes(evt.target)) {
                                    currentParentGroup = group;
                                }
                            }
                        });
                        if (currentParentGroup) {
                            layers_group.getLayers().forEach(group => {
                                if (group instanceof ol.layer.Group) {
                                    if (['fir', 'world', 'projection_tool'].includes(group.get('name'))) {
                                        return;
                                    }
                                    if (group === currentParentGroup) {
                                        group.getLayers().forEach(l => {
                                            if (l.get('type') === 'overlay') {
                                                l.setVisible(true);
                                            }
                                        });
                                    } else {
                                        group.getLayers().forEach(l => {
                                            if (l.get('type') === 'overlay') {
                                                l.setVisible(false);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Error en gestión de capas:", e);
                    }
                }
            });
        } else if (lyr.get('type') === 'overlay') {
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

            lyr.on('change:visible', function (evt) {
                loStore['layer_' + evt.target.get('name')] = evt.target.getVisible();
            });
        }
    })

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

    OLProj = OLMap.getView().getProjection();
    OLProjExtent = OLProj.getExtent();

    OLMap.getView().setRotation(g.mapOrientation); // adjust orientation

    OLMap.addControl(new ol.control.LayerSwitcher({
        groupSelectStyle: 'none',
        activationMode: 'click', // click sucks in the current implementation
        target: 'layer-select',
    }));

    // ***** ESCUCHAR CLA ACTUALIZACIÓN DE LOS TÍTULOS DE LAS CAPAS *****
    setTimeout(function () {
        if (typeof window.updateLayerTitles === 'function') {
            window.updateLayerTitles();
        }
    }, 500);

    OLMap.on('movestart', function (event) {
        if (webgl) {
            if (TrackedAircraftPositions > webglIconMapMoveOpacityCrowdedThreshold) {
                webglLayer.setOpacity(webglIconMapMoveOpacityCrowded)
            } else {
                webglLayer.setOpacity(webglIconMapMoveOpacity)
            }
        }
    });

    OLMap.on('moveend', function (event) {
        checkMovement();
        webgl && webglLayer.setOpacity(webglIconOpacity);
        updateZoomIndicator();
    });

    OLMap.getView().on('change:resolution', updateZoomIndicator);

    setTimeout(updateZoomIndicator, 0);

    OLMap.on(['singleclick', 'dblclick'], function (evt) {
        let trailHex = null;
        let trailTS = null;
        let planeHex = null;

        let source = webgl ? webglFeatures : PlaneIconFeatures;
        let evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
        let feature = source.getClosestFeatureToCoordinate(evtCoords);
        if (feature) {
            let fPixel = evt.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates());
            let a = fPixel[0] - evt.pixel[0];
            let b = fPixel[1] - evt.pixel[1];
            let c = globalScale * (onMobile ? 30 : 20);
            if (a ** 2 + b ** 2 < c ** 2) {
                planeHex = feature.hex;
            } else {
                planeHex = null;
            }
        }

        if (!planeHex || showTrace) {
            let features = [];
            let trailFeature = null;
            if (1) {
                for (const layer of trailGroup.getArray()) {
                    if (!layer.getVisible()) {
                        continue;
                    }
                    const source = layer.getSource();
                    trailFeature = source.getClosestFeatureToCoordinate(evtCoords);
                    if (trailFeature) {
                        features.push(trailFeature);
                    }
                }
            } else {
                // old variant, slower in most cases
                features = evt.map.getFeaturesAtPixel(
                    evt.pixel,
                    {
                        layerFilter: function (layer) { return (layer.get('isTrail') == true); },
                        hitTolerance: globalScale * (onMobile ? 30 : 20),
                    }
                );
            }
            if (features.length > 0) {
                let hitTolerance = globalScale * (onMobile ? 30 : 20);
                // just rubber band to the closest trace for showTrace
                if (showTrace) { hitTolerance = 10000; }
                let close2 = hitTolerance * hitTolerance;
                let closest = null;
                for (let j in features) {
                    let feature = features[j];
                    let coords;
                    if (feature.isLabel)
                        coords = [feature.getGeometry().getCoordinates()];
                    else
                        coords = feature.getGeometry().getCoordinates();

                    for (let k in coords) {
                        let fPixel = evt.map.getPixelFromCoordinate(coords[k]);
                        let a = fPixel[0] - evt.pixel[0];
                        let b = fPixel[1] - evt.pixel[1];
                        let distance2 = a ** 2 + b ** 2;
                        if (distance2 < close2) {
                            closest = feature;
                            close2 = distance2;
                        }
                    }
                }
                if (closest) {
                    if (showTrace)
                        trailTS = closest.timestamp;
                    else
                        trailHex = closest.hex;
                }
            }
        }

        const dblclick = (evt.type === 'dblclick') && !showTrace;

        // ***** GARANTIZAR MOVIMIENTO DEL AVIÓN EN REPRODUCCIÓN *****
        if (showTrace && trailTS) {
            planeHex = null;
            traceOpts.animate = false;
            traceOpts.replaySpeed = traceOpts.replaySpeed || 1;
            traceOpts.showTime = trailTS;
            playTraceFrom(trailTS);
        }

        // ***** MANEJADOR DE CLIC (ELEVACIÓN TIERRA-TIERRA) *****
        if (elevationMode) {
            handleElevationClick(evt);
            evt.stopPropagation();
            return;
        }

        // ***** MANEJADOR DE CLIC (ELEVACIÓN TIERRA-AERONAVE) *****
        if (elevationGroundAircraftMode) {
            if (elevationGroundAircraftModeType === 'ground_aircraft') {
                handleElevationGroundAircraftGroundClick(evt, planeHex);
            } else {
                handleElevationGroundAircraftClick(evt, planeHex);
            }
            evt.stopPropagation();
            return;
        }

        // ***** MANEJADOR DE CLIC (DISTANCIA TIERRA-AERONAVE) *****
        if (distanceToGroundMode) {
            handleDistanceToGroundClick(evt, planeHex);
            evt.stopPropagation();
            return;
        }

        // ***** MANEJADOR DE CLIC (DISTANCIA TIERRA-TIERRA) *****
        if (groundToGroundMode) {
            handleGroundToGroundClick(evt, planeHex);
            evt.stopPropagation();
            return;
        }

        // ***** MANEJADOR DE CLIC (PROYECCIÓN DE AERONAVES) *****
        if (window.ProjectionTool && window.ProjectionTool.isActive()) {
            if (window.ProjectionTool.handleClick(evt, planeHex)) {
                return;
            }
        }

        // ***** MANEJADOR DE CLIC (DISTANCIA AERONAVE-AERONAVE) *****
        if (distanceBetweenPlanesMode) {
            handleDistanceBetweenPlanesClick(evt, planeHex);
            evt.stopPropagation();
            return;
        }

        if (planeHex) {
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

function initMapEarly() {

    // Load stored map settings if present
    if (overrideMapType)
        MapType_tar1090 = overrideMapType;
    else if (loStore['MapType_tar1090']) {
        MapType_tar1090 = loStore['MapType_tar1090'];
    }

    mapTypeSettings();

    // Initialize OpenLayers

    layers_group = createBaseLayers();
    layers = layers_group.getLayers();

    //add_kml_overlay('https://developers.google.com/kml/documentation/KML_Samples.kml', 'samples', 0.8);

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

    siteCircleLayer.on('change:visible', function (evt) {
        if (evt.target.getVisible()) {
            runAfterLoad(geoFindMe);
        }
    });

    // ***** ACTUALIZAR TÍTULOS UNA VEZ CREADO EL MENÚ DE CAPAS *****
    setTimeout(function () {
        if (typeof window.updateLayerTitles === 'function') {
            window.updateLayerTitles();
        }
    }, 200);
}

function showHideButtons() {
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
function initMap() {

    CenterLon = Number(lopaStore['CenterLon']) || DefaultCenterLon;
    CenterLat = Number(lopaStore['CenterLat']) || DefaultCenterLat;
    //console.log("initMap Centerlat: " + CenterLat);
    g.zoomLvl = Number(lopaStore['zoomLvl']) || DefaultZoomLvl;
    g.zoomLvlCache = g.zoomLvl;

    // always hide this, it really only shows the number of positions saved
    jQuery('#dump1090_total_history_td').hide();

    if (globeIndex && aggregator) {
        jQuery('#dump1090_message_rate_td').hide();
    }

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

    locationDotLayer.on('change:visible', function (evt) {
        if (evt.target.getVisible()) {
            runAfterLoad(geoFindMe);
        }
    });


    actualOutline.enabled = multiOutline || (receiverJson && receiverJson.outlineJson);

    if (actualOutline.enabled) {
        actualOutline.refresh = 15000;
        actualOutline.url = multiOutline ? 'data/multiOutline.json' : 'data/outline.json';

        actualOutline.features = new ol.source.Vector();
        actualOutline.style = new ol.style.Style({
            fill: null,
            stroke: new ol.style.Stroke({
                color: actual_range_outline_color,
                width: actual_range_outline_width,
                lineDash: actual_range_outline_dash,
            }),
        });
    }
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
        drawUpintheair();
    }


    const dummyLayer = new ol.layer.Vector({
        name: 'dummy',
        renderOrder: null,
        source: new ol.source.Vector(),
    });

    trailGroup.push(dummyLayer);

    trailLayers = new ol.layer.Group({
        // name: 'ac_trail',
        type: 'overlay',
        layers: trailGroup,
        zIndex: 150,
    });

    layers.push(trailLayers);

    iconLayer = new ol.layer.Vector({
        name: 'iconLayer',
        type: 'overlay',
        title: 'Aircraft label',
        source: PlaneIconFeatures,
        declutter: false,
        zIndex: 200,
        renderBuffer: renderBuffer,
    });
    layers.push(iconLayer);

    // ***** DROPDOWN PARA LOS MENÚS DE DISTANCIA *****
    try {
        // ***** PUNTOS A-B EN TIERRA (TIERRA-TIERRA) *****
        if (!ggPointSource) ggPointSource = new ol.source.Vector();
        if (!ggPointLayer) {
            ggPointLayer = new ol.layer.Vector({
                name: 'ggPoints',
                type: 'overlay',
                title: 'A-B Ground points',
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
            ggPointLayer.setSource(ggPointSource);
            ggPointLayer.setVisible(false);
        }
        layers.push(ggPointLayer);

        // ***** LÍNEA A-B (TIERRA-TIERRA) *****
        if (!ggLineSource) ggLineSource = new ol.source.Vector();
        if (!ggLineLayer) {
            ggLineLayer = new ol.layer.Vector({
                name: 'groundToGround',
                type: 'overlay',
                title: 'A-B Line',
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

    // ***** MANEJAR VISIBLIDAD DE CAPA DE PUNTOS TIERRA-AERONAVE *****
    if (groundPointLayer) {
        groundPointLayer.on('change:visible', function (evt) {
            const vis = !!evt.target.getVisible();
            try {
                if (!vis) {
                    return;
                }
                updateDistanceToGroundOverlay();
                if (!distanceGroundUpdateInterval && distanceToGroundMode) {
                    distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);
                }
            } catch (e) { }
        });
    }

    // ***** PUNTO EN TIERRA (TIERRA-AERONAVE) *****
    groundPointSource = new ol.source.Vector();
    groundPointLayer = new ol.layer.Vector({
        name: 'groundPoint',
        type: 'overlay',
        title: 'Ground point',
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

    // ***** LÍNEA A-B (TIERRA-AERONAVE) *****
    groundToPlaneLineSource = new ol.source.Vector();
    groundToPlaneLineLayer = new ol.layer.Vector({
        name: 'groundToPlane',
        type: 'overlay',
        title: 'A-B Line',
        source: groundToPlaneLineSource,
        zIndex: 260,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'blue', width: 2 })
        })
    });
    layers.push(groundToPlaneLineLayer);

    // ***** MANEJAR VISIBILIDAD DE CAPA DE LÍNEA TIERRA-AERONAVE *****
    groundToPlaneLineLayer.on('change:visible', function (evt) {
        const vis = !!evt.target.getVisible();
        if (!vis) {
            try {
                groundPlaneOverlays.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
                groundPlaneOverlays.clear();
            } catch (_) { }
            try {
                groundPlaneOverlaysByHex.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
                groundPlaneOverlaysByHex.clear();
            } catch (_) { }
            if (distanceGroundOverlay) {
                try { distanceGroundOverlay.setPosition(undefined); } catch (_) { }
                try { OLMap && OLMap.removeOverlay(distanceGroundOverlay); } catch (_) { }
                distanceGroundOverlay = null;
            }
        } else {
            try {
                updateDistanceToGroundOverlay();
                if (!distanceGroundUpdateInterval && distanceToGroundMode) {
                    distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);
                }
            } catch (e) { }
        }
    });

    // ***** LÍNEA A-B (AERONAVE-AERONAVE) *****
    distanceLineLayer = new ol.layer.Vector({
        name: 'distanceLines',
        type: 'overlay',
        title: 'A-B Line',
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                width: 2
            })
        }),
        zIndex: 300,
        visible: true,
        renderBuffer: renderBuffer,
    });
    layers.push(distanceLineLayer);


    // ***** NUMERACIÓN (AERONAVE-AERONAVE) *****
    pointNumberSourceAA = new ol.source.Vector();
    pointNumberLayerAA = new ol.layer.Vector({
        name: 'pointNumbers_aa',
        type: 'overlay',
        title: 'Point numbers',
        source: pointNumberSourceAA,
        zIndex: 305,
        visible: true,
        renderBuffer: renderBuffer,
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

    // ***** PUNTOS (TIERRA-AERONAVE) *****
    pointNumberSourceTA = new ol.source.Vector();
    pointNumberLayerTA = new ol.layer.Vector({
        name: 'pointNumbers_ta',
        type: 'overlay',
        title: 'Point numbers',
        source: pointNumberSourceTA,
        zIndex: 305,
        visible: true,
        renderBuffer: renderBuffer,
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

    // ***** PUNTOS (TIERRA-TIERRA) *****
    pointNumberSourceTT = new ol.source.Vector();
    pointNumberLayerTT = new ol.layer.Vector({
        name: 'pointNumbers_tt',
        type: 'overlay',
        title: 'Point numbers',
        source: pointNumberSourceTT,
        zIndex: 305,
        visible: true,
        renderBuffer: renderBuffer,
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

    // ***** PUNTOS (AERONAVE-AERONAVE) *****
    planePointSourceAA = new ol.source.Vector();
    planePointLayerAA = new ol.layer.Vector({
        name: 'planePoints_aa',
        type: 'overlay',
        title: 'Plane point',
        source: planePointSourceAA,
        zIndex: 250,
        visible: true,
        renderBuffer: renderBuffer,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: '#222' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });

    // ***** PUNTO EN AVIÓN (TIERRA-AERONAVE) *****
    planePointSourceTA = new ol.source.Vector();
    planePointLayerTA = new ol.layer.Vector({
        name: 'planePoints_ta',
        type: 'overlay',
        title: 'Plane point',
        source: planePointSourceTA,
        zIndex: 250,
        visible: true,
        renderBuffer: renderBuffer,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: '#222' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
        })
    });

    // ***** INGRESAR CAPAS DE ELEVACIÓN EN SU RESPECTIVO MENÚ DROPDOWN *****
    try {
        const elevGA = window.ensureElevationGroup('ga');
        if (elevGA) {
            const takeLayerFromAnywhere = (layer) => {
                if (!layer) return;
                const idx = layers.getArray().indexOf(layer);
                if (idx >= 0) {
                    layers.removeAt(idx);
                }
                layers.forEach((lyr) => {
                    if (lyr instanceof ol.layer.Group) {
                        const sub = lyr.getLayers().getArray();
                        const i = sub.indexOf(layer);
                        if (i >= 0) {
                            lyr.getLayers().removeAt(i);
                        }
                    }
                });
            };

            takeLayerFromAnywhere(groundPointLayer);
            takeLayerFromAnywhere(groundToPlaneLineLayer);

            takeLayerFromAnywhere(planePointLayerTA);

            [groundToPlaneLineLayer, planePointLayerTA, groundPointLayer]
                .filter(Boolean)
                .forEach(l => elevGA.getLayers().push(l));
        }
    } catch (e) {
        console.error('Error moviendo capas GA al grupo de elevación:', e);
    }

    // ***** MANEJAR VISIBILIDAD DE CAPA DE LÍNEA AERONAVE-AERONAVE *****
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

    // ***** CONSTRUIR DROPDOWN DE DISTANCIA *****
    (function buildDistanceLayerTree() {
        try {
            const takeLayer = (name) => {
                let found = null;
                layers.forEach((l) => {
                    if (l.get && l.get('name') === name) found = l;
                });
                if (found) layers.remove(found);
                return found;
            };

            const lAA = takeLayer('distanceLines');
            const lGA_line = takeLayer('groundToPlane');
            const lGA_point = takeLayer('groundPoint');
            const lGG_line = takeLayer('groundToGround');
            const lGG_point = takeLayer('ggPoints');

            const gGG = window.ensureDistanceGroup('tt');
            const gGA = window.ensureDistanceGroup('ta');
            const gAA = window.ensureDistanceGroup('aa');
            const gE = window.ensureDistanceGroup('elev');

            if (gGG) {
                [lGG_line, lGG_point].filter(Boolean).forEach(l => gGG.getLayers().push(l));
            }
            if (gGA) {
                [lGA_line, lGA_point].filter(Boolean).forEach(l => gGA.getLayers().push(l));
            }
            if (gAA && lAA) {
                gAA.getLayers().push(lAA);
            }

            const distanceRoot = new ol.layer.Group({
                name: 'distance_tools',
                title: 'Distance tools',
                type: 'overlay',
                fold: 'close',
                combine: false,
                layers: new ol.Collection([gGG, gGA, gAA, gE].filter(Boolean))
            });

            let vfrIndex = -2;
            let siteCircleIndex = -2;

            layers.forEach((layer, index) => {
                if (layer.get('title') === 'VFR') vfrIndex = index;
                if (layer.get('name') === 'siteCircles') siteCircleIndex = index;
            });

            if (vfrIndex !== -2 && siteCircleIndex !== -2 && siteCircleIndex > vfrIndex) {
                layers.insertAt(vfrIndex + 2, distanceRoot);
            } else if (vfrIndex !== -2) {
                layers.insertAt(vfrIndex + 2, distanceRoot);
            } else {
                layers.push(distanceRoot);
            }

            window._distanceRootGroup = distanceRoot;

        } catch (e) {
            console.error('Error agrupando capas de distancia:', e);
        }
    })();

    // ***** INSERTAR CAPAS EN ORDEN *****
    try {
        // ***** AERONAVE-AERONAVE *****
        const gAA = window.ensureDistanceGroup('aa');
        if (gAA) {
            const aaSubLayers = gAA.getLayers().getArray().slice();
            aaSubLayers.forEach(l => gAA.getLayers().remove(l));
            // Reinsertar en el orden deseado
            if (planePointLayerAA) gAA.getLayers().push(planePointLayerAA);
            if (distanceLineLayer) gAA.getLayers().push(distanceLineLayer);
            if (pointNumberLayerAA) gAA.getLayers().push(pointNumberLayerAA);
        }

        // ***** TIERRA-AERONAVE *****
        const gTA = window.ensureDistanceGroup('ta');
        if (gTA) {
            const taSubLayers = gTA.getLayers().getArray().slice();
            taSubLayers.forEach(l => gTA.getLayers().remove(l));

            if (groundPointLayer) gTA.getLayers().push(groundPointLayer);
            if (planePointLayerTA) gTA.getLayers().push(planePointLayerTA);
            if (groundToPlaneLineLayer) gTA.getLayers().push(groundToPlaneLineLayer);
            if (pointNumberLayerTA) gTA.getLayers().push(pointNumberLayerTA);
        }

        // ***** TIERRA-TIERRA *****
        const gTT = window.ensureDistanceGroup('tt');
        if (gTT) {
            const ttSubLayers = gTT.getLayers().getArray().slice();
            ttSubLayers.forEach(l => gTT.getLayers().remove(l));

            if (ggPointLayer) gTT.getLayers().push(ggPointLayer);
            if (ggLineLayer) gTT.getLayers().push(ggLineLayer);
            if (pointNumberLayerTT) gTT.getLayers().push(pointNumberLayerTT);
        }
    } catch (e) {
        console.error('Error insertando capas dinámicas en grupos:', e);
    }

    // ***** CAPA DE PUNTOS ELEVACIÓN TIERRA-TIERRA *****
    if (!elevationPointSource) elevationPointSource = new ol.source.Vector();
    elevationPointLayer = new ol.layer.Vector({
        name: 'elev_points',
        type: 'overlay',
        title: 'A-B ground points',
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

    // ***** CAPA DE LÍNEA ELEVACIÓN TIERRA-TIERRA *****
    if (!elevationLineSource) elevationLineSource = new ol.source.Vector();
    elevationLineLayer = new ol.layer.Vector({
        name: 'elev_line',
        type: 'overlay',
        title: 'A-B Line',
        source: elevationLineSource,
        zIndex: 265,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: '#00aaff', width: 2 })
        }),
        visible: true
    });

    // ***** CAPA DE NÚMEROS ELEVACIÓN TIERRA-TIERRA *****
    if (!elevationNumberSourceGG) elevationNumberSourceGG = new ol.source.Vector();
    elevationNumberLayerGG = new ol.layer.Vector({
        name: 'elev_pointnumbers_gg',
        type: 'overlay',
        title: 'Numbering',
        source: elevationNumberSourceGG,
        zIndex: 305,
        visible: true,
        renderBuffer: renderBuffer,
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

    if (typeof groundPointLayer === 'undefined' || !groundPointLayer) {
    }

    // ***** CAPA DE NÚMEROS ELEVACIÓN TIERRA-AERONAVE *****
    if (!elevationNumberSourceGA) elevationNumberSourceGA = new ol.source.Vector();
    elevationNumberLayerGA = new ol.layer.Vector({
        name: 'elev_pointnumbers_ga',
        type: 'overlay',
        title: 'Numbering',
        source: elevationNumberSourceGA,
        zIndex: 305,
        visible: true,
        renderBuffer: renderBuffer,
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

    const elevGG = window.ensureElevationGroup('gg');
    const elevGA = window.ensureElevationGroup('ga');

    // ***** INSERTAR CAPAS EN ORDEN *****

    // ***** ELEVACIÓN TIERRA-TIERRA *****
    if (elevGG) {
        [elevationPointLayer, elevationLineLayer, elevationNumberLayerGG]
            .filter(Boolean)
            .forEach(l => elevGG.getLayers().push(l));
    }

    // ***** ELEVACIÓN TIERRA-AERONAVE *****
    if (elevGA) {
        [elevationNumberLayerGA]
            .filter(Boolean)
            .forEach(l => elevGA.getLayers().push(l));
    }

    // ***** GRUPO RAÍZ DE ELEVACIÓN *****
    const elevRoot = new ol.layer.Group({
        name: 'elevation_tool',
        title: 'Elevation tools',
        type: 'overlay',
        fold: 'close',
        combine: false,
        visible: true,
        layers: new ol.Collection([elevGG, elevGA].filter(Boolean))
    });

    let FIRIndex = 0;
    let distanceIndex = 0;

    layers.forEach((layer, index) => {
        if (layer.get && layer.get('title') === 'Distance tools') {
            distanceIndex = index;
        }
        if (layer.get && layer.get('name') === 'FIR') {
            FIRIndex = index;
        }
    });

    if (distanceIndex !== 0) {
        layers.insertAt(distanceIndex + 0, elevRoot);
    } else if (FIRIndex !== 0) {
        layers.insertAt(FIRIndex + 0, elevRoot);
    } else {
        layers.push(elevRoot);
    }

    ol_map_init();


    // handle the layer settings pane checkboxes
    //OLMap.once('postrender', function(e) {
    //toggleLayer('#nexrad_checkbox', 'nexrad');
    //toggleLayer('#sitepos_checkbox', 'site_pos');
    //toggleLayer('#actrail_checkbox', 'ac_trail');
    //toggleLayer('#acpositions_checkbox', 'webglLayer');
    //});

    // ***** MINIZAR/MAXIMIZAR/CERRAR SELECTED INFOBLOCK *****
    function setInfoBlockMinimized(state) {
        infoBlockMinimized = state;
        jQuery('#selected_infoblock').toggleClass('infoblock-minimized', state);
        let restoreText = 'Restore infoblock';
        let minimizeText = 'Minimize infoblock';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            restoreText = window.translate.t('restore_infoblock') || restoreText;
            minimizeText = window.translate.t('minimize_infoblock') || minimizeText;
        } else if (typeof window.t === 'function') {
            restoreText = window.t('restore_infoblock') || restoreText;
            minimizeText = window.t('minimize_infoblock') || minimizeText;
        }
        jQuery('#infoblock_minimize').attr('title', state ? restoreText : minimizeText);
        jQuery('#infoblock_minimize').text(state ? '▲' : '▼');
        adjustInfoBlock();
    }

    jQuery('#infoblock_minimize').on('click', function () {
        setInfoBlockMinimized(!infoBlockMinimized);
    });

    jQuery('#infoblock_close').on('click', function () {
        if (showTrace)
            toggleShowTrace();
        if (onlySelected)
            toggleIsolation();

        const historyToggle = document.querySelector('.section-toggle[data-target="history_block"]');
        if (historyToggle && historyToggle.getAttribute('aria-expanded') === 'true')
            historyToggle.click();

        deselect(SelectedPlane);
        refreshFilter();
    });

    jQuery(document).on('click', '#infoblocks_container .plane-card-minimize', function () {
        const card = jQuery(this).closest('.plane-card');
        const expanded = card.toggleClass('expanded').hasClass('expanded');
        jQuery(this)
            .attr('title', getPlaneCardText(expanded ? 'plane_card_collapse' : 'plane_card_expand'))
            .attr('aria-label', getPlaneCardText(expanded ? 'plane_card_collapse' : 'plane_card_expand'));
        updateMultiInfoblocksLayout();
    });

    jQuery(document).on('click', '#infoblocks_container .plane-card-close', function () {
        const hex = jQuery(this).closest('.plane-card').data('hex');
        if (hex && g.planes && g.planes[hex]) {
            deselect(g.planes[hex]);
            refreshSelected();
        }
    });

    document.addEventListener('languageChanged', function () {
        if (multiSelect) {
            renderMultiInfoblocks();
        }
    });

    // ***** ESTABLECER MODO OSCURO POR DEFECTO *****
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

    (function applyDarkModePermanently() {
        let root = document.documentElement;
        jQuery(".layer-switcher .panel").css("background", "var(--BGCOLOR1)");
        jQuery(".layer-switcher .panel").css("border", "4px solid var(--BGCOLOR1)");

        root.style.setProperty("--BGCOLOR1", '#313131');
        root.style.setProperty("--BGCOLOR2", '#242424');
        root.style.setProperty("--TXTCOLOR1", "#BFBFBF");
        root.style.setProperty("--TXTCOLOR2", "#D8D8D8");
        root.style.setProperty("--TXTCOLOR3", "#a8a8a8");

        jQuery(".infoblockCloseBox").css('filter', 'invert(100%)');
        jQuery(".infoblockCloseBox").css('-webkit-filter', 'invert(100%)');
        jQuery(".settingsCloseBox").css('filter', 'invert(100%)');
        jQuery(".settingsCloseBox").css('-webkit-filter', 'invert(100%)');

        // Usar colores oscuros para la tabla
        tableColors = tableColorsDark;
    })();

    initLegend(tableColors.unselected);

    initFilters();

    ol.control.LayerSwitcher.forEachRecursive(layers_group, function (lyr) {
        if (lyr.get('type') != 'base')
            return;
        lyr.dimKey = lyr.on('postrender', dim);
    });

    // ***** DIM MAP - PARTE DE LA CATEGORÍA DISPLAY *****
    createToggle({
        key: "MapDim",
        display: 'dim_map',
        displayKey: 'dim_map',
        tooltip: 'dim_map_tooltip',
        tooltipKey: 'dim_map_tooltip',
        container: "#category-display-container",
        // init: MapDim,
        init: false,
        setState: function (state) {
            if (loadFinished) {
                OLMap.render();
            }
            buttonActive('#B', state);
        }
    });

    // ***** LABEL UNITS - PARTE DE LA CATEGORÍA DISPLAY *****
    createToggle({
        key: "showLabelUnits",
        display: 'label_units',
        displayKey: 'label_units',
        tooltip: 'label_units_tooltip',
        tooltipKey: 'label_units_tooltip',
        container: "#category-display-container",
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
            if (distanceBetweenPlanesMode) {
                updateDistanceLine();
            }
        }
    });

    window.addEventListener('keydown', function (e) {
        active();
        if (e.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        if (e.target.type == "text") {
            return;
        }
        if (e.srcElement.nodeName == 'INPUT') {
            return;
        }

        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }
        let oldCenter, extent, newCenter;
        switch (e.key) {
            case "c":
            case "Esc":
            case "Escape":
                deselectAllPlanes();
                break;
            // zoom and movement
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
            case "ArrowUp":
            case "w":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [oldCenter[0], (oldCenter[1] + extent[3]) / 2];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            case "ArrowDown":
            case "s":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [oldCenter[0], (oldCenter[1] + extent[1]) / 2];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            case "ArrowLeft":
            case "a":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [(oldCenter[0] + extent[0]) / 2, oldCenter[1]];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            case "ArrowRight":
                oldCenter = OLMap.getView().getCenter();
                extent = OLMap.getView().calculateExtent(OLMap.getSize());
                newCenter = [(oldCenter[0] + extent[2]) / 2, oldCenter[1]];
                OLMap.getView().setCenter(newCenter);
                toggleFollow(false);
                break;
            case "d":
                toggleDistance();
                break;
            // misc
            case "b":
                toggles['MapDim'].toggle();
                break;
            case "m":
                toggleMultiSelect();
                break;
            case "v":
                toggleTableInView();
                break;
            case "r":
                if (heatmap)
                    drawHeatmap();
                else
                    followRandomPlane();
                break;
            case "R":
                fetchData();
                break;
            case "t":
                selectAllPlanes();
                break;
            case "G":
                nogpsOnly = !nogpsOnly;
                refreshFilter();
                break;
            case "h":
                resetMap();
                break;
            case "H":
                hideButtons = !hideButtons;
                showHideButtons();
                break;
            case "f":
                toggleFollow();
                break;
            // filters
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
            case "D":
                debug = !debug;
                loStore['debug'] = debug;
                console.log('debug = ' + debug);
                break;
            case "P":
                debugPosFilter = !debugPosFilter;
                loStore['debugPosFilter'] = debugPosFilter;
                console.log('debugPosFilter = ' + debugPosFilter);
                break;
            case "?":
                if (!SelectedPlane) {
                    console.log("No plane selected");
                    break;
                }
                console.log(SelectedPlane.icao + ": " + SelectedPlane.baseMarkerKey + "  " + SelectedPlane.shape);
                console.log(SelectedPlane);
                console.log(SelectedPlane.milRange());
                break;
            case "j":
                selectPlaneByHex(jumpTo, { follow: true });
                break;
            case "J":
                debugJump = !debugJump;
                loStore['debugJump'] = debugJump;
                console.log('debugJump = ' + debugJump);
                break;
            case "N":
                noMLAT = !noMLAT;
                loStore['noMLAT'] = noMLAT;
                console.log('noMLAT = ' + noMLAT);
                break;
        }
    }, true);


    if (!usp.has('icao')
        && !usp.has("lat") && !usp.has("lon")
        && !usp.has('airport')
    ) {
        runAfterLoad(geoFindMe);
    } else {
        runAfterLoad(initSitePos);
    }

    setTimeout(function () {
        if (typeof window.updateLayerTitles === 'function') {
            window.updateLayerTitles();
        }
    }, 100);

    if (typeof initPanoramaObserver === 'function') {
        setTimeout(initPanoramaObserver, 500);
    }

    OLMap.on('change:size', function () {
        if (typeof updatePanoramaOverlayBounds === 'function') {
            setTimeout(updatePanoramaOverlayBounds, 50);
        }
    });

}

// This looks for planes to reap out of the master g.planes variable
let lastReap = 0;
let reapInProgress = false;
function reaper(all) {
    //console.log("Reaping started..");

    if (reapInProgress) {
        return;
    }

    lastReap = now;

    if (noVanish && !all) {
        return;
    }

    reapInProgress = true;

    if (!all) {
        releaseMem();
    }

    // Look for planes where we have seen no messages for >300 seconds
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
        temp.push(plane);

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

let selCall = null;
let selIcao = null;
let selReg = null;

let somethingSelected = false;
// Refresh the detail window about the plane
function refreshSelected() {
    if (!appReady) return;
    if (typeof jQuery === 'undefined' || !jQuery.fn.updateText) {
        return;
    }
    const selected = SelectedPlane;
    jQuery('#infoblocks_container').hide();

    if (multiSelect) {
        renderMultiInfoblocks();
        jQuery('#selected_infoblock').hide();
        const planes = selectedPlanes();
        somethingSelected = planes.length > 0;
        buttonActive('#F', FollowSelected);
        return;
    }

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
        // Limpiamos la celda del FIR si no hay avión seleccionado
        jQuery('#selected_fir_value').updateText('n/a');
        jQuery('#selected_fir_value_sidebar').updateText('n/a');
        return;
    }
    somethingSelected = true;
    buttonActive('#F', FollowSelected);

    selected.updateVisible();
    selected.checkForDB();

    refreshPhoto(selected);

    if (selected.name) {
        // Verificamos si el avión tiene coordenadas válidas en este instante
        if (selected.position && selected.position.length >= 2) {
            const lat = selected.position[1];
            const lon = selected.position[0];

            // Creamos el hipervínculo que ejecuta el salto usando executeJump([lat, lon])
            const callsignLink = `<a class="link" href="#" style="text-decoration: none; color: inherit;" onclick="executeJump([${lat}, ${lon}], false); return false;">${selected.name.toUpperCase()}</a>`;
            jQuery('#selected_callsign').html(callsignLink);
        } else {
            // Si no tiene posición en el mapa, se muestra como texto plano normal
            jQuery('#selected_callsign').updateText(selected.name.toUpperCase());
        }
    } else {
        jQuery('#selected_callsign').updateText('');
    }

    if (showTrace) {
        if (selected.position_time) {
            const date = new Date(selected.position_time * 1000);
            let timestamp = utcTimesHistoric ? (zuluTime(date) + NBSP + 'Z') : (lDateString(date) + ' ' + localTime(date) + NBSP + TIMEZONE);
            const timeLabel = getTranslatedText('history_time_label', 'Time:');
            jQuery('#trace_time').updateText(timeLabel + '\n' + timestamp);
        } else {
            jQuery('#trace_time').updateText(
                getTranslatedText('history_time_label', 'Time:') + '\n'
            );
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
            jQuery('#selected_route').attr('title', selected.routeVerbose);

            // Intentamos separar el string (ej. de "LEMD-KJFK" pasamos a ["LEMD", "KJFK"])
            const airports = selected.routeString.split('-');

            if (airports.length === 2) {
                const origin = airports[0].trim();
                const destination = airports[1].trim();

                // Creamos dos enlaces independientes que llaman a la búsqueda de aeropuerto
                const originLink = `<a class="link" href="#" onclick="searchAirport('${origin.toUpperCase()}'); return false;">${origin}</a>`;
                const destLink = `<a class="link" href="#" onclick="searchAirport('${destination.toUpperCase()}'); return false;">${destination}</a>`;

                // Los unimos con el guion clásico
                jQuery('#selected_route').html(`${originLink} - ${destLink}`);
            } else {
                // Si el formato de la ruta es extraño o no tiene guion, lo ponemos normal
                jQuery('#selected_route').updateText(selected.routeString);
            }
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
        // Si no hay posición disponible, mostramos n/a en el FIR
        jQuery('#selected_fir_value').updateText('n/a');
        jQuery('#selected_fir_value_sidebar').updateText('n/a');
    } else {
        if (selected.seen_pos > -1) {
            jQuery('#selected_position').updateText(format_latlng(selected.position));
        } else {
            jQuery('#selected_position').updateText(format_latlng(selected.position));
        }

        // --- CONSULTA DEL FIR DE LA AERONAVE SELECCIONADA ---
        const firActual = getFIRFromCoordinates(selected.position[1], selected.position[0]);
        jQuery('#selected_fir_value').updateText(firActual);
        jQuery('#selected_fir_value_sidebar').updateText(firActual);
        // ---------------------------------------------------
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

    jQuery('#selected_mini_registration').updateText(selected.registration ? selected.registration : 'n/a');
    jQuery('#selected_mini_altitude').updateText(format_altitude_long(adjust_baro_alt(selected.altitude), selected.vert_rate, DisplayUnits));
    jQuery('#selected_mini_speed').updateText(format_speed_long(selected.gs, DisplayUnits));
    if (selected.routeString) {
        jQuery('#selected_mini_route').updateText(selected.routeString);
    } else if (selected.pfRoute) {
        jQuery('#selected_mini_route').updateText(selected.pfRoute);
    } else {
        jQuery('#selected_mini_route').updateText('n/a');
    }
    jQuery('#selected_mini_typecode').updateText(selected.icaoType ? selected.icaoType : 'n/a');
    // El mini-infoblock debe mostrar exactamente lo que muestra `#selected_source`
    jQuery('#selected_mini_source').updateText(jQuery('#selected_source').text());

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

let somethingHighlighted = false;
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
    // Mostrar FIR en el infoblock destacado si hay posición
    if (highlighted.position && highlighted.position.length >= 2) {
        try {
            const firName = getFIRFromCoordinates(highlighted.position[1], highlighted.position[0]);
            jQuery('#selected_fir_value').updateText(firName);
            jQuery('#selected_fir_value_sidebar').updateText(firName);
        } catch (e) {
            jQuery('#selected_fir_value').updateText('n/a');
        }
    } else {
        jQuery('#selected_fir_value').updateText('n/a');
        jQuery('#selected_fir_value_sidebar').updateText('n/a');
    }
}

function removeHighlight() {
    HighlightedPlane = null;
    refreshHighlighted();
}

function mstime() {
    return new Date().getTime();
}

// recreating all OpenLayers Features for the planes every now and then releases some retained memory
// Haven't been able to create a reproducer ... regardless let's stick with this workaround
// in other words: probably not an issue with OpenLayers.

let nextCacheClear = mstime() + 300 * 1000;

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

function refreshFeatures() {
    if (!loadFinished) {
        return;
    }
    updateVisible();
    for (let i in g.planesOrdered) {
        g.planesOrdered[i].updateFeatures(true);
    }
}

// ***** TABLA DE AVIONES EN EL SIDEBAR DERECHO *****
(function (global, jQuery, TAR) {
    let planeMan = TAR.planeMan = TAR.planeMan || {};

    function compareAlpha(xa, ya) {
        if (xa === ya)
            return 0;
        if (xa < ya)
            return -1;
        return 1;
    }

    function compareNumeric(xf, yf) {
        if (Math.abs(xf - yf) < 1e-9)
            return 0;

        return xf - yf;
    }

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
    const AIRLINE_PREFIXES_URL = './static/aero-help/airline-prefixes.json';
    let airlinePrefixes = Object.create(null);
    let airlinePrefixCodes = [];
    let airlinePrefixesLoaded = false;
    let airlinePrefixesPromise = null;

    function loadAirlinePrefixes() {
        if (airlinePrefixesPromise) return airlinePrefixesPromise;

        airlinePrefixesPromise = fetch(AIRLINE_PREFIXES_URL, { cache: 'force-cache' })
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(function (prefixes) {
                if (!prefixes || typeof prefixes !== 'object' || Array.isArray(prefixes)) {
                    throw new Error('Formato inválido en airline-prefixes.json');
                }

                airlinePrefixes = Object.create(null);
                for (const [code, name] of Object.entries(prefixes)) {
                    if (/^[A-Z0-9]{2,3}$/.test(code) && typeof name === 'string' && name) {
                        airlinePrefixes[code] = name;
                    }
                }
                airlinePrefixCodes = Object.keys(airlinePrefixes)
                    .sort(function (a, b) { return b.length - a.length; });
                airlinePrefixesLoaded = true;

                if (TAR.planeMan && TAR.planeMan.redraw) {
                    TAR.planeMan.redraw();
                }
            })
            .catch(function (error) {
                airlinePrefixesLoaded = true;
                console.error('[airline-column] Error cargando prefijos de aerolíneas:', error);
                if (TAR.planeMan && TAR.planeMan.redraw) {
                    TAR.planeMan.redraw();
                }
            });

        return airlinePrefixesPromise;
    }

    function getAirlineName(flight) {
        if (!airlinePrefixesLoaded) {
            loadAirlinePrefixes();
            return '';
        }

        const callsign = String(flight || '').toUpperCase().replace(/\s+/g, '');
        for (const code of airlinePrefixCodes) {
            if (callsign.startsWith(code)) return airlinePrefixes[code];
        }
        return 'Civil/No disponible';
    }

    cols.airline = {
        text: 'Airline',
        sort: function () {
            sortBy('airline', compareAlpha, function (plane) {
                return getAirlineName(plane.flight);
            });
        },
        value: function (plane) { return getAirlineName(plane.flight); }
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
        sort: function () { sortBy('msgs', compareNumeric, function (x) { return (x.messageCount ?? x.messages); }); },
        value: function (plane) { return (plane.messageCount ?? plane.messages); },
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

    let originalColumnsOrder = [];

    function saveOriginalColumnsOrder() {
        originalColumnsOrder = [...Object.values(cols)];
        console.log('Original columns order saved:', originalColumnsOrder.map(c => c.id));
    }

    saveOriginalColumnsOrder();

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

    let columns = createOrderedColumns();
    let activeCols = null;

    let initializing = true;

    let planeRowTemplate = null;
    let htmlTable = null;
    let tbody = null;

    planeMan.init = function () {
        htmlTable = document.getElementById('planesTable');
        for (let i in columns) {
            let col = columns[i];
            col.toggleKey = 'column_' + col.id;

            const translationKey = 'col_' + col.id;
            if (col.text) {
                let translatedText = col.text;
                if (typeof window.translate !== 'undefined' && window.translate.t) {
                    translatedText = window.translate.t(translationKey) || col.text;
                } else if (typeof window.t === 'function') {
                    translatedText = window.t(translationKey) || col.text;
                }
                col.text = translatedText;
            }

            if (col.header) {
                const originalHeader = col.header;
                col.header = function () {
                    let headerText = col.text || col.id;
                    const translationKey = 'col_' + col.id;
                    if (typeof window.translate !== 'undefined' && window.translate.t) {
                        const translated = window.translate.t(translationKey);
                        if (translated && translated !== translationKey) {
                            headerText = translated;
                        }
                    } else if (typeof window.t === 'function') {
                        const translated = window.t(translationKey);
                        if (translated && translated !== translationKey) {
                            headerText = translated;
                        }
                    }
                    return headerText;
                };
            }

            const savedState = localStorage.getItem(col.toggleKey);
            if (savedState !== null) {
                col.visible = savedState === 'true';
            } else if (HideCols.includes('#' + col.id) || col.id === 'airline') {
                col.visible = false;
            } else {
                col.visible = true;
            }

        }

        createColumnToggles();

        if (!ShowFlags) {
            planeMan.setColumnVis('flag', false);
        }
    }

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

    planeMan.setColumnVis = function (col, visible) {
        cols[col].visible = visible;

        if (!initializing)
            planeMan.redraw();
    }

    // Refreshes the larger table of all the planes
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

            if (starredAircraft && starredAircraft.has(plane.icao)) {
                plane.tr.classList.add('starred-table-row');
            } else {
                plane.tr.classList.remove('starred-table-row');
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

    planeMan.sortId = '';
    planeMan.sortCompare = null;
    planeMan.sortExtract = null;
    planeMan.sortAscending = true;

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

    // ***** MENÚ PARA PERMITIR AL USUARIO SELECCIONAR LAS COLUMNAS QUE DESEE *****
    function createColumnToggles() {
        const prefix = 'dd_';
        const container = jQuery('#sortableColumns');

        container.empty();

        const DEFAULT_COLUMNS = [
            'icao',
            'country',
            'flight',
            'route',
            'type',
            'squawk',
            'altitude',
            'speed',
            'sitedist',
            'rssi'
        ];

        // ***** RESTAURAR COLUMNAS POR DEFECTO *****
        window.resetColumnsToDefault = function () {
            for (const col of Object.values(cols)) {
                const shouldBeVisible = DEFAULT_COLUMNS.includes(col.id);
                col.visible = shouldBeVisible;
                localStorage.setItem(col.toggleKey, shouldBeVisible ? 'true' : 'false');
            }

            if (originalColumnsOrder && originalColumnsOrder.length > 0) {
                const originalOrder = [];
                for (const col of originalColumnsOrder) {
                    originalOrder.push(col.id);
                }
                localStorage.setItem('columnOrder', JSON.stringify(originalOrder));

                const restoredColumns = [];
                for (const colId of originalOrder) {
                    const column = cols[colId];
                    if (column !== undefined) {
                        restoredColumns.push(column);
                    }
                }
                window.columns = restoredColumns;
            } else {
                const defaultOrder = [...DEFAULT_COLUMNS];
                for (const col of Object.values(cols)) {
                    if (!defaultOrder.includes(col.id)) {
                        defaultOrder.push(col.id);
                    }
                }
                localStorage.setItem('columnOrder', JSON.stringify(defaultOrder));

                const restoredColumns = [];
                for (const colId of defaultOrder) {
                    const column = cols[colId];
                    if (column !== undefined) {
                        restoredColumns.push(column);
                    }
                }
                window.columns = restoredColumns;
            }

            createColumnToggles();

            if (typeof TAR !== 'undefined' && TAR.planeMan && TAR.planeMan.redraw) {
                TAR.planeMan.redraw();
            }
        };

        // ***** TRADUCIR TEXTO DE LAS COLUMNAS *****
        function getTranslatedColumnText(col) {
            let text = col.text || col.id;
            const translationKey = 'col_' + col.id;
            if (typeof window.translate !== 'undefined' && window.translate.t) {
                const translated = window.translate.t(translationKey);
                if (translated && translated !== translationKey) {
                    text = translated;
                }
            } else if (typeof window.t === 'function') {
                const translated = window.t(translationKey);
                if (translated && translated !== translationKey) {
                    text = translated;
                }
            }
            return text;
        }

        let restoreText = 'Restore default columns';
        let activeColumnsText = 'Active columns';
        let inactiveColumnsText = 'Inactive columns';

        if (typeof window.translate !== 'undefined' && window.translate.t) {
            restoreText = window.translate.t('restore_default_columns') || restoreText;
            activeColumnsText = window.translate.t('active_columns') || activeColumnsText;
            inactiveColumnsText = window.translate.t('inactive_columns') || inactiveColumnsText;
        } else if (typeof window.t === 'function') {
            restoreText = window.t('restore_default_columns') || restoreText;
            activeColumnsText = window.t('active_columns') || activeColumnsText;
            inactiveColumnsText = window.t('inactive_columns') || inactiveColumnsText;
        }

        const checkedColumnIds = [];
        const uncheckedColumnIds = [];

        for (const col of Object.values(cols)) {
            if (col.visible === true) {
                checkedColumnIds.push(col.id);
            } else {
                uncheckedColumnIds.push(col.id);
            }
        }

        const orderedCheckedIds = [];
        for (const col of columns) {
            if (checkedColumnIds.includes(col.id)) {
                orderedCheckedIds.push(col.id);
            }
        }

        for (const id of checkedColumnIds) {
            if (!orderedCheckedIds.includes(id) && cols[id]) {
                orderedCheckedIds.push(id);
            }
        }

        const orderedUncheckedIds = [...uncheckedColumnIds];
        orderedUncheckedIds.sort((a, b) => {
            const textA = cols[a].text || a;
            const textB = cols[b].text || b;
            return textA.localeCompare(textB);
        });

        const restoreButtonHtml = `
            <div style="margin-bottom: 15px;">
                <button class="formButton" id="reset-columns-btn" title="${restoreText}">
                    ${restoreText}
                </button>
            </div>
        `;

        const activeCategoryHtml = `
            <div class="column-category" id="column-category-checked">
                <div class="column-category-title">
                    ${activeColumnsText} (${orderedCheckedIds.length})
                </div>
                <div class="columns-grid" id="checked-columns-grid"></div>
            </div>
        `;

        const inactiveCategoryHtml = `
            <div class="column-category" id="column-category-unchecked">
                <div class="column-category-title">
                    ${inactiveColumnsText} (${orderedUncheckedIds.length})
                </div>
                <div class="columns-grid" id="unchecked-columns-grid"></div>
            </div>
        `;

        const tableOptionsHtml = `
            <div class="column-category" id="column-category-table-options">
                <div class="column-category-title" data-i18n="table_display_options">
                    ${typeof window.translate !== 'undefined' && window.translate.t
                ? window.translate.t('table_display_options')
                : 'Table display options'}
                </div>
                <div class="columns-grid" id="table-options-grid">
                    <li class="ui-state-default" id="table-option-more1" style="margin: 0; padding: 6px 10px; width: calc(50% - 8px); min-width: 120px; flex: 1 0 auto; background: var(--BGCOLOR2, #f8f8f8); border: 1px solid var(--BASE-COLOR, #192a56); border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: default;">
                        <div class="settingsCheckbox" id="moreTableLines1_checkbox" style="display: inline-block; width: 16px; height: 16px; flex-shrink: 0; cursor: pointer;"></div>
                        <span class="settingsText" style="display: inline-block; font-size: calc(12px * var(--SCALE)); line-height: normal; flex: 1; cursor: pointer;" data-i18n="more_table_lines">
                        ${typeof window.translate !== 'undefined' && window.translate.t
                ? window.translate.t('more_table_lines')
                : 'More Table Lines'}
                        </span>
                    </li>
                    <li class="ui-state-default" id="table-option-more2" style="margin: 0; padding: 6px 10px; width: calc(50% - 8px); min-width: 120px; flex: 1 0 auto; background: var(--BGCOLOR2, #f8f8f8); border: 1px solid var(--BASE-COLOR, #192a56); border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: default;">
                        <div class="settingsCheckbox" id="moreTableLines2_checkbox" style="display: inline-block; width: 16px; height: 16px; flex-shrink: 0; cursor: pointer;"></div>
                        <span class="settingsText" style="display: inline-block; font-size: calc(12px * var(--SCALE)); line-height: normal; flex: 1; cursor: pointer;" data-i18n="even_more_table_lines">
                        ${typeof window.translate !== 'undefined' && window.translate.t
                ? window.translate.t('even_more_table_lines')
                : 'Even More'}
                        </span>
                    </li>
                    <li class="ui-state-default" id="table-option-all" style="margin: 0; padding: 6px 10px; width: calc(50% - 8px); min-width: 120px; flex: 1 0 auto; background: var(--BGCOLOR2, #f8f8f8); border: 1px solid var(--BASE-COLOR, #192a56); border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: default;">
                        <div class="settingsCheckbox" id="allTableLines_checkbox" style="display: inline-block; width: 16px; height: 16px; flex-shrink: 0; cursor: pointer;"></div>
                        <span class="settingsText" style="display: inline-block; font-size: calc(12px * var(--SCALE)); line-height: normal; flex: 1; cursor: pointer;" data-i18n="all_table_lines">
                        ${typeof window.translate !== 'undefined' && window.translate.t
                ? window.translate.t('all_table_lines')
                : 'All Table Lines'}
                        </span>
                    </li>
                </div>
            </div>
        `;

        container.append(restoreButtonHtml);
        container.append(activeCategoryHtml);
        container.append(inactiveCategoryHtml);
        container.append(tableOptionsHtml);

        const checkedGrid = jQuery('#checked-columns-grid');
        const uncheckedGrid = jQuery('#unchecked-columns-grid');

        // ***** CREAR ITEMS DE COLUMNA *****
        function createColumnItem(col, isChecked) {
            const displayText = getTranslatedColumnText(col);
            return `
                <li class="ui-state-default" id="${prefix + col.id}" data-column-id="${col.id}" 
                    style="margin: 0; padding: 6px 10px; width: calc(50% - 8px); min-width: 120px; flex: 1 0 auto; 
                        background: var(--BGCOLOR2, #f8f8f8); border: 1px solid var(--BASE-COLOR, #192a56); 
                        border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: default;">
                    <div class="settingsCheckbox ${isChecked ? 'settingsCheckboxChecked' : ''}" 
                        style="display: inline-block; width: 16px; height: 16px; flex-shrink: 0; cursor: pointer;"></div>
                    <span class="settingsText" style="display: inline-block; font-size: calc(12px * var(--SCALE)); line-height: normal; flex: 1; cursor: pointer;">
                        ${displayText}
                    </span>
                </li>
            `;
        }

        for (const colId of orderedCheckedIds) {
            const col = cols[colId];
            if (col) {
                checkedGrid.append(createColumnItem(col, true));
            }
        }

        for (const colId of orderedUncheckedIds) {
            const col = cols[colId];
            if (col) {
                uncheckedGrid.append(createColumnItem(col, false));
            }
        }

        for (const col of Object.values(cols)) {
            const $li = jQuery(`#${prefix + col.id}`);
            if (!$li.length) continue;

            const $checkbox = $li.find('.settingsCheckbox');
            const $text = $li.find('.settingsText');

            function toggleColumnState() {
                const newState = !col.visible;
                col.visible = newState;

                const $element = jQuery(`#${prefix + col.id}`);
                if (newState) {
                    $element.detach();
                    checkedGrid.append($element);
                    $checkbox.addClass('settingsCheckboxChecked');
                    updateCategoryCounts();
                } else {
                    $element.detach();
                    let inserted = false;
                    const newText = col.text;
                    uncheckedGrid.children('li').each(function () {
                        const existingId = jQuery(this).attr('id').replace(prefix, '');
                        const existingCol = cols[existingId];
                        const existingText = jQuery(this).find('.settingsText').text();
                        if (newText.localeCompare(existingText) < 0) {
                            jQuery(this).before($element);
                            inserted = true;
                            return false;
                        }
                    });
                    if (!inserted) {
                        uncheckedGrid.append($element);
                    }
                    $checkbox.removeClass('settingsCheckboxChecked');
                    updateCategoryCounts();
                }

                localStorage.setItem(col.toggleKey, newState ? 'true' : 'false');

                updateColumnsOrderFromDOM();

                if (typeof TAR !== 'undefined' && TAR.planeMan && TAR.planeMan.redraw) {
                    TAR.planeMan.redraw();
                }
            }

            $checkbox.off('click').on('click', function (e) {
                e.stopPropagation();
                toggleColumnState();
            });

            $text.off('click').on('click', function (e) {
                e.stopPropagation();
                toggleColumnState();
            });
        }

        // ***** ACTUALIZAR CONTADOR DE COLUMNAS ACTIVAS E INACTIVAS *****
        function updateCategoryCounts() {
            const checkedCount = checkedGrid.children('li').length;
            const uncheckedCount = uncheckedGrid.children('li').length;
            const activeTitle = jQuery('#column-category-checked .column-category-title');
            const inactiveTitle = jQuery('#column-category-unchecked .column-category-title');

            if (activeTitle.length) {
                activeTitle.html(`${activeColumnsText} (${checkedCount})`);
            }
            if (inactiveTitle.length) {
                inactiveTitle.html(`${inactiveColumnsText} (${uncheckedCount})`);
            }
        }

        // ***** ACTUALIZAR ORDEN DE COLUMNAS ACTIVAS/INACTIVAS *****
        function updateColumnsOrderFromDOM() {
            const newOrder = [];
            checkedGrid.children('li').each(function () {
                const colId = jQuery(this).attr('id').replace(prefix, '');
                newOrder.push(colId);
            });
            uncheckedGrid.children('li').each(function () {
                const colId = jQuery(this).attr('id').replace(prefix, '');
                newOrder.push(colId);
            });

            const newColumns = [];
            for (const colId of newOrder) {
                const column = cols[colId];
                if (column !== undefined) {
                    newColumns.push(column);
                }
            }

            for (const col of Object.values(cols)) {
                if (!newColumns.includes(col)) {
                    newColumns.push(col);
                }
            }

            window.columns = newColumns;
            localStorage.setItem('columnOrder', JSON.stringify(newOrder));
        }

        jQuery('#reset-columns-btn').off('click').on('click', function (e) {
            e.preventDefault();
            window.resetColumnsToDefault();
        });

        updateCategoryCounts();

        function initTableOptions() {
            if (typeof toggles === 'undefined' || !toggles['moreTableLines1']) {
                setTimeout(initTableOptions, 100);
                return;
            }

            function initTableOptionCheckbox(toggleKey, checkboxId) {
                const $checkbox = jQuery(`#${checkboxId}`);
                if (!$checkbox.length) return;

                const toggle = toggles[toggleKey];
                if (!toggle) return;

                if (toggle.state) {
                    $checkbox.addClass('settingsCheckboxChecked');
                }

                $checkbox.off('click.tableOption');

                $checkbox.on('click.tableOption', function (e) {
                    e.stopPropagation();
                    toggle.toggle();
                    const isChecked = toggle.state;
                    if (isChecked) {
                        $checkbox.addClass('settingsCheckboxChecked');
                    } else {
                        $checkbox.removeClass('settingsCheckboxChecked');
                    }
                    if (typeof setGlobeTableLimit === 'function') {
                        setGlobeTableLimit();
                    }
                    if (typeof TAR !== 'undefined' && TAR.planeMan && TAR.planeMan.refresh) {
                        TAR.planeMan.refresh();
                    }
                });

                const $li = $checkbox.closest('li');
                const $text = $li.find('.settingsText');
                $text.off('click.tableOption').on('click.tableOption', function (e) {
                    e.stopPropagation();
                    $checkbox.trigger('click.tableOption');
                });
            }

            initTableOptionCheckbox('moreTableLines1', 'moreTableLines1_checkbox');
            initTableOptionCheckbox('moreTableLines2', 'moreTableLines2_checkbox');
            initTableOptionCheckbox('allTableLines', 'allTableLines_checkbox');
        }

        setTimeout(initTableOptions, 50);
    }

    // ***** ORDENAR COLUMNAS ALFABÉTICAMENTE *****
    function createOrderedColumns() {
        if (window.columns && window.columns.length > 0) {
            return window.columns;
        }

        const order = loStore['columnOrder'];
        if (order !== undefined) {
            const orderedColumns = [];
            for (let colId of JSON.parse(order)) {
                const column = cols[colId];
                if (column !== undefined) {
                    orderedColumns.push(column);
                }
            }
            if (orderedColumns.length > 0) {
                window.columns = orderedColumns;
                return orderedColumns;
            }
        }
        window.columns = Object.values(cols);
        return window.columns;
    }

    return TAR;
}(window, jQuery, TAR || {}));

let lastSelected = null;
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
function selectAllPlanes() {
    HighlightedPlane = null;
    // if all planes are already selected, deselect them all
    if (SelectedAllPlanes) {
        // Cuando se desactiva All Tracks, también desactivar Track Labels
        if (trackLabels) {
            toggleTrackLabels();
        }
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

function updateMapSize() {
    if (OLMap)
        OLMap.updateSize();
    updateReplayBarPosition();

    if (typeof updatePanoramaOverlayBounds === 'function') {
        updatePanoramaOverlayBounds();
    }
}

function expandSidebar(e) {
    e.preventDefault();
    jQuery("#map_container").hide()
    mapIsVisible = false;
    jQuery("#toggle_sidebar_button").hide();
    jQuery("#toggle_sidebar_control").hide();
    jQuery("#splitter").hide();
    jQuery("#shrink_sidebar_button").show();
    jQuery("#sidebar_container").width("100%");

    jQuery('.header_sidebar').css('display', 'none');

    TAR.planeMan.redraw();
    updateMapSize();
    adjustInfoBlock();
}

function showMap() {
    jQuery('#sidebar_container').width(loStore['sidebar_width']).css('margin-left', '0');
    jQuery("#map_container").show()
    mapIsVisible = true;
    jQuery("#toggle_sidebar_button").show();
    jQuery("#toggle_sidebar_control").show();
    jQuery("#splitter").show();
    jQuery("#shrink_sidebar_button").hide();

    jQuery('.header_sidebar').css('display', 'unset');

    TAR.planeMan.redraw();
    updateMapSize();
}


let selectedPhotoCache = null;

function setPhotoHtml(source) {
    if (selectedPhotoCache == source)
        return;
    //console.log(source + ' ' + selectedPhotoCache);
    selectedPhotoCache = source;
    jQuery('#selected_photo').html(source);
    let miniSource = source.replace(/id=['"][^'"]*['"]/g, 'id="airplanePhotoMini"');
    jQuery('#selected_mini_photo').html(miniSource);
}

// ***** AJUSTAR TAMAÑO DEL INFOBLOCK *****
function adjustInfoBlock() {

    if (wideInfoBlock) {
        infoBlockWidth = baseInfoBlockWidth + 40;
    } else {
        infoBlockWidth = baseInfoBlockWidth;
    }
    jQuery('#selected_infoblock').css("width", infoBlockWidth * globalScale + 'px');

    jQuery('.ol-scale-line').css('left', (infoBlockWidth * globalScale + 8) + 'px');

    if (SelectedPlane && toggles['enableInfoblock'].state) {

        if (!mapIsVisible)
            jQuery("#sidebar_container").css('margin-left', '140pt');

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

        jQuery('.ol-scale-line').css('left', '8px');
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

    if (jQuery('#selected_infoblock').hasClass('infoblock-minimized')) {
        jQuery('.ol-scale-line').css('left', '8px');
    }

    updateReplayBarPosition();

    if (typeof updatePanoramaOverlayBounds === 'function') {
        updatePanoramaOverlayBounds();
    }

}

// ***** ACTUALIZAR POSICIÓN DEL REPLAY *****
function updateReplayBarPosition() {
    const replayBar = jQuery('#replayBar');
    if (!replayBar.length) {
        return;
    }

    const pageWidth = jQuery(window).width();
    let leftOffset = 0;
    let rightOffset = 0;
    let bottomOffset = 0;

    const replayVisible = replayBar.is(':visible');

    if (replayVisible) {
        const replayHeight = replayBar.outerHeight();
        bottomOffset = replayHeight;
    }

    const sidebar = jQuery('#sidebar_container');
    if (sidebar.is(':visible') && mapIsVisible) {
        const rect = sidebar[0].getBoundingClientRect();
        if (rect.width > 0) {
            if (rect.left + rect.width / 2 <= pageWidth / 2) {
                leftOffset = Math.max(leftOffset, rect.width);
            } else {
                rightOffset = Math.max(rightOffset, rect.width);
            }
        }
    }

    const selectedInfo = jQuery('#selected_infoblock');
    if (selectedInfo.is(':visible') && !selectedInfo.hasClass('infoblock-minimized')) {
        const rect = selectedInfo[0].getBoundingClientRect();
        if (rect.width > 0) {
            if (rect.left + rect.width / 2 <= pageWidth / 2) {
                leftOffset = Math.max(leftOffset, rect.width);
            } else {
                rightOffset = Math.max(rightOffset, rect.width);
            }
        }
    }

    const bar = replayBar[0];
    bar.style.setProperty('left', leftOffset > 0 ? leftOffset + 'px' : '0px', 'important');
    bar.style.setProperty('right', rightOffset > 0 ? rightOffset + 'px' : '0px', 'important');
    bar.style.setProperty('width', `calc(100% - ${leftOffset + rightOffset}px)`, 'important');

    const altitudeChart = jQuery('#altitude_chart');
    if (altitudeChart.length) {
        if (replayVisible) {
            altitudeChart.css('bottom', (bottomOffset + 5) + 'px');
        } else {
            altitudeChart.css('bottom', '35px');
        }
    }

    updateMultiInfoblocksLayout();
}

// ***** ACTUALIZAR POSICIÓN DEL CHART DE ALTITUD *****
function restoreAltitudeChartPosition() {
    const altitudeChart = jQuery('#altitude_chart');
    if (altitudeChart.length) {
        altitudeChart.css('bottom', '35px');
    }
}

// ***** SELECTOR DE UNIDADES *****
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

    if (lastPanoramaData && lastPanoramaTotalNm != null) {
        if (typeof draw3DPanorama === 'function') {
            draw3DPanorama(lastPanoramaData, lastPanoramaTotalNm);
        }
    }
}

function onFilterByAltitude(e) {
    e.preventDefault();
    jQuery("#altitude_filter_min").blur();
    jQuery("#altitude_filter_max").blur();

    updateAltFilter();
    refreshFilter();
}

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

function buttonActive(id, state) {
    if (state) {
        jQuery(id).addClass('activeButton');
        jQuery(id).removeClass('inActiveButton');
    } else {
        jQuery(id).addClass('inActiveButton');
        jQuery(id).removeClass('activeButton');
    }
}

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



function dim(evt) {
    try {
        let currentDimPercentage = mapDimPercentage * layerDimFactor;
        let currentContrastPercentage = mapContrastPercentage + layerExtraContrast;

        if (!toggles['MapDim'].state) {
            // slight dim even if disabled
            currentDimPercentage /= 4;
            currentContrastPercentage /= 4;
        }

        const dim = currentDimPercentage;
        const contrast = currentContrastPercentage;
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
function invertMap(evt) {
    const ctx = evt.context;
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = "white";
    ctx.globalAlpha = alpha;  // alpha 0 = no effect 1 = full effect
    ctx.fillRect(0, 0, evt.ctx.canvas.width, ctx.canvas.height);


}

// ***** CHART DE ALTITUD *****
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

    function createLegendUrl(data) {
        jQuery(data).find('#linear-gradient').html(createLegendGradientStops());

        const svg = jQuery('svg', data).prop('outerHTML');

        // return 'url("data:image/svg+xml;base64,' + global.btoa(svg) + '")';
        return 'data:image/svg+xml;base64,' + global.btoa(svg);
    }

    function loadLegend() {
        let baseLegend = (DisplayUnits === 'metric') ? 'images/alt_legend_m.svg' : 'images/alt_legend_ft.svg';

        jQuery.get(baseLegend, function (data) {
            // jQuery('#altitude_chart_image').css("background-image", createLegendUrl(data));
            jQuery('#altitude_chart_image').attr('src', createLegendUrl(data));
            jQuery('#altitude_chart').show();
        });
    }

    altitudeChart.render = function () {
        if (toggles['altitudeChart'].state) {
            runAfterLoad(loadLegend);
        } else {
            jQuery('#altitude_chart').hide();
        }
    }

    // ***** ALTITUDE CHART - PARTE DE LA CATEGORÍA DISPLAY *****
    altitudeChart.init = function () {
        let chartOn = false;
        if (usp.has('altitudeChart')) {
            chartOn = Boolean(parseInt(usp.get('altitudeChart')));
        }
        createToggle({
            key: "altitudeChart",
            display: 'altitude_chart',
            displayKey: 'altitude_chart',
            tooltip: 'altitude_chart_tooltip',
            tooltipKey: 'altitude_chart_tooltip',
            container: "#category-display-container",
            init: false,
            setState: altitudeChart.render
        });
    }

    return TAR;
}(window, jQuery, TAR || {}));

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

    // ***** TEXTO TRADUCIDO SEGÚN EL ESTADO Y EL IDIOMA ACTUAL *****
    const labelKey = tableInView ? 'on_screen' : 'with_position';
    const labelFallback = tableInView ? 'On Screen:' : 'With Position:';
    jQuery('#with_positions').text(getTranslatedText(labelKey, labelFallback));

    buttonActive('#V', tableInView);
}

function toggleLabels() {
    g.enableLabels = !g.enableLabels;
    loStore['enableLabels'] = g.enableLabels;

    if (!g.enableLabels && g.extendedLabels > 0) {
        g.extendedLabels = 0;
        loStore['extendedLabels'] = g.extendedLabels;
        buttonActive('#O', g.extendedLabels);
    }

    for (let key in g.planesOrdered) {
        g.planesOrdered[key].updateMarker();
    }
    refreshFeatures();
    buttonActive('#L', g.enableLabels);

    if (showTrace)
        remakeTrails();
}

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

function toggleTrackLabels() {
    trackLabels = !trackLabels;
    loStore['trackLabels'] = trackLabels;

    remakeTrails();

    buttonActive('#K', trackLabels);
}

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

// ***** ALERTA DE ERROR EN FILTRO DE ALTITUD *****
function ensureWarningElement() {
    let searchWarning = document.getElementById('search_warning');
    if (!searchWarning) {
        searchWarning = document.createElement('div');
        searchWarning.id = 'search_warning';
        searchWarning.className = 'warning';
        searchWarning.style.display = 'none';
        const filterTable = document.getElementById('filterTable');
        if (filterTable) {
            filterTable.parentNode.insertBefore(searchWarning, filterTable.nextSibling);
        } else {
            document.body.appendChild(searchWarning);
        }
    }
    return jQuery(searchWarning);
}

// ***** MOSTRAR ALERTA DE ERROR *****
function showSearchWarning(message) {
    const searchWarning = ensureWarningElement();
    if (!searchWarning.length) return;

    searchWarning.html(message);
    searchWarning.css('display', 'block');
    searchWarning.css('background-color', 'var(--BGCOLOR2)');
    searchWarning.css('border', '2px solid #cc0000');
    searchWarning.css('color', 'var(--TXTCOLOR2)');
    searchWarning.css('padding', '8px');
    searchWarning.css('margin', '10px 0');
    searchWarning.css('border-radius', '4px');
    searchWarning.css('z-index', '1000');

    if (window.searchWarningTimeout) {
        clearTimeout(window.searchWarningTimeout);
    }
    window.searchWarningTimeout = setTimeout(() => hideSearchWarning(), 8000);
}

// ***** OCULTAR ALERTA DE ERROR *****
function hideSearchWarning() {
    const searchWarning = jQuery('#search_warning');
    if (!searchWarning.length) return;

    searchWarning.css('display', 'none');
    searchWarning.css('background-color', '');
    searchWarning.css('border', '');
    searchWarning.css('color', '');
    searchWarning.css('font-weight', '');
    searchWarning.css('padding', '');
    searchWarning.css('margin', '');
    searchWarning.css('border-radius', '');
    if (window.searchWarningTimeout) {
        clearTimeout(window.searchWarningTimeout);
        window.searchWarningTimeout = null;
    }
}

// ***** ALERTA DE FILTRADO DE ALTITUD EXITOSO *****
function showSuccessMessage(message) {
    const searchWarning = ensureWarningElement();
    if (!searchWarning.length) return;

    searchWarning.html(message);
    searchWarning.css('display', 'block');
    searchWarning.css('background-color', 'var(--BGCOLOR2)');
    searchWarning.css('border', '2px solid #006600');
    searchWarning.css('color', 'var(--TXTCOLOR2)');
    searchWarning.css('padding', '8px');
    searchWarning.css('margin', '10px 0');
    searchWarning.css('border-radius', '4px');
    searchWarning.css('z-index', '1000');

    if (window.searchWarningTimeout) {
        clearTimeout(window.searchWarningTimeout);
    }
    window.searchWarningTimeout = setTimeout(() => hideSearchWarning(), 3000);
}

// ***** ACTUALIZAR INDICADORES DEL FILTRO DE ALTITUD *****
function updateAltitudeFilterIndicators(minAlt, maxAlt, enabled) {
    const minInput = jQuery("#altitude_filter_min");
    const maxInput = jQuery("#altitude_filter_max");

    if (enabled) {
        minInput.addClass('filter-active').removeClass('input-error');
        maxInput.addClass('filter-active').removeClass('input-error');

        const unit = get_unit_label("altitude", DisplayUnits);
        minInput.attr('title', `Minimum altitude: ${minAlt !== -1e6 ? Math.round(minAlt) : 'no limit'} ${unit}`);
        maxInput.attr('title', `Maximum altitude: ${maxAlt !== 1e6 ? Math.round(maxAlt) : 'no limit'} ${unit}`);
    } else {
        minInput.removeClass('filter-active');
        maxInput.removeClass('filter-active');
        minInput.attr('title', 'Set minimum altitude');
        maxInput.attr('title', 'Set maximum altitude');
    }
}

// ***** BUSCADOR UNIFICADO *****
function unifiedSearch(e) {
    if (e) e.preventDefault();

    const inputField = jQuery("#search_input");
    const query = inputField.val().trim();

    if (!query) return;

    inputField.val("").blur();
    toggleFollow(false);

    // ***** COORDENADAS *****
    if (query.indexOf(",") >= 0) {
        const values = query.split(',');
        const lat = parseFloat(values[0]);
        const lon = parseFloat(values[1]);
        if (!isNaN(lat) && !isNaN(lon)) {
            executeJump([lat, lon]);
            return;
        }
    }

    // ***** AVIONES *****
    const planeResults = findPlanes(query, "byIcao", "byCallsign", "byReg", "byType", false);

    // ***** AEROPUERTOS *****
    if (!planeResults || planeResults.length === 0) {
        searchAirport(query.toUpperCase());
    }
}

// ***** IR AL PUNTO ENCONTRADO EN LA BÚSQUEDA *****
function onJump() {
    if (typeof onJumpInput !== 'undefined' && onJumpInput) {
        searchAirport(onJumpInput.trim().toUpperCase());
    }
}

// ***** INICIALIZAR BUSCADOR *****
jQuery(document).ready(function () {
    jQuery("#search_form").on("submit", unifiedSearch);

    jQuery("#search_clear_button").click(function () {
        jQuery("#search_input").val("");
    });

    // ***** DETECTAR ITEMS ACTIVOS *****
    function hasActiveItem(containerSelector) {
        return jQuery(containerSelector).find('.activeButton').length > 0;
    }

    // ***** ESTILO INVERTIDO PARA DROPDOWN DE AVIONES *****
    bindToggleButton({
        button: '#aircraft_dropdown [role="button"].btn',
        mode: 'dropdown',
        activeClass: 'btn-active',
        activeWhen: function () {
            return hasActiveItem('#aircraft_dropdown');
        }
    });

    // ***** ESTILO INVERTIDO PARA DROPDOWN DE DISTANCIA *****
    bindToggleButton({
        button: '#measurement_dropdown [role="button"].btn',
        mode: 'dropdown',
        activeClass: 'btn-active',
        activeWhen: function () {
            return hasActiveItem('#measurement_dropdown');
        }
    });

    // ***** ESTILO INVERTIDO PARA DROPDOWN DE TRAZAS *****
    bindToggleButton({
        button: '#track_dropdown [role="button"].btn',
        mode: 'dropdown',
        activeClass: 'btn-active',
        activeWhen: function () {
            return hasActiveItem('#track_dropdown');
        }
    });

    // ***** ESTILO INVERTIDO PARA DROPDOWN DE ETIQUETAS *****
    bindToggleButton({
        button: '#label_dropdown [role="button"].btn',
        mode: 'dropdown',
        activeClass: 'btn-active',
        activeWhen: function () {
            return hasActiveItem('#label_dropdown');
        }
    });

    // ***** ESTILO INVERTIDO PARA DROPDOWN DE ELEVACIÓN *****
    bindToggleButton({
        button: '#elevation_dropdown [role="button"].btn',
        mode: 'dropdown',
        activeClass: 'btn-active',
        activeWhen: function () {
            return hasActiveItem('#elevation_dropdown');
        }
    });

    // ***** ESTILO INVERTIDO PARA MENÚ DE CONFIGURACIONES *****
    bindToggleButton({
        button: '#settingsCog',
        panel: '#settings_infoblock',
        closeButtons: ['#settings_close'],
        activeClass: 'btn-active'
    });
});

// ***** DIBUJAR UN MARCADOR EN EL AEROPUERTO BUSCADO *****
function initAirportMarkerLayer() {
    if (!airportMarkerLayer && OLMap) {
        const source = new ol.source.Vector();
        airportMarkerLayer = new ol.layer.Vector({
            name: 'airportMarker',
            type: 'overlay',
            title: 'Airport marker',
            source: source,
            zIndex: 300,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: 'rgba(40, 187, 255, 0.85)' }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            })
        });
        OLMap.addLayer(airportMarkerLayer);
    }
}

// ***** MOSTRAR MARCADOR EN EL AEROPUERTO BUSCADO *****
function showAirportMarker(lonlat) {
    initAirportMarkerLayer();

    if (airportMarkerFeature) {
        airportMarkerLayer.getSource().removeFeature(airportMarkerFeature);
    }
    if (airportMarkerTimeout) {
        clearTimeout(airportMarkerTimeout);
    }

    const projCoords = ol.proj.fromLonLat([lonlat[1], lonlat[0]]);
    airportMarkerFeature = new ol.Feature(new ol.geom.Point(projCoords));
    airportMarkerLayer.getSource().addFeature(airportMarkerFeature);

    airportMarkerTimeout = setTimeout(() => {
        if (airportMarkerFeature && airportMarkerLayer) {
            const startTime = performance.now();
            const duration = 1000;
            function animateFade(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentOpacity = 1 - progress;

                const fadeStyle = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({ color: `rgba(40, 187, 255, ${currentOpacity})` }),
                        stroke: new ol.style.Stroke({ color: `rgba(255, 255, 255, ${currentOpacity})`, width: 2 })
                    })
                });

                airportMarkerFeature.setStyle(fadeStyle);

                if (progress < 1) {
                    requestAnimationFrame(animateFade);
                } else {
                    if (airportMarkerLayer && airportMarkerLayer.getSource()) {
                        airportMarkerLayer.getSource().removeFeature(airportMarkerFeature);
                    }
                    airportMarkerFeature = null;
                }
            }

            requestAnimationFrame(animateFade);
        }
        airportMarkerTimeout = null;
    }, 3000);
}

// ***** REESTABLECER ZOOM BASE *****
function resetZoomBaselineToCurrent() {
    if (!OLMap || !OLMap.getView) return;
    const z = Number(OLMap.getView().getZoom()) || 0;
    zoomIndicatorBaseline = z;
    try {
        localStorage.setItem(ZOOM_BASELINE_KEY, zoomIndicatorBaseline);
    } catch (e) { }
    updateZoomIndicator();
}

// ***** HACER SALTO AL PUNTO BUSCADO *****
function executeJump(coords, showMarker = true) {

    if (coords && coords.length >= 2 && showMarker) {
        showAirportMarker(coords);
    }

    OLMap.getView().setCenter(ol.proj.fromLonLat([coords[1], coords[0]]));

    const currentZoom = OLMap.getView().getZoom();
    if (currentZoom < 8) {
        OLMap.getView().setZoom(9);
    }

    if (g.zoomLvl >= 7) fetchData({ force: true });
    refreshFilter();
    hideSearchWarning();

}

// ***** BUSCAR AEROPUERTO *****
const originalSearchAirport = searchAirport;
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
    else showSearchWarning('Airport not found: ' + airport);
}

function onSearchClear(e) {
    deselectAllPlanes();
    toggleIsolation("off");
    toggleMultiSelect("off");
    jQuery("#search_input").val("");
    jQuery("#search_input").blur();
}

function onResetAltitudeFilter(e) {
    jQuery("#altitude_filter_min").val("");
    jQuery("#altitude_filter_max").val("");
    jQuery("#altitude_filter_min").blur();
    jQuery("#altitude_filter_max").blur();

    updateAltFilter();
    refreshFilter();
}

// ***** ACTUALIZAR FILTRO DE ALTITUD *****
function updateAltFilter() {
    let minAltitude = parseFloat(jQuery("#altitude_filter_min").val().trim());
    let maxAltitude = parseFloat(jQuery("#altitude_filter_max").val().trim());
    let enabled = false;

    if (isNaN(minAltitude)) {
        minAltitude = -1e6;
    }
    if (isNaN(maxAltitude)) {
        maxAltitude = 1e6;
    }

    const hasMinValid = minAltitude !== -1e6;
    const hasMaxValid = maxAltitude !== 1e6;

    if (hasMinValid && hasMaxValid && minAltitude > maxAltitude) {
        let errorText = 'ERROR: Minimum altitude ({min}) cannot be greater than maximum altitude ({max}). Please correct the values.';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            errorText = window.translate.t('error_min_alt_greater') || errorText;
        } else if (typeof window.t === 'function') {
            errorText = window.t('error_min_alt_greater') || errorText;
        }
        errorText = errorText.replace(/\{min\}/g, minAltitude).replace(/\{max\}/g, maxAltitude);
        showSearchWarning(errorText);

        jQuery("#altitude_filter_min").addClass('input-error').removeClass('filter-active');
        jQuery("#altitude_filter_max").addClass('input-error').removeClass('filter-active');

        PlaneFilter.enabled = false;
        PlaneFilter.minAltitude = undefined;
        PlaneFilter.maxAltitude = undefined;

        return;

    } else {
        hideSearchWarning();
        jQuery("#altitude_filter_min").removeClass('input-error');
        jQuery("#altitude_filter_max").removeClass('input-error');
    }

    if (minAltitude < -1e6 || minAltitude > 1e6 || isNaN(minAltitude))
        minAltitude = -1e6;
    else
        enabled = true;

    if (maxAltitude < -1e6 || maxAltitude > 1e6 || isNaN(maxAltitude))
        maxAltitude = 1e6;
    else
        enabled = true;

    const hasMinValidFinal = minAltitude !== -1e6;
    const hasMaxValidFinal = maxAltitude !== 1e6;

    if (!hasMinValidFinal && !hasMaxValidFinal) {
        enabled = false;
        hideSearchWarning();
        jQuery("#altitude_filter_min").removeClass('filter-active');
        jQuery("#altitude_filter_max").removeClass('filter-active');
    }

    if (!enabled) {
        PlaneFilter.enabled = false;
        PlaneFilter.minAltitude = undefined;
        PlaneFilter.maxAltitude = undefined;
        return;
    }

    let noLimitText = 'no limit';
    let toText = 'to';
    let successPrefix = '✓ Altitude filter active:';

    if (typeof window.translate !== 'undefined' && window.translate.t) {
        noLimitText = window.translate.t('no_limit') || noLimitText;
        toText = window.translate.t('to') || toText;
        successPrefix = window.translate.t('altitude_filter_active') || successPrefix;
    } else if (typeof window.t === 'function') {
        noLimitText = window.t('no_limit') || noLimitText;
        toText = window.t('to') || toText;
        successPrefix = window.t('altitude_filter_active') || successPrefix;
    }

    const minDisplay = minAltitude !== -1e6 ? minAltitude : noLimitText;
    const maxDisplay = maxAltitude !== 1e6 ? maxAltitude : noLimitText;
    const unit = DisplayUnits === "metric" ? "m" : "ft";
    showSuccessMessage(successPrefix + ' ' + minDisplay + ' ' + toText + ' ' + maxDisplay + ' ' + unit);

    jQuery("#altitude_filter_min").addClass('filter-active').removeClass('input-error');
    jQuery("#altitude_filter_max").addClass('filter-active').removeClass('input-error');

    PlaneFilter.enabled = true;

    let minAltFeet = minAltitude;
    let maxAltFeet = maxAltitude;

    if (DisplayUnits === "metric") {
        minAltFeet = minAltitude !== -1e6 ? minAltitude * 3.28084 : -1e6;
        maxAltFeet = maxAltitude !== 1e6 ? maxAltitude * 3.28084 : 1e6;
    }

    PlaneFilter.minAltitude = minAltFeet;
    PlaneFilter.maxAltitude = maxAltFeet;

    updateAltitudeFilterIndicators(minAltFeet, maxAltFeet, enabled);
}

function getFlightAwareIdentLink(ident, linkText) {
    if (ident !== null && ident !== "") {
        if (!linkText) {
            linkText = ident;
        }
        return '<a class="link" target="_blank" href="https://flightaware.com/live/flight/' + ident.trim() + '" rel="noreferrer">' + linkText + '</a>';
    }

    return "";
}

function onResetSourceFilter(e) {
    jQuery('#sourceFilter .ui-selected').removeClass('ui-selected');

    sourcesFilter = null;

    updateSourceFilter();
}

function updateSourceFilter(e) {
    if (e)
        e.preventDefault();

    PlaneFilter.sources = sourcesFilter;

    refreshFilter();
}

function onResetFlagFilter(e) {
    jQuery('#flagFilter .ui-selected').removeClass('ui-selected');

    flagFilter = null;

    updateFlagFilter();
}

function updateFlagFilter(e) {
    if (e)
        e.preventDefault();

    PlaneFilter.flagFilter = flagFilter;

    refreshFilter();
}

const filters = {};
const filter_list = [];
const filters_active = [];

function Filter(arg) {
    this.key = arg.key;
    this.field = arg.field;
    this.name = arg.name;

    // Si se solicita saltar la creación de UI, solo almacenar
    if (arg.skipUICreation) {
        this.pattern = '';
        this.PATTERN = '';
        return;
    }

    this.tbody = document.getElementById(arg.table).getElementsByTagName('tbody')[0];

    this.id = 'filters_' + this.key;
    this.sid = '#' + this.id;

    filters[this.key] = this;
    filter_list.push(this);

    this.init();
}

Filter.prototype.update = function (e) {
    if (e) {
        e.preventDefault();
    }

    this.input.blur();
    const val = this.input.val().trim();

    this.set(val);

    return false;
}
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

Filter.prototype.reset = function (e) {
    if (e) {
        e.preventDefault();
    }
    this.set("");
    return false;
}

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

// ***** INICIALIZAR FILTROS *****
function initFilters() {
    initSourceFilter(tableColors.unselected);
    initFlagFilter(tableColors.unselected);

    const filterTable = document.getElementById('filterTable');
    const filterTable2 = document.getElementById('filterTable2');
    const filterTable3 = document.getElementById('filterTable3');

    if (filterTable) filterTable.innerHTML = '';
    if (filterTable2) filterTable2.innerHTML = '';
    if (filterTable3) filterTable3.innerHTML = '';


    const container = document.createElement('div');
    container.className = 'filters-accordion';

    // ***** VUELOS *****
    const group1 = document.createElement('div');
    group1.className = 'filter-group';
    group1.innerHTML = `
        <div class="filter-group-header" data-group="flight">
            <span class="filter-group-title">Flight</span>
            <span class="accordion-icon">▶</span>
        </div>
        <div class="filter-group-content">
            <div class="filter-group-content-inner">
                <div class="filter-group-search">
                    <input type="text" id="filter_flight_search" class="filterSearchInput" 
                           placeholder="Search by callsign, squawk or ICAO hex..." autocomplete="off">
                </div>
                <div class="filter-buttons">
                    <button class="formButton filter-clear-btn" data-group="flight">Clear</button>
                </div>
            </div>
        </div>
    `;
    container.appendChild(group1);

    // ***** TIPO AERONAVE *****
    const group2 = document.createElement('div');
    group2.className = 'filter-group';
    group2.innerHTML = `
        <div class="filter-group-header" data-group="type">
            <span class="filter-group-title">Aircraft type</span>
            <span class="accordion-icon">▶</span>
        </div>
        <div class="filter-group-content">
            <div class="filter-group-content-inner">
                <div class="filter-group-search">
                    <input type="text" id="filter_type_search" class="filterSearchInput" 
                           placeholder="Search by type code, description or category..." autocomplete="off">
                </div>
                <div class="filter-buttons">
                    <button class="formButton filter-clear-btn" data-group="type">Clear</button>
                </div>
            </div>
        </div>
    `;
    container.appendChild(group2);

    // ***** RUTA Y REG *****
    const group3 = document.createElement('div');
    group3.className = 'filter-group';
    group3.innerHTML = `
        <div class="filter-group-header" data-group="reg">
            <span class="filter-group-title">Registration & route</span>
            <span class="accordion-icon">▶</span>
        </div>
        <div class="filter-group-content">
            <div class="filter-group-content-inner">
                <div class="filter-group-search">
                    <input type="text" id="filter_reg_search" class="filterSearchInput" 
                           placeholder="Search by registration, route or country..." autocomplete="off">
                </div>
                <div class="filter-buttons">
                    <button class="formButton filter-clear-btn" data-group="reg">Clear</button>
                </div>
            </div>
        </div>
    `;
    container.appendChild(group3);

    // ***** FUENTE *****
    const group4 = document.createElement('div');
    group4.className = 'filter-group';
    group4.innerHTML = `
        <div class="filter-group-header" data-group="source">
            <span class="filter-group-title">Source</span>
            <span class="accordion-icon">▶</span>
        </div>
        <div class="filter-group-content">
            <div class="filter-group-content-inner">
                <form id="source_filter_form">
                    <ol id="sourceFilter" class="buttonFilter"></ol>
                    <div class="filter-buttons">
                        <button class="formButton" type="submit">Apply</button>
                        <button class="formButton" id="source_filter_reset_button">Reset</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    container.appendChild(group4);

    // ***** BANDERAS *****
    const group5 = document.createElement('div');
    group5.className = 'filter-group';
    group5.innerHTML = `
        <div class="filter-group-header" data-group="flags">
            <span class="filter-group-title">DB Flags</span>
            <span class="accordion-icon">▶</span>
        </div>
        <div class="filter-group-content">
            <div class="filter-group-content-inner">
                <form id="flag_filter_form">
                    <ol id="flagFilter" class="buttonFilter"></ol>
                    <div class="filter-buttons">
                        <button class="formButton" type="submit">Apply</button>
                        <button class="formButton" id="flag_filter_reset_button">Reset</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    container.appendChild(group5);

    // ***** ALTITUD *****
    const group6 = document.createElement('div');
    group6.className = 'filter-group';
    group6.innerHTML = `
        <div class="filter-group-header" data-group="altitude">
            <span class="filter-group-title">Altitude</span>
            <span class="accordion-icon">▶</span>
        </div>
        <div class="filter-group-content">
            <div class="filter-group-content-inner">
                <div class="filter-group-fields" style="display: grid; grid-template-columns: 1fr auto 1fr; gap: calc(8px * var(--SCALE));">
                    <input id="altitude_filter_min" name="minAltitude" type="text" class="filterInput" data-i18n="min_ft" placeholder="Min ft" maxlength="6">
                    <span style="text-align: center; color: var(--TXTCOLOR3);">to</span>
                    <input id="altitude_filter_max" name="maxAltitude" type="text" class="filterInput" data-i18n="max_ft" placeholder="Max ft" maxlength="6">
                </div>
                <div class="filter-buttons">
                    <button class="formButton" id="altitude_filter_apply">Apply</button>
                    <button class="formButton" id="altitude_filter_reset_button">Reset</button>
                </div>
            </div>
        </div>
    `;
    container.appendChild(group6);

    // ***** RECEPTORES *****
    const group7 = document.createElement('div');
    group7.className = 'filter-group';
    group7.innerHTML = `
        <div class="filter-group-header" data-group="receivers">
            <span class="filter-group-title">Receptores</span>
            <span class="accordion-icon">▶</span>
        </div>
        <div class="filter-group-content">
            <div class="filter-group-content-inner">
                <div id="receiverCheckboxes" style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" class="receiver-cb" value="a" checked> Receptor A
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" class="receiver-cb" value="b" checked> Receptor B
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" class="receiver-cb" value="c" checked> Receptor C
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" class="receiver-cb" value="d" checked> Receptor D
                    </label>
                </div>
                <div class="filter-buttons" style="margin-top: 8px;">
                    <button class="formButton" id="receiver_filter_apply">Apply</button>
                    <button class="formButton" id="receiver_filter_reset_button">Reset</button>
                </div>
            </div>
        </div>
    `;
    container.appendChild(group7);

    // ***** TABLA FILTRADA *****
    if (filterTable) {
        filterTable.innerHTML = '';
        const tbody = document.createElement('tbody');
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.appendChild(container);
        tr.appendChild(td);
        tbody.appendChild(tr);
        filterTable.appendChild(tbody);
    }

    if (filterTable2) filterTable2.innerHTML = '';
    if (filterTable3) filterTable3.innerHTML = '';

    // ***** ACORDIÓN CONTENEDOR DE LOS FILTROS *****
    function initAccordion() {
        const groups = document.querySelectorAll('.filter-group');

        groups.forEach((group, index) => {
            const header = group.querySelector('.filter-group-header');
            const content = group.querySelector('.filter-group-content');
            const icon = header.querySelector('.accordion-icon');

            let isExpanded = false;
            content.style.height = '0px';
            icon.textContent = '▶';
            header.setAttribute('aria-expanded', 'false');

            header.addEventListener('click', () => {
                isExpanded = !isExpanded;

                if (isExpanded) {
                    const targetHeight = content.scrollHeight;
                    content.style.height = targetHeight + 'px';
                    icon.textContent = '▼';
                    header.setAttribute('aria-expanded', 'true');

                    const onTransitionEnd = () => {
                        content.style.height = 'auto';
                        content.removeEventListener('transitionend', onTransitionEnd);
                    };
                    content.addEventListener('transitionend', onTransitionEnd);
                } else {
                    const currentHeight = content.scrollHeight;
                    content.style.height = currentHeight + 'px';

                    content.offsetHeight;

                    content.style.height = '0px';
                    icon.textContent = '▶';
                    header.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    let flightSearchPattern = '';
    let typeSearchPattern = '';
    let regSearchPattern = '';

    // ***** ACTUALIZAR FILTROS *****
    function updateFilters() {
        filters_active.length = 0;

        // ***** VUELOS *****
        if (flightSearchPattern) {
            const pattern = flightSearchPattern.toUpperCase();
            filters_active.push({
                field: 'multi_flight',
                pattern: pattern,
                PATTERN: pattern,
                matches: function (plane) {
                    const callsign = (plane.name || '').toUpperCase();
                    const squawk = (plane.squawk || '').toUpperCase();
                    const icao = (plane.icao || '').toUpperCase();
                    return callsign.includes(pattern) || squawk.includes(pattern) || icao.includes(pattern);
                }
            });
        }

        // ***** TIPO *****
        if (typeSearchPattern) {
            const pattern = typeSearchPattern.toUpperCase();
            filters_active.push({
                field: 'multi_type',
                pattern: pattern,
                PATTERN: pattern,
                matches: function (plane) {
                    const typeCode = (plane.icaoType || '').toUpperCase();
                    const typeDesc = (plane.typeDescription || '').toUpperCase();
                    const category = (plane.category || '').toUpperCase();
                    return typeCode.includes(pattern) || typeDesc.includes(pattern) || category.includes(pattern);
                }
            });
        }

        // ***** REG *****
        if (regSearchPattern) {
            const pattern = regSearchPattern.toUpperCase();
            filters_active.push({
                field: 'multi_reg',
                pattern: pattern,
                PATTERN: pattern,
                matches: function (plane) {
                    const registration = (plane.registration || '').toUpperCase();
                    const route = (plane.routeString || '').toUpperCase();
                    const country = (plane.country || '').toUpperCase();
                    return registration.includes(pattern) || route.includes(pattern) || country.includes(pattern);
                }
            });
        }

        refreshFilter();
    }

    // ***** INPUT DE VUELO *****
    const flightInput = document.getElementById('filter_flight_search');
    if (flightInput) {
        let placeholder = 'Search by callsign, squawk or ICAO hex...';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            placeholder = window.translate.t('search_flight_placeholder') || placeholder;
        } else if (typeof window.t === 'function') {
            placeholder = window.t('search_flight_placeholder') || placeholder;
        }
        flightInput.placeholder = placeholder;

        flightInput.addEventListener('input', (e) => {
            flightSearchPattern = e.target.value;
            updateFilters();
        });
        if (usp.has('filterFlight')) {
            flightSearchPattern = usp.get('filterFlight');
            flightInput.value = flightSearchPattern;
            updateFilters();
        }
    }

    // ***** INPUT DE TIPO *****
    const typeInput = document.getElementById('filter_type_search');
    if (typeInput) {
        let placeholder = 'Search by type code, description or category...';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            placeholder = window.translate.t('search_type_placeholder') || placeholder;
        } else if (typeof window.t === 'function') {
            placeholder = window.t('search_type_placeholder') || placeholder;
        }
        typeInput.placeholder = placeholder;

        typeInput.addEventListener('input', (e) => {
            typeSearchPattern = e.target.value;
            updateFilters();
        });
        if (usp.has('filterType')) {
            typeSearchPattern = usp.get('filterType');
            typeInput.value = typeSearchPattern;
            updateFilters();
        }
    }

    // ***** INPUT DE REG *****
    const regInput = document.getElementById('filter_reg_search');
    if (regInput) {
        let placeholder = 'Search by registration, route or country...';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            placeholder = window.translate.t('search_reg_placeholder') || placeholder;
        } else if (typeof window.t === 'function') {
            placeholder = window.t('search_reg_placeholder') || placeholder;
        }
        regInput.placeholder = placeholder;

        regInput.addEventListener('input', (e) => {
            regSearchPattern = e.target.value;
            updateFilters();
        });
        if (usp.has('filterReg')) {
            regSearchPattern = usp.get('filterReg');
            regInput.value = regSearchPattern;
            updateFilters();
        }
    }

    // ***** TÍTULO DE CADA FILTRO *****
    const groupTitles = {
        'Flight': 'filter_flight',
        'Aircraft type': 'filter_aircraft_type',
        'Registration & route': 'filter_registration_route',
        'Source': 'filter_source',
        'DB Flags': 'filter_db_flags',
        'Altitude': 'filter_altitude'
    };

    // ***** TRADUCIR TÍTULOS DE LOS FILTROS *****
    document.querySelectorAll('.filter-group-header .filter-group-title').forEach(el => {
        const text = el.textContent.trim();
        const key = groupTitles[text];
        if (key) {
            let translation = text;
            if (typeof window.translate !== 'undefined' && window.translate.t) {
                translation = window.translate.t(key) || text;
            } else if (typeof window.t === 'function') {
                translation = window.t(key) || text;
            }
            el.textContent = translation;
        }
    });

    // ***** TRADUCIR TEXTO DE LIMPIAR FILTRO *****
    document.querySelectorAll('.filter-clear-btn').forEach(btn => {
        let clearText = 'Clear';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            clearText = window.translate.t('clear') || clearText;
        } else if (typeof window.t === 'function') {
            clearText = window.t('clear') || clearText;
        }
        btn.textContent = clearText;

        btn.addEventListener('click', () => {
            const group = btn.dataset.group;
            if (group === 'flight') {
                if (flightInput) flightInput.value = '';
                flightSearchPattern = '';
            } else if (group === 'type') {
                if (typeInput) typeInput.value = '';
                typeSearchPattern = '';
            } else if (group === 'reg') {
                if (regInput) regInput.value = '';
                regSearchPattern = '';
            }
            updateFilters();
        });
    });

    // ***** TRADUCIR TEXTO DE APLICAR FILTRO *****
    document.querySelectorAll('#altitude_filter_apply, #source_filter_form button[type="submit"], #flag_filter_form button[type="submit"], #receiver_filter_apply').forEach(btn => {
        let applyText = 'Apply';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            applyText = window.translate.t('apply') || applyText;
        } else if (typeof window.t === 'function') {
            applyText = window.t('apply') || applyText;
        }
        btn.textContent = applyText;
    });

    // ***** TRADUCIR TEXTO DE RESETEAR FILTRO *****
    document.querySelectorAll('#altitude_filter_reset_button, #source_filter_reset_button, #flag_filter_reset_button, #receiver_filter_reset_button').forEach(btn => {
        let resetText = 'Reset';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            resetText = window.translate.t('reset') || resetText;
        } else if (typeof window.t === 'function') {
            resetText = window.t('reset') || resetText;
        }
        btn.textContent = resetText;
    });

    initSourceFilter(tableColors.unselected);

    // ***** ACTUALIZAR FILTRO DE FUENTE *****
    const sourceForm = document.getElementById('source_filter_form');
    if (sourceForm) {
        sourceForm.onsubmit = function (e) {
            if (e) e.preventDefault();
            updateSourceFilter(e);
        };
    }

    // ***** RESETEAR FUENTE *****
    const sourceResetBtn = document.getElementById('source_filter_reset_button');
    if (sourceResetBtn) {
        sourceResetBtn.onclick = function (e) {
            if (e) e.preventDefault();
            jQuery('#sourceFilter .ui-selected').removeClass('ui-selected');
            sourcesFilter = null;
            updateSourceFilter(e);
        };
    }

    initFlagFilter(tableColors.unselected);

    // ***** ACTUALIZAR FILTRO DE FLAG *****
    const flagForm = document.getElementById('flag_filter_form');
    if (flagForm) {
        flagForm.onsubmit = function (e) {
            if (e) e.preventDefault();
            updateFlagFilter(e);
        };
    }

    // ***** RESETEAR FLAG *****
    const flagResetBtn = document.getElementById('flag_filter_reset_button');
    if (flagResetBtn) {
        flagResetBtn.onclick = function (e) {
            if (e) e.preventDefault();
            jQuery('#flagFilter .ui-selected').removeClass('ui-selected');
            flagFilter = null;
            updateFlagFilter(e);
        };
    }

    // ***** APLICAR FILTRO DE ALTITUD *****
    const altitudeApply = document.getElementById('altitude_filter_apply');
    if (altitudeApply) {
        altitudeApply.addEventListener('click', (e) => {
            e.preventDefault();
            jQuery("#altitude_filter_min").blur();
            jQuery("#altitude_filter_max").blur();
            updateAltFilter();
            refreshFilter();
        });
    }

    // ***** RESETEAR FILTRO DE ALTITUD *****
    const altitudeReset = document.getElementById('altitude_filter_reset_button');
    if (altitudeReset) {
        altitudeReset.addEventListener('click', (e) => {
            e.preventDefault();
            jQuery("#altitude_filter_min").val("");
            jQuery("#altitude_filter_max").val("");
            updateAltFilter();
            refreshFilter();
        });
    }

    // ***** APLICAR FILTRO DE RECEPTORES *****
    const receiverApply = document.getElementById('receiver_filter_apply');
    if (receiverApply) {
        receiverApply.addEventListener('click', (e) => {
            e.preventDefault();
            const checked = [];
            document.querySelectorAll('.receiver-cb:checked').forEach(cb => {
                checked.push(cb.value);
            });
            if (checked.length === 4) {
                receiverFilter = null; // todos
            } else if (checked.length === 0) {
                receiverFilter = new Set(['__none__']);
            } else {
                receiverFilter = new Set(checked);
            }
            refreshFilter();
        });
    }

    // ***** RESETEAR FILTRO DE RECEPTORES *****
    const receiverReset = document.getElementById('receiver_filter_reset_button');
    if (receiverReset) {
        receiverReset.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.receiver-cb').forEach(cb => {
                cb.checked = true;
            });
            receiverFilter = null;
            refreshFilter();
        });
    }

    if (PlaneFilter) {
        if (PlaneFilter.minAltitude && PlaneFilter.minAltitude > -1000000) {
            jQuery('#altitude_filter_min').val(PlaneFilter.minAltitude);
        }
        if (PlaneFilter.maxAltitude && PlaneFilter.maxAltitude < 1000000) {
            jQuery('#altitude_filter_max').val(PlaneFilter.maxAltitude);
        }
    }

    if (PlaneFilter.sources) {
        sourcesFilter = PlaneFilter.sources;
        sourcesFilter.map((f) => jQuery('#source-filter-' + f).addClass('ui-selected'));
    }

    if (PlaneFilter.flagFilter) {
        flagFilter = PlaneFilter.flagFilter;
        flagFilter.map((f) => jQuery('#flag-filter-' + f).addClass('ui-selected'));
    }

    initAccordion();
}

// ***** ACTUALIZAR IDIOMA DE COLUMNAS Y FILTROS *****
(function () {
    'use strict';

    // ***** OBTENER TRADUCCIONES *****
    function getTranslation(key, fallback) {
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            const translated = window.translate.t(key);
            if (translated && translated !== key) return translated;
        } else if (typeof window.t === 'function') {
            const translated = window.t(key);
            if (translated && translated !== key) return translated;
        }
        return fallback || key;
    }

    // ***** ACTUALIZAR LENGUAJE DE COLUMNAS *****
    function updateTableColumnLanguage() {
        if (typeof TAR === 'undefined' || !TAR.planeMan || !TAR.planeMan.cols) {
            console.log('Column update: TAR.planeMan.cols not available yet');
            return;
        }

        const cols = TAR.planeMan.cols;
        let updatedCount = 0;

        for (const colId in cols) {
            const col = cols[colId];
            if (!col || !col.id) continue;

            const translationKey = 'col_' + col.id;
            const translatedText = getTranslation(translationKey, col.text || col.id);

            if (translatedText !== col.text) {
                col.text = translatedText;
                updatedCount++;
            }

            col.header = function () {
                return col.text || col.id;
            };
        }

        document.querySelectorAll('#planesTable thead th, #planesTable thead td').forEach(el => {
            const colId = el.id;
            if (colId && cols[colId]) {
                const newText = cols[colId].text || colId;
                if (el.textContent !== newText) {
                    el.textContent = newText;
                }
            }
        });

        document.querySelectorAll('#sortableColumns .settingsText').forEach(el => {
            const li = el.closest('li');
            if (li) {
                const id = li.id.replace('dd_', '');
                if (id && cols[id]) {
                    const newText = cols[id].text || id;
                    if (el.textContent !== newText) {
                        el.textContent = newText;
                    }
                }
            }
        });

        const activeTitle = document.querySelector('#column-category-checked .column-category-title');
        const inactiveTitle = document.querySelector('#column-category-unchecked .column-category-title');

        if (activeTitle) {
            const checkedCount = document.querySelectorAll('#checked-columns-grid li').length;
            const activeText = getTranslation('active_columns', 'Active columns');
            const newText = activeText + ' (' + checkedCount + ')';
            if (activeTitle.textContent !== newText) {
                activeTitle.textContent = newText;
            }
        }

        if (inactiveTitle) {
            const uncheckedCount = document.querySelectorAll('#unchecked-columns-grid li').length;
            const inactiveText = getTranslation('inactive_columns', 'Inactive columns');
            const newText = inactiveText + ' (' + uncheckedCount + ')';
            if (inactiveTitle.textContent !== newText) {
                inactiveTitle.textContent = newText;
            }
        }

        const tableOptionsTitle = document.querySelector(
            '#column-category-table-options .column-category-title'
        );

        if (tableOptionsTitle) {
            tableOptionsTitle.textContent = getTranslation(
                'table_display_options',
                'Table display options'
            );
        }

        const resetBtn = document.getElementById('reset-columns-btn');
        if (resetBtn) {
            const restoreText = getTranslation('restore_default_columns', 'Restore default columns');
            if (resetBtn.textContent !== restoreText) {
                resetBtn.textContent = restoreText;
            }
            if (resetBtn.title !== restoreText) {
                resetBtn.title = restoreText;
            }
        }

        if (updatedCount > 0 && typeof TAR.planeMan.redraw === 'function') {
            TAR.planeMan.redraw();
        }

        return updatedCount;
    }

    // ***** ACTUALIZAR LENGUAJE DE FILTROS *****
    function updateFilterLanguage() {
        let updatedCount = 0;

        const groupTitleMap = {
            'flight': 'filter_flight',
            'type': 'filter_aircraft_type',
            'reg': 'filter_registration_route',
            'source': 'filter_source',
            'flags': 'filter_db_flags',
            'altitude': 'filter_altitude'
        };

        const textToKeyMap = {
            'Flight': 'filter_flight',
            'Aircraft type': 'filter_aircraft_type',
            'Registration & route': 'filter_registration_route',
            'Source': 'filter_source',
            'DB Flags': 'filter_db_flags',
            'Altitude': 'filter_altitude'
        };

        // ***** TÍTULOS *****
        document.querySelectorAll('.filter-group-header .filter-group-title').forEach(el => {
            const currentText = el.textContent.trim();
            let key = null;

            const header = el.closest('.filter-group-header');
            if (header && header.dataset.group && groupTitleMap[header.dataset.group]) {
                key = groupTitleMap[header.dataset.group];
            }

            if (!key && textToKeyMap[currentText]) {
                key = textToKeyMap[currentText];
            }

            if (key) {
                const translated = getTranslation(key, currentText);
                if (translated !== currentText) {
                    el.textContent = translated;
                    updatedCount++;
                }
            }
        });

        // ***** VUELOS *****
        const flightInput = document.getElementById('filter_flight_search');
        if (flightInput) {
            const placeholder = getTranslation('search_flight_placeholder', 'Search by callsign, squawk or ICAO hex...');
            if (flightInput.placeholder !== placeholder) {
                flightInput.placeholder = placeholder;
                updatedCount++;
            }
        }

        // ***** TIPOS *****
        const typeInput = document.getElementById('filter_type_search');
        if (typeInput) {
            const placeholder = getTranslation('search_type_placeholder', 'Search by type code, description or category...');
            if (typeInput.placeholder !== placeholder) {
                typeInput.placeholder = placeholder;
                updatedCount++;
            }
        }

        // ***** REG *****
        const regInput = document.getElementById('filter_reg_search');
        if (regInput) {
            const placeholder = getTranslation('search_reg_placeholder', 'Search by registration, route or country...');
            if (regInput.placeholder !== placeholder) {
                regInput.placeholder = placeholder;
                updatedCount++;
            }
        }

        // ***** TEXTO DE LIMPIAR FILTROS *****
        document.querySelectorAll('.filter-clear-btn').forEach(btn => {
            const translated = getTranslation('clear', 'Clear');
            if (btn.textContent !== translated) {
                btn.textContent = translated;
                updatedCount++;
            }
        });

        // ***** TEXTO DE APLICAR FILTROS *****
        document.querySelectorAll('#altitude_filter_apply, #source_filter_form button[type="submit"], #flag_filter_form button[type="submit"]').forEach(btn => {
            const translated = getTranslation('apply', 'Apply');
            if (btn.textContent !== translated) {
                btn.textContent = translated;
                updatedCount++;
            }
        });

        // ***** TEXTO DE RESETEAR FILTROS *****
        document.querySelectorAll('#altitude_filter_reset_button, #source_filter_reset_button, #flag_filter_reset_button').forEach(btn => {
            const translated = getTranslation('reset', 'Reset');
            if (btn.textContent !== translated) {
                btn.textContent = translated;
                updatedCount++;
            }
        });

        // ***** TEXTO DE DESDE HASTA EN FILTRO DE ALTITUD *****
        document.querySelectorAll('.filter-group-fields span').forEach(el => {
            const text = el.textContent.trim();
            if (text === 'to' || text === 'To') {
                const translated = getTranslation('to', 'to');
                if (el.textContent !== translated) {
                    el.textContent = translated;
                    updatedCount++;
                }
            }
        });

        return updatedCount;
    }

    // ***** ACTUALIZAR LENGUAJE DE ELEMENTOS DE UI *****
    function updateUIElements() {
        let updatedCount = 0;

        const tabMap = {
            'Map': 'tab_map',
            'Filters': 'tab_filters',
            'Columns': 'tab_columns'
        };

        // ***** TABS *****
        document.querySelectorAll('#tabs .ui-tabs-tab a').forEach(tab => {
            const text = tab.textContent.trim();
            if (tabMap[text]) {
                const translated = getTranslation(tabMap[text], text);
                if (tab.textContent !== translated) {
                    tab.textContent = translated;
                    updatedCount++;
                }
            }
        });

        // ***** SELECCIÓN DE TRAMOS *****
        const legSel = document.getElementById('leg_sel');
        if (legSel) {
            const currentText = legSel.textContent;
            if (currentText === 'Legs: All' || currentText === 'Tramos: Todos') {
                const translated = getTranslation('legs_all', 'Legs: All');
                if (legSel.textContent !== translated) {
                    legSel.textContent = translated;
                    updatedCount++;
                }
            }
        }

        return updatedCount;
    }

    // ***** EJECUTAR TODAS LAS FUNCIONES DE ACTUALIZACIÓN DE IDIOMA *****
    function updateAllLanguage() {
        if (typeof window.updateAllToggles === 'function') {
            window.updateAllToggles();
        }

        updateTableColumnLanguage();
        updateFilterLanguage();
        updateUIElements();

        if (typeof updateZoomIndicator === 'function') {
            updateZoomIndicator();
        }
    }

    document.removeEventListener('languageChanged', updateAllLanguage);
    document.addEventListener('languageChanged', updateAllLanguage);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // Esperar un poco a que todo esté inicializado
            setTimeout(updateAllLanguage, 500);
        });
    } else {
        setTimeout(updateAllLanguage, 500);
    }

    document.addEventListener('click', function (e) {
        if (e.target.closest('#settingsCog') || e.target.closest('#settings_infoblock')) {
            setTimeout(updateAllLanguage, 100);
        }
    });

    window.updateAllLanguage = updateAllLanguage;
    window.updateTableColumnLanguage = updateTableColumnLanguage;
    window.updateFilterLanguage = updateFilterLanguage;
    window.updateUIElements = updateUIElements;

})();

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

function changeZoom(init) {
    if (!OLMap)
        return;

    g.zoomLvl = OLMap.getView().getZoom();
    updateZoomIndicator();

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

function checkPointermove() {
    if ((webgl || g.zoomLvl > 5.5) && enableMouseover && !onMobile) {
        OLMap.on('pointermove', onPointermove);
    } else {
        OLMap.un('pointermove', onPointermove);
        removeHighlight();
    }
}


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

function checkMovement() {
    if (typeof jQuery === 'undefined' || !jQuery.fn.updateText) {
        return;
    }
    if (!OLMap)
        return;

    if (!g.firstFetchDone) {
        return;
    }

    if (debugAll) {
        const zoom = OLMap.getView().getZoom();
        const center = ol.proj.toLonLat(OLMap.getView().getCenter());
        console.log(`[DEBUG ALL] Movement - Zoom: ${zoom.toFixed(2)}, Center: [${center[0].toFixed(4)}, ${center[1].toFixed(4)}], Time: ${new Date().toISOString()}`);
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

function getZoom() {
    return OLMap.getView().getZoom();
}

function getCenter() {
    return ol.proj.toLonLat(OLMap.getView().getCenter());
}

let lastRefresh = 0;
let refreshZoom, refreshCenter;
function checkRefresh() {
    if (!appReady) return;
    if (typeof jQuery === 'undefined' || !jQuery.fn.updateText) {
        return;
    }
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
function refresh(redraw) {
    if (typeof jQuery === 'undefined' || !jQuery.fn.updateText) {
        return;
    }
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

// function refreshFilter() {
//     if (filterTracks)
//         remakeTrails();

//     refresh(true);

//     drawHeatmap();
//     if (toggles.shareFilters && toggles.shareFilters.state) {
//         updateAddressBar();
//     }
// }

function refreshFilter() {
    if (filterTracks)
        remakeTrails();

    refresh(true);

    drawHeatmap();
    if (toggles.shareFilters && toggles.shareFilters.state) {
        updateAddressBar();
    }
}

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

    // jQuery('#history_collapse').toggle();
    // jQuery('#show_trace').toggleClass('active');
    const historyToggle = document.querySelector(
        '.section-toggle[data-target="history_block"]'
    );

    if (historyToggle) {
        const expanded = historyToggle.getAttribute('aria-expanded') === 'true';

        if (expanded !== showTrace)
            historyToggle.click();
    }
}

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
        let noDataText = getTranslatedText('history_no_data', 'No Data available for');
        jQuery('#leg_sel').text(noDataText + ' ' + traceDateString);
        jQuery('#trace_time').updateText(
            getTranslatedText('history_time_label', 'Time:') + '\n'
        );
        return;
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
        let legsAllText = getTranslatedText('history_legs_all', 'Legs: All');
        jQuery('#leg_sel').text(legsAllText);
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
    let legLabel = getTranslatedText('history_leg_label', 'Leg:');
    jQuery('#leg_sel').text(legLabel + ' ' + (legSel + 1));
    traceOpts.legStart = legStart;
    traceOpts.legEnd = legEnd;
    plane.processTrace();

    updateAddressBar();
}

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

function shiftTrace(offset) {
    if (traceRate > 180) {
        let slowDownText = getTranslatedText('history_slow_down', 'Slow down! ...');
        jQuery('#leg_sel').text(slowDownText);
        return;
    }

    // reset some traceOpts stuff (important)
    traceOpts.startStamp = null;
    traceOpts.endStamp = null;
    traceOpts.showTimeEnd = null;
    traceOpts.showTime = null;

    let loadingText = getTranslatedText('history_loading', 'Loading ...');
    jQuery('#leg_sel').text(loadingText);
    if (!traceDate || offset == "today") {
        setTraceDate({ ts: new Date().getTime() });
    } else if (offset) {
        setTraceDate({ ts: traceDate.getTime() + offset * 86400 * 1000 });
    }

    // jQuery('#trace_date').text('UTC day:\n' + traceDateString);
    let utcDayText = getTranslatedText('history_utc_day', 'UTC day:');
    jQuery('#trace_date').text(utcDayText + ' ' + traceDateString);
    jQuery("#histDatePicker").datepicker('setDate', traceDateString);

    for (let i in SelPlanes) {
        selectPlaneByHex(SelPlanes[i].icao, { noDeselect: true, zoom: g.zoomLvl });
    }

    updateAddressBar();
}


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
function logArg(error) {
    console.log(error);
}

let watchPositionId;
let pollPositionSeconds = 10;
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

function remakeTrails() {
    for (let i in g.planesOrdered) {
        const plane = g.planesOrdered[i];
        plane.removeTrail();
        plane.linesDrawn && (plane.drawLine = 1);
        plane.updateFeatures();
    }
}

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
function drawSiteCircle() {
    //console.trace();
    siteCircleFeatures.clear();

    if (!SitePosition)
        return;

    let circleColor = '#000000';

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
                color: '#000000',
                lineDash: SiteCirclesLineDash,
                width: globalScale,
            }),
            text: new ol.style.Text({
                //Range rings letters
                font: ((10 * globalScale) + 'px Helvetica Neue, Helvetica, Tahoma, Verdana, sans-serif'),
                fill: new ol.style.Fill({ color: '#ffffff' }),
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

// ***** INICIAR REPRODUCCIÓN CONTINUA DESDE UN TIMESTAMP *****
function playTraceFrom(timestamp) {
    if (!SelectedPlane) return;
    if (!traceOpts.replaySpeed || traceOpts.replaySpeed <= 0) {
        traceOpts.replaySpeed = 1;
    }
    traceOpts.animate = true;
    traceOpts.animateCounter = 1;
    traceOpts.animateSteps = 1;
    traceOpts.animateRealtime = 0;
    traceOpts.animateStepTime = 0;
    traceOpts.showTime = timestamp;
    traceOpts.showTimeEnd = null;
    legShift(0);
    scheduleNextReplayTick();
}

// ***** AGENDAR SIGUIENTE TICK DE REPRODUCCIÓN *****
function scheduleNextReplayTick() {
    if (!traceOpts.animate || showTrace === false || !SelectedPlane) return;
    clearTimeout(traceOpts.showTimeout);
    const stepMs = 200;
    traceOpts.showTimeout = setTimeout(function () {
        if (!traceOpts.animate || !SelectedPlane) return;
        let next = (traceOpts.showTime || 0) + (traceOpts.replaySpeed || 1) * (stepMs / 1000);
        if (traceOpts.legEnd != null) {
            const endTs = SelectedPlane.fullTrace.trace[traceOpts.legEnd]?.[0];
            if (endTs != null && next >= endTs) {
                next = endTs;
                traceOpts.animate = false;
            }
        }
        traceOpts.showTime = next;
        SelectedPlane.processTrace();
        refreshSelected();
        scheduleNextReplayTick();
    }, stepMs);
}

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

function everySecond() {
    if (traceRate > 0)
        traceRate = traceRate * 0.985 - 1;
    updateIconCache();

}

let getTraceTimeout = null;
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

function setSize(set) {
    let count = 0;
    for (const i in set.values())
        count++;
    return count;
}

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

function currentExtent(factor) {
    let size = OLMap.getSize();
    if (factor != null)
        size = [size[0] * factor, size[1] * factor];
    return myExtent(OLMap.getView().calculateExtent(size));
}

// ***** ESTADO POR DEFECTO DEL REPLAY *****
function replayDefaults(ts) {
    let playText = 'Play';
    if (typeof window.translate !== 'undefined' && window.translate.t) {
        playText = window.translate.t('play') || playText;
    } else if (typeof window.t === 'function') {
        playText = window.t('play') || playText;
    }
    jQuery("#replayPlay").html(playText);
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

function replayClear() {
    clearTimeout(refreshId);
    reaper(true);
    refreshFilter();
    replayPlanes = {};
}

function replayGetChunk(ts) {
    let time = new Date(ts);
    let sDate = sDateString(time);
    let index = 2 * time.getUTCHours() + Math.floor(time.getUTCMinutes() / 30);
    let key = `${sDate} chunk ${index}`;
    let url = "globe_history/" + sDate + "/heatmap/" + index.toString().padStart(2, '0') + ".bin.ttf";
    return { date: sDate, index: index, key: key, url: url, };
}

// ***** CARGAR REPLAY *****
function loadReplay(ts) {
    if (isNaN(ts.getTime())) {
        ts = new Date();
    }

    stopReplayClock();

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

        let loadingText = 'Loading ...';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            loadingText = window.translate.t('loading') || loadingText;
        } else if (typeof window.t === 'function') {
            loadingText = window.t('loading') || loadingText;
        }

        jQuery('#replayLoading').text(loadingText);

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

// ***** INICIALIZAR DATOS DEL REPLAY *****
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

    jQuery('#replayLoading').text('');
}

// ***** MOSTRAR FECHA, HORAS Y MINUTOS EN EL REPLAY *****
function setReplayTimeHint(date) {
    let dateLabel = 'Date:';
    let utcLabel = 'UTC:';

    if (typeof window.translate !== 'undefined' && window.translate.t) {
        dateLabel = window.translate.t('date_label') || dateLabel;
        utcLabel = window.translate.t('utc_label') || utcLabel;
    } else if (typeof window.t === 'function') {
        dateLabel = window.t('date_label') || dateLabel;
        utcLabel = window.t('utc_label') || utcLabel;
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

// ***** SALTAR A LA FECHA BUSCADA *****
let replayJumpEnabled = true;
function replayJump() {
    if (replayEditLock) {
        replayPendingJump = true;
        return;
    }

    if (!showingReplayBar) return;
    if (!replayJumpEnabled) return;

    const hourInput = document.getElementById('replayHourInput');
    const minuteInput = document.getElementById('replayMinuteInput');

    let hours = replay.hours;
    let minutes = replay.minutes;

    if (hourInput) {
        let raw = hourInput.value.replace(/[^0-9]/g, '');
        let val = parseInt(raw);
        if (!isNaN(val) && raw !== '' && val >= 0 && val <= 23) {
            hours = val;
        }
    }

    if (minuteInput) {
        let raw = minuteInput.value.replace(/[^0-9]/g, '');
        let val = parseInt(raw);
        if (!isNaN(val) && raw !== '' && val >= 0 && val <= 59) {
            minutes = val;
        }
    }

    let date = new Date(replay.dateText);
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setUTCSeconds(0);

    let ts = new Date(replay.ts.getTime());

    if (Math.abs(date.getTime() - ts.getTime()) < 10000) {
        return;
    }

    console.log('jump: ' + date.toUTCString());
    replayClear();
    loadReplay(date);
    replayPendingJump = false;
}

// ***** MOSTRAR MINUTOS, HORAS Y VELOCIDAD EN SLIDES Y HACERLOS EDITABLES *****
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

    const hourInput = document.getElementById('replayHourInput');
    if (hourInput && document.activeElement !== hourInput && !replayEditLock) {
        const val = replay.ts.getUTCHours();
        hourInput.value = String(val).padStart(2, '0');
        hourInput.style.color = '#e9edf7';
    }

    const minuteInput = document.getElementById('replayMinuteInput');
    if (minuteInput && document.activeElement !== minuteInput && !replayEditLock) {
        const val = replay.ts.getUTCMinutes();
        minuteInput.value = String(val).padStart(2, '0');
        minuteInput.style.color = '#e9edf7';
    }

    // ***** MOVER LOS SLIDERS AL VALOR ACTUAL DEL REPLAY *****
    syncReplaySlidersToReplay();

    replayJumpEnabled = true;

}

// ***** ACTUALIZAR HORA/MINUTO DEL REPLAY SEGÚN VELOCIDAD *****
let replayClockInterval = null;

function startReplayClock() {
    if (replayClockInterval) return;
    replayClockInterval = setInterval(updateReplayClock, 250);
}

function stopReplayClock() {
    if (replayClockInterval) {
        clearInterval(replayClockInterval);
        replayClockInterval = null;
    }
}

// ***** ACTUALIZAR LOS INPUTS DE HORA Y MINUTO SEGÚN EL TIEMPO DEL REPLAY *****
function updateReplayClock() {
    if (!replay || showTrace) return;
    if (!replay.playing) return;

    let ts = replay.ts;
    if (replay.points && replay.pointsU && replay.slices && replay.index != null) {
        const i = replay.slices[Math.min(replay.index, replay.slices.length - 1)];
        if (i != null) {
            const epochSec = replay.pointsU[i + 2] / 1000 + replay.pointsU[i + 1] * 4294967.296;
            ts = new Date(epochSec * 1000);
        }
    }

    const hours = ts.getUTCHours();
    const minutes = ts.getUTCMinutes();

    const hourInput = document.getElementById('replayHourInput');
    const minuteInput = document.getElementById('replayMinuteInput');

    // ***** ACTUALIZAR LOS INPUTS DE TEXTO (HORA / MINUTO) *****
    if (hourInput && document.activeElement !== hourInput && !replayEditLock) {
        const val = String(hours).padStart(2, '0');
        if (hourInput.value !== val) {
            hourInput.value = val;
            hourInput.style.color = '#e9edf7';
        }
    }

    if (minuteInput && document.activeElement !== minuteInput && !replayEditLock) {
        const val = String(minutes).padStart(2, '0');
        if (minuteInput.value !== val) {
            minuteInput.value = val;
            minuteInput.style.color = '#e9edf7';
        }
    }

    // ***** MOVER LOS SLIDERS DE HORA Y MINUTO SEGÚN EL REPLAY *****
    try {
        const $hourSlider = jQuery('#hourSelect');
        if ($hourSlider.length && $hourSlider.hasClass('ui-slider')) {
            const currentHour = $hourSlider.slider('value');
            if (currentHour !== hours) {
                $hourSlider.slider('value', hours);
            }
        }
    } catch (e) { }

    try {
        const $minuteSlider = jQuery('#minuteSelect');
        if ($minuteSlider.length && $minuteSlider.hasClass('ui-slider')) {
            const currentMinute = $minuteSlider.slider('value');
            if (currentMinute !== minutes) {
                $minuteSlider.slider('value', minutes);
            }
        }
    } catch (e) { }

    // ***** ACTUALIZAR LOS TIPS CON H:M Y M:S *****
    updateReplaySliderTips(hours, minutes, ts.getUTCSeconds());

    setReplayTimeHintFromClock(ts);
}

// ***** SINCRONIZAR SLIDERS DE HORA Y MINUTO CON EL ESTADO DEL REPLAY *****
function syncReplaySlidersToReplay() {
    if (!replay) return;
    try {
        const $hourSlider = jQuery('#hourSelect');
        if ($hourSlider.length && $hourSlider.hasClass('ui-slider')) {
            const currentHour = $hourSlider.slider('value');
            if (currentHour !== replay.hours) {
                $hourSlider.slider('value', replay.hours);
            }
        }
    } catch (e) { }

    try {
        const $minuteSlider = jQuery('#minuteSelect');
        if ($minuteSlider.length && $minuteSlider.hasClass('ui-slider')) {
            const currentMinute = $minuteSlider.slider('value');
            if (currentMinute !== replay.minutes) {
                $minuteSlider.slider('value', replay.minutes);
            }
        }
    } catch (e) { }

    updateReplaySliderTips(replay.hours, replay.minutes, replay.seconds || 0);
}

// ***** VERSIÓN DE setReplayTimeHint QUE NO REESCRIBE HORA/MINUTO *****
function setReplayTimeHintFromClock(ts) {
    if (!replay || !ts) return;

    const dateString = zDateString(ts);
    if (replay.datepickerDate !== dateString) {
        replay.datepickerDate = dateString;
        jQuery("#replayDatepicker").datepicker('setDate', dateString);
    }

    replay.hours = ts.getUTCHours();
    replay.minutes = ts.getUTCMinutes();
    replay.seconds = ts.getUTCSeconds();

    setReplayTimeHint(ts);
}

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

            if (typeof InstrumentedAircraft !== 'undefined' &&
                InstrumentedAircraft.hexes.has(hex)) {
                const p = g.planes[hex];
                if (p) {
                    // Asegurarnos de que la traza completa esté cargada
                    if (!p.fullTrace) {
                        getTrace(p, hex, { noDeselect: true });
                    } else {
                        InstrumentedAircraft.enrichFromTrace(p);
                    }
                }
            }

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
        if (typeof InstrumentedAircraft !== 'undefined' && InstrumentedAircraft.hexes.size) {
            InstrumentedAircraft.hexes.forEach(hex => {
                const p = g.planes[hex];
                if (p && p.fullTrace) {
                    InstrumentedAircraft.enrichFromTrace(p);
                }
            });
        }
        updateReplayClock();
        syncReplaySlidersToReplay();
    }
    replay.index = index + 1;
}

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

function getInactive() {
    return (new Date().getTime() - lastActive) / 1000;
}

function active() {
    lastActive = new Date().getTime();
}

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

// ***** REPRODUCIR REPLAY *****
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

        let pauseText = 'Pause';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            pauseText = window.translate.t('pause') || pauseText;
        } else if (typeof window.t === 'function') {
            pauseText = window.t('pause') || pauseText;
        }

        jQuery("#replayPlay").html(pauseText);
        startReplayClock();
        replayStep();
    } else {
        replay.playing = false;
        stopReplayClock();

        let playText = 'Play';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            playText = window.translate.t('play') || playText;
        } else if (typeof window.t === 'function') {
            playText = window.t('play') || playText;
        }

        jQuery("#replayPlay").html(playText);
        clearTimeout(refreshId);
    }
};

// ***** MOSTRAR REPLAY *****
function showReplayBar() {
    showingReplayBar = !showingReplayBar;
    if (!showingReplayBar) {
        jQuery("#replayBar").hide();
        updateMultiInfoblocksLayout();
        stopReplayClock();
        replay = null;
        jQuery('#map_canvas').height('100%');
        jQuery('#sidebar_canvas').height('100%');
        jQuery("#selected_showTrace_hide").show();
        restoreAltitudeChartPosition();

        // ***** LIMPIAR URL DEL REPLAY *****
        updateAddressBarString = "";
        updateAddressBarPushed = false;
        window.history.replaceState("object or string", "Title", pathName);
        shareLink = window.location.origin + pathName;

        // ***** CAMBIAR VISUALIZACIÓN DEL OVERLAY DE PANORAMA SEGÚN EL REPLAY *****
        const panorama = document.getElementById('panorama-overlay');
        const panoramaButton = document.getElementById('panorama-close');

        if (panorama) {
            panorama.classList.remove('minimized');
        }

        if (panoramaButton) {
            panoramaButton.textContent = '▼';
        }

    } else {
        jQuery("#replayBar").show();
        jQuery("#replayBar").css('display', 'grid');
        jQuery('#replayBar').height('100px');
        jQuery('#map_canvas').height('calc(100% - 110px)');
        jQuery('#sidebar_canvas').height('calc(100% - 100px)');
        updateReplayBarPosition();
        updateMultiInfoblocksLayout();
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
        }

        jQuery("#replayDatepicker").datepicker(datepickerOptions);

        jQuery('#hourSelect').slider({
            step: 1, min: 0, max: 23,
            slide: function (event, ui) {
                replay.hours = ui.value;
                updateSliderTip(ui.handle, ui.value, "h");
                replayOnSliderMove();
            },
            change: function (event, ui) {
                replay.hours = ui.value;
                updateSliderTip(jQuery(this).find('.ui-slider-handle'), ui.value, "h");
                replayJump();
            }
        });

        setupSliderDecorations('#hourSelect', '00h', '23h');

        jQuery('#minuteSelect').slider({
            step: 1, min: 0, max: 59,
            slide: function (event, ui) {
                replay.minutes = ui.value;
                updateSliderTip(ui.handle, ui.value, "m");
                replayOnSliderMove();
            },
            change: function (event, ui) {
                replay.minutes = ui.value;
                updateSliderTip(jQuery(this).find('.ui-slider-handle'), ui.value, "m");
                replayJump();
            }
        });

        setupSliderDecorations('#minuteSelect', '00m', '59m');

        const slideBase = 3.0;
        jQuery('#replaySpeedSelect').slider({
            value: Math.pow(replay.speed, 1 / slideBase),
            step: 0.07,
            min: Math.pow(1, 1 / slideBase),
            max: Math.pow(1000, 1 / slideBase),
            slide: function (event, ui) {
                replay.speed = Math.pow(ui.value, slideBase).toFixed(1);
                updateSliderTip(ui.handle, replay.speed, "x");
            },
            change: function (event, ui) {
                updateSliderTip(jQuery(this).find('.ui-slider-handle'), replay.speed, "x");
                replayStep();
            },
        });

        setupSliderDecorations('#replaySpeedSelect', '1x', '1000x');
        updateSliderTip(jQuery('#replaySpeedSelect').find('.ui-slider-handle'), replay.speed, "x");

        let speedLabel = 'Speed ';
        if (typeof window.translate !== 'undefined' && window.translate.t) {
            speedLabel = window.translate.t('speed_label') || speedLabel;
        } else if (typeof window.t === 'function') {
            speedLabel = window.t('speed_label') || speedLabel;
        }

        jQuery('#replaySpeedHint').text(speedLabel);

        jQuery("#selected_showTrace_hide").hide();

        // ***** CAMBIAR VISUALIZACIÓN DEL OVERLAY DE PANORAMA SEGÚN EL REPLAY *****
        const panorama = document.getElementById('panorama-overlay');
        const panoramaButton = document.getElementById('panorama-close');

        if (panorama && !panorama.classList.contains('hidden')) {
            panorama.classList.add('minimized');
        }

        if (panoramaButton) {
            panoramaButton.textContent = '▲';
        }

    }

    if (typeof updatePanoramaOverlayBounds === 'function') {
        updatePanoramaOverlayBounds();
    }

};


// ***** TEXTO Y ETIQUETAS DE LOS SLIDER DEL REPLAY *****
function updateSliderTip(handle, value, suffix) {
    const formatted = value.toString().padStart(2, '0') + suffix;
    jQuery(handle).find('.slider-tip').text(formatted);
}

// ***** TIP DE HORA *****
function formatHourSliderTip(hours, minutes) {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return h + 'h:' + m + 'm';
}

// ***** TIP DE MINUTO *****
// minutes = 0..59, seconds = 0..59
function formatMinuteSliderTip(minutes, seconds) {
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return m + 'm:' + s + 's';
}

// ***** ACTUALIZAR LOS TIPS DE HORA Y MINUTO CON H:M Y M:S *****
function updateReplaySliderTips(hours, minutes, seconds) {
    try {
        const $hourSlider = jQuery('#hourSelect');
        if ($hourSlider.length && $hourSlider.hasClass('ui-slider')) {
            const handle = $hourSlider.find('.ui-slider-handle');
            if (handle.length) {
                handle.find('.slider-tip').text(formatHourSliderTip(hours, minutes));
            }
        }
    } catch (e) { }

    try {
        const $minuteSlider = jQuery('#minuteSelect');
        if ($minuteSlider.length && $minuteSlider.hasClass('ui-slider')) {
            const handle = $minuteSlider.find('.ui-slider-handle');
            if (handle.length) {
                handle.find('.slider-tip').text(formatMinuteSliderTip(minutes, seconds));
            }
        }
    } catch (e) { }
}

function setupSliderDecorations(selector, minTxt, maxTxt) {
    const el = jQuery(selector);
    const handle = el.find('.ui-slider-handle');
    if (handle.find('.slider-tip').length === 0) {
        handle.append('<span class="slider-tip">00</span>');
    }

}

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
function testHide() {
    Object.defineProperty(window.document, 'hidden', { get: function () { return true; }, configurable: true });
    Object.defineProperty(window.document, 'visibilityState', { get: function () { return 'hidden'; }, configurable: true });
    window.document.dispatchEvent(new Event('visibilitychange'));
}
function testUnhide() {
    Object.defineProperty(window.document, 'hidden', { get: function () { return false; }, configurable: true });
    Object.defineProperty(window.document, 'visibilityState', { get: function () { return 'visible'; }, configurable: true });
    window.document.dispatchEvent(new Event('visibilitychange'));
}

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
function setAutoselect() {
    clearInterval(timers.autoselect);
    if (!autoselect)
        return;
    timers.autoselect = window.setInterval(autoSelectClosest, 5000);
    autoSelectClosest();
}
function registrationLink(plane) {
    if (plane.country === 'Brazil') {
        return `https://sistemas.anac.gov.br/aeronaves/cons_rab_resposta_en.asp?textMarca=${plane.registration}`;
    } else {
        return '';
    }
}


function zeroPad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

// Converts "hiccup"-style structures (https://github.com/weavejester/hiccup)
// to XML.
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
function download(name, contentType, data) {
    var link = document.createElement("a");
    link.download = name;
    link.href = 'data:' + contentType + ',' + encodeURIComponent(data);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function baseExportFilenameForAircrafts(aircrafts) {
    return aircrafts.map((a) => (a.registration || a.icao).toUpperCase()).join('-');
}

// Returns an array of {pos, alt, ts} for an aircraft.
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
let RGBColorToKMLColor = function (c) {
    return 'ff' + c.substring(4, 6) + c.substring(2, 4) + c.substring(0, 2);
}

// Returns an array of selected planes, ordered by registration-or-ICAO.
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

function getPlaneCardPhotoHtml(plane) {
    if (plane.psAPIresponse) {
        const photos = plane.psAPIresponse.photos || plane.psAPIresponse.images;
        if (photos && photos.length) {
            const photoToPull = (photos[0].thumbnail && (photos[0].thumbnail.src || photos[0].thumbnail)) || photos[0].thumbnail;
            const linkToPicture = photos[0].link || photos[0].url || '#';
            if (photoToPull) {
                return `<a class="link" href="${linkToPicture}" target="_blank" rel="noopener noreferrer"><img src="${photoToPull}" alt="${plane.registration || plane.icao}"></a>`;
            }
        }
        return '<div class="plane-card-photo-placeholder"></div>';
    }

    // not loaded yet -> start async fetch and return loading placeholder
    fetchPlanePhoto(plane, function (html) {
        // find the card and replace placeholder
        try {
            const card = document.querySelector(`.plane-card[data-hex="${plane.icao}"] .plane-card-photo`);
            if (card) card.innerHTML = html;
        } catch (e) {
            // ignore
        }
    });
    return '<div class="plane-card-photo-placeholder">Loading...</div>';
}

function fetchPlanePhoto(selected, cb) {
    if (!selected) return;
    if (selected.psAPIresponse) {
        // already present
        const photos = selected.psAPIresponse.photos || selected.psAPIresponse.images;
        if (photos && photos.length) {
            const photoToPull = (photos[0].thumbnail && (photos[0].thumbnail.src || photos[0].thumbnail)) || photos[0].thumbnail;
            const linkToPicture = photos[0].link || photos[0].url || '#';
            if (photoToPull) cb(`<a class="link" href="${linkToPicture}" target="_blank" rel="noopener noreferrer"><img src="${photoToPull}" alt="${selected.registration || selected.icao}"></a>`);
            else cb('<div class="plane-card-photo-placeholder"></div>');
            return;
        }
    }

    // avoid hammering API: short-circuit if recent request
    const ts = new Date().getTime();
    if (selected.psAPIresponseTS && (ts - selected.psAPIresponseTS) < 5000) return;
    selected.psAPIresponseTS = ts;

    // build urlTail similar to refreshPhoto
    let urlTail;
    if (selected.registration != null) {
        urlTail = '/hex/' + selected.icao.toUpperCase() + '?reg=' + selected.registration;
        const type = selected.icaoType;
        if (type) urlTail += '&icaoType=' + type;
    } else {
        urlTail = 'hex/' + selected.icao.toUpperCase();
    }

    if (planespottersAPI) {
        jQuery.ajax({
            url: planespottersAPIurl + urlTail,
            dataType: 'json',
            plane: selected
        }).done(function (data) {
            this.plane.psAPIresponse = data;
            // build html
            const photos = data.photos || data.images || [];
            if (photos.length) {
                const p = photos[0];
                const photoToPull = (p.thumbnail && (p.thumbnail.src || p.thumbnail)) || p.thumbnail || p.src || p.url;
                const linkToPicture = p.link || p.url || '#';
                if (photoToPull) cb(`<a class="link" href="${linkToPicture}" target="_blank" rel="noopener noreferrer"><img src="${photoToPull}" alt="${selected.registration || selected.icao}"></a>`);
                else cb('<div class="plane-card-photo-placeholder"></div>');
            } else {
                cb('<div class="plane-card-photo-placeholder"></div>');
            }
        }).fail(function () {
            this.plane.psAPIresponse = { 'photos': [] };
            cb('<div class="plane-card-photo-placeholder"></div>');
        });
    } else if (planespottingAPI) {
        jQuery.ajax({
            url: 'https://www.planespotting.be/api/objects/imagesRegistration.php?registration=' + selected.registration,
            dataType: 'json',
            plane: selected
        }).done(function (data) {
            this.plane.psAPIresponse = data;
            const photos = data.photos || data.images || [];
            if (photos.length) {
                const p = photos[0];
                const photoToPull = (p.thumbnail && (p.thumbnail.src || p.thumbnail)) || p.thumbnail || p.src || p.url;
                const linkToPicture = p.link || p.url || '#';
                if (photoToPull) cb(`<a class="link" href="${linkToPicture}" target="_blank" rel="noopener noreferrer"><img src="${photoToPull}" alt="${selected.registration || selected.icao}"></a>`);
                else cb('<div class="plane-card-photo-placeholder"></div>');
            } else {
                cb('<div class="plane-card-photo-placeholder"></div>');
            }
        }).fail(function () {
            this.plane.psAPIresponse = { 'photos': [] };
            cb('<div class="plane-card-photo-placeholder"></div>');
        });
    } else {
        // no API enabled
        cb('<div class="plane-card-photo-placeholder"></div>');
    }
}

function getPlaneCardText(key, fallback) {
    if (typeof window.getTranslatedText === 'function') {
        return window.getTranslatedText(key, fallback || key);
    }
    if (window.translate && typeof window.translate.t === 'function') {
        const translated = window.translate.t(key);
        return translated === key ? (fallback || key) : translated;
    }
    return fallback || key;
}

function createPlaneCard(plane) {
    const registration = plane.registration || plane.icao || 'n/a';
    const altitude = plane.altitude != null ? (plane.altitude === 'ground' ? 'GND' : plane.altitude) : 'n/a';
    const speed = plane.gs || plane.tas || 'n/a';
    const route = plane.routeString || plane.route || 'n/a';
    const typecode = plane.icaoType || 'n/a';
    // Use the same formatting as the main infoblock: prefer dataSource/getDataSource
    let ds = plane.dataSource;
    if (typeof ds === 'undefined' && plane.getDataSource) {
        try { ds = plane.getDataSource(); } catch (e) { ds = undefined; }
    }
    let source = 'n/a';
    if (typeof format_data_source === 'function') {
        source = format_data_source(ds);
    } else if (plane.source) {
        source = plane.source;
    }
    const callsign = plane.name ? plane.name.toUpperCase() : registration;
    const photoHtml = getPlaneCardPhotoHtml(plane);
    const expandText = getPlaneCardText('plane_card_expand', 'Expand');
    const removeText = getPlaneCardText('plane_card_remove', 'Remove');

    return `
        <div class="plane-card minimized" data-hex="${plane.icao}">
            <div class="plane-card-header">
                <div class="plane-card-title">${callsign}</div>
                <div class="plane-card-actions">
                    <button type="button" class="infoblockMinimizeBox plane-card-minimize" title="${expandText}" aria-label="${expandText}">−</button>
                    <button type="button" class="infoblockCloseBox plane-card-close" title="${removeText}" aria-label="${removeText}">×</button>
                </div>
            </div>
            <div class="plane-card-summary">
                <div class="plane-card-photo">${photoHtml}</div>
                <div class="plane-card-details">
                    <div class="summaryRow"><span class="infoHeading">${getPlaneCardText('reg_short', 'Reg.:')}</span><span class="infoData">${registration}</span></div>
                    <div class="summaryRow"><span class="infoHeading">${getPlaneCardText('alt_short', 'Alt.:')}</span><span class="infoData">${altitude}</span></div>
                    <div class="summaryRow"><span class="infoHeading">${getPlaneCardText('spd_short', 'Spd.:')}</span><span class="infoData">${speed}</span></div>
                    <div class="summaryRow"><span class="infoHeading">${getPlaneCardText('route_short', 'Route:')}</span><span class="infoData">${route}</span></div>
                    <div class="summaryRow"><span class="infoHeading">${getPlaneCardText('type_short', 'Type:')}</span><span class="infoData">${typecode}</span></div>
                    <div class="summaryRow"><span class="infoHeading">${getPlaneCardText('source_short', 'Source:')}</span><span class="infoData">${source}</span></div>
                </div>
            </div>
        </div>`;
}

function updateMultiInfoblocksLayout() {
    const container = document.getElementById('infoblocks_container');
    if (!container) return;

    const replayBar = document.getElementById('replayBar');
    const replayHeight = replayBar && getComputedStyle(replayBar).display !== 'none'
        ? replayBar.getBoundingClientRect().height
        : 0;
    const edge = Math.max(10, 10 * (typeof globalScale === 'number' ? globalScale : 1));
    const bottomSpace = replayHeight + edge;

    container.style.setProperty('--infoblocks-bottom-space', `${bottomSpace}px`);
    container.style.maxHeight = `calc(100vh - ${bottomSpace + edge}px)`;
    container.style.maxWidth = `calc(100vw - ${edge * 2}px)`;
}

window.addEventListener('resize', updateMultiInfoblocksLayout);

function renderMultiInfoblocks() {
    const planes = selectedPlanes();
    const container = jQuery('#infoblocks_container');
    container.empty();
    if (!planes.length || !toggles['enableInfoblock'].state) {
        container.hide();
        return;
    }

    planes.forEach((plane) => container.append(createPlaneCard(plane)));
    container.show();
    updateMultiInfoblocksLayout();
}

// Exports currently selected aircraft as KML.

let egmScript = null;
let egmLoaded = false;
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

function deleteTraces() {
    for (let i in g.planesOrdered) {
        let plane = g.planesOrdered[i];
        delete plane.recentTrace;
        delete plane.fullTrace;
    }
}

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
let infoBits = {
    type: {
        head: 'Type:',
        title: '4 character ICAO type code (i.e.: A320,B738,G550)',
        value: function (plane) { return plane.icaoType || 'n/a'; },
    },
};

function geoFindEnabled() {
    return (!disableGeoLocation && !SiteOverride && (globeIndex || uuid || askLocation) && (window && window.location && window.location.protocol == 'https:'));
}

function _printTrace(trace) {
    for (let i = 0; i < trace.length; i++) {
        const state = trace[i];
        const timestamp = state[0];
        let stale = state[6] & 1;
        const leg_marker = state[6] & 2;
        console.log(zuluTime(new Date(timestamp * 1000)) + ' ' + (state[1] + ',' + state[2]).padStart(26, ' ') + ' ' + String(state[3]).padStart(6, ' ') + ' ' + state[6]);
    }
}

function printTrace() {
    console.log('full trace');
    _printTrace(SelectedPlane.fullTrace.trace);
    console.log('recent trace');
    _printTrace(SelectedPlane.recentTrace.trace);
}

function copyShareLink() {
    navigator.clipboard.writeText(shareLink);

    copyLinkTime = new Date().getTime();
    copiedIcao = SelectedPlane.icao;
    setSelectedIcao();
}

let copyLinkTime = 0;
let copiedIcao = null;

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
        // let copy_link_text = (copiedIcao != null) ? "Copied" : ("Copy" + NBSP + "Link");
        // let icao_link = "<span  class=identSmall><a class='link identSmall' target=\"_blank\" href=\"" + shareLink +
        //     "\" onclick=\"copyShareLink(); return false;\">" + copy_link_text + "</a></span>";
        // hex_html = hex_html + NBSP + NBSP + NBSP + icao_link;
        // Obtener el texto traducido
        let copyLinkText = getTranslatedText('copy_link', 'Copy Link');
        let copiedText = getTranslatedText('copied', 'Copied');

        // Determinar qué texto mostrar
        let copy_link_text = (copiedIcao != null) ? copiedText : copyLinkText;

        let icao_link = "<span class=identSmall><a class='link identSmall' target=\"_blank\" href=\"" + shareLink +
            "\" onclick=\"copyShareLink(); return false;\">" + copy_link_text + "</a></span>";
        hex_html = hex_html + NBSP + NBSP + NBSP + icao_link;
    }
    jQuery('#selected_icao').html(hex_html);

    jQuery('a.identSmall').prop('href', shareLink);
}

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

function getViewOversize(factor) {
    factor || (factor = 1);
    let mapSize = OLMap.getSize();
    let size = [mapSize[0] * factor, mapSize[1] * factor];
    return myExtent(OLMap.getView().calculateExtent(size));
}

function getRenderExtent(extra) {
    extra || (extra = 0);
    const mapSize = OLMap.getSize();
    const over = renderBuffer + extra;
    const size = [mapSize[0] + over, mapSize[1] + over];
    return myExtent(OLMap.getView().calculateExtent(size));
}

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

function getn(n) {
    limitUpdates = n; RefreshInterval = 0; fetchCalls = 0;
}

function onAltimeterSetStandard(e) {
    e.preventDefault();
    jQuery("#altimeter_input").val(1013.25);
    onAltimeterChange(e);
}
function onAltimeterSetSelected(e) {
    e.preventDefault();
    if (!SelectedPlane || !SelectedPlane.nav_qnh) {
        return;
    }
    jQuery("#altimeter_input").val(SelectedPlane.nav_qnh);
    onAltimeterChange(e);
}
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
function adjust_baro_alt(alt) {
    if (!baroUseQNH || alt == null || alt == "ground") {
        return alt;
    }
    let station_pressure = Math.pow(1 - alt / 145366.45, 5.2553026) * 1013.25;

    let res = (1 - Math.pow(station_pressure / baroCorrectQNH, 0.190284)) * 145366.45;
    return res;
}

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

function updateTime() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    document.getElementById('utc_clock').innerHTML = `${h}:${m} <span>UTC</span>`;
}
setInterval(updateTime, 1000);
updateTime();

// ***** PLEGAR/DESPLEGAR SECCIONES EN SELECTED_INFOBLOCK *****
document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.section-toggle');

    toggles.forEach(btn => {
        const targetId = btn.dataset.target;
        const block = document.getElementById(targetId) || btn.closest('.sectionTitle')?.nextElementSibling;
        if (!block) return;

        const icon = btn.querySelector('.section-toggle-icon') || btn;

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

        // ***** ENTRAR EN MODO HISTORIAL AL DESPLEGAR ACORDEÓN Y SALIR AL CERRAR *****
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            const willExpand = !expanded;
            setState(willExpand);

            if (targetId === 'history_block') {
                if (willExpand && !showTrace) {
                    const planeTimestamp = SelectedPlane && (Number.isFinite(SelectedPlane.position_time)
                        ? SelectedPlane.position_time
                        : SelectedPlane.last_message_time);
                    if (Number.isFinite(planeTimestamp))
                        setTraceDate({ ts: planeTimestamp * 1000 });
                    toggleShowTrace();
                } else if (!willExpand && showTrace) {
                    traceOpts.animate = false;
                    if (traceOpts.showTimeout) {
                        clearTimeout(traceOpts.showTimeout);
                        traceOpts.showTimeout = null;
                    }
                    toggleShowTrace();
                }
            }
        });
    });
});

// ***** IMAGEN GENÉRICA EN SELECTED_INFOBLOCK SI EL AVIÓN NO TIENE *****
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

// ***** ACTUALIZAR CONTADOR Y LISTA DE AVIONES DE INTERÉS *****
function updateStarredUI() {
    const isEnabled = toggles['enableStarredAircraft'] && toggles['enableStarredAircraft'].state;
    const countSpan = document.getElementById('starred-count');
    const container = document.getElementById('starred-list-container');

    if (countSpan) {
        countSpan.textContent = starredAircraft.size;
    }

    if (!container) return;

    if (!isEnabled) {
        container.innerHTML = '';
        return;
    }

    if (starredAircraft.size === 0) {
        container.innerHTML = '<div class="starred-empty">No marked planes</div>';
        return;
    }

    let html = '';
    for (const hex of starredAircraft) {
        const plane = g.planes[hex];
        if (!plane) {
            starredAircraft.delete(hex);
            continue;
        }

        const callsign = plane.name || plane.flight || hex.toUpperCase();
        const reg = plane.registration || 'N/A';
        const type = plane.icaoType || 'N/A';

        html += `
            <div class="starred-item" onclick="selectPlaneByHex('${hex}', { follow: true })">
                <div class="starred-item-info">
                    <div class="starred-item-callsign">${escapeHtml(callsign)}</div>
                    <div class="starred-item-detail">${reg} | ${type}</div>
                </div>
                <button class="starred-item-remove" onclick="event.stopPropagation(); toggleStarredPlane('${hex}')" title="Remove from notable">✖</button>
            </div>
        `;
    }

    container.innerHTML = html;
    container.style.display = 'block';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ***** ACTUALIZAR VISUALIZACIÓN DE AVIONES DE INTERÉS *****
function toggleStarredPlane(hex) {
    const isEnabled = toggles['enableStarredAircraft'] && toggles['enableStarredAircraft'].state;

    if (!hex) return;

    if (starredAircraft.has(hex)) {
        starredAircraft.delete(hex);
    } else {
        starredAircraft.add(hex);
    }

    updateStarredUI();
    updateStarredPlaneVisual(hex);
    updateStarredButtonInInfoblock();
    refreshFilter();
}

// ***** ACTUALIZAR AVIONES DE INTERÉS COLOCADOS EN LA TABLA *****
function updateStarredPlaneVisual(hex) {
    const plane = g.planes[hex];
    if (!plane) return;

    const isStarred = starredAircraft.has(hex);

    if (plane.marker || plane.glMarker) {
        plane.updateMarker();
    }

    if (plane.tr) {
        if (isStarred) {
            plane.tr.classList.add('starred-table-row');
        } else {
            plane.tr.classList.remove('starred-table-row');
        }
    }
}

// ***** ACTUALIZAR BOTÓN DE AVIÓN DE INTERÉS EN SELECTED_INFOBLOCK *****
function updateStarredButtonInInfoblock() {
    const isEnabled = toggles['enableStarredAircraft'] && toggles['enableStarredAircraft'].state;
    const selected = SelectedPlane;

    let starBtn = document.getElementById('infoblock_star');

    if (!starBtn) return;

    if (!isEnabled || !selected) {
        starBtn.style.display = 'none';
        return;
    }

    starBtn.style.display = 'unset';
    const isStarred = starredAircraft.has(selected.icao);
    starBtn.textContent = isStarred ? '★' : '✰';
    let removeText = 'Remove from notable';
    let markText = 'Mark as notable';

    if (typeof window.translate !== 'undefined' && window.translate.t) {
        removeText = window.translate.t('remove_from_notable') || removeText;
        markText = window.translate.t('mark_as_notable') || markText;
    } else if (typeof window.t === 'function') {
        removeText = window.t('remove_from_notable') || removeText;
        markText = window.t('mark_as_notable') || markText;
    }

    starBtn.title = isStarred ? removeText : markText;

    if (isStarred) {
        starBtn.classList.add('starred');
    } else {
        starBtn.classList.remove('starred');
    }

    starBtn.onclick = function (e) {
        e.stopPropagation();
        toggleStarredPlane(selected.icao);
    };
}

// ***** VERIFICAR AVIONES MARCADOS COMO INTERÉS *****
function isPlaneStarred(plane) {
    return plane && starredAircraft.has(plane.icao);
}

// ***** ELIMINAR TODOS LOS AVIONES DE LA LISTA DE INTERÉS *****
function clearAllStarred() {

    if (starredAircraft.size === 0) return;
    const hexes = [...starredAircraft];
    starredAircraft.clear();

    for (const hex of hexes) {
        updateStarredPlaneVisual(hex);
    }

    updateStarredUI();
    updateStarredButtonInInfoblock();
    refreshFilter();
}

const originalSelect = select;
select = function (plane, options) {
    originalSelect(plane, options);
    if (plane && SelectedPlane === plane) {
        updateStarredButtonInInfoblock();
    }
};

const originalDeselect = deselect;
deselect = function (plane) {
    originalDeselect(plane);
    if (SelectedPlane === null) {
        const starBtnContainer = document.querySelector('.star-btn-container');
        if (starBtnContainer) starBtnContainer.innerHTML = '';
    }
};

// ***** AGREGAR FUNCIONALIDAD AL BOTÓN DE ESTRELLA PARA MARCAR COMO DE INTERÉS *****
function enhancePlaneObjectForStarred() {
    if (typeof PlaneObject !== 'undefined' && PlaneObject.prototype) {
        const originalUpdateMarker = PlaneObject.prototype.updateMarker;
        if (originalUpdateMarker) {
            PlaneObject.prototype.updateMarker = function () {
                originalUpdateMarker.apply(this, arguments);
                if (starredAircraft.has(this.icao)) {
                    if (this.markerElement) {
                        this.markerElement.classList.add('plane-starred-marker');
                    }
                }
            };
        }
    }
}

// ***** INICIALIZAR TABLA DE AVIONES DE INTERÉS *****
function initStarredAircraft() {
    const starredSection = document.getElementById('starred-aircraft-section');
    if (starredSection) {
        starredSection.classList.add('hidden-by-setting');
    }

    const starredHeader = document.querySelector('.starred-header');
    if (starredHeader) {
        starredHeader.removeAttribute('onclick');
        const toggleIcon = starredHeader.querySelector('.toggle-icon');
        if (toggleIcon) toggleIcon.remove();
    }

    const starredContainer = document.getElementById('starred-list-container');
    if (starredContainer) {
        starredContainer.style.display = 'block';
    }

    const saved = localStorage.getItem('tar1090_starred_aircraft');
    if (saved) {
        try {
            const savedHexes = JSON.parse(saved);
            if (Array.isArray(savedHexes)) {
                starredAircraft = new Set(savedHexes);
                updateStarredUI();
            }
        } catch (e) { console.error('Error loading starred aircraft:', e); }
    }

    enhancePlaneObjectForStarred();

    const originalUpdateStarredUI = updateStarredUI;
    window.updateStarredUI = function () {
        originalUpdateStarredUI();
        if (toggles['enableStarredAircraft'] && toggles['enableStarredAircraft'].state) {
            localStorage.setItem('tar1090_starred_aircraft', JSON.stringify([...starredAircraft]));
        }
    };
    updateStarredUI = window.updateStarredUI;

    const toggle = toggles['enableStarredAircraft'];
    if (toggle && toggle.state === true) {
        if (starredSection) {
            starredSection.classList.remove('hidden-by-setting');
        }
        if (SelectedPlane) {
            updateStarredButtonInInfoblock();
        }
    } else {
        if (starredSection) {
            starredSection.classList.add('hidden-by-setting');
        }
    }

    const clearAllBtn = document.getElementById('clear-all-starred-btn');
    if (clearAllBtn) {
        clearAllBtn.removeEventListener('click', clearAllStarredHandler);
        clearAllBtn.addEventListener('click', clearAllStarredHandler);
    }
}

// ***** MANEJADOR DE LIMPIEXA DE TODOS LOS AVIONES DE INTERÉS *****
function clearAllStarredHandler(e) {
    e.stopPropagation();
    if (starredAircraft.size > 0) {
        clearAllStarred();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStarredAircraft);
} else {
    initStarredAircraft();
}

window.toggleStarredPlane = toggleStarredPlane;
window.clearAllStarred = clearAllStarred;

if (typeof toggleStarredList === 'undefined') {
    window.toggleStarredList = function () {
        console.log('toggleStarredList called but not implemented');
    };
} else {
    window.toggleStarredList = toggleStarredList;
}

// ***** MOVER SETTINGS_INFOBLOCK COMO VENTANA POR LA PANTALLA *****
(function () {
    let settingsWindow = null;
    let isDragging = false;
    let dragStartX, dragStartY;
    let startLeft, startTop;

    function initDraggable() {
        settingsWindow = document.getElementById('settings_infoblock');
        const dragHandle = document.getElementById('settings_window_header');
        settingsWindow.setAttribute('style',
            'position: fixed !important; ' +
            'top: 80px !important; ' +
            'left: 20px !important; ' +
            'right: auto !important; ' +
            'bottom: auto !important; ' +
            'margin: 0 !important;'
        );

        dragHandle.style.cursor = 'move';

        dragHandle.addEventListener('mousedown', onMouseDown);

        return true;
    }

    function onMouseDown(e) {
        if (e.target.closest('.formButton')) {
            return;
        }
        if (e.target.closest('#settings_close')) {
            return;
        }

        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        const rect = settingsWindow.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'move';
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!isDragging) {
            return;
        }

        let newLeft = startLeft + (e.clientX - dragStartX);
        let newTop = startTop + (e.clientY - dragStartY);
        const maxLeft = window.innerWidth - settingsWindow.offsetWidth;
        const maxTop = window.innerHeight - settingsWindow.offsetHeight;
        newLeft = Math.min(Math.max(0, newLeft), maxLeft);
        newTop = Math.min(Math.max(0, newTop), maxTop);
        settingsWindow.style.setProperty('left', newLeft + 'px', 'important');
        settingsWindow.style.setProperty('top', newTop + 'px', 'important');

    }

    function onMouseUp(e) {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDraggable);
    } else {
        setTimeout(initDraggable, 100);
    }
})();

// ***** UBICACION DE AERONAVE MEDIANTE FIR *****
const firFiles = {
    "Fir Amazonica": "geojson/fir_sbaz.geojson",
    "Fir Maiquetia": "geojson/fir_svzm.geojson",
    "Fir Georgetown": "geojson/fir_sygc.geojson",
    "Fir Piarco": "geojson/fir_ttzp.geojson",
    "Fir San Juan": "geojson/fir_tjzs.geojson",
    "Fir Barranquilla": "geojson/fir_skec.geojson",
    "Fir Bogota": "geojson/fir_sked.geojson",
    "Fir Curacao": "geojson/fir_tncf.geojson",
}

function loadAllFIRs() {
    const promises = [];

    for (const [firName, filePath] of Object.entries(firFiles)) {
        const promise = fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error cargando ${filePath}`);
                }
                return response.json();
            })
            .then(geojson => {
                firData[firName] = geojson;
                console.log(`Cargado correctamente: ${firName}`);
            })
            .catch(error => console.error(error));

        promises.push(promise);
    }

    // Opcional: Notificar cuando todos los FIRs estén cargados en memoria
    Promise.all(promises).then(() => {
        console.log("Todos los FIRs han sido cargados con éxito.");
    });
}

// Ejecutar la carga al iniciar
loadAllFIRs();

function getFIRFromCoordinates(lat, lon) {
    if (lat == null || lon == null) return "Sin posición";

    // Turf requiere las coordenadas en formato [Longitud, Latitud]
    const pt = turf.point([lon, lat]);

    // Recorremos cada FIR cargado en memoria
    for (const [firName, geojson] of Object.entries(firData)) {
        if (!geojson || !geojson.features) continue;

        for (const feature of geojson.features) {
            // Evaluamos si el punto cae dentro del polígono
            if (turf.booleanPointInPolygon(pt, feature)) {
                // Retorna el nombre que le dimos en el objeto firFiles
                return firName;
            }
        }
    }

    return "Fuera de FIR conocido";
}

// ***** EXPONER FUNCIONES GLOBALES PARA SU USO DESDE MÓDULOS EXTERNOS *****
window.forceRecreateLayerSwitcher = forceRecreateLayerSwitcher;
window.getLayerTitle = getLayerTitle;
window.updateLayerTitles = updateLayerTitles;
window.refreshLayerSwitcher = refreshLayerSwitcher;
window.formatHourSliderTip = formatHourSliderTip;
window.formatMinuteSliderTip = formatMinuteSliderTip;
window.updateReplaySliderTips = updateReplaySliderTips;
window.syncReplaySlidersToReplay = syncReplaySlidersToReplay;