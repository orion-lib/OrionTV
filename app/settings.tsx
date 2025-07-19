import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useTVEventHandler } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyledButton } from "@/components/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSettingsStore } from "@/stores/settingsStore";
// import useAuthStore from "@/stores/authStore";
import { useRemoteControlStore } from "@/stores/remoteControlStore";
import { APIConfigSection } from "@/components/settings/APIConfigSection";
import { LiveStreamSection } from "@/components/settings/LiveStreamSection";
import { RemoteInputSection } from "@/components/settings/RemoteInputSection";
// import { VideoSourceSection } from "@/components/settings/VideoSourceSection";
import Toast from "react-native-toast-message";

export default function SettingsScreen() {
  const { loadSettings, saveSettings, setApiBaseUrl, setM3uUrl } = useSettingsStore();
  const { lastMessage } = useRemoteControlStore();
  const backgroundColor = useThemeColor({}, "background");

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const saveButtonRef = useRef<any>(null);
  const apiSectionRef = useRef<any>(null);
  const liveStreamSectionRef = useRef<any>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (lastMessage) {
      const realMessage = lastMessage.split("_")[0];
      handleRemoteInput(realMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);

  const handleRemoteInput = (message: string) => {
    // Handle remote input based on currently focused section
    if (currentSection === "api" && apiSectionRef.current) {
      // API Config Section
      setApiBaseUrl(message);
    } else if (currentSection === "livestream" && liveStreamSectionRef.current) {
      // Live Stream Section
      setM3uUrl(message);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveSettings();
      setHasChanges(false);
      Toast.show({
        type: "success",
        text1: "保存成功",
      });
    } catch {
      Alert.alert("错误", "保存设置失败");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsChanged = () => {
    setHasChanges(true);
  };

  const sections = [
    {
      component: (
        <RemoteInputSection
          onChanged={markAsChanged}
          onFocus={() => {
            setCurrentFocusIndex(0);
            setCurrentSection("remote");
          }}
        />
      ),
      key: "remote",
    },
    {
      component: (
        <APIConfigSection
          ref={apiSectionRef}
          onChanged={markAsChanged}
          onFocus={() => {
            setCurrentFocusIndex(1);
            setCurrentSection("api");
          }}
        />
      ),
      key: "api",
    },
    {
      component: (
        <LiveStreamSection
          ref={liveStreamSectionRef}
          onChanged={markAsChanged}
          onFocus={() => {
            setCurrentFocusIndex(2);
            setCurrentSection("livestream");
          }}
        />
      ),
      key: "livestream",
    },
    // {
    //   component: (
    //     <VideoSourceSection
    //       onChanged={markAsChanged}
    //       onFocus={() => {
    //         setCurrentFocusIndex(3);
    //         setCurrentSection("videoSource");
    //       }}
    //     />
    //   ),
    //   key: "videoSource",
    // },
  ];

  // TV遥控器事件处理
  const handleTVEvent = React.useCallback(
    (event: any) => {
      if (event.eventType === "down") {
        const nextIndex = Math.min(currentFocusIndex + 1, sections.length);
        setCurrentFocusIndex(nextIndex);
        if (nextIndex === sections.length) {
          saveButtonRef.current?.focus();
        }
      } else if (event.eventType === "up") {
        const prevIndex = Math.max(currentFocusIndex - 1, 0);
        setCurrentFocusIndex(prevIndex);
      }
    },
    [currentFocusIndex, sections.length]
  );

  useTVEventHandler(handleTVEvent);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>设置</ThemedText>
        </View>

        <View style={styles.scrollView}>
          <FlatList
            data={sections}
            renderItem={({ item }) => item.component}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.footer}>
          <StyledButton
            text={isLoading ? "保存中..." : "保存设置"}
            onPress={handleSave}
            variant="primary"
            disabled={!hasChanges || isLoading}
            style={[styles.saveButton, (!hasChanges || isLoading) && styles.disabledButton]}
          />
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: 24,
  },
  backButton: {
    minWidth: 100,
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    paddingTop: 12,
    alignItems: "flex-end",
  },
  saveButton: {
    minHeight: 50,
    width: 120,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
