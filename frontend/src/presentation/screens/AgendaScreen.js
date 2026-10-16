import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { Calendar } from '../components/Calendar';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { EventFormModal } from '../components/EventFormModal';
import { colors, radius, shadow, spacing } from '../../theme/theme';
import { addMonths, formatLongDate, startOfDay } from '../../domain/utils/date';

function SkeletonCard() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonBar} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonLineShort} />
        <View style={[styles.skeletonLine, { marginTop: spacing.sm }]} />
        <View style={[styles.skeletonLine, { width: '80%', marginTop: spacing.xs + 2 }]} />
      </View>
    </View>
  );
}

export function AgendaScreen({ navigation }) {
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
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={signOut}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={refresh}
            style={({ pressed }) => [styles.retryButton, pressed && styles.logoutPressed]}
          >
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
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>{formatLongDate(selectedDate)}</Text>
            <Text style={styles.sectionSubtitle}>
              {isLoading
                ? 'Cargando eventos...'
                : dayEvents.length === 0
                ? 'Sin eventos este día'
                : `${dayEvents.length} ${dayEvents.length === 1 ? 'evento' : 'eventos'}`}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Ver todos los eventos"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => navigation.navigate('Events')}
            style={({ pressed }) => [styles.allEventsButton, pressed && styles.logoutPressed]}
          >
            <Text style={styles.allEventsText}>Ver todos</Text>
            <Text style={styles.allEventsChevron}>›</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
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

      <Pressable
        accessibilityLabel="Nuevo evento"
        accessibilityRole="button"
        onPress={openCreate}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
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
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userInfo: { alignItems: 'center', flexDirection: 'row', flex: 1 },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  avatarText: { color: colors.primaryText, fontSize: 19, fontWeight: '800' },
  greeting: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.1 },
  email: { color: colors.muted, fontSize: 12, maxWidth: 200 },
  logoutButton: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoutPressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
  logoutText: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
  scrollContent: { paddingBottom: 120, paddingHorizontal: spacing.lg },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: { color: colors.danger, flex: 1, fontSize: 13, marginRight: spacing.sm },
  retryButton: {
    borderColor: colors.danger,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  retryText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeading: { flex: 1, marginRight: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800', letterSpacing: 0.1 },
  sectionSubtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  allEventsButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  allEventsText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  allEventsChevron: { color: colors.primary, fontSize: 18, fontWeight: '800', marginLeft: 4, marginTop: -1 },
  skeleton: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  skeletonBar: { backgroundColor: colors.primarySoft, width: 4 },
  skeletonBody: { flex: 1, padding: spacing.md },
  skeletonLineShort: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 14,
    width: '42%',
  },
  skeletonLine: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 10,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    bottom: spacing.lg,
    height: 62,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    width: 62,
    ...shadow.floating,
  },
  fabPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  fabSymbol: { color: colors.primaryText, fontSize: 34, fontWeight: '400', lineHeight: 36, marginTop: -2 },
});
