import React from "react";
import { Pressable, StyleSheet, StyleProp, ViewStyle } from "react-native";

interface MediaButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  isFocused?: boolean;
  isDisabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MediaButton: React.FC<MediaButtonProps> = ({
  onPress,
  children,
  isFocused = false,
  isDisabled = false,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.mediaControlButton,
        isFocused && styles.focusedButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  mediaControlButton: {
    backgroundColor: "rgba(51, 51, 51, 0.8)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    margin: 5,
  },
  focusedButton: {
    backgroundColor: "rgba(119, 119, 119, 0.9)",
    transform: [{ scale: 1.1 }],
  },
  disabledButton: {
    opacity: 0.5,
  },
});
