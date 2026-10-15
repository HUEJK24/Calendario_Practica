import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { extractApiError } from '../../data/api/client';
import { colors, spacing } from '../../theme/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const nextErrors = {};
    if (!EMAIL_REGEX.test(email.trim())) nextErrors.email = 'Introduce un correo válido.';
    if (!password) nextErrors.password = 'La contraseña es obligatoria.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    setFormError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (error) {
      setFormError(extractApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Calendario</Text>
          <Text style={styles.subtitle}>Inicia sesión para ver tu agenda.</Text>

          <TextField
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="tu@correo.com"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="••••••••"
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton title="Entrar" onPress={handleSubmit} loading={isSubmitting} />

          <View style={styles.spacer} />
          <PrimaryButton
            title="Crear una cuenta"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.text, fontSize: 32, fontWeight: '700', textAlign: 'center' },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  formError: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  spacer: { height: spacing.md },
});
