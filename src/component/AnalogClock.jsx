import { useEffect, useRef, useState } from "react";
import { getClockAngles, formatZoneLabel, getUtcOffsetString, getBusinessStatus } from "../timeUtils";
import "./AnalogClock.css";

const ROMAN_NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const ARABIC_NUMERALS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function AnalogClock({ zone, soundEnabled = false, onTickSound = null }) {
    const [theme, setTheme] = useState("chrono"); // modern, roman, chrono, cyber
    const [isSmooth, setIsSmooth] = useState(true);
    const [showSeconds, setShowSeconds] = useState(true);
    const [angles, setAngles] = useState(() => getClockAngles(zone, true));
    
    const frameRef = useRef(null);
    const lastSecondRef = useRef(null);

    useEffect(() => {
        const updateTime = () => {
            const currentAngles = getClockAngles(zone, isSmooth);
            setAngles(currentAngles);

            if (!isSmooth && onTickSound && soundEnabled) {
                if (lastSecondRef.current !== currentAngles.secondRaw) {
                    lastSecondRef.current = currentAngles.secondRaw;
                    onTickSound();
                }
            }

            frameRef.current = requestAnimationFrame(updateTime);
        };

        frameRef.current = requestAnimationFrame(updateTime);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [zone, isSmooth, soundEnabled, onTickSound]);

    const business = getBusinessStatus(zone, angles.rawHour24);
    const utcOffset = getUtcOffsetString(zone);

    // Calculate subdial 24-hour angle (360 deg = 24 hours)
    const subdial24Angle = (angles.rawHour24 + angles.minuteRaw / 60) * 15;

    return (
        <div className={`analog-clock-wrapper theme-${theme}`}>
            {/* Clock Dial Controls Bar */}
            <div className="clock-dial-controls">
                <div className="dial-style-pill">
                    <button
                        className={`btn-dial ${theme === "chrono" ? "active" : ""}`}
                        onClick={() => setTheme("chrono")}
                        title="Aviator Chronograph"
                        type="button"
                    >
                        Chrono
                    </button>
                    <button
                        className={`btn-dial ${theme === "modern" ? "active" : ""}`}
                        onClick={() => setTheme("modern")}
                        title="Modern Minimal"
                        type="button"
                    >
                        Modern
                    </button>
                    <button
                        className={`btn-dial ${theme === "roman" ? "active" : ""}`}
                        onClick={() => setTheme("roman")}
                        title="Classic Roman"
                        type="button"
                    >
                        Roman
                    </button>
                    <button
                        className={`btn-dial ${theme === "cyber" ? "active" : ""}`}
                        onClick={() => setTheme("cyber")}
                        title="Cyberpunk Neon"
                        type="button"
                    >
                        Cyber
                    </button>
                </div>

                <div className="dial-options-group">
                    <button
                        className={`btn-option-pill ${isSmooth ? "active" : ""}`}
                        onClick={() => setIsSmooth(!isSmooth)}
                        title={isSmooth ? "Smooth Sweep Mode (Active)" : "Discrete Quartz Tick Mode (Active)"}
                        type="button"
                    >
                        {isSmooth ? "🌊 Sweep" : "⏱️ Quartz"}
                    </button>
                    <button
                        className={`btn-option-pill ${showSeconds ? "active" : ""}`}
                        onClick={() => setShowSeconds(!showSeconds)}
                        title="Toggle Second Hand"
                        type="button"
                    >
                        {showSeconds ? "Sec ON" : "Sec OFF"}
                    </button>
                </div>
            </div>

            {/* SVG Scalable Clock Face */}
            <div className="svg-clock-container">
                <svg
                    viewBox="0 0 320 320"
                    className="analog-svg-face"
                    role="img"
                    aria-label={`Analog Clock displaying time for ${zone}`}
                >
                    <defs>
                        {/* Gradients */}
                        <radialGradient id="dialBgChrono" cx="50%" cy="40%" r="65%">
                            <stop offset="0%" stopColor="#1e2238" />
                            <stop offset="70%" stopColor="#121422" />
                            <stop offset="100%" stopColor="#0a0c16" />
                        </radialGradient>

                        <radialGradient id="dialBgModern" cx="50%" cy="35%" r="70%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="75%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#cbd5e1" />
                        </radialGradient>

                        <radialGradient id="dialBgCyber" cx="50%" cy="50%" r="65%">
                            <stop offset="0%" stopColor="#0d1127" />
                            <stop offset="80%" stopColor="#060814" />
                            <stop offset="100%" stopColor="#020308" />
                        </radialGradient>

                        <radialGradient id="dialBgRoman" cx="50%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="60%" stopColor="#f4f4f8" />
                            <stop offset="100%" stopColor="#e5e5ed" />
                        </radialGradient>

                        <linearGradient id="bezelRingGold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>

                        <linearGradient id="bezelRingCyber" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>

                        <linearGradient id="hourHandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#94a3b8" />
                        </linearGradient>

                        <filter id="handGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Outer Bezel & Case */}
                    <circle
                        cx="160"
                        cy="160"
                        r="156"
                        className="clock-case-outer"
                    />
                    <circle
                        cx="160"
                        cy="160"
                        r="148"
                        className="clock-dial-background"
                    />

                    {/* Outer 60-Second Telemetry Ring / Ticks */}
                    {[...Array(60)].map((_, i) => {
                        const isMajor = i % 5 === 0;
                        const angle = i * 6;
                        return (
                            <line
                                key={`tick-${i}`}
                                x1="160"
                                y1={isMajor ? "16" : "20"}
                                x2="160"
                                y2="26"
                                transform={`rotate(${angle} 160 160)`}
                                className={`svg-tick ${isMajor ? "svg-tick-major" : "svg-tick-minor"}`}
                            />
                        );
                    })}

                    {/* Inner Track Ring */}
                    <circle
                        cx="160"
                        cy="160"
                        r="132"
                        className="svg-track-ring"
                    />

                    {/* Chrono 24-Hour Sub-Dial Complication (Top/Center) */}
                    {theme === "chrono" && (
                        <g className="chrono-subdial" transform="translate(160, 105)">
                            <circle cx="0" cy="0" r="28" className="subdial-bg" />
                            <circle cx="0" cy="0" r="27" className="subdial-border" />
                            {/* Subdial markings */}
                            {[0, 6, 12, 18].map((h) => {
                                const angle = h * 15;
                                const rad = (angle * Math.PI) / 180;
                                const x = 20 * Math.sin(rad);
                                const y = -20 * Math.cos(rad);
                                return (
                                    <text
                                        key={`sub-${h}`}
                                        x={x}
                                        y={y + 3}
                                        className="subdial-text"
                                        textAnchor="middle"
                                    >
                                        {h}
                                    </text>
                                );
                            })}
                            {/* Subdial Hand */}
                            <line
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="-18"
                                className="subdial-hand"
                                transform={`rotate(${subdial24Angle})`}
                            />
                            <circle cx="0" cy="0" r="2.5" className="subdial-center-pin" />
                            <text x="0" y="9" className="subdial-label" textAnchor="middle">24H</text>
                        </g>
                    )}

                    {/* Cyber Grid Lines */}
                    {theme === "cyber" && (
                        <g className="cyber-grid" opacity="0.25">
                            <line x1="80" y1="160" x2="240" y2="160" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="160" y1="80" x2="160" y2="240" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
                            <circle cx="160" cy="160" r="60" stroke="#ec4899" strokeWidth="1" fill="none" strokeDasharray="6 6" />
                        </g>
                    )}

                    {/* Date Window Complication */}
                    <g className="date-window" transform="translate(216, 149)">
                        <rect x="0" y="0" width="28" height="22" rx="4" className="date-box-bg" />
                        <rect x="0" y="0" width="28" height="22" rx="4" className="date-box-border" />
                        <text x="14" y="16" className="date-box-text" textAnchor="middle">
                            {angles.day || new Date().getDate()}
                        </text>
                    </g>

                    {/* Dial Numerals */}
                    {[...Array(12)].map((_, i) => {
                        const angle = i * 30;
                        const rad = (angle * Math.PI) / 180;
                        // Radius distance for numerals
                        const numRadius = theme === "chrono" ? 104 : 106;
                        const x = 160 + numRadius * Math.sin(rad);
                        const y = 160 - numRadius * Math.cos(rad) + 6; // visual vertical center adjustment

                        const label = theme === "roman"
                            ? ROMAN_NUMERALS[i]
                            : ARABIC_NUMERALS[i];

                        return (
                            <text
                                key={`num-${i}`}
                                x={x}
                                y={y}
                                className={`svg-numeral ${theme === "roman" ? "roman-font" : ""}`}
                                textAnchor="middle"
                            >
                                {label}
                            </text>
                        );
                    })}

                    {/* Hour Hand */}
                    <g transform={`rotate(${angles.hour} 160 160)`}>
                        <path
                            d="M 156 160 L 157.5 90 L 160 76 L 162.5 90 L 164 160 L 162 178 L 158 178 Z"
                            className="svg-hour-hand"
                            filter={theme === "cyber" ? "url(#handGlow)" : undefined}
                        />
                    </g>

                    {/* Minute Hand */}
                    <g transform={`rotate(${angles.minute} 160 160)`}>
                        <path
                            d="M 157.2 160 L 158.5 54 L 160 38 L 161.5 54 L 162.8 160 L 161.5 186 L 158.5 186 Z"
                            className="svg-minute-hand"
                            filter={theme === "cyber" ? "url(#handGlow)" : undefined}
                        />
                    </g>

                    {/* Second Hand (Optional) */}
                    {showSeconds && (
                        <g transform={`rotate(${angles.second} 160 160)`}>
                            <line
                                x1="160"
                                y1="195"
                                x2="160"
                                y2="28"
                                className="svg-second-hand"
                            />
                            <circle cx="160" cy="50" r="3.5" className="svg-second-counterweight" />
                            <circle cx="160" cy="180" r="4.5" className="svg-second-tail" />
                        </g>
                    )}

                    {/* Center Pinion / Cap */}
                    <circle cx="160" cy="160" r="9" className="svg-pinion-outer" />
                    <circle cx="160" cy="160" r="5" className="svg-pinion-inner" />
                    <circle cx="160" cy="160" r="2" className="svg-pinion-highlight" />
                </svg>
            </div>

            {/* Bottom Clock Meta Details */}
            <div className="clock-bottom-meta">
                <div className="zone-info-badge">
                    <span className="city-title">{formatZoneLabel(zone) || "Local Time"}</span>
                    <span className="offset-badge">{utcOffset}</span>
                </div>
                <div className="status-indicator-row">
                    <span className={`status-pill ${business.badgeClass}`}>
                        {business.icon} {business.label}
                    </span>
                    <span className="movement-tag">
                        {isSmooth ? "⚡ 60 FPS Sweep" : "⏱️ 1 Hz Quartz"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default AnalogClock;
