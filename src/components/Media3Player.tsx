import React from 'react';
import {Platform, StyleProp, ViewStyle} from 'react-native';
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

const NativeMedia3Player =
  Platform.OS === 'android'
    ? requireNativeComponent<Media3PlayerProps>('Media3PlayerView')
    : null;

export const Media3Player: React.FC<Media3PlayerProps> = props => {
  if (!NativeMedia3Player) {
    return null;
  }

  return <NativeMedia3Player {...props} />;
};
