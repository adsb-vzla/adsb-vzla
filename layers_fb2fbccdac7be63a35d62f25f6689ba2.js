// -*- mode: javascript; indent-tabs-mode: nil; c-basic-offset: 8 -*-
"use strict";

// Base layers configuration
//			"url" : "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//			"url" : "http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
//			"url" : "http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
//			"url" : "https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}"
//			"url" : "https://korona.geog.uni-heidelberg.de/tiles/asterh/x={x}&y={y}&z={z}"
//			"url" : "https://{a-c}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
//			"url" : "http://{a-c}.tilessputnik.ru/tiles/kmt2/{z}/{x}/{y}.png"
//			"url" : "https://{a-c}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png"
//			"url" : "https://{a-c}.tile.openstreetmap.se/osm/{z}/{x}/{y}.png"

function createBaseLayers() {
    let layers = new ol.Collection();
    let layers_group = new ol.layer.Group({
        layers: layers,
    });

    let world = new ol.Collection();
    let fir = new ol.Collection();
    let us = new ol.Collection();
    let europe = new ol.Collection();
    let ifrhigh = new ol.Collection();
    let ifrlow = new ol.Collection();
    let vfr = new ol.Collection();
    let TMA_MIQ = new ol.Collection();
    let TMA_BNA = new ol.Collection();
    let TMA_GNA = new ol.Collection();

    const tileTransition = onMobile ? 0 : 0;

    if (loStore['customTiles'] != undefined) {
        custom_layers.push(new ol.layer.Tile({
            source: new ol.source.OSM({
                "url": loStore['customTiles'],
                maxZoom: 20,
                transition: tileTransition,
            }),
            name: 'custom_tiles',
            title: 'Custom tiles',
            type: 'base',
        }));
    }
    /*
    world.push(new ol.layer.Tile({
        source: new ol.source.OSM({
            "url" : "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
        }),
        name: 'wikimedia',
        title: 'OpenStreetMap Wikimedia',
        type: 'base',
    }));
    */

    //if (offlineMapDetail > 0) {
    // ***** CREAR CAPA BASE CON SUS CAPAS OVERLAY *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Base',
        title: 'Base',
        type: 'base',
    }));
    // ***** MAPA *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "mapdata/VFR/{z}/{x}/{y}.png",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Map',
        title: 'Map',
        type: 'overlay',
        visible: false,

    }));
    // ***** AEROPUERTOS *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airports_Aerodromes',
        title: 'Airports / Aerodromes',
        type: 'overlay',
        visible: false,
    }));
    // ***** CLASES ESPACIO AÉREO *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airspace_Classes',
        title: 'Airspace Classes',
        type: 'overlay',
        visible: false,
    }));
    // ***** RUTAS *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airways_Air Routes',
        title: 'Airways / Air Routes',
        type: 'overlay',
        visible: false,
    }));
    // ***** ESPACIO AÉREO CONTROLADO *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Controlled Airspace',
        title: 'Controlled Airspace',
        type: 'overlay',
        visible: false,
    }));
    // ***** MORA/MEA *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Grid_MORA_MEA',
        title: 'Grid MORA / MEA',
        type: 'overlay',
        visible: false,
    }));
    // ***** AYUDA A LA NAVEGACIÓN *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Navaids',
        title: 'Navaids',
        type: 'overlay',
        visible: false,
    }));
    // ***** OBSTÁCULOS *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Obstacles',
        title: 'Obstacles',
        type: 'overlay',
        visible: false,
    }));
    // ***** LÍMITES POLÍTICOS *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Political_Boundaries',
        title: 'Political Boundaries',
        type: 'overlay',
        visible: false,
    }));
    // ***** ESPACIO AÉREO DE USO ESPECIAL *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Special_Use_Airspace',
        title: 'Special Use Airspace',
        type: 'overlay',
        visible: false,
    }));
    // ***** TOPOGRAFÍA *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Terrain_Topography',
        title: 'Terrain / Topography',
        type: 'overlay',
        visible: false,
    }));
    // ***** PUNTOS DE NAVEGACIÓN *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Waypoints_Fixes',
        title: 'Waypoints / Fixes',
        type: 'overlay',
        visible: false,
    }));
    // ***** CLIMA *****
    vfr.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Weather_Radar',
        title: 'Weather / Radar',
        type: 'overlay',
        visible: false,
    }));

    // ***** CREAR CAPA BASE CON SUS CAPAS OVERLAY *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Base',
        title: 'Base',
        type: 'base',
    }));

    // ***** MAPA *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "mapdata/IFR_Low/{z}/{x}/{y}.png",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Map',
        title: 'Map',
        type: 'overlay',
        visible: false,
    }));

    // ***** AEROPUERTOS *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airports_Aerodromes',
        title: 'Airports / Aerodromes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLASES ESPACIO AÉREO *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airspace_Classes',
        title: 'Airspace Classes',
        type: 'overlay',
        visible: false,
    }));

    // ***** RUTAS *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airways_Air Routes',
        title: 'Airways / Air Routes',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO CONTROLADO *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Controlled Airspace',
        title: 'Controlled Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** MORA/MEA *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Grid_MORA_MEA',
        title: 'Grid MORA / MEA',
        type: 'overlay',
        visible: false,
    }));

    // ***** AYUDA A LA NAVEGACIÓN *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Navaids',
        title: 'Navaids',
        type: 'overlay',
        visible: false,
    }));

    // ***** OBSTÁCULOS *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Obstacles',
        title: 'Obstacles',
        type: 'overlay',
        visible: false,
    }));

    // ***** LÍMITES POLÍTICOS *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Political_Boundaries',
        title: 'Political Boundaries',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO DE USO ESPECIAL *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Special_Use_Airspace',
        title: 'Special Use Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** TOPOGRAFÍA *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Terrain_Topography',
        title: 'Terrain / Topography',
        type: 'overlay',
        visible: false,
    }));

    // ***** PUNTOS DE NAVEGACIÓN *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Waypoints_Fixes',
        title: 'Waypoints / Fixes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLIMA *****
    ifrlow.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Weather_Radar',
        title: 'Weather / Radar',
        type: 'overlay',
        visible: false,
    }));

    // ***** CREAR CAPA BASE CON SUS CAPAS OVERLAY *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Base',
        title: 'Base',
        type: 'base',
    }));

    // ***** MAPA *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "mapdata/IFR_Hight/{z}/{x}/{y}.png",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Map',
        title: 'Map',
        type: 'overlay',
        visible: false,
    }));

    // ***** AEROPUERTOS *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airports_Aerodromes',
        title: 'Airports / Aerodromes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLASES ESPACIO AÉREO *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airspace_Classes',
        title: 'Airspace Classes',
        type: 'overlay',
        visible: false,
    }));

    // ***** RUTAS *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airways_Air Routes',
        title: 'Airways / Air Routes',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO CONTROLADO *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Controlled Airspace',
        title: 'Controlled Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** MORA/MEA *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Grid_MORA_MEA',
        title: 'Grid MORA / MEA',
        type: 'overlay',
        visible: false,
    }));

    // ***** AYUDA A LA NAVEGACIÓN *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Navaids',
        title: 'Navaids',
        type: 'overlay',
        visible: false,
    }));

    // ***** OBSTÁCULOS *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Obstacles',
        title: 'Obstacles',
        type: 'overlay',
        visible: false,
    }));

    // ***** LÍMITES POLÍTICOS *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Political_Boundaries',
        title: 'Political Boundaries',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO DE USO ESPECIAL *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Special_Use_Airspace',
        title: 'Special Use Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** TOPOGRAFÍA *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Terrain_Topography',
        title: 'Terrain / Topography',
        type: 'overlay',
        visible: false,
    }));

    // ***** PUNTOS DE NAVEGACIÓN *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Waypoints_Fixes',
        title: 'Waypoints / Fixes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLIMA *****
    ifrhigh.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Weather_Radar',
        title: 'Weather / Radar',
        type: 'overlay',
        visible: false,
    }));

    // ***** CREAR CAPA BASE CON SUS CAPAS OVERLAY *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Base',
        title: 'Base',
        type: 'base',
    }));

    // ***** MAPA *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "mapdata/TMA_MIQ/{z}/{x}/{y}.png",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Map',
        title: 'Map',
        type: 'overlay',
        visible: false,
    }));

    // ***** AEROPUERTOS *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airports_Aerodromes',
        title: 'Airports / Aerodromes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLASES ESPACIO AÉREO *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airspace_Classes',
        title: 'Airspace Classes',
        type: 'overlay',
        visible: false,
    }));

    // ***** RUTAS *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airways_Air Routes',
        title: 'Airways / Air Routes',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO CONTROLADO *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Controlled Airspace',
        title: 'Controlled Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** MORA/MEA *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Grid_MORA_MEA',
        title: 'Grid MORA / MEA',
        type: 'overlay',
        visible: false,
    }));

    // ***** AYUDA A LA NAVEGACIÓN *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Navaids',
        title: 'Navaids',
        type: 'overlay',
        visible: false,
    }));

    // ***** OBSTÁCULOS *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Obstacles',
        title: 'Obstacles',
        type: 'overlay',
        visible: false,
    }));

    // ***** LÍMITES POLÍTICOS *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Political_Boundaries',
        title: 'Political Boundaries',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO DE USO ESPECIAL *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Special_Use_Airspace',
        title: 'Special Use Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** TOPOGRAFÍA *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Terrain_Topography',
        title: 'Terrain / Topography',
        type: 'overlay',
        visible: false,
    }));

    // ***** PUNTOS DE NAVEGACIÓN *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Waypoints_Fixes',
        title: 'Waypoints / Fixes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLIMA *****
    TMA_MIQ.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Weather_Radar',
        title: 'Weather / Radar',
        type: 'overlay',
        visible: false,
    }));

    // ***** CREAR CAPA BASE CON SUS CAPAS OVERLAY *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Base',
        title: 'Base',
        type: 'base',
        visible: false,
    }));

    // ***** MAPA *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "mapdata/TMA_BNA/{z}/{x}/{y}.png",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Map',
        title: 'Map',
        type: 'overlay',
        visible: false,
    }));

    // ***** AEROPUERTOS *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airports_Aerodromes',
        title: 'Airports / Aerodromes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLASES ESPACIO AÉREO *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airspace_Classes',
        title: 'Airspace Classes',
        type: 'overlay',
        visible: false,
    }));

    // ***** RUTAS *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airways_Air Routes',
        title: 'Airways / Air Routes',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO CONTROLADO *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Controlled Airspace',
        title: 'Controlled Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** MORA/MEA *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Grid_MORA_MEA',
        title: 'Grid MORA / MEA',
        type: 'overlay',
        visible: false,
    }));

    // ***** AYUDA A LA NAVEGACIÓN *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Navaids',
        title: 'Navaids',
        type: 'overlay',
        visible: false,
    }));

    // ***** OBSTÁCULOS *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Obstacles',
        title: 'Obstacles',
        type: 'overlay',
        visible: false,
    }));

    // ***** LÍMITES POLÍTICOS *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Political_Boundaries',
        title: 'Political Boundaries',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO DE USO ESPECIAL *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Special_Use_Airspace',
        title: 'Special Use Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** TOPOGRAFÍA *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Terrain_Topography',
        title: 'Terrain / Topography',
        type: 'overlay',
        visible: false,
    }));

    // ***** PUNTOS DE NAVEGACIÓN *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Waypoints_Fixes',
        title: 'Waypoints / Fixes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLIMA *****
    TMA_BNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Weather_Radar',
        title: 'Weather / Radar',
        type: 'overlay',
        visible: false,
    }));

    // ***** CREAR CAPA BASE CON SUS CAPAS OVERLAY *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Base',
        title: 'Base',
        type: 'base',
    }));

    // ***** MAPA *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "mapdata/TMA_GNA/{z}/{x}/{y}.png",
            attributionsCollapsible: false,
            minZoom: 1,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Map',
        title: 'Map',
        type: 'overlay',
        visible: false,
    }));

    // ***** AEROPUERTOS *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airports_Aerodromes',
        title: 'Airports / Aerodromes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLASES ESPACIO AÉREO *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airspace_Classes',
        title: 'Airspace Classes',
        type: 'overlay',
        visible: false,
    }));

    // ***** RUTAS *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Airways_Air Routes',
        title: 'Airways / Air Routes',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO CONTROLADO *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Controlled Airspace',
        title: 'Controlled Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** MORA/MEA *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Grid_MORA_MEA',
        title: 'Grid MORA / MEA',
        type: 'overlay',
        visible: false,
    }));

    // ***** AYUDA A LA NAVEGACIÓN *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Navaids',
        title: 'Navaids',
        type: 'overlay',
        visible: false,
    }));

    // ***** OBSTÁCULOS *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Obstacles',
        title: 'Obstacles',
        type: 'overlay',
        visible: false,
    }));

    // ***** LÍMITES POLÍTICOS *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Political_Boundaries',
        title: 'Political Boundaries',
        type: 'overlay',
        visible: false,
    }));

    // ***** ESPACIO AÉREO DE USO ESPECIAL *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Special_Use_Airspace',
        title: 'Special Use Airspace',
        type: 'overlay',
        visible: false,
    }));

    // ***** TOPOGRAFÍA *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Terrain_Topography',
        title: 'Terrain / Topography',
        type: 'overlay',
        visible: false,
    }));

    // ***** PUNTOS DE NAVEGACIÓN *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Waypoints_Fixes',
        title: 'Waypoints / Fixes',
        type: 'overlay',
        visible: false,
    }));

    // ***** CLIMA *****
    TMA_GNA.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "",
            attributionsCollapsible: false,
            minZoom: 8,
            maxZoom: 15,
            transition: tileTransition,
        }),
        name: 'Weather_Radar',
        title: 'Weather / Radar',
        type: 'overlay',
        visible: false,
    }));

    // ***** IDENTIFICADORES DE PERSISTENCIA POR GRUPO DE CARTAS *****
    // Las capas de cada grupo comparten nombre visible ("Base", "Map", etc.),
    // por lo que se necesita un nombre de almacenamiento único por grupo.
    function setChartLayerStorageNames(layerCollection, groupName) {
        layerCollection.forEach(layer => {
            layer.set('storageName', `${groupName}_${layer.get('name')}`);
            layer.set('chartGroup', groupName);
        });
    }

    setChartLayerStorageNames(vfr, 'vfr');
    setChartLayerStorageNames(ifrhigh, 'ifrhigh');
    setChartLayerStorageNames(ifrlow, 'ifrlow');
    setChartLayerStorageNames(TMA_MIQ, 'tma_miq');
    setChartLayerStorageNames(TMA_BNA, 'tma_bna');
    setChartLayerStorageNames(TMA_GNA, 'tma_gna');

    /*world.push(new ol.layer.Tile({
        source: new ol.source.OSM({
            "url" : "https://{a-d}.tile.openstreetmap.de/{z}/{x}/{y}.png",
            attributionsCollapsible: false,
            maxZoom: 17,
            transition: tileTransition,
        }),
        name: 'osm_de',
        title: 'OpenStreetMap DE',
        type: 'base',
    }));*/

    /*if (offlineMapDetailOFM > 0) {
        world.push(new ol.layer.VectorTile({
            type: 'base',
            name: 'OpenFreeMapOfflineBright',
            title: 'OpenFreeMap Offl. Bright',
            onVisible: (layer) => {
                if (!layer.get('styleApplied')) {
                    ol.mapboxStyle.applyStyle(layer, "./openfreemap_offline/bright");
                    ol.mapboxStyle.applyBackground(layer, "./openfreemap_offline/bright");
                    layer.set('styleApplied', true);
                }
            },
        }));
        world.push(new ol.layer.VectorTile({
            type: 'base',
            name: 'OpenFreeMapOfflineLiberty',
            title: 'OpenFreeMap Offl. Lib.',
            onVisible: (layer) => {
                if (!layer.get('styleApplied')) {
                    ol.mapboxStyle.applyStyle(layer, "./openfreemap_offline/liberty");
                    ol.mapboxStyle.applyBackground(layer, "./openfreemap_offline/liberty");
                    layer.set('styleApplied', true);
                }
            },
        }));
        world.push(new ol.layer.VectorTile({
            type: 'base',
            name: 'OpenFreeMapOfflinePositron',
            title: 'OpenFreeMap Offl. Pos.',
            onVisible: (layer) => {
                if (!layer.get('styleApplied')) {
                    ol.mapboxStyle.applyStyle(layer, "./openfreemap_offline/positron");
                    ol.mapboxStyle.applyBackground(layer, "./openfreemap_offline/positron");
                    layer.set('styleApplied', true);
                }
            },
        }));
        world.push(new ol.layer.VectorTile({
            type: 'base',
            name: 'OpenFreeMapOfflineDark',
            title: 'OpenFreeMap Offl. Dark',
            onVisible: (layer) => {
                if (!layer.get('styleApplied')) {
                    ol.mapboxStyle.applyStyle(layer, "./openfreemap_offline/dark");
                    ol.mapboxStyle.applyBackground(layer, "./openfreemap_offline/dark");
                    layer.set('styleApplied', true);
                }
            },
        }));
        world.push(new ol.layer.VectorTile({
            type: 'base',
            name: 'OpenFreeMapOfflineFiord',
            title: 'OpenFreeMap Offl. Fiord',
            onVisible: (layer) => {
                if (!layer.get('styleApplied')) {
                    ol.mapboxStyle.applyStyle(layer, "./openfreemap_offline/fiord");
                    ol.mapboxStyle.applyBackground(layer, "./openfreemap_offline/fiord");
                    layer.set('styleApplied', true);
                }
            },
        }));
    }*/

    // ***** MAPA OFFLINE *****
    if (offlineMapDetail > 0) {
        world.push(new ol.layer.Tile({
            source: new ol.source.OSM({
                "url": "osm_tiles_offline/{z}/{x}/{y}.png",
                attributionsCollapsible: false,
                maxZoom: offlineMapDetail,
                transition: tileTransition,
            }),
            name: 'osm_tiles_offline',
            title: 'Map_Offline',
            type: 'base',
        }));
    }

    // ***** MAPA OSM *****
    world.push(new ol.layer.Tile({
        source: new ol.source.OSM({
            maxZoom: 17,
            attributionsCollapsible: false,
            transition: tileTransition,
        }),
        name: 'osm',
        title: 'OpenStreetMap',
        type: 'base',
    }));



    if (1) {
        world.push(new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Powered by <a href="https://www.esri.com">Esri.com</a>' +
                    '— Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                attributionsCollapsible: false,
                maxZoom: 17,
                transition: tileTransition,
            }),
            name: 'esri',
            title: 'ESRI.com Sat.',
            type: 'base',
        }));


        /* world.push(new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Powered by <a href="https://www.esri.com">Esri.com</a>' +
                '— Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                attributionsCollapsible: false,
                maxZoom: 16,
                transition: tileTransition,
            }),
            name: 'esri_gray',
            title: 'ESRI.com Gray',
            type: 'base',
        }));
        world.push(new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Powered by <a href="https://www.esri.com">Esri.com</a>' +
                '— Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                attributionsCollapsible: false,
                maxZoom: 17,
                transition: tileTransition,
            }),
            name: 'esri_streets',
            title: 'ESRI.com Streets',
            type: 'base',
        }));*/
    }

    // testing ...
    if (0) {
        let english_map = new ol.layer.VectorTile({
            declutter: true,
            type: 'base',
            name: 'english_map',
            title: 'English Map',
        });
        // ol-mapbox-style plugin packed in with ol ... (kinda ugly)
        //ol.applyStyle(english_map, "https://tiles.adsb.co/api/maps/basic/style.json");
        world.push(english_map);
    }

    if (0) {
        let vtlayer = new ol.layer.VectorTile({
            source: new ol.source.VectorTile({
                url: "http://test02.dev.adsf.com/tiles/{z}/{x}/{y}.pbf",
                format: new ol.format.MVT(),
                maxZoom: 9,
                transition: tileTransition,
            }),
            name: 'vtlayer',
            title: 'TEST VECTOR',
            type: 'base',
            renderMode: 'image',
        });

        jQuery.ajax({
            url: 'osm-liberty/style.json',
            dataType: 'json',
            layer: vtlayer,
            cache: false,
        }).done(function (glStyle) {
            ol.mbApplyStyle(this.layer, glStyle, 'openmaptiles');
        });

        world.push(vtlayer);
    }

    /* seems defunct
    world.push(new ol.layer.Tile({
        source: new ol.source.OSM({
            url: 'https://gibs-{a-c}.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/EPSG3857_500m/{z}/{y}/{x}.jpeg',
            attributions: '<a href="https://terra.nasa.gov/about/terra-instruments/modis">MODIS Terra</a> ' +
            'Provided by NASA\'s Global Imagery Browse Services (GIBS), part of NASA\'s Earth Observing System Data and Information System (EOSDIS)',
            maxZoom: 8,
            transition: tileTransition,
        }),
        name: 'gibs_relief',
        title: 'GIBS Relief',
        type: 'base',
    }));
    

    const date = new Date(Date.now() - 86400 * 1000);
    const yesterday = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1).toString().padStart(2, '0') + '-' + date.getUTCDate().toString().padStart(2, '0');
    world.push(new ol.layer.Tile({
        source: new ol.source.OSM({
            url: 'https://gibs-{a-c}.earthdata.nasa.gov/wmts/epsg3857/best/' +
            'MODIS_Terra_CorrectedReflectance_TrueColor/default/' +
            yesterday + '/' +
            'GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
            attributions: '<a href="https://terra.nasa.gov/about/terra-instruments/modis">MODIS Terra</a> ' +
            yesterday + ' Provided by NASA\'s Global Imagery Browse Services (GIBS), part of NASA\'s Earth Observing System Data and Information System (EOSDIS)',
            maxZoom: 9,
            transition: tileTransition,
        }),
        name: 'gibs',
        title: 'GIBS Clouds ' + yesterday,
        type: 'base',
    }));
    */
    // carto.com basemaps, see the following URLs for details on them:
    // http://basemaps.cartocdn.com
    // https://github.com/CartoDB/cartodb/wiki/BaseMaps-available

    /* let basemaps = [ "dark_all", "dark_nolabels",
        "light_all", "light_nolabels"
    ]

    if (1) {
        for (let i in basemaps) {
            let basemap_id = basemaps[i];

            world.push(new ol.layer.Tile({
                source: new ol.source.OSM({
                    "url" : "https://{a-d}.basemaps.cartocdn.com/"+ basemap_id + "/{z}/{x}/{y}.png",
                    "attributions" : 'Powered by <a href="https://carto.com">CARTO.com</a>'
                    + ' using data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
                    attributionsCollapsible: false,
                    maxZoom: 15,
                    transition: tileTransition,
                }),
                name: "carto_" + basemap_id,
                title: 'CARTO.com ' + basemap_id,
                type: 'base',
            }));
        }
    } */

    if (loStore['bingKey'] != undefined)
        BingMapsAPIKey = loStore['bingKey'];

    if (BingMapsAPIKey) {
        world.push(new ol.layer.Tile({
            source: new ol.source.BingMaps({
                key: BingMapsAPIKey,
                imagerySet: 'Aerial',
                transition: tileTransition,
            }),
            name: 'bing_aerial',
            title: 'Bing Aerial',
            type: 'base',
        }));
        world.push(new ol.layer.Tile({
            source: new ol.source.BingMaps({
                key: BingMapsAPIKey,
                imagerySet: 'RoadOnDemand',
                transition: tileTransition,
            }),
            name: 'bing_roads',
            title: 'Bing Roads',
            type: 'base',
        }));
    }

    if (loStore['mapboxKey'] != undefined)
        MapboxAPIKey = loStore['mapboxKey'];

    if (MapboxAPIKey) {
        world.push(new ol.mapboxStyle.MapboxVectorLayer({
            styleUrl: 'mapbox://styles/mapbox/streets-v10',
            accessToken: MapboxAPIKey,
            properties: {
                name: 'mapbox_streets',
                title: 'Mapbox Streets',
                type: 'base',
            },
        }));
        world.push(new ol.mapboxStyle.MapboxVectorLayer({
            styleUrl: 'mapbox://styles/mapbox/light-v11',
            accessToken: MapboxAPIKey,
            properties: {
                name: 'mapbox_light',
                title: 'Mapbox Light',
                type: 'base',
            },
        }));
        world.push(new ol.mapboxStyle.MapboxVectorLayer({
            styleUrl: 'mapbox://styles/mapbox/dark-v11',
            accessToken: MapboxAPIKey,
            properties: {
                name: 'mapbox_dark',
                title: 'Mapbox Dark',
                type: 'base',
            },
        }));
        world.push(new ol.mapboxStyle.MapboxVectorLayer({
            styleUrl: 'mapbox://styles/mapbox/outdoors-v10',
            accessToken: MapboxAPIKey,
            properties: {
                name: 'mapbox_outdoors',
                title: 'Mapbox Outdoors',
                type: 'base',
            },
        }));
    }

    /* if (1) {
        us.push(new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/VFR_Sectional/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Tiles courtesy of <a href="http://tiles.arcgis.com/">arcgis.com</a>',
                attributionsCollapsible: false,
                minZoom: 8,
                maxZoom: 12,
                transition: tileTransition,
            }),
            name: 'VFR_Sectional',
            title: 'VFR Sectional Chart',
            type: 'base'
        }));

        us.push(new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/VFR_Terminal/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Tiles courtesy of <a href="http://tiles.arcgis.com/">arcgis.com</a>',
                attributionsCollapsible: false,
                minZoom: 10,
                maxZoom: 12,
                transition: tileTransition,
            }),
            name: 'VFR_Terminal',
            title: 'VFR Terminal Chart',
            type: 'base'
        }));

        us.push(new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/IFR_AreaLow/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Tiles courtesy of <a href="http://tiles.arcgis.com/">arcgis.com</a>',
                attributionsCollapsible: false,
                minZoom: 8,
                maxZoom: 11,
                transition: tileTransition,
            }),
            name: 'IFR_AreaLow',
            title: 'IFR Enroute Chart Low',
            type: 'base'
        }));

        us.push(new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://tiles.arcgis.com/tiles/ssFJjBXIUyZDrSYZ/arcgis/rest/services/IFR_High/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Tiles courtesy of <a href="http://tiles.arcgis.com/">arcgis.com</a>',
                attributionsCollapsible: false,
                minZoom: 7,
                maxZoom: 11,
                transition: tileTransition,
            }),
            name: 'IFR_High',
            title: 'IFR Enroute Chart High',
            type: 'base'
        }));
    }

    if (ChartBundleLayers) {

        let chartbundleTypesDirect = {
            sec: "Sectional Charts",
            enrh: "IFR Enroute High Charts",

            tac: "Terminal Area Charts",
            hel: "Helicopter Charts",
            enrl: "IFR Enroute Low Charts",
            enra: "IFR Area Charts",
            secgrids: "Sect. w/ SAR grid",
        };

        for (let type in chartbundleTypesDirect) {
            us.push(new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'https://wms.chartbundle.com/wms',
                    params: {LAYERS: type},
                    projection: 'EPSG:3857',
                    attributions: 'Tiles courtesy of <a href="http://www.chartbundle.com/">ChartBundle</a>',
                    attributionsCollapsible: false,
                    maxZoom: 12, // doesn't work for WMS
                    transition: tileTransition,
                }),
                name: 'chartbundle_' + type,
                title: chartbundleTypesDirect[type],
                type: 'base',
                group: 'chartbundle'}));
        }
    } */

    world.push(new ol.layer.Tile({
        source: new ol.source.XYZ({
            "url": "https://map.adsbexchange.com/mapproxy/tiles/1.0.0/openaip/ul_grid/{z}/{x}/{y}.png",
            "attributions": "openAIP.net",
            attributionsCollapsible: false,
            maxZoom: 12,
            transition: tileTransition,
        }),
        name: 'openaip',
        title: 'openAIP TMS',
        type: 'overlay',
        opacity: openAIPOpacity,
        visible: false,
        zIndex: 99,
        maxZoom: 13,
    }));

    /*if (true) {
        let tfrLayer = new ol.layer.Vector({
            style: {
                'stroke-width': 2,
                'stroke-color': 'red',
                'fill-color': [255, 0, 0, 0.08],
                'text-value': [
                    'concat',
                    ['get', 'NOTAM_KEY'],
                    '\n',
                    ['get', 'LEGAL']
                ],
                'text-font': '14px sans-serif',
                'text-stroke-width': 2,
                'text-stroke-color': 'black'
            },
            name: 'tfrs',
            title: 'TFRs',
            type: 'overlay',
            opacity: tfrOpacity,
            visible: false,
            zIndex: 99,
        });

        us.push(tfrLayer);

        let refreshTFR = function() {
            let source = new ol.source.Vector({
                url: 'https://raw.githubusercontent.com/wiedehopf/tar1090-aux/master/tfrs.geojson',
                format: new ol.format.GeoJSON(),
                attributions: 'TFRs via FAA hosted on github: <a href="https://github.com/wiedehopf/tar1090-aux" target="_blank">tar1090-aux</a>.'
            });
            tfrLayer.setSource(source);
        };

        refreshTFR();
        window.setInterval(refreshTFR, 5 * 60 * 1000);
    }

    us.push(new ol.layer.Vector({
        type: 'overlay',
        title: 'Special Use Airspace',
        name: 'sua',
        zIndex: 99,
        visible: false,
        source: new ol.source.Vector({
            url: 'https://opendata.arcgis.com/datasets/dd0d1b726e504137ab3c41b21835d05b_0.geojson',
            transition: tileTransition,
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:4326',
                projection: 'EPSG:3857'
            })
        }),
        style: function style(feature) {
            let type = feature.getProperties().TYPE_CODE;
            if (type == "P" || type == "R" || type == "W") {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(72, 149, 239, 1)',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(72, 149, 239, 0.3)',
                    })
                })
            } else if (type == "A" || type == "MOA") {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(133, 45, 69, 1)',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color : 'rgba(133, 45, 69, 0.3)'
                    })
                });
            }
        }
    }));

    // nexrad and noaa stuff
    const bottomLeft = ol.proj.fromLonLat([-171.0,9.0]);
    const topRight = ol.proj.fromLonLat([-51.0,69.0]);
    const naExtent = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];

    if (true) {

        let nexrad = new ol.layer.Tile({
            name: 'nexrad',
            title: 'NEXRAD',
            type: 'overlay',
            opacity: nexradOpacity,
            visible: false,
            zIndex: 99,
            //extent: naExtent,
            // this somehow seems to cause webgl errors.
            // workaround by just not using this, it's not important
        });

        let refreshNexrad = function() {
            // re-build the source to force a refresh of the nexrad tiles
            let now = new Date().getTime();
            let nexradSource = new ol.source.XYZ({
                url : 'https://mesonet{1-3}.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png?_=' + now,
                attributions: 'NEXRAD courtesy of <a href="https://mesonet.agron.iastate.edu/">IEM</a>',
                attributionsCollapsible: false,
                maxZoom: 8,
            });
            nexrad.setSource(nexradSource);
        };

        refreshNexrad();
        window.setInterval(refreshNexrad, 2 * 60 * 1000);

        us.push(nexrad);
    }
    if (true) {

        let noaaSatSource = new ol.source.ImageWMS({
            attributions: ['NOAA'],
            attributionsCollapsible: false,
            url: 'https://nowcoast.noaa.gov/geoserver/satellite/wms',
            params: {'LAYERS': 'global_longwave_imagery_mosaic'},
            projection: 'EPSG:3857',
            resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282],
            ratio: 1,
            transition: tileTransition,
        });

        let noaaSat = new ol.layer.Image({
            title: 'NOAA Infrared Sat',
            name: 'noaa_sat',
            zIndex: 99,
            type: 'overlay',
            visible: false,
            source: noaaSatSource,
            opacity: noaaInfraredOpacity,
            extent: naExtent,
        });

        let refreshNoaaSat = function () {
            noaaSatSource.refresh();
        }

        // Refresh sat layer every 15 minutes
        refreshNoaaSat();
        window.setInterval(refreshNoaaSat, 15 * 60 * 1000);

        us.push(noaaSat);
    }
    if (true) {
        let noaaRadarSource = new ol.source.ImageWMS({
            attributions: ['NOAA'],
            attributionsCollapsible: false,
            url: 'https://nowcoast.noaa.gov/geoserver/weather_radar/wms',
            params: {'LAYERS': 'base_reflectivity_mosaic'},
            projection: 'EPSG:3857',
            resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282],
            ratio: 1,
            transition: tileTransition,
        });

        let noaaRadar = new ol.layer.Image({
            title: 'NOAA Radar',
            name: 'noaa_radar',
            zIndex: 99,
            type: 'overlay',
            visible: false,
            source: noaaRadarSource,
            opacity: noaaRadarOpacity,
            extent: naExtent,
        });

        us.push(noaaRadar);
    }

    if (enableDWD) {
        const bottomLeft = ol.proj.fromLonLat([1.9,46.2]);
        const topRight = ol.proj.fromLonLat([16.0,55.0]);
        const dwdExtent = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];

        let dwdSource = new ol.source.TileWMS({
            url: 'https://maps.dwd.de/geoserver/wms',
            params: {LAYERS: dwdLayers, validtime: (new Date()).getTime()},
            projection: 'EPSG:3857',
            attributions: 'Deutscher Wetterdienst (DWD)',
            attributionsCollapsible: false,
            tileGrid: ol.tilegrid.createXYZ({
                extent: ol.tilegrid.extentFromProjection('EPSG:3857'),
                maxResolution: 156543.03392804097,
                maxZoom: 8,
                minZoom: 0,
                tileSize: 512,
            }),
            transition: tileTransition,
        });

        let dwd = new ol.layer.Tile({
            source: dwdSource,
            name: 'radolan',
            title: 'DWD RADOLAN',
            type: 'overlay',
            opacity: dwdRadolanOpacity,
            visible: false,
            zIndex: 99,
            //extent: dwdExtent,
            // extent somehow bugged
        });

        let dwdValidtime = "";

        let refreshDwd = function () {
            let ms = Date.now();
            let validtime = (ms - ms % (5 * 60 * 1000)) / 1000;
            if (validtime != dwdValidtime) {
                //console.log(`dwd validtime ${zuluTime(new Date(validtime * 1000))}`);
                dwd.getSource().updateParams({validtime: validtime});
                dwdValidtime = validtime;
            }
        };
        refreshDwd();
        window.setInterval(refreshDwd, 15 * 1000);

        europe.push(dwd);
    }
*/
    if (true) {
        g.getRainviewerLayers = async function (key) {
            const response = await fetch("https://api.rainviewer.com/public/weather-maps.json", { credentials: "omit", });
            const jsonData = await response.json();
            return jsonData[key];
        }

        const rainviewerRadar = new ol.layer.Tile({
            name: 'rainviewer_radar',
            title: 'RainViewer Radar',
            type: 'overlay',
            opacity: rainViewerRadarOpacity,
            visible: false,
            zIndex: 99,
        });
        g.refreshRainviewerRadar = async function () {
            const latestLayer = await g.getRainviewerLayers('radar');
            const rainviewerRadarSource = new ol.source.XYZ({
                url: 'https://tilecache.rainviewer.com/v2/radar/' + latestLayer.past[latestLayer.past.length - 1].time + '/512/{z}/{x}/{y}/6/1_1.png',
                attributions: '<a href="https://www.rainviewer.com/api.html" target="_blank">RainViewer.com</a>',
                attributionsCollapsible: false,
                maxZoom: 7,
            });
            rainviewerRadar.setSource(rainviewerRadarSource);
        };

        rainviewerRadar.on('change:visible', function (evt) {
            if (evt.target.getVisible()) {
                g.refreshRainviewerRadar();
                g.refreshRainviewerRadarInterval = window.setInterval(g.refreshRainviewerRadar, 2 * 60 * 1000);
            } else {
                clearInterval(g.refreshRainviewerRadarInterval);
            }
        });

        world.push(rainviewerRadar);
    }

    let createGeoJsonLayer = function (title, name, url, fill, stroke, showLabel = true, visible = false) {
        return new ol.layer.Vector({
            type: 'overlay',
            title: title,
            name: name,
            zIndex: 99,
            visible: visible,
            source: new ol.source.Vector({
                url: url,
                transition: tileTransition,
                format: new ol.format.GeoJSON({
                    defaultDataProjection: 'EPSG:4326',
                    projection: 'EPSG:3857'
                })
            }),
            style: function style(feature) {
                return new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: fill
                    }),
                    stroke: new ol.style.Stroke({
                        color: stroke,
                        width: 1
                    }),
                    text: new ol.style.Text({
                        text: showLabel ? feature.get("name") : "",
                        overflow: OLMap.getView().getZoom() > 5,
                        scale: 1.25,
                        fill: new ol.style.Fill({
                            color: '#000000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#FFFFFF',
                            width: 2
                        })
                    })
                });
            }
        });
    };

    // Taken from https://www.ais.pansa.pl/mil/pliki/EP_ENR_2_4_en.pdf
    //europe.push(createGeoJsonLayer('PL AWACS Orbits', 'plawacsorbits', 'geojson/PL_Mil_AWACS_Orbits.geojson', 'rgba(252, 186, 3, 0.3)', 'rgba(252, 186, 3, 1)', false));
    fir.push(
        createGeoJsonLayer(
            'FIR Maiquetía',
            'fir_svzm',
            'geojson/fir_svzm.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            false
        )
    );
    fir.push(
        createGeoJsonLayer(
            'FIR Baranquilla',
            'fir_skec',
            'geojson/fir_skec.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            true
        )
    );
    fir.push(
        createGeoJsonLayer(
            'FIR Bogotá',
            'fir_sked', 
            'geojson/fir_sked.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            true
        )
    );
    fir.push(
        createGeoJsonLayer(
            'FIR Curazao',
            'fir_tncf',
            'geojson/fir_tncf.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            true
        )
    );
    fir.push(
        createGeoJsonLayer(
            'FIR Puerto Rico',
            'fir_tjzs',
            'geojson/fir_tjzs.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            true
        )
    );
    fir.push(
        createGeoJsonLayer(
            'FIR Piarco',
            'fir_ttzp',
            'geojson/fir_ttzp.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            true
        )
    );
    fir.push(
        createGeoJsonLayer(
            'FIR Georgetown',
            'fir_sygc',
            'geojson/fir_sygc.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            true
        )
    );
    fir.push(
        createGeoJsonLayer(
            'FIR Amazonica',
            'fir_sbaz',
            'geojson/fir_sbaz.geojson',
            'rgba(77,163,255,0.15)',
            '#4DA3FF',
            true,
            true
        )
    );
    // Taken from https://english.defensie.nl/binaries/defence/documenten/publications/2022/12/14/milaip-01-23-part-1-gen-part-2-enr/MILAIP_01_2023split_GEN_ENR.pdf
    //europe.push(createGeoJsonLayer('NL AWACS Orbits', 'nlawacsorbits', 'geojson/NL_Mil_AWACS_Orbits.geojson', 'rgba(252, 186, 3, 0.3)', 'rgba(252, 186, 3, 1)', false));

    // Taken from https://github.com/olithissen/AwacsOrbitsDE
    //europe.push(createGeoJsonLayer('DE AWACS Orbits', 'deawacsorbits', 'geojson/DE_Mil_AWACS_Orbits.geojson', 'rgba(252, 186, 3, 0.3)', 'rgba(252, 186, 3, 1)', false));

    // Taken from https://github.com/alkissack/Dump1090-OpenLayers3-html
    //europe.push(createGeoJsonLayer('UK Radar Corridors', 'ukradarcorridors', 'geojson/UK_Mil_RC.geojson', 'rgba(22, 171, 22, 0.3)', 'rgba(22, 171, 22, 1)'));
    //europe.push(createGeoJsonLayer('UK A2A Refueling', 'uka2arefueling', 'geojson/UK_Mil_AAR_Zones.geojson', 'rgba(52, 50, 168, 0.3)', 'rgba(52, 50, 168, 1)'));
    //europe.push(createGeoJsonLayer('UK AWACS Orbits', 'ukawacsorbits', 'geojson/UK_Mil_AWACS_Orbits.geojson', 'rgba(252, 186, 3, 0.3)', 'rgba(252, 186, 3, 1)', false));

    //us.push(createGeoJsonLayer('US A2A Refueling', 'usa2arefueling', 'geojson/US_A2A_refueling.geojson', 'rgba(52, 50, 168, 0.3)', 'rgba(52, 50, 168, 1)'));

    //us.push(createGeoJsonLayer('US ARTCC Boundaries', 'usartccboundaries', 'geojson/US_ARTCC_boundaries.geojson', 'rgba(255, 0, 255, 0.3)', 'rgba(255, 0, 255, 1)', false));

    if (uk_advisory) {
        europe.push(createGeoJsonLayer('uka_airports', 'uka_airports', 'geojson/uk_advisory/airports.geojson', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)'));
        europe.push(createGeoJsonLayer('uka_airspaces', 'uka_airspaces',
            'https://raw.githubusercontent.com/wiedehopf/tar1090-aux/master/uk_advisory/airspaces.geojson',
            'rgba(0, 0, 0, 0.1)', 'rgba(0, 30, 255, 0.2)'));
        //europe.push(createGeoJsonLayer('hotspots', 'hotspots', 'geojson/uk_advisory/hotspots.geojson', 'rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)'));
        //europe.push(createGeoJsonLayer('navaids', 'navaids', 'geojson/uk_advisory/navaids.geojson', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)'));
        europe.push(createGeoJsonLayer('uka_runways', 'uka_runways', 'geojson/uk_advisory/runways.geojson', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)'));
        europe.push(createGeoJsonLayer('uka_shoreham', 'uka_shoreham', 'geojson/uk_advisory/shoreham.geojson', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)'));
    }

    if (l3harris) {
        let files = ['IFT_NAV_Routes.geojson', 'IFT_Training_Areas.geojson', 'USAFA_Training_Areas.geojson'];
        for (let i in files) {
            let name = files[i].split('.')[0];
            us.push(createGeoJsonLayer(name, 'ift' + i, 'geojson/IFT/' + files[i], 'rgba(52, 50, 168, 0.3)', 'rgba(52, 50, 168, 1)'));
        }
    }

    if (usp.has('aiscatcher_server')) { aiscatcher_server = usp.get('aiscatcher_server'); }
    if (aiscatcher_server == 'disable' || heatmap || replay) {
        aiscatcher_server = "";
    }
    if (aiscatcher_server) {

        g.aiscatcher_source = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
        });

        const aiscatcher_mapping = {
            0: { size: [20, 20], offset: [120, 20], comment: 'CLASS_OTHER' },
            1: { size: [20, 20], offset: [120, 20], comment: 'CLASS_UNKNOWN' },
            2: { size: [20, 20], offset: [0, 20], comment: 'CLASS_CARGO' },
            3: { size: [20, 20], offset: [20, 20], comment: 'CLASS_B' },
            4: { size: [20, 20], offset: [40, 20], comment: 'CLASS_PASSENGER' },
            5: { size: [20, 20], offset: [60, 20], comment: 'CLASS_SPECIAL' },
            6: { size: [20, 20], offset: [80, 20], comment: 'CLASS_TANKER' },
            7: { size: [20, 20], offset: [100, 20], comment: 'CLASS_HIGHSPEED' },
            8: { size: [20, 20], offset: [140, 20], comment: 'CLASS_FISHING' },
            9: { size: [25, 25], offset: [0, 60], comment: 'CLASS_PLANE' },
            10: { size: [25, 25], offset: [0, 85], comment: 'CLASS_HELICOPTER' },
            11: { size: [20, 20], offset: [20, 40], comment: 'CLASS_STATION' },
            12: { size: [20, 20], offset: [0, 40], comment: 'CLASS_ATON' },
            13: { size: [20, 20], offset: [40, 40], comment: 'CLASS_SARTEPIRB' }
        };

        g.aiscatcherLayer = new ol.layer.Vector({
            type: 'overlay',
            title: "aiscatcher",
            name: "aiscatcher",
            zIndex: 99,
            source: g.aiscatcher_source,

            style: function (feature) {
                const cog = feature.get('cog');
                const rotation = (cog || 0) * (Math.PI / 180);
                const shipclass = feature.get('shipclass');
                const speed = feature.get('speed');

                const ofs = aiscatcher_mapping[shipclass].offset;
                const size = aiscatcher_mapping[shipclass].size;

                let o;
                if (speed && speed > 0.5) {
                    o = [ofs[0], 0];
                } else {
                    o = ofs;
                }

                return new ol.style.Style({
                    image: new ol.style.Icon({
                        src: aiscatcher_server + '/icons.png',
                        anchor: [0.5, 0.5],
                        rotation: rotation,
                        size: size,
                        offset: o
                    })
                });
            }
        });
        world.push(g.aiscatcherLayer);
    }



    if (world.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'world',
            title: 'Worldwide',
            layers: new ol.Collection(world.getArray().reverse()),
            fold: 'close',
        }));
    }
    if (TMA_GNA.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'tma_gna',
            title: 'TMA/GNA',
            layers: new ol.Collection(TMA_GNA.getArray().reverse()),
            fold: 'close',
        }));
    }
    if (TMA_BNA.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'tma_bna',
            title: 'TMA/BNA',
            layers: new ol.Collection(TMA_BNA.getArray().reverse()),
            fold: 'close',
        }));
    }
    if (TMA_MIQ.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'tma_miq',
            title: 'TMA/MIQ',
            layers: new ol.Collection(TMA_MIQ.getArray().reverse()),
            fold: 'close',
        }));
    }
    if (ifrlow.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'ifrlow',
            title: 'IFR Low',
            layers: new ol.Collection(ifrlow.getArray().reverse()),
            fold: 'close',
        }));
    }
    if (ifrhigh.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'ifrhigh',
            title: 'IFR High',
            layers: new ol.Collection(ifrhigh.getArray().reverse()),
            fold: 'close',
        }));
    }
    if (vfr.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'vfr',
            title: 'VFR',
            layers: new ol.Collection(vfr.getArray().reverse()),
            fold: 'close',
            visible: true,
        }));
    }
    if (fir.getLength() > 0) {
        layers.push(new ol.layer.Group({
            name: 'fir',
            title: 'FIR',
            layers: new ol.Collection(fir.getArray().reverse()),
            fold: 'close',
        }));
    }

    // ***** TRADUCIR NOMBRE DE LAS CAPAS *****
    function translateLayersRecursive(layerCollection) {
        if (!layerCollection || typeof layerCollection.forEach !== 'function') {
            return;
        }

        layerCollection.forEach(layer => {
            if (!layer) return;

            const subLayers = layer.getLayers ? layer.getLayers() : null;

            if (subLayers && typeof subLayers.forEach === 'function') {
                const groupName = layer.get('name');
                if (groupName && window.getLayerTitle) {
                    const translated = window.getLayerTitle('group_' + groupName, layer.get('title'));
                    if (translated !== layer.get('title')) {
                        layer.set('title', translated);
                    }
                }
                translateLayersRecursive(subLayers);
            } else if (layer.get && typeof layer.get === 'function') {
                const name = layer.get('name');
                if (name && window.getLayerTitle) {
                    const translated = window.getLayerTitle(name, layer.get('title'));
                    if (translated !== layer.get('title')) {
                        layer.set('title', translated);
                    }
                }
            }
        });
    }

    translateLayersRecursive(layers);
    return layers_group;
}