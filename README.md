# OrionTV 📺

一个基于 React Native TVOS 和 Expo 构建的跨平台TV播放器，专为提供流畅的视频观看体验而设计。

## ✨ 功能特性

- **🎯 跨平台支持**: 同时支持构建 Apple TV 和 Android TV
- **🚀 现代化前端**: 使用 Expo、React Native TVOS 和 TypeScript 构建，性能卓越
- **🧭 智能路由**: 基于文件系统的 Expo Router，导航逻辑清晰简单
- **📺 TV 优化**: 专为电视遥控器交互设计的用户界面
- **📱 响应式布局**: 完美适配手机、平板、电视等不同设备

## 🎮 播放器功能 (v1.2.22+)

### ⏩ 播放控制增强
- **快进/快退**: 支持10秒快进和快退功能，连续操作流畅
- **播放速度调节**: 支持 0.75x、1.0x、1.25x、1.5x、1.75x、2.0x、2.25x 七种播放速度
- **智能控制**: 倍速按钮在非标准速度时高亮显示当前速度
- **一键重置**: 快速恢复到正常播放速度

### 🎚️ 进度条交互 (已修复)
- **点击跳转**: 点击进度条任意位置直接跳转到对应时间点
- **✅ 拖动跳转**: 支持精确拖动进度条到任意位置播放 (v1.2.22 修复)
- **实时预览**: 拖动过程中实时显示预览时间和进度
- **视觉反馈**: 提供清晰的拖动状态和位置指示

### 🎨 视频显示优化
- **视频缩放模式**: 三种缩放模式自由切换
  - **覆盖模式** (cover): 消除黑边，填满屏幕
  - **适应模式** (contain): 保持比例，完整显示
  - **拉伸模式** (stretch): 填充屏幕，可能变形
- **智能默认**: 默认使用覆盖模式，最佳观看体验

### 📱 响应式布局 (v1.2.22 优化)
- **✅ 手机端优化**: 修复海报挤压和标题重叠问题
- **智能列数**:
  - 小屏手机 (<500px): 固定2列
  - 大屏手机 (500-700px): 2-3列自适应
  - 平板 (700-1024px): 3-4列优化显示
  - 电视/桌面 (>1024px): 4-6列大屏体验
- **统一布局**: 确保所有设备下卡片尺寸一致，视觉和谐

### 🎯 用户体验优化
- **遥控器友好**: 所有功能都针对TV遥控器进行了优化
- **触控增强**: 扩大触摸区域，提升移动设备操作体验
- **状态保持**: 播放速度等设置在播放过程中自动保持
- **流畅动画**: 所有交互都配备流畅的动画反馈

## 🛠️ 技术栈

- **前端框架**:
  - [React Native TVOS](https://github.com/react-native-tvos/react-native-tvos) - TV优化的React Native
  - [Expo](https://expo.dev/) (~51.0) - 跨平台开发框架
  - [Expo Router](https://docs.expo.dev/router/introduction/) - 文件系统路由
  - [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/) - 音视频播放组件
  - TypeScript - 类型安全的JavaScript

- **状态管理**:
  - [Zustand](https://zustand-demo.pmnd.rs/) - 轻量级状态管理

- **UI组件**:
  - [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) - 手势识别
  - [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - 高性能动画
  - [Lucide React Native](https://lucide.dev/) - 图标库

- **开发工具**:
  - ESLint - 代码质量检查
  - Prettier - 代码格式化
  - GitHub Actions - 自动化构建和部署

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

## 📋 使用说明

- **版本要求**: v1.2.x 以上版本需配合 [MoonTV](https://github.com/senshinya/MoonTV) 后端服务使用
- **设备支持**: Android TV、Apple TV、Android手机/平板、iOS设备
- **网络要求**: 需要稳定的网络连接以获取视频内容

## 📱 APK下载与构建

### 🎯 下载预构建APK (推荐)

1. **📦 GitHub Releases**:
   - 访问 [Releases页面](https://github.com/longxingdeng/OrionTV/releases) 下载最新 v1.2.22 版本
   - 直接下载 `orionTV.v1.2.22.apk` 文件

2. **🤖 自动构建**:
   - 每次代码更新都会触发自动构建
   - 访问 [Actions页面](https://github.com/longxingdeng/OrionTV/actions) 下载最新构建
   - 支持debug和release两种版本

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

## 🆕 版本历史

### v1.2.22 (最新版本)
- ✅ **修复进度条拖动功能** - 现可精确拖动到任意位置播放
- ✅ **修复手机端布局** - 解决海报挤压和标题重叠问题
- ✅ **优化响应式布局** - 完美适配各种屏幕尺寸
- ✅ **配置自动构建** - GitHub Actions自动生成APK
- 🎮 完整的播放器控制功能 (快进/变速/跳转)
- 📺 视频缩放模式切换 (消除黑边)

### v1.2.11
- 🎮 新增播放器快进/快退功能
- 🎚️ 新增播放速度调节 (7档变速)
- 🎯 新增进度条点击跳转功能
- 📱 初步响应式布局支持

## 📜 主要脚本

- `yarn start`: 在手机模式下启动 Metro Bundler
- `yarn start-tv`: 在 TV 模式下启动 Metro Bundler
- `yarn ios-tv`: 在 Apple TV 上构建并运行应用
- `yarn android-tv`: 在 Android TV 上构建并运行应用
- `yarn prebuild-tv`: 为 TV 构建生成原生项目文件
- `yarn build-local`: 本地构建APK文件
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
