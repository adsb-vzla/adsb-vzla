#!/usr/bin/env python3
"""Poll OpenSky Network and expose its states in tar1090 aircraft.json format."""

import json
import logging
import math
import os
import threading
import time
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

LOG = logging.getLogger("opensky")
TOKEN_URL = (
    "https://auth.opensky-network.org/auth/realms/opensky-network/"
    "protocol/openid-connect/token"
)
API_URL = "https://opensky-network.org/api/states/all"
METERS_TO_FEET = 3.280839895
METERS_PER_SECOND_TO_KNOTS = 1.943844492
METERS_PER_SECOND_TO_FEET_PER_MINUTE = 196.850394


def env_float(name, default):
    value = float(os.environ.get(name, default))
    if not math.isfinite(value):
        raise ValueError(f"{name} must be a finite number")
    if not -90 <= value <= 90 and name.endswith(("LAT_MIN", "LAT_MAX")):
        raise ValueError(f"{name} must be between -90 and 90")
    if not -180 <= value <= 180 and name.endswith(("LON_MIN", "LON_MAX")):
        raise ValueError(f"{name} must be between -180 and 180")
    return value


def load_config():
    credentials_file = os.environ.get(
        "OPENSKY_CREDENTIALS_FILE", "/etc/tar1090-opensky/credentials.json"
    )
    file_client_id = ""
    file_client_secret = ""
    if credentials_file and Path(credentials_file).exists():
        try:
            with open(credentials_file, encoding="utf-8") as file:
                credentials = json.load(file)
        except (OSError, json.JSONDecodeError) as error:
            raise ValueError(f"Could not read OpenSky credentials file: {error}") from error
        if not isinstance(credentials, dict):
            raise ValueError("OpenSky credentials file must contain a JSON object")
        file_client_id = credentials.get("clientId", "")
        file_client_secret = credentials.get("clientSecret", "")
        if not isinstance(file_client_id, str) or not isinstance(file_client_secret, str):
            raise ValueError("OpenSky clientId and clientSecret must be strings")
        if not file_client_id or not file_client_secret:
            raise ValueError("OpenSky credentials file must contain clientId and clientSecret")

    config = {
        "lat_min": env_float("OPENSKY_LAT_MIN", 0),
        "lat_max": env_float("OPENSKY_LAT_MAX", 17),
        "lon_min": env_float("OPENSKY_LON_MIN", -74),
        "lon_max": env_float("OPENSKY_LON_MAX", -59),
        "poll_interval": int(os.environ.get("OPENSKY_POLL_INTERVAL", "10")),
        "port": int(os.environ.get("OPENSKY_PORT", "8087")),
        "client_id": os.environ.get("OPENSKY_CLIENT_ID") or file_client_id,
        "client_secret": os.environ.get("OPENSKY_CLIENT_SECRET") or file_client_secret,
    }
    if config["lat_min"] >= config["lat_max"]:
        raise ValueError("OPENSKY_LAT_MIN must be less than OPENSKY_LAT_MAX")
    if config["lon_min"] >= config["lon_max"]:
        raise ValueError("OPENSKY_LON_MIN must be less than OPENSKY_LON_MAX")
    if config["poll_interval"] < 10:
        raise ValueError("OPENSKY_POLL_INTERVAL must be at least 10 seconds")
    if not 1 <= config["port"] <= 65535:
        raise ValueError("OPENSKY_PORT must be between 1 and 65535")
    if bool(config["client_id"]) != bool(config["client_secret"]):
        raise ValueError("Set both OPENSKY_CLIENT_ID and OPENSKY_CLIENT_SECRET")
    return config


def _number(value, multiplier=1):
    if value is None:
        return None
    return round(float(value) * multiplier)


def convert_states(states, now):
    """Convert OpenSky StateVector rows into readsb-compatible aircraft objects."""
    aircraft = []
    for state in states:
        if not isinstance(state, list) or len(state) < 17:
            continue
        icao24 = state[0]
        longitude, latitude = state[5], state[6]
        if not icao24 or longitude is None or latitude is None:
            continue

        on_ground = bool(state[8])
        position_time = state[3] if state[3] is not None else state[4]
        contact_time = state[4] if state[4] is not None else position_time
        plane = {
            "hex": str(icao24).lower(),
            "flight": (state[1] or "").strip(),
            "lat": latitude,
            "lon": longitude,
            "seen": max(0, now - contact_time) if contact_time is not None else 0,
            "seen_pos": max(0, now - position_time) if position_time is not None else 0,
            "messages": 0,
        }
        if on_ground:
            plane["alt_baro"] = "ground"
        else:
            if state[7] is not None:
                plane["alt_baro"] = _number(state[7], METERS_TO_FEET)
            if state[13] is not None:
                plane["alt_geom"] = _number(state[13], METERS_TO_FEET)
        if state[9] is not None:
            plane["gs"] = _number(state[9], METERS_PER_SECOND_TO_KNOTS)
        if state[10] is not None:
            plane["track"] = state[10]
        if state[11] is not None:
            plane["baro_rate"] = _number(
                state[11], METERS_PER_SECOND_TO_FEET_PER_MINUTE
            )
        if state[14]:
            plane["squawk"] = str(state[14])
        aircraft.append(plane)
    return aircraft


class OpenSkyClient:
    def __init__(self, config):
        self.config = config
        self.token = None
        self.token_expires_at = 0

    @staticmethod
    def _request_json(request):
        with urlopen(request, timeout=15) as response:
            return json.loads(response.read())

    def _access_token(self):
        if not self.config["client_id"]:
            return None
        if self.token and time.time() < self.token_expires_at:
            return self.token
        body = urlencode({
            "grant_type": "client_credentials",
            "client_id": self.config["client_id"],
            "client_secret": self.config["client_secret"],
        }).encode()
        request = Request(
            TOKEN_URL,
            data=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        token_data = self._request_json(request)
        self.token = token_data["access_token"]
        self.token_expires_at = time.time() + max(
            0, int(token_data.get("expires_in", 300)) - 30
        )
        return self.token

    def fetch_states(self):
        params = urlencode({
            "lamin": self.config["lat_min"],
            "lamax": self.config["lat_max"],
            "lomin": self.config["lon_min"],
            "lomax": self.config["lon_max"],
        })
        headers = {"Accept": "application/json", "User-Agent": "tar1090-opensky/1.0"}
        token = self._access_token()
        if token:
            headers["Authorization"] = f"Bearer {token}"
        request = Request(f"{API_URL}?{params}", headers=headers)
        data = self._request_json(request)
        if not isinstance(data, dict) or not isinstance(data.get("states"), list):
            raise ValueError("OpenSky returned an unexpected response")
        return data["states"]


class StateCache:
    def __init__(self, client, poll_interval):
        self.client = client
        self.poll_interval = poll_interval
        self.lock = threading.Lock()
        self.states = None
        self.updated_at = None
        self.last_error = None

    def refresh(self):
        try:
            states = self.client.fetch_states()
        except (HTTPError, URLError, TimeoutError, ValueError, KeyError) as error:
            with self.lock:
                self.last_error = str(error)
            LOG.exception("OpenSky update failed")
            return
        with self.lock:
            self.states = states
            self.updated_at = time.time()
            self.last_error = None
        LOG.info("Updated OpenSky cache with %d states", len(states))

    def run(self):
        while True:
            started = time.monotonic()
            self.refresh()
            time.sleep(max(0, self.poll_interval - (time.monotonic() - started)))

    def snapshot(self):
        with self.lock:
            if self.states is None:
                raise RuntimeError(self.last_error or "OpenSky data is not available yet")
            now = time.time()
            return {
                "now": now,
                "messages": 0,
                "aircraft": convert_states(self.states, now),
            }

    def health(self):
        with self.lock:
            return {
                "ok": self.states is not None and self.last_error is None,
                "updated_at": self.updated_at,
                "error": self.last_error,
            }


def make_handler(cache):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path not in (
                "/aircraft.json",
                "/health",
                "/SVZM/data-opensky/aircraft.json",
                "/SVZM/data-opensky/health",
            ):
                self.send_error(404)
                return
            if self.path.endswith("/health"):
                payload = cache.health()
                status = 200 if payload["ok"] else 503
            else:
                try:
                    payload = cache.snapshot()
                    status = 200
                except RuntimeError as error:
                    payload = {"error": str(error)}
                    status = 503
            body = json.dumps(payload, separators=(",", ":")).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, fmt, *args):
            LOG.info("%s - %s", self.address_string(), fmt % args)

    return Handler


def main():
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO"),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    config = load_config()
    cache = StateCache(OpenSkyClient(config), config["poll_interval"])
    threading.Thread(target=cache.run, name="opensky-poller", daemon=True).start()
    server = ThreadingHTTPServer(
        ("127.0.0.1", config["port"]), make_handler(cache)
    )
    LOG.info("Serving OpenSky aircraft feed on 127.0.0.1:%d", config["port"])
    server.serve_forever()


if __name__ == "__main__":
    main()
