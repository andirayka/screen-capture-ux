import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  POLICY_ACCENT,
  POLICY_LABEL,
  POLICY_SUMMARY,
  POLICIES,
} from '../constants/policy';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { CapturePolicy } from '../types/policy';

type ModeSelectorProps = {
  policy: CapturePolicy;
  onChange: (next: CapturePolicy) => void;
};

/**
 * The three modes, made obvious: the selected one carries its accent as a thick
 * border, a filled tint, and an accent label. The other two stay readable rather
 * than dimmed, because the point of the demo is comparing all three.
 */
export function ModeSelector({ policy, onChange }: ModeSelectorProps) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {POLICIES.map((candidate) => {
        const selected = candidate === policy;
        const accent = POLICY_ACCENT[candidate];

        return (
          <Pressable
            key={candidate}
            onPress={() => onChange(candidate)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.option,
              selected && {
                borderColor: accent,
                borderWidth: 2,
                backgroundColor: `${accent}1F`,
              },
            ]}
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: selected ? accent : COLORS.dim,
                    transform: [{ scale: selected ? 1.4 : 1 }],
                  },
                ]}
              />
              <Text style={[styles.label, selected && { color: accent }]}>
                {POLICY_LABEL[candidate]}
              </Text>
            </View>
            <Text style={[styles.summary, selected && styles.summarySelected]}>
              {POLICY_SUMMARY[candidate]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: SPACING.tight + 2,
  },
  option: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.row,
    paddingHorizontal: SPACING.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  label: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  summary: {
    color: COLORS.muted,
    fontSize: 13.5,
    lineHeight: 18,
    marginTop: 4,
  },
  summarySelected: {
    color: COLORS.text,
  },
});
