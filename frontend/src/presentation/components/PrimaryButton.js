import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

export function PrimaryButton({ title, onPress, loading = false, disabled = false, variant = 'primary' }) {
  const isInactive = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' ? styles.ghost : styles.primary,
        isInactive ? styles.disabled : null,
        pressed && !isInactive ? styles.pressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.primary : colors.primaryText} />
      ) : (
        <Text style={[styles.label, variant === 'ghost' ? styles.ghostLabel : null]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostLabel: {
    color: colors.primary,
  },
});
