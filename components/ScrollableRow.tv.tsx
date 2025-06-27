import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import VideoCard from "./VideoCard.tv"; // Note the .tv import
import { MoonTVAPI } from "@/services/api";

export interface RowItem {
  id: string;
  source: string;
  title: string;
  poster: string;
  year?: string;
  rate?: string;
  // Add any other properties that VideoCard might need from the data item
}

interface ScrollableRowProps {
  title: string;
  data: RowItem[];
  api: MoonTVAPI;
}

export default function ScrollableRow({
  title,
  data,
  api,
}: ScrollableRowProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <VideoCard
            id={item.id}
            source={item.source}
            title={item.title}
            poster={item.poster}
            year={item.year}
            rate={item.rate}
            api={api}
          />
        )}
        keyExtractor={(item) => `${item.source}-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginLeft: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingLeft: 8,
    paddingRight: 16,
  },
});
