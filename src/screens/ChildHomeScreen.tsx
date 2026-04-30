import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';
import { type AccessoryKey } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';
import { supabase } from '../lib/supabase';
import { getTodayRoutineTasksForChild, setTaskCompletionForChild, type ChildRoutineTask } from '../services/routines';

type ChildHomeScreenProps = {
  childId?: string | null;
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
  onCoinsChange?: (nextCoins: number) => void;
};

export default function ChildHomeScreen({
  childId,
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
  onCoinsChange,
}: ChildHomeScreenProps) {
  const displayName = monsterName.trim() || 'Je nieuwe monstertje';
  const [routineTasks, setRoutineTasks] = useState<ChildRoutineTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const routineGroups = useMemo(() => {
    const groups = new Map<string, { routineId: string; title: string; tasks: ChildRoutineTask[] }>();
    routineTasks.forEach((task) => {
      const existing = groups.get(task.routine_id);
      if (existing) {
        existing.tasks.push(task);
        return;
      }
      groups.set(task.routine_id, { routineId: task.routine_id, title: task.routine_title, tasks: [task] });
    });
    return Array.from(groups.values());
  }, [routineTasks]);

  const completedCount = useMemo(() => routineTasks.filter((task) => task.is_completed).length, [routineTasks]);
  const progressPercent = useMemo(() => {
    if (routineTasks.length === 0) return 0;
    return Math.round((completedCount / routineTasks.length) * 100);
  }, [completedCount, routineTasks.length]);

  useEffect(() => {
    let mounted = true;

    const fetchTasks = async () => {
      if (!childId) {
        if (mounted) {
          setRoutineTasks([]);
          setLoadingTasks(false);
        }
        return;
      }

      setLoadingTasks(true);
      const { data, error } = await getTodayRoutineTasksForChild(childId);

      if (!mounted) return;
      if (error) {
        setRoutineTasks([]);
      } else {
        setRoutineTasks(data);
      }
      setLoadingTasks(false);
    };

    fetchTasks();

    const channel = supabase
      .channel('child-home-routine-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routines' }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routine_tasks' }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_completions' }, fetchTasks)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const handleToggleTask = async (task: ChildRoutineTask) => {
    if (!childId || togglingTaskId) return;

    const nextCompleted = !task.is_completed;

    setTogglingTaskId(task.routine_task_id);

    setRoutineTasks((prev) =>
      prev.map((row) => (row.routine_task_id === task.routine_task_id ? { ...row, is_completed: nextCompleted } : row)),
    );

    const { data, error } = await setTaskCompletionForChild({
      childId,
      routineTaskId: task.routine_task_id,
      completed: nextCompleted,
    });

    if (error) {
      setRoutineTasks((prev) =>
        prev.map((row) => (row.routine_task_id === task.routine_task_id ? { ...row, is_completed: task.is_completed } : row)),
      );
      Alert.alert('Opslaan mislukt', error.message || 'Kon taak niet bijwerken.');
      setTogglingTaskId(null);
      return;
    }

    const newBalance = data?.new_balance ?? coins;
    onCoinsChange?.(newBalance);

    if (nextCompleted && (data?.bonus_points ?? 0) > 0) {
      Alert.alert('Bonus verdiend!', `Alles klaar vandaag! Je kreeg +${data?.bonus_points ?? 0} bonus munten.`);
    }

    setTogglingTaskId(null);
  };

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
          <Text style={styles.progressValue}>{completedCount}/{routineTasks.length}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.statsRow}>
          <MiniStat value={String(tasksDone)} label="Klaar" tone="mint" />
          <MiniStat value={`+${coins}`} label="Munten" tone="peach" />
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
          <Text style={styles.tasksCount}>{routineGroups.length} zichtbaar</Text>
        </View>

        {loadingTasks ? <Text style={styles.emptyText}>Routines laden...</Text> : null}
        {!loadingTasks && routineGroups.length === 0 ? <Text style={styles.emptyText}>Nog geen actieve routines.</Text> : null}

        {routineGroups.map((routine) => (
          <View key={routine.routineId} style={styles.routineRow}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineTitle}>{routine.title}</Text>
              <Text style={styles.routineStatus}>Actief</Text>
            </View>
            <View style={styles.routineTaskChips}>
              {routine.tasks.map((task) => (
                <View key={task.routine_task_id} style={styles.routineTaskChip}>
                  <Text style={styles.routineTaskChipText}>{task.task_title}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tasksCard}>
        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>Taken Vandaag</Text>
          <Text style={styles.tasksCount}>Aantikken om af te vinken</Text>
        </View>

        {routineTasks.map((task) => (
          <Pressable
            key={task.routine_task_id}
            onPress={() => handleToggleTask(task)}
            disabled={togglingTaskId === task.routine_task_id}
            style={[styles.taskRow, task.is_completed && styles.taskRowDone]}
          >
            <View style={[styles.taskCheck, task.is_completed && styles.taskCheckDone]}>
              <Text style={styles.taskCheckIcon}>{task.is_completed ? '✓' : '○'}</Text>
            </View>
            <View style={styles.taskTextWrap}>
              <Text style={styles.taskText}>{task.task_title}</Text>
              <Text style={styles.taskReward}>{`+${task.reward_points} munten`}</Text>
            </View>
          </Pressable>
        ))}
        {!loadingTasks && routineTasks.length === 0 ? <Text style={styles.emptyText}>Geen taken beschikbaar vandaag.</Text> : null}
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
  emptyText: { fontSize: 13, color: '#8A97A9', fontWeight: '700' },
});