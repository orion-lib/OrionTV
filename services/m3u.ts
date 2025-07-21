import { api } from "./api";

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
}

export const parseM3U = (m3uText: string): Channel[] => {
  const parsedChannels: Channel[] = [];
  const lines = m3uText.split('\n');
  let currentChannelInfo: Partial<Channel> | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    currentChannelInfo = { id: '', name: '', url: '', logo: '', group: '' };
    if (trimmedLine.startsWith('#EXTINF:')) {
      const commaIndex = trimmedLine.indexOf(',');
      if (commaIndex !== -1) {
        currentChannelInfo.name = trimmedLine.substring(commaIndex + 1).trim();
        const attributesPart = trimmedLine.substring(8, commaIndex);
        const logoMatch = attributesPart.match(/tvg-logo="([^"]*)"/i);
        if (logoMatch && logoMatch[1]) currentChannelInfo.logo = logoMatch[1];
        const groupMatch = attributesPart.match(/group-title="([^"]*)"/i);
        if (groupMatch && groupMatch[1]) currentChannelInfo.group = groupMatch[1];
      } else {
        currentChannelInfo.name = trimmedLine.substring(8).trim();
      }
    } else if (currentChannelInfo && trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('://')) {
      currentChannelInfo.url = trimmedLine;
      currentChannelInfo.id = currentChannelInfo.url; // Use URL as ID
      parsedChannels.push(currentChannelInfo as Channel);
    }
  }
  return parsedChannels;
};

export const fetchAndParseM3u = async (m3uUrl: string): Promise<Channel[]> => {
  try {
    const response = await fetch(m3uUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.statusText}`);
    }
    const m3uText = await response.text();
    return parseM3U(m3uText);
  } catch (error) {
    console.info("Error fetching or parsing M3U:", error);
    return []; // Return empty array on error
  }
};

export const getPlayableUrl = (originalUrl: string | null): string | null => {
  if (!originalUrl) {
    return null;
  }
  // In React Native, we use the proxy for all http streams to avoid potential issues.
  if (originalUrl.toLowerCase().startsWith('http://')) {
    // Use the baseURL from the existing api instance.
    if (!api.baseURL) {
        console.warn("API base URL is not set. Cannot create proxy URL.")
        return originalUrl; // Fallback to original URL
    }
    return `${api.baseURL}/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  // HTTPS streams can be played directly.
  return originalUrl;
};
