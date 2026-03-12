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

const resolvedCoverCache = new Map<string, string>();

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

  const originalUri =
    typeof source === "number" ? null : typeof source?.uri === "string" ? source.uri : null;

  const resolveInitialUri = React.useCallback(() => {
    const firstUri = fallbackUris[0] ?? originalUri ?? "";
    if (!originalUri) return firstUri;
    const cachedUri = resolvedCoverCache.get(originalUri);
    if (cachedUri && fallbackUris.includes(cachedUri)) {
      return cachedUri;
    }
    return firstUri;
  }, [fallbackUris, originalUri]);

  const [currentUri, setCurrentUri] = React.useState(resolveInitialUri);

  React.useEffect(() => {
    setCurrentUri(resolveInitialUri());
  }, [resolveInitialUri]);

  if (typeof source === "number") {
    return <Image source={source} style={style} />;
  }

  const resolvedSource =
    typeof currentUri === "string" && currentUri
      ? { ...source, uri: currentUri }
      : source;

  return (
    <Image
      source={resolvedSource}
      style={style}
      onLoad={() => {
        if (!originalUri || !currentUri) return;
        resolvedCoverCache.set(originalUri, currentUri);
        if (__DEV__ && currentUri !== originalUri) {
          console.log("[COVER_IMAGE] cache resolved", {
            originalUri,
            resolvedUri: currentUri,
          });
        }
      }}
      onError={() => {
        const currentIndex = fallbackUris.indexOf(currentUri);
        if (currentIndex >= 0 && currentIndex < fallbackUris.length - 1) {
          const nextUri = fallbackUris[currentIndex + 1];
          if (__DEV__) {
            console.log("[COVER_IMAGE] fallback", {
              from: currentUri,
              to: nextUri,
            });
          }
          setCurrentUri(nextUri);
        } else if (__DEV__) {
          console.log("[COVER_IMAGE] all fallbacks failed", {
            tried: fallbackUris,
          });
        }
      }}
    />
  );
}
