import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '../components/BrandMark';
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <BrandMark size={64} />
            <Text style={styles.brandName}>Calendario</Text>
          </View>

          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>Inicia sesión para ver y organizar tu agenda.</Text>

          <TextField
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="tu@correo.com"
            returnKeyType="next"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="••••••••"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {formError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          <PrimaryButton title="Entrar" onPress={handleSubmit} loading={isSubmitting} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.footerLink}> Crear una</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  brandName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'left',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: { color: colors.muted, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
