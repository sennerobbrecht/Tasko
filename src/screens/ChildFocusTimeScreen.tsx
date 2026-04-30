import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Audio } from 'expo-av';

import colors from '../theme/colors';
import { type AccessoryKey } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';
import { FocusHeader } from '../components/focus/FocusHeader';
import { FocusDurationPicker } from '../components/focus/FocusDurationPicker';
import { FocusControls } from '../components/focus/FocusControls';
import { FocusTipsCard } from '../components/focus/FocusTipsCard';

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
        <FocusHeader onBack={onBack} />

        <View style={styles.ringWrap}>
          <View style={styles.ring}>
            <MonsterModel3D color={selectedMonsterColor} size={150} zoom={1.2} autoRotate={false} allowManualRotate={false} initialYRotation={0} />
          </View>
        </View>

        <Text style={styles.timer}>{timeLabel}</Text>
        <Text style={styles.subtitle}>{isRunning ? 'Focus actief...' : 'Kies een tijd en start'}</Text>

        <FocusDurationPicker selectedMinutes={selectedMinutes} onSelect={onSelectMinutes} />

        <FocusControls isRunning={isRunning} onToggle={onToggle} onReset={onReset} />

        <FocusTipsCard />
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingTop: 40, paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  ringWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  ring: { width: 210, height: 210, borderRadius: 105, borderWidth: 10, borderColor: '#E0E4FB', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  timer: { textAlign: 'center', fontSize: 48, fontWeight: '900', color: colors.textStrong },
  subtitle: { textAlign: 'center', color: '#8A97A9', fontWeight: '700' },
});