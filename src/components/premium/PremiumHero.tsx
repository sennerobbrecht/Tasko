import { StyleSheet, Text, View } from 'react-native';

export function PremiumHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>👑</Text>
      </View>
      <Text style={styles.title}>Upgrade naar Premium</Text>
      <Text style={styles.subtitle}>Krijg toegang tot chat en nog veel meer premium functies!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 22 },
  emojiWrap: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#FFC400',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginBottom: 18,
  },
  emoji: { fontSize: 44 },
  title: { fontSize: 31, lineHeight: 36, color: '#2B7A85', fontWeight: '900', textAlign: 'center' },
  subtitle: { marginTop: 14, fontSize: 17, lineHeight: 25, color: '#95A3B0', textAlign: 'center', maxWidth: 300 },
});
