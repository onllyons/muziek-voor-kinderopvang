import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Heart } from "lucide-react-native";
import { usePlayer } from "@/contexts/PlayerContext";

type SimpleTrack = { title: string; audioUrl?: string; coverUrl: string | number };

interface OverflowMenuProps {
  track?: SimpleTrack | null;
  visible: boolean;
  onClose: () => void;
  anchorPosition: { x: number; y: number };
}

export default function OverflowMenu({
  track,
  visible,
  onClose,
  anchorPosition,
}: OverflowMenuProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = usePlayer();

  const title = track?.title ?? "";
  const isInFavorites = !!title && isFavorite(title);

  const handleToggleFavorite = () => {
    if (!track) return;
    if (isInFavorites) {
      removeFromFavorites(track.title);
    } else {
      addToFavorites({
        title: track.title,
        audioUrl: track.audioUrl,
        coverUrl: track.coverUrl,
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1}>
        <View
          style={[
            styles.menu,
            { top: Math.max(anchorPosition.y - 60, 60), right: 20 },
          ]}
        >
          <TouchableOpacity
            style={[styles.menuItem, !track && { opacity: 0.5 }]}
            onPress={handleToggleFavorite}
            disabled={!track}
            accessibilityRole="button"
            accessibilityLabel={
              !track
                ? "Bezig..."
                : isInFavorites
                ? `Verwijder ${title} uit favorieten`
                : `Voeg ${title} toe aan favorieten`
            }
          >
            <Heart
              size={20}
              color={isInFavorites ? "#e77b7b" : "#666"}
              fill={isInFavorites ? "#e77b7b" : "none"}
            />
            <Text style={styles.menuText}>
              {!track
                ? "Bezig..."
                : isInFavorites
                ? "Verwijder uit favorieten"
                : "Voeg toe aan favorieten"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  menu: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  menuText: { fontSize: 16, color: "#333", marginLeft: 12, fontWeight: "500" },
});
