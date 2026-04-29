import { StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';

export type AccessoryKey = 'sunglasses' | 'hoodie' | 'crown' | 'bowtie' | 'flower' | 'wand' | 'patch';

type MonsterPreviewProps = {
  accessory?: AccessoryKey;
  color?: string;
  size?: number;
  showLabel?: boolean;
};

const ACCESSORY_LABELS: Record<AccessoryKey, string> = {
  sunglasses: '🕶️',
  hoodie: '🧢',
  crown: '👑',
  bowtie: '🎀',
  flower: '🌸',
  wand: '✨',
  patch: '🏴‍☠️',
};

export const MONSTER_COLORS = ['#D6F7FF', '#FFD9EC', '#DDF7D8', '#FFE9C9', '#E2DDFF'] as const;

export function MonsterPreview({ accessory, color = MONSTER_COLORS[0], size = 160, showLabel = false }: MonsterPreviewProps) {
  const scale = size / 160;

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View style={[styles.monster, { transform: [{ scale }] }]}>
        <View style={[styles.glow, { backgroundColor: color }]} />
        <View style={[styles.face, { backgroundColor: color }]} />
        <View style={[styles.horn, styles.hornLeft]} />
        <View style={[styles.horn, styles.hornRight]} />
        <View style={styles.eyeLeft} />
        <View style={styles.eyeRight} />
        <View style={styles.smile} />
        {accessory ? <Text style={styles.accessory}>{ACCESSORY_LABELS[accessory]}</Text> : null}
      </View>
      {showLabel && accessory ? <Text style={styles.label}>{ACCESSORY_LABELS[accessory]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monster: {
    width: 120,
    height: 120,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: '#C5FFF5',
    opacity: 0.7,
  },
  face: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D6F7FF',
  },
  horn: {
    position: 'absolute',
    top: 8,
    width: 22,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  hornLeft: {
    left: 18,
    transform: [{ rotate: '16deg' }],
  },
  hornRight: {
    right: 18,
    transform: [{ rotate: '-16deg' }],
  },
  eyeLeft: {
    position: 'absolute',
    top: 48,
    left: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D6C7A',
  },
  eyeRight: {
    position: 'absolute',
    top: 48,
    right: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D6C7A',
  },
  smile: {
    position: 'absolute',
    bottom: 18,
    width: 44,
    height: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF',
    borderRadius: 30,
  },
  accessory: {
    position: 'absolute',
    top: 18,
    fontSize: 28,
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    color: colors.textStrong,
    fontWeight: '800',
  },
});