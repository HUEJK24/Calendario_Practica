import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

export function ChipGroup({ label, options, value, onChange }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const isActive = option.key === value;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              onPress={() => onChange(option.key)}
              style={[
                styles.chip,
                { borderColor: isActive ? option.color : colors.border },
                isActive ? { backgroundColor: `${option.color}22` } : null,
              ]}
            >
              <View style={[styles.dot, { backgroundColor: option.color }]} />
              <Text style={[styles.chipLabel, isActive ? { color: option.color } : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    borderRadius: radius.pill,
    height: 7,
    marginRight: 6,
    width: 7,
  },
  chipLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
});
