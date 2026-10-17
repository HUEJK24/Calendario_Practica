/**
 * Punto de composición de la app. Arquitectura por capas (Sprint 1):
 * domain (entidades y utils puros) ← data (cliente HTTP + repositorios) ←
 * presentation (screens, components, context). Aquí se montan los providers
 * globales (`AuthProvider`) y `RootNavigator`, que decide entre las pilas
 * `AuthStack` (login/registro) y `AppStack` (agenda) según la sesión.
 *
 * Sprint 3: `ErrorBoundary` y el manejador global de excepciones envuelven todo
 * el árbol para que ningún fallo deje la app en blanco.
 */
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/presentation/context/AuthContext';
import { ErrorBoundary } from './src/presentation/components/ErrorBoundary';
import { setGlobalExceptionHandler } from './src/services/errorHandler';
import { configureNotificationHandler } from './src/services/notifications';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    configureNotificationHandler();
    return setGlobalExceptionHandler();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
