import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import colors from '../theme/colors';
import { type AccessoryKey } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';
import { getTodayMoodForChild, getWeekMoodsForChild, saveMoodForToday, type MoodKey } from '../services/moods';
import { MoodPickerGrid } from '../components/mood/MoodPickerGrid';
import { MoodWeekCard } from '../components/mood/MoodWeekCard';

type ChildMoodScreenProps = {
  childId?: string | null;
  monsterName: string;
  selectedAccessory?: AccessoryKey;
  selectedMonsterColor: string;
  onBack: () => void;
};

const moods: Array<{ key: MoodKey; emoji: string; label: string }> = [
  { key: 'happy', emoji: '😊', label: 'Blij' },
  { key: 'content', emoji: '😌', label: 'Kalm' },
  { key: 'neutral', emoji: '😐', label: 'Oké' },
  { key: 'stressed', emoji: '😣', label: 'Gestrest' },
  { key: 'sad', emoji: '😢', label: 'Verdrietig' },
];

const moodEmojiMap: Record<MoodKey, string> = {
  happy: '😊',
  content: '😌',
  neutral: '😐',
  stressed: '😣',
  sad: '😢',
};

const toLocalDayKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function ChildMoodScreen({ childId, monsterName, selectedMonsterColor, onBack }: ChildMoodScreenProps) {
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [weekMoodByDay, setWeekMoodByDay] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!childId) {
      return;
    }

    const load = async () => {
      const { data } = await getTodayMoodForChild(childId);
      if (data?.mood) {
        setSelectedMood(data.mood);
      }

      const weekStart = new Date();
      const jsDay = weekStart.getDay();
      const diff = jsDay === 0 ? 6 : jsDay - 1;
      weekStart.setDate(weekStart.getDate() - diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekResult = await getWeekMoodsForChild(childId, weekStart.toISOString());
      if (weekResult.data) {
        const byDay: Record<string, string> = {};
        weekResult.data.forEach((entry) => {
          const dayKey = toLocalDayKey(new Date(entry.created_at));
          if (!byDay[dayKey]) {
            byDay[dayKey] = moodEmojiMap[entry.mood] ?? '—';
          }
        });
        setWeekMoodByDay(byDay);
      }
    };

    load();
  }, [childId]);

  const dayCells = useMemo(() => {
    const days = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
    const now = new Date();
    const jsDay = now.getDay();
    const mondayIndex = jsDay === 0 ? 6 : jsDay - 1;

    return days.map((day, index) => ({
      // Convert day index to current week date key.
      key: (() => {
        const date = new Date();
        date.setDate(date.getDate() - mondayIndex + index);
        return toLocalDayKey(date);
      })(),
      day,
      mood: '—',
      active: index === mondayIndex,
    })).map((entry) => ({
      day: entry.day,
      mood: weekMoodByDay[entry.key] ?? (entry.active && selectedMood ? moodEmojiMap[selectedMood] : '—'),
      active: entry.active,
    }));
  }, [selectedMood, weekMoodByDay]);

  const handleSelectMood = async (mood: MoodKey) => {
    if (saving) {
      return;
    }

    // Always reflect selection immediately in UI.
    setSelectedMood(mood);

    if (!childId) {
      Alert.alert('Profiel ontbreekt', 'Je kindprofiel is nog niet gekoppeld. Ga even opnieuw door de kindregistratie.');
      return;
    }

    setSaving(true);
    const { error } = await saveMoodForToday(childId, mood);
    if (error) {
      Alert.alert('Opslaan mislukt', error.message || 'Kon je gevoel niet opslaan.');
      setSaving(false);
      return;
    }

    const todayKey = toLocalDayKey(new Date());
    setWeekMoodByDay((prev) => ({ ...prev, [todayKey]: moodEmojiMap[mood] }));
    setSaving(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Hoe voel je je?</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.previewCard}>
        <MonsterModel3D color={selectedMonsterColor} size={160} zoom={1.2} autoRotate={false} allowManualRotate={false} initialYRotation={0} />
        <Text style={styles.previewText}>Vertel {monsterName || 'je monstertje'} hoe je je voelt...</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Kies je gevoel</Text>
        <MoodPickerGrid moods={moods} selectedMood={selectedMood} disabled={!childId || saving} onSelect={handleSelectMood} />
        <Text style={styles.helperText}>
          Je kan vandaag 1 gevoel kiezen en aanpassen zolang de dag bezig is.
        </Text>
      </View>

      <MoodWeekCard dayCells={dayCells} hasMoodToday={Boolean(selectedMood)} />

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
  previewCard: { backgroundColor: colors.white, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#DDECF0', alignItems: 'center', gap: 8 },
  previewText: { color: '#8A97A9', fontSize: 13, fontWeight: '700' },
  sectionCard: { backgroundColor: colors.white, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#DDECF0', gap: 12 },
  sectionTitle: { color: colors.textStrong, fontSize: 18, fontWeight: '900' },
  helperText: { color: '#8A97A9', fontSize: 12, fontWeight: '700' },
});