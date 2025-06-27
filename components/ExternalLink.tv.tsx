import {Link} from 'expo-router';
import {type ComponentProps} from 'react';
import {Pressable, Linking} from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {href: string};

export function ExternalLink({href, ...rest}: Props) {
  // On TV, use a Pressable (which handles focus navigation) instead of the Link component
  return (
    <Pressable
      onPress={() =>
        Linking.openURL(href).catch((reason) => alert(`${reason}`))
      }
      style={({pressed, focused}) => ({
        opacity: pressed || focused ? 0.6 : 1.0,
      })}
    >
      {rest.children}
    </Pressable>
  );
}
