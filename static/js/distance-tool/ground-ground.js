

// ***** TIERRA-TIERRA *****

// ***********************************************************
// **** INICIO FUNCIÓN ACTUALIZAR DISTANCIA TIERRA-TIERRA ****
// ***********************************************************
function updateGroundToGroundOverlay() {
    if (ggLineLayer && !ggLineLayer.getVisible()) return;
    const pairs = [];

    if (groundToGroundModeType === '1A1B') {
        if (ggPointA && ggPointsB.length === 1) {
            pairs.push({ key: '0', a: ggPointA, b: ggPointsB[0] });
        }
    }
    else if (groundToGroundModeType === '1A_nB') {
        if (ggPointA && ggPointsB.length) {
            ggPointsB.forEach((pt, idx) => pairs.push({ key: `${idx}`, a: ggPointA, b: pt }));
        }
    }
    else if (groundToGroundModeType === 'nA_nB') {
        if (ggPairs && ggPairs.length) {
            for (const p of ggPairs) {
                pairs.push({ key: p.key, a: p.a, b: p.b });
            }
        }
    }

    if (!pairs.length) return;
    const activeKeys = new Set();

    for (const { key, a, b } of pairs) {
        const distNm = haversineDistance(a[1], a[0], b[1], b[0]);
        const distM = distNm * 1852;
        const distText = format_distance_long(distM, DisplayUnits).replace(/nmi?/i, 'NM');

        const projA = ol.proj.fromLonLat(a);
        const projB = ol.proj.fromLonLat(b);

        activeKeys.add(key);

        let feat = ggLineFeatures.get(key);
        if (!feat) {
            feat = new ol.Feature(new ol.geom.LineString([projA, projB]));
            ggLineSource && ggLineSource.addFeature(feat);
            ggLineFeatures.set(key, feat);
        } else {
            feat.getGeometry().setCoordinates([projA, projB]);
        }

        const mid = feat.getGeometry().getCoordinateAt(0.5);

        const trueBearing = bearingFromLonLat(a, b);
        const angle = magneticBearing(a[1], a[0], 0, trueBearing);

        let ov = ggOverlays.get(key);
        if (!ov) {
            const el = document.createElement('div');
            el.id = `gg-overlay-${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
            el.style.background = 'rgba(0,0,0,0.4)';
            // el.style.border = '1px solid black';
            el.style.padding = '5px';
            el.style.fontSize = '12px';
            el.style.fontWeight = '600',
                el.style.textShadow = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000',
                el.style.color = 'white',
                el.style.pointerEvents = 'auto';
            el.style.borderRadius = '4px';

            el.innerHTML = `
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; padding-bottom: 2px;">
                    <i class="fa-solid fa-eye-slash gg-toggle-btn" style="cursor: pointer; color: white;"></i>
                    <i class="fa-solid fa-xmark gg-close-btn" style="cursor: pointer; color: #c00;"></i>
                </div>
                <div class="gg-text-content"></div>
            `;

            if (!ggHiddenState.has(key)) ggHiddenState.set(key, false);

            const toggleBtn = el.querySelector('.gg-toggle-btn');
            const closeBtn = el.querySelector('.gg-close-btn');
            const textContainer = el.querySelector('.gg-text-content');

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = ggHiddenState.get(key) || false;
                const newHidden = !isHidden;
                ggHiddenState.set(key, newHidden);

                const lineFeat = ggLineFeatures.get(key);
                if (newHidden) {
                    textContainer.style.display = 'none';
                    toggleBtn.className = 'fa-solid fa-eye';
                    if (lineFeat) lineFeat.setStyle(new ol.style.Style({}));
                } else {
                    textContainer.style.display = 'block';
                    toggleBtn.className = 'fa-solid fa-eye-slash';
                    if (lineFeat) lineFeat.setStyle(null);
                }
            });

            closeBtn.addEventListener('click', (e) => {
                if (groundToGroundModeType === '1A1B') {
                    clearPointNumbers('tt');
                } else if (groundToGroundModeType === '1A_nB') {
                    removePointNumbers('tt', ['tt_' + key + '_2']);
                } else {
                    removePointNumbers('tt', [
                        'tt_' + key + '_1',
                        'tt_' + key + '_2'
                    ]);
                }
                e.stopPropagation();
                const lineFeat = ggLineFeatures.get(key);
                if (lineFeat && ggLineSource) {
                    ggLineSource.removeFeature(lineFeat);
                    ggLineFeatures.delete(key);
                }

                if (ov && OLMap) OLMap.removeOverlay(ov);
                ggOverlays.delete(key);
                ggHiddenState.delete(key);
                ggMissingSince.delete(key);
                ggRemoved.delete(key);

                if (groundToGroundModeType === '1A1B') {
                    if (ggPointSource) ggPointSource.clear();
                    ggPointA = null;
                    ggPointsB = [];
                    if (ggPointLayer) ggPointLayer.setVisible(false);
                }
                else if (groundToGroundModeType === 'nA_nB') {
                    const aKey = `${a[0].toFixed(6)},${a[1].toFixed(6)}|${b[0].toFixed(6)},${b[1].toFixed(6)}`;
                    const stillUsed = ggPairs.some(p => p.key !== key &&
                        p.a[0].toFixed(6) === a[0].toFixed(6) &&
                        p.a[1].toFixed(6) === a[1].toFixed(6));

                    if (!stillUsed && ggPointSource) {
                        const featuresToRemove = [];
                        ggPointSource.forEachFeature(feat => {
                            const geom = feat.getGeometry();
                            if (geom) {
                                const coords = ol.proj.toLonLat(geom.getCoordinates());
                                if (Math.abs(coords[0] - a[0]) < 1e-8 && Math.abs(coords[1] - a[1]) < 1e-8) {
                                    featuresToRemove.push(feat);
                                }
                            }
                        });
                        featuresToRemove.forEach(f => ggPointSource.removeFeature(f));
                        ggPointSource.changed();
                    }

                    if (ggPointSource) {
                        const featuresToRemove = [];
                        ggPointSource.forEachFeature(feat => {
                            const geom = feat.getGeometry();
                            if (geom) {
                                const coords = ol.proj.toLonLat(geom.getCoordinates());
                                if (Math.abs(coords[0] - b[0]) < 1e-8 && Math.abs(coords[1] - b[1]) < 1e-8) {
                                    featuresToRemove.push(feat);
                                }
                            }
                        });
                        featuresToRemove.forEach(f => ggPointSource.removeFeature(f));
                        ggPointSource.changed();
                    }

                    ggPairs = ggPairs.filter(p => p.key !== key);

                    removePointNumbers('tt', [
                        'tt_' + key + '_1',
                        'tt_' + key + '_2'
                    ]);

                    if (ggPointSource && ggPointSource.getFeatures().length === 0 && ggPointLayer) {
                        ggPointLayer.setVisible(false);
                        ggPointLayer.changed();
                    } else if (ggPointLayer && !ggPointLayer.getVisible() && ggPointSource.getFeatures().length > 0) {
                        ggPointLayer.setVisible(true);
                        ggPointLayer.changed();
                    }
                }
                else if (groundToGroundModeType === '1A_nB') {
                    if (ggPointSource) {
                        const featuresToRemove = [];
                        ggPointSource.forEachFeature(feat => {
                            const geom = feat.getGeometry();
                            if (geom) {
                                const coords = ol.proj.toLonLat(geom.getCoordinates());
                                if (Math.abs(coords[0] - b[0]) < 1e-8 && Math.abs(coords[1] - b[1]) < 1e-8) {
                                    featuresToRemove.push(feat);
                                }
                            }
                        });
                        featuresToRemove.forEach(f => ggPointSource.removeFeature(f));
                        ggPointSource.changed();
                    }
                    ggPointsB = ggPointsB.filter(p =>
                        Math.abs(p[0] - b[0]) > 1e-8 || Math.abs(p[1] - b[1]) > 1e-8
                    );
                }

                // NUEVO: limpiar el número 2 correspondiente a este punto B
                if (groundToGroundModeType === '1A_nB') {
                    // Recalcular la key en base a la posición actual del punto B antes de eliminarlo
                    // Buscar la key original usando la coordenada b
                    const allPointNumberKeys = [];
                    if (_pointNumberSources['tt']) {
                        _pointNumberSources['tt'].forEachFeature(f => {
                            const fGeom = f.getGeometry();
                            if (fGeom) {
                                const fCoord = ol.proj.toLonLat(fGeom.getCoordinates());
                                // Si es el número 2 y coincide con b, marcar para eliminar
                                if (f.get('num') === 'B' &&
                                    Math.abs(fCoord[0] - b[0]) < 1e-6 &&
                                    Math.abs(fCoord[1] - b[1]) < 1e-6) {
                                    allPointNumberKeys.push(f.get('pointKey'));
                                }
                            }
                        });
                    }
                    if (allPointNumberKeys.length) {
                        removePointNumbers('tt', allPointNumberKeys);
                    }
                }

                if (OLMap) OLMap.renderSync();
                updateGroundToGroundOverlay();

                // NUEVO: limpiar números del par (o solo del punto B en 1A_nB)
                if (groundToGroundModeType === '1A_nB') {
                    // En 1A_nB, el punto A es único y compartido. Solo borrar el número del B eliminado
                    removePointNumbers('tt', ['tt_' + key + '_2']);
                } else {
                    // En 1A1B y nA_nB, borrar los números del par completo
                    removePointNumbers('tt', ['tt_' + key + '_1', 'tt_' + key + '_2']);
                }
            });

            ov = new ol.Overlay({
                element: el,
                positioning: 'center-center',
                offset: [0, -10],
                stopEvent: true
            });
            OLMap && OLMap.addOverlay(ov);
            ggOverlays.set(key, ov);
        }

        const textContainer = ov.getElement().querySelector('.gg-text-content');
        if (textContainer) {
            // textContainer.innerHTML = `Distance: ${distText}`;
            // let distanceLabel = getTranslatedText('distance_label', 'Distance:');
            const iconHTML = '⟷';
            const distanceText = showLabelUnits ? distText : format_distance_brief(distM, DisplayUnits);
            // textContainer.innerHTML = `${distanceLabel} ${distanceText}`;
            // textContainer.innerHTML = `${iconHTML} ${distanceText}`;
            textContainer.innerHTML = `${iconHTML} ${distanceText} ∠ ${formatAngle(angle)}`;
        }

        const isHidden = ggHiddenState.get(key) || false;
        if (isHidden) {
            if (textContainer) textContainer.style.display = 'none';
            const toggleIcon = ov.getElement().querySelector('.gg-toggle-btn');
            if (toggleIcon) toggleIcon.className = 'fa-solid fa-eye';
            const lineFeat = ggLineFeatures.get(key);
            if (lineFeat) lineFeat.setStyle(new ol.style.Style({}));
        } else {
            if (textContainer) textContainer.style.display = 'block';
            const toggleIcon = ov.getElement().querySelector('.gg-toggle-btn');
            if (toggleIcon) toggleIcon.className = 'fa-solid fa-eye-slash';
            const lineFeat = ggLineFeatures.get(key);
            if (lineFeat) lineFeat.setStyle(null);
        }

        updatePointNumbers('tt', [
            { key: 'tt_' + key + '_1', coord: a, num: 'A', isDark: true },
            { key: 'tt_' + key + '_2', coord: b, num: 'B', isDark: true }
        ]);

        ov.setPosition(mid);
    }

    for (const [k, feat] of ggLineFeatures) {
        if (!activeKeys.has(k)) {
            ggLineSource && ggLineSource.removeFeature(feat);
            ggLineFeatures.delete(k);
        }
    }
    for (const [k, ov] of ggOverlays) {
        if (!activeKeys.has(k)) {
            OLMap && OLMap.removeOverlay(ov);
            ggOverlays.delete(k);
        }
    }
}
// ***********************************************************
// ***** FIN FUNCIÓN ACTUALIZAR DISTANCIA TIERRA-TIERRA ******
// ***********************************************************

// ************************************************************************
// *** INICIO FUNCIÓN LIMPIAR PUNTOS, LÍNEAS Y OVERLAYS (TIERRA-TIERRA) ***
// ************************************************************************
// Limpiar puntos, líneas y overlays en el modo tierra-tierra
function clearGroundToGround(opts = {}) {

    try { ggLineSource && ggLineSource.clear(); } catch (_) { }
    try { ggPointSource && ggPointSource.clear(); } catch (_) { }

    try { ggLineFeatures && ggLineFeatures.clear(); } catch (_) { }
    if (ggOverlays && ggOverlays.size) {
        ggOverlays.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
        try { ggOverlays.clear(); } catch (_) { }
    }

    if (ggHiddenState) ggHiddenState.clear();
    if (ggMissingSince) ggMissingSince.clear();
    if (ggRemoved) ggRemoved.clear();
    if (ggPairMap) ggPairMap.clear();
    if (ggPairOrder) ggPairOrder.length = 0;

    try { ggPairs && (ggPairs.length = 0); } catch (_) { }
    ggPendingA = null;

    if (opts.reset !== false) {
        ggPointA = null;
        ggPointsB = [];
        clearPointNumbers('tt');
    }

    if (ggUpdateInterval) {
        clearInterval(ggUpdateInterval);
        ggUpdateInterval = null;
    }
}
// ************************************************************************
// **** FIN FUNCIÓN LIMPIAR PUNTOS, LÍNEAS Y OVERLAYS (TIERRA-TIERRA) *****
// ************************************************************************

// ***********************************************************
// **** INICIO FUNCIÓN ACTIVAR/DESACTIVAR TIERRA-TIERRA ******
// ***********************************************************
function DistanceGroundToGround() {
    groundToGroundMode = !groundToGroundMode;
    if (groundToGroundMode) {
        if (distanceBetweenPlanesMode) {
            distanceBetweenPlanesMode = false;
            resetDistanceCalculation();
            buttonActive('#D', false);
        }
        if (distanceToGroundMode) {
            distanceToGroundMode = false;
            clearTAGroundDrawings();
            hideDistanceGuide();
            buttonActive('#TA', false);
        }
        clearGroundToGround();

        if (!ggPointSource) ggPointSource = new ol.source.Vector();
        if (ggPointLayer) {
            ggPointLayer.setSource(ggPointSource);
            ggPointLayer.setVisible(true);
        }

        if (!ggLineSource) ggLineSource = new ol.source.Vector();
        if (ggLineLayer) {
            ggLineLayer.setSource(ggLineSource);
            ggLineLayer.setVisible(true);
        }

        showDistanceGuide(() => `<center>${ggPreMessage()}</center><br><center>${ggStep1Message()}</center>`);
        ggUpdateInterval = setInterval(updateGroundToGroundOverlay, 1000);
        buttonActive('#TT', true);
    } else {
        clearGroundToGround();
        hideDistanceGuide();
        buttonActive('#TT', false);
    }
}
// ***********************************************************
// ****** FIN FUNCIÓN ACTIVAR/DESACTIVAR TIERRA-TIERRA *******
// ***********************************************************

// ************************************************************************
// ****** INICIO FUNCIÓN CICLAR MODO SEGÚN CLICK (TIERRA-TIERRA) **********
// ************************************************************************
function onTTCycleClick() {
    if (!groundToGroundMode) {
        groundToGroundModeType = GG_MODES[0];
        DistanceGroundToGround();
        return;
    }

    const idx = GG_MODES.indexOf(groundToGroundModeType);
    if (idx >= 0 && idx < GG_MODES.length - 1) {
        groundToGroundModeType = GG_MODES[idx + 1];
        clearGroundToGround();

        if (ggPointLayer) ggPointLayer.setVisible(true);

        showDistanceGuide(() => `<center>${ggPreMessage()}</center><br><center>${ggStep1Message()}</center>`);
        updateGroundToGroundOverlay();
    } else {
        DistanceGroundToGround();
    }
}
// ************************************************************************
// ******** FIN FUNCIÓN CICLAR MODO SEGÚN CLICK (TIERRA-TIERRA) ***********
// ************************************************************************

// *******************************************************************
// **************** INICIO TOOLTIPS (TIERRA-TIERRA)*******************
// *******************************************************************
function ggPreMessage() {
    switch (groundToGroundModeType) {
        case '1A1B':
            return getTranslatedText('gg_1_point_1_point', '1 Point - 1 Point Mode');
        case '1A_nB':
            return getTranslatedText('gg_1_point_multiple_points', '1 Point - Multiple Points Mode');
        case 'nA_nB':
            return getTranslatedText('gg_multiple_points_multiple_points', 'Multiple Points - Multiple Points Mode');
        default:
            return '';
    }
}

function ggStep1Message() {
    let msg = 'Click on the map to mark point A.';
    switch (groundToGroundModeType) {
        case '1A1B':
            msg = getTranslatedText('ta_click_map_point_a', 'Click on the map to mark point A.');
            break;
        case '1A_nB':
            msg = getTranslatedText('ta_click_map_single_point_a', 'Click on the map to mark a single point A.');
            break;
        case 'nA_nB':
            msg = getTranslatedText('ta_click_map_point_a', 'Click on the map to mark point A.');
            break;
        default:
            msg = getTranslatedText('ta_click_map_point_a', 'Click on the map to mark point A.');
            break;
    }
    return msg;
}

function ggStep2Message() {
    let msg = 'Click on the map to mark point B.';
    switch (groundToGroundModeType) {
        case '1A1B':
            msg = getTranslatedText('gg_click_map_point_b', 'Click on the map to mark point B.');
            break;
        case '1A_nB':
            msg = getTranslatedText('gg_click_map_multiple_points_b', 'Click on the map to mark multiple points B.');
            break;
        case 'nA_nB':
            msg = getTranslatedText('gg_click_map_point_b', 'Click on the map to mark point B.');
            break;
        default:
            msg = getTranslatedText('gg_click_map_point_b', 'Click on the map to mark point B.');
            break;
    }
    return msg;
}
// *******************************************************************
// ***************** FIN TOOLTIPS (TIERRA-TIERRA)*********************
// *******************************************************************

// ============================================================
// HANDLER DE CLICK - MODO DISTANCIA TIERRA-TIERRA
// Llamado desde OLMap.on(['singleclick','dblclick']) en script_*.js
// cuando groundToGroundMode === true.
// ============================================================
function handleGroundToGroundClick(evt, planeHex) {
    const evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);
    const lonlat = ol.proj.toLonLat(evtCoords);
    if (ggPointLayer) ggPointLayer.setVisible(true);

    if (groundToGroundModeType === 'nA_nB') {
        if (!ggPendingA) {
            ggPendingA = lonlat;
            ggPointSource && ggPointSource.addFeature(
                new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
            );
            showDistanceGuide(() => ggStep2Message());
        } else {
            const a = ggPendingA;
            const b = lonlat;
            const key = `${a[0].toFixed(6)},${a[1].toFixed(6)}|${b[0].toFixed(6)},${b[1].toFixed(6)}`;
            ggPairs.push({ key, a, b });
            ggPointSource && ggPointSource.addFeature(
                new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(b)))
            );
            ggPendingA = null;
            hideDistanceGuide();
        }

        updateGroundToGroundOverlay();
        if (!ggUpdateInterval) {
            ggUpdateInterval = setInterval(updateGroundToGroundOverlay, 1000);
        }
        return;
    }

    if (!ggPointA) {
        ggPointA = lonlat;
        if (ggPointSource) ggPointSource.clear();
        ggPointSource && ggPointSource.addFeature(
            new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
        );
        showDistanceGuide(() => ggStep2Message());
    } else if (groundToGroundModeType === '1A1B') {
        ggPointsB = [lonlat];
        if (ggPointSource) {
            ggPointSource.clear();
            if (ggPointA) {
                ggPointSource.addFeature(
                    new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(ggPointA)))
                );
            }
        }
        ggPointSource && ggPointSource.addFeature(
            new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
        );
        hideDistanceGuide();
    } else {
        ggPointsB.push(lonlat);
        ggPointSource && ggPointSource.addFeature(
            new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
        );
        hideDistanceGuide();
    }

    updateGroundToGroundOverlay();
    if (!ggUpdateInterval) {
        ggUpdateInterval = setInterval(updateGroundToGroundOverlay, 1000);
    }
}

window.clearGroundToGround = clearGroundToGround;
window.updateGroundToGroundOverlay = updateGroundToGroundOverlay;
window.DistanceGroundToGround = DistanceGroundToGround;
window.onTTCycleClick = onTTCycleClick;
window.handleGroundToGroundClick = handleGroundToGroundClick;