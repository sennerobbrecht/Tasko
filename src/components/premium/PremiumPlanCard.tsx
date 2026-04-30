import { StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

type BillingCycle = 'monthly' | 'yearly';

type PremiumPlanCardProps = {
  billingCycle: BillingCycle;
};

export function PremiumPlanCard({ billingCycle }: PremiumPlanCardProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
  planCardHighlight: {
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#58C9D7',
    backgroundColor: colors.white,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#A9B7BF',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    position: 'relative',
  },
  bestValueBadge: { position: 'absolute', top: -14, backgroundColor: '#FFC400', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  bestValueText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  planLabel: { fontSize: 18, fontWeight: '900', color: '#2B7A85' },
  planPrice: { marginTop: 10, color: '#58C9D7', fontSize: 34, lineHeight: 40, fontWeight: '900' },
  planSubtext: { marginTop: 4, fontSize: 14, color: '#95A3B0', fontWeight: '700' },
});
