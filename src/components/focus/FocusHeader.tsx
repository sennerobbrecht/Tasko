import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

type FocusHeaderProps = {
  onBack: () => void;
};

export function FocusHeader({ onBack }: FocusHeaderProps) {
  return (
    <View style={styles.topRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <Text style={styles.title}>Focus Tijd</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0' },
  backArrow: { fontSize: 24, color: colors.primary, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '900', color: colors.textStrong },
  spacer: { width: 44 },
});
