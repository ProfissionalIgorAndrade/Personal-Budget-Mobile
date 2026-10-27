import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      // On success the auth guard in the root layout swaps to the dashboard.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>PersonalBudget</Text>
        <Text style={styles.subtitle}>Entre para continuar</Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            autoComplete="email"
            editable={!submitting}
            returnKeyType="next"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            editable={!submitting}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.button, !canSubmit && styles.buttonDisabled, pressed && canSubmit && styles.buttonPressed]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
          >
            {submitting ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.buttonText}>Entrar</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, paddingHorizontal: spacing.lg },
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  form: { gap: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  errorBox: { backgroundColor: colors.dangerBg, borderRadius: 10, padding: spacing.md, marginTop: spacing.sm },
  errorText: { color: colors.danger, fontSize: 14 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
});
