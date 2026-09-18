import { StyleSheet, Text, View } from 'react-native';

import {
  DETECTION_STARTING,
  DETECTION_UNAVAILABLE,
  POLICY_ACCENT,
  POLICY_LABEL,
  POLICY_STAGE_NOTE,
  SCREENSHOT_PROMPT,
  SWITCH_REFUSED,
} from '../constants/policy';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { CapturePolicy, DetectionStatus } from '../types/policy';

type ModeStageProps = {
  policy: CapturePolicy;
  detection: DetectionStatus;
  captureApplied: boolean | null;
  captureCount: number;
  note: string | null;
};

/**
 * What the platform is actually doing, rather than what the mode promises. The
 * two disagree on this phone more often than is comfortable, and a demo that
 * only shows the requested state teaches the wrong thing.
 */
function describeState(
  policy: CapturePolicy,
  detection: DetectionStatus,
  captureApplied: boolean | null,
): string {
  if (policy === 'allowed') return POLICY_STAGE_NOTE.allowed;

  if (policy === 'blocked') {
    return captureApplied === false
      ? SWITCH_REFUSED
      : POLICY_STAGE_NOTE.blocked;
  }

  if (detection === 'unavailable') return DETECTION_UNAVAILABLE;
  if (detection !== 'active') return DETECTION_STARTING;
  return POLICY_STAGE_NOTE.detected;
}

/**
 * The mode, stated large enough to read on camera. Blocked adds a nested frame,
 * because a sealed window is the whole point of that mode and the app gets no
 * event to react to when a capture is refused.
 */
export function ModeStage({
  policy,
  detection,
  captureApplied,
  captureCount,
  note,
}: ModeStageProps) {
  const accent = POLICY_ACCENT[policy];

  return (
    <View style={[styles.stage, { borderColor: accent }]}>
      {policy === 'blocked' ? (
        <View
          pointerEvents="none"
          style={[styles.seal, { borderColor: accent }]}
        />
      ) : null}

      <Text style={[styles.word, { color: accent }]}>
        {POLICY_LABEL[policy].toUpperCase()}
      </Text>

      <Text style={styles.state}>
        {describeState(policy, detection, captureApplied)}
      </Text>

      {policy === 'detected' ? (
        <View style={[styles.counter, { borderColor: `${accent}66` }]}>
          <Text style={[styles.counterValue, { color: accent }]}>
            {captureCount}
          </Text>
          <Text style={styles.counterLabel}>
            {captureCount === 1 ? 'capture seen' : 'captures seen'}
          </Text>
        </View>
      ) : null}

      {note === null ? null : (
        <Text style={[styles.note, { color: accent }]}>{note}</Text>
      )}

      <Text style={styles.prompt}>{SCREENSHOT_PROMPT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.card,
    borderWidth: 2,
    borderRadius: RADIUS.card + 4,
    backgroundColor: COLORS.surface,
    padding: SPACING.card,
    overflow: 'hidden',
  },
  // The seal: a second frame inside the mode frame, so "sealed" is a shape and
  // not a word the viewer has to read.
  seal: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    borderWidth: 3,
    borderRadius: RADIUS.card,
  },
  word: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  state: {
    color: COLORS.text,
    fontSize: 15.5,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.tight + 2,
    paddingHorizontal: SPACING.card,
  },
  counterValue: {
    fontSize: 40,
    fontWeight: '800',
  },
  counterLabel: {
    color: COLORS.muted,
    fontSize: 13.5,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 300,
  },
  prompt: {
    color: COLORS.dim,
    fontSize: 13,
  },
});
