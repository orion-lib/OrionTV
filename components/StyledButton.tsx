import React from "react";
import { Animated, Pressable, StyleSheet, StyleProp, ViewStyle, PressableProps, TextStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import { useResponsive } from "@/hooks/useResponsive";

interface StyledButtonProps extends PressableProps {
  children?: React.ReactNode;
  text?: string;
  variant?: "default" | "primary" | "ghost";
  isSelected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  children,
  text,
  variant = "default",
  isSelected = false,
  style,
  textStyle,
  ...rest
}) => {
  const colorScheme = "dark";
  const colors = Colors[colorScheme];
  const [isFocused, setIsFocused] = React.useState(false);
  const animationStyle = useButtonAnimation(isFocused);
  const { isMobile } = useResponsive();

  const variantStyles = {
    default: StyleSheet.create({
      button: {
        backgroundColor: colors.border,
      },
      text: {
        color: colors.text,
      },
      selectedButton: {
        backgroundColor: colors.tint,
      },
      focusedButton: {
        backgroundColor: colors.link,
        borderColor: colors.background,
      },
      selectedText: {
        color: Colors.dark.text,
      },
    }),
    primary: StyleSheet.create({
      button: {
        backgroundColor: "transparent",
      },
      text: {
        color: colors.text,
      },
      focusedButton: {
        backgroundColor: colors.link,
        borderColor: colors.background,
      },
      selectedButton: {
        backgroundColor: "rgba(0, 122, 255, 0.3)",
      },
      selectedText: {
        color: colors.link,
      },
    }),
    ghost: StyleSheet.create({
      button: {
        backgroundColor: "transparent",
      },
      text: {
        color: colors.text,
      },
      focusedButton: {
        backgroundColor: "rgba(119, 119, 119, 0.9)",
      },
      selectedButton: {},
      selectedText: {},
    }),
  };

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: isMobile ? 12 : 16,
      paddingVertical: isMobile ? 8 : 10,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: "transparent",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    focusedButton: {
      backgroundColor: colors.link,
      borderColor: colors.background,
      elevation: 5,
      shadowColor: colors.link,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 15,
    },
    selectedButton: {
      backgroundColor: colors.tint,
    },
    text: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: "500",
      color: colors.text,
    },
    selectedText: {
      color: Colors.dark.text,
    },
  });

  return (
    <Animated.View style={[animationStyle, style]}>
      <Pressable
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ focused }) => [
          styles.button,
          variantStyles[variant].button,
          isSelected && (variantStyles[variant].selectedButton ?? styles.selectedButton),
          focused && (variantStyles[variant].focusedButton ?? styles.focusedButton),
        ]}
        {...rest}
      >
        {text ? (
          <ThemedText
            style={[
              styles.text,
              variantStyles[variant].text,
              isSelected && (variantStyles[variant].selectedText ?? styles.selectedText),
              textStyle,
            ]}
          >
            {text}
          </ThemedText>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
};
