import { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.screen}>
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundBottom} />

      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.75} hitSlop={16} onPress={onBack} style={styles.backRow}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Account aanmaken</Text>
          <Text style={styles.subtitle}>Maak een ouder account aan om uw kinderen te beheren</Text>
        </View>

        <View style={styles.form}>
          <Field label="Naam" placeholder="Voer je naam in" value={name} onChangeText={setName} />
          <Field
            label="Email"
            placeholder="voorbeeld@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Wachtwoord"
            placeholder="Minimaal 6 karakters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <Field
            label="Bevestig wachtwoord"
            placeholder="Herhaal je wachtwoord"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
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
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Field({ label, placeholder, secureTextEntry, value, onChangeText, keyboardType, autoCapitalize }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B8C7D4"
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    color: colors.textStrong,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  inputShell: {
    minHeight: 78,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#BFEAF0',
    backgroundColor: colors.white,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  input: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 18,
    color: colors.textStrong,
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