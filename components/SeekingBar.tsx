import React from "react";
import { View, StyleSheet, Text } from "react-native";
import usePlayerStore from "@/stores/playerStore";

const formatTime = (milliseconds: number) => {
  if (isNaN(milliseconds) || milliseconds < 0) {
    return "00:00";
  }
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const SeekingBar = () => {
  const { isSeeking, seekPosition, status } = usePlayerStore();

  if (!isSeeking || !status?.isLoaded) {
    return null;
  }

  const durationMillis = status.durationMillis || 0;
  const currentPositionMillis = seekPosition * durationMillis;

  return (
    <View style={styles.seekingContainer}>
      <Text style={styles.timeText}>
        {formatTime(currentPositionMillis)} / {formatTime(durationMillis)}
      </Text>
      <View style={styles.seekingBarContainer}>
        <View style={styles.seekingBarBackground} />
        <View
          style={[
            styles.seekingBarFilled,
            {
              width: `${seekPosition * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  seekingContainer: {
    position: "absolute",
    bottom: 80,
    left: "5%",
    right: "5%",
    alignItems: "center",
  },
  timeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  seekingBarContainer: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2.5,
  },
  seekingBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2.5,
  },
  seekingBarFilled: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2.5,
  },
});
