# OrionTV 📺

一个基于 React Native TVOS 和 Expo 构建的播放器，旨在提供流畅的视频观看体验。

## ✨ 功能特性

- **框架跨平台支持**: 同时支持构建 Apple TV 和 Android TV。
- **现代化前端**: 使用 Expo、React Native TVOS 和 TypeScript 构建，性能卓越。
- **Expo Router**: 基于文件系统的路由，使导航逻辑清晰简单。
- **TV 优化的 UI**: 专为电视遥控器交互设计的用户界面。

## 🎮 播放器功能 (v1.2.11+)

### ⏩ 播放控制增强
- **快进/快退**: 支持10秒快进和快退功能
- **播放速度调节**: 支持 0.75x、1.0x、1.25x、1.5x、1.75x、2.0x、2.25x 七种播放速度
- **智能控制**: 倍速按钮在非标准速度时高亮显示当前速度

### 🎚️ 进度条交互
- **点击跳转**: 点击进度条任意位置直接跳转到对应时间点
- **拖动跳转**: 支持手势拖动进度条，实时显示预览时间
- **视觉反馈**: 拖动过程中提供清晰的视觉反馈和时间显示

### 🎨 用户体验优化
- **遥控器友好**: 所有新功能都针对TV遥控器进行了优化
- **响应式设计**: 触摸区域扩大，确保良好的交互体验
- **自动适配**: 显示界面自动适配手机、平板和电视等不同设备
- **状态保持**: 播放速度设置在播放过程中保持

## 🛠️ 技术栈

- **前端**:
  - [React Native TVOS](https://github.com/react-native-tvos/react-native-tvos)
  - [Expo](https://expo.dev/) (~51.0)
  - [Expo Router](https://docs.expo.dev/router/introduction/)
  - [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
  - TypeScript

## 📂 项目结构

本项目采用类似 monorepo 的结构：

```
.
├── app/              # Expo Router 路由和页面
├── assets/           # 静态资源 (字体, 图片, TV 图标)
├── components/       # React 组件
├── constants/        # 应用常量 (颜色, 样式)
├── hooks/            # 自定义 Hooks
├── services/         # 服务层 (API, 存储)
├── package.json      # 前端依赖和脚本
└── ...
```

## 🚀 快速开始

### 环境准备

请确保您的开发环境中已安装以下软件：

- [Node.js](https://nodejs.org/) (LTS 版本)
- [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Xcode](https://developer.apple.com/xcode/) (用于 Apple TV 开发)
- [Android Studio](https://developer.android.com/studio) (用于 Android TV 开发)

### 项目启动

接下来，在项目根目录运行前端应用：

```sh

# 安装依赖
yarn

# [首次运行或依赖更新后] 生成原生项目文件
# 这会根据 app.json 中的配置修改原生代码以支持 TV
yarn prebuild-tv

# 运行在 Apple TV 模拟器或真机上
yarn ios-tv

# 运行在 Android TV 模拟器或真机上
yarn android-tv
```

## 使用

- 1.2.x 以上版本需配合 [MoonTV](https://github.com/senshinya/MoonTV) 使用。

## 📱 APK下载与构建

### 🎯 下载预构建APK

1. **GitHub Releases**: 访问 [Releases页面](https://github.com/longxingdeng/OrionTV/releases) 下载最新版本
2. **自动构建**: 每次代码更新都会触发自动构建，可在Actions页面下载

### 🛠 自助构建

#### 方式1: GitHub Actions (推荐)
1. Fork本项目到你的GitHub
2. 在Actions页面选择"Build Android TV APK"工作流
3. 点击"Run workflow"选择构建类型
4. 等待构建完成后下载APK

#### 方式2: 本地构建
```bash
# 1. 预构建TV版本
yarn prebuild-tv

# 2. 构建APK
yarn build-local

# APK位置: android/app/build/outputs/apk/release/app-release.apk
```

#### 方式3: EAS Build
```bash
# 安装EAS CLI并登录
npm install -g @expo/eas-cli
eas login

# 构建生产版本
eas build --platform android --profile production_tv
```

📋 **详细构建指南**: [BUILD.md](docs/BUILD.md)

## 📜 主要脚本

- `yarn start`: 在手机模式下启动 Metro Bundler。
- `yarn start-tv`: 在 TV 模式下启动 Metro Bundler。
- `yarn ios-tv`: 在 Apple TV 上构建并运行应用。
- `yarn android-tv`: 在 Android TV 上构建并运行应用。
- `yarn prebuild-tv`: 为 TV 构建生成原生项目文件。
- `yarn lint`: 检查代码风格

## 📝 License

本项目采用 MIT 许可证。

## ⚠️ 免责声明

OrionTV 仅作为视频搜索工具，不存储、上传或分发任何视频内容。所有视频均来自第三方 API 接口提供的搜索结果。如有侵权内容，请联系相应的内容提供方。

本项目开发者不对使用本项目产生的任何后果负责。使用本项目时，您必须遵守当地的法律法规。

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=zimplexing/OrionTV&type=Date)](https://www.star-history.com/#zimplexing/OrionTV&Date)

## 🙏 致谢

本项目受到以下开源项目的启发：

- [MoonTV](https://github.com/senshinya/MoonTV) - 一个基于 Next.js 的视频聚合应用
- [LibreTV](https://github.com/LibreSpark/LibreTV) - 一个开源的视频流媒体应用

感谢以下项目提供 API Key 的赞助

- [gpt-load](https://github.com/tbphp/gpt-load) - 一个高性能的 OpenAI 格式 API 多密钥轮询代理服务器，支持负载均衡，使用 Go 语言开发
