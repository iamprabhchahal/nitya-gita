# Nitya Gita

An iOS-first Bhagavad Gita companion and Lock Screen / Home Screen widget app built with **Expo SDK 58**, **Expo Router (`NativeTabs`)**, **`expo-glass-effect`** (iOS 26 Liquid Glass), and **`expo-widgets`** (`@expo/ui/swift-ui`).

## Features

- **Lock Screen & Home Screen Widgets (`expo-widgets`)**
  - Supports `accessoryRectangular`, `accessoryInline`, `systemSmall`, and `systemMedium`.
  - Deep links (`nityagita://verse/<chapter>/<verse>`) straight from any widget into that shloka and commentary.
  - Pre-scheduled offline WidgetKit timelines: Daily (14 days), Every 4 Hours (18 slots), Sequential (`1.1` → `18.78`), Saved Only, and one-tap **Pin to Lock Screen**.
- **iOS 26 Liquid Glass & Adaptive Celestial Dawn / Dusk**
  - Uses native `GlassView`, `GlassContainer`, and floating `NativeTabs` when supported, with safe frosted fallbacks in Expo Go or when Reduce Transparency is enabled.
- **100% Offline 701-Verse Dataset**
  - Compiled from `vedicscriptures/bhagavad-gita` (`assets/data/gita.json`) covering all **18 chapters / 701 verses** with Sanskrit Devanagari, IAST transliteration, English translation + commentary (Swami Sivananda), and Hindi translation (Swami Tejomayananda).
- **4-Tab Companion App**
  - **Today:** Daily/pinned shloka, English/Hindi switch, collapsible commentary, quick actions, and Lock Screen preview strip.
  - **Chapters:** All 18 chapters with reading progress + instant search across English, Hindi, Sanskrit, transliteration, and references like `2.47`.
  - **Saved:** Reading streak tracker, bookmarks, and private local reflections.
  - **Widget Studio:** Live Lock Screen & Home Screen preview, per-slot script controls, offline rotation cadence, and optional local Daily Reminder notifications.

## Quick Preview (Expo Go)

```bash
npm install
npx expo start
```

Scan the QR code in Expo Go on your iPhone to preview the 4-tab UI and live Widget Studio mockups. *(Native WidgetKit extensions and native `GlassView` fall back cleanly in Expo Go.)*

## Build a Free Unsigned `.ipa` (GitHub Actions + Sideloadly / AltStore)

This repository includes [`.github/workflows/build-ios-ipa.yml`](.github/workflows/build-ios-ipa.yml) running on `macos-26` (Xcode 26 / iOS 26 SDK):

1. Trigger **Actions → Build Unsigned iOS IPA → Run workflow** (or push to `main`).
2. Download the `NityaGita-unsigned-ipa` artifact and unzip `NityaGita-unsigned.ipa`.
3. Install onto your iPhone from Windows using **Sideloadly** or **AltStore** with a free Apple ID (resigns both the main app and the `ExpoWidgetsTarget` Lock Screen widget extension).

## Signed Cloud Build (EAS Build)

If you have a paid Apple Developer account:

```bash
EAS_NO_VCS=1 npx eas-cli@latest build --platform ios --profile preview
```

## Verification

```bash
npx tsc --noEmit
npx eslint .
```
