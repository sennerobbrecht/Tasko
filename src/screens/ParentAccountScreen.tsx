import { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FormField from '../components/FormField';
import colors from '../theme/colors';

type ParentAccountScreenProps = {
  onBack?: () => void;
  onLogin?: () => void;
  onSubmit?: (input: { name: string; email: string; password: string; confirmPassword: string }) => Promise<string | null>;
};

export default function ParentAccountScreen({ onBack, onLogin, onSubmit }: ParentAccountScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!onSubmit || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const error = await onSubmit({ name, email, password, confirmPassword });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity activeOpacity={0.75} hitSlop={16} onPress={onBack} style={styles.backRow}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Account aanmaken</Text>
          <Text style={styles.subtitle}>Maak een ouder account aan om uw kinderen te beheren</Text>
        </View>

        <View style={styles.form}>
          <FormField label="Naam" placeholder="Voer je naam in" value={name} onChangeText={setName} shellStyle={styles.largeInputShell} inputStyle={styles.largeInput} />
          <FormField
            label="Email"
            placeholder="voorbeeld@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            shellStyle={styles.largeInputShell}
            inputStyle={styles.largeInput}
          />
          <FormField
            label="Wachtwoord"
            placeholder="Minimaal 6 karakters"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
            shellStyle={styles.largeInputShell}
            inputStyle={styles.largeInput}
          />
          <FormField
            label="Bevestig wachtwoord"
            placeholder="Herhaal je wachtwoord"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            onTogglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            showPassword={showConfirmPassword}
            shellStyle={styles.largeInputShell}
            inputStyle={styles.largeInput}
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity activeOpacity={0.9} onPress={handleSubmit} style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}>
          <Text style={styles.submitText}>{isSubmitting ? 'Bezig...' : 'Account aanmaken'}</Text>
        </TouchableOpacity>

        <Pressable onPress={onLogin} style={styles.footerRow}>
          <Text style={styles.footerText}>Heb je al een account? </Text>
          <Text style={styles.footerLink}>Inloggen</Text>
        </Pressable>

        <StatusBar style="dark" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  backgroundTop: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#E6FBFD',
    opacity: 0.9,
  },
  backgroundBottom: {
    position: 'absolute',
    left: -100,
    bottom: -120,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: colors.backgroundBlob,
    opacity: 0.8,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 52,
    marginTop: 2,
    marginBottom: 18,
  },
  backIcon: {
    color: colors.primary,
    fontSize: 30,
    lineHeight: 30,
    marginRight: 10,
  },
  backText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '500',
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: colors.textStrong,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 20,
    fontSize: 18,
    lineHeight: 28,
    color: '#8A97A9',
  },
  form: {
    gap: 20,
  },
  largeInputShell: {
    minHeight: 78,
    borderRadius: 22,
  },
  largeInput: {
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  submitButton: {
    minHeight: 78,
    borderRadius: 22,
    marginTop: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#BFEAF0',
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 14,
    color: '#D84C63',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: '#8A97A9',
    fontSize: 18,
    lineHeight: 24,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
});