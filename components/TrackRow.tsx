import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent, 
} from "react-native";
import { Play, MoveVertical as MoreVertical } from "lucide-react-native";

type Props = {
  title: string;
  onPress: (title: string) => void;
  onOverflowPress: (title: string, anchor: { x: number; y: number }) => void;
};

function TrackRowBase({ title, onPress, onOverflowPress }: Props) {
  const handleOverflow = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    onOverflowPress(title, { x: pageX, y: pageY });
  };

  return (
    <View style={s.row}>
      <TouchableOpacity
        style={s.main}
        onPress={() => onPress(title)}
        accessibilityRole="button"
        accessibilityLabel={`Speel ${title}`}
      >
        <View style={s.playBtn}>
          <Play size={35} color="#666" fill="#666" />
        </View>
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.more}
        onPress={handleOverflow}
        accessibilityRole="button"
        accessibilityLabel={`Meer opties voor ${title}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MoreVertical size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

export default memo(TrackRowBase);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 64,
  },
  main: { flexDirection: "row", alignItems: "center", flex: 1, minHeight: 44 },
  playBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  title: { flex: 1, fontSize: 16, color: "#333", fontWeight: "500" },
  more: {
    padding: 12,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
