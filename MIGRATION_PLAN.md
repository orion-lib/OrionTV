# Web 功能至 React Native TV 应用迁移计划

## 1. 项目目标

将现有 `web` 项目 (基于 Next.js) 的核心功能，包括视频浏览、搜索、详情查看、播放记录和收藏，完整地迁移到 React Native TV 应用中，并为电视遥控器交互进行深度优化。

## 2. 核心策略

我们将采用**前后端分离**的核心策略：

- **后端服务**: 将 `web/src/app/api/` 中的所有 API 逻辑剥离出来，封装成一个独立的、使用 **Express.js** 构建的 Node.js 服务。该服务将通过 **Docker** 进行容器化，部署在您的私有服务器上。
- **TV 应用 (前端)**: React Native TV 应用将作为纯前端，负责 UI 展示和用户交互。它将通过网络请求调用上述独立的后端服务来获取和提交数据。
- **数据持久化**: 用户数据（播放记录、收藏等）将从 `localStorage` 迁移到 React Native 的 **`AsyncStorage`**，实现应用内的本地持久化存储。

## 3. 架构设计

迁移后的系统架构如下所示：

```mermaid
graph TD
    subgraph "React Native TV 应用"
        A[用户] -->|遥控器交互| B(TV 应用界面)
        B -->|数据请求| C{数据服务层}
    end

    subgraph "本地存储"
        C -->|读/写| D[AsyncStorage (播放记录, 收藏)]
    end

    subgraph "后端服务 (Docker @ 您的服务器)"
        E[Express.js API 服务]
    end

    subgraph "第三方数据源"
        F[视频源 API]
        G[豆瓣 API]
    end

    C -->|API 请求| E
    E -->|代理请求| F
    E -->|代理请求| G
```

## 4. 分阶段实施计划

我们将迁移过程分为四个主要阶段，循序渐进，以确保每个环节都稳固可靠。

### 阶段一：后端服务搭建与部署 (Backend First)

**目标**: 优先保障数据接口的可用性，为后续所有前端工作提供数据基础。

- **任务 1**: 在项目根目录创建 `backend/` 文件夹，并初始化一个 Node.js (Express.js) 项目。
- **任务 2**: 将 `web/src/app/api/` 下的所有 API (search, detail, douban, login, playrecords) 的逻辑迁移到 Express 路由中。
- **任务 3**: 编写一个高效的 `Dockerfile`，用于构建后端服务的生产环境镜像。
- **任务 4**: 提供部署指南，说明如何在您的服务器上通过 Docker 启动服务，并配置必要的环境变量（如端口）。
- **交付物**: 可独立运行和测试的后端 API 服务。

### 阶段二：TV 应用基础建设与数据层迁移

**目标**: 在 TV 应用中搭建好基础框架，并完成数据存储逻辑的替换。

- **任务 1**: 安装必要的依赖库：`@react-native-async-storage/async-storage` (用于本地存储) 和 `react-navigation` (用于页面路由)。
- **任务 2**: 在 TV 应用中创建 `services/api.ts` 文件，封装所有对新后端服务的 `fetch` 请求。
- **任务 3**: 在 TV 应用中创建 `services/storage.ts` 文件，使用 `AsyncStorage` 重新实现 `web/src/lib/db.client.ts` 中的所有功能（播放记录、收藏的增删改查）。
- **交付物**: 一个可以与后端通信并能在本地存取数据的 TV 应用骨架。

### 阶段三：核心 UI 组件库迁移

**目标**: 自底向上，将 Web 组件重构为适用于 TV 平台的原生组件。

- **任务 1**: 识别 `web/src/components` 中的核心可复用组件，如 `VideoCard`、`ScrollableRow`、`AggregateCard` 等。
- **任务 2**: 在 TV 项目的 `components/` 目录下，创建对应的 TV 版本组件。
  - 将 HTML 标签 (`div`, `img`) 替换为 React Native 组件 (`View`, `Image`)。
  - 将 CSS 样式转换为 React Native 的 `StyleSheet` API。
  - **关键**: 为所有可交互组件添加 `onFocus`, `onBlur` 事件处理，并使用 `Touchable` 组件实现遥控器响应，确保良好的焦点管理和导航体验。
- **交付物**: 一套专为 TV 优化的、可复用的基础 UI 组件库。

### 阶段四：页面路由与功能整合

**目标**: 组装所有模块，将应用串联成一个完整、可用的产品。

- **任务 1**: 使用 `React Navigation` 库搭建 App 的整体路由结构，需要实现查看更多，详情页面，播放页等
- **任务 2**: 创建所有核心页面 (Screens)，例如 `MoreScreen`, `SearchScreen`, `DetailScreen`, `PlayerScreen`。
- **任务 3**: 在各个页面中，集成前几个阶段完成的 `services` 和 `components`，调用后端 API 获取数据，并渲染出最终界面。
- **任务 4**: 对整体应用进行联调测试，重点测试遥控器导航的流畅性和功能的完整性。
- **交付物**: 功能完整的 React Native TV 应用初版。

## 5. 技术栈清单

- **TV 应用**: React Native, TypeScript, React Navigation
- **后端服务**: Node.js, Express.js
- **数据存储**: @react-native-async-storage/async-storage
- **部署**: Docker

## 6. 风险与应对

- **风险**: 第三方 API 接口变更或失效。
  - **应对**: 后端服务已将 API 请求集中处理，若有变更，只需修改后端代码，无需更新客户端 App。
- **风险**: TV 平台（Android TV, tvOS）的 UI/UX 兼容性差异。
  - **应对**: 在开发过程中，优先使用 React Native 官方推荐的跨平台组件。对特定平台的差异，可以使用 `Platform.select()` 进行适配。

## 7. 下一步

我们已就此计划达成共识。下一步建议是：**切换到“代码”模式**，并开始着手执行**阶段一**的任务，即搭建和迁移独立的后端服务。
