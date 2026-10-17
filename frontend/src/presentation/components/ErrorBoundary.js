import { Component } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/theme';

/**
 * Sprint 3 — Manejo global de excepciones en el frontend.
 *
 * Un error de render en cualquier pantalla, si no se captura, desmonta todo el
 * árbol y deja la app en blanco. Este límite de errores (Error Boundary) lo
 * intercepta, muestra un estado de recuperación en lugar de una pantalla vacía
 * y permite reintentar sin reiniciar la app.
 *
 * Debe ser un componente de clase: React solo expone el ciclo de vida de
 * errores en clases (getDerivedStateFromError / componentDidCatch).
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // El detalle queda en los logs de desarrollo; al usuario nunca se le
    // muestra el stack trace.
    if (__DEV__) {
      console.error('Excepción capturada por el ErrorBoundary:', error, info?.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.message}>
          La aplicación encontró un problema inesperado. Puedes intentar de nuevo.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.handleRetry}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  buttonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
