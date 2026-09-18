import type { CapturePolicy } from '../types/policy';

/**
 * Every call into `expo-screen-capture` is keyed. Distinct keys keep this
 * screen's protection from being cancelled by anything else in the app that
 * changes capture state — the same reason the library offers keys at all.
 */
export const CAPTURE_KEY = 'screen-capture-ux/policy';

export const POLICIES: readonly CapturePolicy[] = [
  'allowed',
  'detected',
  'blocked',
];

export const POLICY_LABEL: Record<CapturePolicy, string> = {
  allowed: 'Allowed',
  detected: 'Detected',
  blocked: 'Blocked',
};

/** The rule each mode applies. One line, read at a glance in the selector. */
export const POLICY_SUMMARY: Record<CapturePolicy, string> = {
  allowed: 'The app does nothing about capture.',
  detected: 'The app listens for captures.',
  blocked: 'The app asks the platform to refuse.',
};

/** What that rule costs once it is on. The stage headline of each mode. */
export const POLICY_STAGE_NOTE: Record<CapturePolicy, string> = {
  allowed: 'Nothing is intercepted.',
  detected: 'The capture succeeds. The app is told after the fact.',
  blocked: 'Nothing is saved, and the app is never told.',
};

export const POLICY_ACCENT: Record<CapturePolicy, string> = {
  allowed: '#34D399',
  detected: '#FBBF24',
  blocked: '#F87171',
};

/**
 * Device truth, shown in place of the mode's promise when the two disagree.
 * The stage reports what this phone is doing, never what the mode implies.
 */
export const DETECTION_STARTING = 'Starting detection…';
export const DETECTION_UNAVAILABLE = 'Detection unavailable on this device.';
export const SWITCH_REFUSED = 'The platform refused this mode.';
export const CAPTURE_API_MISSING = 'This device has no capture API.';

export const SCREENSHOT_PROMPT = 'Take a screenshot now.';

/** How long the detection alert stays on screen after a capture. */
export const NOTICE_DURATION_MS = 2600;
