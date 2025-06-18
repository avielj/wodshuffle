import React, { useState, useRef, useEffect } from "react";

const TIMER_TYPES = [
  { value: "emom", label: "EMOM" },
  { value: "amrap", label: "AMRAP" },
  { value: "tabata", label: "Tabata" },
];

function speak(text) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 1.1;
    window.speechSynthesis.speak(utter);
  }
}

function beep(frequency = 440, duration = 200, volume = 1) {
  if (typeof window === "undefined") return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    ctx.close();
  }, duration);
}

// Improved formatTime: always returns 00:00 for invalid input
const formatTime = (sec) => {
  if (typeof sec !== 'number' || isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function WODTimer() {
  const [timerType, setTimerType] = useState(null); // null = show menu
  const [minutes, setMinutes] = useState(10);
  const [interval, setIntervalLength] = useState(1); // For EMOM: work (min)
  const [emomRest, setEmomRest] = useState(0); // For EMOM: rest (min)
  const [isRest, setIsRest] = useState(false); // For EMOM: track if in rest
  const [tabataWork, setTabataWork] = useState(20);
  const [tabataRest, setTabataRest] = useState(10);
  const [tabataRounds, setTabataRounds] = useState(8);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [round, setRound] = useState(1);
  const [status, setStatus] = useState("");
  const timerRef = useRef();
  const [countdown, setCountdown] = useState(false);
  const [countDownMode, setCountDownMode] = useState(true); // New: count down toggle
  const countdownTimeout = useRef();
  const [fullscreen, setFullscreen] = useState(false);
  const wakeLockRef = useRef(null);
  const [bgColor, setBgColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');

  // Wake Lock API: prevent phone from sleeping when timer is running
  useEffect(() => {
    async function requestWakeLock() {
      if ('wakeLock' in navigator && running) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (e) {}
      }
    }
    if (running) {
      requestWakeLock();
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [running]);

  // Fullscreen API
  const timerContainerRef = useRef();
  const handleFullscreen = () => {
    if (!fullscreen && timerContainerRef.current) {
      if (timerContainerRef.current.requestFullscreen) {
        timerContainerRef.current.requestFullscreen();
      }
      setFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };
  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Load color preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bg = localStorage.getItem('wod_timer_bg');
      const txt = localStorage.getItem('wod_timer_text');
      if (bg) setBgColor(bg);
      if (txt) setTextColor(txt);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wod_timer_bg', bgColor);
      localStorage.setItem('wod_timer_text', textColor);
    }
  }, [bgColor, textColor]);

  // Reset timer state
  const reset = () => {
    setRunning(false);
    setPaused(false);
    setTimeLeft(0);
    setRound(1);
    setStatus("");
    setCountdown(false);
    setIsRest(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (countdownTimeout.current) clearTimeout(countdownTimeout.current);
  };

  // Stop timer (reset and clear all)
  const stop = () => {
    setRunning(false);
    setPaused(false);
    setTimeLeft(0);
    setRound(1);
    setStatus("Stopped");
    setCountdown(false);
    setIsRest(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (countdownTimeout.current) clearTimeout(countdownTimeout.current);
  };

  // Start 10s countdown
  const startCountdown = () => {
    setCountdown(true);
    let count = 10;
    setStatus("Get Ready");
    const speakCountdown = () => {
      if (count > 0) {
        speak(count.toString());
        setStatus(`Starting in ${count}...`);
        count--;
        countdownTimeout.current = setTimeout(speakCountdown, 1000);
      } else {
        speak("Start");
        beep(440, 300, 1);
        setCountdown(false);
        startTimer();
      }
    };
    speakCountdown();
  };

  // Input validation helpers
  const safeInt = (val, fallback) => {
    const n = parseInt(val, 10);
    return isNaN(n) || n <= 0 ? fallback : n;
  };

  // Main timer logic
  const startTimer = () => {
    setRunning(true);
    setPaused(false);
    let totalSeconds = 0;
    let intervalSeconds = 0;
    let restSeconds = 0;
    let rounds = 1;
    if (timerType === "emom") {
      totalSeconds = minutes * 60;
      intervalSeconds = interval * 60;
      restSeconds = emomRest * 60;
      setTimeLeft(intervalSeconds);
      setRound(1);
      setStatus(`EMOM: Work 1/${minutes}`);
      setIsRest(false);
    } else if (timerType === "for_time") {
      if (countDownMode) {
        setTimeLeft(minutes * 60);
        setStatus("For Time: Counting down");
      } else {
        setTimeLeft(0);
        setStatus("For Time: Counting up");
      }
    } else if (timerType === "amrap") {
      totalSeconds = minutes * 60;
      setTimeLeft(totalSeconds);
      setStatus(`AMRAP: ${minutes} min`);
    } else if (timerType === "tabata") {
      setTimeLeft(tabataWork);
      setRound(1);
      setStatus(`Tabata: Work 1/${tabataRounds}`);
    }
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (timerType === "emom") {
          if (prev <= 1) {
            if (!isRest && emomRest > 0) {
              // Switch to rest
              beep(440, 200, 1);
              setIsRest(true);
              setStatus(`EMOM: Rest ${round}/${minutes}`);
              return restSeconds;
            } else if (isRest) {
              // Switch to next work round
              if (round < minutes) {
                beep(440, 200, 1);
                setRound((r) => r + 1);
                setStatus(`EMOM: Work ${round + 1}/${minutes}`);
                setIsRest(false);
                return intervalSeconds;
              } else {
                beep(880, 500, 1);
                setStatus("EMOM Complete");
                clearInterval(timerRef.current);
                setRunning(false);
                setIsRest(false);
                return 0;
              }
            } else {
              // No rest, just next round
              if (round < minutes) {
                beep(440, 200, 1);
                setRound((r) => r + 1);
                setStatus(`EMOM: Work ${round + 1}/${minutes}`);
                return intervalSeconds;
              } else {
                beep(880, 500, 1);
                setStatus("EMOM Complete");
                clearInterval(timerRef.current);
                setRunning(false);
                return 0;
              }
            }
          } else {
            // 3,2,1 beep before end
            if (prev <= 4 && prev > 1) beep(880, 100, 0.5);
            return prev - 1;
          }
        }
        if (prev <= 1) {
          if (timerType === "emom") {
            if (round < minutes) {
              beep(440, 200, 1);
              setRound((r) => r + 1);
              setStatus(`EMOM: Round ${round + 1}/${minutes}`);
              return intervalSeconds;
            } else {
              beep(880, 500, 1);
              setStatus("EMOM Complete");
              clearInterval(timerRef.current);
              setRunning(false);
              return 0;
            }
          } else if (timerType === "amrap") {
            beep(880, 500, 1);
            setStatus("AMRAP Complete");
            clearInterval(timerRef.current);
            setRunning(false);
            return 0;
          } else if (timerType === "tabata") {
            if (status.startsWith("Tabata: Work")) {
              beep(880, 200, 1);
              setStatus(`Tabata: Rest ${round}/${tabataRounds}`);
              return tabataRest;
            } else if (status.startsWith("Tabata: Rest")) {
              if (round < tabataRounds) {
                beep(440, 200, 1);
                setRound((r) => r + 1);
                setStatus(`Tabata: Work ${round + 1}/${tabataRounds}`);
                return tabataWork;
              } else {
                beep(880, 500, 1);
                setStatus("Tabata Complete");
                clearInterval(timerRef.current);
                setRunning(false);
                return 0;
              }
            }
          }
        } else {
          // 3,2,1 beep before end
          if (prev <= 4 && prev > 1) beep(880, 100, 0.5);
          return prev - 1;
        }
      });
    }, 1000);
  };

  // Pause/Resume
  const pause = () => {
    setPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const resume = () => {
    setPaused(false);
    startTimer();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // UI
  return (
    <div ref={timerContainerRef} className={`max-w-xl mx-auto bg-white/10 rounded-xl p-4 sm:p-6 shadow-lg mt-4 sm:mt-8 text-center${fullscreen ? ' fixed inset-0 z-50 bg-black flex flex-col justify-center items-center' : ''}`}>
      <h2 className="text-3xl font-bold mb-4">WOD Timer</h2>
      {timerType === null ? (
        <div className="flex flex-col gap-4 mb-6 items-center">
          <button
            type="button"
            className="px-4 py-2 rounded font-bold shadow transition-colors duration-150 text-white text-lg bg-green-500 hover:bg-green-600 w-40 mb-2"
            onClick={() => { setTimerType('emom'); reset(); }}
          >
            EMOM
          </button>
          <div className="flex flex-col gap-2 w-40">
            <button
              type="button"
              className="px-4 py-2 rounded font-bold shadow transition-colors duration-150 text-black text-lg bg-yellow-400 hover:bg-yellow-500"
              onClick={() => { setTimerType('amrap'); reset(); }}
            >
              AMRAP
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded font-bold shadow transition-colors duration-150 text-white text-lg bg-purple-500 hover:bg-purple-600"
              onClick={() => { setTimerType('tabata'); reset(); }}
            >
              Tabata
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-2">
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold"
              style={{ minWidth: 32, minHeight: 32 }}
              onClick={() => { setTimerType(null); reset(); }}
            >
              ← Back
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold ml-2"
              onClick={handleFullscreen}
            >
              {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
          <div className="relative">
            <div className={`flex flex-col gap-4 mb-6 justify-center items-center mt-6 ${running || paused || countdown ? 'hidden' : ''}`}>
              {/* Timer settings UI: vertical, labeled */}
              {timerType === "emom" && (
                <>
                  <div className="flex flex-col items-start w-full max-w-xs">
                    <label className="text-white/90 mb-1">Total Minutes</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={minutes}
                      onChange={e => setMinutes(Number(e.target.value))}
                      className="rounded px-2 py-1 w-full bg-white/20 text-white mb-2"
                    />
                    <label className="text-white/90 mb-1">Work (min)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={interval}
                      onChange={e => setIntervalLength(Number(e.target.value))}
                      className="rounded px-2 py-1 w-full bg-white/20 text-white mb-2"
                    />
                    <label className="text-white/90 mb-1">Rest (min)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={emomRest}
                      onChange={e => setEmomRest(Number(e.target.value))}
                      className="rounded px-2 py-1 w-full bg-white/20 text-white"
                    />
                  </div>
                </>
              )}
              {timerType === "amrap" && (
                <div className="flex flex-col items-start w-full max-w-xs">
                  <label className="text-white/90 mb-1">Minutes</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={minutes}
                    onChange={e => setMinutes(Number(e.target.value))}
                    className="rounded px-2 py-1 w-full bg-white/20 text-white"
                  />
                </div>
              )}
              {timerType === "tabata" && (
                <div className="flex flex-col items-start w-full max-w-xs">
                  <label className="text-white/90 mb-1">Rounds</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={tabataRounds}
                    onChange={e => setTabataRounds(safeInt(e.target.value, 8))}
                    className="rounded px-2 py-1 w-full bg-white/20 text-white mb-2"
                  />
                  <label className="text-white/90 mb-1">Work (seconds)</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={tabataWork}
                    onChange={e => setTabataWork(safeInt(e.target.value, 20))}
                    className="rounded px-2 py-1 w-full bg-white/20 text-white mb-2"
                  />
                  <label className="text-white/90 mb-1">Rest (seconds)</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={tabataRest}
                    onChange={e => setTabataRest(safeInt(e.target.value, 10))}
                    className="rounded px-2 py-1 w-full bg-white/20 text-white"
                  />
                </div>
              )}
              {/* Color pickers for timer customization */}
              <div className="flex gap-4 items-center mt-4">
                <label className="text-white/80 text-sm">Background:
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="ml-2 w-8 h-8 p-0 border-0 bg-transparent" />
                </label>
                <label className="text-white/80 text-sm">Text:
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="ml-2 w-8 h-8 p-0 border-0 bg-transparent" />
                </label>
              </div>
            </div>
            {/* Large timer display when running/paused/countdown */}
            {(running || paused || countdown) && (
              <div className="flex flex-col items-center justify-center my-8">
                <div className="text-7xl sm:text-8xl font-mono font-bold drop-shadow-lg mb-4 select-none" style={{letterSpacing:'0.05em', background: bgColor, color: textColor, borderRadius: '1rem', padding: '1.5rem 2.5rem', minWidth: '320px'}}>
                  {countdown ? (status.startsWith('Starting') ? status.replace('Starting in ', '') : status) : formatTime(timeLeft)}
                </div>
                {timerType !== "tabata" && <div className="text-lg" style={{color: textColor}}>Round: {round}</div>}
                <div className="text-xl mt-2" style={{color: textColor}}>{status}</div>
              </div>
            )}
            <div className="flex gap-2 flex-wrap justify-center mt-4">
              {/* Ensure equal spacing between all timer control buttons */}
              {!running && !countdown && (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow"
                  style={{ marginRight: '0.5rem' }}
                  onClick={startCountdown}
                >Start</button>
              )}
              {running && !paused && (
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow"
                  style={{ marginRight: '0.5rem' }}
                  onClick={pause}
                >Pause</button>
              )}
              {running && paused && (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow"
                  style={{ marginRight: '0.5rem' }}
                  onClick={resume}
                >Resume</button>
              )}
              {(running || paused || countdown) && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow"
                  style={{ marginRight: '0.5rem' }}
                  onClick={reset}
                >Reset</button>
              )}
              {(running || paused || countdown) && (
                <button
                  className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded font-bold shadow"
                  onClick={stop}
                >Stop</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
