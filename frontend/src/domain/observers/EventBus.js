/**
 * Sprint 3 — Patrón Observer (Sujeto / Subject).
 *
 * Los eventos de la agenda publican cambios aquí y las partes interesadas se
 * suscriben sin conocerse entre sí. El sujeto NO sabe quién lo observa: solo
 * entrega la notificación. Así, notificar recordatorios o refrescar cualquier
 * vista es agregar un observador, sin tocar el código que emite el cambio.
 *
 * Vive en `domain/` porque es lógica pura (no depende de React ni de la UI).
 */
export class EventBus {
  constructor() {
    this.observers = new Set();
  }

  /**
   * Registra un observador y devuelve la función para darse de baja, de modo
   * que quien se suscribe pueda limpiar en el desmontaje.
   */
  subscribe(observer) {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Notifica a todos los observadores. Cada uno se invoca aislado: si uno falla,
   * los demás siguen recibiendo el aviso.
   */
  notify(change) {
    for (const observer of [...this.observers]) {
      try {
        observer(change);
      } catch (error) {
        if (__DEV__) {
          console.warn('Un observador falló al procesar el cambio:', error?.message);
        }
      }
    }
  }
}

/**
 * Instancia única compartida: el contexto de eventos publica sobre ella y los
 * observadores se suscriben a la misma, igual que el Singleton del backend
 * garantiza una sola conexión a la base de datos.
 */
export const eventBus = new EventBus();
