import { useState, useCallback } from "react";
import AnalogClock from "./component/AnalogClock";
import DigitalClock from "./component/DigitalClock";
import WorldClock from "./component/WorldClock";
import TimeConverter from "./component/TimeConverter";
import Alarm from "./component/Alarm";
import AlarmModal from "./component/AlarmModal";
import TimerStopwatch from "./component/TimerStopwatch";
import { getLocalTimeZone, defaultTimeZones } from "./timeUtils";
import { useSoundEffects } from "./hooks/useSoundEffects";

import "./App.css";

function App() {
    const [theme, setTheme] = useState("dark-space"); // "dark-space", "pearl-light", "cyber-neon", "crimson-sunset"
    const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "converter", "alarms", "tools"
    const [primaryZone, setPrimaryZone] = useState(getLocalTimeZone());
    const [is24Hour, setIs24Hour] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    // Active Ringing Alarm state
    const [activeRingingAlarm, setActiveRingingAlarm] = useState(null);

    // Web Audio Synthesizer Hook
    const {
        playTick,
        playClick,
        playLapSound,
        playAlarmTone,
        startAlarmLoop,
        stopAlarmLoop
    } = useSoundEffects(soundEnabled);

    // Trigger Alarm handler
    const handleTriggerAlarm = useCallback((alarm) => {
        setActiveRingingAlarm(alarm);
        startAlarmLoop(alarm.tone || "chime");
    }, [startAlarmLoop]);

    // Dismiss Alarm
    const handleDismissAlarm = useCallback(() => {
        stopAlarmLoop();
        setActiveRingingAlarm(null);
    }, [stopAlarmLoop]);

    // Snooze Alarm (+X minutes)
    const handleSnoozeAlarm = useCallback((alarm, minutes = 5) => {
        stopAlarmLoop();
        setActiveRingingAlarm(null);
        // Calculate new snoozed time
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        const newTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        
        // Notify user via console / status
        console.log(`Alarm snoozed until ${newTime}`);
    }, [stopAlarmLoop]);

    const isDark = theme !== "pearl-light";

    return (
        <div className={`app ${isDark ? "dark-theme" : "light-theme"} theme-${theme}`}>
            {/* Active Ringing Alarm Modal Alert */}
            <AlarmModal
                activeAlarm={activeRingingAlarm}
                onDismiss={handleDismissAlarm}
                onSnooze={handleSnoozeAlarm}
            />

            {/* Top Navigation Bar */}
            <nav className="navbar navbar-expand-lg app-navbar shadow-md sticky-top">
                <div className="container">
                    <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
                        <span className="brand-icon" aria-hidden="true">🌐</span>
                        <span className="brand-text">World Clock Dashboard Pro</span>
                    </span>

                    {/* Quick Global Navigation Tabs */}
                    <div className="nav-tabs-wrapper d-none d-md-flex">
                        <button
                            className={`nav-tab-link ${activeTab === "dashboard" ? "active" : ""}`}
                            onClick={() => {
                                playClick();
                                setActiveTab("dashboard");
                            }}
                            type="button"
                        >
                            📊 Dashboard
                        </button>
                        <button
                            className={`nav-tab-link ${activeTab === "converter" ? "active" : ""}`}
                            onClick={() => {
                                playClick();
                                setActiveTab("converter");
                            }}
                            type="button"
                        >
                            🗺️ Meeting Planner
                        </button>
                        <button
                            className={`nav-tab-link ${activeTab === "alarms" ? "active" : ""}`}
                            onClick={() => {
                                playClick();
                                setActiveTab("alarms");
                            }}
                            type="button"
                        >
                            ⏰ Alarms
                        </button>
                        <button
                            className={`nav-tab-link ${activeTab === "tools" ? "active" : ""}`}
                            onClick={() => {
                                playClick();
                                setActiveTab("tools");
                            }}
                            type="button"
                        >
                            ⏱️ Stopwatch & Timer
                        </button>
                    </div>

                    {/* Top Right Quick Controls */}
                    <div className="d-flex align-items-center gap-2">
                        {/* Audio Sound Toggle */}
                        <button
                            className={`btn btn-sm btn-nav-control ${soundEnabled ? "sound-active" : ""}`}
                            onClick={() => {
                                playClick();
                                setSoundEnabled(!soundEnabled);
                            }}
                            title={soundEnabled ? "Sound Effects Enabled" : "Sound Muted"}
                            type="button"
                        >
                            {soundEnabled ? "🔊 Sound ON" : "🔇 Muted"}
                        </button>

                        {/* 12H / 24H Toggle */}
                        <button
                            className="btn btn-sm btn-nav-control"
                            onClick={() => {
                                playClick();
                                setIs24Hour(!is24Hour);
                            }}
                            title="Toggle 12/24 Hour format globally"
                            type="button"
                        >
                            {is24Hour ? "24H" : "12H"}
                        </button>

                        {/* Theme Dropdown */}
                        <div className="dropdown">
                            <button
                                className="btn btn-sm btn-nav-control dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                🎨 Theme
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-lg">
                                <li>
                                    <button
                                        className={`dropdown-item ${theme === "dark-space" ? "active" : ""}`}
                                        onClick={() => setTheme("dark-space")}
                                        type="button"
                                    >
                                        🌌 Deep Space (Dark)
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={`dropdown-item ${theme === "pearl-light" ? "active" : ""}`}
                                        onClick={() => setTheme("pearl-light")}
                                        type="button"
                                    >
                                        ✨ Pearl Clean (Light)
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={`dropdown-item ${theme === "cyber-neon" ? "active" : ""}`}
                                        onClick={() => setTheme("cyber-neon")}
                                        type="button"
                                    >
                                        ⚡ Cyber Matrix (Neon)
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={`dropdown-item ${theme === "crimson-sunset" ? "active" : ""}`}
                                        onClick={() => setTheme("crimson-sunset")}
                                        type="button"
                                    >
                                        🌇 Crimson Sunset (Rose)
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Tab Navigation Bar */}
            <div className="mobile-nav-bar d-flex d-md-none justify-content-around p-2 border-bottom">
                <button
                    className={`mobile-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
                    onClick={() => setActiveTab("dashboard")}
                    type="button"
                >
                    📊 Dashboard
                </button>
                <button
                    className={`mobile-tab-btn ${activeTab === "converter" ? "active" : ""}`}
                    onClick={() => setActiveTab("converter")}
                    type="button"
                >
                    🗺️ Planner
                </button>
                <button
                    className={`mobile-tab-btn ${activeTab === "alarms" ? "active" : ""}`}
                    onClick={() => setActiveTab("alarms")}
                    type="button"
                >
                    ⏰ Alarms
                </button>
                <button
                    className={`mobile-tab-btn ${activeTab === "tools" ? "active" : ""}`}
                    onClick={() => setActiveTab("tools")}
                    type="button"
                >
                    ⏱️ Tools
                </button>
            </div>

            {/* Hero Dashboard Header */}
            <section className="dashboard-header text-center">
                <div className="container">
                    <span className="badge hero-badge mb-2">
                        ⭐ Real-Time Global Telemetry & Time Management System
                    </span>
                    <h1>World Clock Dashboard Pro</h1>
                    <p>
                        High-precision synchronized analog & digital clocks, international meeting planner, timezone-aware alarms, and precision time tools.
                    </p>
                </div>
            </section>

            {/* Main Application Content Body */}
            <main className="container main-content-wrapper pb-5">
                {/* 1. DASHBOARD VIEW (Primary Dual Clocks + World Cards Grid) */}
                {activeTab === "dashboard" && (
                    <>
                        <div className="row g-4 mt-1">
                            <div className="col-lg-5">
                                <div className="dashboard-card shadow-lg h-100 p-4">
                                    <AnalogClock
                                        zone={primaryZone}
                                        soundEnabled={soundEnabled}
                                        onTickSound={playTick}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <DigitalClock
                                    zone={primaryZone}
                                    onZoneChange={setPrimaryZone}
                                    is24Hour={is24Hour}
                                    onToggle24Hour={() => setIs24Hour(!is24Hour)}
                                    soundEnabled={soundEnabled}
                                    onButtonClick={playClick}
                                />
                            </div>
                        </div>

                        {/* World Timezones Grid */}
                        <WorldClock
                            is24Hour={is24Hour}
                            soundEnabled={soundEnabled}
                            onButtonClick={playClick}
                        />
                    </>
                )}

                {/* 2. MEETING PLANNER / TIME CONVERTER VIEW */}
                {activeTab === "converter" && (
                    <TimeConverter
                        worldClocks={defaultTimeZones}
                        is24Hour={is24Hour}
                        soundEnabled={soundEnabled}
                        onButtonClick={playClick}
                    />
                )}

                {/* 3. ALARM MANAGER VIEW */}
                {activeTab === "alarms" && (
                    <Alarm
                        soundEnabled={soundEnabled}
                        onTriggerAlarm={handleTriggerAlarm}
                        onButtonClick={playClick}
                    />
                )}

                {/* 4. STOPWATCH & COUNTDOWN TIMER VIEW */}
                {activeTab === "tools" && (
                    <TimerStopwatch
                        soundEnabled={soundEnabled}
                        onLapSound={playLapSound}
                        onAlarmSound={playAlarmTone}
                        onButtonClick={playClick}
                    />
                )}
            </main>

            {/* Dashboard Footer */}
            <footer className="dashboard-footer text-center">
                <div className="container">
                    <p className="mb-1">
                        &copy; 2026 World Clock Dashboard Pro | Engineered with React 19 + Vite + Bootstrap & Web Audio API
                    </p>
                    <small className="footer-subtext">
                        Precision IANA Timezone Database & Microsecond Coordinate Trigonometry
                    </small>
                </div>
            </footer>
        </div>
    );
}

export default App;
