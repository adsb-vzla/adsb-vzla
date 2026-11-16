// ***** AERONAVE-AERONAVE *****
// ***********************************************************
function getAircraftAltitudeDifferenceText(plane1, plane2) {
    const plane1OnGround = plane1.altitude === 'ground';
    const plane2OnGround = plane2.altitude === 'ground';

    if (plane1OnGround && plane2OnGround) {
        return getTranslatedText('both_aircraft_on_ground', 'Both aircraft are on the ground.');
    }
    if (plane1OnGround || plane2OnGround) {
        return getTranslatedText('aircraft_on_ground', 'One aircraft is on the ground.');
    }

    const altDiff = Math.abs(plane1.altitude - plane2.altitude);
    const altValue = Math.round(convert_altitude(altDiff, DisplayUnits));
    const altUnit = showLabelUnits ? NNBSP + get_unit_label("altitude", DisplayUnits) : '';
    return altValue + altUnit;
}

// ** INICIO FUNCIÓN ACTUALIZAR DISTANCIA AERONAVE-AERONAVE **
// ***********************************************************
function updateDistanceLine() {
    if (!distanceBetweenPlanesMode) return;
    if (distanceLineLayer && !distanceLineLayer.getVisible()) {
        if (distanceOverlay) distanceOverlay.setPosition(undefined);
        if (distanceOverlaysMap) {
            distanceOverlaysMap.forEach(overlay => overlay.setPosition(undefined));
        }
        return;
    }

    if (planeDistanceModeType === '1A1B') {
        if (selectedPlanesForDistance.length !== 2) return;

        if (!distanceOverlay) {
            let element = document.createElement('div');
            element.id = 'distance-label-tag';
            element.style.background = 'rgba(0,0,0,0.4)';
            // element.style.border = '1px solid black';
            element.style.padding = '5px';
            element.style.fontSize = '12px';
            element.style.fontWeight = '600'
            element.style.textShadow = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000';
            element.style.color = 'white';
            element.style.pointerEvents = 'auto';
            element.style.borderRadius = '4px';
            enableOverlayFocus(element);

            element.innerHTML = `
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; padding-bottom: 2px;">
                    <i id="dist-toggle-btn" class="fa-solid fa-eye-slash" style="cursor: pointer; color: white;"></i>
                    <i id="dist-close-btn" class="fa-solid fa-xmark" style="cursor: pointer; color: #c00;"></i>
                </div>
                <div id="dist-text-content"></div>
            `;

            distanceOverlay = new ol.Overlay({
                element: element,
                positioning: 'bottom-center',
                offset: [0, -10],
                stopEvent: true
            });
            OLMap.addOverlay(distanceOverlay);

            document.getElementById('dist-toggle-btn').addEventListener('click', function (e) {
                e.stopPropagation();
                distance1A1BHidden = !distance1A1BHidden;

                let textContent = document.getElementById('dist-text-content');

                if (distance1A1BHidden) {
                    textContent.style.display = 'none';
                    this.className = 'fa-solid fa-eye';
                    if (distanceLineFeature) distanceLineFeature.setStyle(new ol.style.Style({}));
                } else {
                    textContent.style.display = 'block';
                    this.className = 'fa-solid fa-eye-slash';
                    if (distanceLineFeature) distanceLineFeature.setStyle(null);
                }
            });
            document.getElementById('dist-close-btn').addEventListener('click', function (e) {
                e.stopPropagation();
                resetDistanceCalculation();
            });
        }

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

            let textContainer = document.getElementById('dist-text-content');

            if (textContainer) {
                // textContainer.innerHTML = `<b style="color:red;">SIGNAL LOST</b><br>Retrying... ${Math.ceil(15 - secondsMissing)}s`;
                let signalLost = getTranslatedText('signal_lost', 'SIGNAL LOST');
                let retrying = getTranslatedText('retrying', 'Retrying...');
                textContainer.innerHTML = `<b style="color:red;">${signalLost}</b><br>${retrying} ${Math.ceil(15 - secondsMissing)}s`;
            }
            if (secondsMissing >= 15) {
                // For single-pair mode, reset everything; for multi, mark removed
                if (planeDistanceModeType === '1A1B') {
                    ppMissingSince.delete(key);
                    showDistanceGuide(() => `<center>${getTranslatedText(
                        'pair_reset_missing_aircraft',
                        'The pair was reset because an aircraft lost its position. Select an aircraft with a valid position.'
                    )}</center>`);
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

        // planesMissingSince = null;
        ppMissingSince.delete(key);
        ppRemoved.delete(key);

        let coords1 = plane1.position;
        let coords2 = plane2.position;

        let distance = haversineDistance(coords1[1], coords1[0], coords2[1], coords2[0]);
        let lineCoords = [ol.proj.fromLonLat(coords1), ol.proj.fromLonLat(coords2)];
        if (!distanceLineFeature) {
            distanceLineFeature = new ol.Feature({
                geometry: new ol.geom.LineString(lineCoords)
            });
            distanceLineLayer.getSource().addFeature(distanceLineFeature);
        } else {
            distanceLineFeature.getGeometry().setCoordinates(lineCoords);
        }

        if (distance1A1BHidden) {
            distanceLineFeature.setStyle(new ol.style.Style({}));
        } else {
            distanceLineFeature.setStyle(null);
        }

        let midPoint = [(coords1[0] + coords2[0]) / 2, (coords1[1] + coords2[1]) / 2];
        let midPointProj = ol.proj.fromLonLat(midPoint);

        let textContainer = document.getElementById('dist-text-content');
        if (textContainer) {
            // let distLabel = getTranslatedText('dist_label', 'Dist:');
            const distIconHTML = '⟷';
            const altDiffIconHTML = '↕';
            // let altDiffLabel = getTranslatedText('alt_diff_label', 'Alt Diff:');
            const distM = distance * 1852;
            // const distText = format_distance_long(distM, DisplayUnits).replace(/nmi?/i, 'NM');
            // const altText = Math.round(convert_altitude(altDiff, DisplayUnits)) + NNBSP + get_unit_label("altitude", DisplayUnits);
            const distText = showLabelUnits ? format_distance_long(distM, DisplayUnits).replace(/nmi?/i, 'NM') : format_distance_brief(distM, DisplayUnits);
            const altText = getAircraftAltitudeDifferenceText(plane1, plane2);

            // --- OBTENER RUMBOS ---
            const track1 = plane1.track;
            const track2 = plane2.track;
            const track1Str = formatTrackDisplay(track1);
            const track2Str = formatTrackDisplay(track2);

            const trackIcon1 = '✈ A';
            const trackIcon2 = '✈ B';
            const trackIcon3 = '✈ A - B';

            // Calcular la diferencia de rumbo
            let trackDiffStr = '---°';
            if (track1 !== null && track1 !== undefined && !isNaN(track1) &&
                track2 !== null && track2 !== undefined && !isNaN(track2)) {
                let trackDiff = Math.abs(track1 - track2);
                trackDiff = trackDiff % 360;
                if (trackDiff > 180) {
                    trackDiff = 360 - trackDiff;
                }
                trackDiffStr = `${trackDiff.toFixed(1)}°`;
            }

            const bearingAToB = bearingFromLonLat(coords1, coords2);
            const angle = relativePositionAngle(bearingAToB, plane1.track);

            // textContainer.innerHTML = `
            //     ⟷ ${distText} | ↕ ${altText}<br>
            //     ✈ A ${track1Str} | ✈ B ${track2Str} | ✈ A - B ${trackDiffStr}<br>
            //     ⏱ B respecto a A: ${formatRelativePosition(angle)}
            // `;

            textContainer.innerHTML = `
                ⟷ ${distText} | ↕ ${altText} | ⏱ ${formatRelativePosition(angle)}
            `;

        }

        updatePlanePoints('aa', [
            { key: 'aa_single_1', coord: coords1, hex: p1.hex },
            { key: 'aa_single_2', coord: coords2, hex: p2.hex }
        ], true);

        updatePointNumbers('aa', [
            { key: 'aa_' + key + '_1', coord: coords1, num: 'A', isDark: false },
            { key: 'aa_' + key + '_2', coord: coords2, num: 'B', isDark: false }
        ]);

        distanceOverlay.setPosition(midPointProj);

        return;
    }

    // Modo 1A_nB: un avión A contra varios B
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

            if (isStale && selectedPlaneA === hexA) {
                removePointNumbers('aa', ['aa_anchor_' + hexA]);
                removePlanePoints('aa', ['aa_anchor_' + hexA]);
                removePlanePoints('aa', ['aa_anchor_' + hexA]);
                selectedPlaneA = null;
                // Mostrar mensaje de anchor disabled
                showDistanceGuide(() => getTranslatedText('anchor_disabled', 'Anchor disabled.'));

                // Eliminar todos los pares que usen este ancla
                const keysToRemove = [];
                for (const [k, v] of pairMap) {
                    if (v.a === hexA) {
                        keysToRemove.push(k);
                    }
                }

                for (const k of keysToRemove) {
                    removePointNumbers('aa', [
                        'aa_' + k + '_1',
                        'aa_' + k + '_2'
                    ]);

                    removePlanePoints('aa', [
                        'aa_' + k + '_1',
                        'aa_' + k + '_2'
                    ]);
                    pairMap.delete(k);
                    pairOrder = pairOrder.filter(po => po !== k);
                    // Eliminar líneas y overlays de estos pares
                    const feat = distanceLineFeaturesMap.get(k);
                    if (feat) {
                        distanceLineLayer.getSource().removeFeature(feat);
                        distanceLineFeaturesMap.delete(k);
                    }
                    const ov = distanceOverlaysMap.get(k);
                    if (ov) {
                        OLMap && OLMap.removeOverlay(ov);
                        distanceOverlaysMap.delete(k);
                    }
                    pairHiddenState.delete(k);
                }
                // Si no hay más pares, resetear el buffer
                if (pairMap.size === 0) {
                    pairBuffer = [];
                }

                selectedPlaneA = null;
                pairBuffer = [];
                continue;
            }

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
                    el.id = `distance-label-${key.replace(/\|/g, '_')}`;
                    el.style.background = 'rgba(0,0,0,0.4)';
                    // el.style.border = '1px solid black';
                    el.style.padding = '5px';
                    el.style.fontSize = '12px';
                    el.style.fontWeight = '600'
                    el.style.textShadow = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000';
                    el.style.color = 'white';
                    el.style.pointerEvents = 'auto';
                    el.style.borderRadius = '4px';
                    enableOverlayFocus(el);
                    el.innerHTML = `
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; padding-bottom: 2px;">
                        <i class="fa-solid fa-eye-slash pair-toggle-btn" style="cursor: pointer; color: white;"></i>
                        <i class="fa-solid fa-xmark pair-close-btn" style="cursor: pointer; color: #c00;"></i>
                    </div>
                    <div class="pair-text-content"></div>
                `;

                    if (!pairHiddenState.has(key)) pairHiddenState.set(key, false);

                    const toggleBtn = el.querySelector('.pair-toggle-btn');
                    const closeBtn = el.querySelector('.pair-close-btn');
                    const textContent = el.querySelector('.pair-text-content');

                    toggleBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const currentHidden = pairHiddenState.get(key) || false;
                        const newHidden = !currentHidden;
                        pairHiddenState.set(key, newHidden);

                        if (newHidden) {
                            textContent.style.display = 'none';
                            toggleBtn.className = 'fa-solid fa-eye';
                            const feat = distanceLineFeaturesMap.get(key);
                            if (feat) feat.setStyle(new ol.style.Style({}));
                        } else {
                            textContent.style.display = 'block';
                            toggleBtn.className = 'fa-solid fa-eye-slash';
                            const feat = distanceLineFeaturesMap.get(key);
                            if (feat) feat.setStyle(null);
                        }
                    });

                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Eliminar el par permanentemente
                        const feat = distanceLineFeaturesMap.get(key);
                        if (feat) {
                            distanceLineLayer.getSource().removeFeature(feat);
                            distanceLineFeaturesMap.delete(key);
                        }
                        if (ov) OLMap && OLMap.removeOverlay(ov);
                        distanceOverlaysMap.delete(key);
                        pairHiddenState.delete(key);
                        removePointNumbers('aa', [
                            'aa_' + key + '_1',
                            'aa_' + key + '_2'
                        ]);

                        removePlanePoints('aa', [
                            'aa_' + key + '_1',
                            'aa_' + key + '_2'
                        ]);
                        pairMap.delete(key);
                        pairOrder = pairOrder.filter(k => k !== key);
                        // Limpiar del buffer si estaba pendiente
                        // NUEVO: guardar el anchor que podría quedar huérfano ANTES de resetearlo
                        const anchorToCheck = selectedPlaneA;

                        if (selectedPlaneA === hexA || selectedPlaneA === hexB) selectedPlaneA = null;
                        selectedPlanesForDistance = selectedPlanesForDistance.filter(p => p.hex !== hexA && p.hex !== hexB);

                        removePointNumbers('aa', ['aa_' + key + '_1', 'aa_' + key + '_2']);
                        removePlanePoints('aa', ['aa_' + key + '_1', 'aa_' + key + '_2']);

                        // Si el anchor ya no tiene más pares, eliminar su punto y resetearlo
                        if (anchorToCheck) {
                            const stillUsedAsAnchor = Array.from(pairMap.values()).some(v => v.a === anchorToCheck);
                            if (!stillUsedAsAnchor) {
                                removePlanePoints('aa', ['aa_anchor_' + anchorToCheck]);
                                if (selectedPlaneA === anchorToCheck) selectedPlaneA = null;
                            }
                        }
                        cleanupUnusedAnchorPoints();

                        if (typeof InstrumentedAircraft !== 'undefined') {
                            InstrumentedAircraft.unregister(hexA);
                            InstrumentedAircraft.unregister(hexB);
                        }
                    });

                    ov = new ol.Overlay({ element: el, positioning: 'bottom-center', offset: [0, -10], stopEvent: true });
                    OLMap && OLMap.addOverlay(ov);
                    distanceOverlaysMap.set(key, ov);
                }

                const textContainer = ov.getElement().querySelector('.pair-text-content');
                if (textContainer) {
                    // textContainer.innerHTML = `<b style="color:red;">SIGNAL LOST</b><br>Retrying... ${remaining}s`;
                    let signalLost = getTranslatedText('signal_lost', 'SIGNAL LOST');
                    let retrying = getTranslatedText('retrying', 'Retrying...');
                    textContainer.innerHTML = `<b style="color:red;">${signalLost}</b><br>${retrying} ${remaining}s`;
                }

                // Posicionar el overlay donde sea posible
                let overlayPos = null;
                if (planeA && planeA.position) {
                    overlayPos = ol.proj.fromLonLat(planeA.position);
                } else if (planeB && planeB.position) {
                    overlayPos = ol.proj.fromLonLat(planeB.position);
                }
                if (overlayPos) ov.setPosition(overlayPos);

                const isHidden = pairHiddenState.get(key) || false;
                if (isHidden && textContainer) textContainer.style.display = 'none';

                if (secondsMissing >= 15) {
                    removePointNumbers('aa', [
                        'aa_' + key + '_1',
                        'aa_' + key + '_2'
                    ]);

                    removePlanePoints('aa', [
                        'aa_' + key + '_1',
                        'aa_' + key + '_2'
                    ]);
                    ppMissingSince.delete(key);
                    ppRemoved.add(key);
                    const feat = distanceLineFeaturesMap.get(key);
                    if (feat) {
                        distanceLineLayer.getSource().removeFeature(feat);
                        distanceLineFeaturesMap.delete(key);
                    }
                    OLMap && ov && OLMap.removeOverlay(ov);
                    distanceOverlaysMap.delete(key);
                    pairHiddenState.delete(key);
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
            const lineCoords = [ol.proj.fromLonLat(coordsA), ol.proj.fromLonLat(coordsB)];
            let feat = distanceLineFeaturesMap.get(key);
            if (!feat) {
                feat = new ol.Feature({ geometry: new ol.geom.LineString(lineCoords) });
                distanceLineLayer.getSource().addFeature(feat);
                distanceLineFeaturesMap.set(key, feat);
            } else {
                feat.getGeometry().setCoordinates(lineCoords);
            }

            // Aplicar estado de oculto a la línea
            const isHidden = pairHiddenState.get(key) || false;
            if (isHidden) {
                feat.setStyle(new ol.style.Style({}));
            } else {
                feat.setStyle(null);
            }

            let ov = distanceOverlaysMap.get(key);
            if (!ov) {
                const el = document.createElement('div');
                el.id = `distance-label-${key.replace(/\|/g, '_')}`;
                el.style.background = 'rgba(0,0,0,0.4)';
                // el.style.border = '1px solid black';
                el.style.padding = '5px';
                el.style.fontSize = '12px';
                el.style.fontWeight = '600'
                el.style.textShadow = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000';
                el.style.color = 'white';
                el.style.pointerEvents = 'auto';
                el.style.borderRadius = '4px';
                enableOverlayFocus(el);
                el.innerHTML = `
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 4px; padding-bottom: 2px;">
                    <i class="fa-solid fa-eye-slash pair-toggle-btn" style="cursor: pointer; color: white;"></i>
                    <i class="fa-solid fa-xmark pair-close-btn" style="cursor: pointer; color: #c00;"></i>
                </div>
                <div class="pair-text-content"></div>
            `;
                if (!pairHiddenState.has(key)) pairHiddenState.set(key, false);

                const toggleBtn = el.querySelector('.pair-toggle-btn');
                const closeBtn = el.querySelector('.pair-close-btn');
                const textContent = el.querySelector('.pair-text-content');

                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currentHidden = pairHiddenState.get(key) || false;
                    const newHidden = !currentHidden;
                    pairHiddenState.set(key, newHidden);

                    if (newHidden) {
                        textContent.style.display = 'none';
                        toggleBtn.className = 'fa-solid fa-eye';
                        const lineFeat = distanceLineFeaturesMap.get(key);
                        if (lineFeat) lineFeat.setStyle(new ol.style.Style({}));
                    } else {
                        textContent.style.display = 'block';
                        toggleBtn.className = 'fa-solid fa-eye-slash';
                        const lineFeat = distanceLineFeaturesMap.get(key);
                        if (lineFeat) lineFeat.setStyle(null);
                    }
                });

                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lineFeat = distanceLineFeaturesMap.get(key);
                    if (lineFeat) {
                        distanceLineLayer.getSource().removeFeature(lineFeat);
                        distanceLineFeaturesMap.delete(key);
                    }
                    if (ov) OLMap && OLMap.removeOverlay(ov);
                    distanceOverlaysMap.delete(key);
                    pairHiddenState.delete(key);
                    pairMap.delete(key);
                    pairOrder = pairOrder.filter(k => k !== key);
                    // NUEVO: guardar el anchor que podría quedar huérfano ANTES de resetearlo
                    const anchorToCheck = selectedPlaneA;

                    if (selectedPlaneA === hexA || selectedPlaneA === hexB) selectedPlaneA = null;
                    selectedPlanesForDistance = selectedPlanesForDistance.filter(p => p.hex !== hexA && p.hex !== hexB);

                    removePointNumbers('aa', ['aa_' + key + '_1', 'aa_' + key + '_2']);
                    removePlanePoints('aa', ['aa_' + key + '_1', 'aa_' + key + '_2']);

                    // Si el anchor ya no tiene más pares, eliminar su punto y resetearlo
                    if (anchorToCheck) {
                        const stillUsedAsAnchor = Array.from(pairMap.values()).some(v => v.a === anchorToCheck);
                        if (!stillUsedAsAnchor) {
                            removePlanePoints('aa', ['aa_anchor_' + anchorToCheck]);
                            if (selectedPlaneA === anchorToCheck) selectedPlaneA = null;
                        }
                    }
                    cleanupUnusedAnchorPoints();

                    if (typeof InstrumentedAircraft !== 'undefined') {
                        InstrumentedAircraft.unregister(hexA);
                        InstrumentedAircraft.unregister(hexB);
                    }

                });
                ov = new ol.Overlay({ element: el, positioning: 'bottom-center', offset: [0, -10], stopEvent: true });
                OLMap && OLMap.addOverlay(ov);
                distanceOverlaysMap.set(key, ov);
            }

            const textContainer = ov.getElement().querySelector('.pair-text-content');
            if (textContainer) {
                // let distLabel = getTranslatedText('dist_label', 'Dist:');
                // let altDiffLabel = getTranslatedText('alt_diff_label', 'Alt Diff:');
                const distIconHTML = '⟷';
                const altDiffIconHTML = '↕';
                const distM = distance * 1852;
                // const distText = format_distance_long(distM, DisplayUnits).replace(/nmi?/i, 'NM');
                // const altText = Math.round(convert_altitude(altDiff, DisplayUnits)) + NNBSP + get_unit_label("altitude", DisplayUnits);

                const distText = showLabelUnits ? format_distance_long(distM, DisplayUnits).replace(/nmi?/i, 'NM') : format_distance_brief(distM, DisplayUnits);
                const planeA = g.planes[hexA];
                const planeB = g.planes[hexB];
                const altText = getAircraftAltitudeDifferenceText(planeA, planeB);
                const trackA = planeA ? planeA.track : null;
                const trackB = planeB ? planeB.track : null;
                const trackAStr = formatTrackDisplay(trackA);
                const trackBStr = formatTrackDisplay(trackB);

                const trackIconA = '✈ A';
                const trackIconB = '✈ B';
                const trackIconC = '✈ A - B';

                // Calcular la diferencia de rumbo
                let trackDiffStr = '---°';
                if (trackA !== null && trackA !== undefined && !isNaN(trackA) &&
                    trackB !== null && trackB !== undefined && !isNaN(trackB)) {
                    let trackDiff = Math.abs(trackA - trackB);
                    trackDiff = trackDiff % 360;
                    if (trackDiff > 180) {
                        trackDiff = 360 - trackDiff;
                    }
                    trackDiffStr = `${trackDiff.toFixed(1)}°`;
                }

                const bearingAToB = bearingFromLonLat(coordsA, coordsB);
                const anglePair = relativePositionAngle(bearingAToB, planeA ? planeA.track : null);

                // textContainer.innerHTML = `
                //     ⟷ ${distText} | ↕ ${altText}<br>
                //     ✈ A ${trackAStr} | ✈ B ${trackBStr} | ✈ A-B ${trackDiffStr}<br>
                //     ⏱ B respecto a A: ${formatRelativePosition(anglePair)}
                // `;

                textContainer.innerHTML = `
                    ⟷ ${distText} | ↕ ${altText} | ⏱ ${formatRelativePosition(anglePair)}
                `;
                if (isHidden) textContainer.style.display = 'none';
                else textContainer.style.display = 'block';
            }

            // Numerar cada par usando la key del par (sin replaceAll para no borrar los demás)
            updatePointNumbers('aa', [
                { key: 'aa_' + key + '_1', coord: coordsA, num: 'A', isDark: false },
                { key: 'aa_' + key + '_2', coord: coordsB, num: 'B', isDark: false }
            ]);

            // Marcar cada par con puntos (avión)
            if (selectedPlaneA === hexA) {
                updatePlanePoints('aa', [
                    { key: 'aa_anchor_' + hexA, coord: coordsA, hex: hexA },
                    { key: 'aa_' + key + '_2', coord: coordsB, hex: hexB }
                ]);
                removePlanePoints('aa', ['aa_' + key + '_1']);
            } else {
                updatePlanePoints('aa', [
                    { key: 'aa_' + key + '_1', coord: coordsA, hex: hexA },
                    { key: 'aa_' + key + '_2', coord: coordsB, hex: hexB }
                ]);
            }

            const midPoint = [(coordsA[0] + coordsB[0]) / 2, (coordsA[1] + coordsB[1]) / 2];
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
                pairHiddenState.delete(k);
            }
        }
    }
}
// ***********************************************************
// *** FIN FUNCIÓN ACTUALIZAR DISTANCIA AERONAVE-AERONAVE ****
// ***********************************************************

function DistanceBetweenPlanes() {
    // Cambiamos el estado (On/Off)
    distanceBetweenPlanesMode = !distanceBetweenPlanesMode;

    // Limpiamos todo lo anterior (líneas, overlays, intervalos y el array)
    resetDistanceCalculation();

    // Cambiamos el color del botón en la UI
    buttonActive('#D', distanceBetweenPlanesMode);
}

// **************************************************************
// **** INICIO LIMPIAR DISTANCIA CALCULADA AERONAVE-AERONAVE ****
// **************************************************************
function resetDistanceCalculation() {
    selectedPlanesForDistance = [];
    planesMissingSince = null;
    distance1A1BHidden = false;

    if (pairHiddenState) pairHiddenState.clear();

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

    let extraDiv = document.getElementById('distance-label-tag');
    if (extraDiv) extraDiv.remove();

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

    selectedPlaneA = null;
    ppMissingSince && ppMissingSince.clear();
    ppRemoved && ppRemoved.clear();
    pairMap && pairMap.clear();
    pairOrder = [];
    pairBuffer = [];

    clearPointNumbers('aa');
    clearPlanePoints('aa');

}

function cleanupUnusedAnchorPoints() {
    if (!planePointSourceAA) return;

    const activeAnchors = new Set(
        Array.from(pairMap.values(), pair => pair.a)
    );
    const featuresToRemove = [];

    planePointSourceAA.forEachFeature(feature => {
        const key = feature.get('planePointKey');
        if (typeof key === 'string' && key.startsWith('aa_anchor_')) {
            const hex = feature.get('hex');
            if (!activeAnchors.has(hex)) featuresToRemove.push(feature);
        }
    });

    featuresToRemove.forEach(feature => planePointSourceAA.removeFeature(feature));
    if (!pairMap.size) selectedPlaneA = null;
}

// *****************************************************
// *** INICIO FUNCIÓN MODOS DE DISTANCIA EXCLUYENTES ***
// *****************************************************
function toggleDistance() {
    if (!distanceBetweenPlanesMode) {
        if (window.ProjectionTool && window.ProjectionTool.isActive()) {
            window.ProjectionTool.stop();
        }
        if (typeof elevationMode !== 'undefined' && elevationMode &&
            typeof forceStopElevationGroundGround === 'function') {
            forceStopElevationGroundGround();
        }
        if (typeof elevationGroundAircraftMode !== 'undefined' && elevationGroundAircraftMode &&
            typeof forceStopElevationGroundAircraft === 'function') {
            forceStopElevationGroundAircraft();
        }
        if (distanceToGroundMode) {
            DistanceToGround();
        }
        if (groundToGroundMode) {
            DistanceGroundToGround();
        }
        distanceBetweenPlanesMode = true;
        planeDistanceModeType = PP_MODES[0];
        selectedPlanesForDistance = [];
        selectedPlaneA = null;
        resetDistanceCalculation();

        showDistanceGuide(() => {

            let modeText = '';
            switch (planeDistanceModeType) {
                case '1A1B':
                    modeText = getTranslatedText('1_aircraft_1_aircraft', 'Mode: 1 Aircraft - 1 Aircraft');
                    break;
                case 'pairs':
                    modeText = getTranslatedText('pairs_mode', 'Mode: Pairs');
                    break;
                default:
                    modeText = planeDistanceModeType;
                    break;
            }
            // Cambiar el mensaje para mostrar el paso 1 (seleccionar avión A)
            let step1Msg = getTranslatedText('distance_select_plane_a', 'Click on an aircraft to mark point A.');
            return `<center>${modeText}</center><br>${step1Msg}`;
        });

        buttonActive('#D', true);
        return;
    }

    const idx = PP_MODES.indexOf(planeDistanceModeType);
    if (idx >= 0 && idx < PP_MODES.length - 1) {
        planeDistanceModeType = PP_MODES[idx + 1];
        resetDistanceCalculation();
        selectedPlaneA = null;
        selectedPlanesForDistance = [];
        if (planeDistanceModeType === 'pairs') {
            showDistanceGuide(() => {
                let pairsMode = getTranslatedText('pairs_mode', 'Mode: Pairs');
                let pairsMsg = getTranslatedText('click_two_aircraft_sequence', 'Click on two aircraft to create a pair, or double-click the same aircraft to anchor it.');
                return `<center>${pairsMode}</center><br><center>${pairsMsg}</center>`;
            });
        } else {
            showDistanceGuide(() => {
                let modeLabel = getTranslatedText('mode_label', 'Mode: ');
                return `<center>${modeLabel} ${planeDistanceModeType}</center>`;
            });
        }
        buttonActive('#D', true);
    } else {
        DistanceBetweenPlanes();
        hideDistanceGuide();
    }
}

// ============================================================
// HANDLER DE CLICK - MODO DISTANCIA AERONAVE-AERONAVE
// Llamado desde OLMap.on(['singleclick','dblclick']) en script_*.js
// cuando distanceBetweenPlanesMode === true.
// ============================================================
function handleDistanceBetweenPlanesClick(evt, planeHex) {
    // Click sin avión: mostrar mensaje de avión inválido
    if (!planeHex) {
        showDistanceGuide(() => getTranslatedText('distance_invalid_aircraft', 'Please select a valid aircraft with position.'));
        return;
    }

    // Modo 1A1B: seleccionar dos aviones
    if (planeDistanceModeType === '1A1B') {
        // Si ya hay 2 seleccionados, reiniciar
        if (selectedPlanesForDistance.length >= 2) {
            resetDistanceCalculation();
            showDistanceGuide(() => {
                let modeText = getTranslatedText('1_aircraft_1_aircraft', 'Mode: 1 Aircraft - 1 Aircraft');
                let step1Msg = getTranslatedText('distance_select_plane_a', 'Click on an aircraft to mark point A.');
                return `<center>${modeText}</center><br>${step1Msg}`
            });
        }

        let plane = g.planes[planeHex];
        if (!plane || !plane.position || plane.seen > 15) {
            // NUEVO: guía si el avión no tiene posición válida o está desactualizado
            if (selectedPlanesForDistance.length === 1) {
                resetDistanceCalculation();
            }
            showDistanceGuide(() => getTranslatedText(
                'pair_invalid_aircraft',
                'The pending point was reset because this aircraft has no valid position or its signal is stale. Select an aircraft with a valid position.'
            ));
            return;
        }
        if (plane.altitude === null || plane.altitude === undefined) {
            showDistanceGuide(() => getTranslatedText(
                'pair_no_altitude',
                'Aircraft has no altitude data. Pair cannot be created.'
            ));
            return;
        }
        // Validaciones adicionales: no permitir el mismo avión dos veces
        if (selectedPlanesForDistance.length === 1 &&
            selectedPlanesForDistance[0].hex === planeHex) {
            showDistanceGuide(() => getTranslatedText(
                'pair_same_aircraft',
                'Cannot create a pair with the same aircraft. Select a different one.'
            ));
            return;
        }

        if (plane && plane.position && plane.altitude !== null) {
            selectedPlanesForDistance.push({
                hex: planeHex,
                coords: plane.position,
                altitude: plane.altitude
            });

            if (typeof InstrumentedAircraft !== 'undefined') {
                InstrumentedAircraft.register(planeHex);
            }

            // Actualizar mensaje según el paso
            // Actualizar mensaje según el paso
            if (selectedPlanesForDistance.length === 1) {
                // NUEVO: dibujar el punto del primer avión de inmediato
                updatePlanePoints('aa', [
                    { key: 'aa_single_1', coord: plane.position, hex: planeHex }
                ], true);

                // Paso 1 completado -> mostrar paso 2
                showDistanceGuide(() => {
                    let step2Msg = getTranslatedText('distance_select_plane_b', 'Click on another aircraft to mark point B.');
                    return `<center>${step2Msg}</center>`;
                });
            } else if (selectedPlanesForDistance.length === 2) {
                // NUEVO: dibujar el punto del segundo avión de inmediato
                const p1 = selectedPlanesForDistance[0];
                const p2 = selectedPlanesForDistance[1];
                updatePlanePoints('aa', [
                    { key: 'aa_single_1', coord: p1.coords, hex: p1.hex },
                    { key: 'aa_single_2', coord: p2.coords, hex: p2.hex }
                ], true);

                // Paso 2 completado -> mostrar distancia
                hideDistanceGuide();
                updateDistanceLine();
                if (distanceUpdateInterval) clearInterval(distanceUpdateInterval);
                distanceUpdateInterval = setInterval(updateDistanceLine, 1000);
            }
        } else {
            // Alerta si no es un avión válido
            showDistanceGuide(() => getTranslatedText('distance_invalid_aircraft', 'Please select a valid aircraft with position.'));
        }

        // Modo 'pairs': permite pares independientes (A-B, C-D) y anchor A->B,C...
    } else if (planeDistanceModeType === 'pairs') {
        // If an anchor A is set, clicking adds pair A|planeHex (unless same or duplicate)
        if (selectedPlaneA) {
            if (planeHex === selectedPlaneA) {
                // clicking anchor again clears it
                // NUEVO: limpiar el punto del anchor
                removePlanePoints('aa', ['aa_anchor_' + selectedPlaneA]);
                selectedPlaneA = null;
                showDistanceGuide(() => getTranslatedText('anchor_disabled', 'Anchor disabled.'));
                return;
            }
            const key = `${selectedPlaneA}|${planeHex}`;
            if (pairMap.has(key)) {
                showDistanceGuide(() => getTranslatedText('pair_already_exists', 'Pair already exists.'));
                return;
            }
            pairMap.set(key, { a: selectedPlaneA, b: planeHex });
            if (typeof InstrumentedAircraft !== 'undefined') {
                InstrumentedAircraft.register(selectedPlaneA);
                InstrumentedAircraft.register(planeHex);
            }
            pairOrder.push(key);
            // NUEVO: dibujar puntos de ambos aviones del nuevo par
            const planeAnchor = g.planes[selectedPlaneA];
            const planeNew = g.planes[planeHex];
            if (planeAnchor && planeAnchor.position && planeNew && planeNew.position) {
                updatePlanePoints('aa', [
                    { key: 'aa_' + key + '_2', coord: planeNew.position, hex: planeHex }
                ]);
                removePlanePoints('aa', ['aa_' + key + '_1']);
            }
            showDistanceGuide(() => getTranslatedText('pair_added', 'Pair added.'));
            setTimeout(() => {
                const guideEl = document.getElementById('distance-guide-element');
                if (guideEl) {
                    const currentText = guideEl.innerHTML;
                    if (currentText === getTranslatedText('pair_added', 'Pair added.') ||
                        currentText.includes('Pair added')) {
                        guideEl.style.display = 'none';
                    }
                }
            }, 3000);
            updateDistanceLine();
            if (distanceUpdateInterval) clearInterval(distanceUpdateInterval);
            distanceUpdateInterval = setInterval(updateDistanceLine, 1000);
            return;
        }

        // No anchor active: use pairBuffer to form independent pairs or set anchor by clicking same aircraft twice
        if (pairBuffer.length === 0) {
            pairBuffer.push(planeHex);
            // NUEVO: dibujar el punto del primer avión del par en formación
            const planeFirst = g.planes[planeHex];
            if (planeFirst && planeFirst.position) {
                updatePlanePoints('aa', [
                    { key: 'aa_buffer_' + planeHex, coord: planeFirst.position, hex: planeHex }
                ]);
            }
            showDistanceGuide(() => `<center>${getTranslatedText(
                'first_selected',
                'First selected. Click another aircraft to form a pair, or click this aircraft again to anchor it.'
            )}</center>`);
            return;
        } else {
            const first = pairBuffer[0];

            // Same clicked twice -> set anchor
            if (first === planeHex) {
                selectedPlaneA = planeHex;
                pairBuffer = [];
                // NUEVO: limpiar el punto temporal del buffer, ya que ahora es un anchor
                removePlanePoints('aa', ['aa_buffer_' + planeHex]);
                // Y dibujar el punto del anchor
                const planeAnchor = g.planes[planeHex];
                if (planeAnchor && planeAnchor.position) {
                    updatePlanePoints('aa', [
                        { key: 'aa_anchor_' + planeHex, coord: planeAnchor.position, hex: planeHex }
                    ]);
                }
                showDistanceGuide(() => `<center>${getTranslatedText(
                    'anchor_aircraft',
                    'Anchor aircraft. Now click on B aircraft to create pairs with A. Click A again to unanchor.'
                )}</center>`);
                return;
            }

            const newKey = `${first}|${planeHex}`;
            if (pairMap.has(newKey)) {
                showDistanceGuide(() => getTranslatedText('pair_already_exists', 'Pair already exists.'));
                pairBuffer = [];
                return;
            }
            pairMap.set(newKey, { a: first, b: planeHex });
            pairOrder.push(newKey);
            // NUEVO: dibujar puntos de ambos aviones del nuevo par
            const planeFirst = g.planes[first];
            const planeSecond = g.planes[planeHex];
            if (planeFirst && planeFirst.position && planeSecond && planeSecond.position) {
                updatePlanePoints('aa', [
                    { key: 'aa_' + newKey + '_1', coord: planeFirst.position, hex: first },
                    { key: 'aa_' + newKey + '_2', coord: planeSecond.position, hex: planeHex }
                ]);
                // Limpiar el punto temporal del buffer
                removePlanePoints('aa', ['aa_buffer_' + first]);
            }
            pairBuffer = [];
            showDistanceGuide(() => getTranslatedText('independent_pair_added', 'Independent pair added.'));
            setTimeout(() => {
                const guideEl = document.getElementById('distance-guide-element');
                if (guideEl) {
                    const currentText = guideEl.innerHTML;
                    if (currentText === getTranslatedText('independent_pair_added', 'Independent pair added.') ||
                        currentText.includes('Independent pair added')) {
                        guideEl.style.display = 'none';
                    }
                }
            }, 3000);
            updateDistanceLine();
            if (distanceUpdateInterval) clearInterval(distanceUpdateInterval);
            distanceUpdateInterval = setInterval(updateDistanceLine, 1000);
            return;
        }
    }
}

window.updateDistanceLine = updateDistanceLine;
window.resetDistanceCalculation = resetDistanceCalculation;
window.DistanceBetweenPlanes = DistanceBetweenPlanes;
window.toggleDistance = toggleDistance;
window.handleDistanceBetweenPlanesClick = handleDistanceBetweenPlanesClick;