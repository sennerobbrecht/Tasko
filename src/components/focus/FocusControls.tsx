import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

type FocusControlsProps = {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
};

export function FocusControls({ isRunning, onToggle, onReset }: FocusControlsProps) {
  return (
    <View style={styles.controlsRow}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.controlButton, styles.controlPrimary, pressed && styles.buttonPressed]}>
        <Text style={styles.controlText}>{isRunning ? '⏸' : '▶'}</Text>
      </Pressable>
      <Pressable onPress={onReset} style={({ pressed }) => [styles.controlButton, pressed && styles.buttonPressed]}>
        <Text style={styles.controlTextMuted}>↻</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 6 },
  controlButton: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0', shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  controlPrimary: { borderColor: '#8B8DEE' },
  controlText: { fontSize: 22, color: '#6C78E8', fontWeight: '900' },
  controlTextMuted: { fontSize: 22, color: '#A3ACB8', fontWeight: '900' },
  buttonPressed: { transform: [{ scale: 0.98 }] },
});
