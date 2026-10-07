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

    let needed = 0;

    for (const id of menuIds) {
      const root = document.getElementById(id);
      if (!root) continue;
      const content = root.querySelector('.dropdown-content');
      if (!content) continue;
      const cs = getComputedStyle(content);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rect = content.getBoundingClientRect();
      const push = Math.max(0, Math.ceil(rect.bottom - navbarBottom) + extraSpacing);
      needed = Math.max(needed, push);
    }

    layerSelect.style.setProperty('--layer-switcher-offset', `${needed}px`);

    if (layerSelect.classList.contains('shown')) {
      const top = layerSelect.getBoundingClientRect().top;
      const available = Math.max(0, window.innerHeight - top - 12);
      layerSelect.style.height = `${available}px`;
      layerSelect.style.maxHeight = `${available}px`;
    } else {
      layerSelect.style.height = '';
      layerSelect.style.maxHeight = '';
    }
  }

  document.addEventListener('focusin', updateLayerSelectOffset);
  document.addEventListener('focusout', () => setTimeout(updateLayerSelectOffset, 0));
  document.addEventListener('click', () => setTimeout(updateLayerSelectOffset, 0));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setTimeout(updateLayerSelectOffset, 0);
  });
  window.addEventListener('resize', updateLayerSelectOffset);

  const observer = new MutationObserver(updateLayerSelectOffset);
  observer.observe(layerSelect, { attributes: true, attributeFilter: ['class', 'style'] });

  updateLayerSelectOffset();
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