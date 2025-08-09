import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface CustomScrollViewProps {
  data: any[];
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactNode;
  numColumns?: number;
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  onEndReached?: () => void;
  loadMoreThreshold?: number;
  emptyMessage?: string;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const { width } = Dimensions.get("window");

const CustomScrollView: React.FC<CustomScrollViewProps> = ({
  data,
  renderItem,
  numColumns = 1,
  loading = false,
  loadingMore = false,
  error = null,
  onEndReached,
  loadMoreThreshold = 200,
  emptyMessage = "暂无内容",
  ListFooterComponent,
}) => {
  // 简化布局计算 - 让每个item自动填充可用空间
  const getItemWidth = () => {
    const containerPadding = 32; // 容器左右内边距
    const itemMargin = 16; // 每个item的总margin (left + right)
    const availableWidth = width - containerPadding;
    const itemWidth = (availableWidth - (itemMargin * numColumns)) / numColumns;
    return Math.max(120, itemWidth); // 确保最小宽度120
  };
  
  const ITEM_WIDTH = getItemWidth();

  const handleScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: any }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - loadMoreThreshold;

      if (isCloseToBottom && !loadingMore && onEndReached) {
        onEndReached();
      }
    },
    [onEndReached, loadingMore, loadMoreThreshold]
  );

  const renderFooter = () => {
    if (ListFooterComponent) {
      if (React.isValidElement(ListFooterComponent)) {
        return ListFooterComponent;
      } else if (typeof ListFooterComponent === "function") {
        const Component = ListFooterComponent as React.ComponentType<any>;
        return <Component />;
      }
      return null;
    }
    if (loadingMore) {
      return <ActivityIndicator style={{ marginVertical: 20 }} size="large" />;
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText type="subtitle" style={{ padding: 10 }}>
          {error}
        </ThemedText>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>{emptyMessage}</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContent} onScroll={handleScroll} scrollEventThrottle={16}>
      {data.length > 0 ? (
        <>
          {/* Render content in a grid layout */}
          {Array.from({ length: Math.ceil(data.length / numColumns) }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.rowContainer}>
              {data.slice(rowIndex * numColumns, (rowIndex + 1) * numColumns).map((item, index) => (
                <View key={index} style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
                  {renderItem({ item, index: rowIndex * numColumns + index })}
                </View>
              ))}
              {/* 填充空白项，确保最后一行对齐 */}
              {rowIndex === Math.ceil(data.length / numColumns) - 1 &&
               data.length % numColumns !== 0 &&
               Array.from({ length: numColumns - (data.length % numColumns) }).map((_, emptyIndex) => (
                 <View key={`empty-${emptyIndex}`} style={[styles.itemContainer, { width: ITEM_WIDTH }]} />
               ))
              }
            </View>
          ))}
          {renderFooter()}
        </>
      ) : (
        <View style={styles.centerContainer}>
          <ThemedText>{emptyMessage}</ThemedText>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    paddingTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // 左对齐，避免不均匀分布
    marginBottom: 16,
  },
  itemContainer: {
    marginHorizontal: 8,
    alignItems: "center",
    // 移除flex: 1，使用固定宽度
  },
});

export default CustomScrollView;
