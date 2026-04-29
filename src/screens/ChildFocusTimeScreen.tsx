import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Audio } from 'expo-av';

import colors from '../theme/colors';
import { type AccessoryKey } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';

type ChildFocusTimeScreenProps = {
  monsterName: string;
  selectedAccessory?: AccessoryKey;
  selectedMonsterColor: string;
  selectedMinutes: (typeof durations)[number] | null;
  remainingSeconds: number;
  endAtMs: number | null;
  isRunning: boolean;
  onSelectMinutes: (minutes: (typeof durations)[number]) => void;
  onToggle: () => void;
  onReset: () => void;
  onTimeUp: () => void;
  onBack: () => void;
};

const durations = [5, 10, 15, 25] as const;

export default function ChildFocusTimeScreen({
  monsterName,
  selectedAccessory,
  selectedMonsterColor,
  selectedMinutes,
  remainingSeconds,
  endAtMs,
  isRunning,
  onSelectMinutes,
  onToggle,
  onReset,
  onTimeUp,
  onBack,
}: ChildFocusTimeScreenProps) {
  const [displayRemaining, setDisplayRemaining] = useState(remainingSeconds);
  const didRingRef = useRef(false);

  useEffect(() => {
    if (!isRunning || !endAtMs) {
      setDisplayRemaining(remainingSeconds);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((endAtMs - Date.now()) / 1000));
      setDisplayRemaining(remaining);
    };

    update();
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [endAtMs, isRunning, remainingSeconds]);

  useEffect(() => {
    const playDoneSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync({
          uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
        });
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if ('didJustFinish' in status && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch {
        // Skip sound if device/network blocks playback.
      }
    };

    if (isRunning && displayRemaining <= 0 && !didRingRef.current) {
      didRingRef.current = true;
      onTimeUp();
      playDoneSound();
      return;
    }

    if (displayRemaining > 0) {
      didRingRef.current = false;
    }
  }, [displayRemaining, isRunning, onTimeUp]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(displayRemaining / 60).toString().padStart(2, '0');
    const seconds = (displayRemaining % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [displayRemaining]);

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.title}>Focus Tijd</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.ringWrap}>
          <View style={styles.ring}>
            <MonsterModel3D color={selectedMonsterColor} size={150} zoom={1.2} />
          </View>
        </View>

        <Text style={styles.timer}>{timeLabel}</Text>
        <Text style={styles.subtitle}>{isRunning ? 'Focus actief...' : 'Kies een tijd en start'}</Text>

        <View style={styles.durationRow}>
          {durations.map((duration) => {
            const active = duration === selectedMinutes;
            return (
              <Pressable key={duration} onPress={() => onSelectMinutes(duration)} style={({ pressed }) => [styles.durationButton, active && styles.durationButtonActive, pressed && styles.durationButtonPressed]}>
                <Text style={[styles.durationIcon, active && styles.durationIconActive]}>{duration} min</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.controlsRow}>
          <Pressable onPress={onToggle} style={({ pressed }) => [styles.controlButton, styles.controlPrimary, pressed && styles.buttonPressed]}>
            <Text style={styles.controlText}>{isRunning ? '⏸' : '▶'}</Text>
          </Pressable>
          <Pressable onPress={onReset} style={({ pressed }) => [styles.controlButton, pressed && styles.buttonPressed]}>
            <Text style={styles.controlTextMuted}>↻</Text>
          </Pressable>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Focus Tips</Text>
          <Text style={styles.tipText}>• Zet je telefoon op stil{"\n"}• Zoek een rustige plek{"\n"}• Neem pauzes na elke sessie</Text>
        </View>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingTop: 40, paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0' },
  backArrow: { fontSize: 24, color: colors.primary, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '900', color: colors.textStrong },
  spacer: { width: 44 },
  ringWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  ring: { width: 210, height: 210, borderRadius: 105, borderWidth: 10, borderColor: '#E0E4FB', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  timer: { textAlign: 'center', fontSize: 48, fontWeight: '900', color: colors.textStrong },
  subtitle: { textAlign: 'center', color: '#8A97A9', fontWeight: '700' },
  durationRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  durationButton: { flex: 1, minHeight: 58, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0' },
  durationButtonActive: { backgroundColor: '#6C78E8' },
  durationButtonPressed: { transform: [{ scale: 0.99 }] },
  durationIcon: { color: colors.textStrong, fontWeight: '800' },
  durationIconActive: { color: colors.white },
  controlsRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 6 },
  controlButton: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0', shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  controlPrimary: { borderColor: '#8B8DEE' },
  controlText: { fontSize: 22, color: '#6C78E8', fontWeight: '900' },
  controlTextMuted: { fontSize: 22, color: '#A3ACB8', fontWeight: '900' },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  tipBox: { marginTop: 4, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDECF0', padding: 14, gap: 8 },
  tipTitle: { color: colors.textStrong, fontSize: 16, fontWeight: '900' },
  tipText: { color: '#8A97A9', lineHeight: 22, fontWeight: '600' },
});