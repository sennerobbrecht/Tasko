import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';
import { supabase } from '../lib/supabase';

type ChildAchievementsScreenProps = {
  childId?: string | null;
  coins: number;
  level: number;
  onBack: () => void;
};

type Achievement = { title: string; subtitle: string; done: boolean };

export default function ChildAchievementsScreen({ childId, coins, level, onBack }: ChildAchievementsScreenProps) {
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadTaskStats = async () => {
      if (!childId) {
        if (mounted) {
          setTotalCompletions(0);
          setStreakDays(0);
        }
        return;
      }

      const { data, error } = await supabase.rpc('get_child_achievement_stats', {
        p_child_id: childId,
      });

      if (!mounted || error || !data) {
        return;
      }

      const firstRow = Array.isArray(data) ? data[0] : data;
      setTotalCompletions(Number(firstRow?.total_completions ?? 0));
      setStreakDays(Number(firstRow?.streak_days ?? 0));
    };

    loadTaskStats();

    const channel = supabase
      .channel('child-achievements-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_completions' }, loadTaskStats)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const achievements = useMemo<Achievement[]>(() => {
    return [
      { title: 'Eerste Vinkje', subtitle: 'Voltooi je eerste taak', done: totalCompletions >= 1 },
      { title: 'Taken Starter', subtitle: 'Voltooi 10 taken', done: totalCompletions >= 10 },
      { title: 'Taken Pro', subtitle: 'Voltooi 25 taken', done: totalCompletions >= 25 },
      { title: 'Taken Legend', subtitle: 'Voltooi 50 taken', done: totalCompletions >= 50 },
      { title: 'Streak Starter', subtitle: 'Houd een streak van 3 dagen', done: streakDays >= 3 },
      { title: 'Streak Ster', subtitle: 'Houd een streak van 7 dagen', done: streakDays >= 7 },
      { title: 'Streak Koning', subtitle: 'Houd een streak van 14 dagen', done: streakDays >= 14 },
      { title: 'Muntjes Starter', subtitle: 'Verzamel 50 munten', done: coins >= 50 },
      { title: 'Muntjes Meester', subtitle: 'Verzamel 200 munten', done: coins >= 200 },
      { title: 'Level 3', subtitle: 'Bereik level 3', done: level >= 3 },
      { title: 'Level 5', subtitle: 'Bereik level 5', done: level >= 5 },
    ];
  }, [coins, level, streakDays, totalCompletions]);

  const unlockedCount = achievements.filter((item) => item.done).length;
  const progressWidth = `${Math.round((unlockedCount / achievements.length) * 100)}%` as `${number}%`;

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
            <Text style={styles.heroCount}>{unlockedCount} van {achievements.length}</Text>
            <Text style={styles.heroLabel}>Badges ontgrendeld</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
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