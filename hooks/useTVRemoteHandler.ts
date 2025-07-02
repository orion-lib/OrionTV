import { useState, useEffect, useRef } from "react";
import { useTVEventHandler } from "react-native";

interface TVRemoteHandlerProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  showEpisodeModal: boolean;
  onPlayPause: () => void;
  onSeek: (forward: boolean) => void;
  onShowEpisodes: () => void;
  onPlayNextEpisode: () => void;
}

const focusGraph: Record<string, Record<string, string>> = {
  skipBack: { right: "playPause" },
  playPause: { left: "skipBack", right: "nextEpisode" },
  nextEpisode: { left: "playPause", right: "skipForward" },
  skipForward: { left: "nextEpisode", right: "episodes" },
  episodes: { left: "skipForward" },
};

export const useTVRemoteHandler = ({
  showControls,
  setShowControls,
  showEpisodeModal,
  onPlayPause,
  onSeek,
  onShowEpisodes,
  onPlayNextEpisode,
}: TVRemoteHandlerProps) => {
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  const actionMap: Record<string, () => void> = {
    playPause: onPlayPause,
    skipBack: () => onSeek(false),
    skipForward: () => onSeek(true),
    nextEpisode: onPlayNextEpisode,
    episodes: onShowEpisodes,
  };

  // Centralized timer logic driven by state changes.
  useEffect(() => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }

    // Only set a timer to hide controls if they are shown AND no element is focused.
    if (showControls && currentFocus === null) {
      controlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }

    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, [showControls, currentFocus]);

  useTVEventHandler((event) => {
    if (showEpisodeModal) {
      return;
    }

    // If controls are hidden, the first interaction will just show them.
    if (!showControls) {
      if (["up", "down", "left", "right", "select"].includes(event.eventType)) {
        setShowControls(true);
      }
      return;
    }

    // --- Event handling when controls are visible ---

    if (currentFocus === null) {
      // When no specific element is focused on the control bar
      switch (event.eventType) {
        case "left":
          onSeek(false);
          break;
        case "right":
          onSeek(true);
          break;
        case "select":
          onPlayPause();
          break;
        case "down":
          setCurrentFocus("playPause");
          break;
      }
    } else {
      // When an element on the control bar is focused
      switch (event.eventType) {
        case "left":
        case "right":
          const nextFocus = focusGraph[currentFocus]?.[event.eventType];
          if (nextFocus) {
            setCurrentFocus(nextFocus);
          }
          break;
        case "up":
          setCurrentFocus(null);
          break;
        case "select":
          actionMap[currentFocus]?.();
          break;
      }
    }
  });

  return { currentFocus, setCurrentFocus };
};
