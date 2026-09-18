# AGENTS.md

Guidance for AI agents working in this repository. Read this before changing
code.

## What this project is

A React Native demo of the three screenshot policies an app can hold, on
Android and iOS: allow, allow-and-detect, and refuse. It exists to make the
platform differences visible on a real device, and to be recorded for a post.

## Non-negotiables

1. **Leaving the screen must never leave the device blocked.** The policy effect
   owns the runtime switch while the screen is alive; a separate teardown effect
   always calls `allowScreenCaptureAsync`. Collapsing them leaves the phone
   unable to take screenshots anywhere after the user selects `blocked` and
   navigates away.
2. **Every library call is keyed.** `CAPTURE_KEY` in `src/constants/policy.ts` is
   passed to both `prevent…` and `allow…`. A key mismatch silently fails to
   re-enable capture for this screen.
3. **No `setState` synchronously inside an effect body.** React Compiler's lint
   rules reject it. State that must be set when an effect runs is set after an
   `await` or from a callback — see the `isAvailableAsync()` await that opens the
   detection effect.
4. **Never read `ref.current` during render.** Use `useAnimatedValue` from
   `react-native` for animated values, not `useRef(new Animated.Value(...))`.
5. **Do not accumulate screenshot state by counting in a boolean.** The listener
   is the only source of truth, and it may fire while the previous notice is
   still on screen. `useTransientFlag` records expiry by trigger value for
   exactly this reason.
6. **Report what the device does, not what the mode promises.** The stage
   exists because detection needs a permission on older Android and prevention
   is unsupported behaviour on iOS. Never replace a real capability check with
   an assumption. When the platform refuses a switch, the stage says so.
7. **Never invent a capture event.** A refused capture produces nothing on
   Android — no callback, no error — so `blocked` states the seal rather than
   reacting. The alert fires only from the listener, and the listener is
   registered only in `detected`. A blocked mode that animates on a screenshot
   would be a lie the whole demo is built to expose.
8. **No real data on screen.** The demo shows mode names and their colours, and
   nothing else. Never put anything real, or anything resembling a real
   customer, into this repository.
9. **All `expo-screen-capture` calls stay in `useScreenshotPolicy`.** Components
   take props and draw. This is what makes the modes auditable in one file.

## Conventions

- TypeScript strict. `npm run typecheck` must pass.
- ESLint flat config plus Prettier. `npm run lint` must pass.
- Import order: external packages first, then internal modules.
- Comments explain _why_, never _what_.
- Copy, colours, and timings live in `src/constants/`, not in components.

## Verifying changes

```sh
npm run typecheck
npm run lint
npx expo export --platform android   # proves the bundle builds
```

The behaviour itself only exists on a real device or emulator:

- Android emulator: `adb shell input keyevent 120` fires a screenshot, then read
  what the system wrote to `/sdcard/Pictures/Screenshots`. In `blocked` the file
  is written and is entirely black; in `allowed` it carries the screen. Compare
  the two, not the presence of a file.
- Do **not** use `adb shell screencap` as the check. It bypasses `FLAG_SECURE`
  and returns the content in every mode, so it reports success while blocked.
- The recents card is the other half: `adb shell input keyevent 187` while
  blocked, and the card region comes back blank against a visible card in
  `allowed`.
- iOS Simulator: **Device → Trigger Screenshot**.

Detection's permission path cannot be tested in Expo Go on Android 13: Expo Go
does not declare `READ_MEDIA_IMAGES`, so the request is refused without a dialog
and the stage reads `unavailable`. Use a development or preview build, or an
Android 12 or lower device, where Expo Go does declare `READ_EXTERNAL_STORAGE`.

If you cannot run one, say so explicitly instead of claiming the modes work.

## Expo SDK 57

Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
touching Expo APIs, and use `npx expo install <pkg>` rather than
`npm install <pkg>` so versions stay SDK-compatible.
