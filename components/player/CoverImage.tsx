import React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from "react-native";

type Props = {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
};

function buildFallbackUris(uri: string) {
  const normalized = uri.trim();
  if (!normalized) return [];

  const match = normalized.match(/\.(png|jpg|jpeg)(\?.*)?$/i);
  if (!match) return [normalized];

  const currentExt = match[1].toLowerCase();
  const query = match[2] ?? "";
  const base = normalized.slice(0, normalized.length - match[0].length);
  const order =
    currentExt === "png" ? ["png", "jpg", "jpeg"] : [currentExt, "png", "jpg", "jpeg"];

  return [...new Set(order)].map((ext) => `${base}.${ext}${query}`);
}

export default function CoverImage({ source, style }: Props) {
  const fallbackUris = React.useMemo(() => {
    if (typeof source === "number") return [];
    const uri = source?.uri;
    return typeof uri === "string" ? buildFallbackUris(uri) : [];
  }, [source]);

  const [attemptIndex, setAttemptIndex] = React.useState(0);

  React.useEffect(() => {
    setAttemptIndex(0);
  }, [fallbackUris, source]);

  if (typeof source === "number") {
    return <Image source={source} style={style} />;
  }

  const resolvedUri = fallbackUris[attemptIndex] ?? source?.uri;
  const resolvedSource =
    typeof resolvedUri === "string" && resolvedUri
      ? { ...source, uri: resolvedUri }
      : source;

  return (
    <Image
      source={resolvedSource}
      style={style}
      onError={() => {
        if (attemptIndex < fallbackUris.length - 1) {
          const nextUri = fallbackUris[attemptIndex + 1];
          if (__DEV__) {
            console.log("[COVER_IMAGE] fallback", {
              from: fallbackUris[attemptIndex],
              to: nextUri,
            });
          }
          setAttemptIndex((prev) => prev + 1);
        } else if (__DEV__) {
          console.log("[COVER_IMAGE] all fallbacks failed", {
            tried: fallbackUris,
          });
        }
      }}
    />
  );
}
