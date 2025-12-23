# Launcher asset placement (not committed)

This project keeps the launcher mipmap directories under version control without bundling binary PNGs. Place the provided assets in the following paths before building:

- `android/app/src/main/res/mipmap-ldpi/ic_launcher.png` and `ic_launcher_round.png` → **400x240** (from `icon-400x240.png`)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` and `ic_launcher_round.png` → **800x480** (from `icon-800x480.png`)
- `android/app/src/main/res/mipmap-tvdpi/ic_launcher.png` and `ic_launcher_round.png` → **1280x768** (from `icon-1280x768.png`)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` and `ic_launcher_round.png` → **1920x720** (from `icon-1920x720.png`)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` and `ic_launcher_round.png` → **2320x720** (from `icon-2320x720.png`)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` and `ic_launcher_round.png` → **3840x1440** (from `icon-3840x1440.png`)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` and `ic_launcher_round.png` → **4640x1440** (from `icon-4640x1440.png`)

Round icons should use the same source asset per density. The adaptive icon XML is defined in `mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml`; keep those files unchanged.
