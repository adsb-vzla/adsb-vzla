
(function () {
    'use strict';

    // ***** ESTABLECER CADA UNO DE LOS SLIDES DEL REPLAY *****
    const SLIDER_CONFIG = {
        '#hourSelect': {
            min: 0,
            max: 23,
            suffix: 'h',
            padLength: 2
        },
        '#minuteSelect': {
            min: 0,
            max: 59,
            suffix: 'm',
            padLength: 2
        },
        '#replaySpeedSelect': {
            min: 1,
            max: 1000,
            suffix: 'x',
            padLength: 0,

            slideBase: 3.0,
            isExponential: true
        }
    };

    // ***** OBTENER VALOR Y APLICAR AL INPUT *****
    function sliderValueFromInput(sliderEl, rawValue) {
        const cfg = SLIDER_CONFIG[sliderEl];
        if (!cfg) return rawValue;

        if (cfg.isExponential) {

            return Math.pow(rawValue, 1 / cfg.slideBase);
        }
        return rawValue;
    }

    // ***** FORMATEAR VALOR DEL INPUT *****
    function formatInputValue(sliderEl, value) {
        const cfg = SLIDER_CONFIG[sliderEl];
        if (!cfg) return String(value);

        if (cfg.isExponential) {

            const n = Number(value);
            return Number.isInteger(n) ? String(n) : n.toFixed(1);
        }
        return String(Math.round(value)).padStart(cfg.padLength, '0');
    }

    // ***** FORMATEAR VALOR DEL TIP DEL SLIDE *****
    function formatTipValue(sliderEl, value) {
        const cfg = SLIDER_CONFIG[sliderEl];
        if (!cfg) return String(value);

        if (cfg.isExponential) {
            const n = Number(value);
            const formatted = Number.isInteger(n) ? String(n) : n.toFixed(1);
            return formatted + cfg.suffix;
        }
        return String(Math.round(value)).padStart(cfg.padLength, '0') + cfg.suffix;
    }

    // ***** COMENZAR EDICIÓN *****
    function startEditing(handle, sliderEl) {
        if (!handle || handle.querySelector('.slider-edit-input')) return;

        const tip = handle.querySelector('.slider-tip');
        if (!tip) return;

        const cfg = SLIDER_CONFIG[sliderEl];
        if (!cfg) return;

        const uiValue = jQuery(sliderEl).slider('value');
        let realValue;
        if (cfg.isExponential) {

            realValue = Math.pow(uiValue, cfg.slideBase);
        } else {
            realValue = uiValue;
        }

        const currentText = formatInputValue(sliderEl, realValue);

        tip.style.visibility = 'hidden';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'slider-edit-input';
        input.value = currentText;
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('autocomplete', 'off');

        const tipRect = tip.getBoundingClientRect();
        const handleRect = handle.getBoundingClientRect();

        input.style.cssText = [
            'position: absolute',
            'left: ' + (tipRect.left - handleRect.left) + 'px',
            'top: ' + (tipRect.top - handleRect.top) + 'px',
            'width: ' + tipRect.width + 'px',
            'height: ' + tipRect.height + 'px',
            'line-height: ' + tipRect.height + 'px',
            'border: none',
            'background: rgba(255, 255, 255, 0.15)',
            'color: inherit',
            'font: inherit',
            'text-align: center',
            'padding: 0',
            'margin: 0',
            'outline: none',
            'box-sizing: border-box',
            'border-radius: 3px',
            'z-index: 5'
        ].join(';');

        const handlePos = getComputedStyle(handle).position;
        if (handlePos === 'static') {
            handle.style.position = 'relative';
        }

        handle.appendChild(input);
        input.focus();
        input.select();

        let finished = false;

        // ***** LIMPIAR VALOR INGRESADO *****
        function cleanup(apply) {
            if (finished) return;
            finished = true;

            if (apply) {
                const raw = input.value.trim();

                const parsed = cfg.isExponential
                    ? parseFloat(raw.replace(',', '.'))
                    : parseInt(raw, 10);

                if (!isNaN(parsed) && parsed >= cfg.min && parsed <= cfg.max) {

                    const sliderValue = sliderValueFromInput(sliderEl, parsed);

                    jQuery(sliderEl).slider('value', sliderValue);

                    tip.textContent = formatTipValue(sliderEl, parsed);
                }
            }

            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
            tip.style.visibility = '';

            try {
                const uiVal = jQuery(sliderEl).slider('value');
                let realVal;
                if (cfg.isExponential) {
                    realVal = Math.pow(uiVal, cfg.slideBase);
                } else {
                    realVal = uiVal;
                }
                tip.textContent = formatTipValue(sliderEl, realVal);
            } catch (e) {

            }
        }

        // ***** ESCUCHAR USO DE ENTER PARA PROCESAR INPUT Y ESCAPE PARA SALIR *****
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                cleanup(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cleanup(false);
            } else if (e.key === 'Tab') {

                cleanup(true);
            }
        });

        input.addEventListener('blur', function () {
            cleanup(true);
        });

        input.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
        input.addEventListener('dblclick', function (e) {
            e.stopPropagation();
        });
    }

    // ***** INICIALIZAR EDICIÓN AL HACER DOBLE CLIC *****
    function onDblClick(e) {
        const handle = e.target.closest('.ui-slider-handle');
        if (!handle) return;

        const sliderEl = handle.closest('.ui-slider');
        if (!sliderEl) return;

        let matched = false;
        for (const sel of Object.keys(SLIDER_CONFIG)) {
            if (sliderEl.matches(sel) || sliderEl.id === sel.replace('#', '')) {
                matched = true;
                break;
            }
        }
        if (!matched) return;

        if (e.target.classList.contains('slider-edit-input')) return;

        e.preventDefault();
        e.stopPropagation();

        startEditing(handle, '#' + sliderEl.id);
    }

    let initialized = false;
    
    // ***** INICIALIZAR FUNCIÓN *****
    function init() {
        if (initialized) return;
        initialized = true;

        document.addEventListener('dblclick', onDblClick, true);

        document.addEventListener('mousedown', function (e) {
            if (e.target.closest && e.target.closest('.ui-slider-handle .slider-edit-input')) {
                e.stopPropagation();
            }
        }, true);
    }

    // ***** SINCRONIZAR REPLAY CON EL CONTENIDO DEL INPUT *****
    window.ReplaySliderInputs = {
        init: init,

        syncTip: function (sliderSelector) {
            const cfg = SLIDER_CONFIG[sliderSelector];
            if (!cfg) return;
            const handle = document.querySelector(sliderSelector + ' .ui-slider-handle');
            const tip = handle && handle.querySelector('.slider-tip');
            if (!tip) return;
            try {
                const uiVal = jQuery(sliderSelector).slider('value');
                const realVal = cfg.isExponential
                    ? Math.pow(uiVal, cfg.slideBase)
                    : uiVal;
                tip.textContent = formatTipValue(sliderSelector, realVal);
            } catch (e) { }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    window.addEventListener('load', init, { once: true });
})();