
# ***** LIBRERÍAS PARA EL MANEJO DE CSV - JSON - SYSTEMA - UNICODE - FECHAS - RUTAS *****
import csv
import json
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

# ***** OBTENER LAS RUTAS DE LOS SCRIPTS *****
SCRIPT_DIR  = Path(__file__).resolve().parent
RAW_DIR     = SCRIPT_DIR / "raw_data"
OUTPUT_FILE = SCRIPT_DIR / "aero-terms.json"

# ***** OBTENER LAS RUTAS DE LAS FUENTES *****
AIRPORTS_CSV = RAW_DIR / "airports.csv"
AIRLINES_DAT = RAW_DIR / "airlines.dat.txt"
PLANES_DAT   = RAW_DIR / "planes.dat.txt"
AIRCRAFT_CSV = RAW_DIR / "aircraft-database-complete.csv"


# ***** NORMALIZAR TEXTO *****
def normalize(text) -> str:
    if text is None:
        return ""
    text = str(text)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text.lower().strip()

# ***** LIMPIAR CADENAS *****
def safe_str(value) -> str:
    if value is None:
        return ""
    s = str(value).strip().strip('"')
    if s.lower() in ("nan", "none", "null", "", "\\n"):
        return ""
    return s

# ***** LIMPIAR DECIMALES *****
def safe_float(value):
    try:
        if value is None or str(value).strip() == "":
            return None
        return float(value)
    except (ValueError, TypeError):
        return None

# ***** AÑADIR TÉRMINO DE BÚSQUEDA *****
def add_term(terms, seen, term):
    key = term["id"]
    if key in seen:
        return False
    seen.add(key)
    terms.append(term)
    return True

# ***** CONSTRUIR LAS CLAVES DE BÚSQUEDA *****
def build_keywords(*parts):
    out = []
    seen = set()
    for p in parts:
        if not p:
            continue
        for tok in normalize(p).split():
            if tok and tok not in seen:
                seen.add(tok)
                out.append(tok)
    return out

# ***** PROCESAR AEROPUERTOS *****
def process_airports(terms, seen):
    if not AIRPORTS_CSV.exists():
        print(f"[!] No existe {AIRPORTS_CSV}, se omite aeropuertos.")
        return 0

    count = 0
    with AIRPORTS_CSV.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            ident   = safe_str(row.get("ident"))
            iata    = safe_str(row.get("iata_code"))
            gps     = safe_str(row.get("gps_code"))
            local   = safe_str(row.get("local_code"))
            name    = safe_str(row.get("name"))
            city    = safe_str(row.get("municipality"))
            country = safe_str(row.get("iso_country"))
            region  = safe_str(row.get("iso_region"))
            atype   = safe_str(row.get("type"))

            primary_code = ident or iata or gps or local
            if not primary_code:
                continue

            keywords = build_keywords(
                primary_code, ident, iata, gps, local,
                name, city, country, region
            )
            search_string = " ".join(keywords)

            short_name = name
            if len(short_name) > 45:
                short_name = short_name[:42] + "…"
            short_label = f"{primary_code}"
            if iata and iata != primary_code:
                short_label += f"/{iata}"
            if short_name:
                short_label += f" — {short_name}"

            full_label = name or primary_code
            if iata and iata != primary_code:
                full_label += f" ({primary_code}/{iata})"
            else:
                full_label += f" ({primary_code})"
            if city:
                full_label += f" — {city}"
            if country:
                full_label += f", {country}"

            if atype == "large_airport":
                rank = 0
            elif atype == "medium_airport":
                rank = 1
            elif atype == "small_airport":
                rank = 2
            else:
                rank = 3

            term = {
                "id":           f"airport:{primary_code}",
                "type":         "airport",
                "code":         primary_code,
                "iata":         iata,
                "name":         name,
                "city":         city,
                "country":      country,
                "region":       region,
                "subtype":      atype,
                "lat":          safe_float(row.get("latitude_deg")),
                "lon":          safe_float(row.get("longitude_deg")),
                "elevation_ft": safe_float(row.get("elevation_ft")),
                "shortLabel":   short_label,
                "label":        full_label,
                "searchString": search_string,
                "keywords":     keywords,
                "rank":         rank,
            }
            if add_term(terms, seen, term):
                count += 1

    print(f"[✓] Aeropuertos procesados: {count}")
    return count

# ***** PROCESAR AEROLÍNEAS *****
def process_airlines(terms, seen):
    if not AIRLINES_DAT.exists():
        print(f"[!] No existe {AIRLINES_DAT}, se omite aerolíneas.")
        return 0

    count = 0
    with AIRLINES_DAT.open("r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f, quotechar='"', skipinitialspace=True)
        for row in reader:
            if not row or row[0].startswith("#") or not row[0].strip():
                continue
            if len(row) < 8:
                continue

            airline_id = safe_str(row[0])
            name       = safe_str(row[1])
            alias      = safe_str(row[2])
            iata       = safe_str(row[3])
            icao       = safe_str(row[4])
            callsign   = safe_str(row[5])
            country    = safe_str(row[6])
            active     = safe_str(row[7])

            if not name:
                continue
            primary_code = icao or iata or airline_id
            if not primary_code:
                continue

            keywords = build_keywords(
                primary_code, icao, iata, name, alias, callsign, country
            )
            search_string = " ".join(keywords)

            short_label = f"{primary_code}"
            if iata and iata != primary_code:
                short_label += f"/{iata}"
            if name:
                sn = name if len(name) <= 45 else name[:42] + "…"
                short_label += f" — {sn}"

            label = name
            if icao or iata:
                codes = "/".join(filter(None, [icao, iata])) or primary_code
                label += f" ({codes})"
            if country:
                label += f" — {country}"

            # rank: 0 si está activa, 3 si no lo sabemos
            rank = 0 if active in ("Y", "y", "yes", "1", "true") else 2

            term = {
                "id":           f"airline:{primary_code}",
                "type":         "airline",
                "code":         primary_code,
                "iata":         iata,
                "icao":         icao,
                "callsign":     callsign,
                "name":         name,
                "alias":        alias,
                "country":      country,
                "active":       active,
                "shortLabel":   short_label,
                "label":        label,
                "searchString": search_string,
                "keywords":     keywords,
                "rank":         rank,
            }
            if add_term(terms, seen, term):
                count += 1

    print(f"[✓] Aerolíneas procesadas: {count}")
    return count

# ***** PROCESAR TIPOS DE AERONAVES *****
def process_aircraft(terms, seen):
    count = 0

    if AIRCRAFT_CSV.exists():
        with AIRCRAFT_CSV.open("r", encoding="utf-8", newline="") as f:
            for row in csv.DictReader(f):
                typecode = (safe_str(row.get("typecode"))
                            or safe_str(row.get("icaoaircrafttype")))
                model        = safe_str(row.get("model"))
                manufacturer = (safe_str(row.get("manufacturername"))
                                or safe_str(row.get("manufacturericao")))
                if not typecode:
                    continue

                keywords = build_keywords(
                    typecode, model, manufacturer,
                    safe_str(row.get("icaoaircrafttype"))
                )
                search_string = " ".join(keywords)

                short_label = typecode
                if model and model != typecode:
                    sn = model if len(model) <= 40 else model[:37] + "…"
                    short_label += f" — {sn}"
                elif manufacturer:
                    short_label += f" — {manufacturer}"

                label_parts = [typecode]
                if manufacturer:
                    label_parts.append(manufacturer)
                if model and model != typecode:
                    label_parts.append(model)
                label = " — ".join(label_parts)

                term = {
                    "id":           f"aircraft:{typecode}",
                    "type":         "aircraft",
                    "code":         typecode,
                    "model":        model,
                    "manufacturer": manufacturer,
                    "category":     safe_str(row.get("categoryDescription")),
                    "engines":      safe_str(row.get("engines")),
                    "shortLabel":   short_label,
                    "label":        label,
                    "searchString": search_string,
                    "keywords":     keywords,
                    "rank":         1,
                }
                if add_term(terms, seen, term):
                    count += 1
        print(f"[✓] Tipos de aeronave (OpenSky): {count}")
        return count

    if not PLANES_DAT.exists():
        print(f"[!] No existe {PLANES_DAT} ni {AIRCRAFT_CSV.name}.")
        return 0

    with PLANES_DAT.open("r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            if len(row) < 3:
                continue

            name = safe_str(row[0])
            iata = safe_str(row[1])
            icao = safe_str(row[2])
            code = icao or iata
            if not code:
                continue

            keywords = build_keywords(code, name, iata)
            search_string = " ".join(keywords)

            short_label = code
            if name and name != code:
                sn = name if len(name) <= 45 else name[:42] + "…"
                short_label += f" — {sn}"

            label = code
            if name and name != code:
                label += f" — {name}"

            term = {
                "id":           f"aircraft:{code}",
                "type":         "aircraft",
                "code":         code,
                "iata":         iata,
                "icao":         icao,
                "model":        name,
                "shortLabel":   short_label,
                "label":        label,
                "searchString": search_string,
                "keywords":     keywords,
                "rank":         1,
            }
            if add_term(terms, seen, term):
                count += 1

    print(f"[✓] Tipos de aeronave (planes.dat): {count}")
    return count

# ***** FUNCIÓN PRINCIPAL *****
def main():
    if not RAW_DIR.exists():
        print(f"[ERROR] No existe {RAW_DIR}")
        sys.exit(1)

    terms = []
    seen  = set()

    process_airports(terms, seen)
    process_airlines(terms, seen)
    process_aircraft(terms, seen)

    terms.sort(key=lambda t: (t.get("rank", 9), t.get("label", "").lower()))

    payload = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "count":     len(terms),
        "terms":     terms,
    }

    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))

    size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    print(f"\n[✓] Generado {OUTPUT_FILE.name}")
    print(f"    Términos: {len(terms)}")
    print(f"    Tamaño:   {size_mb:.2f} MB")


if __name__ == "__main__":
    main()