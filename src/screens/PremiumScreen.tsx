import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import colors from '../theme/colors';

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
        <Pressable hitSlop={12} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Terug</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>👑</Text>
          </View>
          <Text style={styles.title}>Upgrade naar Premium</Text>
          <Text style={styles.subtitle}>Krijg toegang tot chat en nog veel meer premium functies!</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wat krijg je?</Text>
          {BENEFITS.map((item) => (
            <View key={item} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>✦</Text>
              </View>
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.billingToggle}>
          <Pressable
            onPress={() => setBillingCycle('monthly')}
            style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
          >
            <Text style={[styles.billingOptionText, billingCycle === 'monthly' && styles.billingOptionTextActive]}>Maandelijks</Text>
          </Pressable>
          <Pressable
            onPress={() => setBillingCycle('yearly')}
            style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
          >
            <Text style={[styles.billingOptionText, billingCycle === 'yearly' && styles.billingOptionTextActive]}>Jaarlijks</Text>
          </Pressable>
        </View>

        <View style={styles.planCardHighlight}>
          {billingCycle === 'yearly' ? (
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>Beste waarde</Text>
            </View>
          ) : null}
          <Text style={styles.planLabel}>{billingCycle === 'yearly' ? 'Jaarlijks' : 'Maandelijks'}</Text>
          <Text style={styles.planPrice}>{billingCycle === 'yearly' ? '€105' : '€9,99'}</Text>
          <Text style={styles.planSubtext}>{billingCycle === 'yearly' ? '€8,75/maand' : 'per maand'}</Text>
        </View>

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
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18, minHeight: 44 },
  backArrow: { color: '#58C9D7', fontSize: 28, fontWeight: '800' },
  backText: { color: '#58C9D7', fontSize: 18, fontWeight: '700' },
  hero: { alignItems: 'center', marginBottom: 22 },
  emojiWrap: { width: 98, height: 98, borderRadius: 49, backgroundColor: '#FFC400', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5, marginBottom: 18 },
  emoji: { fontSize: 44 },
  title: { fontSize: 31, lineHeight: 36, color: '#2B7A85', fontWeight: '900', textAlign: 'center' },
  subtitle: { marginTop: 14, fontSize: 17, lineHeight: 25, color: '#95A3B0', textAlign: 'center', maxWidth: 300 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#E5EEF1', shadowColor: '#A9B7BF', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 3, gap: 14 },
  cardTitle: { fontSize: 20, color: '#2B7A85', fontWeight: '900' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#DDF5F9', alignItems: 'center', justifyContent: 'center' },
  benefitIconText: { color: '#58C9D7', fontSize: 16, fontWeight: '900' },
  benefitText: { flex: 1, fontSize: 16, color: '#507983', fontWeight: '600' },
  billingToggle: { marginTop: 18, flexDirection: 'row', gap: 10, backgroundColor: '#EAF4F7', borderRadius: 16, padding: 6 },
  billingOption: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  billingOptionActive: { backgroundColor: colors.white },
  billingOptionText: { color: '#6F8892', fontWeight: '800' },
  billingOptionTextActive: { color: '#2B7A85' },
  planCardHighlight: { marginTop: 18, borderRadius: 22, borderWidth: 2, borderColor: '#58C9D7', backgroundColor: colors.white, paddingVertical: 20, paddingHorizontal: 18, alignItems: 'center', shadowColor: '#A9B7BF', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 3, position: 'relative' },
  bestValueBadge: { position: 'absolute', top: -14, backgroundColor: '#FFC400', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  bestValueText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  planLabel: { fontSize: 18, fontWeight: '900', color: '#2B7A85' },
  planPrice: { marginTop: 10, color: '#58C9D7', fontSize: 34, lineHeight: 40, fontWeight: '900' },
  planSubtext: { marginTop: 4, fontSize: 14, color: '#95A3B0', fontWeight: '700' },
  startButton: { marginTop: 20, minHeight: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#58C9D7' },
  startButtonText: { color: colors.white, fontSize: 19, fontWeight: '900' },
  note: { marginTop: 12, fontSize: 13, lineHeight: 20, color: '#95A3B0', textAlign: 'center' },
});