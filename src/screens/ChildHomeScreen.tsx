import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';
import { type AccessoryKey } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';

type ChildHomeScreenProps = {
  monsterName: string;
  selectedAccessory?: AccessoryKey;
  selectedMonsterColor: string;
  coins: number;
  level: number;
  streakDays: number;
  tasksDone: number;
  badgesUnlocked: number;
  onOpenRewards: () => void;
  onOpenAchievements: () => void;
  onOpenFocus: () => void;
  onOpenMood: () => void;
};

type ChildRoutine = {
  title: string;
  status: string;
  tasks: string[];
};

const DEMO_ROUTINES: ChildRoutine[] = [
  { title: 'School Week', status: 'Actief', tasks: ['Opstaan', 'Ontbijten', 'Tandenpoetsen', 'Naar school'] },
  { title: 'Avond Routine', status: 'Actief', tasks: ['Avondeten', 'Douchen', 'Tandenpoetsen', 'Naar bed'] },
  { title: 'Weekend Routine', status: 'Ingepland', tasks: ['Rustig opstarten', 'Spelletje spelen', 'Opruimen'] },
];

export default function ChildHomeScreen({
  monsterName,
  selectedAccessory,
  selectedMonsterColor,
  coins,
  level,
  streakDays,
  tasksDone,
  badgesUnlocked,
  onOpenRewards,
  onOpenAchievements,
  onOpenFocus,
  onOpenMood,
}: ChildHomeScreenProps) {
  const displayName = monsterName.trim() || 'Je nieuwe monstertje';
  const activeRoutines = DEMO_ROUTINES;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.hello}>Hoi! 👋</Text>
          <Text style={styles.subtle}>Je account staat op 0</Text>
        </View>
        <View style={styles.pointsPill}>
          <Text style={styles.pointsEmoji}>🌕</Text>
          <Text style={styles.pointsText}>{coins}</Text>
          <Text style={styles.pointsLabel}>munten</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>{displayName}</Text>
          <View style={styles.fireBadge}>
            <Text style={styles.fireBadgeIcon}>🔥</Text>
            <Text style={styles.fireBadgeText}>{streakDays} dagen</Text>
          </View>
        </View>
        <Text style={styles.heroSubtitle}>Level {level} • Nieuwe start</Text>
        <View style={styles.previewBox}>
          <MonsterModel3D color={selectedMonsterColor} size={220} zoom={1.5} />
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Dagelijkse voortgang</Text>
          <Text style={styles.progressValue}>{tasksDone}/6</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: tasksDone === 0 ? '0%' : '52%' }]} />
        </View>

        <View style={styles.statsRow}>
          <MiniStat value={String(tasksDone)} label="Klaar" tone="mint" />
          <MiniStat value="+0" label="Vandaag" tone="peach" />
          <MiniStat value={String(level)} label="Level" tone="blue" />
        </View>
      </View>

      <View style={styles.quickGrid}>
        <QuickCard title="Beloningen" subtitle="Koop je eerste item" emoji="🎁" onPress={onOpenRewards} />
        <QuickCard title="Prestaties" subtitle={`${badgesUnlocked} badges`} emoji="🏆" onPress={onOpenAchievements} />
        <QuickCard title="Focus Tijd" subtitle="Concentreer je" emoji="🎯" onPress={onOpenFocus} />
        <QuickCard title="Hoe voel je?" subtitle="Track je gevoel" emoji="💭" onPress={onOpenMood} />
      </View>

      <View style={styles.routinesCard}>
        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>Actieve routines</Text>
          <Text style={styles.tasksCount}>{activeRoutines.length} zichtbaar</Text>
        </View>

        {activeRoutines.map((routine) => (
          <View key={routine.title} style={styles.routineRow}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineTitle}>{routine.title}</Text>
              <Text style={styles.routineStatus}>{routine.status}</Text>
            </View>
            <View style={styles.routineTaskChips}>
              {routine.tasks.map((task) => (
                <View key={task} style={styles.routineTaskChip}>
                  <Text style={styles.routineTaskChipText}>{task}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tasksCard}>
        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>Taken Vandaag</Text>
          <Text style={styles.tasksCount}>Alleen lezen</Text>
        </View>

        {[
          { title: 'Tanden-poetsen', reward: '+5 munten', done: false },
          { title: 'Bed opmaken', reward: '+5 munten', done: false },
          { title: 'Ontbijten', reward: '+10 munten', done: false },
          { title: 'Huiswerk maken', reward: '+20 munten', done: false },
          { title: 'Speelgoed opruimen', reward: '+10 munten', done: false },
          { title: 'Douchen', reward: '+10 munten', done: false },
        ].map((task) => (
          <View key={task.title} style={[styles.taskRow, task.done && styles.taskRowDone]}>
            <View style={[styles.taskCheck, task.done && styles.taskCheckDone]}>
              <Text style={styles.taskCheckIcon}>{task.done ? '✓' : '○'}</Text>
            </View>
            <View style={styles.taskTextWrap}>
              <Text style={styles.taskText}>{task.title}</Text>
              <Text style={styles.taskReward}>{task.reward}</Text>
            </View>
          </View>
        ))}
      </View>

      <StatusBar style="dark" />
    </ScrollView>
  );
}

function QuickCard({ title, subtitle, emoji, onPress }: { title: string; subtitle: string; emoji: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}>
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function MiniStat({ value, label, tone }: { value: string; label: string; tone: 'mint' | 'peach' | 'blue' }) {
  return (
    <View style={[styles.miniStat, tone === 'mint' && styles.miniStatMint, tone === 'peach' && styles.miniStatPeach, tone === 'blue' && styles.miniStatBlue]}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 40,
    paddingHorizontal: 18,
    paddingBottom: 28,
    backgroundColor: colors.background,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: {
    color: colors.textStrong,
    fontSize: 32,
    fontWeight: '900',
  },
  subtle: {
    color: '#90A0B1',
    fontSize: 16,
    marginTop: 4,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#DDECF0',
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 6,
  },
  pointsEmoji: { fontSize: 16 },
  pointsText: { fontSize: 18, fontWeight: '900', color: colors.textStrong },
  pointsLabel: { fontSize: 14, color: '#8A97A9', fontWeight: '700' },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDECF0',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    gap: 10,
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: colors.textStrong },
  heroSubtitle: { color: '#91A0B0', fontSize: 14, fontWeight: '700' },
  fireBadge: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#FFF0ED', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14 },
  fireBadgeIcon: { fontSize: 14 },
  fireBadgeText: { color: '#F27B59', fontWeight: '800', fontSize: 13 },
  previewBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#F3EFFD', borderRadius: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  progressLabel: { color: '#8A97A9', fontSize: 14, fontWeight: '700' },
  progressValue: { color: colors.textStrong, fontSize: 14, fontWeight: '800' },
  progressBar: { height: 8, borderRadius: 999, backgroundColor: '#E6ECF0', overflow: 'hidden' },
  progressFill: { width: '52%', height: '100%', backgroundColor: '#7D87E8', borderRadius: 999 },
  statsRow: { flexDirection: 'row', gap: 10 },
  miniStat: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: '#F4FBFA', borderWidth: 1, borderColor: '#DDECF0' },
  miniStatMint: { backgroundColor: '#F1FFF7' },
  miniStatPeach: { backgroundColor: '#FFF7EE' },
  miniStatBlue: { backgroundColor: '#F2F6FF' },
  miniStatValue: { fontSize: 20, fontWeight: '900', color: colors.textStrong },
  miniStatLabel: { fontSize: 12, color: '#8A97A9', marginTop: 4, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  routinesCard: { backgroundColor: colors.white, borderRadius: 26, borderWidth: 1, borderColor: '#DDECF0', padding: 14, shadowColor: colors.shadow, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3, gap: 10 },
  routineRow: { borderRadius: 18, borderWidth: 1, borderColor: '#E4F2F4', backgroundColor: '#F6FBFC', padding: 12, gap: 10 },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  routineTitle: { fontSize: 16, fontWeight: '900', color: colors.textStrong },
  routineStatus: { color: '#5F68C9', backgroundColor: '#EDF1FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11, fontWeight: '800' },
  routineTaskChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  routineTaskChip: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDECF0', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  routineTaskChipText: { color: '#6E7C8D', fontSize: 12, fontWeight: '700' },
  quickCard: { width: '48.5%', backgroundColor: colors.white, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#DDECF0', minHeight: 110, justifyContent: 'center', shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  quickCardPressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },
  quickEmoji: { fontSize: 28, marginBottom: 8 },
  quickTitle: { fontSize: 18, fontWeight: '900', color: colors.textStrong },
  quickSubtitle: { fontSize: 12, color: '#8A97A9', marginTop: 4, fontWeight: '700' },
  tasksCard: { backgroundColor: colors.white, borderRadius: 26, borderWidth: 1, borderColor: '#DDECF0', padding: 14, shadowColor: colors.shadow, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3, gap: 10, marginBottom: 4 },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tasksTitle: { fontSize: 20, fontWeight: '900', color: colors.textStrong },
  tasksCount: { fontSize: 12, color: '#8B95E8', fontWeight: '800', backgroundColor: '#EEF1FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6FBFC', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#E4F2F4', gap: 10 },
  taskRowDone: { backgroundColor: '#EFFEEC' },
  taskCheck: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EAF7F6', alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: '#16C79A' },
  taskCheckIcon: { color: colors.white, fontWeight: '900' },
  taskTextWrap: { flex: 1 },
  taskText: { fontSize: 16, fontWeight: '800', color: colors.textStrong },
  taskReward: { fontSize: 12, color: '#8A97A9', marginTop: 2, fontWeight: '700' },
});