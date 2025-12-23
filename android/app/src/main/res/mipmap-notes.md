# Launcher asset placement (not committed)

This project keeps a minimal set of launcher mipmap directories under version control without bundling binary PNGs. Place the provided assets in the following paths before building:

- `android/app/src/main/res/mipmap-tvdpi/ic_launcher.png` → **1280x768** (from `icon-1280x768.png`) — for Android TV launchers.
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` → **1920x720** (from `icon-1920x720.png`) — single phone density; higher densities will downscale from this.

If you need crisper icons on very high-density phones, add optional buckets (`xhdpi`, `xxhdpi`, `xxxhdpi`) with appropriately scaled assets.

Round icon assets are no longer required. The adaptive icon XML is defined in `mipmap-anydpi-v26/ic_launcher.xml`; keep that file unchanged.
