// ***** MOSTRAR SUGERENCIAS DE TÉRMINOS EN EL BUSCADOR *****
(function () {
    'use strict';

    const AERO_TERMS_URL = './static/aero-help/aero-terms.json';
    const MAX_RESULTS = 25;
    const MIN_CHARS = 2;
    const DEBOUNCE_MS = 120;

    const ZOOM_BY_SUBTYPE = {
        large_airport: 8,
        medium_airport: 9,
        small_airport: 10,
        heliport: 12,
        seaplane_base: 12,
        balloonport: 11,
        closed: 11,
    };
    const ZOOM_DEFAULT = 9;

    let aeroTerms = [];
    let termById = {};
    let termIndex = {};
    let termsLoaded = false;
    let select2Ready = false;

    let lastQuery = '';
    let lastResults = [];
    let debounceTimer = null;

    // ***** NORMALIZAR BÚSQUEDA *****
    function normalize(str) {
        if (!str) return '';
        return str
            .toString()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    // ***** TRADUCCIONES *****
    function tr(key, fallback) {
        if (window.translate && typeof window.translate.t === 'function') {
            const v = window.translate.t(key);
            if (v && v !== key) return v;
        }
        if (typeof window.getTranslatedText === 'function') {
            const v = window.getTranslatedText(key, fallback);
            if (v) return v;
        }
        return fallback || key;
    }

    // ***** ESCAPAR HTML *****
    function escapeHtml(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

   // ***** CARGAR TÉRMINOS *****
    function loadAeroTerms() {
        if (loadAeroTerms._promise) return loadAeroTerms._promise;

        const t0 = performance.now();

        loadAeroTerms._promise = fetch(AERO_TERMS_URL, { cache: 'force-cache' })
            .then(r => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(data => {
                aeroTerms = (data && data.terms) || (Array.isArray(data) ? data : []);

                termById = Object.create(null);
                termIndex = Object.create(null);

                for (let i = 0; i < aeroTerms.length; i++) {
                    const t = aeroTerms[i];
                    if (!t || !t.id) continue;
                    termById[t.id] = t;

                    let tokens = t.keywords;
                    if (!tokens && t.searchString) {
                        tokens = t.searchString.split(/\s+/);
                    }
                    if (!tokens) continue;

                    for (let k = 0; k < tokens.length; k++) {
                        const tok = tokens[k];
                        if (!tok) continue;
                        if (!termIndex[tok]) termIndex[tok] = [];
                        termIndex[tok].push(t.id);
                    }
                }

                termsLoaded = true;
                console.log(
                    `[aero-help] ${aeroTerms.length} términos, ` +
                    `${Object.keys(termIndex).length} tokens indexados ` +
                    `(${(performance.now() - t0).toFixed(0)} ms).`
                );
                return aeroTerms;
            })
            .catch(err => {
                console.error('[aero-help] Error cargando aero-terms.json:', err);
                termsLoaded = true;
                aeroTerms = [];
                return aeroTerms;
            });

        return loadAeroTerms._promise;
    }

    // ***** REALIZAR BÚSQUEDA *****
    function searchTerms(query) {
        const q = normalize(query);
        if (!q || q.length < MIN_CHARS || !termsLoaded) return [];

        if (q === lastQuery && lastResults.length) return lastResults;

        const tokens = q.split(/\s+/).filter(Boolean);
        if (!tokens.length) return [];

        tokens.sort((a, b) => {
            const la = termIndex[a] ? termIndex[a].length : Infinity;
            const lb = termIndex[b] ? termIndex[b].length : Infinity;
            return la - lb;
        });

        let candidates = null;
        for (let k = 0; k < tokens.length; k++) {
            const tok = tokens[k];
            const ids = termIndex[tok];
            if (!ids || !ids.length) {
                lastQuery = q;
                lastResults = [];
                return [];
            }
            if (candidates === null) {
                candidates = new Set(ids);
            } else {
                const next = new Set();
                for (const id of ids) {
                    if (candidates.has(id)) next.add(id);
                    if (next.size >= MAX_RESULTS * 4) break;
                }
                candidates = next;
            }
            if (candidates.size === 0) break;
        }

        if (!candidates || candidates.size === 0) {
            lastQuery = q;
            lastResults = [];
            return [];
        }

        const list = [];
        for (const id of candidates) {
            const t = termById[id];
            if (t) list.push(t);
            if (list.length >= MAX_RESULTS * 6) break;
        }

        list.sort((a, b) => score(a, q) - score(b, q));

        lastQuery = q;
        lastResults = list.slice(0, MAX_RESULTS);
        return lastResults;
    }

    // ***** APLICAR UN SCORE A CADA RESULTADO PARA MOSTRAR POR MAYOR PRIORIDAD *****
    function score(t, q) {
        let s = (t.rank != null ? t.rank : 3) * 10;
        const code = normalize(t.code);
        const iata = t.iata ? normalize(t.iata) : '';
        const ss = t.searchString || '';

        if (code === q || iata === q) s -= 100;
        else if (code.startsWith(q)) s -= 40;
        else if (iata.startsWith(q)) s -= 35;
        else if (ss.startsWith(q)) s -= 15;

        if (t.type === 'airport' && /^[a-z]{4}$/.test(q)) s -= 20;
        if (t.type === 'aircraft' && /^[a-z0-9]{2,4}$/.test(q)) s -= 10;

        return s;
    }

    // ***** ÍCONO PARA CADA TIPO DE BÚSQUEDA *****
    function iconForType(type) {
        if (type === 'airport') return '✈️';
        if (type === 'airline') return '🛫';
        if (type === 'aircraft') return '🛩️';
        return '📌';
    }

    // ***** FORMATEAR RESULTADO DE LA BÚSQUEDA *****
    function formatResult(item) {
        if (!item || !item.data) return item.text;
        const d = item.data;

        let typeLabel = '';
        if (d.type === 'airport') {
            const subKey = 'type_' + (d.subtype || 'airport');
            const subText = (d.subtype || 'airport').replace(/_/g, ' ');
            typeLabel = tr(subKey, subText);
        } else if (d.type === 'airline') {
            typeLabel = tr('type_airline', 'airline');
        } else if (d.type === 'aircraft') {
            typeLabel = tr('type_aircraft', 'aircraft');
        }

        return '<div class="aero-help-item">' +
            '<span class="aero-help-icon">' + iconForType(d.type) + '</span>' +
            '<span class="aero-help-code">' + escapeHtml(d.code || '') + '</span>' +
            '<span class="aero-help-name">' + escapeHtml(d.name || d.model || '') + '</span>' +
            '<span class="aero-help-meta">' + escapeHtml(typeLabel) + '</span>' +
            '</div>';
    }

    // ***** FORMATEAR OPCIÓN SELECCIONADA *****
    function formatSelection(item) {
        if (!item || !item.data) return item.text;
        const d = item.data;
        return d.code + (d.iata && d.iata !== d.code ? '/' + d.iata : '');
    }

    // ***** OBTENER PLACEHOLDER *****
    function getExpectedPlaceholder() {
        return tr(
            'search_placeholder_combined',
            'Search planes, airports, airlines or types…'
        );
    }

    // ***** APLICAR PLACEHOLDER *****
    function applyPlaceholder() {
        const $input = jQuery('#search_input');
        if (!$input.length) return;

        const text = getExpectedPlaceholder();

        $input.attr('placeholder', text);

        const $ph = jQuery('#search_form .select2-selection__placeholder');
        if ($ph.length) {
            $ph.text(text);
        }
    }

    // ***** OBTENER TOOLTIP *****
    function getExpectedTitle() {
        return tr(
            'search_placeholder_combined',
            'Search planes, airports, airlines or types…'
        );
    }

    // ***** APLICAR TOOLTIP *****
    function applySearchTooltip() {
        const text = getExpectedTitle();
        const $targets = jQuery(
            '#tab-search-navbar, #search_form, #search_input, ' +
            '#search_form .select2-selection--single'
        );

        $targets.each(function () {
            this.title = text;
            this.setAttribute('data-tooltip', text);
        });

        const selection = document.querySelector('#search_form .select2-selection--single');
        if (selection) {
            const rect = selection.getBoundingClientRect();
            if (window.innerHeight - rect.bottom < 120) {
                selection.classList.add('tooltip-above');
            } else {
                selection.classList.remove('tooltip-above');
            }
        }
    }

    // ***** ACTUALIZAR AL CAMBIAR IDIOMA *****
    function refreshI18nTexts() {
        applyPlaceholder();
        applySearchTooltip();

        const text = getExpectedTitle();
        
        jQuery(
            '#search_form .select2-selection--single, ' +
            '#search_form .select2-selection__rendered, ' +
            '#search_form .select2-selection__placeholder, ' +
            '.select2-container--open .select2-search__field'
        ).each(function () {
            if (this.getAttribute('title') !== text) {
                this.removeAttribute('title');
                this.setAttribute('title', text);
                this.setAttribute('data-tooltip', text);
            }
        });
    }

    // ***** MANEJAR SELECCIÓN DE LA OPCIÓN *****
    function handleSelection(d) {
        if (!d) return;

        if (d.type === 'airport' && d.lat != null && d.lon != null) {
            const subtype = (d.subtype || '').toLowerCase();
            const targetZoom = ZOOM_BY_SUBTYPE[subtype] || ZOOM_DEFAULT;

            // ***** MARCAR PUNTO EN EL MAPA *****
            if (typeof window.showAirportMarker === 'function') {
                window.showAirportMarker([d.lat, d.lon]);
            }

            // ***** HACER ZOOM AL PUNTO *****
            if (window.OLMap && window.ol) {
                window.OLMap.getView().animate({
                    center: window.ol.proj.fromLonLat([d.lon, d.lat]),
                    zoom: targetZoom,
                    duration: 400,
                    easing: window.ol.easing && window.ol.easing.easeOut
                        ? window.ol.easing.easeOut
                        : undefined,
                });
            }

            if (typeof window.refreshFilter === 'function') {
                window.refreshFilter();
            }
        } else if (d.type === 'aircraft' && typeof window.findPlanes === 'function') {
            try { window.findPlanes(d.code, false, false, false, true, true); } catch (e) { }
        } else if (d.type === 'airline' && typeof window.findPlanes === 'function') {
            const q = d.icao || d.iata || d.code;
            if (typeof window.showDistanceGuide === 'function') {
                window.showDistanceGuide(() => tr(
                    'search_airline_guide',
                    'Airline search filters the aircraft currently available on the map. If none appear, try the airline ICAO/IATA code or operator name.'
                ), 6000);
            }
            try { window.findPlanes(q, false, true, false, false, true); } catch (e) { }
        }

        setTimeout(() => {
            jQuery('#search_input').val(null).trigger('change');
        }, 30);
    }

    // ***** ACEPTAR ENTER COMO CONFIRMACIÓN *****
    function handleEnterAsSearch(e) {
        if (e.key !== 'Enter') return;
        const $input = jQuery('#search_input');
        const val = ($input.val() || '').trim();
        if (!val) return;

        const s2 = $input.data('select2');
        if (s2 && s2.isOpen && s2.isOpen()) return;

        e.preventDefault();
        jQuery('#search_form').trigger('submit');
    }

    // ***** INICIALIZAR SELECT2 *****
    function initSelect2() {
        if (select2Ready) return;
        if (!jQuery || !jQuery.fn.select2) return;

        const $input = jQuery('#search_input');
        if (!$input.length) return;

        if ($input.data('select2')) {
            $input.select2('destroy');
        }

        const placeholder = getExpectedPlaceholder();

        $input.select2({
            placeholder: placeholder,
            allowClear: true,
            minimumInputLength: MIN_CHARS,
            width: '100%',
            dropdownAutoWidth: false,
            closeOnSelect: true,
            selectOnClose: false,
            dropdownParent: jQuery('#tab-search-navbar'),

            ajax: {
                transport: function (params, success, failure) {
                    const term = (params.data && params.data.term) || '';
                    if (debounceTimer) clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        try {
                            const results = searchTerms(term);
                            success({
                                results: results.map(d => ({
                                    id: d.id,
                                    text: d.shortLabel || d.label,
                                    data: d,
                                })),
                            });
                        } catch (err) {
                            failure(err);
                        }
                    }, DEBOUNCE_MS);
                },
                delay: 0,
            },

            templateResult: formatResult,
            templateSelection: formatSelection,
            escapeMarkup: m => m,

            language: {
                inputTooShort: () => tr('search_min_chars', 'Escribe al menos 2 caracteres…'),
                noResults: () => {
                    if (typeof window.showDistanceGuide === 'function') {
                        window.showDistanceGuide(() => tr(
                            'search_not_found_guide',
                            'No matching data is currently available on screen.'
                        ), 5000);
                    }
                    return tr('search_no_results', 'No results');
                },
                searching: () => tr('search_searching', 'Buscando…'),
                errorLoading: () => tr('search_error', 'Error al buscar'),
            },
        });

        $input.on('select2:select', function (e) {
            const d = e.params && e.params.data && e.params.data.data;
            if (d) handleSelection(d);
        });

        $input.on('focus click select2:open select2:close select2:select select2:unselect',
            refreshI18nTexts);

        // ***** FORZAR REPOSICIONAMIENTO DEL DROPDOWN AL ABRIR *****
        $input.on('select2:open', function () {
            setTimeout(() => {
                const $dropdown = jQuery('.select2-container--open .select2-dropdown');
                if (!$dropdown.length) return;

                const rect = $dropdown[0].getBoundingClientRect();
                const vw = window.innerWidth;
                const margin = 8;

                if (rect.right > vw - margin) {
                    const shift = rect.right - (vw - margin);
                    $dropdown.css('margin-left', `-${shift}px`);
                }

                else if (rect.left < margin) {
                    const shift = margin - rect.left;
                    $dropdown.css('margin-left', `${shift}px`);
                }
            }, 0);
        });

        $input.on('keydown', handleEnterAsSearch);

        refreshI18nTexts();

        select2Ready = true;
    }

    // ***** CARGAR TÉRMINOS CUANDO ESTÉN LISTOS PARA MOSTRARSE *****
    function ready() {
        loadAeroTerms().then(() => {
            let tries = 0;
            const tryInit = () => {
                if (jQuery.fn.select2) {
                    initSelect2();
                } else if (tries++ < 40) {
                    setTimeout(tryInit, 250);
                }
            };
            tryInit();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ready);
    } else {
        ready();
    }

    // ***** DETECTAR CAMBIO DE IDIOMA PARA ACTUALIZAR TEXTOS *****
    document.addEventListener('languageChanged', function () {
        [0, 50, 200, 500].forEach(delay => {
            setTimeout(refreshI18nTexts, delay);
        });
    });

    window.addEventListener('resize', function () {
        if (document.querySelector('#search_form .select2-selection--single[data-tooltip]')) {
            applySearchTooltip();
        }
    });

    // ***** OBSERVAR REGENERACIÓN DE LOS NODOS DE SELECT2 *****
    (function observeSelect2Nodes() {
        const form = document.getElementById('search_form');
        if (!form) return;

        const obs = new MutationObserver(() => {
            const $sel = jQuery('#search_form .select2-selection--single');
            const $ph = jQuery('#search_form .select2-selection__placeholder');

            if ($sel.length && $sel.attr('data-tooltip') !== getExpectedTitle()) {
                applySearchTooltip();
            }
            if ($ph.length && $ph.text() !== getExpectedPlaceholder()) {
                applyPlaceholder();
            }
        });
        obs.observe(form, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    })();

    // ***** ACCESO A LA API *****
    window.aeroHelp = {
        search: searchTerms,
        load: loadAeroTerms,
        applyTooltip: applySearchTooltip,
        applyPlaceholder: applyPlaceholder,
        refreshI18n: refreshI18nTexts,
        get terms() { return aeroTerms; },
        get index() { return termIndex; },
    };
})();