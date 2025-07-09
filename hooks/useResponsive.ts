import { useState, useEffect } from "react";
import { Dimensions, Platform } from "react-native";

const isMobile = Platform.OS === "android" || Platform.OS === "ios";

interface ResponsiveInfo {
  isMobile: boolean;
  screenWidth: number;
  numColumns: (itemWidth: number, gap?: number) => number;
}

export function useResponsive(): ResponsiveInfo {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const onChange = (result: { window: { width: number } }) => {
      setScreenWidth(result.window.width);
    };

    const subscription = Dimensions.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const calculateNumColumns = (itemWidth: number, gap: number = 16) => {
    if (!isMobile) {
      // For TV, you might want a fixed number or a different logic
      return 5;
    }
    const containerPadding = 16; // Horizontal padding of the container
    const availableWidth = screenWidth - containerPadding * 2;
    const num = Math.floor(availableWidth / (itemWidth + gap));
    return Math.max(1, num); // Ensure at least one column
  };

  return {
    isMobile,
    screenWidth,
    numColumns: calculateNumColumns,
  };
}
