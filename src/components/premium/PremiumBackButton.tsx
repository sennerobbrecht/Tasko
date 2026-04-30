import { Pressable, StyleSheet, Text } from 'react-native';

type PremiumBackButtonProps = {
  onPress?: () => void;
};

export function PremiumBackButton({ onPress }: PremiumBackButtonProps) {
  return (
    <Pressable hitSlop={12} onPress={onPress} style={styles.backButton}>
      <Text style={styles.backArrow}>←</Text>
      <Text style={styles.backText}>Terug</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18, minHeight: 44 },
  backArrow: { color: '#58C9D7', fontSize: 28, fontWeight: '800' },
  backText: { color: '#58C9D7', fontSize: 18, fontWeight: '700' },
});
