# Live Caption

A React Native (Expo) app that records speech from the microphone and displays
a live transcript alongside a translated caption. Pick a spoken language and a
target language, tap the microphone, and speak freely.

> Note: transcription/translation currently uses placeholder demo text after
> recording starts (`SAMPLE_TRANSCRIPT` / `SAMPLE_TRANSLATION` in `App.tsx`).
> Wire in a speech-to-text and translation service to go live.

## Features

- Microphone recording via `expo-audio` (high-quality preset)
- Live transcript card with a "LIVE" indicator while listening
- Translated caption card showing the active target language
- Source language picker with auto-detect plus English, Spanish, French,
  German, and Japanese
- Target language picker for caption output
- Mic permission handling with user-friendly alerts
- Portrait-only light UI for phones and tablets

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo Go](https://expo.dev/go) on a physical device, or an iOS Simulator /
  Android Emulator for local development

## Getting started

```bash
npm install
npm start
```

Then open the app with Expo Go (scan the QR code), or press:

- `i` — open in iOS Simulator
- `a` — open in Android Emulator
- `w` — open in web browser

## Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm start`     | Start the Expo dev server                |
| `npm run ios`   | Start and open in iOS Simulator          |
| `npm run android` | Start and open in Android Emulator     |
| `npm run web`   | Start and open in web browser            |

## Project structure

```
.
├── App.tsx          # App entry: recording flow, caption UI, language pickers
├── app.json         # Expo config (name, permissions, plugins)
├── package.json     # Dependencies and scripts
└── tsconfig.json    # TypeScript config (extends expo/tsconfig.base)
```

## Permissions

- **iOS** (`NSMicrophoneUsageDescription`): microphone access is used to
  transcribe and translate speech.
- **Android** (`RECORD_AUDIO`): required for microphone recording.

## Tech stack

- Expo ~58, React 19, React Native 0.88
- `expo-audio` for recording, `expo-status-bar` for the status bar
- TypeScript (strict mode)
