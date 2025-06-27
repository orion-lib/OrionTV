/**
 * Below are text styles used in the app, primarily in the ThemedText component.
 */

import {TextStyle} from 'react-native';

export const textStyles = function (
  scale: number,
  linkColor: string,
): {
  [key: string]: TextStyle & {fontSize: number; lineHeight: number};
} {
  return {
    default: {
      fontSize: 16 * scale,
      lineHeight: 24 * scale,
    },
    defaultSemiBold: {
      fontSize: 16 * scale,
      lineHeight: 24 * scale,
      fontWeight: '600',
    },
    title: {
      fontSize: 32 * scale,
      fontWeight: 'bold',
      lineHeight: 32 * scale,
    },
    subtitle: {
      fontSize: 20 * scale,
      lineHeight: 20 * scale,
      fontWeight: 'bold',
    },
    link: {
      lineHeight: 30 * scale,
      fontSize: 16 * scale,
      color: linkColor,
    },
  };
};
