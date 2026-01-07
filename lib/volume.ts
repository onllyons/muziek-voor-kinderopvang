import TrackPlayer from "react-native-track-player";
import { supabase } from "@/lib/supabase";

const DEFAULT_MAX_VOLUME = 0.7;
const DEFAULT_VOLUME_CURVE = 1;
let maxVolume = DEFAULT_MAX_VOLUME;
let lastRawValue: unknown = null;
let lastLoadedAt = 0;
let debugEnabled = false;
let debugRawValue: unknown = null;
let volumeCurve = DEFAULT_VOLUME_CURVE;
let volumeCurveRaw: unknown = null;

export function normalizeMaxVolume(value: unknown) {
  if (value == null) return DEFAULT_MAX_VOLUME;
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_MAX_VOLUME;
  const scaled = num > 1 ? num / 100 : num;
  return Math.min(1, Math.max(0, scaled));
}

function normalizeVolumeCurve(value: unknown) {
  if (value == null) return DEFAULT_VOLUME_CURVE;
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_VOLUME_CURVE;
  return Math.min(5, Math.max(1, num));
}

export function setMaxVolume(value: unknown) {
  maxVolume = normalizeMaxVolume(value);
  return maxVolume;
}

export function getMaxVolume() {
  return maxVolume;
}

export function getEffectiveVolume() {
  return Math.pow(maxVolume, volumeCurve);
}

export function getMaxVolumeRaw() {
  return lastRawValue;
}

export function getMaxVolumeLoadedAt() {
  return lastLoadedAt;
}

export function getVolumeCurve() {
  return volumeCurve;
}

export function getVolumeCurveRaw() {
  return volumeCurveRaw;
}

export function isVolumeDebugEnabled() {
  return debugEnabled;
}

export function setVolumeDebugEnabled(value: unknown) {
  debugRawValue = value;
  const num = Number(value);
  debugEnabled = Number.isFinite(num) ? num > 0 : false;
  return debugEnabled;
}

export async function applyMaxVolume() {
  try {
    const effective = getEffectiveVolume();
    await TrackPlayer.setVolume(effective);
    if (__DEV__) {
      const current = await TrackPlayer.getVolume();
      console.log(
        "[volume] applied:",
        effective,
        "current:",
        current,
        "base:",
        maxVolume,
        "curve:",
        volumeCurve
      );
    }
  } catch (e) {
    console.warn("Max volume apply error:", e);
  }
}

export async function loadAndApplyMaxVolume() {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["max_volume", "volume_debug", "volume_curve"]);
    if (error) throw error;
    const rows = (data ?? []) as { key: string; value: unknown }[];
    const maxRow = rows.find((row) => row.key === "max_volume");
    const debugRow = rows.find((row) => row.key === "volume_debug");
    const curveRow = rows.find((row) => row.key === "volume_curve");
    lastRawValue = maxRow?.value;
    lastLoadedAt = Date.now();
    setVolumeDebugEnabled(debugRow?.value);
    volumeCurveRaw = curveRow?.value ?? null;
    volumeCurve = normalizeVolumeCurve(curveRow?.value);
    const normalized = setMaxVolume(maxRow?.value);
    console.log("[volume] max_volume setting:", maxRow?.value, "->", normalized);
    console.log("[volume] curve setting:", curveRow?.value, "->", volumeCurve);
    await applyMaxVolume();
    return normalized;
  } catch (e) {
    console.warn("Max volume load error:", e);
    lastRawValue = null;
    lastLoadedAt = Date.now();
    setVolumeDebugEnabled(null);
    volumeCurveRaw = null;
    volumeCurve = DEFAULT_VOLUME_CURVE;
    setMaxVolume(DEFAULT_MAX_VOLUME);
    await applyMaxVolume();
    return maxVolume;
  }
}

export async function getVolumeDebugInfo() {
  let current: number | null = null;
  try {
    current = await TrackPlayer.getVolume();
  } catch {}

  return {
    raw: lastRawValue,
    normalized: maxVolume,
    effective: getEffectiveVolume(),
    player: current,
    debugEnabled,
    debugRaw: debugRawValue,
    curve: volumeCurve,
    curveRaw: volumeCurveRaw,
    loadedAt: lastLoadedAt,
  };
}
