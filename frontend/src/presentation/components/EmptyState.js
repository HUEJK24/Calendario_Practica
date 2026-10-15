import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

export function EmptyState({ title, message }) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <View style={styles.circleInner} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72,
  },
  circleInner: {
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 30,
    width: 30,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
