import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';

type ForgotPasswordSentScreenProps = {
  onBack?: () => void;
  onResend?: () => void;
};

export default function ForgotPasswordSentScreen({ onBack, onResend }: ForgotPasswordSentScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Terug</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.title}>Email verzonden!</Text>
          <Text style={styles.subtitle}>Heb je niets ontvangen? Kijk even in je spamfolder of probeer opnieuw.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.mailCircle}>
            <Text style={styles.mailIcon}>✉</Text>
          </View>
          <Text style={styles.cardText}>We hebben een herstelmail naar je e-mailadres gestuurd. Volg de instructies in de email om je wachtwoord te resetten.</Text>
        </View>

        <Pressable onPress={onResend} style={styles.primaryButton}>
          <Text style={styles.primaryText}>✉ Email opnieuw verzenden</Text>
        </Pressable>

        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Terug naar inloggen</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingTop: 40, paddingHorizontal: 12, paddingBottom: 24 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginBottom: 12, marginLeft: 4 },
  backArrow: { fontSize: 32, color: '#42C7D5' },
  backText: { fontSize: 20, color: '#42C7D5', fontWeight: '500' },
  hero: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  checkCircle: { width: 116, height: 116, borderRadius: 58, backgroundColor: '#29D6B0', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  checkMark: { color: colors.white, fontSize: 48, fontWeight: '900' },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '900', color: colors.textStrong, textAlign: 'center' },
  subtitle: { marginTop: 16, fontSize: 18, lineHeight: 28, color: '#8A97A9', textAlign: 'center', paddingHorizontal: 8 },
  card: { backgroundColor: colors.white, borderRadius: 24, borderWidth: 2, borderColor: '#BFEAF0', padding: 24, alignItems: 'center', gap: 20, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  mailCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#42C7D5', alignItems: 'center', justifyContent: 'center' },
  mailIcon: { color: colors.white, fontSize: 34, fontWeight: '900' },
  cardText: { textAlign: 'center', fontSize: 18, lineHeight: 28, color: '#8A97A9' },
  primaryButton: { marginTop: 22, minHeight: 78, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#42C7D5' },
  primaryText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  secondaryButton: { marginTop: 16, minHeight: 78, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 2, borderColor: '#D3EDF3' },
  secondaryText: { color: '#42C7D5', fontSize: 18, fontWeight: '700' },
});