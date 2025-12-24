import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useMedia} from '../context/MediaContext';

const SettingsScreen: React.FC = () => {
  const {preferences, updatePreferences, clearFavorites} = useMedia();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>设置</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>播放器</Text>
        <TouchableOpacity
          style={[
            styles.option,
            preferences.player === 'media3' && styles.optionActive,
          ]}
          onPress={() => updatePreferences({player: 'media3'})}>
          <View style={styles.optionBody}>
            <Text style={styles.label}>AndroidX Media3（默认）</Text>
            <Text style={styles.desc}>仅 Android 使用 androidx/media 播放</Text>
          </View>
          {preferences.player === 'media3' ? (
            <Icon name="checkmark-circle" size={20} color="#5ac8fa" />
          ) : (
            <Icon name="ellipse-outline" size={20} color="#475569" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.option,
            preferences.player === 'legacy' && styles.optionActive,
          ]}
          onPress={() => updatePreferences({player: 'legacy'})}>
          <View style={styles.optionBody}>
            <Text style={styles.label}>内置播放器（可选）</Text>
            <Text style={styles.desc}>继续使用当前 React Native 播放器</Text>
          </View>
          {preferences.player === 'legacy' ? (
            <Icon name="checkmark-circle" size={20} color="#5ac8fa" />
          ) : (
            <Icon name="ellipse-outline" size={20} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>自动播放下一集</Text>
            <Text style={styles.desc}>播放完成后自动进入下一条视频</Text>
          </View>
          <Switch
            value={preferences.autoplayNext}
            onValueChange={value => updatePreferences({autoplayNext: value})}
          />
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>保持屏幕常亮</Text>
            <Text style={styles.desc}>播放时阻止设备休眠</Text>
          </View>
          <Switch
            value={preferences.keepScreenOn}
            onValueChange={value => updatePreferences({keepScreenOn: value})}
          />
        </View>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.button} onPress={clearFavorites}>
          <Text style={styles.buttonText}>清空全部收藏</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>检查更新（示例）</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        这是一个纯 React Native 构建的示例项目，移除了 Expo
        依赖，提供导航、播放、收藏、搜索与直播的基本体验。
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0b0d14', padding: 16},
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
  optionBody: {flex: 1, marginRight: 8},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  footer: {color: '#9ca3af', marginTop: 8, lineHeight: 20},
});

export default SettingsScreen;
