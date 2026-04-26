import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import colors from '../theme/colors';

type ForgotPasswordScreenProps = {
  onBack?: () => void;
  onSubmit?: () => void;
};

export default function ForgotPasswordScreen({ onBack, onSubmit }: ForgotPasswordScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
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
          <Field label="Email" placeholder="voorbeeld@email.com" icon="✉" />
        </View>

        <Pressable onPress={onSubmit} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Wachtwoord herstellen</Text>
        </Pressable>

        <Pressable onPress={onBack} style={styles.footerButton}>
          <Text style={styles.footerText}>Terug naar inloggen</Text>
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
};

function Field({ label, placeholder, icon }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Text style={styles.fieldIcon}>{icon}</Text>
        <TextInput placeholder={placeholder} placeholderTextColor="#B8C7D4" style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingTop: 40, paddingHorizontal: 16, paddingBottom: 28 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginBottom: 14 },
  backArrow: { fontSize: 32, color: '#42C7D5' },
  backText: { fontSize: 20, color: '#42C7D5', fontWeight: '500' },
  hero: { alignItems: 'center', marginTop: 10, marginBottom: 22 },
  avatarCircle: { width: 132, height: 132, borderRadius: 66, backgroundColor: '#BFEAF0', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  avatarIcon: { fontSize: 56 },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '900', color: colors.textStrong, textAlign: 'center' },
  subtitle: { marginTop: 14, fontSize: 18, lineHeight: 28, color: '#8A97A9', textAlign: 'center' },
  form: { gap: 18 },
  fieldGroup: { gap: 10 },
  fieldLabel: { color: colors.textStrong, fontSize: 18, lineHeight: 22, fontWeight: '800' },
  inputShell: { minHeight: 72, borderRadius: 24, borderWidth: 2, borderColor: '#BFEAF0', backgroundColor: colors.white, alignItems: 'center', flexDirection: 'row', paddingHorizontal: 18, gap: 12, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  fieldIcon: { fontSize: 22, color: '#96A2B0' },
  input: { flex: 1, fontSize: 18, color: colors.textStrong, paddingVertical: 0 },
  primaryButton: { marginTop: 24, minHeight: 78, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#42C7D5' },
  primaryText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  footerButton: { marginTop: 28, minHeight: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 2, borderColor: '#D3EDF3' },
  footerText: { color: '#42C7D5', fontSize: 18, fontWeight: '700' },
});