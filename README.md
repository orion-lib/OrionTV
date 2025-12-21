# RNTV（纯 React Native 版本）

一个基于 React Native 打造的 TV/移动端播放器示例，覆盖首页推荐、搜索、收藏、详情、播放、直播、设置等基础体验，去除了 Expo 依赖，便于直接集成到原生工程。

## 目录结构

```
.
├── android/        # Android 原生工程
├── ios/            # iOS 原生工程
├── src/            # 业务代码（组件、屏幕、数据、上下文等）
├── App.tsx         # 应用入口
├── package.json
└── ...
```

## 环境要求

- Node.js 16+（建议 18 LTS）
- npm 8+ 或 yarn
- JDK 11（或与 Android Studio 匹配的版本）
- Android Studio（已安装 Android SDK / NDK，并配置 ANDROID_HOME）
- Xcode + CocoaPods（macOS，仅 iOS）
- Watchman（可选，提升 Metro 监听效率）

## 安装与运行

```bash
# 安装依赖
npm install

# iOS 额外安装 Pods（仅在 macOS）
cd ios && pod install && cd ..

# 启动 Metro
npm run start

# 运行到设备/模拟器
npm run android
npm run ios
```

## 打包 APK / 归档

- Android Release：
  ```bash
  cd android
  ./gradlew assembleRelease
  ```
  生成的 APK 位于 `android/app/build/outputs/apk/release/`。

- iOS Release：在 Xcode 打开 `ios/RNTV.xcworkspace`，选择 `Any iOS Device (arm64)` 后执行 Product > Archive。

## 二进制资源

- Gradle wrapper：`android/gradle/wrapper/gradle-wrapper.jar`（需自备，否则请使用宿主机已安装的 Gradle/Android SDK）
- 启动图标（各分辨率）：`android/app/src/main/res/mipmap-*/ic_launcher*.png`

## 功能概览

- 首页：分类筛选、精选内容展示。
- 搜索：按片名/标签即时过滤。
- 详情：展示基础信息，支持收藏、跳转播放。
- 播放：`react-native-video` 播放示例，收藏入口。
- 直播：示例频道切换与播放。
- 收藏：统一收藏列表。
- 设置：自动播放下一集、保持常亮、清空收藏（示例）。

## 脚本

- `npm run start`：启动 Metro
- `npm run android`：运行 Android
- `npm run ios`：运行 iOS
- `npm test`：运行 Jest
- `npm run lint`：ESLint 检查

## 容器（Podman/Docker）打包 Android APK

前置：目录中已放回 `gradle-wrapper.jar`（或你使用宿主机的 Gradle/SDK 并在容器内挂载）。

```bash
# 拉取包含 Android SDK 的镜像（示例）
# 镜像仓库：https://github.com/react-native-community/docker-android
podman pull ghcr.io/react-native-community/docker-android:latest

# 在容器内运行组装（同理适用于 docker）
podman run --rm -v "$(pwd)":/app -w /app \
  ghcr.io/react-native-community/docker-android:latest \
  sh -c "yes | sdkmanager --licenses && ./gradlew assembleRelease"

# 成品位于 android/app/build/outputs/apk/release/
```

## 备注

- 若需启用 Gradle Wrapper，放回 `gradle-wrapper.jar` 后即可使用 `./gradlew` 相关命令。
- 首次 iOS 运行请执行 `pod install`。
- 本仓库仅提供示例数据与播放链接，请遵守当地法律法规。
