// Web Audio API Synthesizer Hook for World Clock Dashboard
// Creates synthesized tones, ticks, chimes, and alarms without external audio files

import { useRef, useCallback } from "react";

export function useSoundEffects(soundEnabled = true) {
    const audioCtxRef = useRef(null);
    const alarmIntervalRef = useRef(null);

    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtxRef.current = new AudioContextClass();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    // Play a gentle ticking sound (simulating a high precision mechanical watch movement)
    const playTick = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = "sine";
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1200, now);
            filter.Q.setValueAtTime(3, now);

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.03);
        } catch {
            // Audio context not ready
        }
    }, [soundEnabled, getAudioContext]);

    // Play button click / UI feedback blip
    const playClick = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch {
            // Audio error
        }
    }, [soundEnabled, getAudioContext]);

    // Play stopwatch lap sound
    const playLapSound = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(659.25, now); // E5
            osc.frequency.setValueAtTime(880, now + 0.06); // A5

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.16);
        } catch {
            // Audio error
        }
    }, [soundEnabled, getAudioContext]);

    // Play an alarm chime sequence
    const playAlarmTone = useCallback((toneType = "chime") => {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            if (toneType === "marimba") {
                const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const startTime = now + i * 0.12;

                    osc.type = "sine";
                    osc.frequency.setValueAtTime(freq, startTime);

                    gain.gain.setValueAtTime(0.2, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(startTime);
                    osc.stop(startTime + 0.45);
                });
            } else if (toneType === "digital") {
                // High-tech digital double beep
                [0, 0.12, 0.24, 0.36].forEach((offset, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const startTime = now + offset;

                    osc.type = "square";
                    osc.frequency.setValueAtTime(i % 2 === 0 ? 1200 : 1600, startTime);

                    gain.gain.setValueAtTime(0.12, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(startTime);
                    osc.stop(startTime + 0.09);
                });
            } else {
                // Classic melodic chime (default)
                const chord = [440, 554.37, 659.25, 880]; // A major
                chord.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const startTime = now + idx * 0.1;

                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, startTime);

                    gain.gain.setValueAtTime(0.22, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(startTime);
                    osc.stop(startTime + 0.65);
                });
            }
        } catch {
            // Audio context error
        }
    }, [getAudioContext]);

    // Start repeating alarm until stopped
    const startAlarmLoop = useCallback((toneType = "chime") => {
        playAlarmTone(toneType);
        if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = setInterval(() => {
            playAlarmTone(toneType);
        }, 1200);
    }, [playAlarmTone]);

    // Stop active ringing alarm
    const stopAlarmLoop = useCallback(() => {
        if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
        }
    }, []);

    return {
        playTick,
        playClick,
        playLapSound,
        playAlarmTone,
        startAlarmLoop,
        stopAlarmLoop
    };
}
