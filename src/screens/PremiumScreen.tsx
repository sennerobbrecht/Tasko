import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import colors from '../theme/colors';
import { PremiumBackButton } from '../components/premium/PremiumBackButton';
import { PremiumBillingToggle } from '../components/premium/PremiumBillingToggle';
import { PremiumBenefitsCard } from '../components/premium/PremiumBenefitsCard';
import { PremiumHero } from '../components/premium/PremiumHero';
import { PremiumPlanCard } from '../components/premium/PremiumPlanCard';

type PremiumScreenProps = {
  onBack?: () => void;
};

const BENEFITS = [
  'Onbeperkte chat met AI assistent',
  'Persoonlijke tips & adviezen',
  'Snellere inzichten & analyses',
  'Prioritaire klantenservice',
];

export default function PremiumScreen({ onBack }: PremiumScreenProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PremiumBackButton onPress={onBack} />

        <PremiumHero />

        <PremiumBenefitsCard benefits={BENEFITS} />

        <PremiumBillingToggle value={billingCycle} onChange={setBillingCycle} />

        <PremiumPlanCard billingCycle={billingCycle} />

        <Pressable style={styles.startButton}>
          <Text style={styles.startButtonText}>
            {billingCycle === 'yearly' ? '👑 Start Premium Jaarlijks' : '👑 Start Premium Maandelijks'}
          </Text>
        </Pressable>

        <Text style={styles.note}>Door te betalen ga je akkoord met onze voorwaarden. Je kunt op elk moment opzeggen.</Text>
      </ScrollView>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6FBFC' },
  content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 32 },
  startButton: { marginTop: 20, minHeight: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#58C9D7' },
  startButtonText: { color: colors.white, fontSize: 19, fontWeight: '900' },
  note: { marginTop: 12, fontSize: 13, lineHeight: 20, color: '#95A3B0', textAlign: 'center' },
});