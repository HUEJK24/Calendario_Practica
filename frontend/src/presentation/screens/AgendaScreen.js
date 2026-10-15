import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../../theme/theme';

export function AgendaScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Mi agenda</Text>
        <Text style={styles.subtitle}>Sesión iniciada como:</Text>
        <View style={styles.card}>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Text style={styles.note}>
          Pantalla base del Sprint 1. La lógica de eventos de la agenda se construye en el Sprint 2.
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Cerrar sesión" variant="ghost" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { flex: 1, padding: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: colors.muted, marginTop: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  email: { color: colors.text, fontSize: 16 },
  note: { color: colors.muted, marginTop: spacing.xl, lineHeight: 20 },
  footer: { padding: spacing.lg },
});
