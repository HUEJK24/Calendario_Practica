import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';
import { getCategory, getPriority } from '../../domain/constants/eventMeta';
import { formatTimeRange } from '../../domain/utils/date';

export function EventCard({ event, onPress }) {
  const category = getCategory(event.category);
  const priority = getPriority(event.priority);

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: category.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={[styles.priorityPill, { borderColor: priority.color }]}>
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
          <Text style={styles.editHint} onPress={onPress}>
            Editar
          </Text>
        ) : null}
      </View>
    </View>
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
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  priorityPill: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  priorityDot: {
    borderRadius: radius.pill,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  time: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  dotSeparator: {
    color: colors.muted,
    marginHorizontal: spacing.xs,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  editHint: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
