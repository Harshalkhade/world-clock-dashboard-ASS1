import { useState, useEffect, useRef, useMemo } from "react";

function TimerStopwatch({ soundEnabled = true, onLapSound = null, onAlarmSound = null, onButtonClick = null }) {
    const [activeTool, setActiveTool] = useState("stopwatch"); // "stopwatch" or "timer"

    /* ----------------------------------------------------
       STOPWATCH STATE & LOGIC
    ------------------------------------------------------- */
    const [swTime, setSwTime] = useState(0); // in milliseconds
    const [swRunning, setSwRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const swStartRef = useRef(0);
    const swOffsetRef = useRef(0);
    const swRafRef = useRef(null);

    useEffect(() => {
        if (swRunning) {
            swStartRef.current = performance.now() - swOffsetRef.current;
            const step = () => {
                const elapsed = performance.now() - swStartRef.current;
                setSwTime(elapsed);
                swOffsetRef.current = elapsed;
                swRafRef.current = requestAnimationFrame(step);
            };
            swRafRef.current = requestAnimationFrame(step);
        } else {
            if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
        }
        return () => {
            if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
        };
    }, [swRunning]);

    const handleSwStartPause = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setSwRunning(!swRunning);
    };

    const handleSwReset = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setSwRunning(false);
        setSwTime(0);
        swOffsetRef.current = 0;
        setLaps([]);
    };

    const handleSwLap = () => {
        if (!swRunning) return;
        if (onLapSound && soundEnabled) onLapSound();
        const lapTime = swTime;
        const prevLapTime = laps.length > 0 ? laps[0].overallTime : 0;
        const splitTime = lapTime - prevLapTime;
        const newLap = {
            id: laps.length + 1,
            splitTime,
            overallTime: lapTime
        };
        setLaps([newLap, ...laps]);
    };

    // Calculate fastest and slowest laps
    const { fastestId, slowestId } = useMemo(() => {
        if (laps.length < 2) return { fastestId: null, slowestId: null };
        let min = laps[0].splitTime;
        let max = laps[0].splitTime;
        let minId = laps[0].id;
        let maxId = laps[0].id;
        laps.forEach((l) => {
            if (l.splitTime < min) {
                min = l.splitTime;
                minId = l.id;
            }
            if (l.splitTime > max) {
                max = l.splitTime;
                maxId = l.id;
            }
        });
        return { fastestId: minId, slowestId: maxId };
    }, [laps]);

    // Format milliseconds into MM:SS.mmm
    const formatSwTime = (ms) => {
        const totalSec = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSec / 60);
        const seconds = totalSec % 60;
        const millis = Math.floor((ms % 1000) / 10);
        return {
            min: String(minutes).padStart(2, "0"),
            sec: String(seconds).padStart(2, "0"),
            ms: String(millis).padStart(2, "0")
        };
    };

    /* ----------------------------------------------------
       COUNTDOWN TIMER STATE & LOGIC
    ------------------------------------------------------- */
    const [timerInputH, setTimerInputH] = useState(0);
    const [timerInputM, setTimerInputM] = useState(25);
    const [timerInputS, setTimerInputS] = useState(0);
    const [timerTotalSec, setTimerTotalSec] = useState(25 * 60);
    const [timerRemainingSec, setTimerRemainingSec] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);

    useEffect(() => {
        let interval = null;
        if (timerRunning) {
            interval = setInterval(() => {
                setTimerRemainingSec((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setTimerRunning(false);
                        if (onAlarmSound && soundEnabled) onAlarmSound("marimba");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerRunning, onAlarmSound, soundEnabled]);

    const handleTimerStartPause = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        if (timerRemainingSec <= 0) {
            const total = Number(timerInputH) * 3600 + Number(timerInputM) * 60 + Number(timerInputS);
            if (total <= 0) return;
            setTimerTotalSec(total);
            setTimerRemainingSec(total);
            setTimerRunning(true);
        } else {
            setTimerRunning(!timerRunning);
        }
    };

    const handleTimerReset = () => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setTimerRunning(false);
        const total = Number(timerInputH) * 3600 + Number(timerInputM) * 60 + Number(timerInputS);
        setTimerRemainingSec(total > 0 ? total : 25 * 60);
        setTimerTotalSec(total > 0 ? total : 25 * 60);
    };

    const handlePreset = (mins) => {
        if (onButtonClick && soundEnabled) onButtonClick();
        setTimerRunning(false);
        setTimerInputH(0);
        setTimerInputM(mins);
        setTimerInputS(0);
        const total = mins * 60;
        setTimerTotalSec(total);
        setTimerRemainingSec(total);
    };

    const formatTimerRemaining = (totalSec) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return {
            h: String(h).padStart(2, "0"),
            m: String(m).padStart(2, "0"),
            s: String(s).padStart(2, "0")
        };
    };

    const timerFormatted = formatTimerRemaining(timerRemainingSec);
    const swFormatted = formatSwTime(swTime);

    // Progress circle math (radius 80, circumference 502.65)
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = timerTotalSec > 0
        ? circumference - (timerRemainingSec / timerTotalSec) * circumference
        : 0;

    return (
        <div className="container mt-5">
            <div className="card timer-stopwatch-card shadow-lg rounded-4">
                <div className="card-body p-4">
                    {/* Header & Tool Switcher */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                        <div>
                            <h3 className="section-title mb-1">
                                ⏱️ Time Tools Suite (Stopwatch & Countdown)
                            </h3>
                            <p className="text-muted small mb-0">
                                High-precision millisecond timing and focus timers with audio alerts.
                            </p>
                        </div>

                        <div className="tool-tab-pill">
                            <button
                                className={`btn-tab ${activeTool === "stopwatch" ? "active" : ""}`}
                                onClick={() => {
                                    if (onButtonClick && soundEnabled) onButtonClick();
                                    setActiveTool("stopwatch");
                                }}
                                type="button"
                            >
                                ⏱️ Stopwatch
                            </button>
                            <button
                                className={`btn-tab ${activeTool === "timer" ? "active" : ""}`}
                                onClick={() => {
                                    if (onButtonClick && soundEnabled) onButtonClick();
                                    setActiveTool("timer");
                                }}
                                type="button"
                            >
                                ⏳ Countdown Timer
                            </button>
                        </div>
                    </div>

                    {/* STOPWATCH VIEW */}
                    {activeTool === "stopwatch" && (
                        <div className="stopwatch-container text-center py-2">
                            <div className="stopwatch-display my-4">
                                <span className="sw-digits">{swFormatted.min}:{swFormatted.sec}</span>
                                <span className="sw-ms">.{swFormatted.ms}</span>
                            </div>

                            {/* Control Buttons */}
                            <div className="d-flex justify-content-center gap-3 mb-4">
                                <button
                                    className={`btn ${swRunning ? "btn-warning" : "btn-primary"} btn-lg px-4 rounded-pill shadow fw-bold`}
                                    onClick={handleSwStartPause}
                                    type="button"
                                >
                                    {swRunning ? "⏸️ Pause" : "▶️ Start"}
                                </button>
                                <button
                                    className="btn btn-outline-primary btn-lg px-4 rounded-pill fw-bold"
                                    onClick={handleSwLap}
                                    disabled={!swRunning}
                                    type="button"
                                >
                                    🚩 Lap
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-lg px-4 rounded-pill fw-bold"
                                    onClick={handleSwReset}
                                    disabled={swTime === 0 && laps.length === 0}
                                    type="button"
                                >
                                    ↺ Reset
                                </button>
                            </div>

                            {/* Laps List */}
                            {laps.length > 0 && (
                                <div className="laps-table-container mx-auto" style={{ maxWidth: 500 }}>
                                    <table className="table table-sm text-start align-middle">
                                        <thead>
                                            <tr>
                                                <th>Lap #</th>
                                                <th>Split Time</th>
                                                <th className="text-end">Total Elapsed</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {laps.map((lap) => {
                                                const split = formatSwTime(lap.splitTime);
                                                const total = formatSwTime(lap.overallTime);
                                                const isFastest = lap.id === fastestId;
                                                const isSlowest = lap.id === slowestId;

                                                return (
                                                    <tr
                                                        key={lap.id}
                                                        className={isFastest ? "table-success" : isSlowest ? "table-danger" : ""}
                                                    >
                                                        <td className="fw-bold">
                                                            Lap {lap.id}
                                                            {isFastest && <span className="badge bg-success ms-2">Fastest</span>}
                                                            {isSlowest && <span className="badge bg-danger ms-2">Slowest</span>}
                                                        </td>
                                                        <td className="font-monospace">
                                                            +{split.min}:{split.sec}.{split.ms}
                                                        </td>
                                                        <td className="text-end font-monospace">
                                                            {total.min}:{total.sec}.{total.ms}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* COUNTDOWN TIMER VIEW */}
                    {activeTool === "timer" && (
                        <div className="timer-container text-center py-2">
                            {/* Circular Countdown Progress Gauge */}
                            <div className="timer-gauge-wrapper my-3 mx-auto">
                                <svg viewBox="0 0 200 200" className="timer-gauge-svg">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        className="timer-gauge-bg"
                                    />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        className="timer-gauge-progress"
                                        style={{
                                            strokeDasharray: circumference,
                                            strokeDashoffset: strokeDashoffset
                                        }}
                                    />
                                </svg>
                                <div className="timer-gauge-content">
                                    <div className="timer-digits display-5 fw-bold">
                                        {Number(timerFormatted.h) > 0 && `${timerFormatted.h}:`}
                                        {timerFormatted.m}:{timerFormatted.s}
                                    </div>
                                    <span className="small text-muted">
                                        {timerRemainingSec === 0 ? "🔔 Time Completed!" : timerRunning ? "⏳ Counting Down" : "⏸️ Paused"}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Presets */}
                            <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
                                <button className="btn btn-sm btn-quick-jump" onClick={() => handlePreset(25)} type="button">
                                    🍅 Pomodoro (25m)
                                </button>
                                <button className="btn btn-sm btn-quick-jump" onClick={() => handlePreset(5)} type="button">
                                    ☕ Short Break (5m)
                                </button>
                                <button className="btn btn-sm btn-quick-jump" onClick={() => handlePreset(15)} type="button">
                                    👥 Standup (15m)
                                </button>
                                <button className="btn btn-sm btn-quick-jump" onClick={() => handlePreset(60)} type="button">
                                    ⌛ Deep Focus (1h)
                                </button>
                            </div>

                            {/* Custom Inputs (when not running) */}
                            {!timerRunning && (
                                <div className="timer-inputs-row d-flex justify-content-center align-items-center gap-2 mb-4">
                                    <div className="input-group input-group-sm" style={{ width: 90 }}>
                                        <input
                                            type="number"
                                            className="form-control text-center"
                                            min={0}
                                            max={23}
                                            value={timerInputH}
                                            onChange={(e) => setTimerInputH(Math.max(0, Number(e.target.value)))}
                                        />
                                        <span className="input-group-text">h</span>
                                    </div>
                                    <span className="fw-bold">:</span>
                                    <div className="input-group input-group-sm" style={{ width: 90 }}>
                                        <input
                                            type="number"
                                            className="form-control text-center"
                                            min={0}
                                            max={59}
                                            value={timerInputM}
                                            onChange={(e) => setTimerInputM(Math.max(0, Number(e.target.value)))}
                                        />
                                        <span className="input-group-text">m</span>
                                    </div>
                                    <span className="fw-bold">:</span>
                                    <div className="input-group input-group-sm" style={{ width: 90 }}>
                                        <input
                                            type="number"
                                            className="form-control text-center"
                                            min={0}
                                            max={59}
                                            value={timerInputS}
                                            onChange={(e) => setTimerInputS(Math.max(0, Number(e.target.value)))}
                                        />
                                        <span className="input-group-text">s</span>
                                    </div>
                                </div>
                            )}

                            {/* Timer Action Buttons */}
                            <div className="d-flex justify-content-center gap-3">
                                <button
                                    className={`btn ${timerRunning ? "btn-warning" : "btn-primary"} btn-lg px-4 rounded-pill shadow fw-bold`}
                                    onClick={handleTimerStartPause}
                                    type="button"
                                >
                                    {timerRunning ? "⏸️ Pause" : "▶️ Start Timer"}
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-lg px-4 rounded-pill fw-bold"
                                    onClick={handleTimerReset}
                                    type="button"
                                >
                                    ↺ Reset
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TimerStopwatch;
