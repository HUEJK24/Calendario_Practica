import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
// Import nombrado aparte: `eslint-plugin-import` no sigue el re-export
// `export *` de este enum y marca `Notifications.AndroidImportance` como
// inexistente, aunque sí está disponible en tiempo de ejecución.
import { AndroidImportance } from 'expo-notifications';
import { fromISODate } from '../domain/utils/date';

/**
 * Sprint 3 — Notificaciones locales (API nativa del dispositivo).
 *
 * Envuelve `expo-notifications` para programar un recordatorio antes de que
 * empiece cada evento. Los recordatorios son LOCALES: se agendan en el sistema
 * operativo, no requieren servidor de push.
 */

export const REMINDER_LEAD_MINUTES = 10;
const ANDROID_CHANNEL_ID = 'event-reminders';

/**
 * Configura cómo se presentan las notificaciones locales.
 *
 * Se registra de forma explícita al arrancar la app (App.js) en lugar de en el
 * ámbito del módulo: un efecto secundario al importar el archivo haría que
 * cualquier módulo que lo incluya ejecute el registro, y en entornos sin el
 * nativo de expo-notifications eso lanza una excepción que rompe la carga.
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (current.canAskAgain === false) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Recordatorios de eventos',
    importance: AndroidImportance.DEFAULT,
  });
}

/**
 * Calcula el instante del aviso: el inicio del evento menos la anticipación.
 */
function reminderDate(event) {
  const start = fromISODate(event.date);
  const [hours, minutes] = String(event.startTime || '00:00').split(':').map(Number);
  start.setHours(hours, minutes, 0, 0);
  start.setMinutes(start.getMinutes() - REMINDER_LEAD_MINUTES);
  return start;
}

/**
 * Programa el recordatorio de un evento y devuelve su identificador, o null si
 * no se pudo (sin permiso o si el momento del aviso ya pasó).
 */
export async function scheduleEventReminder(event) {
  const when = reminderDate(event);
  if (when.getTime() <= Date.now()) return null;

  if (!(await ensureNotificationPermission())) return null;
  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body: `Empieza a las ${event.startTime} · en ${REMINDER_LEAD_MINUTES} minutos.`,
      data: { eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function cancelEventReminder(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    if (__DEV__) {
      console.warn('No se pudo cancelar el recordatorio:', error?.message);
    }
  }
}
