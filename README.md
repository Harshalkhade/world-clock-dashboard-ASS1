# World Clock Dashboard Pro — Enterprise Edition

An advanced, real-time multi-timezone clock and global time management application built with **React 19 + Vite**, **Vanilla CSS & Bootstrap 5**, and the **Web Audio API**.

---

## Key Features

### 1. Precision Responsive SVG Analog Clock
- **Vector SVG Scalability**: `viewBox="0 0 320 320"` ensures crisp rendering and zero distortion on any display from 320px mobile screens to 4K monitors.
- **4 Dial Themes**:
  - `Chrono`: Aviator chronograph dial with 24-hour subdial complication and date aperture.
  - `Modern`: Clean minimalist markers with glowing accent hands.
  - `Roman`: Luxury heritage dial with Roman numerals (`XII`, `I`, `II`...) and gold-brushed bezel.
  - `Cyber`: Cyberpunk neon dial with electric cyan & magenta radial indicators.
- **Movement Modes**:
  - `Sweep`: Silky 60fps continuous hand motion driven by `requestAnimationFrame`.
  - `Quartz`: Authentic 1 Hz discrete ticking motion with optional audio tick sound.
- **Complications**: Live 24-Hour subdial, Day of month date window, business status pill, and UTC offset badge.

### 2. Futuristic Digital Clock & Solar Tracker
- **High-Legibility Readout**: Tabular digits with optional high-precision milliseconds (`.ms`) toggle.
- **Solar Day / Night Tracker**: Visual daylight progress bar displaying Dawn 🌅, Morning ☀️, Afternoon ☀️, Sunset 🌇, Twilight 🌆, and Night 🌙 phases.
- **Timezone Telemetry**: Displays relative time difference (e.g. `+5.5h ahead (Tomorrow)`, `Your local time`), UTC offset (`UTC+05:30`), and one-click timestamp copy.
- **Zen Fullscreen Mode**: Distraction-free, full-display bedside/desk clock.

### 3. Interactive Time Scrubber & Global Meeting Planner
- **24-Hour Timeline Scrubber**: Drag the slider to simulate any time across the globe and instantly see corresponding times for all active regional hubs.
- **Business Overlap Analysis**: Live counter of open business hubs (9:00 AM - 5:00 PM) for planning friction-free international meetings.
- **Quick Time Jumps**: Jump to Start Work (09:00), Afternoon (14:00), End of Day (17:00), or Evening (21:00).

### 4. Global World Timezones Management
- **Search & Filter**: Real-time multi-keyword filter matching city, country, or IANA timezone code.
- **Quick Preset Bundles**: One-click loading of *Global Financial Hubs*, *Tech & Silicon Ecosystem*, and *Americas Coast-to-Coast*.
- **Mini Analog Clock**: Toggleable mini analog clock previews directly inside each world clock card.
- **Persistence**: Remembers all user additions, removals, and preferences in `localStorage`.
- **Sort Controls**: Sort by default, alphabetical by name, or chronologically by UTC offset.

### 5. Advanced Timezone-Aware Alarm Manager
- **Multi-Zone Alarms**: Set alarms in your local time or any specific international timezone (e.g. London Market Open, Tokyo Standup).
- **Procedural Web Audio Synthesizer**: Synthesizes pleasant Melodic Chimes, Digital Beeps, and Gentle Marimba tones with zero external audio assets.
- **Interactive Ringing Alert Modal**: Visual pulsing alert banner with **Snooze (+5m, +10m)** and **Dismiss** controls.
- **Instant Test Trigger**: 3-second quick test button to immediately test audio and visual alert workflows.

### 6. Time Tools Suite (Stopwatch & Countdown Timer)
- **Millisecond Stopwatch**: Start, Pause, Resume, Reset, and record Split Laps with automated **Fastest** and **Slowest** lap highlights.
- **Circular Countdown Timer**: Circular SVG progress gauge with quick presets (🍅 Pomodoro 25m, ☕ Break 5m, 👥 Standup 15m, ⌛ Focus 1h) and audio alert upon completion.

### 7. Dynamic UI Themes & Controls
- **4 Color Themes**:
  - 🌌 *Deep Space Navy* (Dark)
  - ✨ *Pearl Clean* (Light)
  - ⚡ *Cyber Matrix* (Neon Cyan & Emerald)
  - 🌇 *Crimson Sunset* (Rose & Amber)
- **Global Preferences**: 12H / 24H time format sync, synthesized sound effects toggle, responsive mobile tab navigation.

---

## Project Structure

```
world-clock-dashboard/
├── index.html                   # HTML entry point with Google Fonts & Bootstrap 5
├── package.json                 # Project dependencies & Vite scripts
├── vite.config.js               # Vite configuration
└── src/
    ├── main.jsx                 # React root mounting
    ├── App.jsx                  # Top-level state, theme engine, navigation tabs, alarm modal
    ├── App.css                  # Design system, glassmorphic cards, dynamic theme tokens
    ├── index.css                # Base resets & custom scrollbar
    ├── timeUtils.js             # IANA timezone calculations, solar math, relative offsets, presets
    ├── hooks/
    │   └── useSoundEffects.js   # Web Audio API audio synthesis (chimes, ticks, lap beeps, alarms)
    └── component/
        ├── AnalogClock.jsx      # Responsive SVG analog clock with 4 dial themes & complications
        ├── AnalogClock.css      # SVG clock themes, dial styling, and bezel reflections
        ├── DigitalClock.jsx     # Digital readout, solar tracker, UTC telemetry, Zen mode
        ├── TimezoneSelect.jsx   # Searchable IANA timezone dropdown grouped by region
        ├── TimeConverter.jsx    # Interactive 24-hour time scrubber & meeting planner
        ├── WorldClock.jsx       # Grid of world clocks, search filter, presets, mini analog preview
        ├── Alarm.jsx            # Timezone-aware alarm list, recurrence, and test trigger
        ├── AlarmModal.jsx       # Ringing alarm modal with audio loop, Snooze, and Dismiss
        └── TimerStopwatch.jsx   # Millisecond stopwatch with laps & circular countdown timer
```

---

## Getting Started

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev
```

Visit **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Docker Container

```bash
# Run production build with Nginx
docker compose up --build web

# Or run Vite dev server in Docker
docker compose up --build dev
```

---

## Verification & Technologies

- **React 19**
- **Vite 8**
- **Bootstrap 5.3**
- **Web Audio API** (Procedural synthesis)
- **Intl.DateTimeFormat & IANA Timezone Engine**
- **SVG Coordinate Trigonometry & `requestAnimationFrame`**
