import { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useAnimatedValue,
} from 'react-native';

import { POLICY_ACCENT } from '../constants/policy';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

type DetectedAlertProps = {
  visible: boolean;
  /** Changes on every capture, so a second screenshot re-jolts the alert. */
  trigger: number | null;
  count: number;
};

/** Damped, symmetric: right, left, right, left, settle. */
const SHAKE = [1, -1, 0.7, -0.45, 0];
const SHAKE_STEP_MS = 70;

/**
 * The detection result, at full volume: a screenshot that is already in Photos
 * is worth a whole screen, not a pill. It stays mounted and animates, so a
 * second capture re-jolts it instead of popping it back into layout.
 */
export function DetectedAlert({ visible, trigger, count }: DetectedAlertProps) {
  const progress = useAnimatedValue(0);
  const shake = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 160 : 240,
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  useEffect(() => {
    if (trigger === null) return;
    Animated.sequence(
      SHAKE.map((step) =>
        Animated.timing(shake, {
          toValue: step,
          duration: SHAKE_STEP_MS,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [trigger, shake]);

  const shakeX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-16, 16],
  });

  const pop = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { opacity: progress }]}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          styles.card,
          { transform: [{ translateX: shakeX }, { scale: pop }] },
        ]}
      >
        <Text style={styles.word}>SCREENSHOT DETECTED</Text>
        <View style={styles.countRow}>
          <Text style={styles.countValue}>{count}</Text>
          <Text style={styles.countLabel}>
            {count === 1 ? 'capture' : 'captures'}
          </Text>
        </View>
        <Text style={styles.body}>
          The app was told. The file is already in Photos.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const INK = '#0A0A0B';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.screen,
    backgroundColor: COLORS.scrim,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.tight,
    backgroundColor: POLICY_ACCENT.detected,
    borderRadius: RADIUS.card + 6,
    paddingVertical: SPACING.card + 8,
    paddingHorizontal: SPACING.card,
  },
  word: {
    color: INK,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: SPACING.tight,
  },
  countValue: {
    color: INK,
    fontSize: 46,
    fontWeight: '800',
  },
  countLabel: {
    color: 'rgba(10, 10, 11, 0.65)',
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    color: 'rgba(10, 10, 11, 0.72)',
    fontSize: 14,
    lineHeight: 19,
    marginTop: SPACING.tight,
    textAlign: 'center',
  },
});
