# World Clock Dashboard Pro

A real-time, multi-timezone clock dashboard built with **React 19 + Vite**,
combining:

- **Analog Clock** — smooth, `requestAnimationFrame`-driven hand sweep (no jerky per-second ticks)
- **Digital Clock** — live 12h/24h display with manual timezone selection
- **Timezone Management** — pick any of ~400 IANA timezones (via `Intl.supportedValuesOf`), add/remove custom world-clock cards
- **Alarms** — set named alarms, persisted in `localStorage`, browser notifications when they fire
- **Dynamic UI Controls** — light/dark theme, responsive glass-morphism layout

## Project structure

```
src/
  App.jsx                  # top-level layout, shared timezone state
  timeUtils.js             # timezone list, zoned time parsing, angle math
  component/
    AnalogClock.jsx        # rAF-driven analog clock face
    DigitalClock.jsx       # digital readout + timezone selector
    TimezoneSelect.jsx     # reusable IANA timezone <select>
    WorldClock.jsx         # grid of world-clock cards + "add zone" form
    Alarm.jsx               # alarm creation / list / notifications
```

## Run locally (no Docker)

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

## Run with Docker

### Production (nginx-served static build)

```bash
docker compose up --build web
```
Visit **http://localhost:8080**

Or without compose:
```bash
docker build -t world-clock-dashboard .
docker run -p 8080:80 world-clock-dashboard
```

### Development (hot reload, source mounted live)

```bash
docker compose up --build dev
```
Visit **http://localhost:5173** — edits to files under `src/` reload instantly.

See `Dockerfile` (production, multi-stage build → nginx), `Dockerfile.dev`
(Vite dev server), and `docker-compose.yml` for both service definitions.

## Requirements
- Node.js 18+ (for local, non-Docker use)
- Docker 20+ and Docker Compose v2 (for containerized use)
