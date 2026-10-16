import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../theme/theme';
import { MONTHS, startOfDay } from '../../domain/utils/date';

const MONTHS_SHORT = MONTHS.map((month) => month.slice(0, 3));
const YEARS_PER_PAGE = 12;

function Step({ index, label, active }) {
  return (
    <View style={[styles.step, active ? styles.stepActive : null]}>
      <Text style={[styles.stepText, active ? styles.stepTextActive : null]}>
        {index}. {label}
      </Text>
    </View>
  );
}

export function MonthYearPicker({ visible, initialDate, onConfirm, onClose }) {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState('year');
  const [tempDate, setTempDate] = useState(() => startOfDay(initialDate));
  const [windowStart, setWindowStart] = useState(() => startOfDay(initialDate).getFullYear() - 5);
  const today = new Date();

  const years = Array.from({ length: YEARS_PER_PAGE }, (_, index) => windowStart + index);

  function pickYear(year) {
    const month = tempDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    setTempDate(new Date(year, month, Math.min(tempDate.getDate(), lastDay)));
    setStage('month');
  }

  function pickMonth(month) {
    const year = tempDate.getFullYear();
    const lastDay = new Date(year, month + 1, 0).getDate();
    onConfirm(new Date(year, month, Math.min(tempDate.getDate(), lastDay)));
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}
        >
          <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
            <View style={styles.grabber} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Elegir mes y año</Text>
                <Text style={styles.sheetSubtitle}>
                  {stage === 'year' ? 'Primero elige el año' : 'Ahora elige el mes'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Cerrar selector de mes y año"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Text style={styles.closeSymbol}>×</Text>
              </Pressable>
            </View>

            <View style={styles.steps}>
              <Step index={1} label="Año" active={stage === 'year'} />
              <View style={styles.stepDivider} />
              <Step index={2} label="Mes" active={stage === 'month'} />
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {stage === 'year' ? (
                <>
                  <View style={styles.navRow}>
                    <Pressable
                      accessibilityLabel="Años anteriores"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setWindowStart((current) => current - YEARS_PER_PAGE)}
                      style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.navSymbol}>‹</Text>
                    </Pressable>
                    <Text style={styles.rangeLabel}>
                      {windowStart} – {windowStart + YEARS_PER_PAGE - 1}
                    </Text>
                    <Pressable
                      accessibilityLabel="Años siguientes"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setWindowStart((current) => current + YEARS_PER_PAGE)}
                      style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.navSymbol}>›</Text>
                    </Pressable>
                  </View>

                  <View style={styles.grid}>
                    {years.map((year) => {
                      const isActive = year === tempDate.getFullYear();
                      const isCurrent = year === today.getFullYear();
                      return (
                        <Pressable
                          key={year}
                          accessibilityLabel={`Año ${year}`}
                          accessibilityRole="button"
                          onPress={() => pickYear(year)}
                          style={({ pressed }) => [
                            styles.cell,
                            isActive ? styles.cellActive : null,
                            pressed ? styles.pressed : null,
                          ]}
                        >
                          <Text style={[styles.cellText, isActive ? styles.cellTextActive : null]}>
                            {year}
                          </Text>
                          {isCurrent ? <View style={styles.currentDot} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.navRow}>
                    <Pressable
                      accessibilityLabel="Cambiar año"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setStage('year')}
                      style={({ pressed }) => (pressed ? styles.pressed : null)}
                    >
                      <Text style={styles.backLink}>← Cambiar año</Text>
                    </Pressable>
                    <Text style={styles.rangeLabel}>{tempDate.getFullYear()}</Text>
                  </View>

                  <View style={styles.grid}>
                    {MONTHS_SHORT.map((label, month) => {
                      const isActive = month === tempDate.getMonth();
                      const isCurrent =
                        month === today.getMonth() &&
                        tempDate.getFullYear() === today.getFullYear();
                      return (
                        <Pressable
                          key={label}
                          accessibilityLabel={label}
                          accessibilityRole="button"
                          onPress={() => pickMonth(month)}
                          style={({ pressed }) => [
                            styles.cell,
                            isActive ? styles.cellActive : null,
                            pressed ? styles.pressed : null,
                          ]}
                        >
                          <Text style={[styles.cellText, isActive ? styles.cellTextActive : null]}>
                            {label}
                          </Text>
                          {isCurrent ? <View style={styles.currentDot} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    maxHeight: '90%',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing.md,
    width: 44,
  },
  sheetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeSymbol: {
    color: colors.textSoft,
    fontSize: 22,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  steps: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  step: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  stepActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  stepText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  stepTextActive: {
    color: colors.primary,
  },
  stepDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginHorizontal: spacing.sm,
    width: 18,
  },
  navRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 44,
  },
  rangeLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  navSymbol: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  backLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: '30%',
    paddingVertical: spacing.sm,
  },
  cellActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellText: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: '700',
  },
  cellTextActive: {
    color: colors.primaryText,
  },
  currentDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 4,
    marginTop: 4,
    width: 4,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelLabel: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: '700',
  },
});
