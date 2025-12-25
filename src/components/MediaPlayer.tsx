import React from 'react';
import {Platform} from 'react-native';
import Video, {VideoProperties} from 'react-native-video';
import {useMedia} from '../context/MediaContext';
import {isMedia3Available, Media3Player} from './Media3Player';

type PlayerType = 'media3' | 'legacy';

const LegacyPlayer: React.FC<VideoProperties> = props => {
  return <Video {...props} />;
};

export const MediaPlayer: React.FC<VideoProperties & {playerType?: PlayerType}> = ({
  playerType,
  ...props
}) => {
  const {preferences} = useMedia();
  const resolvedPlayer = playerType ?? preferences.player;

  if (
    resolvedPlayer === 'legacy' ||
    Platform.OS !== 'android' ||
    !isMedia3Available()
  ) {
    return <LegacyPlayer {...props} />;
  }

  return <Media3Player {...props} />;
};
