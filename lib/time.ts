export function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
