import React, { useState, useRef, useEffect } from "react";

const TIMER_TYPES = [
  { value: "emom", label: "EMOM" },
  { value: "for_time", label: "For Time" },
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

const formatTime = (sec) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function WODTimer() {
  const [timerType, setTimerType] = useState("emom");
  const [minutes, setMinutes] = useState(10);
  const [interval, setIntervalLength] = useState(1); // For EMOM
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

  // Reset timer state
  const reset = () => {
    setRunning(false);
    setPaused(false);
    setTimeLeft(0);
    setRound(1);
    setStatus("");
    setCountdown(false);
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

  // Main timer logic
  const startTimer = () => {
    setRunning(true);
    setPaused(false);
    let totalSeconds = 0;
    let intervalSeconds = 0;
    let rounds = 1;
    if (timerType === "emom") {
      totalSeconds = minutes * 60;
      intervalSeconds = interval * 60;
      setTimeLeft(intervalSeconds);
      setRound(1);
      setStatus(`EMOM: Round 1/${minutes}`);
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
        if (timerType === "for_time") {
          if (countDownMode) {
            if (prev <= 1) {
              beep(880, 500, 1);
              setStatus("For Time Complete");
              clearInterval(timerRef.current);
              setRunning(false);
              return 0;
            }
            if (prev <= 4 && prev > 1) beep(880, 100, 0.5);
            return prev - 1;
          } else {
            return prev + 1;
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
    <div className="max-w-xl mx-auto bg-white/10 rounded-xl p-4 sm:p-6 shadow-lg mt-4 sm:mt-8 text-center">
      <h2 className="text-3xl font-bold mb-4">WOD Timer</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center items-center">
        <select
          className="rounded px-3 py-2 bg-white/20 text-white font-semibold"
          value={timerType}
          onChange={e => { setTimerType(e.target.value); reset(); }}
        >
          {TIMER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={countDownMode}
            onChange={e => setCountDownMode(e.target.checked)}
            className="accent-blue-600 w-5 h-5"
          />
          Count Down
        </label>
        {timerType === "emom" && (
          <>
            <input
              type="number"
              min={1}
              max={60}
              value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
              className="rounded px-2 py-1 w-20 bg-white/20 text-white"
              placeholder="Minutes"
            />
            <input
              type="number"
              min={1}
              max={10}
              value={interval}
              onChange={e => setIntervalLength(Number(e.target.value))}
              className="rounded px-2 py-1 w-20 bg-white/20 text-white"
              placeholder="Interval (min)"
            />
          </>
        )}
        {(timerType === "amrap" || timerType === "for_time") && (
          <input
            type="number"
            min={1}
            max={60}
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            className="rounded px-2 py-1 w-20 bg-white/20 text-white"
            placeholder="Minutes"
          />
        )}
        {timerType === "tabata" && (
          <>
            <input
              type="number"
              min={1}
              max={60}
              value={tabataRounds}
              onChange={e => setTabataRounds(Number(e.target.value))}
              className="rounded px-2 py-1 w-20 bg-white/20 text-white"
              placeholder="Rounds"
            />
            <input
              type="number"
              min={5}
              max={60}
              value={tabataWork}
              onChange={e => setTabataWork(Number(e.target.value))}
              className="rounded px-2 py-1 w-20 bg-white/20 text-white"
              placeholder="Work (s)"
            />
            <input
              type="number"
              min={5}
              max={60}
              value={tabataRest}
              onChange={e => setTabataRest(Number(e.target.value))}
              className="rounded px-2 py-1 w-20 bg-white/20 text-white"
              placeholder="Rest (s)"
            />
          </>
        )}
      </div>
      <div className="mb-6">
        <div className="text-5xl font-mono mb-2">
          {timerType === "for_time"
            ? formatTime(timeLeft)
            : formatTime(timeLeft)}
        </div>
        <div className="text-lg text-blue-200 font-semibold mb-2">{status}</div>
        {timerType !== "for_time" && <div className="text-sm text-gray-300">Round: {round}</div>}
      </div>
      <div className="flex gap-2 flex-wrap justify-center mt-4">
        {!running && !countdown && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow"
            onClick={startCountdown}
          >Start</button>
        )}
        {running && !paused && (
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow"
            onClick={pause}
          >Pause</button>
        )}
        {running && paused && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow"
            onClick={resume}
          >Resume</button>
        )}
        {(running || paused || countdown) && (
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold shadow"
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
  );
}
