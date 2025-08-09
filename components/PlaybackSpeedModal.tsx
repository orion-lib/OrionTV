import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { MediaButton } from "@/components/MediaButton";

interface PlaybackSpeedModalProps {
  visible: boolean;
  currentRate: number;
  onSelectRate: (rate: number) => void;
  onClose: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25];

export const PlaybackSpeedModal: React.FC<PlaybackSpeedModalProps> = ({
  visible,
  currentRate,
  onSelectRate,
  onClose,
}) => {
  const handleSelectRate = (rate: number) => {
    onSelectRate(rate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>播放速度</ThemedText>
            <MediaButton onPress={onClose}>
              <X color="white" size={24} />
            </MediaButton>
          </View>

          {/* Speed Options */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {SPEED_OPTIONS.map((rate) => {
              const isSelected = Math.abs(rate - currentRate) < 0.01;
              return (
                <Pressable
                  key={rate}
                  style={[
                    styles.speedOption,
                    isSelected && styles.selectedOption,
                  ]}
                  onPress={() => handleSelectRate(rate)}
                >
                  <Text
                    style={[
                      styles.speedText,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {rate}x
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              当前速度: {currentRate}x
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "rgba(40, 40, 40, 0.95)",
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
    maxWidth: 400,
    maxHeight: 500,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    maxHeight: 300,
  },
  optionsContainer: {
    paddingVertical: 10,
  },
  speedOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "white",
  },
  speedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
});