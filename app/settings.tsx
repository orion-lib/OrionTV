import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyledButton } from "@/components/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSettingsStore } from "@/stores/settingsStore";
import { useRemoteControlStore } from "@/stores/remoteControlStore";
import { APIConfigSection } from "@/components/settings/APIConfigSection";
import { LiveStreamSection } from "@/components/settings/LiveStreamSection";
import { RemoteInputSection } from "@/components/settings/RemoteInputSection";
import { UpdateSection } from "@/components/settings/UpdateSection";
import { AdFilterSection } from "@/components/settings/AdFilterSection";
import Toast from "react-native-toast-message";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { getCommonResponsiveStyles } from "@/utils/ResponsiveStyles";
import ResponsiveNavigation from "@/components/navigation/ResponsiveNavigation";
import ResponsiveHeader from "@/components/navigation/ResponsiveHeader";
import { DeviceUtils } from "@/utils/DeviceUtils";

// 安全地获取 useTVEventHandler，避免在部分环境中因 Hook 不存在而崩溃
const TVEventHook = (() => {
  try {
    return require("react-native");
  } catch {
    return {};
  }
})();
const useTVEventHandler = TVEventHook.useTVEventHandler || (() => {});

type SectionItem = {
  component: React.ReactElement;
  key: string;
};

/** 过滤掉 false/undefined，帮 TypeScript 推断出真正的数组元素类型 */
function isSectionItem(
  item: false | undefined | SectionItem
): item is SectionItem {
  return !!item;
}

export default function SettingsScreen() {
  const { loadSettings, saveSettings, setApiBaseUrl, setM3uUrl } = useSettingsStore();
  const { lastMessage, targetPage, clearMessage } = useRemoteControlStore();
  const backgroundColor = useThemeColor({}, "background");
  const insets = useSafeAreaInsets();

  // 响应式布局配置
  const responsiveConfig = useResponsiveLayout();
  const commonStyles = getCommonResponsiveStyles(responsiveConfig);
  const { deviceType, spacing } = responsiveConfig;

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
    if (lastMessage && !targetPage) {
      const realMessage = lastMessage.split("_")[0];
      handleRemoteInput(realMessage);
      clearMessage(); // 处理完成后清除消息
      markAsChanged();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage, targetPage]);

  const handleRemoteInput = (message: string) => {
    // 根据当前焦点区域处理遥控器输入
    if (currentSection === "api" && apiSectionRef.current) {
      // API 配置区域
      setApiBaseUrl(message);
    } else if (currentSection === "livestream" && liveStreamSectionRef.current) {
      // 直播源区域
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
    } catch (error) {
      logger.error("保存设置失败:", error);
      Alert.alert("错误", "保存设置失败");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsChanged = () => {
    setHasChanges(true);
  };

  const rawSections = [
    deviceType !== "mobile" && {
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
          hideDescription={deviceType === "mobile"}
          onFocus={() => {
            setCurrentFocusIndex(1);
            setCurrentSection("api");
          }}
        />
      ),
      key: "api",
    },
    deviceType !== "mobile" && {
      component: (
        <LiveStreamSection
          ref={liveStreamSectionRef}
          onChanged={markAsChanged}
          onFocus={() => {
            setCurrentFocusIndex(3);
            setCurrentSection("livestream");
          }}
        />
      ),
      key: "livestream",
    },
    {
      component: (
        <AdFilterSection
          onChanged={markAsChanged}
          onFocus={() => {
            setCurrentFocusIndex(4);
            setCurrentSection("adfilter");
          }}
        />
      ),
      key: "adfilter",
    },
    Platform.OS === "android" && {
      component: <UpdateSection />,
      key: "update",
    },
  ] as const;
  const sections: SectionItem[] = rawSections.filter(isSectionItem);

  // TV遥控器事件处理 - 仅在TV设备上启用
  const handleTVEvent = React.useCallback(
    (event: any) => {
      if (deviceType !== "tv") return;

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
    [currentFocusIndex, sections.length, deviceType]
  );

  useTVEventHandler(deviceType === "tv" ? handleTVEvent : () => {});

  // 动态样式
  const dynamicStyles = createResponsiveStyles(deviceType, spacing, insets);

  const renderSettingsContent = () => (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor }}
    >
      <ThemedView style={[commonStyles.container, dynamicStyles.container]}>
        {deviceType === "tv" && (
          <View style={dynamicStyles.header}>
            <ThemedText style={dynamicStyles.title}>设置</ThemedText>
          </View>
        )}

        <View style={dynamicStyles.scrollView}>
          {sections.map(item => (
            <View key={item.key} style={dynamicStyles.itemWrapper}>
              {item.component}
            </View>
          ))}
        </View>

        <View style={dynamicStyles.footer}>
          <StyledButton
            ref={saveButtonRef}
            text={isLoading ? "保存中..." : "保存设置"}
            onPress={handleSave}
            variant="primary"
            disabled={!hasChanges || isLoading}
            style={[dynamicStyles.saveButton, (!hasChanges || isLoading) && dynamicStyles.disabledButton]}
          />
        </View>
      </ThemedView>
    </ScrollView>
  );

  // 根据设备类型决定是否包装在响应式导航中
  if (deviceType === "tv") {
    return renderSettingsContent();
  }

  return (
    <ResponsiveNavigation>
      <ResponsiveHeader title="设置" showBackButton />
      {renderSettingsContent()}
    </ResponsiveNavigation>
  );
}

const createResponsiveStyles = (deviceType: string, spacing: number, insets: any) => {
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isTV = deviceType === "tv";
  const minTouchTarget = DeviceUtils.getMinTouchTargetSize();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing,
      paddingTop: isTV ? spacing * 2 : isMobile ? insets.top + spacing : insets.top + spacing * 1.5,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing,
    },
    title: {
      fontSize: isMobile ? 24 : isTablet ? 28 : 32,
      fontWeight: "bold",
      paddingTop: spacing,
      color: "white",
    },
    scrollView: {
      flex: 1,
    },
    listContent: {
      paddingBottom: spacing,
    },
    footer: {
      paddingTop: spacing,
      alignItems: isMobile ? "center" : "flex-end",
    },
    saveButton: {
      minHeight: isMobile ? minTouchTarget : isTablet ? 50 : 50,
      width: isMobile ? "100%" : isTablet ? 140 : 120,
      maxWidth: isMobile ? 280 : undefined,
    },
    disabledButton: {
      opacity: 0.5,
    },
    itemWrapper: {
      marginBottom: spacing,
    },
  });
};
