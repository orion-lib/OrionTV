# 🚀 OrionTV 构建指南

## 📱 APK构建方式

### 1. GitHub Actions 自动构建 (推荐)

项目配置了完整的GitHub Actions工作流，支持多种构建触发方式：

#### 🔄 自动构建触发
- **推送到master分支**: 自动构建debug版本APK
- **创建版本标签**: 自动构建release版本APK并创建GitHub Release
  ```bash
  git tag v1.2.11
  git push origin v1.2.11
  ```

#### 🎮 手动构建触发
1. 前往项目的GitHub Actions页面
2. 选择 "Build Android TV APK" 工作流
3. 点击 "Run workflow"
4. 选择构建类型：
   - `release`: 生产版本
   - `debug`: 调试版本

#### 📥 下载APK
- **自动构建**: 在Actions页面下载artifacts
- **Release构建**: 从GitHub Releases页面下载

### 2. 本地构建

#### 环境要求
- Node.js 18+
- Yarn
- Java 17
- Android SDK
- Android NDK

#### 构建步骤

```bash
# 1. 安装依赖
yarn install

# 2. 预构建TV版本
yarn prebuild-tv

# 3. 构建APK
yarn build-local

# 生成的APK位置：
# android/app/build/outputs/apk/release/app-release.apk
```

### 3. EAS Build (Expo构建服务)

```bash
# 安装EAS CLI
npm install -g @expo/eas-cli

# 登录Expo账号
eas login

# 构建不同版本
eas build --platform android --profile development_tv    # 开发版
eas build --platform android --profile preview_tv       # 预览版  
eas build --platform android --profile production_tv    # 生产版
eas build --platform android --profile github_actions   # CI专用
```

## 🔧 构建配置

### EAS配置 ([`eas.json`](../eas.json))

| Profile | 说明 | 输出 | 用途 |
|---------|------|------|------|
| `development_tv` | 开发版本 | Debug APK | 本地测试 |
| `preview_tv` | 预览版本 | Release APK | 内部测试 |
| `production_tv` | 生产版本 | Release APK | 正式发布 |
| `github_actions` | CI专用 | Release APK | 自动化构建 |

### GitHub Actions配置

- **工作流文件**: [`.github/workflows/build-apk.yml`](../.github/workflows/build-apk.yml)
- **缓存优化**: Gradle、Node modules缓存
- **多触发器**: 手动、标签、推送触发
- **智能构建**: 根据触发方式选择debug/release
- **自动发布**: Tag推送时自动创建GitHub Release

## 📋 构建产物

每次构建会生成以下文件：

```
artifacts/
├── orionTV.v1.2.11.apk              # Release APK
├── orionTV.v1.2.11-debug-abc123.apk # Debug APK (包含commit hash)
└── build-info.txt                   # 构建信息
```

### 构建信息内容
- 版本号
- 构建类型 (release/debug)
- Git提交信息
- 构建时间
- 工作流信息

## 🎯 版本管理

### 版本号规则
- **主版本**: 重大功能更新 (1.x.x → 2.x.x)
- **次版本**: 新功能添加 (x.1.x → x.2.x)  
- **补丁版本**: 问题修复 (x.x.1 → x.x.2)

### 发布流程
1. 更新 `package.json` 中的版本号
2. 提交版本更新
3. 创建并推送版本标签
4. GitHub Actions自动构建并发布

```bash
# 示例发布流程
yarn version --new-version 1.2.12
git push origin master
git push origin v1.2.12
```

## 🔍 故障排除

### 常见问题

1. **Gradle构建失败**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

2. **依赖冲突**
   ```bash
   yarn install --frozen-lockfile
   yarn prebuild-tv --clean
   ```

3. **内存不足**
   - 增加Gradle堆大小: `android/gradle.properties`
   ```properties
   org.gradle.jvmargs=-Xmx4g
   ```

4. **Android SDK问题**
   - 确保安装API Level 34
   - 配置正确的ANDROID_HOME环境变量

### 日志查看
- **GitHub Actions**: Actions页面查看详细日志
- **本地构建**: 查看Gradle输出
- **EAS Build**: `eas build:list` 查看构建历史

## 📞 技术支持

如遇构建问题，请提供以下信息：
- 构建环境 (本地/GitHub Actions/EAS)
- 错误日志
- 系统信息
- 构建配置

---

## 📚 相关文档
- [React Native TV OS](https://github.com/react-native-tvos/react-native-tvos)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [GitHub Actions](https://docs.github.com/en/actions)