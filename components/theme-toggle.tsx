"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

// The cycle: light → dark → system → light
const THEMES = ["light", "dark", "system"] as const;
type Theme = (typeof THEMES)[number];

const ICON: Record<Theme, string> = {
  light: "☀️",
  dark: "🌙",
  system: "💻",
};

function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

// No-op subscription: React only uses it to know when to re-read the
// snapshot. getSnapshot returns true on the client and getServerSnapshot
// returns false on the server + during hydration, so the button renders
// only once mounted (the theme is client-only state).
const subscribe = () => () => {};

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  // Same size as the real button, so the navbar never shifts.
  if (!mounted) {
    return (
      <button type="button" aria-label="Toggle theme" className="size-9 rounded-md" disabled />
    );
  }

  // `theme` is "system" by default; fall back if the provider has no value yet.
  const current: Theme = isTheme(theme) ? theme : "system";
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  // When following the OS, say which one it currently resolves to.
  const label = current === "system" ? `system (${resolvedTheme ?? "auto"})` : current;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Theme: ${label}`}
      aria-label={`Theme: ${label}. Switch to ${next}.`}
      className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-border hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span aria-hidden="true">{ICON[current]}</span>
    </button>
  );
}
