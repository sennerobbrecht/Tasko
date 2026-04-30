import { StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

export function FocusTipsCard() {
  return (
    <View style={styles.tipBox}>
      <Text style={styles.tipTitle}>Focus Tips</Text>
      <Text style={styles.tipText}>• Zet je telefoon op stil{"\n"}• Zoek een rustige plek{"\n"}• Neem pauzes na elke sessie</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tipBox: { marginTop: 4, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDECF0', padding: 14, gap: 8 },
  tipTitle: { color: colors.textStrong, fontSize: 16, fontWeight: '900' },
  tipText: { color: '#8A97A9', lineHeight: 22, fontWeight: '600' },
});
