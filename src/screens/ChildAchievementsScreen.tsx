import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';

type ChildAchievementsScreenProps = {
  onBack: () => void;
};

const achievements = [
  { title: 'Vroege Vogel', subtitle: '7 dagen voor 8:00 wakker', done: false },
  { title: 'Super Poetsen', subtitle: '30 dagen tanden gepoetst', done: false },
  { title: 'Opruim Held', subtitle: '50 keer kamer opgeruimd', done: false },
  { title: 'Huiswerk Master', subtitle: '100 huiswerk sessies', done: false },
  { title: 'Streak Kampioen', subtitle: '14 dagen streak', done: false },
  { title: 'Muntjes Meester', subtitle: '500 munten verzameld', done: false },
  { title: 'Blijdschap Pro', subtitle: '10 dagen blij mood', done: false },
  { title: 'Focus Expert', subtitle: '20 focus sessies', done: false },
];

export default function ChildAchievementsScreen({ onBack }: ChildAchievementsScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Prestaties</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Text style={styles.heroIcon}>🏆</Text>
          <View>
            <Text style={styles.heroCount}>0 van 8</Text>
            <Text style={styles.heroLabel}>Badges ontgrendeld</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '0%' }]} />
        </View>
      </View>

      <View style={styles.list}>
        {achievements.map((achievement) => (
          <View key={achievement.title} style={[styles.card, achievement.done && styles.cardDone]}>
            <View style={[styles.iconBox, achievement.done && styles.iconBoxDone]}>
              <Text style={styles.iconText}>{achievement.done ? '✓' : '✨'}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{achievement.title}</Text>
              <Text style={styles.cardSubtitle}>{achievement.subtitle}</Text>
            </View>
            <Text style={styles.doneMark}>{achievement.done ? '✓' : ''}</Text>
          </View>
        ))}
      </View>

      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 40, paddingHorizontal: 16, paddingBottom: 28, backgroundColor: colors.background, gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0' },
  backArrow: { fontSize: 24, color: colors.primary, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '900', color: colors.textStrong },
  spacer: { width: 44 },
  heroCard: { backgroundColor: colors.white, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#DDECF0', gap: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIcon: { fontSize: 28 },
  heroCount: { fontSize: 18, fontWeight: '900', color: colors.textStrong },
  heroLabel: { fontSize: 13, color: '#8A97A9', fontWeight: '700' },
  progressBar: { height: 10, borderRadius: 999, backgroundColor: '#E6ECF0', overflow: 'hidden' },
  progressFill: { width: '38%', height: '100%', backgroundColor: '#8B8DEE', borderRadius: 999 },
  list: { gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: '#DDECF0', padding: 12 },
  cardDone: { backgroundColor: '#FBFDFF' },
  iconBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF5E8', alignItems: 'center', justifyContent: 'center' },
  iconBoxDone: { backgroundColor: '#EFFEEC' },
  iconText: { fontSize: 18 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: colors.textStrong },
  cardSubtitle: { fontSize: 12, color: '#8A97A9', marginTop: 2, fontWeight: '700' },
  doneMark: { width: 20, textAlign: 'center', color: '#13B37E', fontWeight: '900', fontSize: 16 },
});