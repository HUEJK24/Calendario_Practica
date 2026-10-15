import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';
import { getCategory } from '../../domain/constants/eventMeta';
import {
  WEEKDAYS_SHORT,
  buildMonthMatrix,
  isSameDay,
  monthLabel,
  toISODate,
} from '../../domain/utils/date';

const MAX_DOTS = 3;

export function Calendar({ viewDate, selectedDate, eventsByDay, onPrevMonth, onNextMonth, onSelectDate }) {
  const today = new Date();
  const weeks = buildMonthMatrix(viewDate);
  const currentMonth = viewDate.getMonth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onPrevMonth} style={styles.navButton}>
          <Text style={styles.navSymbol}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel(viewDate)}</Text>
        <Pressable accessibilityRole="button" onPress={onNextMonth} style={styles.navButton}>
          <Text style={styles.navSymbol}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS_SHORT.map((label) => (
          <Text key={label} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={toISODate(week[0])} style={styles.weekRow}>
          {week.map((day) => {
            const iso = toISODate(day);
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            const dayEvents = eventsByDay[iso] || [];
            const dots = dayEvents.slice(0, MAX_DOTS);

            return (
              <Pressable
                key={iso}
                accessibilityRole="button"
                onPress={() => onSelectDate(day)}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.dayBubble,
                    isToday && !isSelected ? styles.todayBubble : null,
                    isSelected ? styles.selectedBubble : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth ? styles.dayTextMuted : null,
                      isSelected ? styles.dayTextSelected : null,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </View>
                <View style={styles.dotsRow}>
                  {dots.map((event) => (
                    <View
                      key={event.id}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isSelected
                            ? colors.primaryText
                            : getCategory(event.category).color,
                        },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  monthLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  navSymbol: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLabel: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  cell: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
  },
  dayBubble: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  todayBubble: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  selectedBubble: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  dayTextMuted: {
    color: colors.border,
  },
  dayTextSelected: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    marginTop: 2,
  },
  dot: {
    borderRadius: radius.pill,
    height: 5,
    width: 5,
  },
});
