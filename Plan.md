# MoonTV 到 MyTv 迁移可行性分析与方案

## 项目概述

### MoonTV 项目分析

**项目定位**: 基于 Next.js 的 Web 端影视聚合播放器

**核心技术栈**:

- **前端框架**: Next.js 14 (App Router)
- **UI 库**: Tailwind CSS + React
- **语言**: TypeScript
- **视频播放器**: ArtPlayer + HLS.js
- **状态管理**: React Hooks + LocalStorage
- **部署**: Docker + Vercel

**核心功能**:

1. 多源影视资源聚合搜索
2. 在线视频播放 (支持 HLS 流)
3. 影片详情展示 (演员、年份、简介等)
4. 收藏功能 (LocalStorage)
5. 播放记录 (继续观看)
6. 响应式布局 (桌面 + 移动端)
7. PWA 支持

**项目结构**:

```
MoonTV/
├── src/
│   ├── app/                 # Next.js 14 App Router 页面
│   │   ├── (pages)/        # 主要页面路由
│   │   ├── api/            # 后端 API 路由
│   │   │   ├── douban/     # 豆瓣 API 集成
│   │   │   ├── search/     # 多源搜索 API
│   │   │   ├── detail/     # 影片详情 API
│   │   │   └── login/      # 认证 API
│   │   └── globals.css     # 全局样式
│   ├── components/         # React 组件
│   │   ├── VideoCard.tsx   # 视频卡片组件
│   │   ├── AggregateCard.tsx # 聚合卡片组件
│   │   ├── ScrollableRow.tsx # 横向滚动容器
│   │   └── ...
│   └── lib/               # 工具库
│       ├── types.ts       # TypeScript 类型定义
│       ├── db.client.ts   # 本地存储操作
│       └── config.ts      # 配置管理
├── config.json           # 影视资源站点配置
└── package.json          # 项目依赖
```

### MyTv 项目分析

**项目定位**: 基于 React Native TV 的电视端应用

**核心技术栈**:

- **框架**: React Native TV (支持 Apple TV + Android TV)
- **导航**: Expo Router (文件系统路由)
- **视频播放**: react-native-media-console
- **配置**: @react-native-tvos/config-tv
- **语言**: TypeScript

**核心功能**:

1. TV 遥控器导航支持
2. 焦点管理和高亮显示
3. 视频播放 (react-native-video)
4. TV 专用 UI 组件
5. 跨平台支持 (Apple TV + Android TV)

## 迁移可行性分析

### ✅ 高度可行的方面

#### 1. **核心业务逻辑**

- **数据结构兼容**: MoonTV 的 `VideoDetail` 类型定义可直接复用
- **API 接口复用**: MoonTV 的搜索、详情 API 可通过网络请求在 TV 端调用
- **业务流程一致**: 搜索 → 详情 → 播放的核心流程完全匹配

#### 2. **功能特性映射**

| MoonTV 功能 | MyTv 对应功能      | 迁移难度  |
| ----------- | ------------------ | --------- |
| 多源搜索    | 网络 API 调用      | ⭐ 容易   |
| 影片详情    | 详情页面适配       | ⭐⭐ 中等 |
| 视频播放    | react-native-video | ⭐⭐ 中等 |
| 收藏功能    | AsyncStorage       | ⭐ 容易   |
| 播放记录    | AsyncStorage       | ⭐ 容易   |

#### 3. **技术栈兼容性**

- **TypeScript**: 两个项目都使用 TypeScript，类型定义可复用
- **React 生态**: 核心 React 概念一致，组件逻辑可借鉴
- **状态管理**: 都使用 Hooks，状态逻辑可迁移

### ⚠️ 需要重点关注的挑战

#### 1. **UI/UX 差异**

- **交互模式**: Web 鼠标/触摸 → TV 遥控器 D-Pad 导航
- **布局设计**: 响应式网页布局 → TV 固定尺寸界面
- **焦点管理**: Web 无需焦点 → TV 必须精确控制焦点流转

#### 2. **视频播放器差异**

- **MoonTV**: ArtPlayer (Web) + HLS.js
- **MyTv**: react-native-media-console + react-native-video
- **挑战**: 播放控制、进度管理、字幕等功能需要重新实现

#### 3. **存储机制差异**

- **MoonTV**: LocalStorage (同步)
- **MyTv**: AsyncStorage (异步)
- **影响**: 所有本地存储操作需要异步化改造

### ❌ 不可直接迁移的方面

#### 1. **Web 特定功能**

- PWA 功能 (离线缓存、安装到桌面)
- 豆瓣 API 的 CORS 处理
- 浏览器特定的媒体 API

#### 2. **部署和分发**

- Docker/Vercel 部署 → App Store/Google Play 发布
- Web 更新 → 应用商店审核流程

## 迁移方案设计

### 方案 A: 渐进式迁移 (推荐)

#### 阶段 1: 基础架构搭建 (1-2 周)

1. **创建 TV 端项目结构**

   ```typescript
   MyTv/
   ├── app/
   │   ├── (tabs)/
   │   │   ├── home.tsx      # 首页 - 影片推荐
   │   │   ├── search.tsx    # 搜索页
   │   │   ├── library.tsx   # 我的收藏/播放记录
   │   │   └── settings.tsx  # 设置页
   │   ├── detail/
   │   │   └── [id].tsx      # 影片详情页
   │   └── play/
   │       └── [id].tsx      # 播放页面
   ├── components/
   │   ├── TVVideoCard.tsx   # TV 适配的视频卡片
   │   ├── TVSearchInput.tsx # TV 搜索输入
   │   ├── TVMediaPlayer.tsx # TV 媒体播放器
   │   └── FocusableView.tsx # 可获取焦点的容器
   ├── services/
   │   ├── api.ts           # MoonTV API 调用封装
   │   ├── storage.ts       # AsyncStorage 封装
   │   └── player.ts        # 播放器控制逻辑
   └── types/
       └── index.ts         # 从 MoonTV 迁移的类型定义
   ```

2. **核心服务层迁移**

   ```typescript
   // services/api.ts - 调用 MoonTV 后端
   class MoonTVAPI {
     private baseURL = "https://your-moontv-instance.com/api";

     async search(query: string): Promise<SearchResult[]> {
       const response = await fetch(`${this.baseURL}/search?q=${query}`);
       return response.json();
     }

     async getDetail(source: string, id: string): Promise<VideoDetail> {
       const response = await fetch(
         `${this.baseURL}/detail?source=${source}&id=${id}`
       );
       return response.json();
     }
   }
   ```

3. **存储层适配**

   ```typescript
   // services/storage.ts
   import AsyncStorage from "@react-native-async-storage/async-storage";

   export class TVStorage {
     static async getFavorites(): Promise<string[]> {
       const data = await AsyncStorage.getItem("favorites");
       return data ? JSON.parse(data) : [];
     }

     static async addFavorite(videoId: string): Promise<void> {
       const favorites = await this.getFavorites();
       if (!favorites.includes(videoId)) {
         favorites.push(videoId);
         await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
       }
     }
   }
   ```

#### 阶段 2: 核心页面开发 (2-3 周)

1. **搜索功能实现**

   ```typescript
   // app/(tabs)/search.tsx
   export default function SearchScreen() {
     const [query, setQuery] = useState("");
     const [results, setResults] = useState<SearchResult[]>([]);
     const [focusedIndex, setFocusedIndex] = useState(0);

     const handleSearch = async (text: string) => {
       const searchResults = await MoonTVAPI.search(text);
       setResults(searchResults);
     };

     return (
       <TVFocusableView>
         <TVSearchInput
           value={query}
           onChangeText={setQuery}
           onSubmit={handleSearch}
         />
         <FlatList
           data={results}
           renderItem={({ item, index }) => (
             <TVVideoCard
               video={item}
               focused={index === focusedIndex}
               onFocus={() => setFocusedIndex(index)}
             />
           )}
           keyExtractor={(item) => item.id}
         />
       </TVFocusableView>
     );
   }
   ```

2. **详情页面开发**
   ```typescript
   // app/detail/[id].tsx
   export default function DetailScreen() {
     const { id, source } = useLocalSearchParams();
     const [detail, setDetail] = useState<VideoDetail | null>(null);

     useEffect(() => {
       MoonTVAPI.getDetail(source as string, id as string).then(setDetail);
     }, [source, id]);

     return (
       <ScrollView>
         <TVDetailHeader video={detail} />
         <TVEpisodeList episodes={detail?.episodes} />
         <TVActionButtons onPlay={handlePlay} onFavorite={handleFavorite} />
       </ScrollView>
     );
   }
   ```

#### 阶段 3: 播放功能集成 (1-2 周)

1. **播放器组件开发**

   ```typescript
   // components/TVMediaPlayer.tsx
   import VideoPlayer from "react-native-media-console";

   export function TVMediaPlayer({ source, title }: TVMediaPlayerProps) {
     return (
       <VideoPlayer
         source={{ uri: source }}
         title={title}
         disableControls={false}
         resizeMode="contain"
         onEnd={handlePlaybackEnd}
         tapAnywhereToPause={true}
       />
     );
   }
   ```

2. **播放页面开发**
   ```typescript
   // app/play/[id].tsx
   export default function PlayScreen() {
     const { videoUrl, title } = useLocalSearchParams();

     return (
       <View style={{ flex: 1, backgroundColor: "black" }}>
         <TVMediaPlayer source={videoUrl as string} title={title as string} />
       </View>
     );
   }
   ```

#### 阶段 4: TV 专用优化 (1-2 周)

1. **焦点导航优化**

   ```typescript
   // components/FocusableView.tsx
   export function FocusableView({ children, onFocus, onBlur }: Props) {
     return (
       <Pressable
         onFocus={onFocus}
         onBlur={onBlur}
         style={({ focused }) => [styles.container, focused && styles.focused]}
       >
         {children}
       </Pressable>
     );
   }
   ```

2. **遥控器快捷键支持**
   ```typescript
   // hooks/useRemoteControl.ts
   export function useRemoteControl() {
     useEffect(() => {
       const handleKeyPress = (event: any) => {
         switch (event.key) {
           case "ArrowUp": // 遥控器上键
             // 处理向上导航
             break;
           case "ArrowDown": // 遥控器下键
             // 处理向下导航
             break;
           case "Select": // 遥控器确定键
             // 处理选择
             break;
         }
       };

       // 注册事件监听器
     }, []);
   }
   ```

### 方案 B: API 服务复用 (备选)

如果不想完全迁移前端，可以保持 MoonTV 作为 API 服务器，MyTv 作为纯客户端：

```typescript
// MyTv 通过网络调用 MoonTV 的 API
const MOONTV_API_BASE = "https://your-moontv-instance.com/api";

class MoonTVClient {
  async search(query: string) {
    return fetch(`${MOONTV_API_BASE}/search?q=${query}`);
  }

  async getVideoDetail(source: string, id: string) {
    return fetch(`${MOONTV_API_BASE}/detail?source=${source}&id=${id}`);
  }
}
```

## 实施建议

### 开发优先级

1. **高优先级** (核心功能)

   - 基础 TV 导航框架
   - 视频搜索和播放
   - 遥控器支持

2. **中优先级** (用户体验)

   - 收藏和播放记录
   - 详情页面丰富化
   - 性能优化

3. **低优先级** (增值功能)
   - 个性化推荐
   - 多用户支持
   - 云同步

### 技术风险与缓解

| 风险            | 影响         | 缓解措施                   |
| --------------- | ------------ | -------------------------- |
| TV 焦点管理复杂 | 开发周期延长 | 早期原型验证，分步实现     |
| 视频播放兼容性  | 功能不稳定   | 多设备测试，备用播放器方案 |
| API 调用延迟    | 用户体验差   | 本地缓存，异步加载         |
| 应用商店审核    | 发布延期     | 提前了解审核规则，合规设计 |

### 开发资源估算

- **开发时间**: 6-8 周 (1-2 人团队)
- **技术栈学习**: React Native TV (1-2 周)
- **UI/UX 设计**: TV 界面设计 (1 周)
- **测试验证**: 多设备兼容性 (1 周)

## 结论

**迁移可行性**: ⭐⭐⭐⭐☆ (高度可行)

**推荐方案**: 渐进式迁移，保持 MoonTV 作为后端 API 服务，开发独立的 MyTv 客户端

**关键成功因素**:

1. 合理的架构设计 (分离 API 和 UI)
2. TV 交互模式的深度理解
3. 充分的设备兼容性测试
4. 渐进式开发和验证

通过这个方案，可以充分利用 MoonTV 的成熟后端能力，同时为 TV 平台提供原生的使用体验。
