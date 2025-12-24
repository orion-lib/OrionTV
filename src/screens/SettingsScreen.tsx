import React, {useCallback, useRef, useState} from 'react';
import {
  NativeSyntheticEvent,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useMedia} from '../context/MediaContext';

type KeyEvent = NativeSyntheticEvent<{keyCode?: number; key?: string}>;

const isSelectKey = (event: KeyEvent) => {
  const keyCode = event.nativeEvent.keyCode;
  const key = event.nativeEvent.key;
  return (
    keyCode === 23 ||
    keyCode === 66 ||
    key === 'Enter' ||
    key === ' ' ||
    key === 'Select'
  );
};

const isLeftKey = (event: KeyEvent) => event.nativeEvent.keyCode === 21;
const isRightKey = (event: KeyEvent) => event.nativeEvent.keyCode === 22;

interface OptionProps {
  title: string;
  description: string;
  active: boolean;
  onPress: () => void;
  onFocus?: () => void;
  hasPreferredFocus?: boolean;
}

const PreferenceOption: React.FC<OptionProps> = ({
  title,
  description,
  active,
  onPress,
  onFocus,
  hasPreferredFocus,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={hasPreferredFocus}
      onFocus={() => {
        setFocused(true);
        onFocus?.();
      }}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      onKeyDown={event => {
        if (isSelectKey(event)) {
          onPress();
        }
      }}
      style={[
        styles.option,
        active && styles.optionActive,
        focused && styles.optionFocused,
      ]}>
      <View style={styles.optionBody}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      {active ? (
        <Icon name="checkmark-circle" size={20} color="#5ac8fa" />
      ) : (
        <Icon name="ellipse-outline" size={20} color="#475569" />
      )}
    </Pressable>
  );
};

interface ToggleProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  onFocus?: () => void;
  hasPreferredFocus?: boolean;
}

const ToggleRow: React.FC<ToggleProps> = ({
  title,
  description,
  value,
  onToggle,
  onFocus,
  hasPreferredFocus,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={hasPreferredFocus}
      onFocus={() => {
        setFocused(true);
        onFocus?.();
      }}
      onBlur={() => setFocused(false)}
      onPress={onToggle}
      onKeyDown={event => {
        if (isSelectKey(event) || isLeftKey(event) || isRightKey(event)) {
          onToggle();
        }
      }}
      style={[styles.toggleRow, focused && styles.optionFocused]}>
      <View>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <View style={[styles.togglePill, value && styles.togglePillActive]}>
        <Text style={[styles.toggleText, value && styles.toggleTextActive]}>
          {value ? '开' : '关'}
        </Text>
      </View>
    </Pressable>
  );
};

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  onFocus?: () => void;
  hasPreferredFocus?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  onFocus,
  hasPreferredFocus,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      focusable
      hasTVPreferredFocus={hasPreferredFocus}
      onFocus={() => {
        setFocused(true);
        onFocus?.();
      }}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      onKeyDown={event => {
        if (isSelectKey(event)) {
          onPress();
        }
      }}
      style={[styles.button, focused && styles.optionFocused]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
};

const SettingsScreen: React.FC = () => {
  const {preferences, updatePreferences, clearFavorites} = useMedia();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const registerOffset = useCallback((key: string) => {
    return (event: {nativeEvent: {layout: {y: number}}}) => {
      sectionOffsets.current[key] = event.nativeEvent.layout.y;
    };
  }, []);

  const scrollToSection = useCallback((key: string) => {
    const y = sectionOffsets.current[key];
    if (y === undefined) {
      return;
    }
    scrollRef.current?.scrollTo({y: Math.max(y - 24, 0), animated: true});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>设置</Text>

        <View style={styles.card} onLayout={registerOffset('player')}>
          <Text style={styles.cardTitle}>播放器</Text>
          <PreferenceOption
            title="AndroidX Media3（默认）"
            description="仅 Android 使用 androidx/media 播放"
            active={preferences.player === 'media3'}
            onPress={() => updatePreferences({player: 'media3'})}
            onFocus={() => scrollToSection('player')}
            hasPreferredFocus
          />
          <PreferenceOption
            title="内置播放器（可选）"
            description="继续使用当前 React Native 播放器"
            active={preferences.player === 'legacy'}
            onPress={() => updatePreferences({player: 'legacy'})}
            onFocus={() => scrollToSection('player')}
          />
        </View>

        <View style={styles.card} onLayout={registerOffset('playback')}>
          <ToggleRow
            title="自动播放下一集"
            description="播放完成后自动进入下一条视频"
            value={preferences.autoplayNext}
            onToggle={() =>
              updatePreferences({autoplayNext: !preferences.autoplayNext})
            }
            onFocus={() => scrollToSection('playback')}
          />
          <View style={styles.separator} />
          <ToggleRow
            title="保持屏幕常亮"
            description="播放时阻止设备休眠"
            value={preferences.keepScreenOn}
            onToggle={() =>
              updatePreferences({keepScreenOn: !preferences.keepScreenOn})
            }
            onFocus={() => scrollToSection('playback')}
          />
        </View>

        <View style={styles.card} onLayout={registerOffset('actions')}>
          <ActionButton
            label="播放器测试（本地文件）"
            onPress={() => navigation.navigate('PlayerTest' as never)}
            onFocus={() => scrollToSection('actions')}
          />
          <ActionButton
            label="清空全部收藏"
            onPress={clearFavorites}
            onFocus={() => scrollToSection('actions')}
          />
          <ActionButton
            label="检查更新（示例）"
            onPress={() => {}}
            onFocus={() => scrollToSection('actions')}
          />
        </View>

        <Text style={styles.footer}>
          这是一个纯 React Native 构建的示例项目，移除了 Expo
          依赖，提供导航、播放、收藏、搜索与直播的基本体验。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14'},
  scrollContent: {padding: 16, paddingBottom: 28},
  title: {color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 12},
  card: {
    backgroundColor: '#111625',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2430',
    marginBottom: 12,
  },
  cardTitle: {color: '#e5e7eb', fontWeight: '700', marginBottom: 8},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: '#5ac8fa',
    backgroundColor: '#111c2d',
  },
  optionFocused: {
    borderColor: '#7cc0ff',
    shadowColor: '#7cc0ff',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  optionBody: {flex: 1, marginRight: 8},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {color: '#fff', fontWeight: '700', fontSize: 16},
  desc: {color: '#9ca3af', marginTop: 4},
  separator: {
    height: 1,
    backgroundColor: '#1f2430',
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#1f2430',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {color: '#e5e7eb', fontWeight: '700', textAlign: 'center'},
  togglePill: {
    minWidth: 46,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#1f2430',
  },
  togglePillActive: {
    backgroundColor: '#1a2638',
    borderWidth: 1,
    borderColor: '#5ac8fa',
  },
  toggleText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 12,
  },
  toggleTextActive: {
    color: '#5ac8fa',
  },
  footer: {color: '#9ca3af', marginTop: 8, lineHeight: 20},
});

export default SettingsScreen;
