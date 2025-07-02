import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  TouchableOpacity,
} from "react-native";

interface Episode {
  title?: string;
  url: string;
}

interface EpisodeSelectionModalProps {
  visible: boolean;
  episodes: Episode[];
  currentEpisodeIndex: number;
  episodeGroupSize: number;
  selectedEpisodeGroup: number;
  setSelectedEpisodeGroup: (group: number) => void;
  onSelectEpisode: (index: number) => void;
  onClose: () => void;
}

export const EpisodeSelectionModal: React.FC<EpisodeSelectionModalProps> = ({
  visible,
  episodes,
  currentEpisodeIndex,
  episodeGroupSize,
  selectedEpisodeGroup,
  setSelectedEpisodeGroup,
  onSelectEpisode,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>选择剧集</Text>

          {episodes.length > episodeGroupSize && (
            <View style={styles.episodeGroupContainer}>
              {Array.from(
                { length: Math.ceil(episodes.length / episodeGroupSize) },
                (_, groupIndex) => (
                  <TouchableOpacity
                    key={groupIndex}
                    style={[
                      styles.episodeGroupButton,
                      selectedEpisodeGroup === groupIndex &&
                        styles.episodeGroupButtonSelected,
                    ]}
                    onPress={() => setSelectedEpisodeGroup(groupIndex)}
                  >
                    <Text style={styles.episodeGroupButtonText}>
                      {`${groupIndex * episodeGroupSize + 1}-${Math.min(
                        (groupIndex + 1) * episodeGroupSize,
                        episodes.length
                      )}`}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
          <FlatList
            data={episodes.slice(
              selectedEpisodeGroup * episodeGroupSize,
              (selectedEpisodeGroup + 1) * episodeGroupSize
            )}
            numColumns={5}
            keyExtractor={(_, index) =>
              `episode-${selectedEpisodeGroup * episodeGroupSize + index}`
            }
            renderItem={({ item, index }) => {
              const absoluteIndex =
                selectedEpisodeGroup * episodeGroupSize + index;
              return (
                <Pressable
                  style={({ focused }) => [
                    styles.episodeItem,
                    currentEpisodeIndex === absoluteIndex &&
                      styles.episodeItemSelected,
                    focused && styles.focusedButton,
                  ]}
                  onPress={() => onSelectEpisode(absoluteIndex)}
                  hasTVPreferredFocus={currentEpisodeIndex === absoluteIndex}
                >
                  <Text style={styles.episodeItemText}>
                    {item.title || `第 ${absoluteIndex + 1} 集`}
                  </Text>
                </Pressable>
              );
            }}
          />

          <Pressable
            style={({ focused }) => [
              styles.closeButton,
              focused && styles.focusedButton,
            ]}
            onPress={onClose}
          >
            <Text style={{ color: "white" }}>关闭</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalContent: {
    width: 400,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    padding: 20,
  },
  modalTitle: {
    color: "white",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  episodeItem: {
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 8,
    margin: 4,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeItemSelected: {
    backgroundColor: "#007bff",
  },
  episodeItemText: {
    color: "white",
    fontSize: 14,
  },
  episodeGroupContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  episodeGroupButton: {
    backgroundColor: "#444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 5,
  },
  episodeGroupButtonSelected: {
    backgroundColor: "#007bff",
  },
  episodeGroupButtonText: {
    color: "white",
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  focusedButton: {
    backgroundColor: "rgba(119, 119, 119, 0.9)",
    transform: [{ scale: 1.1 }],
  },
});
