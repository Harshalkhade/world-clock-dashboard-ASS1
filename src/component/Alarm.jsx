import { useState, useEffect, useCallback } from "react";
import { formatAlarmTime, formatZoneLabel, getLocalTimeZone, getZonedTimeParts } from "../timeUtils";
import TimezoneSelect from "./TimezoneSelect";

const STORAGE_KEY = "world_clock_alarms_v2";

function Alarm({
    soundEnabled = true,
    onTriggerAlarm,
    onButtonClick = null
}) {
    const localZone = getLocalTimeZone();

    const [alarms, setAlarms] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [
                {
                    id: 1,
                    time: "09:00",
                    name: "Morning Standup & Markets",
                    zone: localZone,
                    tone: "chime",
                    repeat: "daily",
                    enabled: true,
                    triggered: false
                }
            ];
        } catch {
            return [];
        }
    });

    const [alarmTime, setAlarmTime] = useState("");
    const [alarmName, setAlarmName] = useState("");
    const [alarmZone, setAlarmZone] = useState(localZone);
    const [alarmTone, setAlarmTone] = useState("chime");
    const [alarmRepeat, setAlarmRepeat] = useState("daily");
    const [testCountdown, setTestCountdown] = useState(null);

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
        } catch {
            // localStorage error
        }
    }, [alarms]);

    // Alarm checker loop
    useEffect(() => {
        const checker = setInterval(() => {
            const now = new Date();
            const currentDayIndex = now.getDay(); // 0 = Sun, 6 = Sat
            const isWeekday = currentDayIndex >= 1 && currentDayIndex <= 5;
            const isWeekend = currentDayIndex === 0 || currentDayIndex === 6;

            alarms.forEach((alarm) => {
                if (!alarm.enabled || alarm.triggered) return;

                // Check recurrence condition
                if (alarm.repeat === "weekdays" && !isWeekday) return;
                if (alarm.repeat === "weekends" && !isWeekend) return;

                // Get zoned time for this specific alarm
                const targetZone = alarm.zone || localZone;
                const parts = getZonedTimeParts(targetZone, now);
                const currentFormatted = `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;

                if (alarm.time === currentFormatted) {
                    // Mark triggered
                    setAlarms((prev) =>
                        prev.map((a) =>
                            a.id === alarm.id ? { ...a, triggered: true, enabled: a.repeat !== "once" } : a
                        )
                    );

                    // Trigger global alarm modal & audio
                    if (onTriggerAlarm) {
                        onTriggerAlarm(alarm);
                    }

                    // Native browser notification fallback
                    if (Notification.permission === "granted") {
                        try {
                            new Notification(`⏰ Alarm: ${alarm.name || "World Clock Alert"}`, {
                                body: `Time: ${alarm.time} (${formatZoneLabel(alarm.zone)})`
                            });
                        } catch {
                            // notification error
                        }
                    }
                }
            });
        }, 1000);

        return () => clearInterval(checker);
    }, [alarms, localZone, onTriggerAlarm]);

    // Reset triggered state when minute changes
    useEffect(() => {
        const resetInterval = setInterval(() => {
            const now = new Date();
            if (now.getSeconds() === 0) {
                setAlarms((prev) =>
                    prev.map((a) => (a.repeat !== "once" ? { ...a, triggered: false } : a))
                );
            }
        }, 1000);
        return () => clearInterval(resetInterval);
    }, []);

    // Add Alarm
    const addAlarm = (e) => {
        e.preventDefault();
        if (!alarmTime) return;

        if (onButtonClick && soundEnabled) onButtonClick();

        const newAlarm = {
            id: Date.now(),
            time: alarmTime,
            name: alarmName.trim() || "Alarm",
            zone: alarmZone || localZone,
            tone: alarmTone,
            repeat: alarmRepeat,
            enabled: true,
            triggered: false
        };

        setAlarms([...alarms, newAlarm]);
        setAlarmName("");
        setAlarmTime("");

        if (typeof Notification !== "undefined" && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    // Toggle Alarm Enabled/Disabled
    const toggleAlarm = (id) => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setAlarms((prev) =>
            prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
        );
    };

    // Delete Alarm
    const deleteAlarm = (id) => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setAlarms((prev) => prev.filter((a) => a.id !== id));
    };

    // Instant 3-Second Test Trigger
    const triggerTestAlarm = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setTestCountdown(3);
        let count = 3;
        const timer = setInterval(() => {
            count -= 1;
            if (count <= 0) {
                clearInterval(timer);
                setTestCountdown(null);
                if (onTriggerAlarm) {
                    onTriggerAlarm({
                        id: "test-" + Date.now(),
                        name: "Test Verification Alarm",
                        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
                        zone: localZone,
                        tone: alarmTone
                    });
                }
            } else {
                setTestCountdown(count);
            }
        }, 1000);
    };

    return (
        <div className="container mt-5">
            <div className="card alarm-card shadow-lg rounded-4">
                <div className="card-body p-4">
                    {/* Section Header */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                        <div>
                            <h3 className="section-title mb-1">
                                ⏰ Advanced Timezone-Aware Alarm Manager
                            </h3>
                            <p className="text-muted small mb-0">
                                Configure alarms for your local time or any international market / remote team region.
                            </p>
                        </div>

                        <button
                            className="btn btn-outline-warning btn-sm rounded-pill px-3 shadow-sm"
                            onClick={triggerTestAlarm}
                            disabled={testCountdown !== null}
                            type="button"
                        >
                            {testCountdown !== null ? `⏳ Ringing in ${testCountdown}s...` : "⚡ Test Alarm (3s)"}
                        </button>
                    </div>

                    {/* Add Alarm Form */}
                    <form className="add-alarm-box p-3 mb-4 rounded-4" onSubmit={addAlarm}>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-2 col-sm-6">
                                <label htmlFor="alarm-time-input" className="form-label small fw-bold text-uppercase text-muted mb-1">
                                    Alarm Time
                                </label>
                                <input
                                    id="alarm-time-input"
                                    type="time"
                                    className="form-control"
                                    value={alarmTime}
                                    onChange={(e) => setAlarmTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <label htmlFor="alarm-name-input" className="form-label small fw-bold text-uppercase text-muted mb-1">
                                    Description / Label
                                </label>
                                <input
                                    id="alarm-name-input"
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Tokyo Market Open"
                                    value={alarmName}
                                    onChange={(e) => setAlarmName(e.target.value)}
                                />
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <label htmlFor="alarm-zone-select" className="form-label small fw-bold text-uppercase text-muted mb-1">
                                    Target Timezone
                                </label>
                                <TimezoneSelect
                                    id="alarm-zone-select"
                                    value={alarmZone}
                                    onChange={setAlarmZone}
                                />
                            </div>

                            <div className="col-md-2 col-sm-6">
                                <label htmlFor="alarm-tone-select" className="form-label small fw-bold text-uppercase text-muted mb-1">
                                    Ringtone
                                </label>
                                <select
                                    id="alarm-tone-select"
                                    className="form-select"
                                    value={alarmTone}
                                    onChange={(e) => setAlarmTone(e.target.value)}
                                >
                                    <option value="chime">Melodic Chime</option>
                                    <option value="digital">Digital Beep</option>
                                    <option value="marimba">Marimba Gentle</option>
                                </select>
                            </div>

                            <div className="col-md-2 col-sm-12">
                                <button className="btn btn-primary w-100 fw-bold rounded-pill" type="submit">
                                    + Set Alarm
                                </button>
                            </div>
                        </div>

                        {/* Recurrence Selection */}
                        <div className="d-flex align-items-center gap-2 flex-wrap mt-3 pt-2 border-top">
                            <span className="small text-muted fw-semibold">Repeat:</span>
                            {["daily", "weekdays", "weekends", "once"].map((r) => (
                                <button
                                    key={r}
                                    className={`btn btn-sm btn-repeat-pill ${alarmRepeat === r ? "active" : ""}`}
                                    onClick={() => setAlarmRepeat(r)}
                                    type="button"
                                >
                                    {r === "daily" && "Everyday"}
                                    {r === "weekdays" && "Weekdays (Mon-Fri)"}
                                    {r === "weekends" && "Weekends"}
                                    {r === "once" && "Once Only"}
                                </button>
                            ))}
                        </div>
                    </form>

                    {/* Alarms List */}
                    <div className="alarms-list-container">
                        {alarms.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-muted mb-0">No alarms active. Use the form above to create one.</p>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {alarms.map((alarm) => {
                                    const [h, m] = (alarm.time || "00:00").split(":");
                                    const formatted12 = formatAlarmTime(h, m);

                                    return (
                                        <div className="col-md-6 col-lg-4" key={alarm.id}>
                                            <div className={`card alarm-item-card p-3 rounded-4 h-100 shadow-sm ${!alarm.enabled ? "alarm-disabled" : ""}`}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h5 className="mb-0 fw-bold">
                                                            {alarm.name || "Alarm"}
                                                        </h5>
                                                        <small className="text-muted">
                                                            📍 {formatZoneLabel(alarm.zone)}
                                                        </small>
                                                    </div>

                                                    {/* Toggle Switch */}
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            checked={alarm.enabled}
                                                            onChange={() => toggleAlarm(alarm.id)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Time Display */}
                                                <div className="d-flex align-items-baseline justify-content-between my-2">
                                                    <span className="alarm-time-large fw-bold fs-3 text-primary-themed">
                                                        {formatted12}
                                                    </span>
                                                    <span className="badge bg-light text-dark border small">
                                                        {alarm.time} (24H)
                                                    </span>
                                                </div>

                                                {/* Meta & Delete Footer */}
                                                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                                    <span className="badge bg-secondary-subtle text-secondary-emphasis text-capitalize">
                                                        🔄 {alarm.repeat} • 🎵 {alarm.tone}
                                                    </span>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                                        onClick={() => deleteAlarm(alarm.id)}
                                                        title="Delete Alarm"
                                                        type="button"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Alarm;