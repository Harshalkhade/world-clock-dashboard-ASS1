import { useState, useMemo } from "react";
import {
    getConvertedTime,
    getZonedTimeParts,
    formatZoneLabel,
    getUtcOffsetString,
    getLocalTimeZone
} from "../timeUtils";
import TimezoneSelect from "./TimezoneSelect";

function TimeConverter({ worldClocks = [], is24Hour = true, soundEnabled = false, onButtonClick = null }) {
    const localZone = useMemo(() => getLocalTimeZone(), []);
    const [baseZone, setBaseZone] = useState(localZone);
    const [sliderMinutes, setSliderMinutes] = useState(0); // Offset in minutes from current live moment

    // Calculate current base zone hour & minute
    const currentBaseParts = useMemo(() => getZonedTimeParts(baseZone), [baseZone]);

    // Current converted time at the base zone
    const baseConverted = useMemo(() => {
        return getConvertedTime(baseZone, baseZone, sliderMinutes);
    }, [baseZone, sliderMinutes]);

    // Calculate time for all active world clocks + base zone
    const activeZones = useMemo(() => {
        const list = [{ city: "Base Region", country: "", zone: baseZone, emoji: "📍" }];
        worldClocks.forEach((c) => {
            if (c.zone !== baseZone && !list.some((item) => item.zone === c.zone)) {
                list.push(c);
            }
        });
        return list;
    }, [worldClocks, baseZone]);

    const convertedList = useMemo(() => {
        return activeZones.map((item) => {
            const data = getConvertedTime(baseZone, item.zone, sliderMinutes);
            const offset = getUtcOffsetString(item.zone);
            return {
                ...item,
                ...data,
                offset
            };
        });
    }, [activeZones, baseZone, sliderMinutes]);

    // Count open business hours
    const openBusinessCount = convertedList.filter((c) => c.business.status === "open").length;

    const handleResetNow = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setSliderMinutes(0);
    };

    const handleQuickHour = (targetHour) => {
        if (onButtonClick && soundEnabled) onButtonClick();
        const diffHours = targetHour - currentBaseParts.hour;
        const diffMinutes = diffHours * 60 - currentBaseParts.minute;
        setSliderMinutes(diffMinutes);
    };

    return (
        <div className="card time-converter-card shadow-lg mt-4">
            <div className="card-body p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                    <div>
                        <h3 className="section-title mb-1">
                            🌐 Interactive Time Scrubber & Global Meeting Planner
                        </h3>
                        <p className="text-muted small mb-0">
                            Drag the 24-hour timeline to simulate and compare times across all global regions simultaneously.
                        </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-2 fs-6">
                            🟢 {openBusinessCount} / {convertedList.length} Hubs Open
                        </span>
                        <button
                            className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            onClick={handleResetNow}
                            type="button"
                        >
                            ⚡ Reset to Now
                        </button>
                    </div>
                </div>

                {/* Base Zone Selector & Timeline Scrubber */}
                <div className="scrubber-control-panel p-3 mb-4 rounded-4">
                    <div className="row g-3 align-items-center mb-3">
                        <div className="col-md-5">
                            <label className="form-label small fw-bold text-uppercase text-muted mb-1">
                                Reference Timezone (Anchor)
                            </label>
                            <TimezoneSelect
                                value={baseZone}
                                onChange={(z) => {
                                    if (onButtonClick && soundEnabled) onButtonClick();
                                    setBaseZone(z);
                                }}
                            />
                        </div>

                        <div className="col-md-7">
                            <label className="form-label small fw-bold text-uppercase text-muted mb-1 d-flex justify-content-between">
                                <span>Simulated Time in {formatZoneLabel(baseZone)}:</span>
                                <strong className="text-primary-themed fs-6">
                                    {is24Hour ? baseConverted.time24 : baseConverted.time12} ({baseConverted.dateStr})
                                </strong>
                            </label>

                            {/* Range Slider */}
                            <input
                                type="range"
                                className="form-range custom-time-slider"
                                min={-720}
                                max={720}
                                step={15}
                                value={sliderMinutes}
                                onChange={(e) => setSliderMinutes(Number(e.target.value))}
                            />

                            <div className="d-flex justify-content-between text-muted small mt-1">
                                <span>-12h</span>
                                <span>-6h</span>
                                <span className="fw-bold text-primary">Now (0h)</span>
                                <span>+6h</span>
                                <span>+12h</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="d-flex align-items-center gap-2 flex-wrap pt-2 border-top">
                        <span className="small text-muted fw-semibold">Quick Time Jump:</span>
                        <button className="btn btn-sm btn-quick-jump" onClick={() => handleQuickHour(9)} type="button">
                            ☕ 09:00 AM (Start Work)
                        </button>
                        <button className="btn btn-sm btn-quick-jump" onClick={() => handleQuickHour(14)} type="button">
                            🥪 02:00 PM (Afternoon)
                        </button>
                        <button className="btn btn-sm btn-quick-jump" onClick={() => handleQuickHour(17)} type="button">
                            🌆 05:00 PM (End Work)
                        </button>
                        <button className="btn btn-sm btn-quick-jump" onClick={() => handleQuickHour(21)} type="button">
                            🌙 09:00 PM (Evening)
                        </button>
                    </div>
                </div>

                {/* Converted Timezone Comparison Grid */}
                <div className="row g-3">
                    {convertedList.map((item) => (
                        <div className="col-md-6 col-lg-4" key={item.zone}>
                            <div className={`converter-zone-card p-3 rounded-4 h-100 ${item.zone === baseZone ? "is-anchor" : ""}`}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h5 className="mb-0 fw-bold">
                                            {item.emoji || "🌐"} {item.city}
                                        </h5>
                                        <small className="text-muted">{formatZoneLabel(item.zone)}</small>
                                    </div>
                                    <span className="badge bg-secondary-subtle text-secondary-emphasis">
                                        {item.offset}
                                    </span>
                                </div>

                                <div className="d-flex align-items-baseline justify-content-between my-2">
                                    <div className="converter-time-display">
                                        {is24Hour ? item.time24 : item.time12}
                                    </div>
                                    <span className="converter-date-tag text-muted small">
                                        {item.dateStr}
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary-subtle">
                                    <span className={`status-pill ${item.business.badgeClass}`}>
                                        {item.business.icon} {item.business.label}
                                    </span>
                                    <span className="solar-indicator small text-muted">
                                        {item.solar.icon} {item.solar.phase}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TimeConverter;
