import {
  StyleSheet,
  Text,
  View,
  useTVEventHandler,
  Platform,
  Pressable,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import {useState} from 'react';

import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useScale} from '@/hooks/useScale';
import {useThemeColor} from '@/hooks/useThemeColor';

export function EventHandlingDemo() {
  const [remoteEventLog, setRemoteEventLog] = useState<string[]>([]);
  const [pressableEventLog, setPressableEventLog] = useState<string[]>([]);

  const logWithAppendedEntry = (log: string[], entry: string) => {
    const limit = 3;
    const newEventLog = log.slice(0, limit - 1);
    newEventLog.unshift(entry);
    return newEventLog;
  };

  const updatePressableLog = (entry: string) => {
    setPressableEventLog((log) => logWithAppendedEntry(log, entry));
  };

  useTVEventHandler((event) => {
    const {eventType, eventKeyAction} = event;
    if (eventType !== 'focus' && eventType !== 'blur') {
      setRemoteEventLog((log) =>
        logWithAppendedEntry(
          log,
          `type=${eventType}, action=${
            eventKeyAction !== undefined ? eventKeyAction : ''
          }`,
        ),
      );
    }
  });

  const styles = useDemoStyles();

  return (
    <ThemedView style={styles.container}>
      <PressableButton title="Pressable" log={updatePressableLog} />
      <TouchableOpacityButton
        title="TouchableOpacity"
        log={updatePressableLog}
      />
      <TouchableHighlightButton
        title="TouchableHighlight"
        log={updatePressableLog}
      />
      {Platform.OS === 'android' ? (
        <TouchableNativeFeedbackButton
          title="TouchableNativeFeedback"
          log={updatePressableLog}
        />
      ) : null}

      <ThemedView style={styles.logContainer}>
        <View>
          <ThemedText type="defaultSemiBold">Focus/press events</ThemedText>
          <ThemedText style={styles.logText}>
            {remoteEventLog.join('\n')}
          </ThemedText>
        </View>
        <View>
          <ThemedText type="defaultSemiBold">Remote control events</ThemedText>
          <ThemedText style={styles.logText}>
            {pressableEventLog.join('\n')}
          </ThemedText>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const PressableButton = (props: {
  title: string;
  log: (entry: string) => void;
}) => {
  const styles = useDemoStyles();

  return (
    <Pressable
      onFocus={() => props.log(`${props.title} focus`)}
      onBlur={() => props.log(`${props.title} blur`)}
      onPress={() => props.log(`${props.title} pressed`)}
      onLongPress={(event: GestureResponderEvent & {eventKeyAction?: number}) =>
        props.log(
          `${props.title} long press ${
            event.eventKeyAction === 0 ? 'start' : 'end'
          }`,
        )
      }
      style={({pressed, focused}) =>
        pressed || focused ? styles.pressableFocused : styles.pressable
      }
    >
      {({focused}) => {
        return (
          <ThemedText style={styles.pressableText}>
            {focused ? `${props.title} focused` : props.title}
          </ThemedText>
        );
      }}
    </Pressable>
  );
};

const TouchableOpacityButton = (props: {
  title: string;
  log: (entry: string) => void;
}) => {
  const styles = useDemoStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={styles.pressable}
      onFocus={() => props.log(`${props.title} focus`)}
      onBlur={() => props.log(`${props.title} blur`)}
      onPress={() => props.log(`${props.title} pressed`)}
      onLongPress={(event: GestureResponderEvent & {eventKeyAction?: number}) =>
        props.log(
          `${props.title} long press ${
            event.eventKeyAction === 0 ? 'start' : 'end'
          }`,
        )
      }
    >
      <Text style={styles.pressableText}>{props.title}</Text>
    </TouchableOpacity>
  );
};

const TouchableHighlightButton = (props: {
  title: string;
  log: (entry: string) => void;
}) => {
  const styles = useDemoStyles();
  const underlayColor = useThemeColor({}, 'tint');

  return (
    <TouchableHighlight
      style={styles.pressable}
      underlayColor={underlayColor}
      onFocus={() => props.log(`${props.title} focus`)}
      onBlur={() => props.log(`${props.title} blur`)}
      onPress={() => props.log(`${props.title} pressed`)}
      onLongPress={(event: GestureResponderEvent & {eventKeyAction?: number}) =>
        props.log(
          `${props.title} long press ${
            event.eventKeyAction === 0 ? 'start' : 'end'
          }`,
        )
      }
    >
      <Text style={styles.pressableText}>{props.title}</Text>
    </TouchableHighlight>
  );
};

const TouchableNativeFeedbackButton = (props: {
  title: string;
  log: (entry: string) => void;
}) => {
  const styles = useDemoStyles();

  return (
    <TouchableNativeFeedback
      background={TouchableNativeFeedback.SelectableBackground()}
      onFocus={() => props.log(`${props.title} focus`)}
      onBlur={() => props.log(`${props.title} blur`)}
      onPress={() => props.log(`${props.title} pressed`)}
      onLongPress={(event: GestureResponderEvent & {eventKeyAction?: number}) =>
        props.log(
          `${props.title} long press ${
            event.eventKeyAction === 0 ? 'start' : 'end'
          }`,
        )
      }
    >
      <View style={styles.pressable}>
        <Text style={styles.pressableText}>{props.title}</Text>
      </View>
    </TouchableNativeFeedback>
  );
};

const useDemoStyles = function () {
  const scale = useScale();
  const highlightColor = useThemeColor({}, 'link');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logContainer: {
      flexDirection: 'row',
      padding: 5 * scale,
      margin: 5 * scale,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    logText: {
      height: 100 * scale,
      width: 200 * scale,
      fontSize: 10 * scale,
      margin: 5 * scale,
      alignSelf: 'flex-start',
      justifyContent: 'flex-start',
    },
    pressable: {
      borderColor: highlightColor,
      backgroundColor: textColor,
      borderWidth: 1,
      borderRadius: 5 * scale,
      margin: 5 * scale,
    },
    pressableFocused: {
      borderColor: highlightColor,
      backgroundColor: tintColor,
      borderWidth: 1,
      borderRadius: 5 * scale,
      margin: 5 * scale,
    },
    pressableText: {
      color: backgroundColor,
      fontSize: 15 * scale,
    },
  });
};
