

// ***** TIERRA-AERONAVE *****
// ***********************************************************
// *** INICIO FUNCIÓN ACTUALIZAR DISTANCIA TIERRA-AERONAVE ***
// ***********************************************************
function updateDistanceToGroundOverlay() {
    if (groundToPlaneLineLayer && !groundToPlaneLineLayer.getVisible()) return;

    const pairs = [];

    if (distanceToGroundModeType === '1A1B') {
        if (groundPoints.length === 1 && planesForGround.length === 1) {
            pairs.push({ key: '0|' + planesForGround[0], gp: groundPoints[0], hex: planesForGround[0] });
        }
    } else if (distanceToGroundModeType === '1A_nB') {
        if (groundPoints.length === 1 && planesForGround.length) {
            for (const hex of planesForGround) {
                pairs.push({ key: '0|' + hex, gp: groundPoints[0], hex });
            }
        }
    } else if (distanceToGroundModeType === 'nA_1B') {
        if (planesForGround.length === 1 && groundPoints.length) {
            const hex = planesForGround[0];
            for (let gi = 0; gi < groundPoints.length; gi++) {
                pairs.push({ key: gi + '|' + hex, gp: groundPoints[gi], hex });
            }
        }
    } else if (distanceToGroundModeType === 'nA_nB') {
        for (const p of taPairs) {
            pairs.push({
                key: p.key,
                gp: p.gp,
                hex: p.hex,
                firstPointType: p.firstPointType  // NUEVO: pasar el tipo del primer punto
            });
        }
    }

    if (!pairs.length) return;
    const active = new Set();

    for (const { key, gp, hex, firstPointType } of pairs) {
        let plane = g.planes[hex];
        const missingPlane = !plane || !plane.position;
        const isStale = missingPlane || plane.seen > 15;

        const pairFirstType = (distanceToGroundModeType === 'nA_nB' && firstPointType)
            ? firstPointType
            : taFirstPointType;

        if (!gp) continue;

        if (groundPlaneRemoved.has(key)) {
            if (!isStale) {
                groundPlaneRemoved.delete(key);
                groundPlaneMissingSince.delete(key);
            } else {
                continue;
            }
        }

        if (isStale) {
            active.add(key);
            const started = groundPlaneMissingSince.get(key) || Date.now();
            groundPlaneMissingSince.set(key, started);
            const secondsMissing = (Date.now() - started) / 1000;
            const remaining = Math.max(0, Math.ceil(15 - secondsMissing));
            let ov = groundPlaneOverlays.get(key);
            if (!ov) {
                const el = document.createElement('div');
                el.id = `ta-overlay-${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
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
                <i class="fa-solid fa-eye-slash ta-toggle-btn" style="cursor: pointer; color: white;"></i>
                <i class="fa-solid fa-xmark ta-close-btn" style="cursor: pointer; color: #c00;"></i>
            </div>
            <div class="ta-text-content"></div>
        `;

                if (!groundPlaneHiddenState.has(key)) groundPlaneHiddenState.set(key, false);

                const toggleBtn = el.querySelector('.ta-toggle-btn');
                const closeBtn = el.querySelector('.ta-close-btn');
                const textContainer = el.querySelector('.ta-text-content');

                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = groundPlaneHiddenState.get(key) || false;
                    const newHidden = !isHidden;
                    groundPlaneHiddenState.set(key, newHidden);

                    if (newHidden) {
                        textContainer.style.display = 'none';
                        toggleBtn.className = 'fa-solid fa-eye';
                        const feat = groundPlaneFeatures.get(key);
                        if (feat) feat.setStyle(new ol.style.Style({}));
                    } else {
                        textContainer.style.display = 'block';
                        toggleBtn.className = 'fa-solid fa-eye-slash';
                        const feat = groundPlaneFeatures.get(key);
                        if (feat) feat.setStyle(null);
                    }
                });

                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    const feat = groundPlaneFeatures.get(key);
                    if (feat && groundToPlaneLineSource) {
                        groundToPlaneLineSource.removeFeature(feat);
                        groundPlaneFeatures.delete(key);
                    }

                    if (ov) OLMap && OLMap.removeOverlay(ov);
                    groundPlaneOverlays.delete(key);

                    groundPlaneHiddenState.delete(key);
                    groundPlaneMissingSince.delete(key);
                    groundPlaneRemoved.delete(key);

                    if (distanceToGroundModeType === '1A1B') {
                        // Resetear variables de estado para permitir nuevo par
                        groundPoints = [];
                        groundPointCoord = null;
                        planesForGround = [];
                        selectedPlaneForGround = null;
                        taFirstPointType = null;
                        // NO limpiar groundPointSource ni ocultar groundPointLayer
                    }
                    else if (distanceToGroundModeType === 'nA_nB') {
                        // Calcular la gpKey de este par ANTES de eliminarlo
                        const gpKey = key.split('|')[0];

                        // Eliminar el par
                        taPairs = taPairs.filter(p => p.key !== key);

                        // Verificar si OTROS pares siguen usando esta misma tierra
                        const stillUsed = taPairs.some(p => p.key.startsWith(gpKey + '|'));

                        if (!stillUsed && groundPointSource) {
                            // Ningún par usa esta tierra → eliminar el punto base
                            const featA = groundPointFeaturesByCoord.get(gpKey);
                            if (featA) {
                                groundPointSource.removeFeature(featA);
                                groundPointFeaturesByCoord.delete(gpKey);
                            }
                            // Además, remover cualquier feature que coincida con la coordenada
                            const featuresToRemove = [];
                            groundPointSource.forEachFeature(feat => {
                                const geom = feat.getGeometry();
                                if (geom) {
                                    const coords = geom.getCoordinates();
                                    const lonLat = ol.proj.toLonLat(coords);
                                    const candidateKey = `${lonLat[0].toFixed(6)},${lonLat[1].toFixed(6)}`;
                                    if (candidateKey === gpKey) {
                                        featuresToRemove.push(feat);
                                    }
                                }
                            });
                            featuresToRemove.forEach(feat => groundPointSource.removeFeature(feat));
                            groundPointSource.changed();
                        }

                        // La capa debe permanecer visible siempre (aunque no queden puntos)
                        if (groundPointLayer) {
                            groundPointLayer.setVisible(true);
                            groundPointLayer.changed();
                        }

                        if (OLMap) {
                            OLMap.renderSync();
                        }
                    }

                    else if (distanceToGroundModeType === '1A_nB') {
                        planesForGround = planesForGround.filter(h => h !== hex);
                    }
                    else if (distanceToGroundModeType === 'nA_1B') {
                        planesForGround = [];
                        selectedPlaneForGround = null;
                    }

                    updateDistanceToGroundOverlay();

                    // NUEVO: según el modo, limpiar solo lo necesario
                    // NUEVO: limpiar solo los números y puntos del par, no los puntos base
                    if (distanceToGroundModeType === 'nA_1B') {
                        // nA_1B: solo limpiar el número y punto del avión
                        removePointNumbers('ta', ['ta_' + key + '_a']);
                        removePlanePoints('ta', ['ta_' + key + '_a']);
                    } else if (distanceToGroundModeType === '1A1B') {
                        // 1A1B: limpiar números y puntos del avión, y el número de tierra
                        // (pero NO borrar el punto de tierra base)
                        removePointNumbers('ta', ['ta_' + key + '_g', 'ta_' + key + '_a']);
                        removePlanePoints('ta', ['ta_' + key + '_a']);
                    } else {
                        // 1A_nB y nA_nB: limpiar números del par y punto del avión
                        removePointNumbers('ta', ['ta_' + key + '_g', 'ta_' + key + '_a']);
                        removePlanePoints('ta', ['ta_' + key + '_a']);
                    }
                    if (groundPointLayer) {
                        groundPointLayer.setVisible(true);
                        groundPointLayer.changed();
                    }
                });

                ov = new ol.Overlay({
                    element: el,
                    positioning: 'center-center',
                    offset: [0, -10],
                    stopEvent: true
                });
                OLMap && OLMap.addOverlay(ov);
                groundPlaneOverlays.set(key, ov);
            }

            const textContainer = ov.getElement().querySelector('.ta-text-content');
            if (textContainer) {
                // textContainer.innerHTML = `<b style="color:red;">SIGNAL LOST</b><br>Retrying... ${remaining}s`;
                let signalLost = getTranslatedText('signal_lost', 'SIGNAL LOST');
                let retrying = getTranslatedText('retrying', 'Retrying...');
                textContainer.innerHTML = `<b style="color:red;">${signalLost}</b><br>${retrying} ${remaining}s`;
            }

            const isHidden = groundPlaneHiddenState.get(key) || false;
            if (isHidden) {
                if (textContainer) textContainer.style.display = 'none';
                const toggleIcon = ov.getElement().querySelector('.ta-toggle-btn');
                if (toggleIcon) toggleIcon.className = 'fa-solid fa-eye';
                const feat = groundPlaneFeatures.get(key);
                if (feat) feat.setStyle(new ol.style.Style({}));
            } else {
                if (textContainer) textContainer.style.display = 'block';
                const toggleIcon = ov.getElement().querySelector('.ta-toggle-btn');
                if (toggleIcon) toggleIcon.className = 'fa-solid fa-eye-slash';
                const feat = groundPlaneFeatures.get(key);
                if (feat) feat.setStyle(null);
            }

            let overlayPos;
            if (groundPlaneFeatures.has(key)) {
                overlayPos = groundPlaneFeatures.get(key).getGeometry().getCoordinateAt(0.5);
            } else if (!missingPlane && plane.position) {
                const projPlane = ol.proj.fromLonLat(plane.position);
                const projGround = ol.proj.fromLonLat(gp);
                overlayPos = [(projGround[0] + projPlane[0]) / 2, (projGround[1] + projPlane[1]) / 2];
            } else {
                overlayPos = ol.proj.fromLonLat(gp);
            }
            ov.setPositioning('center-center');
            ov.setOffset([0, 0]);
            ov.setPosition(overlayPos);

            if (secondsMissing >= 15) {
                groundPlaneMissingSince.delete(key);
                groundPlaneRemoved.add(key);

                const feat = groundPlaneFeatures.get(key);
                if (feat) {
                    groundToPlaneLineSource && groundToPlaneLineSource.removeFeature(feat);
                    groundPlaneFeatures.delete(key);
                }
                OLMap && ov && OLMap.removeOverlay(ov);
                groundPlaneOverlays.delete(key);
                groundPlaneHiddenState.delete(key);

                if (distanceToGroundModeType === '1A1B') {
                    // Resetear variables de estado para permitir nuevo par
                    groundPoints = [];
                    groundPointCoord = null;
                    planesForGround = [];
                    selectedPlaneForGround = null;
                    taFirstPointType = null;
                    // NO limpiar groundPointSource ni ocultar groundPointLayer
                } else if (distanceToGroundModeType === 'nA_nB') {
                    const gpKey = key.split('|')[0];
                    const stillUsed = taPairs.some(p => p.key !== key && p.key.startsWith(gpKey + '|'));
                    if (!stillUsed && groundPointSource) {
                        const featA = groundPointFeaturesByCoord.get(gpKey);
                        if (featA) {
                            groundPointSource.removeFeature(featA);
                            groundPointFeaturesByCoord.delete(gpKey);
                        }
                        const featuresToRemove = [];
                        groundPointSource.forEachFeature(feat => {
                            const geom = feat.getGeometry();
                            if (geom) {
                                const coords = geom.getCoordinates();
                                const lonLat = ol.proj.toLonLat(coords);
                                const candidateKey = `${lonLat[0].toFixed(6)},${lonLat[1].toFixed(6)}`;
                                if (candidateKey === gpKey) {
                                    featuresToRemove.push(feat);
                                }
                            }
                        });
                        featuresToRemove.forEach(feat => groundPointSource.removeFeature(feat));
                        groundPointSource.changed();
                    }

                    taPairs = taPairs.filter(p => p.key !== key);
                    if (groundPointSource && groundPointSource.getFeatures().length === 0) {
                        if (groundPointLayer) {
                            groundPointLayer.setVisible(false);
                            groundPointLayer.changed();
                        }
                    } else if (groundPointLayer && !groundPointLayer.getVisible()) {
                        groundPointLayer.setVisible(true);
                        groundPointLayer.changed();
                    }

                    if (OLMap) {
                        OLMap.renderSync();
                    }
                } else if (distanceToGroundModeType === '1A_nB') {
                    planesForGround = planesForGround.filter(h => h !== hex);
                } else if (distanceToGroundModeType === 'nA_1B') {
                    planesForGround = [];
                    selectedPlaneForGround = null;
                }

                if (OLMap) OLMap.renderSync();
            }

            continue;
        }

        groundPlaneMissingSince.delete(key);
        groundPlaneRemoved.delete(key);
        active.add(key);
        let altBaro = plane.altitude;
        if (altBaro === "ground") altBaro = 0;
        altBaro = adjust_baro_alt(altBaro);
        let altGeom = adjust_geom_alt(plane.alt_geom, plane.position);
        if (altGeom === "ground") altGeom = 0;
        const verticalFt = (altGeom != null) ? altGeom : altBaro;
        if (verticalFt == null) continue;
        const pp = plane.position;
        const horizNm = haversineDistance(gp[1], gp[0], pp[1], pp[0]);
        const horizM = horizNm * 1852;
        const vertNm = Math.abs(verticalFt) / 6076.12;
        const slantNm = Math.sqrt(horizNm * horizNm + vertNm * vertNm);
        const slantM = slantNm * 1852;
        const slantText = format_distance_long(slantM, DisplayUnits).replace(/nmi?/i, 'NM');
        const projPlane = ol.proj.fromLonLat(pp);
        const projGround = ol.proj.fromLonLat(gp);
        active.add(key);

        let feat = groundPlaneFeatures.get(key);
        if (!feat) {
            feat = new ol.Feature(new ol.geom.LineString([projGround, projPlane]));
            groundToPlaneLineSource && groundToPlaneLineSource.addFeature(feat);
            groundPlaneFeatures.set(key, feat);
        } else {
            feat.getGeometry().setCoordinates([projGround, projPlane]);
        }

        const midProj = feat.getGeometry().getCoordinateAt(0.5);

        let ov = groundPlaneOverlays.get(key);
        if (!ov) {
            const el = document.createElement('div');
            el.id = `ta-overlay-${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
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
            <i class="fa-solid fa-eye-slash ta-toggle-btn" style="cursor: pointer; color: white;"></i>
            <i class="fa-solid fa-xmark ta-close-btn" style="cursor: pointer; color: #c00;"></i>
        </div>
        <div class="ta-text-content"></div>
    `;

            if (!groundPlaneHiddenState.has(key)) groundPlaneHiddenState.set(key, false);

            const toggleBtn = el.querySelector('.ta-toggle-btn');
            const closeBtn = el.querySelector('.ta-close-btn');
            const textContainer = el.querySelector('.ta-text-content');

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = groundPlaneHiddenState.get(key) || false;
                const newHidden = !isHidden;
                groundPlaneHiddenState.set(key, newHidden);

                const feat = groundPlaneFeatures.get(key);
                if (newHidden) {
                    textContainer.style.display = 'none';
                    toggleBtn.className = 'fa-solid fa-eye';
                    if (feat) feat.setStyle(new ol.style.Style({}));
                } else {
                    textContainer.style.display = 'block';
                    toggleBtn.className = 'fa-solid fa-eye-slash';
                    if (feat) feat.setStyle(null);
                }
            });

            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                const feat = groundPlaneFeatures.get(key);
                if (feat && groundToPlaneLineSource) {
                    groundToPlaneLineSource.removeFeature(feat);
                    groundPlaneFeatures.delete(key);
                }

                if (ov) OLMap && OLMap.removeOverlay(ov);
                groundPlaneOverlays.delete(key);

                groundPlaneHiddenState.delete(key);
                groundPlaneMissingSince.delete(key);
                groundPlaneRemoved.delete(key);

                if (distanceToGroundModeType === '1A1B') {
                    groundPoints = [];
                    groundPointCoord = null;
                    planesForGround = [];
                    selectedPlaneForGround = null;

                    if (groundPointSource) {
                        groundPointSource.clear();
                        groundPointFeaturesByCoord.clear();
                        groundPointSource.changed();
                    }

                    if (groundPointLayer) {
                        groundPointLayer.setVisible(false);
                        groundPointLayer.changed();
                    }

                    if (OLMap) {
                        OLMap.renderSync();
                    }
                }
                else if (distanceToGroundModeType === 'nA_nB') {
                    const gpKey = key.split('|')[0];
                    const stillUsed = taPairs.some(p => p.key !== key && p.key.startsWith(gpKey + '|'));
                    if (!stillUsed && groundPointSource) {
                        const featA = groundPointFeaturesByCoord.get(gpKey);
                        if (featA) {
                            groundPointSource.removeFeature(featA);
                            groundPointFeaturesByCoord.delete(gpKey);
                        }
                        const featuresToRemove = [];
                        groundPointSource.forEachFeature(feat => {
                            const geom = feat.getGeometry();
                            if (geom) {
                                const coords = geom.getCoordinates();
                                const lonLat = ol.proj.toLonLat(coords);
                                const candidateKey = `${lonLat[0].toFixed(6)},${lonLat[1].toFixed(6)}`;
                                if (candidateKey === gpKey) {
                                    featuresToRemove.push(feat);
                                }
                            }
                        });
                        featuresToRemove.forEach(feat => groundPointSource.removeFeature(feat));
                        groundPointSource.changed();
                    }

                    taPairs = taPairs.filter(p => p.key !== key);
                    if (groundPointSource && groundPointSource.getFeatures().length === 0) {
                        if (groundPointLayer) {
                            groundPointLayer.setVisible(false);
                            groundPointLayer.changed();
                        }
                    } else if (groundPointLayer && !groundPointLayer.getVisible()) {
                        groundPointLayer.setVisible(true);
                        groundPointLayer.changed();
                    }

                    if (OLMap) {
                        OLMap.renderSync();
                    }
                }
                else if (distanceToGroundModeType === '1A_nB') {
                    planesForGround = planesForGround.filter(h => h !== hex);
                }
                else if (distanceToGroundModeType === 'nA_1B') {
                    planesForGround = [];
                    selectedPlaneForGround = null;
                }

                updateDistanceToGroundOverlay();

                // NUEVO: según el modo, limpiar solo lo necesario (sin tocar el punto base de tierra)
                if (distanceToGroundModeType === 'nA_1B') {
                    removePointNumbers('ta', ['ta_' + key + '_a']);
                    removePlanePoints('ta', ['ta_' + key + '_a']);
                } else if (distanceToGroundModeType === '1A1B') {
                    removePointNumbers('ta', ['ta_' + key + '_g', 'ta_' + key + '_a']);
                    removePlanePoints('ta', ['ta_' + key + '_a']);
                } else {
                    removePointNumbers('ta', ['ta_' + key + '_g', 'ta_' + key + '_a']);
                    removePlanePoints('ta', ['ta_' + key + '_a']);
                }

                if (groundPointLayer) {
                    groundPointLayer.setVisible(true);
                    groundPointLayer.changed();
                }
            });

            ov = new ol.Overlay({
                element: el,
                positioning: 'center-center',
                offset: [0, -10],
                stopEvent: true
            });
            OLMap && OLMap.addOverlay(ov);
            groundPlaneOverlays.set(key, ov);
        }

        const textContainer = ov.getElement().querySelector('.ta-text-content');
        if (textContainer) {
            // textContainer.innerHTML = `Distance: ${slantText}`;
            // let distanceLabel = getTranslatedText('distance_label', 'Distance:');
            // let distanceLabel = getTranslatedText('distance_label', 'Distance:');
            const iconHTML = '⟷';
            const distanceText = showLabelUnits ? slantText : format_distance_brief(slantM, DisplayUnits);

            const plane = g.planes[hex];
            const track = plane ? plane.track : null;
            const trackStr = formatTrackDisplay(track);
            const trackIcon = '✈';

            let angle = null;
            let bearingStr = '---°';

            if (pairFirstType === 'aircraft') {
                const bearingAircraftToGround = bearingFromLonLat(pp, gp);
                bearingStr = formatTrackDisplay(bearingAircraftToGround);
                angle = relativeBearing(plane.track, bearingAircraftToGround);
            } else {
                const bearingGroundToAircraft = bearingFromLonLat(gp, pp);
                bearingStr = formatTrackDisplay(bearingGroundToAircraft);
                angle = relativeBearing(plane.track, bearingGroundToAircraft);
            }

            textContainer.innerHTML = `
                ⟷ ${distanceText} | ✈ ${trackStr}<br>
                ⏱ A → B ${bearingStr} | ∠ ${formatAngle(angle)} 
            `;
        }

        const isHidden = groundPlaneHiddenState.get(key) || false;
        if (isHidden) {
            textContainer.style.display = 'none';
            const toggleIcon = ov.getElement().querySelector('.ta-toggle-btn');
            if (toggleIcon) toggleIcon.className = 'fa-solid fa-eye';
            const feat = groundPlaneFeatures.get(key);
            if (feat) feat.setStyle(new ol.style.Style({}));
        } else {
            textContainer.style.display = 'block';
            const lineFeat = groundPlaneFeatures.get(key);
            if (lineFeat) lineFeat.setStyle(null);
        }

        // Numeración por par usando la key única
        // Determinar el orden de numeración según el modo
        // Numeración por par usando la key única
        // Determinar el orden de numeración según el modo
        // Numeración por par usando la key única.
        // Regla general: el primer punto seleccionado es 1, el segundo es 2.
        let groundNum, planeNum;
        if (distanceToGroundModeType === 'nA_1B') {
            // En nA_1B: si el primer clic fue el avión, el avión es 1 y la tierra es 2.
            // Si el primer clic fue la tierra, la tierra es 1 y el avión es 2.
            const firstWasPlane = (taFirstPointType === 'aircraft');
            groundNum = firstWasPlane ? 2 : 1;
            planeNum = firstWasPlane ? 1 : 2;
        } else if (distanceToGroundModeType === '1A_nB') {
            // En 1A_nB: si el primer clic fue avión, los aviones son 1 y la tierra es 2.
            // Si el primer clic fue tierra, la tierra es 1 y los aviones son 2.
            const firstWasPlane = (taFirstPointType === 'aircraft');
            groundNum = firstWasPlane ? 2 : 1;
            planeNum = firstWasPlane ? 1 : 2;
        } else {
            // 1A1B, nA_nB: usar el tipo del primer punto del par
            const groundIsFirst = (pairFirstType === 'ground');
            groundNum = groundIsFirst ? 1 : 2;
            planeNum = groundIsFirst ? 2 : 1;
        }

        updatePointNumbers('ta', [
            { key: 'ta_' + key + '_g', coord: gp, num: groundNum, isDark: true },
            { key: 'ta_' + key + '_a', coord: pp, num: planeNum, isDark: false }
        ]);

        updatePlanePoints('ta', [
            { key: 'ta_' + key + '_a', coord: pp, hex: hex }
        ]);

        removePlanePoints('ta', ['ta_pending_' + hex]);
        removePointNumbers('ta', ['ta_pending_num_' + hex]);

        ov.setPosition(midProj);
    }

    for (const [k, feat] of groundPlaneFeatures) {
        if (!active.has(k)) {
            groundToPlaneLineSource && groundToPlaneLineSource.removeFeature(feat);
            groundPlaneFeatures.delete(k);
        }
    }

    for (const [k, ov] of groundPlaneOverlays) {
        if (!active.has(k)) {
            OLMap && OLMap.removeOverlay(ov);
            groundPlaneOverlays.delete(k);
        }
    }

    return;

}
// ***********************************************************
// *** FIN FUNCIÓN ACTUALIZAR DISTANCIA TIERRA-AERONAVE ****
// ***********************************************************

// *******************************************************************
// ** INICIO FUNCIÓN ACTUALIZAR PUNTO A EN EL MAPA (TIERRA-AERONAVE)**
// *******************************************************************
function setGroundPoint(lonlat) {
    groundPointCoord = lonlat;

    if (!groundPointSource) {
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
    }

    groundPointSource.clear();
    const f = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)));
    groundPointSource.addFeature(f);

    if (groundPointLayer && OLMap) {
        const exists = OLMap.getLayers().getArray().includes(groundPointLayer);
        if (!exists) OLMap.addLayer(groundPointLayer);
    }

    if (groundPointLayer) groundPointLayer.setVisible(true);

}
// *******************************************************************
// *** FIN FUNCIÓN ACTUALIZAR PUNTO A EN EL MAPA (TIERRA-AERONAVE)****
// *******************************************************************

// ************************************************************************
// ** INICIO FUNCIÓN LIMPIAR PUNTOS, LÍNEAS Y OVERLAYS (TIERRA-AERONAVE) **
// ************************************************************************
function clearTAGroundDrawings(opts = {}) {

    if (groundPlaneHiddenState) {
        groundPlaneHiddenState.clear();
    }

    try { groundPointSource && groundPointSource.clear() } catch (_) { }

    try { groundPointFeaturesByCoord && groundPointFeaturesByCoord.clear() } catch (_) { }

    try { groundToPlaneLineSource && groundToPlaneLineSource.clear() } catch (_) { }

    try {
        if (typeof planePointSourceTA !== 'undefined' && planePointSourceTA) {
            planePointSourceTA.clear();
        }
    } catch (_) { }

    groundToPlaneLineFeature = null;

    if (groundPlaneOverlays && groundPlaneOverlays.size) {
        groundPlaneOverlays.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
        groundPlaneOverlays.clear();
    }
    if (typeof groundPlaneOverlaysByHex !== 'undefined' && groundPlaneOverlaysByHex.size) {
        groundPlaneOverlaysByHex.forEach(ov => { try { OLMap && OLMap.removeOverlay(ov); } catch (_) { } });
        groundPlaneOverlaysByHex.clear();
    }

    if (distanceGroundOverlay) {
        try { distanceGroundOverlay.setPosition(undefined); } catch (_) { }
        try { OLMap && OLMap.removeOverlay(distanceGroundOverlay); } catch (_) { }
        distanceGroundOverlay = null;
    }

    try { groundPlaneFeatures && groundPlaneFeatures.clear(); } catch (_) { }
    try { typeof groundPlaneFeaturesByHex !== 'undefined' && groundPlaneFeaturesByHex.clear(); } catch (_) { }

    if (opts.reset !== false) {
        selectedPlaneForGround = null;
        groundPointCoord = null;
        groundPoints = [];
        planesForGround = [];
        taPairs = [];
        taPendingPlaneHex = null;
        taPendingGround = null;
        taFirstPointType = null;
        clearPointNumbers('ta');
        try { groundPlaneMissingSince && groundPlaneMissingSince.clear(); } catch (_) { }
        try { groundPlaneRemoved && groundPlaneRemoved.clear(); } catch (_) { }
    }

    try { clearPointNumbers('ta'); } catch (_) { }
    try { clearPlanePoints('ta'); } catch (_) { }

    if (distanceGroundUpdateInterval) {
        clearInterval(distanceGroundUpdateInterval);
        distanceGroundUpdateInterval = null;
    }
}
// ************************************************************************
// *** FIN FUNCIÓN LIMPIAR PUNTOS, LÍNEAS Y OVERLAYS (TIERRA-AERONAVE) ****
// ************************************************************************

// ***********************************************************
// *** INICIO FUNCIÓN ACTIVAR/DESACTIVAR TIERRA-AERONAVE *****
// ***********************************************************
function DistanceToGround() {
    distanceToGroundMode = !distanceToGroundMode;

    if (distanceToGroundMode) {
        if (distanceBetweenPlanesMode) {
            distanceBetweenPlanesMode = false;
            resetDistanceCalculation();
            buttonActive('#D', false);
        }
        if (groundToGroundMode) {
            groundToGroundMode = false;
            clearGroundToGround();
            hideDistanceGuide();
            buttonActive('#TT', false);
        }
        clearTAGroundDrawings();

        if (!groundPointSource) groundPointSource = new ol.source.Vector();
        if (groundPointLayer) {
            groundPointLayer.setSource(groundPointSource);
            groundPointLayer.setVisible(true);
        }

        if (!groundToPlaneLineSource) groundToPlaneLineSource = new ol.source.Vector();
        if (groundToPlaneLineLayer) {
            groundToPlaneLineLayer.setSource(groundToPlaneLineSource);
            groundToPlaneLineLayer.setVisible(true);
        }

        showDistanceGuide(() => `<center>${taPreMessage()}</center><br><center>${taStep1Message()}</center>`);

        distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);

        buttonActive('#TA', true);
    } else {
        clearTAGroundDrawings();
        hideDistanceGuide();
        buttonActive('#TA', false);
    }
}
// ***********************************************************
// ***** FIN FUNCIÓN ACTIVAR/DESACTIVAR TIERRA-AERONAVE ******
// ***********************************************************

// ************************************************************************
// ****** INICIO FUNCIÓN CICLAR MODO SEGÚN CLICK (TIERRA-AERONAVE) ********
// ************************************************************************
function onTACycleClick() {
    if (!distanceToGroundMode) {
        distanceToGroundModeType = TA_MODES[0];
        DistanceToGround();
        if (groundToGroundMode) DistanceGroundToGround();
        return;
    }

    const idx = TA_MODES.indexOf(distanceToGroundModeType);

    if (idx >= 0 && idx < TA_MODES.length - 1) {
        distanceToGroundModeType = TA_MODES[idx + 1];
        clearTAGroundDrawings();
        showDistanceGuide(() => `<center>${taPreMessage()}</center><br><center>${taStep1Message()}</center>`);
        updateDistanceToGroundOverlay();
    } else {
        DistanceToGround();
    }
}
// ************************************************************************
// ******** FIN FUNCIÓN CICLAR MODO SEGÚN CLICK (TIERRA-AERONAVE) *********
// ************************************************************************

// *******************************************************************
// *************** INICIO TOOLTIPS (TIERRA-AERONAVE)******************
// *******************************************************************
function taStep1Message() {
    let msg = 'Click on the map or an aircraft to mark the first point.';
    switch (distanceToGroundModeType) {
        case '1A1B':
            msg = getTranslatedText('ta_click_first_point', 'Click on the map or an aircraft to mark the first point.');
            break;
        case '1A_nB':
            msg = getTranslatedText('ta_click_first_point_single', 'Click on the map to mark a single point. <br> Or, Click on multiple aircraft to mark multiple points.');
            break;
        case 'nA_1B':
            msg = getTranslatedText('ta_click_multiple_points_a', 'Click on the map to mark multiple points.');
            break;
        case 'nA_nB':
            msg = getTranslatedText('ta_click_first_point', 'Click on the map or an aircraft to mark the first point.');
            break;
        default:
            msg = getTranslatedText('ta_click_first_point', 'Click on the map or an aircraft to mark the first point.');
            break;
    }
    return msg;
}

function taStep2Message() {
    let msg = 'Now click on the other element (map or aircraft).';
    switch (distanceToGroundModeType) {
        case '1A1B':
            msg = getTranslatedText('ta_click_second_point', 'Now click on the other element (ground or aircraft).');
            break;
        case '1A_nB':
            // 1A_nB: 1 tierra (A) + múltiples aviones (B)
            if (taFirstPointType === 'aircraft') {
                // Primero se tocaron las aeronaves → ahora falta la tierra
                msg = getTranslatedText(
                    'ta_1A_nB_aircraft_first_step2',
                    'Now click on the map to complete the pairs with each aircraft.'
                );
            } else {
                // Primero se tocó el mapa (tierra) → ahora faltan las aeronaves
                msg = getTranslatedText(
                    'ta_1A_nB_ground_first_step2',
                    'Now click on as many aircraft as you want to create pairs with the point on the map.'
                );
            }
            break;
        case 'nA_1B':
            // nA_1B: múltiples tierras (A) + 1 avión (B)
            if (taFirstPointType === 'aircraft') {
                // Primero se tocó la aeronave → ahora faltan los puntos en el mapa
                msg = getTranslatedText(
                    'ta_nA_1B_aircraft_first_step2',
                    'Now click on as many points on the map as you want to create pairs with the aircraft.'
                );
            } else {
                // Primero se tocaron los puntos en el mapa → ahora falta la aeronave
                msg = getTranslatedText(
                    'ta_nA_1B_ground_first_step2',
                    'Now click on the aircraft you want to complete the pairs with each point on the map.'
                );
            }
            break;
        case 'nA_nB':
            msg = getTranslatedText('ta_click_second_point', 'Now click on the other element (ground or aircraft).');
            break;
        default:
            msg = getTranslatedText('ta_click_second_point', 'Now click on the other element (ground or aircraft).');
            break;
    }
    return msg;
}

function taPreMessage() {
    switch (distanceToGroundModeType) {
        case '1A1B':
            return getTranslatedText('ta_1_point_1_aircraft', '1 Point - 1 Aircraft Mode');
        case '1A_nB':
            return getTranslatedText('ta_1_point_multiple_aircraft', '1 Point - Multiple Aircraft Mode');
        case 'nA_1B':
            return getTranslatedText('ta_multiple_points_1_aircraft', 'Multiple Points - 1 Aircraft Mode');
        case 'nA_nB':
            return getTranslatedText('ta_multiple_points_multiple_aircraft', 'Multiple Points - Multiple Aircraft Mode');
        default:
            return '';
    }
}
// *******************************************************************
// ***************** FIN TOOLTIPS (TIERRA-AERONAVE)*******************
// *******************************************************************

// ============================================================
// HANDLER DE CLICK - MODO DISTANCIA TIERRA-AERONAVE
// Llamado desde OLMap.on(['singleclick','dblclick']) en script_*.js
// cuando distanceToGroundMode === true.
// ============================================================
function handleDistanceToGroundClick(evt, planeHex) {
    const evtCoords = evt.map.getCoordinateFromPixel(evt.pixel);

    // === DETECTAR ESTADO ACTUAL ===
    const hasGround = groundPoints.length > 0 || groundPointCoord !== null;
    const hasPlane = planesForGround.length > 0;
    const hasPendingGround = taPendingGround !== null;
    const hasPendingPlane = taPendingPlaneHex !== null;

    // === DETECTAR EL TIPO DEL PRIMER PUNTO (solo si aún no hay ninguno) ===
    if (!hasGround && !hasPlane && !hasPendingGround && !hasPendingPlane) {
        taFirstPointType = planeHex ? 'aircraft' : 'ground';
        if (distanceToGroundModeType === '1A1B') {
            clearPointNumbers('ta');
        }
    }

    // En 1A_nB, si ya hay aviones seleccionados pero todavía no hay tierra,
    // taFirstPointType ya debería estar en 'aircraft' desde el primer clic.
    // Si por alguna razón quedó null pero hay aviones, corregirlo.
    if (distanceToGroundModeType === '1A_nB' &&
        planesForGround.length > 0 &&
        taFirstPointType == null) {
        taFirstPointType = 'aircraft';
    }

    // === VALIDAR SEGUNDO CLIC SEGÚN EL PRIMER PUNTO ===
    // Solo validar si YA existe un primer punto (no si estamos empezando)
    const hasFirstPoint = hasGround || hasPlane || hasPendingGround || hasPendingPlane;

    // La validación "segundo debe ser opuesto" solo aplica en 1A1B y nA_nB
    if (hasFirstPoint &&
        (distanceToGroundModeType === '1A1B' || distanceToGroundModeType === 'nA_nB')) {
        if (taFirstPointType === 'aircraft' && planeHex) {
            showDistanceGuide(() => getTranslatedText(
                'second_must_be_ground',
                'The first point was an aircraft. The second must be a ground point.'
            ));
            return;
        }
        if (taFirstPointType === 'ground' && !planeHex) {
            showDistanceGuide(() => getTranslatedText(
                'second_must_be_aircraft',
                'The first point was a ground point. The second must be an aircraft.'
            ));
            return;
        }
    }

    // === CLIC SOBRE UN AVIÓN ===
    if (planeHex) {
        const p = g.planes[planeHex];
        if (!p || !p.position || p.seen > 15) {
            showDistanceGuide(() => getTranslatedText(
                'distance_invalid_aircraft',
                'Please select a valid aircraft with position.'
            ));
            return;
        }

        if (distanceToGroundModeType === 'nA_nB') {
            if (taPendingGround) {
                const lonlat = taPendingGround;
                taPendingGround = null;
                const key = `${lonlat[0].toFixed(6)},${lonlat[1].toFixed(6)}|${planeHex}`;
                taPairs.push({
                    hex: planeHex,
                    gp: lonlat,
                    key,
                    firstPointType: 'ground'  // NUEVO: el primer punto fue tierra
                });
                // No volver a agregar el punto tierra (ya se agregó en el primer clic)
                hideDistanceGuide();
                taFirstPointType = null; // RESET para permitir nuevo par

                removePlanePoints('ta', ['ta_pending_' + planeHex]);
                removePointNumbers('ta', ['ta_pending_num_' + planeHex]);
            } else if (!hasPlane) {
                // No hay nada pendiente: este avión será el primer punto
                taPendingPlaneHex = planeHex;
                showDistanceGuide(() => getTranslatedText(
                    'ta_click_second_point',
                    'Now click on the other element (ground or aircraft).'
                ));

                updatePlanePoints('ta', [
                    { key: 'ta_pending_' + planeHex, coord: p.position, hex: planeHex }
                ]);
                updatePointNumbers('ta', [
                    { key: 'ta_pending_num_' + planeHex, coord: p.position, num: 1, isDark: false }
                ]);
            }
        } else if (distanceToGroundModeType === '1A_nB') {
            // En 1A_nB, el primer punto (sea tierra o avión) es 1.
            // Los aviones tocados antes de la tierra se marcan como 1.
            // Si ya hay tierra seleccionada, los aviones son 2.
            const firstWasGround = (taFirstPointType === 'ground');
            const planeNum = firstWasGround ? 2 : 1;

            if (!planesForGround.includes(planeHex)) {
                planesForGround.push(planeHex);

                // Marcar el punto del avión inmediatamente
                updatePlanePoints('ta', [
                    { key: 'ta_pending_' + planeHex, coord: p.position, hex: planeHex }
                ]);
                updatePointNumbers('ta', [
                    { key: 'ta_pending_num_' + planeHex, coord: p.position, num: planeNum, isDark: false }
                ]);
            } else {
                // Si el avión ya estaba seleccionado (por ejemplo, porque el usuario
                // cambió la tierra y se re-numeran los pares), actualizar su número.
                updatePointNumbers('ta', [
                    { key: 'ta_pending_num_' + planeHex, coord: p.position, num: planeNum, isDark: false }
                ]);
            }

            // Mostrar el paso 2 correcto según el primer punto
            if (!firstWasGround) {
                // Los aviones fueron primero → ahora pedir el punto en el mapa
                showDistanceGuide(() => taStep2Message());
            } else {
                // Ya había tierra → el par está completo con este avión
                hideDistanceGuide();
            }
            // NO resetear taFirstPointType: el overlay lo necesita para numerar.
        } else if (distanceToGroundModeType === 'nA_1B') {
            // Si el usuario toca el avión como PRIMER punto, el avión es 1.
            // Si ya hay tierras seleccionadas, el avión es 2.
            const firstWasPlane = (taFirstPointType === 'aircraft');
            const planeNum = firstWasPlane ? 1 : 2;

            planesForGround = [planeHex];

            // Marcar el punto del avión inmediatamente
            updatePlanePoints('ta', [
                { key: 'ta_pending_' + planeHex, coord: p.position, hex: planeHex }
            ]);
            updatePointNumbers('ta', [
                { key: 'ta_pending_num_' + planeHex, coord: p.position, num: planeNum, isDark: false }
            ]);

            // Mostrar el paso 2 correcto según el primer punto
            if (firstWasPlane) {
                // El avión fue primero → ahora pedir puntos del mapa
                showDistanceGuide(() => taStep2Message());
            } else {
                // Ya había tierras → el par está completo con este avión
                hideDistanceGuide();
            }
            // NO resetear taFirstPointType aquí: updateDistanceToGroundOverlay
            // lo necesita para numerar correctamente.
        } else {
            // Modo 1A1B
            if (hasGround) {
                // Primer clic fue tierra → este avión completa el par
                // NUEVO: si ya había un avión seleccionado (por ejemplo porque el usuario
                // está cambiando de avión B), limpiar su número y su punto primero
                if (hasPlane) {
                    // Limpiar TODA la numeración y puntos de aviones previos en 1A1B
                    clearPointNumbers('ta');
                    clearPlanePoints('ta');
                }
                planesForGround = [planeHex];
                selectedPlaneForGround = p;
                hideDistanceGuide();
            } else if (!hasPlane) {
                // No hay nada pendiente: este avión será el primer punto
                planesForGround = [planeHex];
                selectedPlaneForGround = p;
                hideDistanceGuide();
                showDistanceGuide(() => getTranslatedText(
                    'ta_click_second_point',
                    'Now click on the other element (ground or aircraft).'
                ));
                updatePlanePoints('ta', [
                    { key: 'ta_pending_' + planeHex, coord: p.position, hex: planeHex }
                ]);
                updatePointNumbers('ta', [
                    { key: 'ta_pending_num_' + planeHex, coord: p.position, num: 1, isDark: false }
                ]);
            }
        }
    }
    // === CLIC SOBRE EL MAPA (TIERRA) ===
    else {
        const lonlat = ol.proj.toLonLat(evtCoords);

        if (distanceToGroundModeType === 'nA_nB') {
            if (taPendingPlaneHex) {
                const hex = taPendingPlaneHex;
                taPendingPlaneHex = null;
                const key = `${lonlat[0].toFixed(6)},${lonlat[1].toFixed(6)}|${hex}`;
                taPairs.push({
                    hex,
                    gp: lonlat,
                    key,
                    firstPointType: 'aircraft'  // NUEVO: el primer punto fue avión
                });
                if (groundPointSource) {
                    groundPointSource.addFeature(
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                    );
                }
                hideDistanceGuide();
                taFirstPointType = null; // RESET

                removePlanePoints('ta', ['ta_pending_' + hex]);
                removePointNumbers('ta', ['ta_pending_num_' + hex]);
            } else if (!hasPendingGround) {
                // No hay nada pendiente: esta tierra será el primer punto
                taPendingGround = lonlat;
                if (groundPointSource) {
                    const featA = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)));
                    groundPointSource.addFeature(featA);
                    const gpKey = `${lonlat[0].toFixed(6)},${lonlat[1].toFixed(6)}`;
                    groundPointFeaturesByCoord.set(gpKey, featA);
                }
                showDistanceGuide(() => getTranslatedText(
                    'ta_click_second_point',
                    'Now click on the other element (ground or aircraft).'
                ));
            }
        } else if (distanceToGroundModeType === 'nA_1B') {
            if (!groundPoints.some(pt =>
                Math.abs(pt[0] - lonlat[0]) < 1e-6 && Math.abs(pt[1] - lonlat[1]) < 1e-6)) {
                groundPoints.push(lonlat);
                if (groundPointSource) {
                    groundPointSource.addFeature(
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                    );
                }
            }
            // Mostrar el paso 2 correcto según el primer punto seleccionado
            showDistanceGuide(() => taStep2Message());
        } else if (distanceToGroundModeType === '1A_nB') {
            // 1A_nB: la tierra es el punto único (A).
            // Si aún no hay tierra, esta es la primera → será 1 (o 2 si los
            // aviones fueron primero, pero eso se calcula en el overlay).
            if (!hasGround) {
                groundPoints = [lonlat];
                groundPointCoord = lonlat;
                if (groundPointSource) {
                    groundPointSource.clear();
                    groundPointSource.addFeature(
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                    );
                }
                hideDistanceGuide();
            } else {
                // Ya había tierra: reemplazarla (1A_nB solo admite una).
                groundPoints = [lonlat];
                groundPointCoord = lonlat;
                if (groundPointSource) {
                    groundPointSource.clear();
                    groundPointSource.addFeature(
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                    );
                }
                hideDistanceGuide();
            }
        } else {
            // Modo 1A1B
            if (hasPlane) {
                // Primer clic fue avión → esta tierra completa el par
                groundPoints = [lonlat];
                groundPointCoord = lonlat;
                if (groundPointSource) {
                    groundPointSource.clear();
                    groundPointSource.addFeature(
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                    );
                }
                hideDistanceGuide();
                // RESET para permitir nuevo par
                // No resetear planesForGround aún (se necesita para el dibujo).
                // Se reseteará al inicio del próximo clic.
            } else if (!hasGround) {
                // No hay nada pendiente: esta tierra será el primer punto
                groundPoints = [lonlat];
                groundPointCoord = lonlat;
                if (groundPointSource) {
                    groundPointSource.clear();
                    groundPointSource.addFeature(
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(lonlat)))
                    );
                }
                showDistanceGuide(() => getTranslatedText(
                    'ta_click_second_point',
                    'Now click on the other element (ground or aircraft).'
                ));
            }
        }
    }

    updateDistanceToGroundOverlay();
    if (!distanceGroundUpdateInterval) {
        distanceGroundUpdateInterval = setInterval(updateDistanceToGroundOverlay, 1000);
    }
}

window.clearTAGroundDrawings = clearTAGroundDrawings;
window.updateDistanceToGroundOverlay = updateDistanceToGroundOverlay;
window.DistanceToGround = DistanceToGround;
window.onTACycleClick = onTACycleClick;
window.handleDistanceToGroundClick = handleDistanceToGroundClick;