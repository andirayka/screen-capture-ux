import * as ScreenCapture from 'expo-screen-capture';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { CAPTURE_KEY } from '../constants/policy';
import type {
  AppliedRecord,
  CapturePolicy,
  DetectionRecord,
  DetectionStatus,
  ScreenshotSubscription,
} from '../types/policy';

export type ScreenshotPolicy = {
  /** Whether the platform accepted this policy's switch; null while it is in flight. */
  captureApplied: boolean | null;
  detection: DetectionStatus;
  statusNote: string | null;
  screenshotCount: number;
  lastScreenshotAt: number | null;
  available: boolean | null;
};

/**
 * Owns every interaction with the capture library for the screen currently
 * mounted, and applies the requested policy to the platform.
 *
 * Two effects, deliberately separate:
 *
 *  1. the policy effect owns the runtime switch while the screen is alive;
 *  2. the teardown effect always restores capture on unmount.
 *
 * Collapsing them leaves the device unable to take screenshots anywhere after
 * the user switches to `blocked` and leaves the screen.
 */
export function useScreenshotPolicy(policy: CapturePolicy): ScreenshotPolicy {
  const [applied, setApplied] = useState<AppliedRecord | null>(null);
  const [detection, setDetection] = useState<DetectionRecord | null>(null);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [lastScreenshotAt, setLastScreenshotAt] = useState<number | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  // Reported once for the stage. The module answers this from the
  // platform, so it is the only honest source for "will this work here".
  useEffect(() => {
    let mounted = true;

    void ScreenCapture.isAvailableAsync()
      .then((value) => {
        if (mounted) setAvailable(value);
      })
      .catch(() => {
        if (mounted) setAvailable(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const apply = async () => {
      try {
        await (policy === 'blocked'
          ? ScreenCapture.preventScreenCaptureAsync(CAPTURE_KEY)
          : ScreenCapture.allowScreenCaptureAsync(CAPTURE_KEY));
        if (mounted) setApplied({ policy, ok: true });
      } catch {
        if (mounted) setApplied({ policy, ok: false });
      }
    };

    void apply();

    return () => {
      mounted = false;
    };
  }, [policy]);

  useEffect(
    () => () => {
      ScreenCapture.allowScreenCaptureAsync(CAPTURE_KEY).catch(() => {
        // Nothing left to do at teardown; the screen is already gone.
      });
    },
    [],
  );

  useEffect(() => {
    if (policy !== 'detected') return undefined;

    let subscription: ScreenshotSubscription | undefined;
    let mounted = true;

    const start = async () => {
      // Awaiting first keeps every state update below on the async side of the
      // boundary, which React Compiler's lint rules require of effect bodies.
      const isAvailable = await ScreenCapture.isAvailableAsync();
      if (!mounted) return;

      if (!isAvailable) {
        setDetection({
          policy,
          status: 'unavailable',
          note: 'This device does not expose a screenshot callback.',
        });
        return;
      }

      // Android reports captures through the media store on older releases,
      // which costs a permission; API 34 and up reports them on its own. The
      // Expo docs say "Android 14+" in prose and "post-Android 13" in the API
      // table, so request only where it is unambiguously required.
      if (Platform.OS === 'android' && Number(Platform.Version) < 34) {
        const permission = await ScreenCapture.requestPermissionsAsync();
        if (!mounted) return;

        if (!permission.granted) {
          setDetection({
            policy,
            status: 'unavailable',
            note: 'Detection needs a photo permission on this Android version. Grant it and reselect the mode.',
          });
          return;
        }
      }

      const next = ScreenCapture.addScreenshotListener(() => {
        setScreenshotCount((count) => count + 1);
        setLastScreenshotAt(Date.now());
      });

      if (!mounted) {
        next.remove();
        return;
      }

      subscription = next;
      setDetection({ policy, status: 'active', note: null });
    };

    void start().catch(() => {
      if (mounted) {
        setDetection({
          policy,
          status: 'unavailable',
          note: 'The screenshot listener could not be registered.',
        });
      }
    });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [policy]);

  // `detection` is keyed by the policy it was produced under, so a mode change
  // never needs a reset effect to avoid showing a stale result.
  const current: DetectionRecord | null =
    detection?.policy === policy ? detection : null;

  const detectionStatus: DetectionStatus =
    policy !== 'detected' ? 'inactive' : (current?.status ?? 'requesting');

  const statusNote =
    applied?.policy === policy && !applied.ok
      ? 'The system refused the capture state change for this mode.'
      : (current?.note ?? null);

  return {
    captureApplied: applied?.policy === policy ? applied.ok : null,
    detection: detectionStatus,
    statusNote,
    screenshotCount,
    lastScreenshotAt,
    available,
  };
}
