// Various reverse-engineered versions of the allocation algorithms
// used by different countries to allocate 24-bit ICAO addresses based
// on the aircraft registration.
//
// These were worked out by looking at the allocation patterns and
// working backwards to an algorithm that generates that pattern,
// spot-checking aircraft to see if it worked.
// YMMV.
"use strict";
// Obtener matrícula por hex id
const registration_from_hexid = (function () {
    // hide the guts in a closure

    // Alfabeto reducido sin las letras confusas I y O
    let limited_alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 24 chars; no I, O
    // Alfabeto completo A-Z
    let full_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";  // 26 chars

    // handles 3-letter suffixes assigned with a regular pattern
    //
    // start: first hexid of range
    // s1: major stride (interval between different first letters)
    // s2: minor stride (interval between different second letters)
    // prefix: the registration prefix
    //
    // optionally:
    //   alphabet: the alphabet to use (defaults full_alphabet)
    //   first: the suffix to use at the start of the range (default: AAA)
    //   last: the last valid suffix in the range (default: ZZZ)

    // Lista de patrones que mapean rangos hex a prefijos y sufijos
    let stride_mappings = [
        // South African stride mapping apparently no longer in use
        //{ start: 0x008011, s1: 26*26, s2: 26, prefix: "ZS-" },

        { start: 0x380000, s1: 1024, s2: 32, prefix: "F-B" },
        { start: 0x388000, s1: 1024, s2: 32, prefix: "F-I" },
        { start: 0x390000, s1: 1024, s2: 32, prefix: "F-G" },
        { start: 0x398000, s1: 1024, s2: 32, prefix: "F-H" },
        { start: 0x3A0000, s1: 1024, s2: 32, prefix: "F-O" },


        { start: 0x3C4421, s1: 1024,  s2: 32, prefix: "D-A", first: 'AAA', last: 'OZZ' },
        { start: 0x3C0001, s1: 26*26, s2: 26, prefix: "D-A", first: 'PAA', last: 'ZZZ' },
        { start: 0x3C8421, s1: 1024,  s2: 32, prefix: "D-B", first: 'AAA', last: 'OZZ' },
        { start: 0x3C2001, s1: 26*26, s2: 26, prefix: "D-B", first: 'PAA', last: 'ZZZ' },
        { start: 0x3CC000, s1: 26*26, s2: 26, prefix: "D-C" },
        { start: 0x3D04A8, s1: 26*26, s2: 26, prefix: "D-E" },
        { start: 0x3D4950, s1: 26*26, s2: 26, prefix: "D-F" },
        { start: 0x3D8DF8, s1: 26*26, s2: 26, prefix: "D-G" },
        { start: 0x3DD2A0, s1: 26*26, s2: 26, prefix: "D-H" },
        { start: 0x3E1748, s1: 26*26, s2: 26, prefix: "D-I" },

        { start: 0x448421, s1: 1024,  s2: 32, prefix: "OO-" },
        { start: 0x458421, s1: 1024,  s2: 32, prefix: "OY-" },
        { start: 0x460000, s1: 26*26, s2: 26, prefix: "OH-" },
        { start: 0x468421, s1: 1024,  s2: 32, prefix: "SX-" },
        { start: 0x490421, s1: 1024,  s2: 32, prefix: "CS-" },
        { start: 0x4A0421, s1: 1024,  s2: 32, prefix: "YR-" },
        { start: 0x4B8421, s1: 1024,  s2: 32, prefix: "TC-" },
        { start: 0x740421, s1: 1024,  s2: 32, prefix: "JY-" },
        { start: 0x760421, s1: 1024,  s2: 32, prefix: "AP-" },
        { start: 0x768421, s1: 1024,  s2: 32, prefix: "9V-" },
        { start: 0x778421, s1: 1024,  s2: 32, prefix: "YK-" },
        { start: 0xC00001, s1: 26*26, s2: 26, prefix: "C-F" },
        { start: 0xC044A9, s1: 26*26, s2: 26, prefix: "C-G" },
        { start: 0xE01041, s1: 4096,  s2: 64, prefix: "LV-" }
    ];

    // numeric registrations
    //  start: start hexid in range
    //  first: first numeric registration
    //  count: number of numeric registrations
    //  template: registration template, trailing characters are replaced with the numeric registration
    // Mapeos para registros que son principalmente números
    let numeric_mappings = [
        // Rango para RA-00000, con 100000 combinaciones
        { start: 0x140000, first: 0,    count: 100000, template: "RA-00000" },
        // Rango para CU-T0000 con inicio en 1000 y 1000 entradas
        { start: 0x0B03E8, first: 1000, count: 1000,   template: "CU-T0000" }
    ];

    // fill in some derived data
    // Calcula datos derivados (offsets y finales) para cada mapeo por pasos
    for (let i = 0; i < stride_mappings.length; ++i) {
        // Toma el mapeo actual de la lista
        let mapping = stride_mappings[i];
        // Si no especifica alfabeto, usa el alfabeto completo
        if (!mapping.alphabet) {
            mapping.alphabet = full_alphabet;
        }
        // Si hay una matrícula 'first', calcula su desplazamiento interno
        if (mapping.first) {
            // Índice de la primera letra en el alfabeto
            let c1 = mapping.alphabet.indexOf(mapping.first.charAt(0));
            // Índice de la segunda letra
            let c2 = mapping.alphabet.indexOf(mapping.first.charAt(1));
            // Índice de la tercera letra
            let c3 = mapping.alphabet.indexOf(mapping.first.charAt(2));
            // Calcula offset combinado usando los pasos s1 y s2
            mapping.offset = c1 * mapping.s1 + c2 * mapping.s2 + c3;
        } else {
            // Si no hay 'first', el offset es cero
            mapping.offset = 0;
        }

        // Si hay una matrícula 'last', calcula el punto final del rango
        if (mapping.last) {
            // Índice del primer carácter de 'last'
            let c1 = mapping.alphabet.indexOf(mapping.last.charAt(0));
            // Índice del segundo carácter de 'last'
            let c2 = mapping.alphabet.indexOf(mapping.last.charAt(1));
            // Índice del tercer carácter de 'last'
            let c3 = mapping.alphabet.indexOf(mapping.last.charAt(2));
            // Calcula el valor final del rango aplicando offset y posiciones
            mapping.end = mapping.start - mapping.offset +
                c1 * mapping.s1 +
                c2 * mapping.s2 +
                c3;
        } else {
            // Si no hay 'last', calcula el final usando el tamaño del alfabeto y los pasos
            mapping.end = mapping.start - mapping.offset +
                (mapping.alphabet.length - 1) * mapping.s1 +
                (mapping.alphabet.length - 1) * mapping.s2 +
                (mapping.alphabet.length - 1);
        }
    }
    // Para mapeos numéricos, calcula el final sumando el conteo al inicio
    for (let i = 0; i < numeric_mappings.length; ++i) {
        numeric_mappings[i].end = numeric_mappings[i].start + numeric_mappings[i].count - 1;
    }
    // Función que intenta convertir una cadena hex en matrícula llamando distintas reglas
    function lookup(hexid) {
        hexid = +("0x" + hexid);
        // Si no es número válido, devuelve null
        if (isNaN(hexid)) {
            return null;
        }
        // Intenta con la regla para N-numbers de EE. UU.
        let reg;
        reg = n_reg(hexid);
        if (reg)
            return reg;
        // Intenta con la regla para Japón
        reg = ja_reg(hexid);
        if (reg)
            return reg;
        // Intenta con la regla para Corea del Sur
        reg = hl_reg(hexid);
        if (reg)
            return reg;
        // Intenta con mapeos numéricos (plantillas)
        reg = numeric_reg(hexid);
        if (reg)
            return reg;
        // Intenta con los mapeos por pasos (general)
        reg = stride_reg(hexid);
        if (reg)
            return reg;
        // Si ninguna regla aplica, devuelve null
        return null;
    }
    // Prueba cada mapeo por pasos y construye sufijos de 3 letras si encaja
    function stride_reg(hexid) {
        // try the mappings in stride_mappings
        // Recorre todos los mapeos definidos
        let i;
        for (i = 0; i < stride_mappings.length; ++i) {
            // Mapeo actual
            let mapping = stride_mappings[i];
            // Si el hexid está fuera del rango de este mapeo, sigue con el siguiente
            if (hexid < mapping.start || hexid > mapping.end)
                continue;
            // Calcula offset relativo al inicio del mapeo
            let offset = hexid - mapping.start + mapping.offset;
            // Calcula índice para la primera letra usando el paso mayor
            let i1 = Math.floor(offset / mapping.s1);
            // Reduce offset al resto después de extraer la parte para la primera letra
            offset = offset % mapping.s1;
            // Calcula índice para la segunda letra usando el paso menor
            let i2 = Math.floor(offset / mapping.s2);
            // Reduce offset al resto para obtener la tercera letra
            offset = offset % mapping.s2;
            // Resto es el índice de la tercera letra
            let i3 = offset;
            // Si algún índice está fuera del alfabeto, este mapeo no sirve
            if (i1 < 0 || i1 >= mapping.alphabet.length ||
                i2 < 0 || i2 >= mapping.alphabet.length ||
                i3 < 0 || i3 >= mapping.alphabet.length)
                continue;
            // Construye y devuelve la matrícula completa con prefijo y las tres letras
            return mapping.prefix + mapping.alphabet.charAt(i1) + mapping.alphabet.charAt(i2) + mapping.alphabet.charAt(i3);
        }

        // nothing
        // Si ningún mapeo coincidió, devuelve null
        return null;
    }
    // Convierte hexid en una matrícula usando plantillas numéricas predefinidas
    function numeric_reg(hexid) {
        // try the mappings in numeric_mappings
        // Recorre los mapeos numéricos
        let i;
        for (i = 0; i < numeric_mappings.length; ++i) {
            // Mapeo numérico actual
            let mapping = numeric_mappings[i];
            // Si está fuera de rango, sigue al siguiente
            if (hexid < mapping.start || hexid > mapping.end)
                continue;
            // Calcula el número de matrícula restando el inicio y sumando 'first'
            let reg = (hexid - mapping.start + mapping.first) + "";
            // Inserta ese número en la plantilla para devolver la matrícula final
            return mapping.template.substring(0, mapping.template.length - reg.length) + reg;
        }
    }

    //
    // US N-numbers
    //
    // Devuelve las letras finales para los N-numbers cuando corresponde
    function n_letters(rem) {
        if (rem == 0)
            return "";
        // Ajuste necesario para el cálculo
        --rem;
        // Calcula una letra principal y añade la parte restante
        return limited_alphabet.charAt(Math.floor(rem / 25)) + n_letter(rem % 25);
    }
    // Devuelve una sola letra según el valor rem
    function n_letter(rem) {
        // Si rem es 0 no hay letra
        if (rem == 0)
            return "";
        // Ajusta rem para indexar correctamente el alfabeto reducido
        --rem;
        // Devuelve la letra correspondiente del alfabeto limitado
        return limited_alphabet.charAt(rem);
    }
    // Construye la matrícula tipo N a partir del hexid según bloques y reglas
    function n_reg(hexid) {
        // Offset desde el inicio reservado para N-numbers
        let offset = hexid - 0xA00001;
        // Si está fuera del rango conocido para N, no aplica
        if (offset < 0 || offset >= 915399) {
            return null;
        }
        // Calcula el primer dígito y empieza la matrícula con 'N'
        let digit1 = Math.floor(offset / 101711) + 1;
        let reg = "N" + digit1;
        // Reduce offset al resto tras usar el primer bloque
        offset = offset % 101711;
        // Si el resto es pequeño, la parte final son letras
        if (offset <= 600) {
            // Na, NaA .. NaZ, NaAA .. NaZZ
            // Formatos como Na, NaA..NaZ, NaAA..NaZZ
            return reg + n_letters(offset);
        }

        // Na0* .. Na9*
        // Si no, continua en el esquema con dígitos
        offset -= 601;
        // Segundo dígito
        let digit2 = Math.floor(offset / 10111);
        reg += digit2;
        offset = offset % 10111;
        // Si el resto es pequeño, vuelve a letras
        if (offset <= 600) {
            // Nab, NabA..NabZ, NabAA..NabZZ
            // Formatos como Nab, NabA..NabZ, NabAA..NabZZ
            return reg + n_letters(offset);
        }

        // Nab0* .. Nab9*
        // Sigue con el siguiente bloque
        offset -= 601;
        // Tercer dígito
        let digit3 = Math.floor(offset / 951);
        reg += digit3;
        offset = offset % 951;
        // Si el resto es pequeño, añade letras finales
        if (offset <= 600) {
            // Nabc, NabcA .. NabcZ, NabcAA .. NabcZZ
            // Formatos como Nabc, NabcA .. NabcZ, NabcAA .. NabcZZ
            return reg + n_letters(offset);
        }

        // Nabc0* .. Nabc9*
        // Ajusta para el siguiente bloque de dígitos
        offset -= 601;
        // Cuarto dígito
        let digit4 = Math.floor(offset / 35);
        reg += digit4.toFixed(0);
        offset = offset % 35;
        // Si queda un índice que representa letra, la añade
        if (offset <= 24) {
            // Nabcd, NabcdA .. NabcdZ
            // Añade una letra final
            return reg + n_letter(offset);
        }

        // Nabcd0 .. Nabcd9
        // Si no, el resto es un dígito final
        offset -= 25;
        return reg + offset.toFixed(0);
    }

    // South Korea
    // Reglas para Corea del Sur: convierte rangos a HL + valor hex
    function hl_reg(hexid) {
        // Si entra en este rango, calcula la parte hex y la concatena
        if (hexid >= 0x71BA00 && hexid <= 0x71bf99) {
            return "HL" + (hexid - 0x71BA00 + 0x7200).toString(16);
        }
        // Otro rango con distinta base para el cálculo hex
        if (hexid >= 0x71C000 && hexid <= 0x71C099) {
            return "HL" + (hexid - 0x71C000 + 0x8000).toString(16);
        }
        // Tercer rango con su propio desplazamiento
        if (hexid >= 0x71C200 && hexid <= 0x71C299) {
            return "HL" + (hexid - 0x71C200 + 0x8200).toString(16);
        }

        return null;
    }

    // Japan
    // Reglas para Japón: construye JA + combinación de dígitos y/o letras
    function ja_reg(hexid) {
        // Calcula offset relativo al inicio de bloques japoneses
        let offset = hexid - 0x840000;
        // Si está fuera del bloque japonés conocido, no aplica
        if (offset < 0 || offset >= 229840)
            return null;
        // Comienza la matrícula con "JA"
        let reg = "JA";
        // Calcula el primer dígito a partir del offset
        let digit1 = Math.floor(offset / 22984);
        // Si el dígito no es válido, no aplica
        if (digit1 < 0 || digit1 > 9)
            return null;
        reg += digit1;
        offset = offset % 22984;
        // Calcula el segundo dígito
        let digit2 = Math.floor(offset / 916);
        // Si no es válido, no aplica
        if (digit2 < 0 || digit2 > 9)
            return null;
        reg += digit2;
        offset = offset % 916;
        // Si el offset queda en la zona baja, el tercer carácter puede ser dígito
        if (offset < 340) {
            // 3rd is a digit, 4th is a digit or letter
            // Tercer dígito por división por 34
            let digit3 = Math.floor(offset / 34);
            reg += digit3;
            offset = offset % 34;
            // Si el resto es menor que 10, el cuarto es dígito
            if (offset < 10) {
                // 4th is a digit
                // Devuelve JA con cuatro dígitos (el último numérico)
                return reg + offset;
            }

            // 4th is a letter
            // Si no, el cuarto es una letra del alfabeto limitado
            offset -= 10;
            return reg + limited_alphabet.charAt(offset);
        }

        // 3rd and 4th are letters
        // Si no entró en la rama anterior, el tercero y cuarto son letras
        offset -= 340;
        let letter3 = Math.floor(offset / 24);
        // Devuelve JA seguido de dos letras calculadas del alfabeto reducido
        return reg + limited_alphabet.charAt(letter3) + limited_alphabet.charAt(offset % 24);
    }
    // Devuelve la función que hace la búsqueda al exterior
    return lookup;
})();

// make nodejs happy:
// Si el entorno es Node.js, exporta la función para usarla desde otros ficheros
if (typeof module !== 'undefined') {
    module.exports = registration_from_hexid;
}
