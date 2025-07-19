import React, { useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

interface SettingsSectionProps {
  children: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  focusable?: boolean;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ children, onFocus, onBlur, focusable = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  if (!focusable) {
    return <ThemedView style={styles.section}>{children}</ThemedView>;
  }

  return (
    <ThemedView style={[styles.section, isFocused && styles.sectionFocused]}>
      <Pressable style={styles.sectionPressable} onFocus={handleFocus} onBlur={handleBlur}>
        {children}
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionFocused: {
    borderColor: Colors.dark.primary,
    backgroundColor: "#007AFF10",
  },
  sectionPressable: {
    width: "100%",
  },
});
