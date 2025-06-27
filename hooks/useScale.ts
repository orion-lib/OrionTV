import {Platform, useWindowDimensions} from 'react-native';

export function useScale(): number {
  const {width} = useWindowDimensions();
  return Platform.isTV ? width / 1000 : 1;
}
