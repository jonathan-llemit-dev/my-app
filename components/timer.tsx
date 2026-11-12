"use client";

import { useEffect, useState } from "react";

export default function Timer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setTime((current) => current + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  function handleReset(): void {
    setIsRunning(false);
    setTime(0);
  }

  const minutes = Math.floor(time / 60);
  const remainder = time % 60;
  const clock = `${minutes}:${String(remainder).padStart(2, "0")}`;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-lg font-semibold text-foreground" aria-live="polite">
        Timer: {clock}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setIsRunning((running) => !running)}
          className={`rounded-md px-4 py-2 text-white transition-colors ${
            isRunning
              ? "bg-primary hover:bg-primary-hover"
              : "bg-secondary hover:bg-secondary-hover"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="mt-2 rounded-md bg-danger px-4 py-2 text-danger-fg hover:bg-danger-hover transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}