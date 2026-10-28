# OpenSky feed

This service polls the OpenSky Network API and serves the aircraft as a
readsb-compatible `aircraft.json`. It is an additional map feed; it does not
change readsb or replace locally received aircraft.

## Install

The service uses only the Python 3 standard library.

For the current Lighttpd installation and full copy-and-paste steps, follow
[OPENSKY-INSTALACION.txt](./OPENSKY-INSTALACION.txt). The ready-to-install
Lighttpd fragment is [lighttpd-opensky.conf](./deploy/lighttpd-opensky.conf).

For a future nginx deployment:

1. Copy `deploy/opensky.service` to `/etc/systemd/system/opensky.service`.
2. Optionally create `/etc/default/tar1090-opensky` with OpenSky OAuth client
   credentials and configuration (see below). Keep this file readable only by
   root and the service account.
3. Add the contents of `deploy/nginx-opensky-location.conf` to the nginx
   `server` block serving tar1090.
4. Reload nginx and enable the service:

   ```sh
   sudo systemctl daemon-reload
   sudo systemctl enable --now opensky
   sudo nginx -t && sudo systemctl reload nginx
   ```

The service listens only on `127.0.0.1:8087`. Nginx exposes its aircraft feed
same-origin at `/tar1090/data-opensky/aircraft.json`.

## Configuration

OpenSky OAuth client credentials are optional, but recommended. If OpenSky
provided `credentials.json`, place it outside the web root (the installation
guide uses `/etc/tar1090-opensky/credentials.json`). The service reads the
`clientId` and `clientSecret` keys directly:

```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret"
}
```

The directory should be owned by `root:www-data` with mode `0750`, and the
credential file by `root:www-data` with mode `0640`. Never place it under a
web-served directory or expose it through Lighttpd/nginx. The service starts
without credentials too, subject to OpenSky's unauthenticated access limits.
Alternatively, set `OPENSKY_CREDENTIALS_FILE` in
`/etc/default/tar1090-opensky` to use another private path.

The default bounding box covers Venezuela (`lat 0..17`, `lon -74..-59`).
Optional settings:

```sh
OPENSKY_LAT_MIN=0
OPENSKY_LAT_MAX=17
OPENSKY_LON_MIN=-74
OPENSKY_LON_MAX=-59
OPENSKY_POLL_INTERVAL=10
OPENSKY_PORT=8087
```

The poll interval cannot be less than 10 seconds. An API error is logged and
the latest successful aircraft data remains available; `/health` reports a
503 until the next successful update. Before the first successful update,
`aircraft.json` also returns 503.

## Check

```sh
curl -i http://127.0.0.1:8087/health
curl -i https://your-host/tar1090/data-opensky/aircraft.json
sudo journalctl -u opensky -f
```
