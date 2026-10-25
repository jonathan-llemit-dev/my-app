"use client";

import { useEffect, useState } from "react";

export default function About() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setTime((current) => current + 1);
    }, 1000);
    
    return () => clearInterval(id);
  }, [isRunning]);

  function handleReset() : void {
    setIsRunning(false);
    setTime(0);
  }

  const minutes = Math.floor(time / 60);
  const remainder = time % 60;
  const clock = `${minutes}:${String(remainder).padStart(2, "0")}`;

  return (
    <div>
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-2 text-gray-600">This is the about page.</p>
      <div className="mt-4">
        <p className="text-lg font-semibold" aria-live="polite">Timer: {clock}</p>
        <button
          onClick={() => setIsRunning((running) => !running)}
          className={`mt-2 mr-2 rounded px-4 py-2 text-white ${isRunning ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className={`mt-2 rounded px-4 py-2 text-white bg-red-500 hover:bg-red-600`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}