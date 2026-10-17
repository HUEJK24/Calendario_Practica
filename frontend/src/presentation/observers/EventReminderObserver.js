import { useEffect, useRef } from 'react';
import { eventBus } from '../../domain/observers/EventBus';
import { cancelEventReminder, scheduleEventReminder } from '../../services/notifications';

/**
 * Sprint 3 — Observador concreto del patrón Observer.
 *
 * Se suscribe al EventBus y reacciona a los cambios de los eventos: programa el
 * recordatorio local al crear o editar, y lo cancela al eliminar. No se dibuja
 * nada (devuelve null): es un observador "de cabecera" que vive dentro del
 * EventsProvider.
 *
 * Mantiene en un ref el mapa `evento -> id de notificación` para poder cancelar
 * el aviso anterior cuando un evento se edita.
 */
export function EventReminderObserver() {
  const reminders = useRef(new Map());

  useEffect(() => {
    function handleChange(change) {
      const { event } = change;

      if (change.type === 'deleted') {
        const notificationId = reminders.current.get(event.id);
        if (notificationId) {
          cancelEventReminder(notificationId);
          reminders.current.delete(event.id);
        }
        return;
      }

      const previous = reminders.current.get(event.id);
      if (previous) {
        cancelEventReminder(previous);
        reminders.current.delete(event.id);
      }

      scheduleEventReminder(event)
        .then((notificationId) => {
          if (notificationId) reminders.current.set(event.id, notificationId);
        })
        .catch((error) => {
          if (__DEV__) {
            console.warn('No se pudo programar el recordatorio:', error?.message);
          }
        });
    }

    return eventBus.subscribe(handleChange);
  }, []);

  return null;
}
