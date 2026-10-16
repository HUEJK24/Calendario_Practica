/**
 * Punto de composición de la app. Arquitectura por capas (Sprint 1):
 * domain (entidades y utils puros) ← data (cliente HTTP + repositorios) ←
 * presentation (screens, components, context). Aquí se montan los providers
 * globales (`AuthProvider`) y `RootNavigator`, que decide entre las pilas
 * `AuthStack` (login/registro) y `AppStack` (agenda) según la sesión.
 */
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/presentation/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
