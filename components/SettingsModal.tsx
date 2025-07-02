import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { SettingsManager } from "@/services/storage";
import { moonTVApi } from "@/services/api";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface SettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onCancel,
  onSave,
}) => {
  const [apiUrl, setApiUrl] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const colorScheme = useColorScheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      SettingsManager.get().then((settings) => {
        setApiUrl(settings.apiBaseUrl);
      });
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleSave = async () => {
    await SettingsManager.save({ apiBaseUrl: apiUrl });
    moonTVApi.setBaseUrl(apiUrl);
    onSave();
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    modalContent: {
      width: "80%",
      maxWidth: 500,
      padding: 24,
      borderRadius: 12,
      elevation: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      height: 50,
      borderWidth: 2,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      marginBottom: 24,
      backgroundColor: colorScheme === "dark" ? "#3a3a3c" : "#f0f0f0",
      color: colorScheme === "dark" ? "white" : "black",
      borderColor: "transparent",
    },
    inputFocused: {
      borderColor: "#007AFF",
      shadowColor: "#007AFF",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 5,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 8,
    },
    buttonSave: {
      backgroundColor: "#007AFF",
    },
    buttonCancel: {
      backgroundColor: colorScheme === "dark" ? "#444" : "#ccc",
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "500",
    },
    focusedButton: {
      transform: [{ scale: 1.05 }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.title}>设置</ThemedText>
          <TextInput
            ref={inputRef}
            style={[styles.input, isInputFocused && styles.inputFocused]}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="输入 API 地址"
            placeholderTextColor={colorScheme === "dark" ? "#888" : "#555"}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ focused }) => [
                styles.button,
                styles.buttonCancel,
                focused && styles.focusedButton,
              ]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>取消</Text>
            </Pressable>
            <Pressable
              style={({ focused }) => [
                styles.button,
                styles.buttonSave,
                focused && styles.focusedButton,
              ]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>保存</Text>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};
