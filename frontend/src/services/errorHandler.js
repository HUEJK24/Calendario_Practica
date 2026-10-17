/**
 * Sprint 3 — Manejador global de excepciones no capturadas.
 *
 * El ErrorBoundary cubre los errores de render, pero no los que ocurren fuera
 * del ciclo de React (por ejemplo, dentro de un callback asíncrono). React
 * Native expone `ErrorUtils` para interceptar esos casos: aquí se registra un
 * aviso controlado y se delega en el manejador previo para no alterar el
 * comportamiento por defecto (LogBox en desarrollo).
 *
 * Nunca se registra información sensible ni se propaga el stack trace al usuario.
 */
export function setGlobalExceptionHandler() {
  const errorUtils = global.ErrorUtils;
  if (!errorUtils?.setGlobalHandler) {
    return () => {};
  }

  const previousHandler = errorUtils.getGlobalHandler?.();

  errorUtils.setGlobalHandler((error, isFatal) => {
    if (__DEV__) {
      console.warn(
        `Excepción no controlada${isFatal ? ' (fatal)' : ''}:`,
        error?.message ?? error
      );
    }
    if (typeof previousHandler === 'function') {
      previousHandler(error, isFatal);
    }
  });

  return () => {
    if (typeof previousHandler === 'function') {
      errorUtils.setGlobalHandler(previousHandler);
    }
  };
}
