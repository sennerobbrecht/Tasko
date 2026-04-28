import { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FormField from '../components/FormField';
import { requestPasswordReset } from '../services/auth';
import colors from '../theme/colors';

type ForgotPasswordScreenProps = {
  onBack?: () => void;
  onSubmit?: () => void;
};

export default function ForgotPasswordScreen({ onBack, onSubmit }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const { error } = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Er ging iets mis bij het versturen van de e-mail.');
      return;
    }

    onSubmit?.();
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Terug</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>🔒</Text>
          </View>
          <Text style={styles.title}>Wachtwoord vergeten?</Text>
          <Text style={styles.subtitle}>Geen probleem! Vul je e-mailadres in en we sturen je een bericht om een nieuw wachtwoord te maken.</Text>
        </View>

        <View style={styles.form}>
          <FormField
            label="Email"
            placeholder="voorbeeld@email.com"
            icon="✉"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable onPress={handleSubmit} style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryText}>{isSubmitting ? 'Bezig...' : 'Wachtwoord herstellen'}</Text>
        </Pressable>

        <Pressable onPress={onBack} style={styles.footerButton}>
          <Text style={styles.footerText}>Terug naar inloggen</Text>
        </Pressable>

        <StatusBar style="dark" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingTop: 40, paddingHorizontal: 24, paddingBottom: 28 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginBottom: 14 },
  backArrow: { fontSize: 32, color: '#42C7D5' },
  backText: { fontSize: 20, color: '#42C7D5', fontWeight: '500' },
  hero: { alignItems: 'center', marginTop: 10, marginBottom: 22 },
  avatarCircle: { width: 132, height: 132, borderRadius: 66, backgroundColor: '#BFEAF0', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  avatarIcon: { fontSize: 56 },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '900', color: colors.textStrong, textAlign: 'center' },
  subtitle: { marginTop: 14, fontSize: 18, lineHeight: 28, color: '#8A97A9', textAlign: 'center' },
  form: { gap: 18 },
  errorText: { marginTop: 16, color: '#D84C63', fontSize: 14, lineHeight: 20, textAlign: 'center', fontWeight: '600' },
  primaryButton: { marginTop: 24, minHeight: 78, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#42C7D5' },
  primaryButtonDisabled: { opacity: 0.75 },
  primaryText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  footerButton: { marginTop: 28, minHeight: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 2, borderColor: '#D3EDF3' },
  footerText: { color: '#42C7D5', fontSize: 18, fontWeight: '700' },
});