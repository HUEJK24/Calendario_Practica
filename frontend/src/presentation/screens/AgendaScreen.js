import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { Calendar } from '../components/Calendar';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { EventFormModal } from '../components/EventFormModal';
import { colors, radius, shadow, spacing } from '../../theme/theme';
import { addMonths, formatLongDate, startOfDay } from '../../domain/utils/date';

export function AgendaScreen() {
  const { user, signOut } = useAuth();
  const {
    eventsByDay,
    isLoading,
    loadError,
    refresh,
    selectedDate,
    setSelectedDate,
    getEventsForDay,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  const [viewDate, setViewDate] = useState(() => startOfDay(selectedDate));
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const dayEvents = useMemo(
    () => getEventsForDay(selectedDate),
    [getEventsForDay, selectedDate]
  );

  const initial = (user?.email || '?').charAt(0).toUpperCase();

  function handleSelectDate(day) {
    const next = startOfDay(day);
    setSelectedDate(next);
    if (next.getMonth() !== viewDate.getMonth() || next.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(next);
    }
  }

  function openCreate() {
    setEditingEvent(null);
    setModalVisible(true);
  }

  function openEdit(event) {
    setEditingEvent(event);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingEvent(null);
  }

  async function handleSubmit(payload) {
    if (editingEvent) {
      await updateEvent(editingEvent.id, payload);
    } else {
      await addEvent(payload);
    }
    closeModal();
  }

  async function handleDelete(id) {
    await deleteEvent(id);
    closeModal();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Mi agenda</Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable accessibilityRole="button" onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          eventsByDay={eventsByDay}
          onNextMonth={() => setViewDate((current) => addMonths(current, 1))}
          onPrevMonth={() => setViewDate((current) => addMonths(current, -1))}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
          viewDate={viewDate}
        />

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{formatLongDate(selectedDate)}</Text>
            <Text style={styles.sectionSubtitle}>
              {dayEvents.length === 0
                ? 'Sin eventos'
                : `${dayEvents.length} ${dayEvents.length === 1 ? 'evento' : 'eventos'}`}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : dayEvents.length === 0 ? (
          <EmptyState
            message="Toca el botón + para agendar una nueva actividad en este día."
            title="Día despejado"
          />
        ) : (
          dayEvents.map((event) => (
            <EventCard event={event} key={event.id} onPress={() => openEdit(event)} />
          ))
        )}
      </ScrollView>

      <Pressable accessibilityRole="button" onPress={openCreate} style={styles.fab}>
        <Text style={styles.fabSymbol}>+</Text>
      </Pressable>

      <EventFormModal
        date={selectedDate}
        initialEvent={editingEvent}
        key={modalVisible ? editingEvent?.id ?? 'new' : 'closed'}
        onClose={closeModal}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
        visible={modalVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 42,
  },
  avatarText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '700',
  },
  greeting: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    color: colors.muted,
    fontSize: 12,
    maxWidth: 180,
  },
  logoutButton: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  logoutText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
  },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: 13,
    marginRight: spacing.sm,
  },
  retryButton: {
    borderColor: colors.danger,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  retryText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  loader: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    bottom: spacing.lg,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    width: 60,
    ...shadow.floating,
  },
  fabSymbol: {
    color: colors.primaryText,
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 36,
    marginTop: -2,
  },
});
