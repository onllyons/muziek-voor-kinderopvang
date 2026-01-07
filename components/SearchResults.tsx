import React from "react";
import { FlatList } from "react-native";
import TrackRow from "@/components/TrackRow";
import { usePlayer } from "@/contexts/PlayerContext";
import { B2_PUBLIC_URL, DEFAULT_COVER, buildMediaUrl } from "@/lib/queries";

export default function SearchResults({ results }: { results: any[] }) {
  const { playFromList, currentTrack } = usePlayer();

  if (!results.length) return null;

  const tracks = results
    .filter((s) => !!s.optimized_file)
    .map((s) => ({
      title: s.title,
      url: `${B2_PUBLIC_URL}${s.optimized_file}.aac`,
      coverUrl: s.cover_file
        ? buildMediaUrl(s.cover_file, ".png")
        : DEFAULT_COVER,
    }));

  const bottomPadding = currentTrack ? 140 : 8;

  return (
    <FlatList
      data={tracks}
      keyExtractor={(item, i) => `${item.title}-${i}`}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      renderItem={({ item, index }) => (
        <TrackRow
          title={item.title}
          url={item.url}
          coverUrl={item.coverUrl}
          onPlay={() => playFromList(tracks, index, DEFAULT_COVER)}
        />
      )}
    />
  );
}
