import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';
import { getCategory, getPriority } from '../../domain/constants/eventMeta';
import { formatTimeRange } from '../../domain/utils/date';

export function EventCard({ event, onPress }) {
  const category = getCategory(event.category);
  const priority = getPriority(event.priority);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.cardPressed : null]}
    >
      <View style={[styles.accentBar, { backgroundColor: category.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={[styles.priorityPill, { borderColor: `${priority.color}66` }]}>
            <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
            <Text style={[styles.priorityLabel, { color: priority.color }]}>{priority.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.time}>{formatTimeRange(event.startTime, event.endTime)}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={[styles.category, { color: category.color }]}>{category.label}</Text>
        </View>

        {event.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}

        {onPress ? (
          <Text style={styles.editHint}>Editar</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.1,
    marginRight: spacing.sm,
  },
  priorityPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  priorityDot: {
    borderRadius: radius.pill,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs + 2,
  },
  time: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  dotSeparator: {
    color: colors.muted,
    marginHorizontal: spacing.xs,
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs + 2,
  },
  editHint: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
});
