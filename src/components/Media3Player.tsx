import React from 'react';
import {Platform, StyleProp, UIManager, ViewStyle} from 'react-native';
import {requireNativeComponent} from 'react-native';
import {VideoProperties} from 'react-native-video';

type Media3Source = {
  uri?: string;
};

type Media3PlayerProps = Omit<VideoProperties, 'source'> & {
  source: Media3Source;
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch';
  controls?: boolean;
};

export const isMedia3Available = () =>
  Platform.OS === 'android' &&
  !!UIManager.getViewManagerConfig('Media3PlayerView');

let cachedNativeView:
  | ReturnType<typeof requireNativeComponent<Media3PlayerProps>>
  | null = null;

const getNativeMedia3Player = () => {
  if (!isMedia3Available()) {
    return null;
  }

  if (!cachedNativeView) {
    cachedNativeView =
      requireNativeComponent<Media3PlayerProps>('Media3PlayerView');
  }

  return cachedNativeView;
};

export const Media3Player: React.FC<Media3PlayerProps> = props => {
  const NativeMedia3Player = getNativeMedia3Player();

  if (!NativeMedia3Player) {
    return null;
  }

  return <NativeMedia3Player {...props} />;
};
