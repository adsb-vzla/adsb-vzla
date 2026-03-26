"use strict";

// Objeto que representa un avión identificado por su ICAO
function PlaneObject(icao) {
    // Asegura que el identificador sea una cadena
    icao = `${icao}`;

    // Guarda esta instancia en el registro global de aviones por su ICAO
    g.planes[icao] = this;
    // Añade la instancia a la lista ordenada de aviones
    g.planesOrdered.push(this);

    // Info about the plane
    // Guarda el ICAO en la instancia
    this.icao      = icao;
    // Busca información de país según el rango ICAO
    const icaorange = findICAORange(icao);
    // Guarda el país derivado del ICAO
    this.country = icaorange.country;
    // Guarda el código corto del país
    this.country_code = icaorange.country_code;
    // Convierte el ICAO hexadecimal a número
    this.numHex = parseInt(icao.replace('~', '1'), 16);
    // Marca si el número no es un ICAO real (fuente falsa)
    this.fakeHex = this.numHex > 16777215; // non-icao hex

    // most properties are set via this function so they can be reset easily
    // Inicializa la mayoría de propiedades a valores por defecto
    this.setNull();

    // Track history as a series of line segments
    // Inicializa estructura para el historial de pista/cola
    this.elastic_feature = null;
    this.track_linesegs = [];
    this.history_size = 0;
    // Guarda posiciones recientes para traza en modo globo
    this.trace = []; // save last 30 seconds of positions
    this.lastTraceTs = 0;
    this.routeString = null;

    // Display info
    // Información de visualización y estilos
    this.visible = false;
    this.marker = null;
    this.markerStyle = null;
    this.markerIcon = null;
    this.markerStyleKey = null;
    this.markerSvgKey = null;
    this.baseScale = 1;

    // start from a computed registration, let the DB override it
    // if it has something else.
    // Estima matrícula desde el ICAO, puede ser reemplazada por DB
    this.registration = registration_from_hexid(this.icao);
    this.icaoType = null;
    this.typeDescription = null;
    this.typeLong = null;
    this.wtc = null;
    // Indica si ya cargó información de la base de datos
    this.dbinfoLoaded = false;
    // request metadata
    // Inicia la petición de metadatos si aplica
    this.checkForDB();

    // military icao ranges
    // Marca si el ICAO pertenece a rango militar
    this.military = this.milRange();
}

// Pone muchas propiedades en estado "vacío" o por defecto
PlaneObject.prototype.setNull = function() {
    this.flight = null;
    this.flightTs = 0;
    this.name = 'No callsign';
    this.squawk    = null;
    this.category  = null;
    this.dataSource = "modeS";

    // Basic location information
    // Información básica de posición y altitud
    this.altitude       = null;
    this.alt_baro       = null;
    this.alt_geom       = null;
    this.altitudeTime   = 0;
    this.bad_alt        = null;
    this.bad_altTime    = null;
    this.alt_reliable   = 0;

    this.speed          = null;
    this.gs             = null;
    this.ias            = null;
    this.tas            = null;

    this.track          = null;
    this.track_rate     = null;
    this.mag_heading    = null;
    this.true_heading   = null;
    this.mach           = null;
    this.roll           = null;
    this.nav_altitude   = null;
    this.nav_heading    = null;
    this.nav_modes      = null;
    this.nav_qnh        = null;
    this.rc				= null;
    // Dirección en pantalla y cache de rotación
    this.rotation       = 0;
    this.rotationCache = 999;
    // Indicadores de calidad/precisión
    this.nac_p			= null;
    this.nac_v			= null;
    this.nic_baro		= null;
    this.sil_type		= null;
    this.sil			= null;

    this.baro_rate      = null;
    this.geom_rate      = null;
    this.vert_rate      = null;


    this.wd = null;
    this.ws = null;
    this.oat = null;
    this.tat = null;

    this.version        = null;
    // Posición actual y distancia al receptor
    this.position  = null;
    this.sitedist  = null;
    this.too_fast = 0;

    // Track (direction) at the time we last appended to the track history
    // Información de la "cola"/traza en el momento anterior
    this.tail_track = null;
    this.tail_true = null;
    // Timestamp of the most recent point appended to the track history
    this.tail_update = null;

    this.prev_position = null;
    this.prev_time = null;
    this.prev_track = null;

    // When was this last updated (receiver timestamp)
    // Tiempos de última actualización recibida
    this.seen = NaN;
    this.last_message_time = NaN;
    this.seen_pos = NaN;
    this.position_time = NaN;
    this.last_info_server = 0;

    // Último paquete JSON donde apareció
    this.last = 0; // last json this plane was included in

    // Data packet numbers
    // Contadores y tasas de mensajes
    this.messages  = NaN;
    this.rssi      = null;
    this.msgs1090  = 0;
    this.msgs978   = 0;
    this.messageRate = 0;
    this.messageRateOld = 0;
};
// Copia estado relevante de un avión a otro (clonado temporal)
function planeCloneState(target, source) {
    target.flight = source.flight;
    target.flightTs = source.flightTs;
    target.name = source.name;
    target.squawk = source.squawk;
    target.category = source.category;
    target.dataSource = source.dataSource;
    target.altitude = source.altitude;
    target.alt_baro = source.alt_baro;
    target.alt_geom = source.alt_geom;
    target.altitudeTime = source.altitudeTime;
    target.bad_alt = source.bad_alt;
    target.bad_altTime = source.bad_altTime;
    target.alt_reliable = source.alt_reliable;
    target.speed = source.speed;
    target.gs = source.gs;
    target.ias = source.ias;
    target.tas = source.tas;
    target.track = source.track;
    target.track_rate = source.track_rate;
    target.mag_heading = source.mag_heading;
    target.true_heading = source.true_heading;
    target.mach = source.mach;
    target.roll = source.roll;
    target.nav_altitude = source.nav_altitude;
    target.nav_heading = source.nav_heading;
    target.nav_modes = source.nav_modes;
    target.nav_qnh = source.nav_qnh;
    target.rc = source.rc;
    target.rotation = source.rotation;
    target.rotationCache = source.rotationCache;
    target.nac_p = source.nac_p;
    target.nac_v = source.nac_v;
    target.nic_baro = source.nic_baro;
    target.sil_type = source.sil_type;
    target.sil = source.sil;
    target.baro_rate = source.baro_rate;
    target.geom_rate = source.geom_rate;
    target.vert_rate = source.vert_rate;
    target.wd = source.wd;
    target.ws = source.ws;
    target.oat = source.oat;
    target.tat = source.tat;
    target.version = source.version;
    target.position = source.position;
    target.sitedist = source.sitedist;
    target.too_fast = source.too_fast;

    target.seen = source.seen;
    target.last_message_time = source.last_message_time;
    target.seen_pos = source.seen_pos;
    target.position_time = source.position_time;
    target.last = source.last;
    target.messages = source.messages;
    target.rssi = source.rssi;
    target.msgs1090 = source.msgs1090;
    target.msgs978 = source.msgs978;
    target.messageRate = source.messageRate;
    target.messageRateOld = source.messageRateOld;
};

// Asegura que las capas necesarias para la traza existan
PlaneObject.prototype.checkLayers = function() {
    // Crea la capa de líneas si no existe
    if (!this.trail_features)
        this.createFeatures();
    // Crea la capa de etiquetas si las opciones lo requieren
    if ((showTrace || trackLabels) && !this.trail_labels)
        this.createLabels();
};

// Crea la fuente y la capa para las líneas de traza
PlaneObject.prototype.createFeatures = function() {
    this.trail_features = new ol.source.Vector();

    this.layer = new ol.layer.Vector({
        name: `${this.icao}`,
        isTrail: true,
        source: this.trail_features,
        declutter: false,
        zIndex: 150,
        renderOrder: null,
    });

    trailGroup.push(this.layer);
};

// Crea la fuente y la capa para las etiquetas de traza
PlaneObject.prototype.createLabels = function() {
    this.trail_labels = new ol.source.Vector();

    this.layer_labels = new ol.layer.Vector({
        name: `${this.icao}_labels`,
        isTrail: true,
        source: this.trail_labels,
        declutter: true,
        zIndex: 151,
    });

    trailGroup.push(this.layer_labels);
};

// Registro de logs para trazas cuando el avión está seleccionado
PlaneObject.prototype.logSel = function(loggable) {
    if (debugTracks && this.selected && !SelectedAllPlanes && !globeIndex)
        console.log(loggable);
    return;
};

// Comprueba si el avión debe ocultarse por filtros
PlaneObject.prototype.isFiltered = function() {
    // Siempre mostrar si está seleccionado
    if (this.selected)
        return false;

    // Filtrado por ausencia de matrícula u otras condiciones
    if (noRegOnly && (
        (this.registration || this.icao.startsWith('~'))
        || (this.category && this.category.startsWith('C'))
        || (this.squawk == '7777')
        || (this.icaoType == 'TWR')
        || (this.icaoType == 'GND')
        || (this.altitude == 'ground' && (this.addrtype == 'adsb_icao_nt' || this.addrtype == 'tisb_other'))
    )) {
        return true;
    }

    // Aplica filtros activos por campos (callsign, reg, etc.)
    for (const filter of filters_active) {
        if (!this[filter.field] || !this[filter.field].toUpperCase().match(filter.PATTERN)) {
            //this[filter.field] && console.log(this[filter.field].toUpperCase() + ' ' + filter.PATTERN);
            return true;
        }
    }

    // Filtrar por fuente ICAO-only si está activo
    if (g.icao_nt_only && this.addrtype != 'adsb_icao_nt') {
        return true;
    }

    // Filtrar si sólo se muestran seleccionados
    if (onlySelected && !this.selected) {
        return true;
    }

    // Filtrar si sólo militares
    if (onlyMilitary && !this.military) {
        return true;
    }

    // Filtrar si sólo sin GPS
    if (nogpsOnly && !this.nogps) {
        return true;
    }

    // Filtrar por altitud
    if (!filterTracks && altFiltered(this.altitude))
        return true;

    // Filtrar por fuentes específicas
    if (PlaneFilter.sources && PlaneFilter.sources.length > 0 && !PlaneFilter.sources.includes(this.dataSource)) {
        return true;
    }

    // Filtrar por banderas específicas (flags)
    const flags = PlaneFilter.flagFilter;
    if (flags && flags.length > 0) {
        let found = false;
        for (const flag of flags) {
            if (this[flag]) {
                found = true;
            }
        }
        if (!found) {
            return true;
        }
    }

    // filter out ground vehicles
    // Filtrar vehículos en tierra
    if (PlaneFilter.groundVehicles == 'filtered') {
        if (typeof this.category === 'string' && this.category.startsWith('C'))
            return true;
        if (this.altitude == 'ground' && (this.addrtype == 'adsb_icao_nt' || this.addrtype == 'tisb_other'))
            return true;
        if (this.squawk == 7777)
            return true;
    }

    // filter out blocked MLAT flights
    // Filtrar MLAT bloqueados
    if (PlaneFilter.blockedMLAT == 'filtered') {
        if (typeof this.icao === 'string' && this.icao.startsWith('~'))
            return true;
    }

    // Filtrar por distancia al receptor
    if (this.sitedist && this.sitedist > filterMaxRange)
        return true;

    // Si no entró en ninguna regla, no está filtrado
    return false;
};

// Función auxiliar para filtrar por altitud mínima/máxima
function altFiltered(altitude) {
    if (PlaneFilter.minAltitude == null || PlaneFilter.maxAltitude == null)
        return false;
    if (altitude == null) {
        return true;
    }
    const planeAltitude = altitude === "ground" ? 0 : altitude;
    if (planeAltitude < PlaneFilter.minAltitude || planeAltitude > PlaneFilter.maxAltitude) {
        return true;
    }
    return false;
}

// Actualiza "tail" usando la última posición previa
PlaneObject.prototype.updateTail = function() {

    this.tail_update = this.prev_time;
    this.tail_track = this.prev_track;
    this.tail_rot = this.prev_rot;
    this.tail_true = this.prev_true;
    this.tail_position = this.prev_position;

    return this.updateTrackPrev();
};

// Guarda la posición actual como "prev_" para futuros cálculos
PlaneObject.prototype.updateTrackPrev = function() {

    this.prev_position = this.position;
    this.prev_time = this.position_time;
    this.prev_track = this.track;
    this.prev_rot = this.rotation;
    this.prev_true = this.true_heading;
    this.prev_alt = this.altitude;
    this.prev_alt_rounded = this.alt_rounded;
    this.prev_alt_geom = this.alt_geom;
    this.prev_speed = this.speed;
    this.prev_rId = this.rId;
    this.prev_dataSource = this.dataSource;

    return true;
};

// Appends data to the running track so we can get a visual tail on the plane
// Only useful for a long running browser session.
// Añade puntos al rastro del avión para dibujar la "cola" en pantalla
PlaneObject.prototype.updateTrack = function(now, last, serverTrack, stale) {
    // Si no tenemos posición actual, no hacemos nada
    if (this.position == null)
        return false;
    // Si la posición no cambió desde la anterior y no viene de historial del servidor, no hacemos nada
    if (this.prev_position && this.position[0] == this.prev_position[0] && this.position[1] == this.prev_position[1]
        && !serverTrack)
        return false;
    // Si la posición actual es la misma que una mala posición previamente marcada, ignorarla
    if (this.bad_position && this.position[0] == this.bad_position[0] && this.position[1] == this.bad_position[1])
        return false;
    // Si la posición está fuera de coordenadas válidas, avisar y abandonar
    if (this.position[0] > 180 || this.position[0] < -180 || this.position[1] > 90 || this.position[1] < -90) {
        console.log("Ignoring Impossible Position for " + this.icao + ": " + this.position);
        return false;
    }
    // Convierte la posición (lon,lat) a coordenadas usadas por el mapa
    let projHere = ol.proj.fromLonLat(this.position);
    // Indica si el avión está en tierra según altitud
    let on_ground = (this.altitude === "ground");

    // Marca si el punto es inicio/fin de tramo de vuelo (leg)
    let is_leg = false;
    if (this.leg_ts == now)
        is_leg = 'end';
    if (this.leg_ts == last)
        is_leg = 'start';

    // Si no hay traza previa, crear el primer segmento con los datos actuales
    if (this.track_linesegs.length == 0) {
        // Brand new track
        //console.log(this.icao + " new track");
        // Si el punto actual marca inicio de tramo, anotarlo
        if (this.leg_ts == now)
            is_leg = 'start';
        // Construye el primer segmento con metadatos básicos
        let newseg = { fixed: new ol.geom.LineString([projHere]),
            feature: null,
            estimated: false,
            ground: (this.altitude == "ground"),
            altitude: this.alt_rounded,
            alt_real: this.altitude,
            alt_geom: this.alt_geom,
            position: this.position,
            speed: this.speed,
            ts: now,
            track: this.rotation,
            leg: is_leg,
            rId: this.rId,
            dataSource: this.dataSource,
        };
        // Añade ese segmento al historial de trazas
        this.track_linesegs.push(newseg);
        this.history_size ++;
         // Guarda la posición como "previa" para próximas llamadas
        this.updateTrackPrev();
        // Actualiza valores usados para dibujar la "cola"
        return this.updateTail();
    }
    // Toma el último segmento creado para posible ampliación
    let lastseg = this.track_linesegs[this.track_linesegs.length - 1];

    // Si no tenemos posición previa guardada, actualizar "tail" y salir
    if (!this.prev_position) {
        return this.updateTail();
    }

    // Proyecta la posición previa para usarla en geometría
    let projPrev = ol.proj.fromLonLat(this.prev_position);

    // Si no hay punto de tail previo, añade la coordenada previa al último segmento y actualiza
    if (!this.tail_position) {
        lastseg.fixed.appendCoordinate(projPrev);
        return this.updateTail();
    }

    // Calcula distancia entre la posición actual y la anterior (metros)
    let distance = ol.sphere.getDistance(this.position, this.prev_position);
    // Tiempo transcurrido entre posiciones
    let elapsed = this.position_time - this.prev_time;
    // Variables para filtro de posiciones imposibles
    let derivedMach = 0.01;
    let filterSpeed = 10000;
    // Decide si aplicar filtro de posición por velocidad (pFilter)
    const pFilter = !serverTrack && (positionFilter == true || (positionFilter == 'onlyMLAT' && this.dataSource == "mlat"));
    // Si el filtro está activo, calcula velocidad derivada y umbral
    if (pFilter) {
        derivedMach = (distance/(this.position_time - this.prev_time + 0.4))/343;
        filterSpeed = on_ground ? positionFilterSpeed/10 : positionFilterSpeed;
        filterSpeed = (this.speed != null && this.prev_speed != null) ? (positionFilterGsFactor*(Math.max(this.speed, this.prev_speed)+10+(this.dataSource == "mlat")*100)/666) : filterSpeed;
    }

    // ignore the position if the object moves faster than positionFilterSpeed (default Mach 3.5)
    // or faster than twice the transmitted groundspeed
    // Si parece que el avión "saltó" demasiado rápido, marcar la posición como mala y restaurar la previa
    if (pFilter && derivedMach > filterSpeed && this.too_fast < 1) {
        this.bad_position = this.position;
        this.too_fast++;
        if (debugPosFilter) {
            console.log(this.icao + " / " + this.name + " ("+ this.dataSource + "): Implausible position filtered: " + this.bad_position[0] + ", " + this.bad_position[1] + " (kt/Mach " + (derivedMach*666).toFixed(0) + " > " + (filterSpeed*666).toFixed(0)   + " / " + derivedMach.toFixed(2) + " > " + filterSpeed.toFixed(2) + ") (" + (this.position_time - this.prev_time + 0.2).toFixed(1) + "s)");
        }
        // Reemplaza la posición actual por la previa y no avanza
        this.position = this.prev_position;
        this.position_time = this.prev_time;
        if (debugPosFilter) {
            this.drawRedDot(this.bad_position);
            jumpTo = this.icao;
        }
        return false;
    } else {
        // Si no fue un salto, reducir contador de "too_fast" para recuperarse con el tiempo
        this.too_fast = Math.max(-5, this.too_fast-0.8);
    }
    // Si se pidió calcular rotación desde el track y hay posición previa, calcular rumbo entre puntos
    if (this.request_rotation_from_track && this.prev_position) {
        this.rotation = bearingFromLonLat(this.prev_position, this.position);
        this.request_rotation_from_track = false;
    }


    // special case crossing the 180 -180 longitude line by just starting a new track
    // Si el avión cruzó la línea antimeridiana (±180 lon), tratarlo como nuevo tramo
    if ((this.position[0] < -90 && this.prev_position[0] > 90)
        || (this.position[0] > 90 && this.prev_position[0] < -90)
    ) {
        // Añade la coordenada previa al segmento
        lastseg.fixed.appendCoordinate(projPrev);
        // Maneja el cruce especial (divide en dos segmentos que cruzan el mapa)
        this.cross180(on_ground, is_leg);
        // Aumenta el tamaño de historial para evitar recortes
        this.history_size += 258;

        return this.updateTail();
    }


    // Determine if track data are intermittent/stale
    // Time difference between two position updates should not be much
    // greater than the difference between data inputs
    // Calcula si los datos de posición están "viejos" o espaciados
    let time_difference = (this.position_time - this.prev_time) - 2;
    if (g.refreshHistory || !loadFinished || serverTrack)
        time_difference = (this.position_time - this.prev_time) - Math.min(60, now - last);

    //let stale_timeout = lastseg.estimated ? 5 : 10;
    // Tiempo límite para considerar datos "stale"
    let stale_timeout = 15;

    // MLAT data are given some more leeway
    // Para MLAT dar un poco más de margen
    if (this.dataSource == "mlat")
        stale_timeout = 15;

    // On the ground you can't go that quick
    // En tierra el margen es mayor
    if (on_ground)
        stale_timeout = 30;
    // Si se muestran pistas históricas, permitir mucho más tiempo
    if (pTracks && !serverTrack) {
        stale = false;
        stale_timeout = 120;
        if (this.dataSource == "adsc")
            stale_timeout = jaeroTimeout;
    }
    // Marcar si el segmento anterior vino de modeS
    const modeS = (this.prev_dataSource == 'modeS');

    if (replay)
        stale_timeout = 2 * replay.ival + 1;

    // Also check if the position was already stale when it was exported by dump1090
    // Makes stale check more accurate for example for 30s spaced history points
    // Decidir si el punto actual es "estimado" por estar muy espaciado
    let estimated = (time_difference > stale_timeout) || ((now - this.position_time) > stale_timeout) || stale;

    if (estimated) {
        //console.trace();
        //console.log('estimated ' + new Date(1000 * this.position_time) + ' ' + this.position);
    }

    /*
    let track_change = this.track != null ? Math.abs(this.tail_track - this.track) : NaN;
    track_change = track_change < 180 ? track_change : Math.abs(track_change - 360);
    let true_change =  this.trueheading != null ? Math.abs(this.tail_true - this.true_heading) : NaN;
    true_change = true_change < 180 ? true_change : Math.abs(true_change - 360);
    if (!isNaN(true_change)) {
        track_change = isNaN(track_change) ? true_change : Math.max(track_change, true_change);
    }
    */
    // Calcula cambio de rumbo respecto al último "tail"
    let track_change = Math.abs(this.tail_rot - this.rotation);
    // Cambio de altitud respecto al último segmento
    let alt_change = Math.abs(this.alt_rounded - lastseg.altitude);
    // Tiempo desde la última actualización del tail
    let since_update = this.prev_time - this.tail_update;
    // Distancia recorrida desde la posición tail hasta la previa
    let distance_traveled = ol.sphere.getDistance(this.tail_position, this.prev_position);
    // Si estamos en modo pTracks y aun no ha pasado el intervalo, no añadir punto
    if (pTracks && since_update < pTracksInterval && !serverTrack) {
        return this.updateTrackPrev();
    }

    // Condición compleja para decidir crear un nuevo segmento (cambios grandes o tiempo)
    if (
        this.prev_alt_rounded !== lastseg.altitude
        || modeS
        || this.prev_time > lastseg.ts + 300
        || (!pTracks && this.prev_time > lastseg.ts + 15)
        || estimated != lastseg.estimated
        || estimated
        || tempTrails
        || debugAll
        || serverTrack
        || !globeIndex && (
            track_change > 5
            || Math.abs(this.prev_speed - lastseg.speed) > 10
            || Math.abs(this.prev_alt - lastseg.alt_real) > 200
        )

        //lastseg.ground != on_ground
        //|| (!on_ground && isNaN(alt_change))
        //|| (alt_change > 700)
        //|| (alt_change > 375 && this.alt_rounded < 9000)
        //|| (alt_change > 150 && this.alt_rounded < 5500)
    ) {
        // Create a new segment as the ground state or the altitude changed.
        // The new state is only drawn after the state has changed
        // and we then get a new position.

        // Si llega aquí, creamos uno o más segmentos nuevos
        if (verboseUpdateTrack) {
            this.logSel("sec_elapsed: " + since_update.toFixed(1) + " alt_change: "+ alt_change.toFixed(0) + " derived_speed(kt/Mach): " + (distance_traveled/since_update*1.94384).toFixed(0) + " / " + (distance_traveled/since_update/343).toFixed(1) + " dist:" + distance_traveled.toFixed(0));
        }

        // Inicializa lista de segmentos a crear, empezando con la previa proyectada
        let segments = [[projPrev]];

        // Si pasó mucho tiempo pero no mucha distancia, evitar dibujar línea entre puntos
        if ((since_update > 3600 && distance_traveled / since_update * 3.6 < 100) || modeS) {
            // don't draw a line if a long time has elapsed but no great distance was traveled
        } else {
            // Añade la coordenada previa al último segmento dibujable
            lastseg.fixed.appendCoordinate(projPrev);
        }

        let estimatedFill = false;

        // draw great circle path for long distances
        // Si la distancia es muy grande, subdividir en varios puntos usando gran círculo
        if (distance > 30000
            && !(elapsed > 3600 && distance / elapsed * 3.6 < 100) && !modeS
            // don't draw a line if a long time has elapsed but no great distance was traveled
        ) {
            estimatedFill = true;
            if (!(pTracks && !serverTrack)) {
                estimated = true;
            }
            // Decide cuántos puntos intermedios crear
            let nPoints = distance / 19000;
            let greyskull = Math.ceil(Math.log(nPoints) / Math.log(2));
            //console.log(Math.round(nPoints) + ' ' + greyskull);
            // Genera puntos intermedios en la ruta
            let points = makeCircle([this.prev_position, this.position], greyskull);
            segments = [[]];
            let seg_index = 0;
            let last_lon = this.prev_position[0];
            // Divide en trozos si se cruza el mapa
            for (let i in points) {
                let point = points[i];
                let lon = point[0];
                if (Math.abs(last_lon - lon) > 270) {
                    //console.log(i + ' ' + point);
                    segments.push([]);
                    seg_index++;
                }
                let segment = segments[seg_index];
                segment.push(ol.proj.fromLonLat(point));
                last_lon = lon;
            }
        }
        // Para cada segmento generado, añadirlo al historial con metadatos
        for (let i in segments) {
            let points = segments[i];
            this.track_linesegs.push({ fixed: new ol.geom.LineString(points),
                feature: null,
                estimated: estimated,
                estimatedFill: estimatedFill,
                ground: (this.prev_alt == "ground"),
                altitude: this.prev_alt_rounded,
                alt_real: this.prev_alt,
                alt_geom: this.prev_alt_geom,
                position: this.prev_position,
                speed: this.prev_speed,
                ts: this.prev_time,
                track: this.prev_rot,
                leg: is_leg,
                rId: this.prev_rId,
                dataSource: this.prev_dataSource,
                noLabel: (i > 0),
            });
        }

        // Ajusta contador de puntos históricos
        this.history_size += 2;

        return this.updateTail();
    }

    // Si el origen fue modeS, no modificar el segmento actual, sólo actualizar prevs
    if (modeS) {
        return this.updateTrackPrev();
    }

    // Add current position to the existing track.
    // We only retain some points depending on time elapsed and track change
    // Decidir si añadir la previa al segmento actual según densidad de giro y tiempo
    let turn_density = 6.5;
    if (pTracks && pTracksInterval > 5) turn_density = 3;
    if (
        since_update > 86 + !!pTracks * 90 ||
        (!on_ground && since_update > (100/turn_density)/track_change) ||
        (!on_ground && isNaN(track_change) && since_update > 8 + !!pTracks * 22) ||
        (on_ground && since_update > (120/turn_density)/track_change && distance_traveled > 20) ||
        (on_ground && distance_traveled > 50 && since_update > 5) ||
        debugAll
    ) {
        // Añade la coordenada previa al segmento actual y actualiza historial
        lastseg.fixed.appendCoordinate(projPrev);
        this.history_size ++;

        this.logSel("sec_elapsed: " + since_update.toFixed(1) + " " + (on_ground ? "ground" : "air") +  " dist:" + distance_traveled.toFixed(0) +  " track_change: "+ track_change.toFixed(1) + " derived_speed(kt/Mach): " + (distance_traveled/since_update*1.94384).toFixed(0) + " / " + (distance_traveled/since_update/343).toFixed(1));

        return this.updateTail();
    }
    // Si no se cumplió ninguna condición, sólo guarda la actual como previa
    return this.updateTrackPrev();
};

// Devuelve un número short para la fuente de datos (útil para orden o etiquetas)
PlaneObject.prototype.getDataSourceNumber = function() {
    if (this.dataSource == "modeS")
        return 5;
    if (this.dataSource == "adsc")
        return 6;
    if (this.dataSource == "mlat")
        return 3;

    if (this.dataSource == "uat" || (this.addrtype && this.addrtype.substring(0,4) == "adsr"))
        return 2; // UAT

    if (this.dataSource == "tisb")
        return 4; // TIS-B
    if (this.dataSource == "adsb")
        return 1;

    if (this.dataSource == "other" || this.dataSource == "ais")
        return 7;

    return 8;
};

// Devuelve la cadena que indica de dónde viene este avión
PlaneObject.prototype.getDataSource = function() {
    return this.dataSource;
};

PlaneObject.prototype.getMarkerColor = function(options) {
    options |= {}
    // Si el usuario pidió iconos en un solo color, convertir el hex a HSL y devolver
    if (monochromeMarkers) {
        return hexToHSL(monochromeMarkers);
    }
    // Decide la altitud a usar para color (redondeada o real según opción)
    let alt = options.noRound ? this.altitude : this.alt_rounded;
    if (this.category == 'C3' || this.icaoType == 'TWR' || (this.icaoType == null && this.squawk == 7777))
        alt = 'ground';

    let h, s, l;

    // Obtiene HSL base según altitud
    let colorArr = altitudeColor(alt);

    h = colorArr[0];
    s = colorArr[1];
    l = colorArr[2];

    // If we have not seen a recent position update, change color
    // Si la posición no se ha visto recientemente, ajustar color para indicar "no fresco"
    if ((this.dataSource == 'adsc' && this.seen_pos > 20 * 60)
        || (!globeIndex && this.dataSource != 'adsc' && this.seen_pos > 15))  {
        h += ColorByAlt.stale.h;
        s += ColorByAlt.stale.s;
        l += ColorByAlt.stale.l;
    }
    // Si está en tierra, aclarar un poco
    if (alt == "ground") {
        l += 15;
    }

    // If this marker is selected, change color
    // Si el marcador está seleccionado, ajustar color para destacarlo
    if (this.selected && !SelectedAllPlanes && !onlySelected){
        h += ColorByAlt.selected.h;
        s += ColorByAlt.selected.s;
        l += ColorByAlt.selected.l;
    }

    // If this marker is a mlat position, change color
    // Si la posición viene de MLAT, ajustar tonos
    if (this.dataSource == "mlat") {
        h += ColorByAlt.mlat.h;
        s += ColorByAlt.mlat.s;
        l += ColorByAlt.mlat.l;
    }

    // Si en estilo ATC y código de emergencia, usar rojo brillante
    if (atcStyle && (this.squawk == '7700' || this.squawk == '7600' || this.squawk == '7500')) {
        h = 0;
        s = 100;
        l = 40;
    }

    // Normaliza H,S,L a rangos válidos
    if (h < 0) {
        h = (h % 360) + 360;
    } else if (h >= 360) {
        h = h % 360;
    }

    if (s < 0) s = 0;
    else if (s > 95) s = 95;

    if (l < 0) l = 0;
    else if (l > 95) l = 95;

    // Devuelve el color en HSL
    return [h, s, l];
};

function altitudeColor(altitude) {
    // Ajusta altitud barométrica según QNH si hace falta
    altitude = adjust_baro_alt(altitude);
    let h, s, l;

    // Si no hay altitud, usar color "desconocido"
    if (altitude == null) {
        h = ColorByAlt.unknown.h;
        s = ColorByAlt.unknown.s;
        l = ColorByAlt.unknown.l;
    } else if (altitude === "ground") {
        // Si está en tierra, usar color de tierra
        h = ColorByAlt.ground.h;
        s = ColorByAlt.ground.s;
        l = ColorByAlt.ground.l;
    } else {
        // Redondea altitud para limitar cantidad de colores
        const altRound = (altitude < 8000) ? 50 : ((webgl && !pTracks && !SelectedAllPlanes) ? 200 : 500);
        // round altitude to limit the number of colors used
        altitude = altRound * Math.round(altitude / altRound);
        // Saturación fija para aire
        s = ColorByAlt.air.s;

        // find the pair of points the current altitude lies between,
        // and interpolate the hue between those points
        // Interpola el matiz (hue) entre puntos de referencia según altitud
        let hpoints = ColorByAlt.air.h;
        h = hpoints[0].val;
        for (let i = hpoints.length-1; i >= 0; --i) {
            if (altitude > hpoints[i].alt) {
                if (i == hpoints.length-1) {
                    h = hpoints[i].val;
                } else {
                    h = hpoints[i].val + (hpoints[i+1].val - hpoints[i].val) * (altitude - hpoints[i].alt) / (hpoints[i+1].alt - hpoints[i].alt)
                }
                break;
            }
        }
        // Interpola la luminosidad (lightness) según el matiz
        let lpoints = ColorByAlt.air.l;
        lpoints = lpoints.length ? lpoints : [{h:0, val:lpoints}];
        l = lpoints[0].val;
        for (let i = lpoints.length-1; i >= 0; --i) {
            if (h > lpoints[i].h) {
                if (i == lpoints.length-1) {
                    l = lpoints[i].val;
                } else {
                    l = lpoints[i].val + (lpoints[i+1].val - lpoints[i].val) * (h - lpoints[i].h) / (lpoints[i+1].h - lpoints[i].h)
                }
                break;
            }
        }
    }
    // Si el usuario pidió colores más oscuros, aplicarlo
    if (darkerColors) {
        l *= 0.8;
        s *= 0.7;
    }

    // Normaliza los valores a rangos válidos
    if (h < 0) {
        h = (h % 360) + 360;
    } else if (h >= 360) {
        h = h % 360;
    }

    if (s < 0) s = 0;
    else if (s > 95) s = 95;

    if (l < 0) l = 0;
    else if (l > 95) l = 95;

    // Devuelve HSL calculado
    return [h, s, l];
}

PlaneObject.prototype.setMarkerRgb = function() {
    // Convierte HSL a RGB para WebGL y guarda en el marcador GL
    let hsl = this.getMarkerColor({noRound: true});
    let rgb = hslToRgb(hsl, 'array');
    // Si la forma es un SVG completo, forzar blanco para conservar colores del SVG
    if (this.shape && this.shape.svg)
        rgb = [255, 255, 255];
    this.glMarker.set('r', rgb[0]);
    this.glMarker.set('g', rgb[1]);
    this.glMarker.set('b', rgb[2]);
};

PlaneObject.prototype.updateIcon = function() {
    // Genera color de relleno y llave única para cachear el SVG
    let fillColor = hslToRgb(this.getMarkerColor());
    let svgKey  = fillColor + '!' + this.shape.name + '!' + this.strokeWidth;
    let labelText = null;
    // Decide si mostrar texto/etiqueta según zoom, velocidad y configuración
    if ( g.enableLabels && (!multiSelect || (multiSelect && this.selected)) &&
        (
            (g.zoomLvl >= labelZoom && this.altitude != "ground" && this.dataSource != "ais")
            || (g.zoomLvl >= labelZoomGround - 2 && this.speed > 5 && !this.fakeHex)
            || (g.zoomLvl >= labelZoomGround + 0 && !this.fakeHex)
            || (g.zoomLvl >= labelZoomGround + 1)
            || this.selected
        )
    ) {
        // Construye el texto que mostrará (callsign, altitud, velocidad, etc.)
        let callsign = "";
        if (this.flight && this.flight.trim() && !(this.dataSource == "ais" && !g.extendedLabels))
            callsign =  this.flight.trim();
        else if (this.registration)
            callsign =  'reg: ' + this.registration;
        else
            callsign =   'hex: ' + this.icao;
        if ((useRouteAPI || this.dataSource == "ais") && this.routeString) {
            if (0 && g.extendedLabels) {
                callsign += ' - ' + this.routeString;
            } else {
                callsign += '\n' + this.routeString;
            }
        }

        const unknown = NBSP+NBSP+"?"+NBSP+NBSP;

        // Decide altitud a mostrar en la etiqueta
        let alt;
        if (labelsGeom) {
            alt = adjust_geom_alt(this.alt_geom, this.position);
        } else {
            alt = adjust_baro_alt(this.altitude);
        }
        let altString = (alt == null) ? unknown : format_altitude_brief(alt, this.vert_rate, DisplayUnits, showLabelUnits);
        let speedString = (this.speed == null) ? (NBSP+'?'+NBSP) : format_speed_brief(this.speed, DisplayUnits, showLabelUnits).padStart(3, NBSP);

        labelText = "";
        // Según distintos estilos de etiqueta (ATC, viento, extendido) construir líneas de texto
        if (atcStyle) {
            labelText += callsign + '\n';
            labelText += altString + '\n';
            labelText += 'x' + this.squawk;
            if (this.squawk == '7700' || this.squawk == '7600' || this.squawk == '7500') {
                if (this.squawk == '7700') {
                    labelText += '\nEMERGENCY';
                } else if (this.squawk == '7600') {
                    labelText += '\nNORDO';
                } else if (this.squawk == '7500') {
                    labelText += '\nHIJACK';
                }
            }
        } else if (g.extendedLabels == 3) {
            if (!windLabelsSlim) {
                labelText += 'Wind' + NBSP;
            }
            if (this.wd != null) {
                if (showLabelUnits) {
                    labelText += format_track_arrow((this.wd + 180 % 360)) + NBSP + this.wd + '°' + NBSP;
                    labelText += format_speed_long(this.ws, DisplayUnits);
                } else {
                    labelText += format_track_arrow((this.wd + 180 % 360)) + NBSP + this.wd + NBSP;
                    labelText += format_speed_brief(this.ws, DisplayUnits);
                }
            } else {
                labelText += 'n/a';
            }
            if (windLabelsSlim) {
                labelText += '\n' + altString;
            } else {
                if ((!this.onGround || (this.speed && this.speed > 18) || (this.selected && !SelectedAllPlanes))) {
                    labelText += '\n' + speedString + NBSP + NNBSP + altString.padStart(6, NBSP);
                }
                labelText += '\n' + callsign;
            }

            if (windLabelsSlim && this.wd == null) {
                labelText = '';
            }
        } else if (g.extendedLabels == 2) {
            labelText += (this.registration ? this.registration : unknown) + NBSP + (this.icaoType ? this.icaoType : unknown) + '\n';
        }
        if (g.extendedLabels == 1 || g.extendedLabels == 2) {
            if ((!this.onGround || (this.speed && this.speed > 18) || (this.selected && !SelectedAllPlanes))) {
                labelText += speedString + NBSP + NNBSP + altString.padStart(6, NBSP) + '\n';
            }
        }
        if (g.extendedLabels < 3 && !atcStyle) {
            labelText += callsign;
        }
    }
    // Si no usamos WebGL y la iconografía cambió o no existe, crear/recargar el icono
    if (!webgl && (this.markerStyle == null || this.markerIcon == null || (this.markerSvgKey != svgKey))) {
        //console.log(this.icao + " new icon and style " + this.markerSvgKey + " -> " + svgKey);

        if (iconCache[svgKey] == undefined) {
            let svgURI = svgShapeToURI(this.shape, fillColor, OutlineADSBColor, this.strokeWidth);

            addToIconCache.push([svgKey, null, svgURI]);

            if (true || TrackedAircraftPositions < 200) {
                // Crea un objeto icon con la imagen SVG y parámetros (escala, rotación, etc.)
                this.markerIcon = new ol.style.Icon({
                    scale: this.scale,
                    imgSize: [this.shape.w, this.shape.h],
                    src: svgURI,
                    rotation: (this.shape.noRotate ? 0 : this.rotation * Math.PI / 180.0),
                    rotateWithView: (this.shape.noRotate ? false : true),
                });
                this.scaleCache = this.scale;
            } else {
                svgKey = this.markerSvgKey;
            }
        } else {
            // Si ya hay imagen en cache, usarla directamente sin recodificar URI
            this.markerIcon = new ol.style.Icon({
                scale: this.scale,
                imgSize: [this.shape.w, this.shape.h],
                img: iconCache[svgKey],
                rotation: (this.shape.noRotate ? 0 : this.rotation * Math.PI / 180.0),
                rotateWithView: (this.shape.noRotate ? false : true),
            });
            this.scaleCache = this.scale;
        }
        this.markerSvgKey = svgKey;

        //iconCache[svgKey] = undefined; // disable caching for testing
    }
    // Si no se llegó a crear un marker y no usamos webgl, salir
    if (!this.markerIcon && !webgl)
        return;

    // Combina clave de estilo, texto y escala para saber si necesita actualizar estilo
    let styleKey = (webgl ? '' : svgKey) + '!' + labelText + '!' + this.scale;
    // Si cambió el estilo, crear un nuevo estilo OL y aplicarlo al feature
    if (this.styleKey != styleKey || !this.marker.getStyle()) {
        this.styleKey = styleKey;
        let style;
        if (labelText) {
            style = {
                image: this.markerIcon,
                text: new ol.style.Text({
                    text: labelText,
                    fill: labelFill,
                    backgroundFill: bgFill,
                    stroke: labelStrokeNarrow,
                    textAlign: 'left',
                    textBaseline: labels_top ? 'bottom' : 'top',
                    font: labelFont,
                    offsetX: (this.shape.w *0.5*0.74*this.scale),
                    offsetY: labels_top ? (this.shape.w *-0.3*0.74*this.scale) : (this.shape.w *0.5*0.74*this.scale),
                    padding: [1, 0, -1, 2],
                }),
                zIndex: this.zIndex,
            };
        } else {
            style = {
                image: this.markerIcon,
                zIndex: this.zIndex,
            };
        }
        if (webgl)
            delete style.image;
        this.markerStyle = new ol.style.Style(style);
        this.marker.setStyle(this.markerStyle);
    }
    if (webgl)
        return;

    /*
    if (this.opacityCache != opacity) {
        this.opacityCache = opacity;
        this.markerIcon.setOpacity(opacity);
    }
    */
   // Ajusta rotación del icono si cambió significativamente
    const iconRotation = this.shape.noRotate ? 0 : this.rotation;
    if (this.rotationCache != iconRotation && Math.abs(this.rotationCache - iconRotation) > 0.35) {
        this.rotationCache = iconRotation;
        this.markerIcon.setRotation(iconRotation * Math.PI / 180.0);
    }

    // Ajusta escala del icono si cambió
    if (this.scaleCache != this.scale) {
        this.scaleCache = this.scale;
        this.markerIcon.setScale(this.scale);
    }

    return;
};

// Procesa y dibuja la traza histórica y reciente del avión
PlaneObject.prototype.processTrace = function() {

    // Guarda el valor anterior del indicador de información del servidor
    const old_last_info_server = this.last_info_server;

    // Si fullTrace está vacío o mal formado, eliminarlo
    if (this.fullTrace && !this.fullTrace.trace) {
        this.fullTrace = null;
    }
    // Si recentTrace está vacío o mal formado, eliminarlo
    if (this.recentTrace && !this.recentTrace.trace) {
        this.recentTrace = null;
    }
    // Si estamos en modo replay y no hay fullTrace, salir
    if (replay && !this.fullTrace)
        return;
    // Si no mostrar trazas y no hay datos de traza, salir
    if (!showTrace && !this.fullTrace && !this.recentTrace) {
        return;
    }  
    // Si no existe la variable global now, asignar el tiempo actual en segundos
    if (!now)
        now = new Date().getTime()/1000;

    // Si estamos mostrando traza o en replay, reiniciar muchos campos del avión
    if (showTrace || replay)
        this.setNull();

    // Guardar opciones locales de inicio/fin de tramo si existen
    let legStart = traceOpts.legStart;
    let legEnd = traceOpts.legEnd;
    // Asegura que las capas para mostrar la traza existan
    this.checkLayers();
    // Variable para apuntar a la traza que se usará
    let trace = null;
    // Variables temporales de tiempo
    let _now, _last = 0;
    // Reinicia el contador de tamaño de historial
    this.history_size = 0;
    // Contadores de puntos
    let points_in_trace = 0;
    let pointsRecent = 0;

    // Si no se está animando por tiempo, borrar la traza antigua en pantalla
    if (!traceOpts.showTime) {
        this.resetTrail();
    }
    // Guardará la primera posición encontrada
    let firstPos = null;
    // Crear un clon temporal del estado del avión
    let tempPlane = {};
    planeCloneState(tempPlane, this);
    // Limpiar la posición actual para procesar la traza histórica
    this.position = null;
    // Si hay ambas trazas (full y recent) comprobar solapamiento y alertar si hay problema
    if (this.fullTrace && this.recentTrace && this.fullTrace.length > 0 && this.recentTrace.length > 0) {
        let t1 = this.fullTrace.trace;
        let t2 = this.recentTrace.trace;
        let end1 = t1[t1.length-1][0];
        let start2 = t2[0][0];
        if (end1 < start2)
            console.log("Insufficient recent trace overlap!");
    }
    // Preferir recentTrace si no hay fullTrace
    if (this.recentTrace && !this.fullTrace) {
        // Usar fullTrace y añadir datos recientes al final si hay
        trace = this.recentTrace.trace;
    } else if (this.fullTrace) {
        trace = this.fullTrace.trace;
        if (this.recentTrace) {
            const recent = this.recentTrace.trace;
            for (let i = 0; i < recent.length; i++) {
                const entry = recent[i];
                if (trace.length == 0 || entry[0] > trace[trace.length - 1][0]) {
                    //console.log("pushing " + entry[0]);
                    // Añadir entrada reciente que sea posterior a la última de la fullTrace
                    trace.push(entry);
                }
            }
        }
    }
    // Si hay traza a procesar, iterar para construir segmentos
    if (trace && trace.length > 0) {
        // Índices por defecto para recorrer la traza completa
        let start = 0;
        // Inicializa _last justo antes del primer timestamp
        let end = trace.length;
        _last = trace[0][0] - 1;
        // Ajusta inicio/fin si las opciones indican recorte por tramo
        if (legStart != null)
            start = legStart;
        if (legEnd != null)
            end = legEnd;
        // Si hay filtro por marca de tiempo de inicio, buscar primer índice válido
        if (traceOpts.startStamp != null) {
            let found = 0;
            for (let i = start; i < end; i++) {
                const timestamp = trace[i][0];
                if (timestamp >= traceOpts.startStamp) {
                    start = i;
                    found = 1
                    break;
                }
            }
            if (!found) { start = end = 0; }
        }
        // Si hay filtro por marca de tiempo de fin, buscar último índice válido
        if (traceOpts.endStamp != null) {
            let found = 0;
            for (let i = end - 1; i >= start; i--) {
                const timestamp = trace[i][0];
                if (timestamp <= traceOpts.endStamp) {
                    end = i + 1;
                    found = 1
                    break;
                }
            }
            if (!found) { start = end = 0; }
        }
        // Si se pidió sólo el último tramo y no se muestran trazas, ajustar inicio al último marcador de tramo
        if (lastLeg && !showTrace) {
            for (let i = end - 1; i >= start; i--) {
                if (trace[i][6] & 2) {
                    start = i;
                    break;
                }
            }
        }

        //console.log('trace points from/to: ' + trace[start][0] + ' ' + trace[end-1][0]);
        // Preparar variable para recordar la última posición procesada
        let lastPosition;
        for (let i = start; i < end; i++) {
            const state = trace[i];
            const timestamp = state[0];
            // Marca si el punto viene marcado como "stale" (antiguo)
            let stale = state[6] & 1;
            // Marca si el punto es inicio/fin de tramo (leg)
            const leg_marker = state[6] & 2;
            // Si la traza contiene tiempo en el futuro, avisar por consola
            if (1000 * timestamp > new Date().getTime()) {
                console.log('in the future ' + new Date(timestamp * 1000) + ' ' + state.join(','));
            }
            // no going backwards in time
            // Evitar procesar tiempos que retroceden respecto a lo ya procesado
            if (timestamp < _now) {
                console.log('backwards trace wat? ' + timestamp + ' ' + state.join(','));
                continue;
            }
            // Actualizar marcador de tiempo actual de la traza
            _now = timestamp;
            // Si estamos mostrando sólo hasta cierto tiempo, preparar animación o detener
            if (traceOpts.showTime && timestamp > traceOpts.showTime) {
                if (traceOpts.replaySpeed > 0) {
                    // Cancelar temporizador anterior
                    clearTimeout(traceOpts.showTimeout);
                    // Tiempo real entre este punto y el inicio de la animación
                    traceOpts.animateRealtime = (timestamp - traceOpts.showTime) * 1000;
                    // Duración de la animación basada en la velocidad de replay
                    traceOpts.animateTime = traceOpts.animateRealtime / traceOpts.replaySpeed;
                    // Elegir fps según si se usa webgl
                    let fps = webgl ? 28 : 1;
                    // Calcular pasos de animación
                    traceOpts.animateSteps = Math.round(traceOpts.animateTime / (1000 / fps));
                    // Contador de pasos inicial
                    traceOpts.animateCounter = traceOpts.animateSteps; // will count down
                    // Tiempo por paso de animación
                    traceOpts.animateStepTime = traceOpts.animateRealtime / traceOpts.replaySpeed / traceOpts.animateSteps;
                    // Si pocos pasos, no animar sino saltar directo
                    if (traceOpts.animateSteps < 2) {
                        traceOpts.animate = false;
                        //console.log(`animateTime: ${traceOpts.animateTime}`);
                        // Ajustar hora a mostrar y programar avance directo
                        traceOpts.showTime = timestamp;
                        traceOpts.showTimeout = setTimeout(gotoTime, traceOpts.animateTime);
                    } else {
                        // Preparar parámetros de animación entre la posición actual y la siguiente
                        traceOpts.showTimeEnd = timestamp;
                        //console.timeEnd('step');
                        //console.time('step');
                        //console.log(traceOpts.animateTime);
                        traceOpts.animate = true;

                        traceOpts.animateFromLon = this.position[0];
                        traceOpts.animateFromLat = this.position[1];
                        traceOpts.animateToLon = state[2];
                        traceOpts.animateToLat = state[1];

                        traceOpts.animatePos = [traceOpts.animateFromLon, traceOpts.animateFromLat];

                        //console.log('from: ', fromProj);
                        //console.log('to:   ', toProj);
                        // Iniciar temporizador para pasos de animación
                        traceOpts.showTimeout = setTimeout(gotoTime, traceOpts.animateStepTime);
                    }
                }
                // Al llegar aquí, detener el bucle porque la animación manejará el resto
                break;
            }
            // Contar puntos recientes dentro de las últimas 3 horas
            if (now - timestamp < 3 * 60 * 60) {
                pointsRecent++;
            }
            // Incrementar contador total de puntos procesados
            points_in_trace++;
            // Actualizar datos del avión con la entrada de la traza
            this.updateTraceData(state, _now);
            // Guardar la primera posición encontrada para referencia
            if (firstPos == null)
                firstPos = this.position;
            // Si el punto marca un leg, guardar marca de tiempo de tramo
            if (leg_marker) {
                this.leg_ts = _now;
                if (debugTracks) {
                    console.log('leg zulu: ' + zuluTime(new Date(this.leg_ts * 1000)) + ' epoch: ' + this.leg_ts);
                }
            }
            // Si el inicio de leg está fijado por opciones, ajustarlo
            if (legStart != null && legStart > 0 && legStart == i) {
                this.leg_ts = _now;
            }
            // Si el fin de leg está fijado por opciones, ajustarlo
            if (legEnd != null && legEnd < trace.length && legEnd == i + 1) {
                this.leg_ts = _now;
            }
            // Si hay un salto grande de tiempo respecto al anterior punto, marcar stale
            if (_last - _now > 320) {
                stale = true;
            }
            // Si no estamos mostrando por tiempo, actualizar la cola con este punto
            if (!traceOpts.showTime) {
                this.updateTrack(_now, _last, true, stale);
            } else if (this.track == null && lastPosition && this.request_rotation_from_track) {
                // Si aún no hay rumbo, calcular rotación entre la última y la actual
                this.rotation = bearingFromLonLat(lastPosition, this.position);
                this.request_rotation_from_track = false;
            }
            // Actualizar último tiempo procesado y posición previa
            _last = _now;
            lastPosition = this.position;

            // go only 1 step beyond now for replay, end of replay.ival is obeyed via traceOpts.endStamp
            // Si estamos en modo replay y llegamos al "now", salir del bucle
            if (replay && timestamp >= now) {
                //console.log(timestamp - now);
                break;
            }
        }
    }
    // Procesar posiciones recientes (no históricas) acumuladas en this.trace
    for (let i = 0; i < this.trace.length; i++) {
        // Si estamos mostrando traza histórica o en replay, no procesar this.trace
        if (showTrace || replay)
            break;
        const state = this.trace[i];
        // no going backwards in time
        // Evitar procesar puntos con tiempo menor o igual a lo ya manejado
        if (state.now <= _now) {
            //console.log(new Date(1000 * state.now));
            continue;
        }
        // Actualizar tiempo y campos del avión con el estado en memoria
        _now = state.now;
        this.position = state.position;
        this.position_time = _now;
        this.altitude = state.altitude;
        this.alt_rounded = state.alt_rounded;
        this.speed = state.speed;
        this.track = state.track;
        this.rotation = state.rotation;
        // Si hay salto grande hacia atrás en _last, ajustar para evitar líneas muy largas
        if (_last - _now > 30) {
            _last = _now - 1;
        }
        // Añadir este punto a la traza visible
        this.updateTrack(_now, _last);
        _last = _now;
    }


    //if ((this.position == null || tempPlane.position != null) && tempPlane.position_time > this.position_time && !showTrace && !replay) {}
    //console.log(tempPlane.position_time + ' ' + this.position_time);
    // Si el estado temporal tiene información más reciente que la traza y no estamos mostrando traza, restaurar
    if (tempPlane.last_message_time > this.last_message_time && !showTrace && !replay) {
        planeCloneState(this, tempPlane);
        this.updateTrack(this.position_time, _last);
    }
    // Si estamos mostrando traza y no animando por tiempo, añadir la posición actual al final como nuevo segmento
    if (showTrace && !traceOpts.showTime) {

        if (this.track_linesegs.length > 0 && this.position) {
            const proj = ol.proj.fromLonLat(this.position);
            this.track_linesegs[this.track_linesegs.length - 1].fixed.appendCoordinate(proj);
            this.track_linesegs.push({ fixed: new ol.geom.LineString([proj]),
                feature: null,
                estimated: false,
                ground: (this.altitude == "ground"),
                altitude: this.alt_rounded,
                alt_real: this.altitude,
                alt_geom: this.alt_geom,
                position: this.position,
                speed: this.speed,
                ts: this.position_time,
                track: this.rotation,
                rId: this.rId,
                dataSource: this.dataSource,
            });
        }
        // Actualizar "now" para indicar tiempo real al final del procesamiento
        now = new Date().getTime()/1000;
    }
    // Si se están mostrando trazas, marcar la última vez vista como ahora
    if (showTrace) {
        this.seen = 0;
        this.seen_pos = 0;
    }
    // Marcar la entidad como visible para que se muestre en el mapa
    this.visible = true;
    // Si se pidió seguir la traza, activar seguimiento
    if (traceOpts.follow)
        toggleFollow(true);
    // Actualizar marcador o features según se muestre por tiempo o no
    if (traceOpts.showTime) {
        this.updateMarker(true);
    } else {
        this.updateFeatures(true);
    }
    // Obtener tamaño del mapa y calcular área visible para posible centrado
    let mapSize = OLMap.getSize();
    let size = [Math.max(5, mapSize[0] - 280), mapSize[1]];
    // Si la posición actual no está en vista y se quiere centrar en la traza, mover el mapa
    if (!traceOpts.showTime
        && (showTrace || showTraceExit)
        && !multiSelect
        && this.position
        && !(traceOpts.noFollow && traceOpts.noFollow + 3 > new Date().getTime() / 1000)
        && !inView(this.position, myExtent(OLMap.getView().calculateExtent(size)))
        && !inView(firstPos, myExtent(OLMap.getView().calculateExtent(size))))
    {
        OLMap.getView().setCenter(ol.proj.fromLonLat(this.position));
    }
    // Reiniciar indicador de salida de traza
    showTraceExit = false;
    // Intentar cargar información de base de datos si corresponde y pasar la traza reciente o completa
    this.checkForDB(this.recentTrace || this.fullTrace);
    // Señalar que los datos cambiaron para refrescar la UI
    this.dataChanged();
    // Actualizar elementos resaltados y seleccionados en la interfaz
    refreshHighlighted();
    refreshSelected();
    // Si se muestran trazas, refrescar la lista de aviones y la barra de dirección
    if (showTrace) {
        TAR.planeMan.refresh();
        updateAddressBar();
    }
    // Actualizar marca temporal de la entidad
    this.updateTick();
    // Si está activado debug, mostrar contadores de puntos recientes y totales
    if (debugTracks) {
        console.log('3h: ' + pointsRecent.toString().padStart(4, ' ') + ' total: ' + points_in_trace);
    }
    // Restaurar last_info_server anterior si era más reciente o no estaba definida
    if (old_last_info_server > this.last_info_server || !this.last_info_server) {
        this.last_info_server = old_last_info_server;
    }
};
// Actualiza datos de posición y distancia al receptor, y mantiene rastro corto para "globe"
PlaneObject.prototype.updatePositionData = function(now, last, data, init) {
    // Si la posición existe y hay posición del receptor (SitePosition), calcular distancia máxima
    if (this.position && SitePosition) {
        if (pTracks && this.sitedist) {
            this.sitedist = Math.max(ol.sphere.getDistance(SitePosition, this.position), this.sitedist);
        } else if (!init || pTracks) {
            this.sitedist = ol.sphere.getDistance(SitePosition, this.position);
        }
    }
    // Si no estamos en vista globo (o estamos seleccionados), actualizar la cola en el mapa
    if (!globeIndex || this.selected || SelectedAllPlanes || replay) {
        let newPos = this.updateTrack(now, last);
        this.drawLine |= newPos;
    }
    // Si se está mostrando en globo, almacenar muestras cortas de posición para traza en globo
    if (globeIndex && !replay && this.position && this.position_time) {
        if (this.position_time > this.lastTraceTs + 0.1) {
            this.lastTraceTs = this.position_time;
            this.trace.push({
                now: this.position_time,
                position: this.position,
                altitude: this.altitude,
                alt_rounded: this.alt_rounded,
                speed: this.speed,
                track: this.track,
                rotation: this.rotation,
            });
            // Mantener la lista corta para no usar mucha memoria
            if (this.trace.length > 100) {
                this.trace = this.trace.slice(-80);
            }
        }
    }
    // Señalar que los datos cambiaron para refrescar la UI
    this.dataChanged();
}
// Update our data
// Actualiza los datos del avión con un nuevo paquete recibido
PlaneObject.prototype.updateData = function(now, last, data, init) {
    // get location data first, return early if only those are needed.
    // Marca la última vez que el servidor informó algo de este avión
    this.last_info_server = now;
    // Indica si los datos vienen en forma de arreglo compacto
    let isArray = Array.isArray(data);
    // [.hex, .alt_baro, .gs, .track, .lat, .lon, .seen_pos, "mlat"/"tisb"/.type , .flight, .messages]
    //    0      1        2     3       4     5     6                 7               8        9
    // this format is only valid for chunk loading the history
    // Extrae altitud barométrica del paquete (dos formatos soportados)
    const alt_baro = isArray? data[1] : data.alt_baro;
    // Extrae velocidad sobre suelo (ground speed)
    let gs = isArray? data[2] : data.gs;
    // Extrae rumbo transmitido
    const track = isArray? data[3] : data.track;
    // Extrae latitud
    const lat = isArray? data[4] : data.lat;
    // Extrae longitud
    const lon = isArray? data[5] : data.lon;
    // Extrae tiempo desde último mensaje (viene en distintas posiciones)
    let seen = isArray? data[6] : data.seen;
    // Extrae tiempo desde última posición conocida
    let seen_pos = isArray? data[6] : data.seen_pos;
    // Si no hay "seen", usar valor por defecto
    seen = (seen == null) ? 5 : seen;
    // Si no hay "seen_pos" pero sí posición, usar valor por defecto
    seen_pos = (seen_pos == null && lat) ? 5 : seen_pos;
    // Tipo de fuente (mlat/tisb/adsb...)
    let type = isArray? data[7] : data.type;
    // Si no es arreglo pero marca mlat, fijar tipo
    if (!isArray && data.mlat != null && data.mlat.indexOf("lat") >= 0) type = 'mlat';
    // Bandera si es MLAT
    const mlat = (type == 'mlat');
    // Bandera si es TIS-B
    const tisb = (type && type.substring(0,4) == "tisb");
    // Código de vuelo/callsign
    const flight = isArray? data[8] : data.flight;
    // Calcula la hora del último mensaje real usando 'seen'
    this.last_message_time = now - seen;

    // remember last known position even if stale
    // do not show or process mlat positions when filtered out.
    // Si hay lat/lon y no está filtrado MLAT, guardar posición y tiempo
    if (lat != null && lon != null && !(noMLAT && mlat)) {
        this.position   = [lon, lat];
        this.position_time = now - seen_pos;
    }

    // remember last known altitude even if stale
    // Determina nueva altitud desde distintos campos posibles
    let newAlt = null;
    if (alt_baro != null) {
        newAlt = alt_baro;
        this.alt_baro = alt_baro;
    } else if (data.altitude != null) {
        newAlt = data.altitude;
        this.alt_baro = data.altitude;
    } else {
        this.alt_baro = null;
        if (data.alt_geom != null) {
            newAlt = data.alt_geom;
        }
    }
    // Filter anything greater than 12000 fpm

    // Si no hay nueva altitud o es la misma "mala" y es antigua, ignorar
    if (newAlt == null || (newAlt == this.bad_alt && this.seen_pos > 5)) {
        // do nothing
    // Si no hay filtro o condiciones que impidan actualizar, aceptar altitud
    } else if (
        !altitudeFilter
        || this.altitude == null
        || newAlt == "ground"
        || this.altitude == "ground"
        || (seen_pos != null && seen_pos < 2)
    ) {
        this.altitude = newAlt;
        this.altitudeTime = now;
    // Si parece una altitud errónea comparada con historial, marcar como mala
    } else if (
        this.alt_reliable > 0 && this.altBad(newAlt, this.altitude, this.altitudeTime, data)
        && (this.bad_alt == null || this.altBad(newAlt, this.bad_alt, this.bad_altTime, data))
    ) {
        // filter this altitude!
        // Contar como altitud filtrada y guardarla como "mala"
        this.alt_reliable--;
        this.bad_alt = newAlt;
        this.bad_altTime = now;
        if (debugPosFilter) {
            console.log((now%1000).toFixed(0) + ': AltFilter: ' + this.icao
                + ' oldAlt: ' + this.altitude
                + ' newAlt: ' + newAlt
                + ' elapsed: ' + (now-this.altitudeTime).toFixed(0) );
            jumpTo = this.icao;
        }
    } else {
        // good altitude
        // Altitud válida: aceptar y aumentar confianza
        this.altitude = newAlt;
        this.altitudeTime = now;
        this.alt_reliable = Math.min(this.alt_reliable + 1, 3);
    }
    // Actualiza campos derivados de altitud (redondeos, zIndex, etc.)
    this.updateAlt();
    // Si el paquete trae 'speed', usarlo en lugar de gs
    if (data.speed != null) {
        gs = data.speed;
    }

    // needed for track labels
    // Si estamos en modo pTracks, conservar la mayor velocidad observada
    if (pTracks) {
        if (gs != null) {
            this.speed = Math.max(this.speed, gs);
        }
        this.gs = gs;
    } else {
        // Normal: asignar velocidad directamente
        this.speed = gs;
        this.gs = gs;
    }
    // Guardar rumbo y usarlo como rotación visual si existe
    this.track = track;
    if (track != null) {
        // Si viene un cálculo de rumbo, usarlo
        this.rotation = track;
    } else if (data.calc_track) {
        this.rotation = data.calc_track;
    } else {
        // Indicar que la rotación debe calcularse desde la pista si aparece más información
        this.request_rotation_from_track = true;
    }
    // Actualiza flags de tipo, matrícula y callsign
    this.setTypeFlagsReg(data);
    this.setFlight(flight);
    // Determina la fuente de datos (mlat, adsb, uat, etc.)
    if (mlat && noMLAT) {
        this.dataSource = "modeS";
    } else if (mlat) {
        this.dataSource = "mlat";
    } else if (!displayUATasADSB && this.uat && !tisb) {
        this.dataSource = "uat";
    } else if (tisb) {
        this.dataSource = "tisb";
    } else if (type && type.substring(0,4) == "adsr") {
        this.dataSource = "adsr";
    } else if ((lat != null && type == null) || (type && (type.substring(0,4) == "adsb"))) {
        this.dataSource = "adsb";
    } else if (type == 'adsc') {
        this.dataSource = "adsc";
    } else if (type == 'mode_s') {
        this.dataSource = "modeS";
    } else if (type == 'other') {
        this.dataSource = "other";
    } else if (type == 'unknown') {
        this.dataSource = "unknown";
    } else if (type == 'ais') {
        this.dataSource = "ais";
    }
    // Si los datos vinieron como arreglo compacto, actualizar contadores y salir pronto
    if (isArray) {
        this.messages = data[9];
        this.updatePositionData(now, last, data, init);
        return;
    }

    // Update all of our data
    // Actualizar contadores de mensajes y calcular tasa de mensajes
    if (data.messages < this.messages && binCraft) this.messages -= 65536;
    const elapsed = now - this.last;
    if (elapsed > 0) {
        let messageRate = 0;
        if (!this.uat) {
            messageRate = (data.messages - this.msgs1090)/(now - this.last);
            this.msgs1090 = data.messages;
        } else {
            messageRate = (data.messages - this.msgs978)/(uat_now - uat_last);
            this.msgs978 = data.messages;
        }
        if (elapsed > 60) messageRate = 0;
        this.messageRate = (messageRate + this.messageRateOld)/2;
        this.messageRateOld = messageRate;
    }
    // Guardar total de mensajes recibidos
    this.messages = data.messages;
    // Si el paquete trae una tasa ya calculada, usarla
    if (data.messageRate != null) {
        this.messageRate = data.messageRate;
    }
    // Guardar RSSI sólo si es un valor plausible
    if (data.rssi != null && data.rssi > -49.4) {
        this.rssi = data.rssi;
    } else {
        this.rssi = null;
    }
    // Guardar tasa barométrica/vertical proveniente del paquete
    if (data.baro_rate != null)
        this.baro_rate = data.baro_rate;
    else if (data.vert_rate != null)
        this.baro_rate = data.vert_rate;
    else
        this.baro_rate = null;

    // simple fields
    // Campos simples: copiar varios valores directos desde 'data'
    this.alt_geom = data.alt_geom;
    this.ias = data.ias;
    this.tas = data.tas;
    this.track_rate = data.track_rate;
    this.mag_heading = data.mag_heading;
    this.mach = data.mach;
    this.roll = data.roll;
    this.nav_altitude = data.nav_altitude;
    this.nav_heading = data.nav_heading;
    this.nav_modes = data.nav_modes;
    this.nac_p = data.nac_p;
    this.nac_v = data.nac_v;
    this.nic_baro = data.nic_baro;
    this.sil_type = data.sil_type;
    this.sil = data.sil;
    this.nav_qnh = data.nav_qnh;
    this.geom_rate = data.geom_rate;
    this.rc = data.rc;
    // Guardar squawk salvo en replay cuando no se proporciona
    if (!replay || data.squawk != null)
        this.squawk = (data.squawk == null) ? null : `${data.squawk}`;
    this.wd = data.wd;
    this.ws = data.ws;
    this.oat = data.oat;
    this.tat = data.tat;
    this.receiverCount = data.receiverCount;

    // fields with more complex behaviour
    // Campos con lógica adicional
    if (data.version != null) {
        this.version = data.version;
    }
    if (data.category != null) {
        this.category = `${data.category}`;
    }
    // Guardar true heading si viene
    if (data.true_heading != null)
        this.true_heading = data.true_heading;
    else
        this.true_heading = null;
    // Guardar tipo de direccionamiento (addr type)
    if (type != null)
        this.addrtype = type;
    else
        this.addrtype = null;

    // Pick a selected altitude
    // Elegir altitud de navegación preferida si viene en campos específicos
    if (data.nav_altitude_fms != null) {
        this.nav_altitude = data.nav_altitude_fms;
    } else if (data.nav_altitude_mcp != null){
        this.nav_altitude = data.nav_altitude_mcp;
    } else {
        this.nav_altitude = null;
    }

    // Pick vertical rate from either baro or geom rate
    // Elegir tasa vertical preferente (baro > geom > legacy)
    if (data.baro_rate != null) {
        this.vert_rate = data.baro_rate;
    } else if (data.geom_rate != null ) {
        this.vert_rate = data.geom_rate;
    } else if (data.vert_rate != null) {
        // legacy from mut v 1.15
        this.vert_rate = data.vert_rate;
    } else {
        this.vert_rate = null;
    }
    // Preparar cómo obtener rotación visual si hace falta
    this.request_rotation_from_track = false;
    if (replay) {
        this.request_rotation_from_track = true;
    } else if (this.altitude == "ground") {
        if (this.true_heading != null)
            this.rotation = this.true_heading;
        else if (this.mag_heading != null)
            this.rotation = this.mag_heading;
        else if (data.calc_track)
            this.rotation = data.calc_track;
    } else if (this.track != null) {
        this.rotation = this.track;
    } else if (this.true_heading != null) {
        this.rotation = this.true_heading;
    } else if (this.mag_heading != null) {
        this.rotation = this.mag_heading;
    } else if (data.calc_track) {
        this.rotation = data.calc_track;
    } else {
        this.request_rotation_from_track = true;
    }
    // Guardar flag de no GPS si llega
    if (data.nogps != null) {
        this.nogps = data.nogps;
    }
    // Identificador del receptor
    this.rId = data.rId;
    // Pedir info de base de datos si aún no se cargó
    if (!this.dbinfoLoaded) {
        this.checkForDB(data);
    }
    // Guardar ruta si viene
    if (data.route) {
        this.routeString = data.route;
    }
    // Marcar la hora del último paquete y actualizar posición/datos derivados
    this.last = now;
    this.updatePositionData(now, last, data, init);
    return;
};
// Actualiza visibilidad y elementos en mapa
PlaneObject.prototype.updateTick = function(redraw) {
    this.updateVisible();
    this.updateFeatures(redraw);
};
// Calcula si el avión está dentro del área que se está dibujando
PlaneObject.prototype.updateVisible = function() {
    this.inView = inView(this.position, lastRenderExtent);
    this.visible = this.checkVisible() && !this.isFiltered();
};
// Actualiza las líneas y el marcador según visibilidad
PlaneObject.prototype.updateFeatures = function(redraw) {
    // Si es visible, puede necesitar actualizar líneas o marcador
    if (this.visible) {
        if (this.drawLine || redraw || this.lastVisible != this.visible)
            this.updateLines();

        this.updateMarker(redraw);
    }
    // Si antes era visible y ahora no, limpiar elementos
    if (!this.visible && this.lastVisible) {
        this.clearMarker();
        this.clearLines();
    }
    // Guardar estado previo de visibilidad
    this.lastVisible = this.visible;
};
// Elimina el marcador visual del mapa
PlaneObject.prototype.clearMarker = function() {
    this.markerDrawn = false;
    // Si hay marcador OL visible, quitarlo
    if (this.marker && this.marker.visible) {
        PlaneIconFeatures.removeFeature(this.marker);
        this.marker.visible = false;
    }
    // Borrar referencia al marcador
    delete this.marker;
    // Si hay marcador WebGL visible, quitarlo
    if (this.glMarker && this.glMarker.visible) {
        webglFeatures.removeFeature(this.glMarker);
        this.glMarker.visible = false;
    }
    delete this.glMarker;
    delete this.styleKey;
    delete this.olPoint;
};

// Update our marker on the map
// Actualiza o crea el marcador del avión en el mapa
PlaneObject.prototype.updateMarker = function(moved) {
    // Si no debe mostrarse, limpiar y salir
    if (!this.visible || this.position == null || (pTracks && (SelectedAllPlanes || !this.selected))) {
        if (this.markerDrawn)
            this.clearMarker();
        return;
    }
    // Indica que el marcador está dibujado
    this.markerDrawn = true;
    // Asegura la proyección correcta del punto en el mapa
    this.setProjection();
    // Determina si va hacia el este para elegir icono
    let eastbound = this.rotation < 180;
    let icaoType = this.icaoType;
    // Ajustes para tipos que cambian según velocidad
    if (this.speed > 120) {
        if (icaoType == 'V22')
            icaoType = 'V22F';
        if (icaoType == 'B609')
            icaoType = 'B609F';
    }
    // Si no hay tipo y squawk 7777, marcar como torre
    if (icaoType == null && this.squawk == 7777)
        icaoType = 'TWR';
    // Clave base que identifica la forma del marcador
    let baseMarkerKey = this.category + "_"
        + this.typeDescription + "_" + this.wtc  + "_" + icaoType + '_' + (this.altitude == "ground") + eastbound;
    // Si cambió la forma base, obtener nueva forma
    if (!this.shape || this.baseMarkerKey != baseMarkerKey) {
        this.baseMarkerKey = baseMarkerKey;
        let baseMarker = null;
        try {
            baseMarker = getBaseMarker(this.category, icaoType, this.typeDescription, this.wtc, this.addrtype, this.altitude, eastbound);
        } catch (error) {
            console.error(error);
            console.log(baseMarkerKey);
        }
        if (!baseMarker) {
            baseMarker = ['pumpkin', 1];
        }
        this.shape = shapes[baseMarker[0]];
        this.baseScale = baseMarker[1] * 0.96;
    }
    // Calcula escala final del icono y ancho de contorno
    this.scale = iconSize * this.baseScale;
    this.strokeWidth = outlineWidth * ((this.selected && !SelectedAllPlanes && !onlySelected) ? 0.85 : 0.7) / this.baseScale;
    // Crea feature OL si corresponde y no existe
    if (!this.marker && (!webgl || g.enableLabels)) {
        this.marker = new ol.Feature(this.olPoint);
        this.marker.hex = `${this.icao}`;
    }
    // Si usamos WebGL y no queremos labels, ocultar el feature OL
    if (webgl && !g.enableLabels && this.marker) {
        if (this.marker.visible) {
            PlaneIconFeatures.removeFeature(this.marker);
            this.marker.visible = false;
        }
    }
    // Preparar marcador WebGL si corresponde
    if (webgl) {
        if (!this.glMarker) {
            this.glMarker = new ol.Feature(this.olPoint);
            this.glMarker.hex = `${this.icao}`;
        }

        this.setMarkerRgb();
        const iconRotation = this.shape.noRotate ? 0 : this.rotation;
        this.glMarker.set('rotation', iconRotation * Math.PI / 180.0 + g.mapOrientation);
        this.glMarker.set('scale', this.scale * Math.max(this.shape.w, this.shape.h) / glIconSize);
        this.glMarker.set('sx', getSpriteX(this.shape) * glIconSize);
        this.glMarker.set('sy', getSpriteY(this.shape) * glIconSize);
    }
    // Si hay feature OL y se deben mostrar etiquetas, actualizar icono SVG/texto
    if (this.marker && (!webgl || g.enableLabels)) {
        this.updateIcon();
        if (!this.marker.visible) {
            this.marker.visible = true;
            PlaneIconFeatures.addFeature(this.marker);
        }
    }
    // Añadir o quitar feature WebGL según visibilidad
    if (webgl && this.glMarker && !this.glMarker.visible) {
        this.glMarker.visible = true;
        webglFeatures.addFeature(this.glMarker);
    }
    if (!webgl && this.glMarker && this.glMarker.visible) {
        webglFeatures.removeFeature(this.glMarker);
        this.glMarker.visible = false;
    }
};


// return the styling of the lines based on altitude
// Devuelve estilos de líneas según altitud del segmento
function altitudeLines (segment) {
    // Obtiene color HSL para la altitud del segmento
    let colorArr = altitudeColor(segment.altitude);
    // Si el segmento es estimado, aclarar un poco la luz
    if (segment.estimated)
        colorArr = [colorArr[0], colorArr[1], colorArr[2] * 0.8];
    //let color = 'hsl(' + colorArr[0].toFixed(0) + ', ' + colorArr[1].toFixed(0) + '%, ' + colorArr[2].toFixed(0) + '%)';
    // Convertir HSL a RGB string
    let color = hslToRgb(colorArr);
    // Si el usuario forzó pistas monocromas, usar ese color
    if (monochromeTracks)
        color = monochromeTracks;
    // Determina si la entrada viene de modeS
    const modeS = (segment.dataSource == 'modeS');
    // Generar clave para cachear estilos
    const lineKey = '_' + color + debugTracks + noVanish + segment.estimated + newWidth + modeS + segment.noLabel + segment.estimatedFill;
    // Si ya hay estilo en cache, devolverlo
    if (lineStyleCache[lineKey])
        return lineStyleCache[lineKey];
    // Ajuste de grosor si es estimado
    let multiplier = segment.estimated ? 0.6 : 1;

    if (noVanish)
        multiplier *= (segment.estimated ? 0.3 : 0.6);

    let join = 'round';
    let cap = 'square';
    // Si no estamos en modo debug, crear estilos normales
    if (!debugTracks) {
        // Para modeS mostrar puntos en lugar de línea continua
        if (modeS) {
            lineStyleCache[lineKey]	= [
                new ol.style.Style({}),
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 3 * newWidth,
                        fill: new ol.style.Fill({
                            color: color
                        })
                    }),
                    geometry: function(feature) {
                        return new ol.geom.MultiPoint(feature.getGeometry().getCoordinates());
                    }
                })
            ];
        } else if (segment.estimated && !noVanish) {
            // Estimado: dibujar línea punteada con sombra negra
            lineStyleCache[lineKey]	= [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 2 * newWidth * 0.3,
                        lineJoin: join,
                        lineCap: cap,
                    })
                }),
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: color,
                        width: 2 * newWidth,
                        lineDash: [10, 20 + 3 * newWidth],
                        lineDashOffset: 5,
                        lineJoin: join,
                        lineCap: cap,
                    }),
                })
            ];
        } else if (segment.estimated && pTracks) {
            // En pTracks con estimado y ciertas opciones, no dibujar estilo
            lineStyleCache[lineKey]	= new ol.style.Style({});
        } else {
            // Estilo normal: línea sólida del color calculado
            lineStyleCache[lineKey]	= new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 2 * newWidth * multiplier,
                    lineJoin: join,
                    lineCap: cap,
                })
            });
        }
    } else {
        // Modo debug: estilo con puntos y línea fina
        lineStyleCache[lineKey] = [
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: (segment.estimatedFill ? 0 : 2) * newWidth,
                    fill: new ol.style.Fill({
                        color: color
                    })
                }),
                geometry: function(feature) {
                    return new ol.geom.MultiPoint(feature.getGeometry().getCoordinates());
                }
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: ((segment.noLabel || segment.estimated) ? 0.5 : 1) * newWidth * multiplier,
                    lineJoin: join,
                    lineCap: cap,
                })
            })
        ];
    }
    // Devolver estilo generado y cachearlo
    return lineStyleCache[lineKey];
}

// Update our planes tail line,
// Actualiza las líneas (cola/traza) mostradas para este avión
PlaneObject.prototype.updateLines = function() {
    // indicar que no hace falta dibujar la línea por ahora
    this.drawLine = false;
    // si no debe mostrarse o no hay posición o no está seleccionado, limpiar y salir
    if (!this.visible || this.position == null || (!this.selected && !SelectedAllPlanes)) {
        // si ya había líneas dibujadas, ocultarlas
        if (this.linesDrawn) {
            this.clearLines();
        }
        return;
    }
    // marcar que ahora las líneas sí están dibujadas
    this.linesDrawn = true;
    // eliminar temporizador de borrado de traza pendiente
    this.clearTraceAfter = null;
    // si no hay segmentos de traza, no hay nada que dibujar
    if (this.track_linesegs.length == 0)
        return;
    // asegurar que las capas para traza existan
    this.checkLayers();
    // listas temporales para añadir geometrías y etiquetas nuevas
    let trail_add = [];
    let label_add = [];
    // si la capa está oculta, hacerla visible
    if (!this.layer.getVisible())
        this.layer.setVisible(true);
    // si se deben ver etiquetas o trazas, asegurar la capa de etiquetas visible
    if (trackLabels || showTrace) {
        if (!this.layer_labels.getVisible())
            this.layer_labels.setVisible(true);
    } else if (this.layer_labels && this.layer_labels.getVisible()) {
        // si no deben verse, ocultar la capa de etiquetas
        this.layer_labels.setVisible(false);
    }

    // create the new elastic band feature
    // quitar la "línea elástica" anterior (la parte desde último punto al avión)
    if (this.elastic_feature) {
        this.trail_features.removeFeature(this.elastic_feature);
        this.elastic_feature = null;
    }

    // create any missing fixed line features
    // crear características fijas faltantes para cada segmento de la traza
    for (let i = this.track_linesegs.length-1; i >= 0; i--) {
        let seg = this.track_linesegs[i];
        // si ya tiene feature y (no pedimos labels o ya tiene label) salir del bucle
        if (seg.feature && (!trackLabels || seg.label))
            break;
        // si el segmento está filtrado por altitud o no tiene estilo, marcarlo como procesado
        if ((filterTracks && altFiltered(seg.altitude)) || altitudeLines(seg) == nullStyle) {
            seg.feature = true;
        } else if (!seg.feature) {
            // crear feature a partir de la geometría fija del segmento
            seg.feature = true;
            let feature = new ol.Feature(seg.fixed);
            feature.setStyle(altitudeLines(seg));
            feature.hex = `${this.icao}`;
            feature.timestamp = Number(seg.ts);
            trail_add.push(feature);
        }
        // manejo de la etiqueta del segmento
        if (seg.label) {
            // nothing to do, label already present
        } else if ((filterTracks && altFiltered(seg.altitude)) || seg.noLabel) {
            // marcar que no habrá etiqueta para este segmento
            seg.label = true;
        } else if (
            trackLabels ||
            ((i == 0 || i == this.track_linesegs.length-1 ||seg.leg) && showTrace && g.enableLabels)
        ) {
            // 0 vertical rate to avoid arrow
            // construir texto y posición para la etiqueta del segmento
            let altString;
            if(seg.alt_real == "ground") {
                altString = "Ground";
            } else {
                let alt;
                if (labelsGeom) {
                    alt = adjust_geom_alt(seg.alt_geom, seg.position);
                } else {
                    alt = adjust_baro_alt(seg.alt_real);
                }

                if (alt == null) {
                    altString = (NBSP+'?'+NBSP);
                } else {
                    altString = format_altitude_brief(alt, 0, DisplayUnits, showLabelUnits);
                }
            }
            // texto de velocidad formateada o signo de desconocido
            const speedString = (seg.speed == null) ? (NBSP+'?'+NBSP) : format_speed_brief(seg.speed, DisplayUnits, showLabelUnits).padStart(3, NBSP);
            // crear feature de etiqueta en la primera coordenada del segmento
            seg.label = new ol.Feature(new ol.geom.Point(seg.fixed.getFirstCoordinate()));
            let timestamp1;
            let timestamp2 = "";
            // decidir si usamos tiempos históricos o en vivo, y su formato
            const historic = (showTrace || replay);
            const useLocal = ((historic && !utcTimesHistoric) || (!historic && !utcTimesLive));
            const date = new Date(seg.ts * 1000);
            if (!date) {
                console.log(seg);
            }
            let refDate = showTrace ? traceDate : new Date();
            if (replay) { refDate = replay.ts };
            if (useLocal && historic) {
                // marca la fecha local si es histórico y se pidió local
                timestamp1 = lDateString(date);
                timestamp1 += '\n';
            } else if (getDay(refDate) == getDay(date)) {
                timestamp1 = "";
            } else {
                // mostrar la fecha (local o Z) si es de otro día
                if (useLocal) {
                    timestamp1 = lDateString(date);
                } else {
                    timestamp1 = zDateString(date);
                }
                timestamp1 += '\n';
            }
            // hora local o Zulu según configuración
            if (useLocal) {
                timestamp2 += localTime(date);
            } else {
                timestamp2 += zuluTime(date);
            }
            // añadir resolución extra si se pide
            if (traces_high_res || debugTracks) {
                timestamp2 += '.' + (Math.floor((seg.ts*10)) % 10);
            }
            // añadir zona horaria si es histórico y no usa UTC, o añadir 'Z' si no es local
            if (showTrace && !utcTimesHistoric) {
                timestamp2 += '\n' + TIMEZONE;
            } else if (!useLocal) {
                timestamp2 += NBSP + 'Z';
            }
            // construir el texto final de la etiqueta (velocidad, altitud, tiempo...)
            let text =
                speedString.padStart(3, NBSP) + "  "
                + altString.padStart(6, NBSP)
                + "\n"
                //+ NBSP + format_track_arrow(seg.track)
                + timestamp1 + timestamp2;
            if (seg.rId && show_rId) {
                // opcional: añadir identificador del receptor
                text += "\n" + seg.rId.substring(0,9); //+ "\n" + seg.rId.substring(9,18);
            }

            if (showTrace && !trackLabels)
                text = timestamp1 + timestamp2;
            // determinar color y orden de apilamiento (zIndex) de la etiqueta
            let fill = labelFill;
            let zIndex = -i - 50 * (seg.alt_real == null);
            if (seg.leg == 'start') {
                fill = new ol.style.Fill({color: '#88CC88' });
                zIndex += 123499;
            }
            if (seg.leg == 'end') {
                fill = new ol.style.Fill({color: '#8888CC' });
                zIndex += 123455;
            }
            // decidir alineamiento vertical según dirección del track
            const otherDiag = seg.track != null && ((seg.track > 270 && seg.track < 360) || (seg.track > 90 && seg.track < 180));
            // aplicar estilo de texto y punto pequeño junto a la etiqueta
            seg.label.setStyle(
                new ol.style.Style({
                    text: new ol.style.Text({
                        text: `${text}`,
                        fill: fill,
                        stroke: labelStroke,
                        textAlign: 'left',
                        //backgroundFill: bgFill,
                        textBaseline: otherDiag ? 'bottom' : 'top',
                        font: labelFont,
                        offsetX: (otherDiag ? 4 : 8) * globalScale,
                        offsetY: (otherDiag ? -4 : 8) * globalScale,
                    }),
                    image: new ol.style.Circle({
                        radius: 2 * globalScale,
                        fill: blackFill,
                    }),
                    zIndex: Number(zIndex),
                })
            );
            // marcar metadatos de la etiqueta y añadir a la lista de inserción
            seg.label.hex = `${this.icao}`;
            seg.label.timestamp = Number(seg.ts);
            seg.label.isLabel = true;
            label_add.push(seg.label)
        }
    }
    // construir la "línea elástica" desde el último tramo fijo hasta la posición actual
    let lastseg = this.track_linesegs[this.track_linesegs.length - 1];
    let lastfixed = lastseg.fixed.getCoordinateAt(1.0);
    let geom = new ol.geom.LineString([lastfixed, ol.proj.fromLonLat(this.position)]);


    if (!showTrace) {
        // crear feature elástico para la parte final que sigue al avión
        this.elastic_feature = new ol.Feature(geom);
        if (filterTracks && altFiltered(lastseg.altitude)) {
            // si está filtrado, no dibujar
            this.elastic_feature.setStyle(nullStyle);
        } else {
            // asignar estilo según altitud al segmento final
            this.elastic_feature.setStyle(altitudeLines(lastseg));
        }
        this.elastic_feature.hex = this.icao;
        trail_add.push(this.elastic_feature);
    }

    // añadir todas las geometrías y etiquetas nuevas a sus fuentes
    if (trail_add.length > 0)
        this.trail_features.addFeatures(trail_add);
    if (this.trail_labels && label_add.length > 0)
        this.trail_labels.addFeatures(label_add);

};
// Borra y reinicia la traza en memoria
PlaneObject.prototype.resetTrail = function() {
    this.removeTrail();
    this.track_linesegs = [];

}
// Elimina features de traza y referencias en memoria
PlaneObject.prototype.removeTrail = function() {

    if (this.trail_features)
        this.trail_features.clear();
    if (this.trail_labels)
        this.trail_labels.clear();

    for (let i in this.track_linesegs) {
        delete this.track_linesegs[i].feature;
        delete this.track_linesegs[i].label;
    }
    this.elastic_feature = null;
};

// This is to remove the line from the screen if we deselect the plane
// Oculta las capas de líneas y etiquetas del mapa
PlaneObject.prototype.clearLines = function() {
    this.linesDrawn = false;
    if (this.layer && this.layer.getVisible()) {
        this.layer.setVisible(false);
    }
    if (this.layer_labels && this.layer_labels.getVisible()) {
        this.layer_labels.setVisible(false);
    }
};
// Borra la traza completa y limpia capas; en globo borra referencias a trazas
PlaneObject.prototype.clearTrace = function() {
    this.clearTraceAfter = null;

    this.clearLines();
    this.removeTrail();

    if (globeIndex) {
        this.recentTrace = null;
        this.fullTrace = null;
    }
}
// Elimina capas y referencias asociadas a la traza
PlaneObject.prototype.destroyTrace = function() {
    this.clearTrace();
    if (this.layer) {
        trailGroup.remove(this.layer);
        this.trail_features = null;
        this.layer = null;
    }
    if (this.layer_labels) {
        trailGroup.remove(this.layer_labels);
        this.trail_labels = null;
        this.layer_labels = null;
    }
}
// Crea la fila (TR) en la lista de aviones y añade escuchas de eventos
PlaneObject.prototype.makeTR = function (trTemplate) {

    this.trCache = [];
    this.bgColorCache = undefined;
    this.tr = trTemplate;
    // escucha click: seleccionar avión y seguir o no según visibilidad del mapa
    this.clickListener = (evt) => {
        if (evt.srcElement instanceof HTMLAnchorElement) {
            evt.stopPropagation();
            return;
        }

        if(!mapIsVisible) {
            selectPlaneByHex(this.icao, {follow: true});
        } else {
            selectPlaneByHex(this.icao, {follow: false});
        }
        evt.preventDefault();
    };

    this.tr.addEventListener('click', this.clickListener);
    // si no estamos en vista globo, añadir doble click para abrir mapa y seguir
    if (!globeIndex) {
        this.dblclickListener = (evt) => {
            if(!mapIsVisible) {
                showMap();
            }
            selectPlaneByHex(this.icao, {follow: true});
            evt.preventDefault();
        };

        this.tr.addEventListener('dblclick', this.dblclickListener);
    }
};
// Destruye la fila y quita escuchas
PlaneObject.prototype.destroyTR = function (trTemplate) {
    if (this.tr == null)
        return;

    this.tr.removeEventListener('click', this.clickListener);
    this.tr.removeEventListener('dblclick', this.dblclickListener);

    delete this.clickListener;
    delete this.dblclickListener;

    if (this.tr.parentNode) {
        this.tr.parentNode.removeChild(this.tr);
    }

    this.tr.remove();

    this.tr = null;
};
// Destruye el objeto avión (limpia todo y borra propiedades)
PlaneObject.prototype.destroy = function() {
    this.clearLines();
    this.clearMarker();
    this.visible = false;
    deselect(this);
    this.destroyTR();
    this.destroyTrace();
    for (let key in Object.keys(this)) {
        delete this[key];
    }
};
// Redondea la altitud para agrupar colores/estilos
function calcAltitudeRounded(altitude) {
    if (altitude == null) {
        return null;
    } else if (altitude == "ground") {
        return altitude;
    } else if (altitude > 8000 || heatmap) {
        return (altitude/500).toFixed(0)*500;
    } else {
        return (altitude/125).toFixed(0)*125;
    }
};
// Dibuja punto rojo y línea para una posición marcada como errónea
PlaneObject.prototype.drawRedDot = function(bad_position) {
    this.checkLayers();
    // si debug y carga finalizada y no es el seleccionado, centrar mapa en el punto erróneo
    if (debugJump && loadFinished && SelectedPlane != this) {
        OLMap.getView().setCenter(ol.proj.fromLonLat(bad_position));
        selectPlaneByHex(this.icao, false);
    }
    // crear punto rojo en la traza
    let badFeat = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(bad_position)));
    badFeat.setStyle(this.dataSource == "mlat"  ? badDotMlat : badDot);
    this.trail_features.addFeature(badFeat);
    // dibujar línea desde la posición anterior al punto erróneo
    let geom = new ol.geom.LineString([ol.proj.fromLonLat(this.prev_position), ol.proj.fromLonLat(bad_position)]);
    let lineFeat = new ol.Feature(geom);
    lineFeat.setStyle(this.dataSource == "mlat" ? badLineMlat : badLine);
    this.trail_features.addFeature(lineFeat);
};
// Convierte color hex a HSL (matiz, saturación, luminosidad)
function hexToHSL(hex) {
    let r = +('0x'+ hex[1] + hex[2]) / 255;
    let g = +('0x'+ hex[3] + hex[4]) / 255;
    let b = +('0x'+ hex[5] + hex[6]) / 255;
    let cmin = Math.min(r,g,b);
    let cmax = Math.max(r,g,b);
    let delta = cmax - cmin;
    let h = 0, s = 0, l = 0;
    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s *= 100;
    l *= 100;

    return [h, s, l];
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
// Convierte HSL a RGB o cadena rgba/rgb según se pida
function hslToRgb(arr, opacity){
    let h = arr[0];
    let s = arr[1];
    let l = arr[2];
    let r, g, b;

    h /= 360;
    s *= 0.01;
    l *= 0.01;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        let hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    if (opacity == 'array')
        return [ Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) ];

    if (opacity != null)
        return 'rgba(' + Math.round(r * 255) + ', ' + Math.round(g * 255) + ', ' +  Math.round(b * 255) + ', ' + opacity + ')';
    else
        return 'rgb(' + Math.round(r * 255) + ', ' + Math.round(g * 255) + ', ' +  Math.round(b * 255) + ')';
}
// Comprueba si una nueva altitud parece errónea comparada con la anterior (fpm demasiado alto)
PlaneObject.prototype.altBad = function(newAlt, oldAlt, oldTime, data) {
    let max_fpm = 12000;
    if (data.geom_rate != null)
        max_fpm = 1.3*Math.abs(data.goem_rate) + 5000;
    else if (data.baro_rate != null)
        max_fpm = 1.3*Math.abs(data.baro_rate) + 5000;

    const delta = Math.abs(newAlt - oldAlt);
    const fpm = (delta < 800) ? 0 : (60 * delta / (now - oldTime + 2));
    return fpm > max_fpm;
};
// Solicita datos del avión desde la base de datos y aplica resultados
PlaneObject.prototype.getAircraftData = function() {
    if (0) {
        this.dbinfoLoaded = true;
        return;
    }
    if (this.dbLoad) {
        return;
    }
    this.dbLoad = true;

    let req = dbLoad(this.icao);

    req.then(
        data => {
            //console.log('fromDB');
            if (this.dbinfoLoaded)
                return;
            this.dbinfoLoaded = true;
            delete this.dbLoad;
            if (data == null) {
                //console.log(this.icao + ': Not found in database!');
                return;
            }
            if (data == "strange") {
                //console.log(this.icao + ': Database malfunction!');
                return;
            }


            //console.log(this.icao + ': loaded!');
            // format [r:0, t:1, f:2]

            if (data[1]) {
                this.icaoType = `${data[1]}`;
                this.setTypeData();
            }

            if (data[3]) {
                this.typeLong = `${data[3]}`;
            }

            if (data[2]) {
                this.military = (data[2][0] == '1');
                this.interesting = (data[2][1] == '1');
                this.pia = (data[2][2] == '1');
                this.ladd = (data[2][3] == '1');
                if (this.pia)
                    this.registration = null;
            }

            if (data[0]) {
                this.registration = `${data[0]}`;
            }

            this.dataChanged();

            data = null;
        },
        e => {
            delete this.dbLoad;
            if (e.http_status == 'timeout') {
                this.getAircraftData();
            } else if (e.http_status == 'other') {
                this.dbinfoLoaded = true;
            } else {
                console.log(this.icao + ': Unrecognized Database load error: ' + e);
                this.dbinfoLoaded = true;
            }
        });
};
// Mantiene sólo los segmentos recientes según timeout temporal
PlaneObject.prototype.reapTrail = function() {
    const oldSegs = this.track_linesegs;
    this.track_linesegs = [];
    this.history_size = 0;
    for (let i in oldSegs) {
        const seg = oldSegs[i];
        if (seg.ts + tempTrailsTimeout > now) {
            this.history_size += seg.fixed.getCoordinates().length;
            this.track_linesegs.push(seg);
        }
    }
    if (this.track_linesegs.length != oldSegs.length) {
        this.removeTrail();
        this.updateTick(true);
    }
};
// Comprueba si el ICAO pertenece a rango militar conocido
PlaneObject.prototype.milRange = function() {
    if (this.fakeHex) // non-icao hex
        return false;
    for (let i in milRanges) {
        const r = milRanges[i];
        if (this.numHex >= r[0] && this.numHex <= r[1])
            return true;
    }
    return false;
};
// Actualiza datos del avión a partir de una entrada de traza (formato compacto)
PlaneObject.prototype.updateTraceData = function(state, _now) {
    const lat = state[1];
    const lon = state[2];
    const altitude = state[3];
    const gs = state[4];
    const track = state[5];
    const rate_geom = state[6] & 4;
    const alt_geom = state[6] & 8;
    const rate = state[7];
    const data = state[8];
    const type = state[9];
    const geom_alt = state[10];
    const geom_rate = state[11];
    const ias = state[12];
    const roll = state[13];
    const rId = state[14];

    // guardar posición y tiempos como si viniera en paquete en vivo
    this.position = [lon, lat];
    this.position_time = _now;
    this.last_message_time = _now;
    this.altitude = altitude;

    if (altitude && altitude != "ground" && this.geom_diff_ts && _now - this.geom_diff_ts < 60) {
        this.alt_geom = altitude + this.geom_diff;
    }

    this.updateAlt();

    if (alt_geom) {
        this.alt_geom = altitude;
        //this.alt_baro = null;
    } else {
        this.alt_baro = altitude;
        //this.alt_geom = null;
    }
    this.speed = gs;
    this.gs = gs;

    if (altitude == 'ground') {
        this.true_heading = track;
        this.track = null;
    } else {
        this.track = track;
        //this.true_heading = null;
    }

    if (track)
        this.rotation = track;
    else
        this.request_rotation_from_track = true;

    this.vert_rate = rate;
    if (rate_geom) {
        this.geom_rate = rate;
        this.baro_rate = null;
    } else {
        this.baro_rate = rate;
        this.geom_rate = null;
    }

    if (geom_alt !== undefined) {
        this.alt_geom = geom_alt;
    }
    if (geom_rate !== undefined) {
        this.geom_rate = geom_rate;
    }

    if (roll !== undefined)
        this.roll = roll;
    if (ias !== undefined)
        this.ias = ias;
    if (type !== undefined)
        this.addrtype = (type == null) ? null : `${type}`;

    if (rId !== undefined)
        this.rId = rId;

    if (data != null) {
        this.setFlight(data.flight);

        if (data.alt_geom != null && !alt_geom && altitude != null && altitude != "ground") {
            //this.alt_geom = altitude + this.geom_diff;
            this.geom_diff = data.alt_geom - altitude;
            this.geom_diff_ts = _now;
        }

        this.addrtype = (data.type == null) ? null : `${data.type}`;
        // aplicar campos adicionales que vengan en la entrada compacta
        this.alt_geom = data.alt_geom;
        this.ias = data.ias;
        this.tas = data.tas;
        this.track = data.track;
        this.mag_heading = data.mag_heading;
        this.true_heading = data.true_heading;
        this.mach = data.mach;
        this.track_rate = data.track_rate;
        this.roll = data.roll;
        this.nav_altitude = data.nav_altitude;
        this.nav_heading = data.nav_heading;
        this.nav_modes = data.nav_modes;
        this.nac_p = data.nac_p;
        this.nac_v = data.nac_v;
        this.nic_baro = data.nic_baro;
        this.sil_type = data.sil_type;
        this.sil = data.sil;
        this.nav_qnh = data.nav_qnh;
        this.baro_rate = data.baro_rate;
        this.geom_rate = data.geom_rate;
        this.rc = data.rc;
        this.squawk = (data.squawk == null) ? null : `${data.squawk}`;

        this.wd = data.wd;
        this.ws = data.ws;
        this.oat = data.oat;
        this.tat = data.tat;

        // fields with more complex behaviour

        this.version = data.version;
        if (data.category != null) {
            this.category = `${data.category}`;
        }

        if (data.nav_altitude_fms != null) {
            this.nav_altitude = data.nav_altitude_fms;
        } else if (data.nav_altitude_mcp != null){
            this.nav_altitude = data.nav_altitude_mcp;
        } else {
            this.nav_altitude = null;
        }
    }
    // deducir fuente según tipo
    if (!this.addrtype) {
        this.dataSource = "unknown";
    } else if (this.addrtype.substring(0,4) == "adsb") {
        this.dataSource = "adsb";
    } else if (this.addrtype.substring(0,4) == "adsr") {
        this.dataSource = "adsr";
    } else if (this.addrtype == "mlat") {
        this.dataSource = "mlat";
    } else if (this.addrtype == "adsb_icao_nt") {
        this.dataSource = "modeS";
    } else if (this.addrtype == 'mode_s') {
        this.dataSource = "modeS";
    } else if (this.addrtype.substring(0,4) == "tisb") {
        this.dataSource = "tisb";
    } else if (this.addrtype == 'adsc') {
        this.dataSource = "adsc";
    } else if (this.addrtype == 'other') {
        this.dataSource = "other";
    } else if (this.addrtype == 'unknown') {
        this.dataSource = "unknown";
    }

};
// Crea más puntos intermedios entre puntos para rutas largas (suavizado)
function makeCircle(points, greyskull) {
    let out = points;
    //console.log('1: ' + out.map(x => [Math.round(x[0]), Math.round(x[1])]));
    for (let k = 0; k < greyskull; k++) {
        out = [points[0]];
        for (let j = 1; j < points.length; j++) {
            let i = j - 1;
            out.push(midpoint(points[i], points[j]));
            out.push(points[j]);
            //console.log('added 2: ' + out.map(x => [Math.round(x[0]), Math.round(x[1])]));
        }
        points = out;
    }

    return out;
}

// adapted from https://github.com/seangrogan/great_circle_calculator
// calcula punto medio geodésico entre dos coordenadas
function midpoint(from, to) {
    let lon1 = from[0] * (Math.PI/180);
    let lat1 = from[1] * (Math.PI/180);
    let lon2 = to[0] * (Math.PI/180);
    let lat2 = to[1] * (Math.PI/180);

    let b_x = Math.cos(lat2) * Math.cos(lon2 - lon1);
    let b_y = Math.cos(lat2) * Math.sin(lon2 - lon1);
    let lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + b_x) * (Math.cos(lat1) + b_x) + b_y * b_y));
    let lon3 = lon1 + Math.atan2(b_y, Math.cos(lat1) + b_x);
    lat3 /= (Math.PI/180);
    lon3 /= (Math.PI/180);
    lon3 = (lon3 + 540) % 360 - 180;
    return [lon3, lat3];
}
// Manejo especial cuando la ruta cruza la línea 180/-180 para dividir en dos segmentos visibles
PlaneObject.prototype.cross180 = function(on_ground, is_leg) {
    let sign1 = Math.sign(this.prev_position[0]);
    let sign2 = Math.sign(this.position[0]);

    let out = makeCircle([this.prev_position, this.position], 8);

    //console.log([...out]);

    let seg1 = [];
    let seg2 = [];

    let tmp;

    while ((tmp = out.shift()) != null) {
        if (sign1 == Math.sign(tmp[0]))
            seg1.push(tmp);
        else
            seg2.push(tmp);
    }
    //console.log([...seg1]);
    //console.log([...seg2]);
    let before = seg1[seg1.length - 1];
    let after = seg2[0];
    // weight according to the opposite distance, well longitude difference
    // not perfect, good enough
    let afterWeight = Math.abs(sign1 * 180 - before[0]);
    let beforeWeight = Math.abs(sign2 * 180 - after[0]);
    let midLat = (beforeWeight * before[1] + afterWeight * after[1]) / (beforeWeight + afterWeight);

    let midPoint1 = [sign1 * 180, midLat];
    let midPoint2 = [sign2 * 180, midLat];

    seg1.push(midPoint1);
    seg2.unshift(midPoint2);

    for (let i in seg1)
        seg1[i] = ol.proj.fromLonLat(seg1[i]);
    for (let i in seg2)
        seg2[i] = ol.proj.fromLonLat(seg2[i]);

    seg1.unshift(seg1[0]);

    this.track_linesegs.push({ fixed: new ol.geom.LineString([seg1.shift()]),
        feature: null,
        estimated: true,
        ground: (this.prev_alt == "ground"),
        altitude: this.prev_alt_rounded,
        alt_real: this.prev_alt,
        alt_geom: this.prev_alt_geom,
        position: this.prev_position,
        speed: this.prev_speed,
        ts: this.prev_time,
        track: this.prev_rot,
        leg: is_leg,
        rId: this.prev_rId,
    });

    this.track_linesegs.push({ fixed: new ol.geom.LineString(seg1),
        feature: null,
        estimated: true,
        ground: (this.prev_alt == "ground"),
        altitude: this.prev_alt_rounded,
        alt_real: this.prev_alt,
        alt_geom: this.prev_alt_geom,
        position: this.prev_position,
        speed: this.prev_speed,
        track: this.prev_rot,
        ts: NaN,
        noLabel: true,
        rId: this.prev_rId,
    });

    this.track_linesegs.push({ fixed: new ol.geom.LineString(seg2),
        feature: null,
        estimated: true,
        ground: (this.prev_alt == "ground"),
        altitude: this.prev_alt_rounded,
        alt_real: this.prev_alt,
        alt_geom: this.prev_alt_geom,
        position: this.prev_position,
        speed: this.prev_speed,
        track: this.prev_rot,
        ts: NaN,
        noLabel: true,
        rId: this.prev_rId,
    });
};
// marcar que los datos cambiaron y comprobar ruta si aplica
PlaneObject.prototype.dataChanged = function() {
    this.refreshTR = 0;
    if (useRouteAPI){
        this.routeCheck();
    }
}
// devuelve si el ICAO es no estándar (prefijo '~')
PlaneObject.prototype.isNonIcao = function() {
    if (this.icao[0] == '~')
        return true;
    else
        return false;
};
// Comprueba si el avión debe mostrarse, teniendo en cuenta timeouts y filtros
PlaneObject.prototype.checkVisible = function() {
    const refresh = g.lastRefreshInt / 1000;
    const noInfoTimeout = replay ? 600 : (reApi ? (30 + 2 * refresh) : (30 + Math.min(1, (globeTilesViewCount / globeSimLoad)) * (2 * refresh)));
    const modeSTime = (guessModeS && this.dataSource == "modeS") ? 300 : 0;
    const tisbReduction = (globeIndex && this.icao[0] == '~') ? 15 : 0;
    // If no packet in over 58 seconds, clear the plane.
    // Only clear the plane if it's not selected individually

    // recompute seen and seen_pos
    // recalcular tiempos relativos de "seen"
    let __now = now;
    if (isNaN(__now)) {
        console.error("checkVisible: now is NaN, this is probably a browser bug: https://issues.chromium.org/issues/401652934");
        __now = g.now;
    }
    if (this.dataSource == "uat") {
        __now = uat_now;
    }
    this.seen = Math.max(0, __now - this.last_message_time);
    this.seen_pos = Math.max(0, __now - this.position_time);
    this.noInfoTime = __now - this.last_info_server;

    let timeout = seenTimeout;
    if (this.dataSource == "mlat") { timeout = seenTimeoutMlat; }
    else if (this.dataSource == "adsc") { timeout = jaeroTimeout; }
    else if (this.dataSource == 'ais') { timeout = aisTimeout; }

    timeout += modeSTime - tisbReduction + refresh;

    const res = (!globeIndex || icaoFilter || this.inView || this.selected || SelectedAllPlanes) && (
        (!globeIndex && this.seen < timeout)
        || (globeIndex && this.seen_pos < timeout && this.noInfoTime < noInfoTimeout)
        || this.selected
        || noVanish
        || (nogpsOnly && this.nogps && this.seen < 15 * 60) // ugly hard coded
    );

    return res;
};
// Si hay nueva información de tipo (ICAO type), actualizar metadata y marcador
PlaneObject.prototype.setTypeData = function() {
	if (g.type_cache == null || !this.icaoType || this.icaoType == this.icaoTypeCache)
        return;
    this.updateMarker();
    this.icaoTypeCache = this.icaoType;

    let typeCode = this.icaoType.toUpperCase();
    if (typeCode == 'P8 ?') {
        typeCode = 'P8';
    }
    if (!(typeCode in g.type_cache))
        return;

    let typeData = g.type_cache[typeCode];
    const typeLong = typeData[0];
    const desc = typeData[1];
    const wtc = typeData[2];
    if (desc != null)
        this.typeDescription = `${desc}`;
    if (wtc != null)
        this.wtc = `${wtc}`;
    if (this.typeLong == null && typeLong != null)
        this.typeLong = `${typeLong}`;
};
// Marca banderas de tipo, matrícula y banderas de base de datos para el avión
PlaneObject.prototype.setTypeFlagsReg = function(data) {
    // Si llega un tipo desde el paquete y es distinto al que tenemos, guardarlo
    if (data.t && data.t != this.icaoType) {
        // Guardar el tipo reportado (ej. modelo corto)
        this.icaoType = `${data.t}`;
        // Actualizar datos derivados del tipo (texto, iconos...)
        this.setTypeData();
    }
    // Si hay banderas desde la base de datos, extraer bits y asignarlos a propiedades visibles
    if (data.dbFlags) {
        this.military = data.dbFlags & 1;
        this.interesting = data.dbFlags & 2;
        this.pia = data.dbFlags & 4;
        this.ladd = data.dbFlags & 8;
        if (this.pia)
            this.registration = null;
    }
    // Si hay matrícula en el paquete, guardarla como texto
    if (data.r) this.registration = `${data.r}`;
}
// Comprueba y solicita datos de base de datos si corresponde
PlaneObject.prototype.checkForDB = function(data) {
    // Caso especial: si ICAO pertenece a cierto rango, marcar tipo provisional
    if (!this.dbinfoLoaded && this.icao >= 'ae6620' && this.icao <= 'ae6899') {
        this.icaoType = 'P8 ?';
        this.setTypeData();
    }
    // Si se pasó objeto data, aplicar sus campos visibles
    if (data) {

        if (data.desc) this.typeLong = `${data.desc}`;
        if (data.ownOp) this.ownOp = `${data.ownOp}`;
        if (data.year) this.year = `${data.year}`;
        // Aplicar flags y matrícula de ese objeto
        this.setTypeFlagsReg(data);
        // Si vino matrícula o tipo, marcar que ya cargamos info de BD
        if (data.r || data.t) {
            this.dbinfoLoaded = true;
        }
    }
    // Si aún no cargó la BD y no hay servidor o estamos en modos que impiden carga, pedir datos
    if (!this.dbinfoLoaded && (!dbServer || replay || pTracks || heatmap)) {
        this.getAircraftData();
        return;
    }
    // Indicar que los datos cambiaron (para refrescar UI)
    this.dataChanged();
};
// Actualiza valores derivados de la altitud (redondeo, prioridad en dibujo)
PlaneObject.prototype.updateAlt = function(t) {
    // Calcular altitud redondeada para uso visual
    this.alt_rounded = calcAltitudeRounded(this.altitude);
    // Si no hay altitud, dejar estado desconocido y zIndex por defecto
    if (this.altitude == null) {
        this.onGround = null;
        this.zIndex = 10;
    // Si está en tierra, marcarlo y poner zIndex bajo para dibujar abajo
    } else if (this.altitude == "ground") {
        this.onGround = true;
        this.zIndex = 5;
    // En vuelo: marcar y dar zIndex alto según altitud para ordenar en pantalla
    } else {
        this.onGround = false;
        this.zIndex = this.altitude + 200000;
    }
    // Algunos tipos siempre deben ir atrás en la pila visual (ej. vehículos)
    if (this.category == 'C3' || this.icaoType == 'TWR') {
        this.zIndex = 1;
    }
    // Si es un identificador no real, restar prioridad visual
    if (this.fakeHex)
        this.zIndex -= 100000;

}
// Ajusta la proyección del punto en el mapa y actualiza coordenadas internas
PlaneObject.prototype.setProjection = function(arg) {
    // Si se está animando entre dos puntos, usar la posición animada; si no, la real
    let pos = traceOpts.animate ? traceOpts.animatePos : this.position;
    // Separar longitud y latitud para procesar
    let lon = pos[0];
    let lat = pos[1];
    // Bandera para detectar si realmente cambió la posición proyectada
    let moved = false;

    //let trace = new Error().stack.toString();
    //console.log(lat + ' ' + trace);

    // manual wrap around (no longer necessary due to OpenLayers changing their webGL code)
    if (0 && webgl && Math.abs(CenterLon - lon) > 180) {
        if (CenterLon < 0)
            lon -= 360;
        else
            lon += 360;
    }
    //console.log([lat, lon]);
    // Convertir lon/lat a coordenadas usadas por el mapa (proyección)
    let proj = ol.proj.fromLonLat([lon, lat]);
    // Si este avión es el seleccionado y se pidió "seguir", centrar el mapa en él
    if (this == SelectedPlane && (arg == 'follow' || checkFollow())) {
        OLMap.getView().setCenter(proj);
    }
    // Si ya teníamos proyección previa, comprobar si hubo movimiento real
    if (this.proj) {
        moved |= (this.proj[0] != proj[0] || this.proj[1] != proj[1]);
    } else {
        // Si no teníamos proyección, marcar como "movido" para crear punto
        moved = true;
    }
    // Guardar la proyección actual
    this.proj = proj;
    // Si no existe la geometría puntual, crearla; si existe y se movió, actualizarla
    if (!this.olPoint) {
        this.olPoint = new ol.geom.Point(proj);
    } else if (moved) {
        this.olPoint.setCoordinates(proj);
    }
}
// Normaliza un callsign (quita ceros de la parte numérica)
function normalized_callsign(flight) {
    // Patrón para separar letras y números
    const re = /^([A-Z]*)([0-9]*)([A-Z]*)$/;
    const match = flight.match(re);
    // Si no coincide el patrón, devolver tal cual
    if (!match) {
        return flight;
    }
    // Separar partes alfabética, numérica y final
    let alpha = match[1];
    let num = match[2];
    let alpha2 = match[3];
    // Quitar ceros a la izquierda del número para normalizar (pero dejar al menos un dígito)
    while(num[0] == '0' && num.length > 1) {
        num = num.slice(1);
    }
    // Devolver callsign recombinado sin ceros innecesarios
    return alpha + num + alpha2;
}
// Comprueba y solicita la ruta (origen/destino) para mostrar en etiquetas
PlaneObject.prototype.routeCheck = function() {
    // Si no se ve el avión, no procesar rutas
    if (!this.visible) {
        // we don't care, don't update
        return;
    }
    // Si no hay callsign útil o es igual a matrícula, limpiar ruta y no seguir
    if (!this.flight || !this.name
        || this.name == 'empty callsign'
        || this.name == 'No callsign'
        || this.registration == this.name
    ) {
        this.routeString = '';
        this.routeVerbose = '';
        return;
    }
    // Normalizar callsign para la búsqueda
    let currentName = normalized_callsign(this.name);
    // Si ya está en la cola de comprobación, no volver a añadir
    if (g.route_check_todo[currentName]) {
        // already checking
        return;
    }
    // Hora actual en segundos
    let currentTime = Date.now()/1000;
    // if we don't have a route cached or if the cache is older than 6h, do a lookup
    // Revisar caché local de rutas
    const route = g.route_cache[currentName];
    // Si no hay ruta o está caducada, preparar solicitud
    if (!route || currentTime > route.tarNextUpdate) {
        if (route) {
            console.log("routeAPI: updating ", currentName, localTime(new Date(currentTime)), localTime(new Date(route.tarNextUpdate)));
        }
        // we have all the pieces that allow us to lookup a route
        // Preparar objeto para consulta: callsign e ICAO
        let route_check = { 'callsign': currentName, icao: this.icao};
        // Si no tenemos posición, cancelar por ahora
        if (!this.position) {
            // no lookup (for now)
            return;
        } else if (showTrace || replay) {
            // En modos histórico no usar cierto proveedor si contiene adsb.im
            if (!routeApiUrl.includes("adsb.im")) {
                // En vivo, añadir lat/lng
                route_check['lat'] = this.position[1];
                route_check['lng'] = this.position[0];
            }
        } else {
            route_check['lat'] = this.position[1];
            route_check['lng'] = this.position[0];
        }
        // Añadir a la cola global de comprobaciones
        g.route_check_todo[currentName] = route_check;
        return;
    }
    // Si la ruta en caché no tiene aeropuertos, limpiar y salir
    if (!route._airports || route._airports.length < 1) {
        this.routeString = '';
        this.routeVerbose = '';
        return;
    }
    // Construir texto corto y detallado de la ruta según configuración
    let routeString = "";
    let cities = "";

    for (let airport of route._airports) {
        // Separador entre aeropuertos
        if (routeString) {
            if (routeDisplay.includes('city')) {
                routeString += " -\n"
            } else {
                routeString += " - "
            }

            cities += " - ";
        }
        let aString = ""
        for (let type of routeDisplay) {
            if (aString) {
                aString += '/';
            }
            if (type == 'iata') {
                aString += airport.iata;
            } else if (type == 'icao') {
                aString += airport.icao;
            } else if (type == 'city') {
                aString += airport.location;
            }
        }
        cities += airport.location;
        routeString += aString;
    }
    // Si tiene más de dos escalas, marcar como MULTIHOP
    if (route._airports.length > 2) {
        this.routeColumn = 'MULTIHOP';
    } else {
        this.routeColumn = routeString;
    }
    // Si la ruta no es plausible, añadir prefijo de duda
    if (route.plausible === false) {
        routeString = '?? ' + routeString;
    }

    //console.log(this.routeString);
    // Guardar resultados para mostrar
    this.routeString = routeString;
    this.routeVerbose = cities;
}
// Función que envía las solicitudes agrupadas al servicio de rutas
function routeDoLookup() {
    // Hora actual en segundos
    const currentTime = Date.now()/1000;
    // JavaScript doesn't interrupt running functions - so this should be safe to do
    // Si ya hay una petición en curso, no iniciar otra
    if (g.route_check_in_flight) {
        return;
    }
    // Si no hay lista de comprobación en curso, tomar hasta 100 elementos pendientes
    if (!g.route_check_checking) {
        // grab up to the first 100 callsigns and leave the rest for later
        g.route_check_checking = Object.values(g.route_check_todo).slice(0,100);
    }
    // Si no hay nada por comprobar, limpiar estado
    if (g.route_check_checking.length < 1) {
        g.route_check_checking = null;
        return;
    }
    // Si quedan pocos por comprobar y la última consulta fue reciente, esperar un poco para agrupar
    if (g.route_check_checking.length < 10 && currentTime - g.route_last_lookup < 3.5) {
        // only do lookups every 3 seconds if we don't have many routes to check
        if (debugRoute) {
            console.log('delaying route check, trying to bundle request for 3 seconds');
        }
        return;
    }
    // Marcar que se está enviando petición
    g.route_check_in_flight = true;
    g.route_last_lookup = currentTime;

    if (debugRoute) {
        console.log(`${currentTime}: g.route_check_checking:`, g.route_check_checking);
    }
    // Construir cuerpo con lista de planes para enviar
    const requestRoutes = [];
    for (const entry of g.route_check_checking) {
        requestRoutes.push({
            callsign: entry['callsign'],
            lat: entry['lat'],
            lng: entry['lng'],
        });
    }

    const requestBody = JSON.stringify({ 'planes': requestRoutes });

    if (debugRoute) {
        console.log(`${currentTime}: requesting routes:`, requestBody);
    }
    // Enviar petición POST al API de rutas
    jQuery.ajax({
        type: "POST",
        url: routeApiUrl,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: requestBody,
    })
        .done((routes) => {
            // Al recibir respuesta, marcar fin de petición y procesar rutas devueltas
            const currentTime = Date.now()/1000;
            g.route_check_in_flight = false;
            if (debugRoute) {
                console.log(`${currentTime}: got routes:`, routes);
            }
            // Guardar cada ruta en caché con tiempo de revalidación
            for (let i in routes) {
                const route = routes[i];
                if (!route) {
                    console.log(`Route API returned this invalid element: ${String(route)}, probably for`, g.route_check_checking[i]);
                    continue;
                }
                route.tarNextUpdate = currentTime + 6 * 3600; // recheck in 6 hours
                g.route_cache[route.callsign] = route;
            }
            // Para cada entrada procesada, quitarla de la cola y notificar avión para refrescar
            for (const entry of g.route_check_checking) {
                delete g.route_check_todo[entry.callsign];
                const cached = g.route_cache[entry.callsign];
                if (!cached || currentTime > cached.tarNextUpdate) {
                    g.route_cache[entry.callsign] = { tarNextUpdate: Math.ceil(currentTime / 30) * 30 };
                }
                const plane = g.planes[entry.icao];
                plane && plane.dataChanged();
            }
            // let's update the route data immediately by refreshing the interface
            // Refrescar UI inmediatamente para mostrar rutas nuevas
            refresh();
            g.route_check_checking = null;
        })
        .fail((jqxhr, status, error) => {
            // Si falla, marcar retraso antes de reintentar
            g.route_check_in_flight = false;
            g.route_next_lookup =  Date.now()/1000 + 15;
            console.log('route API request error, delaying next request by 15 seconds.');
        });
}
// Guarda o limpia el callsign mostrado para el avión
PlaneObject.prototype.setFlight = function(flight) {
    // Si no llega flight, y hace mucho tiempo que no hubo cambio, limpiar nombre
    if (flight == null) {
        if (now - this.flightTs > 10 * 60) {
            this.flight = null;
            this.name ='No callsign';
        }
    // Valor especial que indica ausencia explícita
    } else if (flight == "@@@@@@@@") {
        this.flight = null;
        this.name ='No callsign';
    } else {
        // Guardar el callsign y una versión "name" sin espacios al inicio/fin
        this.flight = `${flight}`;
        this.name = this.flight.trim() || 'empty callsign';
        // Marcar hora de esta actualización
        this.flightTs = now;
    }
}
// Ajusta tiempos de trace que vienen con offsets para convertirlos a epoch
function normalizeTraceStamps(data) {
    // Validar entrada mínima
    if (!data || !data.trace) {
        console.log('normalizeTraceStamps: trace empty?')
        return null;
    }
    // Acceder a la traza y preparar variables
    let trace = data.trace;
    let last = 0;
    let negOffsetWarned = 0;
    // Recorrer puntos, sumar timestamp base y detectar anomalías
    for (let i = 0; i < trace.length; i++) {
        let point = trace[i];
        // Si hay offset negativo, avisar una vez
        if (point[0] < 0 && !negOffsetWarned) {
            negOffsetWarned = 1;
            console.log('negative offset in trace');
        }
        // Sumar timestamp base para convertir offsets a tiempos absolutos
        point[0] += data.timestamp;
        // Avisar si la secuencia no es no decreciente
        if (point[0] >= last) {
            last = point[0];
        } else {
            console.log('normalize: trace backwards last: ' + last.toFixed(3) + ' current: ' + point[0].toFixed(3));
        }
    }
    // Una vez normalizada, limpiar timestamp base
    data.timestamp = 0;
    return data;
}
