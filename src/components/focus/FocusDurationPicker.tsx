import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

const DURATIONS = [5, 10, 15, 25] as const;

type FocusDurationPickerProps = {
  selectedMinutes: (typeof DURATIONS)[number] | null;
  onSelect: (minutes: (typeof DURATIONS)[number]) => void;
};

export function FocusDurationPicker({ selectedMinutes, onSelect }: FocusDurationPickerProps) {
  return (
    <View style={styles.durationRow}>
      {DURATIONS.map((duration) => {
        const active = duration === selectedMinutes;
        return (
          <Pressable key={duration} onPress={() => onSelect(duration)} style={({ pressed }) => [styles.durationButton, active && styles.durationButtonActive, pressed && styles.durationButtonPressed]}>
            <Text style={[styles.durationIcon, active && styles.durationIconActive]}>{duration} min</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  durationRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  durationButton: { flex: 1, minHeight: 58, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0' },
  durationButtonActive: { backgroundColor: '#6C78E8' },
  durationButtonPressed: { transform: [{ scale: 0.99 }] },
  durationIcon: { color: colors.textStrong, fontWeight: '800' },
  durationIconActive: { color: colors.white },
});
