import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

const MINUTE_STEP = 5;

function parse(value) {
  const [hour, minute] = (value || '00:00').split(':').map(Number);
  return { hour: Number.isNaN(hour) ? 0 : hour, minute: Number.isNaN(minute) ? 0 : minute };
}

function format(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function TimeField({ label, value, onChange }) {
  const { hour, minute } = parse(value);

  function shiftMinutes(delta) {
    const total = (hour * 60 + minute + delta + 24 * 60) % (24 * 60);
    onChange(format(Math.floor(total / 60), total % 60));
  }

  function shiftHours(delta) {
    const next = (hour + delta + 24) % 24;
    onChange(format(next, minute));
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.control}>
        <Stepper onPress={() => shiftHours(-1)} symbol="−" />
        <View style={styles.valueGroup}>
          <Text style={styles.value}>{format(hour, minute)}</Text>
          <Text style={styles.unit}>h</Text>
        </View>
        <Stepper onPress={() => shiftHours(1)} symbol="+" />
        <View style={styles.spacer} />
        <Stepper onPress={() => shiftMinutes(-MINUTE_STEP)} symbol="−" />
        <View style={styles.valueGroup}>
          <Text style={styles.value}>{String(minute).padStart(2, '0')}</Text>
          <Text style={styles.unit}>min</Text>
        </View>
        <Stepper onPress={() => shiftMinutes(MINUTE_STEP)} symbol="+" />
      </View>
    </View>
  );
}

function Stepper({ onPress, symbol }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.stepper, pressed && styles.stepperPressed]}
    >
      <Text style={styles.stepperSymbol}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs + 3,
  },
  control: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stepperPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  stepperSymbol: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  valueGroup: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginHorizontal: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  unit: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 2,
  },
  spacer: {
    width: spacing.md,
  },
});
