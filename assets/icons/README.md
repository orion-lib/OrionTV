# 图标放置与命名规范

本目录提供手机与 TV 场景的图标文件夹。若出现平板、桌面等其他形态，均复用手机图标资产。

## 目录结构

```
assets/
  icons/
    mobile/  # 手机主图标（Android/iOS），其他形态共用
    tv/      # TV Banner/Launcher 图标
```

## 手机图标

### Android（电话、平板等通用）
- 导出文件后放入 `assets/icons/mobile/`，命名使用密度后缀：
  - `ic_launcher-mdpi.png` 48x48
  - `ic_launcher-hdpi.png` 72x72
  - `ic_launcher-xhdpi.png` 96x96
  - `ic_launcher-xxhdpi.png` 144x144
  - `ic_launcher-xxxhdpi.png` 192x192
  - 圆角版本使用 `ic_launcher_round-<density>.png` 同尺寸。
- 投入工程：将对应文件复制到 `android/app/src/main/res/mipmap-<density>/`，并保持文件名为 `ic_launcher.png` 与 `ic_launcher_round.png`。

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
- 投入工程：复制到 `android/app/src/main/res/drawable-xhdpi/banner.png`（或更高分辨率的 `drawable-xxhdpi/banner.png`），并在 `AndroidManifest.xml` 中为 TV 入口设置 `android:banner` 时引用该资源。

## 更新流程
1. 设计导出图标并放入 `assets/icons/mobile/` 与 `assets/icons/tv/`，保持上述命名。
2. 将手机图标复制到 Android `mipmap-*` 与 iOS `AppIcon.appiconset` 中；TV Banner 复制到 Android `drawable-*` 中。
3. 清理应用缓存/重编译后验证图标显示；若有其他形态需求，直接复用手机图标。
