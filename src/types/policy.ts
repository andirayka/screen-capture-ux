/**
 * The three capture policies the demo can be in.
 *
 * `allowed`  — nothing is intercepted. Screenshots, recordings, and the app
 *              switcher preview all behave exactly as the platform intends.
 * `detected` — screenshots still succeed, but the app is told about them and
 *              can react. This is the Instagram behaviour.
 * `blocked`  — the platform is asked to refuse the capture entirely.
 */
export type CapturePolicy = 'allowed' | 'detected' | 'blocked';

export type DetectionStatus =
  'inactive' | 'requesting' | 'active' | 'unavailable';

export type DetectionRecord = {
  policy: CapturePolicy;
  status: DetectionStatus;
  note: string | null;
};

export type AppliedRecord = {
  policy: CapturePolicy;
  ok: boolean;
};

/**
 * What `expo-screen-capture` hands back from `addScreenshotListener`. Declared
 * structurally so consumers depend on the behaviour — being able to remove the
 * listener — rather than on the library's internal type package.
 */
export type ScreenshotSubscription = {
  remove: () => void;
};
