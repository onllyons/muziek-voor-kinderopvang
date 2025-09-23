import React from "react";
import { FlatList } from "react-native";
import TrackRow from "@/components/TrackRow";
import { usePlayer } from "@/contexts/PlayerContext";

const COVER_URL = "https://aapscm.onllyons.com/muziek/player.png";
const B2_PUBLIC_URL =
  "https://f003.backblazeb2.com/file/l2p-kids-directus-test/";

export default function SearchResults({ results }: { results: any[] }) {
  const { playFromList } = usePlayer();

  if (!results.length) return null;

  const tracks = results
    .filter((s) => !!s.optimized_file)
    .map((s) => ({
      title: s.title,
      url: `${B2_PUBLIC_URL}${s.optimized_file}.aac`,
    }));

  return (
    <FlatList
      data={tracks}
      keyExtractor={(item, i) => `${item.title}-${i}`}
      renderItem={({ item, index }) => (
        <TrackRow
          title={item.title}
          url={item.url}
          coverUrl={COVER_URL}
          onPlay={() => playFromList(tracks, index, COVER_URL)}
        />
      )}
    />
  );
}