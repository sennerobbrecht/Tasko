import { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import colors from '../theme/colors';

type LoginScreenProps = {
  onBack?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  onSubmit?: (input: { email: string; password: string }) => Promise<string | null>;
};

export default function LoginScreen({ onBack, onForgotPassword, onRegister, onSubmit }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!onSubmit || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const error = await onSubmit({ email, password });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Terug</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>T</Text>
          </View>
          <Text style={styles.title}>Welkom terug</Text>
          <Text style={styles.subtitle}>Log in om door te gaan</Text>
        </View>

        <View style={styles.form}>
          <Field
            label="Email"
            placeholder="voorbeeld@email.com"
            icon="✉"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            editable={!isSubmitting}
          />
          <Field
            label="Wachtwoord"
            placeholder="Voer je wachtwoord in"
            icon="🔒"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
            onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />

          <Pressable onPress={onForgotPassword} style={styles.forgotButton}>
            <Text style={styles.forgotText}>Wachtwoord vergeten?</Text>
          </Pressable>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable onPress={handleSubmit} style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryText}>{isSubmitting ? 'Bezig...' : 'Inloggen'}</Text>
        </Pressable>

        <Pressable onPress={onRegister} style={styles.footerRow}>
          <Text style={styles.footerMuted}>Nog geen account? </Text>
          <Text style={styles.footerLink}>Registreren</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  icon: string;
  trailingIcon?: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  editable?: boolean;
  onTogglePasswordVisibility?: () => void;
  showPassword?: boolean;
};

function Field({
  label,
  placeholder,
  icon,
  trailingIcon,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  autoFocus,
  editable,
  onTogglePasswordVisibility,
  showPassword,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Text style={styles.fieldIcon}>{icon}</Text>
        <TextInput
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoFocus={autoFocus}
          editable={editable}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B8C7D4"
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
        />
        {secureTextEntry !== undefined && onTogglePasswordVisibility ? (
          <Pressable onPress={onTogglePasswordVisibility} style={styles.eyeButton}>
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </Pressable>
        ) : trailingIcon ? (
          <Text style={styles.trailingIcon}>{trailingIcon}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingTop: 40, paddingHorizontal: 24, paddingBottom: 28 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginBottom: 10 },
  backArrow: { fontSize: 32, color: '#42C7D5' },
  backText: { fontSize: 20, color: '#42C7D5', fontWeight: '500' },
  hero: { alignItems: 'center', marginTop: 18, marginBottom: 22 },
  avatarCircle: { width: 190, height: 190, borderRadius: 95, backgroundColor: '#43B8C5', alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  avatarLetter: { color: colors.white, fontSize: 54, fontWeight: '900' },
  title: { marginTop: 28, fontSize: 34, lineHeight: 40, fontWeight: '900', color: colors.textStrong, textAlign: 'center' },
  subtitle: { marginTop: 16, fontSize: 20, lineHeight: 28, color: '#8A97A9', textAlign: 'center' },
  form: { gap: 18 },
  fieldGroup: { gap: 10 },
  fieldLabel: { color: colors.textStrong, fontSize: 18, lineHeight: 22, fontWeight: '800' },
  inputShell: { minHeight: 72, borderRadius: 24, borderWidth: 2, borderColor: '#BFEAF0', backgroundColor: colors.white, alignItems: 'center', flexDirection: 'row', paddingHorizontal: 18, gap: 12, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  fieldIcon: { fontSize: 22, color: '#96A2B0' },
  input: { flex: 1, minHeight: 48, fontSize: 18, color: colors.textStrong, paddingVertical: 0, backgroundColor: colors.white },
  trailingIcon: { fontSize: 18, color: '#96A2B0' },
  eyeButton: { padding: 4 },
  eyeIcon: { fontSize: 18, color: '#96A2B0' },
  forgotButton: { alignSelf: 'flex-end', paddingVertical: 4 },
  forgotText: { color: '#42C7D5', fontSize: 16, fontWeight: '700' },
  errorText: { marginTop: 16, color: '#D84C63', fontSize: 14, lineHeight: 20, textAlign: 'center', fontWeight: '600' },
  primaryButton: { marginTop: 24, minHeight: 78, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#BFEAF0' },
  primaryButtonDisabled: { opacity: 0.75 },
  primaryText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  footerRow: { marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  footerMuted: { color: '#8A97A9', fontSize: 18 },
  footerLink: { color: '#42C7D5', fontSize: 18, fontWeight: '700' },
});