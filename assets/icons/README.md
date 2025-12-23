# 图标放置与命名规范

本目录仅区分 **手机** 与 **TV** 场景。平板/桌面/可穿戴等其他形态全部复用手机图标资产，无需额外目录。

## 目录结构

```
assets/
  icons/
    mobile/  # 手机主图标（Android/iOS），其他形态共用
    tv/      # TV Banner/Launcher 图标
```

## 手机图标

### Android（电话、平板等通用）
- 基础文件：`assets/icons/mobile/ic_launcher_source.png` 作为母版导出。
- 导出文件后放入 `assets/icons/mobile/`，命名使用密度后缀：
  - `ic_launcher-mdpi.png` 48x48
  - `ic_launcher-hdpi.png` 72x72
  - `ic_launcher-xhdpi.png` 96x96
  - `ic_launcher-xxhdpi.png` 144x144
  - `ic_launcher-xxxhdpi.png` 192x192
  - 圆角版本使用 `ic_launcher_round-<density>.png` 同尺寸。
- 投入工程（修复 `mipmap/ic_launcher` 缺失导致的 Android 打包失败）：
  1) 为每个密度创建目录：`android/app/src/main/res/mipmap-mdpi/`、`.../mipmap-xxxhdpi/`。
  2) 将对应文件复制进去，并重命名为 `ic_launcher.png`/`ic_launcher_round.png`。
  3) 若需要快速替换，可使用以下示例命令（先准备好同名文件）：  
     ```bash
     for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
       mkdir -p android/app/src/main/res/mipmap-$d
       cp assets/icons/mobile/ic_launcher-$d.png android/app/src/main/res/mipmap-$d/ic_launcher.png
       cp assets/icons/mobile/ic_launcher_round-$d.png android/app/src/main/res/mipmap-$d/ic_launcher_round.png
     done
     ```
  4) 重新执行 Android 构建后，错误 `resource mipmap/ic_launcher not found` 将消失。

### iOS（iPhone 形态，其他形态共用同一套）
- 导出后放入 `assets/icons/mobile/`，命名示例：
  - `AppIcon-20@2x.png`、`AppIcon-20@3x.png`
  - `AppIcon-29@2x.png`、`AppIcon-29@3x.png`
  - `AppIcon-40@2x.png`、`AppIcon-40@3x.png`
  - `AppIcon-60@2x.png`、`AppIcon-60@3x.png`
  - `AppIcon-1024.png`（App Store）
- 投入工程：将文件拖入 `ios/RNTV/Images.xcassets/AppIcon.appiconset/`，保持 `Contents.json` 中的尺寸/scale 与文件名一致。

## TV 图标（Android TV）
- 放入 `assets/icons/tv/`：
  - `tv-banner-320x180.png`（必需，标准 320x180 Banner）
  - `tv-banner-640x360.png`（可选，高分辨率 Banner）
- 投入工程：复制到 `android/app/src/main/res/drawable-xhdpi/banner.png`（或更高分辨率的 `drawable-xxhdpi/banner.png`），并在 `AndroidManifest.xml` 的 TV 入口 Activity/Service 上设置 `android:banner="@drawable/banner"`。

## 更新流程
1. 设计导出图标并放入 `assets/icons/mobile/` 与 `assets/icons/tv/`，保持上述命名。
2. Android：执行“投入工程”步骤，将 mipmap/banner 覆盖到 `android/app/src/main/res/`。  
   iOS：将全部 PNG 复制到 `ios/RNTV/Images.xcassets/AppIcon.appiconset/` 并更新 `Contents.json`。
3. 清理应用缓存/重编译后验证图标显示；若有其他形态需求，直接复用手机图标。
