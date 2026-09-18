# Screen Capture UX

A React Native playground for the three ways an app can treat a screenshot:
**allow it, allow it and notice, or refuse it.**

Instagram does the middle one — it tells you when someone screenshots a chat or
a story. The third one is the same Android window flag that also blanks your app
in the recents card. This project puts all three behind one switch so you can
feel the difference on a real phone.

## The three modes

| Mode              | Screenshot  | App notified | Recents preview   |
| ----------------- | ----------- | ------------ | ----------------- |
| Allowed           | works       | no           | shows the content |
| Allowed, detected | works       | **yes**      | shows the content |
| Blocked           | **refused** | no           | blanked (Android) |

Switch modes, then press your phone's screenshot buttons and watch what
happens — including what lands in Photos, and what a screen recording captures.
The app opens in **Allowed**, the control mode, so the untouched behaviour is the
first thing you see and nothing asks for a permission before you have chosen a
mode.

## Running it

`expo-screen-capture` ships inside Expo Go, so this runs without a native
build:

```sh
npm install
npm start          # then press i or a, or scan the QR code
```

For a standalone build to demo with (and to record the post):

```sh
eas build -p android --profile preview   # APK, installs straight from a link
```

Both EAS profiles set `android.buildType` to `apk`, because EAS defaults to an
AAB and a phone cannot install one directly.

### Triggering a screenshot without your hands

- Android emulator: `adb shell input keyevent 120`
- iOS Simulator: **Device → Trigger Screenshot** in the menu bar

## What actually happens on each platform

**Android.** `preventScreenCaptureAsync()` sets `FLAG_SECURE` on the window. The
platform then refuses to composite that window into a screenshot or onto a
non-secure display, and the recents card renders it blank. There is no partial
version of this — the recents blanking and the screenshot refusal are the same
flag.

What that looks like from the outside is not a refusal. On Android 14 and up the
system screenshot still succeeds and the file still lands in Photos — it is
entirely black, and nothing on screen says why. Older releases and some OEM
builds refuse the capture with a toast instead. Measure the file, not its
existence: while blocked it averages a luminance of ~0 against a normal ~26.

Detection is separate. Android 14 and up reports captures without a permission.
Below that the app has to watch the media store, which costs `READ_MEDIA_IMAGES`
(and `READ_EXTERNAL_STORAGE` before Android 13), and the permission has to be
declared in the manifest before the prompt can appear at all. That is why
`app.json` lists both. The app asks only when it has to, and says so in the
stage when the permission is refused.

**iOS.** There is no API to refuse a screenshot. What
`preventScreenCaptureAsync()` actually does is move the key window's layer
inside a `UITextField` whose `isSecureTextEntry` is true, because the system
excludes that layer from captures. It is a real defence and an unsupported one
— it depends on behaviour Apple documents only as "in some cases". During a
screen recording the module stops trying to be clever and drops a black view
over the app instead, because a recording cannot be refused at all.

## Project structure

```
App.tsx                             entry point
src/
├── components/
│   ├── ModeSelector.tsx            the three-way switch
│   ├── ModeStage.tsx               the selected mode, stated large
│   └── DetectedAlert.tsx           the full-screen capture alert
├── constants/
│   ├── policy.ts                   modes, copy, accents, timing
│   └── theme.ts                    colours, spacing, radii
├── hooks/
│   ├── useScreenshotPolicy.ts      all library calls live here
│   └── useTransientFlag.ts         timed visibility, effect-safe
├── screens/PolicyScreen.tsx        the demo surface
└── types/policy.ts                 shared types
```

Every call into `expo-screen-capture` is in `useScreenshotPolicy`. The
components take props and draw.

## Tuning

Mode copy and colours live in `src/constants/policy.ts`; the alert duration is
`NOTICE_DURATION_MS` in the same file. Spacing and colours are in
`src/constants/theme.ts`.

## Scripts

| Script                 | Purpose                                |
| ---------------------- | -------------------------------------- |
| `npm start`            | Expo dev server                        |
| `npm run android`      | Development build on a device          |
| `npm run ios`          | Development build on iOS               |
| `npm run typecheck`    | TypeScript, no emit                    |
| `npm run lint`         | ESLint                                 |
| `npm run format`       | Prettier write                         |
| `npm run format:check` | Prettier, no write                     |
| `npm run web`          | Expo web, where capture is unavailable |

## License

MIT
