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
      {/* role="timer" carries aria-live="off" by default. A live region here
          would otherwise announce the clock on every single tick. */}
      <p role="timer" className="text-lg font-semibold text-foreground">
        Timer: {clock}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsRunning((running) => !running)}
          className={`rounded-md px-4 py-2 transition-colors ${
            isRunning
              ? "bg-primary text-primary-fg hover:bg-primary-hover"
              : "bg-secondary text-secondary-fg hover:bg-secondary-hover"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md bg-danger px-4 py-2 text-danger-fg transition-colors hover:bg-danger-hover"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
