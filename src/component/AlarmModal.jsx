import { useEffect } from "react";
import { formatZoneLabel } from "../timeUtils";

function AlarmModal({ activeAlarm, onDismiss, onSnooze }) {
    if (!activeAlarm) return null;

    return (
        <div className="alarm-ringing-overlay" role="dialog" aria-modal="true">
            <div className="alarm-ringing-modal card shadow-2xl p-4 text-center">
                {/* Ringing Bell Animated Icon */}
                <div className="alarm-bell-animation mb-3">
                    <span className="ringing-icon">⏰</span>
                </div>

                <h2 className="alarm-ring-title fw-bold mb-1">
                    {activeAlarm.name || "Alarm Ringing!"}
                </h2>

                <p className="alarm-ring-time display-4 fw-black text-danger my-2">
                    {activeAlarm.time}
                </p>

                <p className="text-muted mb-4">
                    Timezone: <strong>{formatZoneLabel(activeAlarm.zone || "Local")}</strong>
                </p>

                {/* Snooze & Dismiss Action Buttons */}
                <div className="d-flex flex-column gap-2">
                    <div className="d-flex gap-2 justify-content-center">
                        <button
                            className="btn btn-outline-warning btn-lg flex-fill rounded-pill fw-bold"
                            onClick={() => onSnooze(activeAlarm, 5)}
                            type="button"
                        >
                            💤 Snooze (+5 min)
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-lg flex-fill rounded-pill fw-bold"
                            onClick={() => onSnooze(activeAlarm, 10)}
                            type="button"
                        >
                            💤 Snooze (+10 min)
                        </button>
                    </div>

                    <button
                        className="btn btn-danger btn-lg w-100 rounded-pill fw-bold mt-2 shadow"
                        onClick={() => onDismiss(activeAlarm)}
                        type="button"
                    >
                        🛑 Dismiss Alarm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AlarmModal;
