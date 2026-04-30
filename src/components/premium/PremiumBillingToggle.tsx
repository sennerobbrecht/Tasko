import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

type BillingCycle = 'monthly' | 'yearly';

type PremiumBillingToggleProps = {
  value: BillingCycle;
  onChange: (value: BillingCycle) => void;
};

export function PremiumBillingToggle({ value, onChange }: PremiumBillingToggleProps) {
  return (
    <View style={styles.billingToggle}>
      <Pressable onPress={() => onChange('monthly')} style={[styles.billingOption, value === 'monthly' && styles.billingOptionActive]}>
        <Text style={[styles.billingOptionText, value === 'monthly' && styles.billingOptionTextActive]}>Maandelijks</Text>
      </Pressable>
      <Pressable onPress={() => onChange('yearly')} style={[styles.billingOption, value === 'yearly' && styles.billingOptionActive]}>
        <Text style={[styles.billingOptionText, value === 'yearly' && styles.billingOptionTextActive]}>Jaarlijks</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  billingToggle: { marginTop: 18, flexDirection: 'row', gap: 10, backgroundColor: '#EAF4F7', borderRadius: 16, padding: 6 },
  billingOption: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  billingOptionActive: { backgroundColor: colors.white },
  billingOptionText: { color: '#6F8892', fontWeight: '800' },
  billingOptionTextActive: { color: '#2B7A85' },
});
