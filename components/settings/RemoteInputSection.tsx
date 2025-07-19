import React, { useCallback } from "react";
import { View, Switch, StyleSheet, Pressable, Animated } from "react-native";
import { useTVEventHandler } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { useSettingsStore } from "@/stores/settingsStore";
import { useRemoteControlStore } from "@/stores/remoteControlStore";
import { useButtonAnimation } from "@/hooks/useAnimation";
import { Colors } from "@/constants/Colors";

interface RemoteInputSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const RemoteInputSection: React.FC<RemoteInputSectionProps> = ({ onChanged, onFocus, onBlur }) => {
  const { remoteInputEnabled, setRemoteInputEnabled } = useSettingsStore();
  const { isServerRunning, serverUrl, error } = useRemoteControlStore();
  const [isFocused, setIsFocused] = React.useState(false);
  const animationStyle = useButtonAnimation(isFocused, 1.2);

  const handleToggle = useCallback(
    (enabled: boolean) => {
      setRemoteInputEnabled(enabled);
      onChanged();
    },
    [setRemoteInputEnabled, onChanged]
  );

  const handleSectionFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleSectionBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // TV遥控器事件处理
  const handleTVEvent = React.useCallback(
    (event: any) => {
      if (isFocused && event.eventType === "select") {
        handleToggle(!remoteInputEnabled);
      }
    },
    [isFocused, remoteInputEnabled, handleToggle]
  );

  useTVEventHandler(handleTVEvent);

  return (
    <SettingsSection focusable onFocus={handleSectionFocus} onBlur={handleSectionBlur}>
      <Pressable style={styles.settingItem} onFocus={handleSectionFocus} onBlur={handleSectionBlur}>
        <View style={styles.settingInfo}>
          <ThemedText style={styles.settingName}>启用远程输入</ThemedText>
        </View>
        <Animated.View style={animationStyle}>
          <Switch
            value={remoteInputEnabled}
            onValueChange={() => {}} // 禁用Switch的直接交互
            trackColor={{ false: "#767577", true: Colors.dark.primary }}
            thumbColor={remoteInputEnabled ? "#ffffff" : "#f4f3f4"}
            pointerEvents="none"
          />
        </Animated.View>
      </Pressable>

      {remoteInputEnabled && (
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>服务状态：</ThemedText>
            <ThemedText style={[styles.statusValue, { color: isServerRunning ? Colors.dark.primary : "#FF6B6B" }]}>
              {isServerRunning ? "运行中" : "已停止"}
            </ThemedText>
          </View>

          {serverUrl && (
            <View style={styles.statusItem}>
              <ThemedText style={styles.statusLabel}>访问地址：</ThemedText>
              <ThemedText style={styles.statusValue}>{serverUrl}</ThemedText>
            </View>
          )}

          {error && (
            <View style={styles.statusItem}>
              <ThemedText style={styles.statusLabel}>错误：</ThemedText>
              <ThemedText style={[styles.statusValue, { color: "#FF6B6B" }]}>{error}</ThemedText>
            </View>
          )}
        </View>
      )}
    </SettingsSection>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#888",
  },
  statusContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#2a2a2c",
    borderRadius: 8,
  },
  statusItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#ccc",
    minWidth: 80,
  },
  statusValue: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
});
