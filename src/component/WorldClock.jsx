import { useEffect, useState, useMemo } from "react";
import {
    getCurrentTime,
    getCurrentDate,
    convertTo12Hour,
    defaultTimeZones,
    timezonePresetBundles,
    formatZoneLabel,
    getUtcOffsetString,
    getRelativeTimeDifference,
    getBusinessStatus,
    getSolarPhase,
    getAllTimeZones
} from "../timeUtils";
import TimezoneSelect from "./TimezoneSelect";

const STORAGE_KEY = "world_clock_dashboard_zones";

function WorldClock({ is24Hour = true, soundEnabled = false, onButtonClick = null }) {
    // Load persisted world clocks or default to defaultTimeZones
    const [clocks, setClocks] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {
            // fallback
        }
        return defaultTimeZones;
    });

    const [timeData, setTimeData] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newZone, setNewZone] = useState("Asia/Singapore");
    const [newCity, setNewCity] = useState("");
    const [newEmoji, setNewEmoji] = useState("🌐");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("default"); // default, offset, name
    const [showMiniAnalog, setShowMiniAnalog] = useState(false);

    // Save to localStorage on changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clocks));
        } catch {
            // localStorage error
        }
    }, [clocks]);

    // Live update interval
    useEffect(() => {
        const updateTimes = () => {
            const updated = {};
            clocks.forEach((clock) => {
                const rawTime = getCurrentTime(clock.zone, false, true);
                const displayTime = is24Hour ? rawTime : convertTo12Hour(rawTime);
                const date = getCurrentDate(clock.zone);
                const offset = getUtcOffsetString(clock.zone);
                const diff = getRelativeTimeDifference(clock.zone);
                const business = getBusinessStatus(clock.zone);
                const solar = getSolarPhase(clock.zone);

                // Calculate second/minute/hour for mini analog clock
                const [h, m, s] = rawTime.split(":").map(Number);
                const secondAngle = (s || 0) * 6;
                const minuteAngle = ((m || 0) * 6) + ((s || 0) * 0.1);
                const hourAngle = (((h || 0) % 12) * 30) + ((m || 0) * 0.5);

                updated[clock.zone] = {
                    displayTime,
                    date,
                    offset,
                    diff,
                    business,
                    solar,
                    hourAngle,
                    minuteAngle,
                    secondAngle
                };
            });
            setTimeData(updated);
        };

        updateTimes();
        const timer = setInterval(updateTimes, 1000);
        return () => clearInterval(timer);
    }, [clocks, is24Hour]);

    // Remove clock
    const removeClock = (zone) => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setClocks(clocks.filter((item) => item.zone !== zone));
    };

    // Add clock
    const addClock = (e) => {
        e.preventDefault();
        if (!newZone) return;

        const exists = clocks.some((item) => item.zone === newZone);
        if (exists) {
            setShowAddForm(false);
            return;
        }

        if (onButtonClick && soundEnabled) onButtonClick();
        const city = newCity.trim() || formatZoneLabel(newZone) || newZone;
        const country = newZone.split("/")[0].replace(/_/g, " ");

        setClocks([
            ...clocks,
            {
                city,
                country,
                zone: newZone,
                emoji: newEmoji || "🌐"
            }
        ]);

        setNewCity("");
        setShowAddForm(false);
    };

    // Load preset bundle
    const loadPreset = (bundle) => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setClocks(bundle.zones);
    };

    // Reset to defaults
    const resetDefaults = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setClocks(defaultTimeZones);
    };

    // Filter & Sort
    const filteredClocks = useMemo(() => {
        let result = clocks.filter((c) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                c.city.toLowerCase().includes(q) ||
                c.zone.toLowerCase().includes(q) ||
                (c.country && c.country.toLowerCase().includes(q))
            );
        });

        if (sortBy === "name") {
            result = [...result].sort((a, b) => a.city.localeCompare(b.city));
        } else if (sortBy === "offset") {
            result = [...result].sort((a, b) => {
                const offA = timeData[a.zone]?.diff?.hoursDiff || 0;
                const offB = timeData[b.zone]?.diff?.hoursDiff || 0;
                return offA - offB;
            });
        }

        return result;
    }, [clocks, searchQuery, sortBy, timeData]);

    return (
        <div className="container mt-5">
            {/* Header & Quick Action Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h3 className="section-title mb-0">
                        🌎 Global Time Zones ({clocks.length} Active)
                    </h3>
                    <p className="text-muted small mb-0">
                        Monitor live regional times, business status, and solar daylight phases across the globe.
                    </p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <button
                        className={`btn btn-sm btn-outline-secondary rounded-pill ${showMiniAnalog ? "active" : ""}`}
                        onClick={() => setShowMiniAnalog(!showMiniAnalog)}
                        title="Toggle Mini Analog Clock Preview"
                        type="button"
                    >
                        🕒 Mini Analog {showMiniAnalog ? "ON" : "OFF"}
                    </button>

                    <button
                        className="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
                        onClick={() => {
                            if (onButtonClick && soundEnabled) onButtonClick();
                            setShowAddForm((s) => !s);
                        }}
                        type="button"
                    >
                        {showAddForm ? "✕ Cancel" : "+ Add Time Zone"}
                    </button>
                </div>
            </div>

            {/* Filter & Presets Bar */}
            <div className="card filter-bar-card shadow-sm p-3 mb-4 rounded-4">
                <div className="row g-2 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-transparent border-end-0">🔍</span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search active timezones (e.g. Tokyo, London, India)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setSearchQuery("")}
                                    type="button"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Sort:</span>
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Default Order</option>
                                <option value="name">City Name (A-Z)</option>
                                <option value="offset">Time Offset (West to East)</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-md-4 text-md-end">
                        <div className="dropdown d-inline-block">
                            <button
                                className="btn btn-sm btn-outline-primary dropdown-toggle rounded-pill"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                ⚡ Preset Bundles
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow">
                                {timezonePresetBundles.map((b) => (
                                    <li key={b.name}>
                                        <button
                                            className="dropdown-item py-2"
                                            onClick={() => loadPreset(b)}
                                            type="button"
                                        >
                                            <div className="fw-bold">{b.name}</div>
                                            <small className="text-muted">{b.description}</small>
                                        </button>
                                    </li>
                                ))}
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button
                                        className="dropdown-item text-danger py-2"
                                        onClick={resetDefaults}
                                        type="button"
                                    >
                                        ↺ Reset to Default Cities
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Zone Form Accordion */}
            {showAddForm && (
                <form className="add-zone-form shadow mb-4 rounded-4" onSubmit={addClock}>
                    <h5 className="mb-3 fw-bold">Add New World Clock</h5>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-5">
                            <label htmlFor="new-zone-select" className="form-label small fw-semibold text-uppercase text-muted mb-1">
                                Choose IANA Timezone (400+ available)
                            </label>
                            <TimezoneSelect
                                id="new-zone-select"
                                value={newZone}
                                onChange={setNewZone}
                            />
                        </div>

                        <div className="col-md-3">
                            <label htmlFor="new-city-input" className="form-label small fw-semibold text-uppercase text-muted mb-1">
                                Display Name (Optional)
                            </label>
                            <input
                                id="new-city-input"
                                type="text"
                                className="form-control"
                                placeholder="e.g. Headquarters"
                                value={newCity}
                                onChange={(e) => setNewCity(e.target.value)}
                            />
                        </div>

                        <div className="col-md-2">
                            <label htmlFor="new-emoji-input" className="form-label small fw-semibold text-uppercase text-muted mb-1">
                                Emoji Icon
                            </label>
                            <input
                                id="new-emoji-input"
                                type="text"
                                className="form-control text-center"
                                maxLength={2}
                                value={newEmoji}
                                onChange={(e) => setNewEmoji(e.target.value)}
                            />
                        </div>

                        <div className="col-md-2">
                            <button className="btn btn-primary w-100 fw-bold" type="submit">
                                + Save Zone
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* World Clock Cards Grid */}
            <div className="row g-4">
                {filteredClocks.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted fs-5">No timezones match "{searchQuery}"</p>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setSearchQuery("")} type="button">
                            Clear Search
                        </button>
                    </div>
                ) : (
                    filteredClocks.map((clock) => {
                        const data = timeData[clock.zone] || {};
                        return (
                            <div className="col-md-6 col-lg-4" key={clock.zone}>
                                <div className="card world-card shadow h-100">
                                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                                        {/* Card Top: City, Country, Offset */}
                                        <div>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h4 className="mb-0 fw-bold world-card-title">
                                                        <span className="me-2">{clock.emoji || "🌐"}</span>
                                                        {clock.city}
                                                    </h4>
                                                    <small className="text-muted">{clock.country || formatZoneLabel(clock.zone)}</small>
                                                </div>
                                                <span className="badge bg-secondary-subtle text-secondary-emphasis">
                                                    {data.offset || getUtcOffsetString(clock.zone)}
                                                </span>
                                            </div>

                                            {/* Optional Mini Analog Clock Preview */}
                                            {showMiniAnalog && (
                                                <div className="mini-analog-container my-3">
                                                    <svg viewBox="0 0 100 100" className="mini-analog-svg">
                                                        <circle cx="50" cy="50" r="46" className="mini-clock-face" />
                                                        {/* Hour Hand */}
                                                        <line
                                                            x1="50"
                                                            y1="50"
                                                            x2="50"
                                                            y2="28"
                                                            className="mini-hand-hour"
                                                            transform={`rotate(${data.hourAngle || 0} 50 50)`}
                                                        />
                                                        {/* Minute Hand */}
                                                        <line
                                                            x1="50"
                                                            y1="50"
                                                            x2="50"
                                                            y2="18"
                                                            className="mini-hand-min"
                                                            transform={`rotate(${data.minuteAngle || 0} 50 50)`}
                                                        />
                                                        {/* Second Hand */}
                                                        <line
                                                            x1="50"
                                                            y1="50"
                                                            x2="50"
                                                            y2="14"
                                                            className="mini-hand-sec"
                                                            transform={`rotate(${data.secondAngle || 0} 50 50)`}
                                                        />
                                                        <circle cx="50" cy="50" r="3" className="mini-clock-center" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Big World Time */}
                                            <div className="world-time-wrapper text-center my-3">
                                                <h2 className="world-time mb-1">
                                                    {data.displayTime || "--:--:--"}
                                                </h2>
                                                <p className="world-date mb-0">
                                                    {data.date || ""}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Footer: Telemetry & Actions */}
                                        <div className="world-card-footer pt-3 border-top">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className={`status-pill ${data.business?.badgeClass || ""}`}>
                                                    {data.business?.icon} {data.business?.label}
                                                </span>
                                                <span className="diff-pill-sm small">
                                                    {data.diff?.text || ""}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <span className="solar-small text-muted small">
                                                    {data.solar?.icon} {data.solar?.phase}
                                                </span>

                                                <button
                                                    className="btn btn-outline-danger btn-sm rounded-pill btn-remove-zone"
                                                    onClick={() => removeClock(clock.zone)}
                                                    title={`Remove ${clock.city}`}
                                                    type="button"
                                                >
                                                    ✕ Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default WorldClock;
