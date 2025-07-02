import React from "react";
import {
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  PressableProps,
} from "react-native";

interface DetailButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const DetailButton: React.FC<DetailButtonProps> = ({
  children,
  style,
  ...rest
}) => {
  return (
    <Pressable
      style={({ focused }) => [
        styles.button,
        style,
        focused && styles.buttonFocused,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 5,
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  buttonFocused: {
    backgroundColor: "#0056b3",
    borderColor: "#fff",
    elevation: 5,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
});
