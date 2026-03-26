// -*- mode: javascript; indent-tabs-mode: t; c-basic-offset: 8 -*-
"use strict";

// Espacio no separable (pequeño) usado en textos
let NBSP='\u00a0';
// Espacio de ancho estrecho no separable
let NNBSP='\u202f';
// Espacio numérico fijo
let NUMSP='\u2007';
// Símbolo de grados (°)
let DEGREES='\u00b0'
// Guion largo corto para rangos
let ENDASH='\u2013';
// Triángulo negro apuntando hacia arriba (símbolo)
let UP_TRIANGLE='\u25b2'; // U+25B2 BLACK UP-POINTING TRIANGLE
// Triángulo negro apuntando hacia abajo (símbolo)
let DOWN_TRIANGLE='\u25bc'; // U+25BC BLACK DOWN-POINTING TRIANGLE
// Espacio ancho de formato
let EM_QUAD = '\u2001';
// Lista con nombres de las 8 direcciones principales
let TrackDirections = ["North","NE","East","SE","South","SW","West","NW"];
// Flechas para mostrar dirección en la interfaz
let TrackDirectionArrows = ["\u21e7","\u2b00","\u21e8","\u2b02","\u21e9","\u2b03","\u21e6","\u2b01"];
// Etiquetas de unidades según tipo de medida
let UnitLabels = {
    // Etiquetas para altitud
    'altitude': { metric: "m", imperial: "ft", nautical: "ft"},
    // Etiquetas para velocidad
    'speed': { metric: "km/h", imperial: "mph", nautical: "kt" },
    // Etiquetas para distancia
    'distance': { metric: "km", imperial: "mi", nautical: "nmi" },
    // Etiquetas para tasa vertical
    'verticalRate': { metric: "m/s", imperial: "ft/min", nautical: "ft/min" },
    // Etiquetas para distancias cortas
    'distanceShort': { metric: "m", imperial: "ft", nautical: "m" }
};

// Descripciones de categorías de aeronaves
let aircraftCategories = {
    // Sin especificar
    'A0': 'Unspecified powered aircraft',
    // Avión ligero con peso hasta cierto límite
    'A1': `Light (< 15${NNBSP}500${NBSP}lb)`,
    // Avión pequeño entre rangos de peso
    'A2': `Small (15${NNBSP}500 to 75${NNBSP}000${NBSP}lb)`,
    // Avión grande en cierto rango de peso
    'A3': `Large (75${NNBSP}000 to 300${NNBSP}000${NBSP}lb)`,
    // Avión grande con estela fuerte
    'A4': 'High Vortex Large(aircraft such as B-757)',
    // Avión pesado por encima de cierto peso
    'A5': `Heavy (> 300${NNBSP}000${NBSP}lb)`,
    // Alta capacidad de maniobra y velocidad
    'A6': `High Performance (> 5${NBSP}g acceleration and > 400${NBSP}kt)`,
    // Helicóptero o rotorcraft
    'A7': 'Rotorcraft',
    // Sin especificar, no propulsado o UAV
    'B0': 'Unspecified unpowered aircraft or UAV or spacecraft',
    // Planeador
    'B1': 'Glider/sailplane',
    // Aeronave más ligera que el aire
    'B2': 'Lighter-than-Air',
    // Persona en caída con paracaídas
    'B3': 'Parachutist/Skydiver',
    // Ultraligero o parapente
    'B4': 'Ultralight/hang-glider/paraglider',
    // Vehículo aéreo no tripulado
    'B6': 'Unmanned Aerial Vehicle',
    // Vehículo espacial o similar
    'B7': 'Space/Trans-atmospheric vehicle',
    // Instalación o vehículo en tierra sin especificar
    'C0': 'Unspecified ground installation or vehicle',
    // Vehículo de superficie de emergencia
    'C1': `Surface Vehicle ${ENDASH} Emergency Vehicle`,
    // Vehículo de servicio en tierra
    'C2': `Surface Vehicle ${ENDASH} Service Vehicle`,
    // Obstrucción fija o atada al suelo
    'C3': 'Fixed Ground or Tethered Obstruction'
};

// formatting helpers

// Devuelve la descripción de categoría para mostrarla
function get_category_label(category) {
    // Si no hay categoría, devolver vacío
    if (!category)
        return '';
    // Busca la etiqueta en el objeto de categorías
    let label = aircraftCategories[category];
    // Si no existe la etiqueta, devolver vacío
    if (!label)
        return '';
    // Devuelve la etiqueta encontrada
    return label;
}

// Devuelve la etiqueta de unidad para una cantidad y sistema dado
function get_unit_label(quantity, systemOfMeasurement) {
    // Busca el conjunto de etiquetas para la cantidad
	let labels = UnitLabels[quantity];
    // Si existe y hay etiqueta para el sistema, devolverla
	if (labels !== undefined && labels[systemOfMeasurement] !== undefined) {
		return labels[systemOfMeasurement];
	}
    // Si no, devolver cadena vacía
	return "";
}

// track in degrees (0..359)
// Formatea rumbo breve en grados (0..359)
function format_track_brief(track, rounded) {
    // Si no hay rumbo, indicar no disponible
	if (track == null){
		return "n/a";
	}
    // Devuelve el número con uno o cero decimales y el símbolo de grados
	return track.toFixed(rounded ? 0 : 1) + DEGREES;
}

// track in degrees (0..359)
// Formatea rumbo largo mostrando dirección cardinal y grados
function format_track_long(track, rounded) {
    // Si no hay rumbo, indicar no disponible
	if (track == null){
		return "n/a";
	}
    // Calcula índice para elegir nombre de dirección
	let trackDir = Math.floor((360 + track % 360 + 22.5) / 45) % 8;
    // Devuelve nombre de dirección, espacio fino y grados formateados
	return  TrackDirections[trackDir] + ":" + NNBSP + track.toFixed(rounded ? 0 : 1) + DEGREES;
}
// Devuelve una flecha que indica la dirección del rumbo
function format_track_arrow(track) {
    // Si no hay rumbo, devolver vacío
	if (track == null){
		return "";
	}
    // Calcula índice para elegir flecha y la devuelve
	let trackDir = Math.floor((360 + track % 360 + 22.5) / 45) % 8;
	return  TrackDirectionArrows[trackDir];
}

// alt in feet
// Formatea altitud compacta para lista (con triángulo indicador)
function format_altitude_brief(alt, vr, displayUnits, withUnits) {
    // Variable para el texto final de altitud
	let alt_text;
    // Si no hay altitud, mostrar signo de interrogación con espacios
	if (alt == null){
		return NBSP + '?' + NBSP;
	} else if (alt === "ground"){
        // Si está en tierra, indicar "ground"
		return "ground";
	}
    // Convierte y redondea la altitud según unidades y la hace texto
	alt_text = Math.round(convert_altitude(alt, displayUnits)).toString();
    // Si se pidió mostrar unidades, añadir la etiqueta correspondiente
    if (withUnits)
        alt_text += NNBSP + get_unit_label("altitude", displayUnits);

	// Vertical Rate Triangle
    // Preparar símbolo según tasa vertical
	let verticalRateTriangle = "";
    // Si sube rápido, usar triángulo hacia arriba
	if (vr > 245){
		verticalRateTriangle = UP_TRIANGLE;
    // Si baja rápido, usar triángulo hacia abajo
	} else if (vr < -245){
		verticalRateTriangle = DOWN_TRIANGLE;
    // Si cambio lento, no mostrar triángulo
	} else {
		verticalRateTriangle = ''
	}
    // Devuelve triángulo (si hay) y altitud con ancho fijo
	return verticalRateTriangle + alt_text.padStart(5, NUMSP);
}

// alt in feet
// Formatea altitud con texto más largo
function format_altitude_long(alt, vr, displayUnits) {
    // Texto resultante
	let alt_text = "";
    // Si no hay altitud, marcar como no disponible
	if (alt == null) {
		return "n/a";
	} else if (alt === "ground") {
        // Si en tierra, texto claro
		return "on ground";
	}
    // Convierte altitud y añade etiqueta de unidades
	alt_text = Math.round(convert_altitude(alt, displayUnits)).toString() + NNBSP + get_unit_label("altitude", displayUnits);
    // Si la tasa vertical es alta, anteponer triángulo hacia arriba
	if (vr > 192) {
		return UP_TRIANGLE + NNBSP + alt_text;
    // Si la tasa vertical es muy negativa, triángulo hacia abajo
	} else if (vr < -192) {
		return DOWN_TRIANGLE + NNBSP + alt_text;
    // Si no hay cambio importante, devolver solo la altitud
	} else {
		return alt_text;
	}
}

// alt in feet
// Formatea altitud en formato normal con unidades
function format_altitude(alt, displayUnits) {
    // Texto resultante
	let alt_text = "";
    // Si falta altitud, indicar no disponible
	if (alt == null) {
		return "n/a";
	} else if (alt === "ground") {
        // Si en tierra, indicar claramente
		return "on ground";
	}
    // Convierte y añade unidad
	alt_text = Math.round(convert_altitude(alt, displayUnits)).toString() + NNBSP + get_unit_label("altitude", displayUnits);
    // Devuelve texto final
    return alt_text;
}


// alt ground/airborne
// Indica si la altitud corresponde a tierra o está en vuelo
function format_onground (alt) {
    // Si no hay información, no disponible
	if (alt == null) {
		return "n/a";
	} else if (alt === "ground") {
        // Si la altitud marca "ground"
		return "on ground";
	} else {
        // En cualquier otro caso, está en vuelo
		return "airborne";
	}
}

// alt in feet
// Convierte altitud de pies a metros si se pide sistema métrico
function convert_altitude(alt, displayUnits) {
    // Si el sistema es métrico, multiplicar por 0.3048
	if (displayUnits === "metric") {
		return alt * 0.3048;  // feet to meters
	}
    // Si no, devolver tal cual (pies)
	return alt;
}

// speed in knots
// Formatea velocidad breve para mostrar en listas
function format_speed_brief(speed, displayUnits, withUnits) {
    // Si no hay velocidad o no es número, devolver vacío
	if (speed == null || isNaN(speed)) {
		return "";
	}
    // Convierte y redondea la velocidad
    let speed_text = Math.round(convert_speed(speed, displayUnits)).toString();
    // Si se pide mostrar unidades, añadir etiqueta
    if (withUnits)
        speed_text += NNBSP + get_unit_label("speed", displayUnits);
    // Devuelve texto
	return speed_text;
}

// speed in knots
// Formatea velocidad larga para detalles con unidad añadida
function format_speed_long(speed, displayUnits) {
    // Si falta velocidad, indicar no disponible
	if (speed == null) {
		return "n/a";
	}
    // Convierte, redondea y añade etiqueta de unidad
	let speed_text = Math.round(convert_speed(speed, displayUnits)) + NNBSP + get_unit_label("speed", displayUnits);
    // Devuelve texto final
	return speed_text;
}

// speed in knots
// Convierte velocidad en nudos a la unidad deseada
function convert_speed(speed, displayUnits) {
    // A kilómetros por hora si es métrico
	if (displayUnits === "metric") {
		return speed * 1.852;  // knots to kilometers per hour
	}
    // A millas por hora si es imperial
	else if (displayUnits === "imperial") {
		return speed * 1.151;  // knots to miles per hour
	}
    // Si es "nautical", devolver nudos
	return speed;
}

// dist in meters
// Formatea distancia breve para listas
function format_distance_brief(dist, displayUnits) {
    // Si no hay distancia, devolver vacío
	if (dist == null) {
		return "";
	}
    // Convierte y muestra con un decimal
	return convert_distance(dist, displayUnits).toFixed(1);
}

// dist in meters
// Formatea distancia larga con unidad y precisión
function format_distance_long(dist, displayUnits, fixed) {
    // Si falta distancia, indicar no disponible
	if (dist == null) {
		return "n/a";
	}
    // Si no se pasó precisión, usar 1 decimal
	if (typeof fixed === 'undefined') {
		fixed = 1;
	}
    // Convierte, formatea con decimales y añade etiqueta de unidad
	let dist_text = convert_distance(dist, displayUnits).toFixed(fixed) + NNBSP + get_unit_label("distance", displayUnits);
    // Devuelve texto final
	return dist_text;
}

// Formatea distancia corta (por ejemplo en metros o pies)
function format_distance_short (dist, displayUnits) {
    // Si falta distancia, marcar no disponible
	if (dist == null) {
		return "n/a";
	}
    // Convierte a unidad corta, redondea y añade etiqueta
	let dist_text = Math.round(convert_distance_short(dist, displayUnits)) + NNBSP + get_unit_label("distanceShort", displayUnits);
    // Devuelve texto final
	return dist_text;
}

// dist in meters
// Convierte distancia en metros a km/mi/nmi según sistema
function convert_distance(dist, displayUnits) {
    // Si es métrico, pasar a kilómetros
	if (displayUnits === "metric") {
		return (dist / 1000); // meters to kilometres
	}
    // Si es imperial, pasar a millas
	else if (displayUnits === "imperial") {
		return (dist / 1609); // meters to miles
	}
    // Por defecto, pasar a millas náuticas
	return (dist / 1852); // meters to nautical miles
}

// dist in meters
// converts meters to feet or just returns metres
// Convierte metros a pies si se pide el modo corto
function convert_distance_short(dist, displayUnits) {
    // Si es imperial, convertir a pies
	if (displayUnits === "imperial") {
		return (dist / 0.3048); // meters to feet
	}
    // Si no, devolver metros
	return dist; // just meters
}

// rate in ft/min
// Formatea tasa vertical breve (nueva unidad según sistema)
function format_vert_rate_brief(rate, displayUnits) {
    // Si falta tasa, devolver vacío
	if (rate == null) {
		return "";
	}
    // Convierte y fija decimales según sistema
	return convert_vert_rate(rate, displayUnits).toFixed(displayUnits === "metric" ? 1 : 0);
}

// rate in ft/min
// Formatea tasa vertical larga con unidad
function format_vert_rate_long(rate, displayUnits) {
    // Si falta tasa, indicar no disponible
	if (rate == null){
		return "n/a";
	}
    // Convierte, fija decimales y añade etiqueta
	let rate_text = convert_vert_rate(rate, displayUnits).toFixed(displayUnits === "metric" ? 1 : 0) + NNBSP + get_unit_label("verticalRate", displayUnits);
    // Devuelve texto final
	return rate_text;
}

// rate in ft/min
// Convierte tasa vertical de ft/min a m/s si es métrico
function convert_vert_rate(rate, displayUnits) {
    // Si es métrico, convertir con factor
	if (displayUnits === "metric") {
		return (rate / 196.85); // ft/min to m/s
	}
    // Si no, devolver tal cual (ft/min)
	return rate;
}

// p is a [lon, lat] coordinate
// Formatea una coordenada [lon,lat] como texto legible
function format_latlng(p) {
    // Muestra latitud con grados, coma, y longitud con grados
	return p[1].toFixed(3) + DEGREES + "," + NNBSP + p[0].toFixed(3) + DEGREES;
}

// Convierte un código de origen de datos a texto legible
function format_data_source(source) {
    // Decide la etiqueta según el tipo de fuente
	switch (source) {
		case 'uat' :
			return "UAT";
		case 'mlat':
			return "MLAT";
		case 'adsb':
		case 'adsb_icao':
		case 'adsb_other':
			return "ADS-B";
		case 'adsb_icao_nt':
			return "ADS-B noTP";
		case 'adsr':
		case 'adsr_icao':
		case 'adsr_other':
			return "ADS-R or UAT";
		case 'tisb_icao':
		case 'tisb_trackfile':
		case 'tisb_other':
		case 'tisb':
			return "TIS-B";
		case 'modeS':
			return "Mode S";
		case 'ais':
			return "AIS";
		case 'mode_ac':
			return "Mode A/C";
        case 'adsc':
            // Usa etiqueta externa para JAERO
            return jaeroLabel;
        case 'other':
            return "Other";
	}
    // Si no coincide, devolver "Unknown"
	return "Unknown";
}
// Traduce valor NACp a una frase que describe precisión horizontal estimada
function format_nac_p (value) {
	switch (value) {
		case 0:
			return "EPU ≥ 18.5 km";
		case 1:
			return "EPU < 18.5 km";
		case 2:
			return "EPU < 7.4 km";
		case 3:
			return "EPU < 3.7 km";
		case 4:
			return "EPU < 1.8 km";
		case 5:
			return "EPU < 926 m";
		case 6:
			return "EPU < 555 m";
		case 7:
			return "EPU < 185 m";
		case 8:
			return "EPU < 92 m";
		case 9:
			return "EPU < 30 m";
		case 10:
			return "EPU < 10 m";
		case 11:
			return "EPU < 3 m";
		default:
			return "n/a";

	}
}
// Traduce valor NACv a texto que describe precisión de velocidad
function format_nac_v (value) {
	switch (value) {
		case 0:
			return "≥ 10 m/s";
		case 1:
			return "< 10 m/s";
		case 2:
			return "< 3 m/s";
		case 3:
			return "< 1 m/s";
		case 4:
			return "< 0.3 m/s";
		default:
			return "n/a";
	}
}
// Formatea una duración en segundos a texto legible (s, min, h)
function format_duration(seconds) {
    // Si falta, marcar no disponible
    if (seconds == null)
        return "n/a";
    // Menos de 20 s mostrar con décimas
    if (seconds < 20)
        return seconds.toFixed(1) + ' s';
    // Menos de 5 minutos mostrar segundos sin decimales
    if (seconds < 5 * 60)
        return seconds.toFixed(0) + ' s';
    // Menos de 3 horas mostrar en minutos
    if (seconds < 3 * 60 * 60)
        return (seconds/60).toFixed(0) + ' min';
    // Más, mostrar en horas
    return (seconds/60/60).toFixed(0) + ' h';

}
// Detecta versión de iOS si está en un dispositivo Apple
function iOSVersion() {
  // Si el dispositivo es iPhone/iPod/iPad
  if (/iP(hone|od|ad)/.test(navigator.platform)) {
    // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
    // Extrae la versión del sistema iOS del user agent
    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    // Devuelve array con versiones mayores y menores
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
  }
}

// Procesa un bloque binario recibido con información compacta
function wqi(data) {
    // Constante máxima para enteros de 32 bits
    const INT32_MAX = 2147483647;
    // Acceso al buffer subyacente
    const buffer = data.buffer;
    //console.log(buffer);
    // Crea vista de enteros sin signo para leer cabecera
    let u32 = new Uint32Array(data.buffer, 0, 13);
    // Tiempo actual aproximado a partir del buffer
    data.now = u32[0] / 1000 + u32[1] * 4294967.296;
    //console.log(data.now);
    // Leer tamaño de registro (stride)
    let stride = u32[2];
    // Número de aeronaves con posición global
    data.global_ac_count_withpos = u32[3];
    // Indicador de si se muestra globo (globe index)
    data.globeIndex = u32[4];
    // Límites geográficos en Int16
    let limits = new Int16Array(buffer, 20, 4);
    data.south =  limits[0];
    data.west =  limits[1];
    data.north =  limits[2];
    data.east =  limits[3];
    // Mensajes totales
    data.messages = u32[7];
    // Vista con enteros con signo para todo el bloque
    let s32 = new Int32Array(data.buffer, 0, stride / 4);
    // Latitud del receptor en microgrados convertida a grados
    let receiver_lat = s32[8] / 1e6;
    // Longitud del receptor en microgrados convertida a grados
    let receiver_lon = s32[9] / 1e6;

    // Versión del binCraft que produjo el binario
    const binCraftVersion = u32[10];
    // Tasa de mensajes por segundo
    data.messageRate = u32[11] / 10;
    // Banderas de control
    const flags = u32[12];
    // Indica si usar messageRate en los registros
    const useMessageRate = flags & (1 << 0);
    // Si la posición del receptor es válida y diferente, avisar cambio
    if (receiver_lat != 0 && receiver_lon != 0) {
        //console.log("receiver_lat: " + receiver_lat + " receiver_lon: " + receiver_lon);
        // Preparar objeto de posición con formato similar al API de geolocalización
        let position = {
            coords: {
                latitude: receiver_lat,
                longitude: receiver_lon,
            },
        };
        // Si la posición cambió respecto al sitio guardado, llamar manejador
        if (receiver_lat != SiteLat || receiver_lon != SiteLon) {
            onLocationChange(position);
        }
    }
    // Inicializa lista de aeronaves
    data.aircraft = [];
    // Recorre cada registro de aeronave dentro del buffer
    for (let off = stride; off < buffer.byteLength; off += stride) {
        // Objeto para la aeronave actual
        let ac = {}
        // Vistas para leer diferentes tamaños de enteros desde la posición actual
        let u32 = new Uint32Array(buffer, off, stride / 4);
        let s32 = new Int32Array(buffer, off, stride / 4);
        let u16 = new Uint16Array(buffer, off, stride / 2);
        let s16 = new Int16Array(buffer, off, stride / 2);
        let u8 = new Uint8Array(buffer, off, stride);
        // Bit que indican si el hex tiene marca especial
        let t = s32[0] & (1<<24);
        // Calcula y guarda código hex de la aeronave con relleno
        ac.hex = (s32[0] & ((1<<24) - 1)).toString(16).padStart(6, '0');
        // Si tiene marca, antepone '~'
        ac.hex = t ? ('~' + ac.hex) : ac.hex;
        // Según versión binCraft, extraer tiempos de visto y visto con posición
        if (binCraftVersion >= 20240218) {
            ac.seen = s32[1] / 10;
            ac.seen_pos = s32[27] / 10;
        } else {
            ac.seen_pos = u16[2] / 10;
            ac.seen = u16[3] / 10;
        }
        // Longitud en grados
        ac.lon = s32[2] / 1e6;
        // Latitud en grados
        ac.lat = s32[3] / 1e6;
        // Tasas y altitudes obtenidas con factores de escala
        ac.baro_rate = s16[8] * 8;
        ac.geom_rate = s16[9] * 8;
        ac.alt_baro = s16[10] * 25;
        ac.alt_geom = s16[11] * 25;
        // Altitudes calculadas por piloto automático o FMS
        ac.nav_altitude_mcp = u16[12] * 4;
        ac.nav_altitude_fms = u16[13] * 4;
        // Presión QNH
        ac.nav_qnh = s16[14] / 10;
        // Cabeceo/rumbo de navegación
        ac.nav_heading = s16[15] / 90;
        // Extrae código squawk desde 16-bit formateado en hex
        const s = u16[16].toString(16).padStart(4, '0');
        // Si el primer carácter no es numérico, formatear distinto
        if (s[0] > '9') {
            ac.squawk = String(parseInt(s[0], 16)) + s[1] + s[2] + s[3];
        } else {
            ac.squawk = s;
        }
        // Velocidad sobre suelo (gs)
        ac.gs = s16[17] / 10;
        // Mach
        ac.mach = s16[18] / 1000;
        // Inclinación
        ac.roll = s16[19] / 100;
        // Rumbo calculado
        ac.track = s16[20] / 90;
        // Cambio de rumbo por segundo
        ac.track_rate = s16[21] / 100;
        // Rumbo magnético
        ac.mag_heading = s16[22] / 90;
        // Rumbo verdadero
        ac.true_heading = s16[23] / 90;
        // Dirección del viento
        ac.wd  = s16[24];
        // Velocidad del viento
        ac.ws  = s16[25];
        // Temperatura exterior
        ac.oat = s16[26];
        // Temperatura total
        ac.tat = s16[27];
        // Velocidad verdadera (tas) desde u16
        ac.tas = u16[28];
        // Velocidad indicada (ias)
        ac.ias = u16[29];
        // Rate code u otra información pequeña
        ac.rc  = u16[30];
        // Según bandera, tratar mensajeRate o contador de mensajes
        if (useMessageRate) {
            ac.messageRate = u16[31] / 10;
        } else {
            ac.messages = u16[31];
        }
        // Categoría en un byte si existe
        ac.category = u8[64] ? u8[64].toString(16).toUpperCase() : undefined;
        // Nivel de integridad nic
        ac.nic      = u8[65];
        // Modos de navegación en un byte
        let nav_modes = u8[66];
        // Marcar que existen modos de navegación
        ac.nav_modes = true;
        // Emergencia en nibble bajo
        ac.emergency = u8[67] & 15;
        // Tipo en nibble alto
        ac.type = (u8[67] & 240) >> 4;
        // Si tierra/aire en nibble bajo
        ac.airground = u8[68] & 15;
        // Fuente de altitud en nibble alto
        ac.nav_altitude_src = (u8[68] & 240) >> 4;
        // SIL tipo en nibble bajo
        ac.sil_type = u8[69] & 15;
        // Versión ADS-B en nibble alto
        ac.adsb_version = (u8[69] & 240) >> 4;
        // Versiones ADS-R y TIS-B
        ac.adsr_version = u8[70] & 15;
        ac.tisb_version = (u8[70] & 240) >> 4;
        // NACp y NACv en diferentes nibbles
        ac.nac_p = u8[71] & 15;
        ac.nac_v = (u8[71] & 240) >> 4;
        // SIL/GVA/SDA y NICs en bits del byte 72
        ac.sil = u8[72] & 3;
        ac.gva = (u8[72] & 12) >> 2;
        ac.sda = (u8[72] & 48) >> 4;
        ac.nic_a = (u8[72] & 64) >> 6;
        ac.nic_c = (u8[72] & 128) >> 7;

        // Extraer matrícula o texto de vuelo desde posiciones de bytes
        ac.flight = "";
        for (let i = 78; u8[i] && i < 86; i++) {
            ac.flight += String.fromCharCode(u8[i]);
        }
        // Flags de base de datos
        ac.dbFlags = u16[43];
        // Extraer tipo de registro t
        ac.t = "";
        for (let i = 88; u8[i] && i < 92; i++) {
            ac.t += String.fromCharCode(u8[i]);
        }
        // Extraer registro r (posible registro adicional)
        ac.r = "";
        for (let i = 92; u8[i] && i < 104; i++) {
            ac.r += String.fromCharCode(u8[i]);
        }
        // Número de receptores que vieron esta aeronave
        ac.receiverCount = u8[104];
        // Según versión, calcular RSSI de forma diferente
        if (binCraftVersion >= 20250403) {
            ac.rssi = (u8[105] * (50 / 255)) - 50;
        } else {
            let level = u8[105]*u8[105]/65025 + 1.125e-5;
            ac.rssi = 10 * Math.log(level)/Math.log(10);
        }
        // Extra flags y si no hay GPS
        ac.extraFlags = u8[106];
        ac.nogps = ac.extraFlags & 1;
        // Si no tiene GPS y filtro activo, ajustar bits de validez
        if (ac.nogps && nogpsOnly && s32[3] != INT32_MAX) {
            u8[73] |= 64;
            u8[73] |= 16;
        }

        // must come after the stuff above (validity bits)
        // A partir de aquí, aplicar bits de validez para decidir qué mostrar
        ac.nic_baro      = (u8[73] & 1);
        ac.alert1        = (u8[73] & 2);
        ac.spi           = (u8[73] & 4);
        ac.flight        = (u8[73] & 8)    ? ac.flight       : undefined;
        ac.alt_baro      = (u8[73] & 16)   ? ac.alt_baro     : undefined;
        ac.alt_geom      = (u8[73] & 32)   ? ac.alt_geom     : undefined;

        ac.lat           = (u8[73] & 64)   ? ac.lat          : undefined;
        ac.lon           = (u8[73] & 64)   ? ac.lon          : undefined;
        ac.seen_pos      = (u8[73] & 64)   ? ac.seen_pos     : undefined;

        ac.gs            = (u8[73] & 128)  ? ac.gs           : undefined;

        ac.ias           = (u8[74] & 1)    ? ac.ias          : undefined;
        ac.tas           = (u8[74] & 2)    ? ac.tas          : undefined;
        ac.mach          = (u8[74] & 4)    ? ac.mach         : undefined;
        ac.track         = (u8[74] & 8)    ? ac.track        : undefined;
        ac.calc_track    = !(u8[74] & 8)   ? ac.track        : undefined;
        ac.track_rate    = (u8[74] & 16)   ? ac.track_rate   : undefined;
        ac.roll          = (u8[74] & 32)   ? ac.roll         : undefined;
        ac.mag_heading   = (u8[74] & 64)   ? ac.mag_heading  : undefined;
        ac.true_heading  = (u8[74] & 128)  ? ac.true_heading : undefined;

        ac.baro_rate     = (u8[75] & 1)    ? ac.baro_rate    : undefined;
        ac.geom_rate     = (u8[75] & 2)    ? ac.geom_rate    : undefined;
        ac.nic_a         = (u8[75] & 4)    ? ac.nic_a        : undefined;
        ac.nic_c         = (u8[75] & 8)    ? ac.nic_c        : undefined;
        ac.nic_baro      = (u8[75] & 16)   ? ac.nic_baro     : undefined;
        ac.nac_p         = (u8[75] & 32)   ? ac.nac_p        : undefined;
        ac.nac_v         = (u8[75] & 64)   ? ac.nac_v        : undefined;
        ac.sil           = (u8[75] & 128)  ? ac.sil          : undefined;

        ac.gva                  = (u8[76] & 1)   ? ac.gva              : undefined;
        ac.sda                  = (u8[76] & 2)   ? ac.sda              : undefined;
        ac.squawk               = (u8[76] & 4)   ? ac.squawk           : undefined;
        ac.emergency            = (u8[76] & 8)   ? ac.emergency        : undefined;
        ac.spi                  = (u8[76] & 16)  ? ac.spi              : undefined;
        ac.nav_qnh              = (u8[76] & 32)  ? ac.nav_qnh          : undefined;
        ac.nav_altitude_mcp     = (u8[76] & 64)  ? ac.nav_altitude_mcp : undefined;
        ac.nav_altitude_fms     = (u8[76] & 128) ? ac.nav_altitude_fms : undefined;

        ac.nav_altitude_src     = (u8[77] & 1)   ? ac.nav_altitude_src : undefined;
        ac.nav_heading          = (u8[77] & 2)   ? ac.nav_heading      : undefined;
        ac.nav_modes            = (u8[77] & 4)   ? ac.nav_modes        : undefined;
        ac.alert1               = (u8[77] & 8)   ? ac.alert1           : undefined;
        ac.ws                   = (u8[77] & 16)  ? ac.ws               : undefined;
        ac.wd                   = (u8[77] & 16)  ? ac.wd               : undefined;
        ac.oat                  = (u8[77] & 32)  ? ac.oat              : undefined;
        ac.tat                  = (u8[77] & 32)  ? ac.tat              : undefined;
        
        // Si la aeronave está etiquetada como en tierra, marcar altitud barométrica como "ground"
        if (ac.airground == 1)
            ac.alt_baro = "ground";
        // Si hay modos de navegación, desglosarlos en una lista comprensible
        if (ac.nav_modes) {
            ac.nav_modes = [];
            if (nav_modes & 1) ac.nav_modes.push('autopilot');
            if (nav_modes & 2) ac.nav_modes.push('vnav');
            if (nav_modes & 4) ac.nav_modes.push('alt_hold');
            if (nav_modes & 8) ac.nav_modes.push('approach');
            if (nav_modes & 16) ac.nav_modes.push('lnav');
            if (nav_modes & 32) ac.nav_modes.push('tcas');
        }
        // Traducir código numérico de tipo a etiqueta de texto
        switch (ac.type) {
            case  0: ac.type = 'adsb_icao';        break;
            case  1: ac.type = 'adsb_icao_nt';     break;
            case  2: ac.type = 'adsr_icao';        break;
            case  3: ac.type = 'tisb_icao';        break;
            case  4: ac.type = 'adsc';             break;
            case  5: ac.type = 'mlat';             break;
            case  6: ac.type = 'other';            break;
            case  7: ac.type = 'mode_s';           break;
            case  8: ac.type = 'adsb_other';       break;
            case  9: ac.type = 'adsr_other';       break;
            case 10: ac.type = 'tisb_trackfile';   break;
            case 11: ac.type = 'tisb_other';       break;
            case 12: ac.type = 'mode_ac';          break;
            default: ac.type = 'unknown';
        }
        // Según el prefijo del tipo, asignar versión apropiada
        const type4 = ac.type.slice(0, 4);
        if (type4 == 'adsb') {
            ac.version = ac.adsb_version;
        } else if (type4 == 'adsr') {
            ac.version = ac.adsr_version;
        } else if (type4 == 'tisb') {
            ac.version = ac.tisb_version;
        }
        // Según versión y stride, extraer id del receptor si está presente
        if (binCraftVersion >= 20240218) {
            if (stride == 116) {
                ac.rId = u32[28].toString(16).padStart(8, '0');
            }
        } else {
            if (stride == 112) {
                ac.rId = u32[27].toString(16).padStart(8, '0');
            }
        }
        // Añade la aeronave procesada a la lista final
        data.aircraft.push(ac);
    }
}
// Constructor para caché simple de elementos con límite
function ItemCache(maxItems) {
    // Máximo número de elementos que se guardarán
    this.maxItems = maxItems;
    // Objeto que almacena pares clave->valor
    this.items = {};
    // Lista de claves en orden de inserción para expulsar las más antiguas
    this.keys = [];
}
// Vacía la caché completamente
ItemCache.prototype.clear = function() {
    this.items = {};
    this.keys = [];
}
// Recupera un elemento por su clave
ItemCache.prototype.get = function(key) {
    return this.items[key];
}
// Añade o actualiza un elemento en la caché
ItemCache.prototype.add = function(key, value) {
    // Si la clave no existía, añadirla al final de la lista de claves
    if (!(key in this.items)) {
        this.keys.push(key);
    }
    // Guardar o actualizar el valor asociado
    this.items[key] = value;
    // Si hay límite y se supera, eliminar los más antiguos
    if (this.maxItems && this.maxItems > 0) {
        while (this.keys.length > this.maxItems) {
            const key = this.keys.shift();
            delete this.items[key];
        }
    }
}
// Prueba interna que valida que la caché funcione como se espera
function itemCacheTest() {
    // Crea una caché con máximo 4 elementos
    let a = new ItemCache(4);
    // Añade varios pares clave-valor
    a.add(8, 4);
    a.add(5, 2);
    a.add(4, 2);
    a.add(3, 2);
    a.add(1, 2);
    a.add(1, 3);
    a.add(1, 5);
    // Serializa el contenido para comparar
    let items = JSON.stringify(a.items)
    let keys = JSON.stringify(a.keys);
    // Valores esperados tras las operaciones
    const expectedItems = '{"1":5,"3":2,"4":2,"5":2}';
    const expectedKeys = '[5,4,3,1]';
    // Si no coincide con lo esperado, mostrar error en consola
    if (items != expectedItems || keys != expectedKeys || g.get(1) != 5) {
        console.error(`ItemCache broken!`);
        console.log(`got:      items: ${items} keys: ${keys}`);
        console.log(`expected: items: ${expectedItems} keys: ${expectedKeys}`);
    } else {
        // Si todo está bien, informar por consola
        console.log(`ItemCache tested correctly!`);
    }
}
