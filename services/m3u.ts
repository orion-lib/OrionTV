import Logger from '@/utils/Logger';
import { useSettingsStore } from '@/stores/settingsStore';
import { install } from 'react-native-quick-crypto';
install();
import QuickCrypto from 'react-native-quick-crypto';
import { Buffer } from '@craftzdog/react-native-buffer';

const logger = Logger.withTag('M3U');

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
}

export const decryptM3U = (encryptedText: Uint8Array, passwordStr: string): string | "" => {
  try {
    const [password, saltHex, ivHex, iterationsArg] = passwordStr.split('|');
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const iterations = parseInt(iterationsArg, 10);
    const algorithm = 'aes-256-cbc';
    const digest = 'sha256';
    const keyLen = 32 + 16;

    const derivedKey = QuickCrypto.pbkdf2Sync(password, salt, iterations, keyLen, digest);
    const aesKey = derivedKey.slice(0, 32);
    const decipher = QuickCrypto.createDecipheriv(algorithm, aesKey, iv);
    let decrypted = decipher.update(encryptedText, undefined, 'utf8').toString();
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.info("Decryption failed:", error);
    return "";
  }
}

export const parseM3U = (m3uText: string): Channel[] => {
  const parsedChannels: Channel[] = [];
  const lines = m3uText.split('\n');
  let currentChannelInfo: Partial<Channel> | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#EXTINF:')) {
      currentChannelInfo = {}; // Start a new channel
      const commaIndex = trimmedLine.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentChannelInfo.name = trimmedLine.substring(commaIndex + 1).trim();
        const attributesPart = trimmedLine.substring(8, commaIndex);
        const logoMatch = attributesPart.match(/tvg-logo="([^"]*)"/i);
        if (logoMatch && logoMatch[1]) {
          currentChannelInfo.logo = logoMatch[1];
        }
        const groupMatch = attributesPart.match(/group-title="([^"]*)"/i);
        if (groupMatch && groupMatch[1]) {
          currentChannelInfo.group = groupMatch[1];
        }
      } else {
        currentChannelInfo.name = trimmedLine.substring(8).trim();
      }
    } else if (currentChannelInfo && trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('://')) {
      currentChannelInfo.url = trimmedLine;
      currentChannelInfo.id = currentChannelInfo.url; // Use URL as ID

      // Ensure all required fields are present, providing defaults if necessary
      const finalChannel: Channel = {
        id: currentChannelInfo.id,
        url: currentChannelInfo.url,
        name: currentChannelInfo.name || 'Unknown',
        logo: currentChannelInfo.logo || '',
        group: currentChannelInfo.group || 'Default',
      };

      parsedChannels.push(finalChannel);
      currentChannelInfo = null; // Reset for the next channel
    }
  }
  return parsedChannels;
};

export const fetchAndParseM3u = async (m3uUrl: string): Promise<Channel[]> => {
  const userAgent = useSettingsStore.getState().userAgent;
  const decryptionPassword = useSettingsStore.getState().decryptionPassword;

  try {
    const response = await fetch(m3uUrl,
      userAgent ? { headers: { 'User-Agent': userAgent } } : {}
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.statusText}`);
    }

    const m3uText = decryptionPassword ? decryptM3U(new Uint8Array(await response.arrayBuffer()), decryptionPassword) : await response.text();
    
    return parseM3U(m3uText);

  } catch (error) {
    logger.info("Error fetching or parsing M3U:", error);
    return []; // Return empty array on error
  }
};

export const getPlayableUrl = (originalUrl: string | null): string | null => {
  if (!originalUrl) {
    return null;
  }
  // In React Native, we use the proxy for all http streams to avoid potential issues.
  // if (originalUrl.toLowerCase().startsWith('http://')) {
  //   // Use the baseURL from the existing api instance.
  //   if (!api.baseURL) {
  //       console.warn("API base URL is not set. Cannot create proxy URL.")
  //       return originalUrl; // Fallback to original URL
  //   }
  //   return `${api.baseURL}/proxy?url=${encodeURIComponent(originalUrl)}`;
  // }
  // HTTPS streams can be played directly.
  return originalUrl;
};
