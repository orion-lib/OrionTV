import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  NativeSyntheticEvent,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {MediaPlayer} from '../components/MediaPlayer';

const PLAYER_OPTIONS = [
  {
    key: 'media3' as const,
    title: 'AndroidX Media3',
    description: '使用原生 Media3 播放器（Android）',
  },
  {
    key: 'legacy' as const,
    title: 'React Native Video',
    description: '使用 react-native-video 播放器',
  },
];

type PlayerType = (typeof PLAYER_OPTIONS)[number]['key'];

type SelectedFile = {
  uri: string;
  name?: string | null;
  size?: number | null;
};

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

const requestStoragePermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissions: string[] = [];
  const version = typeof Platform.Version === 'number' ? Platform.Version : 0;

  if (version >= 33) {
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
  } else {
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    if (version <= 32) {
      permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    }
  }

  const result = await PermissionsAndroid.requestMultiple(permissions);
  const denied = permissions.filter(
    permission => result[permission] !== PermissionsAndroid.RESULTS.GRANTED,
  );

  if (denied.length) {
    Alert.alert('权限不足', '请在系统设置中允许文件读取权限以选择本地视频。');
    return false;
  }

  return true;
};

const PlayerTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType>('media3');
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedOption, setFocusedOption] = useState<PlayerType | null>(null);
  const [focusedPicker, setFocusedPicker] = useState(false);
  const [focusedBack, setFocusedBack] = useState(false);

  const fileLabel = useMemo(() => {
    if (!file) {
      return '未选择视频文件';
    }

    return file.name ? `${file.name}` : file.uri;
  }, [file]);

  const pickVideo = useCallback(async () => {
    const hasPermission = await requestStoragePermissions();
    if (!hasPermission) {
      return;
    }

    try {
      setLoading(true);
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.video],
      });
      const resolvedUri = result.fileCopyUri ?? result.uri;
      if (!resolvedUri) {
        Alert.alert('选择失败', '未能读取视频文件，请重试。');
        return;
      }
      setFile({uri: resolvedUri, name: result.name, size: result.size});
    } catch (error) {
      if (
        !DocumentPicker.isCancel(error) &&
        !DocumentPicker.isInProgress(error)
      ) {
        Alert.alert('选择失败', '未能读取视频文件，请重试。');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Pressable
          focusable
          hasTVPreferredFocus
          onFocus={() => setFocusedBack(true)}
          onBlur={() => setFocusedBack(false)}
          onPress={() => navigation.goBack()}
          onKeyDown={event => {
            if (isSelectKey(event)) {
              navigation.goBack();
            }
          }}
          style={[styles.backButton, focusedBack && styles.focusedOutline]}>
          <Icon name="chevron-back" size={24} color="#e5e7eb" />
        </Pressable>
        <Text style={styles.title}>播放器测试</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>选择播放器</Text>
        {PLAYER_OPTIONS.map(option => (
          <Pressable
            key={option.key}
            focusable
            onFocus={() => setFocusedOption(option.key)}
            onBlur={() =>
              setFocusedOption(current =>
                current === option.key ? null : current,
              )
            }
            onPress={() => setSelectedPlayer(option.key)}
            onKeyDown={event => {
              if (isSelectKey(event)) {
                setSelectedPlayer(option.key);
              }
            }}
            style={[
              styles.option,
              selectedPlayer === option.key && styles.optionActive,
              focusedOption === option.key && styles.focusedOutline,
            ]}>
            <View style={styles.optionBody}>
              <Text style={styles.label}>{option.title}</Text>
              <Text style={styles.desc}>{option.description}</Text>
            </View>
            <Icon
              name={
                selectedPlayer === option.key
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              size={20}
              color={
                selectedPlayer === option.key ? '#5ac8fa' : '#475569'
              }
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>本地视频</Text>
        <Text style={styles.fileLabel}>{fileLabel}</Text>
        <Pressable
          focusable
          onFocus={() => setFocusedPicker(true)}
          onBlur={() => setFocusedPicker(false)}
          onPress={pickVideo}
          onKeyDown={event => {
            if (isSelectKey(event)) {
              pickVideo();
            }
          }}
          style={[
            styles.button,
            loading && styles.buttonDisabled,
            focusedPicker && styles.focusedOutline,
          ]}>
          <Text style={styles.buttonText}>
            {loading ? '读取中...' : '选择视频文件'}
          </Text>
        </Pressable>
        {file ? (
          <Text style={styles.fileMeta}>
            {file.size ? `大小：${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
          </Text>
        ) : null}
      </View>

      <View style={styles.playerCard}>
        <Text style={styles.cardTitle}>播放预览</Text>
        <View style={styles.playerWrapper}>
          {file ? (
            <MediaPlayer
              playerType={selectedPlayer}
              style={styles.video}
              source={{uri: file.uri}}
              resizeMode="contain"
              controls
            />
          ) : (
            <Text style={styles.emptyText}>请先选择本地视频文件</Text>
          )}
        </View>
      </View>

      <Text style={styles.footer}>
        播放器测试仅用于验证本地文件播放能力。首次选择文件时会申请
        读取权限。
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14', padding: 16},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#111625',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  title: {color: '#fff', fontSize: 24, fontWeight: '800'},
  card: {
    backgroundColor: '#111625',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2430',
    marginBottom: 12,
  },
  playerCard: {
    backgroundColor: '#111625',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2430',
    marginBottom: 12,
    flex: 1,
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
  focusedOutline: {
    borderColor: '#7cc0ff',
    shadowColor: '#7cc0ff',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  optionBody: {flex: 1, marginRight: 8},
  label: {color: '#fff', fontWeight: '700', fontSize: 16},
  desc: {color: '#9ca3af', marginTop: 4},
  fileLabel: {color: '#cbd5f5', marginBottom: 10},
  fileMeta: {color: '#9ca3af', marginTop: 8},
  button: {
    backgroundColor: '#1f2430',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonDisabled: {opacity: 0.6},
  buttonText: {color: '#e5e7eb', fontWeight: '700'},
  playerWrapper: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  video: {width: '100%', height: '100%'},
  emptyText: {color: '#94a3b8'},
  footer: {color: '#9ca3af', lineHeight: 20},
});

export default PlayerTestScreen;
