(function () {
    const API_URL = 'http://192.168.1.102:8000/api/flights/';
    const API_TOKEN = '1189d5e4c33957ec8cbc1735c3b1990fdbce6441';
    const TEXT = {
        en: {
            button: 'Flight plans',
            title: 'Flight plans',
            date: 'Date',
            flight: 'Flight',
            leg: 'Leg',
            origin: 'Origin',
            destination: 'Destination',
            departure: 'Departure',
            arrival: 'Arrival',
            status: 'Status',
            scheduled: 'Scheduled',
            inFlight: 'In flight',
            landed: 'Landed',
            loading: 'Loading flights...',
            count: '{count} leg{plural} for this date.',
            empty: 'No flights for this date.',
            corsError: 'Could not reach the API. Check CORS, the connection, and server access.',
            requestError: 'Could not load flights: {message}',
            paginationError: 'The API returned a pagination link from another origin.',
            formatError: 'The API response has an unexpected format.',
            httpError: 'The API responded with HTTP {status}.'
        },
        es: {
            button: 'Planes de vuelo',
            title: 'Planes de vuelo',
            date: 'Fecha',
            flight: 'Vuelo',
            leg: 'Tramo',
            origin: 'Origen',
            destination: 'Destino',
            departure: 'Salida',
            arrival: 'Llegada',
            status: 'Estado',
            scheduled: 'Programado',
            inFlight: 'En vuelo',
            landed: 'Aterrizado',
            loading: 'Consultando vuelos...',
            count: '{count} tramo{plural} para esta fecha.',
            empty: 'No hay vuelos para esta fecha.',
            corsError: 'No se pudo consultar la API. Verifica CORS, la conexión y el acceso al servidor.',
            requestError: 'No se pudieron cargar los vuelos: {message}',
            paginationError: 'La API devolvió un enlace de paginación de otro origen.',
            formatError: 'La respuesta de la API no tiene el formato esperado.',
            httpError: 'La API respondió HTTP {status}.'
        }
    };

    function language() {
        const selected = window.translate && window.translate.getLang
            ? window.translate.getLang()
            : localStorage.getItem('app_lang');
        return selected === 'en' ? 'en' : 'es';
    }

    function text(key, values) {
        return Object.entries(values || {}).reduce((result, [name, value]) => {
            return result.replace(`{${name}}`, value);
        }, TEXT[language()][key]);
    }

    function localizedError(key, values) {
        const error = new Error(text(key, values));
        error.translationKey = key;
        error.translationValues = values;
        return error;
    }

    function localDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function addCell(row, value) {
        const cell = document.createElement('td');
        cell.textContent = value == null || value === '' ? '—' : String(value);
        row.appendChild(cell);
    }

    function translateFlightStatus(status) {
        const normalized = String(status || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
        const statusKeys = {
            scheduled: 'scheduled',
            programado: 'scheduled',
            in_flight: 'inFlight',
            en_vuelo: 'inFlight',
            landed: 'landed',
            aterrizado: 'landed'
        };
        const key = statusKeys[normalized];
        return key ? text(key) : status;
    }

    function renderFlights(flights, date, table) {
        const rows = [];

        flights.filter(flight => String(flight.date || '').slice(0, 10) === date)
            .forEach(flight => {
                const legs = Array.isArray(flight.legs) && flight.legs.length ? flight.legs : [null];
                legs.forEach(leg => rows.push({ flight, leg }));
            });

        const head = document.createElement('thead');
        head.className = 'aircraft_table_header';
        const headerRow = document.createElement('tr');
        ['date', 'flight', 'leg', 'origin', 'destination', 'departure', 'arrival', 'status']
            .map(key => text(key))
            .forEach(label => addCell(headerRow, label));
        head.appendChild(headerRow);

        const body = document.createElement('tbody');
        rows.forEach(({ flight, leg }) => {
            const row = document.createElement('tr');
            addCell(row, flight.date);
            addCell(row, flight.flight_number);
            addCell(row, leg && leg.segment_number);
            addCell(row, leg && leg.origin);
            addCell(row, leg && leg.destination);
            addCell(row, leg && leg.departure_time);
            addCell(row, leg && leg.arrival_time);
            addCell(row, leg && translateFlightStatus(leg.status));
            body.appendChild(row);
        });

        table.replaceChildren(head, body);
        return rows.length;
    }

    async function getFlights(signal) {
        const flights = [];
        let nextUrl = API_URL;

        while (nextUrl) {
            const url = new URL(nextUrl, API_URL);
            if (url.origin !== new URL(API_URL).origin) {
                throw localizedError('paginationError');
            }

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Token ${API_TOKEN}`
                },
                signal
            });
            if (!response.ok) {
                throw localizedError('httpError', { status: response.status });
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                flights.push(...data);
                nextUrl = null;
            } else if (data && Array.isArray(data.results)) {
                flights.push(...data.results);
                nextUrl = data.next || null;
            } else {
                throw localizedError('formatError');
            }
        }

        return flights;
    }

    function init() {
        const toggle = document.getElementById('flight-plans-toggle');
        const panel = document.getElementById('flight-plans-panel');
        const title = document.getElementById('flight-plans-title');
        const status = document.getElementById('flight-plans-status');
        const table = document.getElementById('flightPlansTable');
        const tab = document.getElementById('flight-plans-tab');
        if (!toggle || !panel || !title || !status || !table || !tab) return;

        tab.setAttribute('aria-controls', '');
        let activeRequest = null;
        let loadedFlights = null;
        let shownDate = null;
        let resultState = 'idle';
        let resultCount = 0;
        let resultError = null;

        function updateStatus() {
            if (resultState === 'loading') {
                status.textContent = text('loading');
            } else if (resultState === 'loaded') {
                status.textContent = text('count', {
                    count: resultCount,
                    plural: resultCount === 1 ? '' : 's'
                });
            } else if (resultState === 'empty') {
                status.textContent = text('empty');
            } else if (resultState === 'error') {
                status.textContent = resultError instanceof TypeError
                    ? text('corsError')
                    : text('requestError', {
                        message: resultError.translationKey
                            ? text(resultError.translationKey, resultError.translationValues)
                            : resultError.message
                    });
            }
        }

        function updateLanguage() {
            toggle.textContent = text('button');
            if (shownDate) title.textContent = `${text('title')} - ${shownDate}`;
            if (loadedFlights) {
                resultCount = renderFlights(loadedFlights, shownDate, table);
                resultState = resultCount ? 'loaded' : 'empty';
            }
            updateStatus();
        }

        document.addEventListener('languageChanged', updateLanguage);
        updateLanguage();

        toggle.addEventListener('click', async event => {
            event.preventDefault();
            event.stopPropagation();

            if (!panel.classList.contains('hidden')) {
                panel.classList.add('hidden');
                toggle.setAttribute('aria-expanded', 'false');
                tab.classList.remove('flight-plans-active');
                if (activeRequest) activeRequest.abort();
                activeRequest = null;
                return;
            }

            panel.classList.remove('hidden');
            toggle.setAttribute('aria-expanded', 'true');
            tab.classList.add('flight-plans-active');
            shownDate = localDateString();
            title.textContent = `${text('title')} - ${shownDate}`;
            resultState = 'loading';
            updateStatus();
            table.replaceChildren();

            const request = new AbortController();
            activeRequest = request;
            try {
                const flights = await getFlights(request.signal);
                if (activeRequest !== request) return;
                loadedFlights = flights;
                resultCount = renderFlights(flights, shownDate, table);
                resultState = resultCount ? 'loaded' : 'empty';
                updateStatus();
            } catch (error) {
                if (error.name === 'AbortError' || activeRequest !== request) return;
                resultError = error;
                resultState = 'error';
                updateStatus();
            } finally {
                if (activeRequest === request) activeRequest = null;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();