import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { usePlayer } from '@/contexts/PlayerContext';

interface OverflowMenuProps {
  songTitle: string;
  visible: boolean;
  onClose: () => void;
  anchorPosition: { x: number; y: number };
}

export default function OverflowMenu({ songTitle, visible, onClose, anchorPosition }: OverflowMenuProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = usePlayer();
  const isInFavorites = isFavorite(songTitle);

  const handleToggleFavorite = () => {
    if (isInFavorites) {
      removeFromFavorites(songTitle);
    } else {
      addToFavorites(songTitle);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={onClose}
        activeOpacity={1}
      >
        <View 
          style={[
            styles.menu,
            {
              top: Math.max(anchorPosition.y - 60, 60),
              right: 20,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleToggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={isInFavorites ? `Verwijder ${songTitle} uit favorieten` : `Voeg ${songTitle} toe aan favorieten`}
          >
            <Heart 
              size={20} 
              color={isInFavorites ? "#e77b7b" : "#666"} 
              fill={isInFavorites ? "#e77b7b" : "none"}
            />
            <Text style={styles.menuText}>
              {isInFavorites ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44, // 44pt hit target
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
});