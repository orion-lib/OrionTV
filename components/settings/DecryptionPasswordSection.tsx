import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { View, TextInput, StyleSheet, Animated, Platform } from "react-native";
import { useTVEventHandler } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { useSettingsStore } from "@/stores/settingsStore";
import { useRemoteControlStore } from "@/stores/remoteControlStore";
import { useButtonAnimation } from "@/hooks/useAnimation";
import { Colors } from "@/constants/Colors";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface DecryptionPasswordSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
}

export interface DecryptionPasswordSectionRef {
  setInputValue: (value: string) => void;
}

export const DecryptionPasswordSection = forwardRef<DecryptionPasswordSectionRef, DecryptionPasswordSectionProps>(
  ({ onChanged, onFocus, onBlur, onPress }, ref) => {
    const { decryptionPassword, setDecryptionPassword, remoteInputEnabled } = useSettingsStore();
    const { serverUrl } = useRemoteControlStore();
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isSectionFocused, setIsSectionFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const inputAnimationStyle = useButtonAnimation(isSectionFocused, 1.01);
    const deviceType = useResponsiveLayout().deviceType;

    const handleDpChange = (dp: string) => {
      setDecryptionPassword(dp);
      onChanged();
    };

    useImperativeHandle(ref, () => ({
      setInputValue: (value: string) => {
        setDecryptionPassword(value);
        onChanged();
      },
    }));

    const handleSectionFocus = () => {
      setIsSectionFocused(true);
      onFocus?.();
    };

    const handleSectionBlur = () => {
      setIsSectionFocused(false);
      onBlur?.();
    };

    const handlePress = () => {
      inputRef.current?.focus();
      onPress?.();
    }

    const handleTVEvent = React.useCallback(
      (event: any) => {
        if (isSectionFocused && event.eventType === "select") {
          inputRef.current?.focus();
        }
      },
      [isSectionFocused]
    );

    useTVEventHandler(handleTVEvent);


        const [selection, setSelection] = useState<{ start: number; end: number }>({
          start: 0,
          end: 0,
        });
        // 当用户手动移动光标或选中文本时，同步到 state（可选）
        const onSelectionChange = ({
          nativeEvent: { selection },
        }: any) => {
          setSelection(selection);
        };

    return (
      <SettingsSection focusable onFocus={handleSectionFocus} onBlur={handleSectionBlur}
        onPress={Platform.isTV || deviceType !== 'tv' ? undefined : handlePress}
      >
        <View style={styles.inputContainer}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.sectionTitle}>M3U解密信息</ThemedText>
            {remoteInputEnabled && serverUrl && (
              <ThemedText style={styles.subtitle}>用手机访问 {serverUrl}，可远程输入，格式: password|saltHex|ivHex|iterations, 例如: mypassword|a151a5f9ced2a950|c8dd939d779d043fbbdad2ace3068d5d|1024</ThemedText>
            )}
          </View>
          <Animated.View style={inputAnimationStyle}>
            <TextInput
              ref={inputRef}
              style={[styles.input, isInputFocused && styles.inputFocused]}
              value={decryptionPassword}
              onChangeText={handleDpChange}
              placeholder="输入M3U解密信息"
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => {
                setIsInputFocused(true);
                // 将光标移动到文本末尾
                const end = decryptionPassword.length;
                setSelection({ start: end, end: end });
                // 有时需要延迟一下，让系统先完成 focus 再设置 selection
                //（在 Android 上更可靠）
                setTimeout(() => {
                  // 对于受控的 selection 已经生效，这里仅作保险
                  inputRef.current?.setNativeProps({ selection: { start: end, end: end } });
                }, 0);
              }}
              selection={selection}
              onSelectionChange={onSelectionChange} // 可选

              onBlur={() => setIsInputFocused(false)}
            // onPress={handlePress}
            />
          </Animated.View>
        </View>
      </SettingsSection>
    );
  }
);

DecryptionPasswordSection.displayName = "DecyptionPasswordSection";

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#3a3a3c",
    color: "white",
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});