import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';
import { MonthYearPicker } from './MonthYearPicker';
import { getCategory } from '../../domain/constants/eventMeta';
import {
  WEEKDAYS_SHORT,
  buildMonthMatrix,
  isSameDay,
  monthLabel,
  toISODate,
} from '../../domain/utils/date';

const MAX_DOTS = 4;

export function Calendar({ viewDate, selectedDate, eventsByDay, onPrevMonth, onNextMonth, onSelectDate }) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const today = new Date();
  const weeks = buildMonthMatrix(viewDate);
  const currentMonth = viewDate.getMonth();

  function handleConfirmDate(date) {
    onSelectDate(date);
    setIsPickerVisible(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Mes anterior"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onPrevMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navPressed]}
        >
          <Text style={styles.navSymbol}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Elegir mes y año. Mes actual: ${monthLabel(viewDate)}`}
          hitSlop={8}
          onPress={() => setIsPickerVisible(true)}
          style={({ pressed }) => [styles.monthButton, pressed && styles.monthPressed]}
        >
          <Text style={styles.monthLabel}>{monthLabel(viewDate)}</Text>
          <Text style={styles.monthChevron}>▾</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Mes siguiente"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onNextMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navPressed]}
        >
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
                hitSlop={6}
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
                      isToday && !isSelected ? styles.dayTextToday : null,
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

      <MonthYearPicker
        initialDate={selectedDate}
        key={isPickerVisible ? 'open' : 'closed'}
        onConfirm={handleConfirmDate}
        onClose={() => setIsPickerVisible(false)}
        visible={isPickerVisible}
      />
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
    paddingHorizontal: spacing.xs,
  },
  monthButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  monthPressed: {
    opacity: 0.86,
  },
  monthLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  monthChevron: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  navPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  navSymbol: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLabel: {
    color: colors.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    paddingVertical: spacing.xs + 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cell: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs + 2,
  },
  dayBubble: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  todayBubble: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  selectedBubble: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  dayTextMuted: {
    color: colors.muted,
    opacity: 0.6,
  },
  dayTextSelected: {
    color: colors.primaryText,
    fontWeight: '800',
  },
  dayTextToday: {
    color: colors.primary,
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    height: 10,
    marginTop: 3,
  },
  dot: {
    borderRadius: radius.pill,
    height: 5.5,
    width: 5.5,
  },
});
