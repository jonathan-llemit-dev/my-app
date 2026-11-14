"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // false on the server, true on the client, with no setState-in-effect
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) return <button aria-label="Toggle theme" className="size-9" disabled />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="size-9 rounded-md"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}