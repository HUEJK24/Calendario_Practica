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
import { EVENT_CATEGORIES, EVENT_PRIORITIES } from '../../domain/constants/eventMeta';
import { formatLongDate } from '../../domain/utils/date';
import { extractApiError } from '../../data/api/client';
import { TextField } from './TextField';
import { ChipGroup } from './ChipGroup';
import { TimeField } from './TimeField';
import { PrimaryButton } from './PrimaryButton';

function emptyDraft(date) {
  return {
    title: '',
    description: '',
    category: 'work',
    priority: 'medium',
    startTime: '09:00',
    endTime: '10:00',
    date,
  };
}

export function EventFormModal({ visible, date, initialEvent, onClose, onSubmit, onDelete }) {
  const insets = useSafeAreaInsets();
  const isEditing = Boolean(initialEvent);
  const [draft, setDraft] = useState(() =>
    initialEvent ? { ...initialEvent } : emptyDraft(date)
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit() {
    const title = draft.title.trim();
    if (!title) {
      setError('El título es obligatorio.');
      return;
    }
    if (draft.startTime >= draft.endTime) {
      setError('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ ...draft, title });
    } catch (submitError) {
      setError(extractApiError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setError('');
    setIsSubmitting(true);
    try {
      await onDelete(initialEvent.id);
    } catch (deleteError) {
      setError(extractApiError(deleteError));
    } finally {
      setIsSubmitting(false);
    }
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
                <Text style={styles.sheetTitle}>{isEditing ? 'Editar evento' : 'Nuevo evento'}</Text>
                <Text style={styles.sheetSubtitle}>{formatLongDate(new Date(draft.date))}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeSymbol}>×</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TextField
                label="Título"
                onChangeText={(value) => update({ title: value })}
                placeholder="Ej. Reunión de equipo"
                value={draft.title}
              />
              <TextField
                label="Descripción"
                multiline
                onChangeText={(value) => update({ description: value })}
                placeholder="Detalles del evento (opcional)"
                value={draft.description}
              />

              <ChipGroup
                label="Categoría"
                onChange={(value) => update({ category: value })}
                options={EVENT_CATEGORIES}
                value={draft.category}
              />
              <ChipGroup
                label="Prioridad"
                onChange={(value) => update({ priority: value })}
                options={EVENT_PRIORITIES}
                value={draft.priority}
              />

              <TimeField
                label="Hora de inicio"
                onChange={(value) => update({ startTime: value })}
                value={draft.startTime}
              />
              <TimeField
                label="Hora de fin"
                onChange={(value) => update({ endTime: value })}
                value={draft.endTime}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <PrimaryButton
                loading={isSubmitting}
                onPress={handleSubmit}
                title={isEditing ? 'Guardar cambios' : 'Crear evento'}
              />

              {isEditing ? (
                <View style={styles.deleteWrapper}>
                  <PrimaryButton
                    disabled={isSubmitting}
                    onPress={handleDelete}
                    title="Eliminar evento"
                    variant="ghost"
                  />
                </View>
              ) : null}
            </ScrollView>
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
    maxHeight: '92%',
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
    fontWeight: '700',
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
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeSymbol: {
    color: colors.textSoft,
    fontSize: 20,
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  deleteWrapper: {
    marginTop: spacing.sm,
  },
});
