import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface NextEpisodeOverlayProps {
  visible: boolean;
  onCancel: () => void;
}

export const NextEpisodeOverlay: React.FC<NextEpisodeOverlayProps> = ({
  visible,
  onCancel,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.nextEpisodeOverlay}>
      <View style={styles.nextEpisodeContent}>
        <ThemedText style={styles.nextEpisodeTitle}>
          即将播放下一集...
        </ThemedText>
        <TouchableOpacity style={styles.nextEpisodeButton} onPress={onCancel}>
          <ThemedText style={styles.nextEpisodeButtonText}>取消</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nextEpisodeOverlay: {
    position: "absolute",
    right: 40,
    bottom: 60,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 8,
    padding: 15,
    width: 250,
  },
  nextEpisodeContent: {
    alignItems: "center",
  },
  nextEpisodeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  nextEpisodeButton: {
    backgroundColor: "#333",
    padding: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  nextEpisodeButtonText: {
    fontSize: 14,
  },
});
