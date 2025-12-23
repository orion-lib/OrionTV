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
- JDK 11（当前容器已安装）
- Android SDK 34 + Build Tools 34.0.0（CLI 工具可通过 `sdkmanager` 安装）
  ```bash
  sdkmanager "platforms;android-34" "build-tools;34.0.0"
  ```
- ANDROID_HOME / ANDROID_SDK_ROOT 指向已安装的 SDK 路径
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

- Android Release（已提升到 compileSdkVersion/targetSdkVersion 34，buildToolsVersion 34.0.0）：
  ```bash
  cd android
  # 可选：清理缓存
  ./gradlew clean
  ./gradlew assembleRelease
  ```
  生成的 APK 位于 `android/app/build/outputs/apk/release/`。
  > 备注：当前代码使用 `react-native-gesture-handler@2.9.0`、`react-native-screens@3.18.2`、`react-native-video@6.1.2`。在容器内尝试 `./gradlew clean assembleRelease` 时，`react-native-screens` 的 Kotlin 编译仍有错误（`compileReleaseKotlin` 失败，伴随 StackOverflowError），需进一步升级 Android Gradle Plugin/Kotlin 或对库源码做兼容性调整后方可产出 APK。

- iOS Release：在 Xcode 打开 `ios/RNTV.xcworkspace`，选择 `Any iOS Device (arm64)` 后执行 Product > Archive。

## 二进制资源

- Gradle wrapper：`android/gradle/wrapper/gradle-wrapper.jar`（需自备，否则请使用宿主机已安装的 Gradle/Android SDK）
- 启动图标（各分辨率）：`android/app/src/main/res/mipmap-*/ic_launcher*.png`

## 图标资源流程（手机 & TV）

- 设计稿放置：`assets/icons/mobile/`（手机/平板等通用）与 `assets/icons/tv/`（Android TV Banner）。
- 命名规则与尺寸：见 `assets/icons/README.md`，包含 Android `mipmap-*`、iOS `AppIcon.appiconset` 的尺寸对照以及 TV Banner 的命名（其他形态复用手机图标）。
- 投入工程：按文档说明复制到对应原生目录后重新编译即可。

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

Podman 可直接使用官方发布的 `reactnativecommunity/react-native-android` 镜像（Docker Hub），无需额外配置。镜像内已预装 Android SDK、NDK 和构建链，适合 CI/CD 或无法直接安装 Android Studio 的环境。

```bash
# 拉取镜像（与 Docker 命令兼容）
podman pull docker.io/reactnativecommunity/react-native-android:latest

# 在容器内运行组装（同理适用于 docker）
podman run --rm -v "$(pwd)":/app -w /app \
  docker.io/reactnativecommunity/react-native-android:latest \
  sh -c "yes | sdkmanager --licenses && ./gradlew assembleRelease"

# 成品位于 android/app/build/outputs/apk/release/
```

## 备注

- 若需启用 Gradle Wrapper，放回 `gradle-wrapper.jar` 后即可使用 `./gradlew` 相关命令。
- 首次 iOS 运行请执行 `pod install`。
- 本仓库仅提供示例数据与播放链接，请遵守当地法律法规。

## React Native 0.83.1 手动迁移指引（不提交二进制）

> 说明：下面步骤基于官方 0.83.1 模板整理，可在本地完成迁移并自行检入需要的文件。二进制文件（如 `gradle-wrapper.jar`、Debug keystore 等）请勿提交。

1. **获取官方模板文件**
   - 下载模板包：`npm pack @react-native-community/template@0.83.1 --registry=https://registry.npmjs.org`
   - 解压：`tar -xzf react-native-community-template-0.83.1.tgz -C /tmp/rn831template`
   - 模板目录位于 `/tmp/rn831template/package/template/`

2. **替换原生工程骨架（保留业务代码）**
   - 备份当前 `android/`、`ios/` 目录。
   - 用模板覆盖原生工程：复制模板的 `android/`、`ios/` 到项目根目录。
   - 将包名/工程名替换为当前应用：
     - Android：`applicationId`/`namespace` 改为 `com.rntv`，`android/app/src/main/java/com/rntv` 下的包名同步。
     - iOS：工程名、Scheme、`Info.plist` 中的显示名与 Bundle Identifier 更新为 `RNTV`/`com.rntv`。
   - 若有自定义原生代码（如播放器组件），按需从备份中拷回对应文件夹。
   - 启动图标 PNG 不必提交，仓库未附带 `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`，如需使用请在本地放入对应的 `mipmap-*` 目录（覆盖 `ic_launcher*.png`），并在 README 中记录放置路径。

3. **同步 JS 依赖与配置**
   - `package.json` 主要版本：
     - `react-native@0.83.1`、`react@19.2.0`
     - CLI/工具链：`@react-native/babel-preset@0.83.1`、`@react-native/metro-config@0.83.1`、`@react-native/typescript-config@0.83.1`
     - 导航等三方库升级：`@react-navigation/*@^7.9.0`、`react-native-gesture-handler@^2.30.0`、`react-native-screens@^4.19.0`、`react-native-reanimated@^4.2.1`、`react-native-safe-area-context@^5.5.2`、`react-native-vector-icons@^10.3.0`、`react-native-video@^6.18.0`
   - Babel：`presets: ['module:@react-native/babel-preset']`，保留 `react-native-reanimated/plugin`。
   - Metro：使用 `@react-native/metro-config` 默认配置。
   - TypeScript：继承 `@react-native/typescript-config/tsconfig.json`，补充 `"types": ["jest"]`。
   - Jest：使用单独的 `jest.config.js`（preset `react-native`，与旧版 transformIgnorePatterns 相同），`jest.setup.js` 内为 Reanimated mock 增加 `Reanimated.default.call = () => {}`。

4. **Android 构建要点**
   - 模板默认：AGP 8.7.x、Gradle 9.0、compile/target SDK 36、Kotlin 2.1.20、NDK 27.1、Hermes 开启。
   - 若内网/代理导致 Maven Central 证书或下载失败，可在 `android/build.gradle` 和 `settings.gradle` 中增加镜像仓库，或在本地提前下载依赖后再构建。
   - 如果不希望提交 `gradle-wrapper.jar`，可在本地安装 Gradle 9.0+，使用 `gradle assembleDebug` 指向项目。

5. **iOS 构建要点**
   - 模板使用 Swift AppDelegate 与 `ReactNativeDelegate`；`Podfile` 由 `react_native_pods.rb` 解析。
   - 运行 `cd ios && pod install`（需 Ruby/CocoaPods 环境）。
   - 如有测试目标需求，可在 Xcode 中重新创建测试 Target 或恢复原有测试文件。

6. **验证**
   - 依赖安装：`npm install`
   - JS 测试：`npm test -- --runInBand`（React 19 的 act 警告属已知，需要在测试中手动包裹 `act` 或使用异步渲染方案）
   - Android：`./gradlew assembleDebug`（或本机 Gradle），如遇代理/证书问题，先解决网络后重试。
   - iOS：`npx pod-install ios`（或手动 `pod install`），再在 Xcode 运行。
