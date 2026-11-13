// ***** ACTUALIZAR TAMAÑO DEL MENÚ DE CAPAS CONFORME A LOS DROPDOWNS ABIERTOS *****
(function () {
  function updateToggleButtons() {
    var sidebar = document.getElementById('sidebar_container');
    var closedBtn = document.getElementById('toggle_sidebar_button_closed');
    var sidebarBtnContainer = document.getElementById('sidebar_close_button_container');
    if (!sidebar || !closedBtn || !sidebarBtnContainer) return;
    var isHidden = (window.getComputedStyle(sidebar).display === 'none');
    closedBtn.style.display = isHidden ? 'block' : 'none';
    sidebarBtnContainer.style.display = isHidden ? 'none' : 'block';
  }

  function proxyClick(e) {
    var target = document.getElementById('toggle_sidebar_button');
    if (target) target.click();
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateToggleButtons();
    var closed = document.getElementById('toggle_sidebar_button_closed');
    if (closed) closed.addEventListener('click', proxyClick);

    var sidebar = document.getElementById('sidebar_container');
    if (sidebar && window.MutationObserver) {
      var mo = new MutationObserver(function () { updateToggleButtons(); });
      mo.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
    }
  });
})();

// ***** OBTENER LOS DROPDOWNS BAJO LOS CUALES EL MENÚ DEBE AJUSTARSE *****
(function () {
  const menuIds = [
    'aircraft_dropdown',
    'measurement_dropdown',
    'track_dropdown',
    'label_dropdown',
    'elevation_dropdown'
  ];

  const layerSelect = document.getElementById('layer-select');
  if (!layerSelect) return;
  let scheduledUpdate = null;
  let lastOffset = null;
  let lastHeight = null;

  function isOpen(root) {
    const content = root.querySelector('.dropdown-content');
    if (!content) return false;
    const rect = content.getBoundingClientRect();
    const cs = getComputedStyle(content);
    return root.matches(':focus-within') &&
      rect.height > 0 &&
      cs.display !== 'none' &&
      cs.visibility !== 'hidden';
  }

  function getLayerSwitcher() {
    return layerSelect.classList.contains('layer-switcher')
      ? layerSelect
      : layerSelect.querySelector('.layer-switcher');
  }

  function updateLayerSelectOffset() {
    const extraSpacing = 12;
    const menuIds = [
      'aircraft_dropdown',
      'measurement_dropdown',
      'track_dropdown',
      'label_dropdown',
      'elevation_dropdown'
    ];
    const navbar = document.getElementById('navbar');
    const navbarBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
    const replayBar = document.getElementById('replayBar');

    let needed = 0;

    for (const id of menuIds) {
      const root = document.getElementById(id);
      if (!root) continue;
      const content = root.querySelector('.dropdown-content');
      if (!content) continue;
      if (!isOpen(root)) continue;
      const cs = getComputedStyle(content);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rect = content.getBoundingClientRect();
      const push = Math.max(0, Math.ceil(rect.bottom - navbarBottom) + extraSpacing);
      needed = Math.max(needed, push);
    }

    const offset = `${needed}px`;
    if (offset !== lastOffset) {
      layerSelect.style.setProperty('--layer-switcher-offset', offset);
      lastOffset = offset;
    }

    const switcher = getLayerSwitcher();
    if (switcher && switcher.classList.contains('shown')) {
      const top = switcher.getBoundingClientRect().top;
      const replayStyle = replayBar ? getComputedStyle(replayBar) : null;
      const replayRect = replayBar ? replayBar.getBoundingClientRect() : null;
      const replayVisible = replayRect && replayRect.height > 0 &&
        replayStyle.display !== 'none' && replayStyle.visibility !== 'hidden';
      const bottom = replayVisible ? replayRect.top : window.innerHeight;
      const available = Math.max(0, bottom - top - 12);
      const height = `${available}px`;
      if (height !== lastHeight) {
        layerSelect.style.setProperty('--layer-switcher-height', height);
        lastHeight = height;
      }
    } else {
      if (lastHeight !== null) {
        layerSelect.style.removeProperty('--layer-switcher-height');
        lastHeight = null;
      }
    }
  }

  function scheduleLayerSelectOffset() {
    if (scheduledUpdate !== null) return;
    scheduledUpdate = requestAnimationFrame(() => {
      scheduledUpdate = null;
      updateLayerSelectOffset();
    });
  }

  document.addEventListener('focusin', scheduleLayerSelectOffset);
  document.addEventListener('focusout', scheduleLayerSelectOffset);
  document.addEventListener('click', scheduleLayerSelectOffset);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') scheduleLayerSelectOffset();
  });
  window.addEventListener('resize', updateLayerSelectOffset);

  const observer = new MutationObserver(scheduleLayerSelectOffset);
  observer.observe(layerSelect, {
    attributes: true,
    attributeFilter: ['class', 'style'],
    childList: true,
    subtree: false
  });

  let layerSwitcherObserver = null;
  let observedLayerSwitcher = null;

  function observeLayerSwitcher() {
    const switcher = getLayerSwitcher();
    if (switcher === observedLayerSwitcher) return;

    if (layerSwitcherObserver) {
      layerSwitcherObserver.disconnect();
      layerSwitcherObserver = null;
    }

    observedLayerSwitcher = switcher;
    if (switcher) {
      layerSwitcherObserver = new MutationObserver(scheduleLayerSelectOffset);
      layerSwitcherObserver.observe(switcher, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
    scheduleLayerSelectOffset();
  }

  const switcherObserver = new MutationObserver(observeLayerSwitcher);
  switcherObserver.observe(layerSelect, { childList: true, subtree: true });
  observeLayerSwitcher();

  if (window.ResizeObserver) {
    const menuResizeObserver = new ResizeObserver(() => {
      scheduleLayerSelectOffset();
    });
    menuIds.forEach(id => {
      const root = document.getElementById(id);
      if (root) {
        menuResizeObserver.observe(root);
        const content = root.querySelector('.dropdown-content');
        if (content) menuResizeObserver.observe(content);
      }
    });
    const replayBar = document.getElementById('replayBar');
    if (replayBar) menuResizeObserver.observe(replayBar);
    const switcher = getLayerSwitcher();
    if (switcher) menuResizeObserver.observe(switcher);
  }

  const replayBar = document.getElementById('replayBar');
  if (replayBar && window.MutationObserver) {
    const replayObserver = new MutationObserver(scheduleLayerSelectOffset);
    replayObserver.observe(replayBar, { attributes: true, attributeFilter: ['class', 'style'] });
  }

  const settings = document.getElementById('settings_infoblock');
  if (settings && window.MutationObserver) {
    const settingsObserver = new MutationObserver(scheduleLayerSelectOffset);
    settingsObserver.observe(settings, { attributes: true, attributeFilter: ['class', 'style'] });
  }

  updateLayerSelectOffset();
})();

// ***** DESHABILITAR TEMPORALMENTE DROPDOWNS DE CAPAS EN DESARROLLO *****
(function () {
  // Comenta o descomenta estas entradas mientras se trabaja en sus capas internas.
  const TEMPORARILY_DISABLED_LAYER_GROUPS = [
    'vfr',
    'ifrhigh',
    'ifrlow',
    'tma_miq',
    'tma_bna',
    'tma_gna'
  ];

  const layerGroupTitles = {
    vfr: ['VFR'],
    ifrhigh: ['IFR High', 'IFR Alto'],
    ifrlow: ['IFR Low', 'IFR Bajo'],
    tma_miq: ['TMA/MIQ'],
    tma_bna: ['TMA/BNA'],
    tma_gna: ['TMA/GNA']
  };

  function isDisabledGroupTitle(title) {
    return TEMPORARILY_DISABLED_LAYER_GROUPS.some(name =>
      (layerGroupTitles[name] || []).includes(title)
    );
  }

  function updateDisabledLayerGroups() {
    document.querySelectorAll('.layer-switcher li.group').forEach(group => {
      const label = group.querySelector(':scope > label');
      const foldButton = group.querySelector(':scope > button');
      const disabled = label && isDisabledGroupTitle(label.textContent.trim());

      group.classList.toggle('layer-group-temporarily-disabled', !!disabled);
      if (disabled) {
        group.setAttribute('aria-disabled', 'true');
        if (label) {
          label.classList.add('disabled');
          label.setAttribute('aria-disabled', 'true');
        }
        if (foldButton) {
          foldButton.disabled = true;
          foldButton.tabIndex = -1;
          foldButton.setAttribute('aria-hidden', 'true');
        }
      } else {
        group.removeAttribute('aria-disabled');
        if (label) {
          label.classList.remove('disabled');
          label.removeAttribute('aria-disabled');
        }
        if (foldButton) {
          foldButton.disabled = false;
          foldButton.tabIndex = 0;
          foldButton.removeAttribute('aria-hidden');
        }
      }
    });
  }

  function blockDisabledGroupInteraction(event) {
    const group = event.target.closest('.layer-group-temporarily-disabled');
    if (!group) return;

    event.preventDefault();
    event.stopPropagation();
  }

  function initialize() {
    updateDisabledLayerGroups();

    const layerSelect = document.getElementById('layer-select');
    if (!layerSelect) return;

    layerSelect.addEventListener('click', blockDisabledGroupInteraction, true);
    layerSelect.addEventListener('keydown', blockDisabledGroupInteraction, true);

    const observer = new MutationObserver(updateDisabledLayerGroups);
    observer.observe(layerSelect, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();

// ***** COLOCAR NOMBRE EN EL ENCABEZADO DEL MENÚ DE CAPAS *****
(function () {
  const TITLE_CLASS = 'layer-panel-title';

  function getLayerToolsTitle() {
    try {
      if (typeof window.translate !== 'undefined' && window.translate && typeof window.translate.t === 'function') {
        const translated = window.translate.t('layer_tools_title');
        if (translated && translated !== 'layer_tools_title') {
          return translated;
        }
      }
    } catch (e) {
      console.warn('Error obteniendo traducción para layer_tools_title:', e);
    }

    try {
      if (typeof window.t === 'function') {
        const translated = window.t('layer_tools_title');
        if (translated && translated !== 'layer_tools_title') {
          return translated;
        }
      }
    } catch (e) {
      console.warn('Error obteniendo traducción para layer_tools_title (window.t):', e);
    }

    return 'Layer tools';
  }

  function insertTitleIntoPanel(panel) {
    if (!panel) return;

    let titleEl = panel.querySelector(`:scope > .${TITLE_CLASS}`);
    if (!titleEl) {
      titleEl = document.createElement('div');
      titleEl.className = TITLE_CLASS;
      panel.prepend(titleEl);
    }

    const titleText = getLayerToolsTitle();
    if (titleEl.textContent !== titleText) {
      titleEl.textContent = titleText;
    }
  }

  function scanForPanels() {
    try {
      document.querySelectorAll('.layer-switcher').forEach(ls => {
        const panel = ls.querySelector('.panel');
        if (panel) insertTitleIntoPanel(panel);

        if (window.MutationObserver && !ls.__layerTitleObserver) {
          ls.__layerTitleObserver = new MutationObserver(() => {
            const panel = ls.querySelector('.panel');
            if (panel) insertTitleIntoPanel(panel);
          });
          ls.__layerTitleObserver.observe(ls, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
          });
        }
      });
    } catch (e) {
      console.warn('Error en scanForPanels:', e);
    }
  }

  function updateLayerToolsTitle() {
    try {
      document.querySelectorAll('.layer-switcher .panel .layer-panel-title').forEach(el => {
        const titleText = getLayerToolsTitle();
        if (el.textContent !== titleText) {
          el.textContent = titleText;
        }
      });
    } catch (e) {
      console.warn('Error actualizando títulos de layer tools:', e);
    }
  }

  window.updateLayerToolsTitle = updateLayerToolsTitle;

  document.addEventListener('languageChanged', function () {
    setTimeout(function () {
      if (typeof window.updateLayerToolsTitle === 'function') {
        window.updateLayerToolsTitle();
      }
    }, 100);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(scanForPanels, 100);
    });
  } else {
    setTimeout(scanForPanels, 100);
  }

  if (document.readyState === 'complete') {
    setTimeout(scanForPanels, 200);
  } else {
    window.addEventListener('load', function () {
      setTimeout(scanForPanels, 200);
    });
  }
})();