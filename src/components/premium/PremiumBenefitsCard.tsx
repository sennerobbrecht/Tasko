import { StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

type PremiumBenefitsCardProps = {
  benefits: string[];
};

export function PremiumBenefitsCard({ benefits }: PremiumBenefitsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Wat krijg je?</Text>
      {benefits.map((item) => (
        <View key={item} style={styles.benefitRow}>
          <View style={styles.benefitIcon}>
            <Text style={styles.benefitIconText}>✦</Text>
          </View>
          <Text style={styles.benefitText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EEF1',
    shadowColor: '#A9B7BF',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 14,
  },
  cardTitle: { fontSize: 20, color: '#2B7A85', fontWeight: '900' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#DDF5F9', alignItems: 'center', justifyContent: 'center' },
  benefitIconText: { color: '#58C9D7', fontSize: 16, fontWeight: '900' },
  benefitText: { flex: 1, fontSize: 16, color: '#507983', fontWeight: '600' },
});
