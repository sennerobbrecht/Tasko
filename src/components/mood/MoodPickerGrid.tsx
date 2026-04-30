import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';
import type { MoodKey } from '../../services/moods';

type MoodOption = {
  key: MoodKey;
  emoji: string;
  label: string;
};

type MoodPickerGridProps = {
  moods: MoodOption[];
  selectedMood: MoodKey | null;
  disabled?: boolean;
  onSelect: (mood: MoodKey) => void;
};

export function MoodPickerGrid({ moods, selectedMood, disabled = false, onSelect }: MoodPickerGridProps) {
  return (
    <View style={styles.moodGrid}>
      {moods.map((mood) => (
        <Pressable
          key={mood.key}
          onPress={() => onSelect(mood.key)}
          disabled={disabled}
          style={[styles.moodCard, selectedMood === mood.key && styles.moodCardActive]}
        >
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <Text style={styles.moodLabel}>{mood.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodCard: { width: '31.5%', minHeight: 88, borderRadius: 18, borderWidth: 1, borderColor: '#DDECF0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFDFF' },
  moodCardActive: { borderColor: '#6C78E8', backgroundColor: '#F0F3FF' },
  moodEmoji: { fontSize: 28 },
  moodLabel: { marginTop: 6, fontSize: 13, color: colors.textStrong, fontWeight: '700' },
});
