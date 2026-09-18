import { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DetectedAlert } from '../components/DetectedAlert';
import { ModeSelector } from '../components/ModeSelector';
import { ModeStage } from '../components/ModeStage';
import { CAPTURE_API_MISSING, NOTICE_DURATION_MS } from '../constants/policy';
import { COLORS, SPACING } from '../constants/theme';
import { useScreenshotPolicy } from '../hooks/useScreenshotPolicy';
import { useTransientFlag } from '../hooks/useTransientFlag';
import type { CapturePolicy } from '../types/policy';

export function PolicyScreen() {
  const [policy, setPolicy] = useState<CapturePolicy>('allowed');

  const {
    captureApplied,
    detection,
    statusNote,
    screenshotCount,
    lastScreenshotAt,
    available,
  } = useScreenshotPolicy(policy);

  const alertVisible = useTransientFlag(lastScreenshotAt, NOTICE_DURATION_MS);
  const note = statusNote ?? (available === false ? CAPTURE_API_MISSING : null);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <Text style={styles.title}>Screenshot modes</Text>
        <ModeSelector policy={policy} onChange={setPolicy} />
        <ModeStage
          policy={policy}
          detection={detection}
          captureApplied={captureApplied}
          captureCount={screenshotCount}
          note={note}
        />
      </View>

      <DetectedAlert
        visible={alertVisible}
        trigger={lastScreenshotAt}
        count={screenshotCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.screen,
    gap: SPACING.card,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
});
