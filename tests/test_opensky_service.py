import json
import os
import tempfile
import unittest
from http.server import ThreadingHTTPServer
from threading import Thread
from urllib.request import urlopen
from unittest.mock import patch

from services.opensky_service import (
    METERS_PER_SECOND_TO_FEET_PER_MINUTE,
    METERS_PER_SECOND_TO_KNOTS,
    METERS_TO_FEET,
    OpenSkyClient,
    StateCache,
    convert_states,
    load_config,
    make_handler,
)


class ConvertStatesTests(unittest.TestCase):
    def test_converts_airborne_state_vector(self):
        now = 1_800_000_000
        states = [[
            "A1B2C3", "ABC123  ", "Venezuela", now - 4, now - 2,
            -66.9, 10.5, 1000, False, 120, 90, 2, None, 1100, "1234", False, 0,
        ]]

        aircraft = convert_states(states, now)

        self.assertEqual(len(aircraft), 1)
        plane = aircraft[0]
        self.assertEqual(plane["hex"], "a1b2c3")
        self.assertEqual(plane["flight"], "ABC123")
        self.assertEqual((plane["lat"], plane["lon"]), (10.5, -66.9))
        self.assertEqual(plane["alt_baro"], round(1000 * METERS_TO_FEET))
        self.assertEqual(plane["alt_geom"], round(1100 * METERS_TO_FEET))
        self.assertEqual(plane["gs"], round(120 * METERS_PER_SECOND_TO_KNOTS))
        self.assertEqual(plane["baro_rate"], round(2 * METERS_PER_SECOND_TO_FEET_PER_MINUTE))
        self.assertEqual(plane["seen"], 2)
        self.assertEqual(plane["seen_pos"], 4)
        self.assertEqual(plane["squawk"], "1234")

    def test_ground_state_and_missing_positions(self):
        states = [
            ["ABCDEF", "", "Venezuela", 99, 99, -67, 10, 0, True, None, None, None,
             None, None, None, False, 0],
            ["FEDCBA", "", "Venezuela", 99, 99, None, 10, 0, False, None, None, None,
             None, None, None, False, 0],
            ["bad"],
        ]

        aircraft = convert_states(states, 100)

        self.assertEqual(len(aircraft), 1)
        self.assertEqual(aircraft[0]["alt_baro"], "ground")

    def test_age_is_never_negative(self):
        states = [["ABCDEF", "", "", 105, 105, -67, 10, 0, False, None, None, None,
                   None, 0, None, False, 0]]
        plane = convert_states(states, 100)[0]
        self.assertEqual((plane["seen"], plane["seen_pos"]), (0, 0))


class ClientAndCacheTests(unittest.TestCase):
    def test_oauth_credentials_are_sent_in_token_request(self):
        config = {
            "client_id": "client-id",
            "client_secret": "client-secret",
        }
        client = OpenSkyClient(config)
        with patch.object(client, "_request_json", return_value={
            "access_token": "access-token",
            "expires_in": 300,
        }) as request_json:
            self.assertEqual(client._access_token(), "access-token")

        request = request_json.call_args.args[0]
        self.assertIn(b"client_id=client-id", request.data)
        self.assertIn(b"client_secret=client-secret", request.data)

    def test_cache_surfaces_unavailable_initial_data(self):
        class Client:
            def fetch_states(self):
                raise ValueError("upstream unavailable")

        cache = StateCache(Client(), 10)
        with patch("services.opensky_service.LOG.exception"):
            cache.refresh()
        self.assertFalse(cache.health()["ok"])
        with self.assertRaises(RuntimeError):
            cache.snapshot()

    def test_aircraft_endpoint_returns_readsb_shape(self):
        cache = StateCache(None, 10)
        cache.states = [[
            "ABCDEF", "TEST123 ", "Venezuela", 99, 99, -67, 10, 1000, False,
            100, 180, 0, None, 1000, None, False, 0,
        ]]
        server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(cache))
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            for path in (
                "/aircraft.json",
                "/SVZM/data-opensky/aircraft.json",
            ):
                with urlopen(f"http://127.0.0.1:{server.server_port}{path}") as response:
                    self.assertEqual(response.status, 200)
                    payload = json.loads(response.read())
                self.assertIn("now", payload)
                self.assertEqual(payload["messages"], 0)
                self.assertEqual(payload["aircraft"][0]["hex"], "abcdef")
        finally:
            server.shutdown()
            server.server_close()
            thread.join()


class ConfigTests(unittest.TestCase):
    def test_rejects_too_fast_polling(self):
        with patch.dict("os.environ", {"OPENSKY_POLL_INTERVAL": "1"}):
            with self.assertRaisesRegex(ValueError, "at least 10"):
                load_config()

    def test_loads_opensky_credentials_json_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = os.path.join(directory, "credentials.json")
            with open(path, "w", encoding="utf-8") as file:
                json.dump(
                    {"clientId": "client-id", "clientSecret": "client-secret"},
                    file,
                )
            with patch.dict(
                "os.environ",
                {
                    "OPENSKY_CREDENTIALS_FILE": path,
                    "OPENSKY_CLIENT_ID": "",
                    "OPENSKY_CLIENT_SECRET": "",
                },
                clear=True,
            ):
                config = load_config()

        self.assertEqual(config["client_id"], "client-id")
        self.assertEqual(config["client_secret"], "client-secret")


if __name__ == "__main__":
    unittest.main()
