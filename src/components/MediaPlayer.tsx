import React from 'react';
import Video, {VideoProperties} from 'react-native-video';
import {useMedia} from '../context/MediaContext';

type PlayerType = 'media3' | 'legacy';

const Media3Player: React.FC<VideoProperties> = props => {
  return <Video {...props} />;
};

const LegacyPlayer: React.FC<VideoProperties> = props => {
  return <Video {...props} />;
};

export const MediaPlayer: React.FC<VideoProperties & {playerType?: PlayerType}> = ({
  playerType,
  ...props
}) => {
  const {preferences} = useMedia();
  const resolvedPlayer = playerType ?? preferences.player;

  if (resolvedPlayer === 'legacy') {
    return <LegacyPlayer {...props} />;
  }

  return <Media3Player {...props} />;
};
