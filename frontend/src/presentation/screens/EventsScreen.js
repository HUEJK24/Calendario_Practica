import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../context/EventsContext';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { EventFormModal } from '../components/EventFormModal';
import { colors, radius, spacing } from '../../theme/theme';
import { formatLongDate, fromISODate } from '../../domain/utils/date';

export function EventsScreen({ navigation }) {
  const { events, isLoading, loadError, refresh, updateEvent, deleteEvent } = useEvents();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const sections = useMemo(() => {
    const grouped = events.reduce((map, event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
      return map;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        title: date,
        data: [...grouped[date]].sort((a, b) =>
          (a.startTime || '').localeCompare(b.startTime || '')
        ),
      }));
  }, [events]);

  function openEdit(event) {
    setEditingEvent(event);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingEvent(null);
  }

  async function handleSubmit(payload) {
    await updateEvent(editingEvent.id, payload);
    closeModal();
  }

  async function handleDelete(id) {
    await deleteEvent(id);
    closeModal();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Volver a la agenda"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backSymbol}>‹</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Todos los eventos</Text>
          <Text style={styles.subtitle}>
            {isLoading
              ? 'Cargando...'
              : `${events.length} ${events.length === 1 ? 'recordatorio' : 'recordatorios'}`}
          </Text>
        </View>
      </View>

      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={refresh}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <SectionList
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => openEdit(item)} />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionDate}>{formatLongDate(fromISODate(section.title))}</Text>
          )}
          sections={sections}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState
              message="Agrega recordatorios desde el calendario y aquí verás todos reunidos."
              title="Aún no hay eventos"
            />
          }
        />
      )}

      <EventFormModal
        date={editingEvent ? fromISODate(editingEvent.date) : new Date()}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  backSymbol: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  headerText: { flex: 1 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: 0.1 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sectionDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.1,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
  },
});
