import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, Modal, useTVEventHandler, HWEvent, Text } from "react-native";
import LivePlayer from "@/components/LivePlayer";
import { fetchAndParseM3u, getPlayableUrl, Channel } from "@/services/m3u";
import { ThemedView } from "@/components/ThemedView";
import { StyledButton } from "@/components/StyledButton";
import { useSettingsStore } from "@/stores/settingsStore";

export default function LiveScreen() {
  const { m3uUrl } = useSettingsStore();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [groupedChannels, setGroupedChannels] = useState<Record<string, Channel[]>>({});
  const [channelGroups, setChannelGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isChannelListVisible, setIsChannelListVisible] = useState(false);
  const [channelTitle, setChannelTitle] = useState<string | null>(null);
  const titleTimer = useRef<NodeJS.Timeout | null>(null);

  const selectedChannelUrl = channels.length > 0 ? getPlayableUrl(channels[currentChannelIndex].url) : null;

  useEffect(() => {
    const loadChannels = async () => {
      if (!m3uUrl) return;
      setIsLoading(true);
      const parsedChannels = await fetchAndParseM3u(m3uUrl);
      setChannels(parsedChannels);

      const groups: Record<string, Channel[]> = parsedChannels.reduce((acc, channel) => {
        const groupName = channel.group || "Other";
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(channel);
        return acc;
      }, {} as Record<string, Channel[]>);

      const groupNames = Object.keys(groups);
      setGroupedChannels(groups);
      setChannelGroups(groupNames);
      setSelectedGroup(groupNames[0] || "");

      if (parsedChannels.length > 0) {
        showChannelTitle(parsedChannels[0].name);
      }
      setIsLoading(false);
    };
    loadChannels();
  }, [m3uUrl]);

  const showChannelTitle = (title: string) => {
    setChannelTitle(title);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => setChannelTitle(null), 3000);
  };

  const handleSelectChannel = (channel: Channel) => {
    const globalIndex = channels.findIndex((c) => c.id === channel.id);
    if (globalIndex !== -1) {
      setCurrentChannelIndex(globalIndex);
      showChannelTitle(channel.name);
      setIsChannelListVisible(false);
    }
  };

  const changeChannel = useCallback(
    (direction: "next" | "prev") => {
      if (channels.length === 0) return;
      let newIndex =
        direction === "next"
          ? (currentChannelIndex + 1) % channels.length
          : (currentChannelIndex - 1 + channels.length) % channels.length;
      setCurrentChannelIndex(newIndex);
      showChannelTitle(channels[newIndex].name);
    },
    [channels, currentChannelIndex]
  );

  const handleTVEvent = useCallback(
    (event: HWEvent) => {
      if (isChannelListVisible) return;
      if (event.eventType === "down") setIsChannelListVisible(true);
      else if (event.eventType === "left") changeChannel("prev");
      else if (event.eventType === "right") changeChannel("next");
    },
    [changeChannel, isChannelListVisible]
  );

  useTVEventHandler(handleTVEvent);

  return (
    <ThemedView style={styles.container}>
      <LivePlayer streamUrl={selectedChannelUrl} channelTitle={channelTitle} onPlaybackStatusUpdate={() => {}} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isChannelListVisible}
        onRequestClose={() => setIsChannelListVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择频道</Text>
            <View style={styles.listContainer}>
              <View style={styles.groupColumn}>
                <FlatList
                  data={channelGroups}
                  keyExtractor={(item, index) => `group-${item}-${index}`}
                  renderItem={({ item }) => (
                    <StyledButton
                      text={item}
                      onPress={() => setSelectedGroup(item)}
                      isSelected={selectedGroup === item}
                      style={styles.groupButton}
                      textStyle={styles.groupButtonText}
                    />
                  )}
                />
              </View>
              <View style={styles.channelColumn}>
                {isLoading ? (
                  <ActivityIndicator size="large" />
                ) : (
                  <FlatList
                    data={groupedChannels[selectedGroup] || []}
                    keyExtractor={(item, index) => `${item.id}-${item.group}-${index}`}
                    renderItem={({ item }) => (
                      <StyledButton
                        text={item.name || "Unknown Channel"}
                        onPress={() => handleSelectChannel(item)}
                        isSelected={channels[currentChannelIndex]?.id === item.id}
                        hasTVPreferredFocus={channels[currentChannelIndex]?.id === item.id}
                        style={styles.channelItem}
                        textStyle={styles.channelItemText}
                      />
                    )}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  modalContent: {
    width: 450,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    padding: 15,
  },
  modalTitle: {
    color: "white",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    flexDirection: "row",
  },
  groupColumn: {
    flex: 1,
    marginRight: 10,
  },
  channelColumn: {
    flex: 2,
  },
  groupButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginVertical: 4,
    paddingLeft: 10,
    paddingRight: 10,
  },
  groupButtonText: {
    fontSize: 13,
  },
  channelItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginVertical: 3,
    paddingLeft: 16,
    paddingRight: 16,
  },
  channelItemText: {
    fontSize: 12,
  },
});
