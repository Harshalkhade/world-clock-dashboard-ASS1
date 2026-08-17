import { useEffect, useState, useRef } from "react";
import {
    getCurrentTime,
    getCurrentDate,
    convertTo12Hour,
    formatZoneLabel,
    getUtcOffsetString,
    getRelativeTimeDifference,
    getSolarPhase,
    getZonedTimeParts
} from "../timeUtils";
import TimezoneSelect from "./TimezoneSelect";

function DigitalClock({
    zone,
    onZoneChange,
    is24Hour = true,
    onToggle24Hour,
    soundEnabled = false,
    onButtonClick = null
}) {
    const [timeStr, setTimeStr] = useState("");
    const [msStr, setMsStr] = useState("000");
    const [dateStr, setDateStr] = useState("");
    const [showMs, setShowMs] = useState(false);
    const [copiedToast, setCopiedToast] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const frameRef = useRef(null);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const parts = getZonedTimeParts(zone, now);
            
            const rawTime = `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}:${String(parts.second).padStart(2, "0")}`;
            const formatted = is24Hour ? rawTime : convertTo12Hour(rawTime);
            
            setTimeStr(formatted);
            setMsStr(String(parts.ms).padStart(3, "0"));
            setDateStr(getCurrentDate(zone));

            if (showMs) {
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        if (showMs) {
            frameRef.current = requestAnimationFrame(tick);
        } else {
            tick();
            const interval = setInterval(tick, 200);
            return () => clearInterval(interval);
        }

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [zone, is24Hour, showMs]);

    const utcOffset = getUtcOffsetString(zone);
    const relativeDiff = getRelativeTimeDifference(zone);
    const solar = getSolarPhase(zone);

    const handleCopy = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        const textToCopy = `${timeStr} (${zone}, ${utcOffset}) - ${dateStr}`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
    };

    const toggleFullscreen = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setIsFullscreen(!isFullscreen);
    };

    return (
        <>
            <div className="card digital-card shadow-lg h-100">
                <div className="card-body text-center d-flex flex-column justify-content-between p-4">
                    {/* Header Row */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="digital-card-badge">
                            <span className="live-dot" /> LIVE TELEMETRY
                        </span>

                        <div className="d-flex gap-2">
                            <button
                                className={`btn btn-sm btn-icon-tool ${showMs ? "active" : ""}`}
                                onClick={() => {
                                    if (onButtonClick && soundEnabled) onButtonClick();
                                    setShowMs(!showMs);
                                }}
                                title="Toggle High-Precision Milliseconds"
                                type="button"
                            >
                                ⏱️ .ms {showMs ? "ON" : "OFF"}
                            </button>

                            <button
                                className="btn btn-sm btn-icon-tool"
                                onClick={handleCopy}
                                title="Copy Timestamp"
                                type="button"
                            >
                                {copiedToast ? "✅ Copied!" : "📋 Copy"}
                            </button>

                            <button
                                className="btn btn-sm btn-icon-tool"
                                onClick={toggleFullscreen}
                                title="Zen Fullscreen Desk Mode"
                                type="button"
                            >
                                ⛶ Zen Mode
                            </button>
                        </div>
                    </div>

                    {/* Main Big Digital Readout */}
                    <div className="digital-readout-box">
                        <div className="digital-time-display">
                            <span className="digits-main">{timeStr}</span>
                            {showMs && <span className="digits-ms">.{msStr}</span>}
                        </div>
                        <p className="digital-date-text">{dateStr}</p>
                    </div>

                    {/* Solar & Day/Night Visual Progress Bar */}
                    <div className="solar-tracker-bar my-3">
                        <div className="d-flex justify-content-between align-items-center small mb-1">
                            <span className="solar-phase-tag">
                                {solar.icon} <strong>{solar.phase}</strong> — {solar.description}
                            </span>
                            <span className="solar-offset-tag">{utcOffset}</span>
                        </div>
                        <div className="solar-progress-track">
                            <div
                                className="solar-progress-fill"
                                style={{ background: solar.bgGradient, width: "100%" }}
                            />
                        </div>
                    </div>

                    {/* Timezone & Relative Difference Info */}
                    <div className="zone-telemetry-banner mb-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <span className="fw-bold text-primary-themed me-2">
                                    {formatZoneLabel(zone) || "Selected Region"}
                                </span>
                                <span className="badge bg-secondary-subtle text-secondary-emphasis">
                                    {zone}
                                </span>
                            </div>
                            <span className={`diff-pill ${relativeDiff.isLocal ? "diff-local" : ""}`}>
                                {relativeDiff.text}
                            </span>
                        </div>
                    </div>

                    {/* Timezone Selector & Format Controls */}
                    <div className="digital-controls-grid">
                        <div className="row g-2 align-items-center">
                            <div className="col-sm-8">
                                <TimezoneSelect
                                    id="digital-tz-select"
                                    value={zone}
                                    onChange={(newZ) => {
                                        if (onButtonClick && soundEnabled) onButtonClick();
                                        onZoneChange(newZ);
                                    }}
                                />
                            </div>
                            <div className="col-sm-4">
                                <button
                                    className="btn btn-primary format-toggle-btn w-100"
                                    onClick={() => {
                                        if (onButtonClick && soundEnabled) onButtonClick();
                                        onToggle24Hour();
                                    }}
                                    type="button"
                                >
                                    {is24Hour ? "Switch to 12H" : "Switch to 24H"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zen Fullscreen Modal */}
            {isFullscreen && (
                <div className="zen-clock-overlay" onClick={toggleFullscreen}>
                    <div className="zen-clock-content" onClick={(e) => e.stopPropagation()}>
                        <button className="zen-close-btn" onClick={toggleFullscreen} type="button">
                            ✕ Close Zen Mode
                        </button>
                        <div className="zen-city-badge">
                            {solar.icon} {formatZoneLabel(zone)} ({utcOffset})
                        </div>
                        <div className="zen-time-display">
                            {timeStr}
                            {showMs && <span className="zen-ms">.{msStr}</span>}
                        </div>
                        <div className="zen-date-display">{dateStr}</div>
                        <div className="zen-hint">Click anywhere or Esc to exit</div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DigitalClock;
