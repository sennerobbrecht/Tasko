import { StyleSheet, View } from 'react-native';

import colors from '../theme/colors';

export function TaskoMascot() {
  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <View style={styles.head} />
      <View style={[styles.ear, styles.earLeft]} />
      <View style={[styles.ear, styles.earRight]} />
      <View style={[styles.cheek, styles.cheekLeft]} />
      <View style={[styles.cheek, styles.cheekRight]} />
      <View style={[styles.eye, styles.eyeLeft]} />
      <View style={[styles.eye, styles.eyeRight]} />
      <View style={[styles.pupil, styles.pupilLeft]} />
      <View style={[styles.pupil, styles.pupilRight]} />
      <View style={styles.muzzle} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 260,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.backgroundGlow,
    opacity: 0.55,
  },
  head: {
    position: 'absolute',
    bottom: 28,
    width: 220,
    height: 160,
    borderRadius: 48,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  ear: {
    position: 'absolute',
    top: 18,
    width: 78,
    height: 105,
    borderRadius: 30,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  earLeft: {
    left: 32,
    transform: [{ rotate: '-24deg' }],
  },
  earRight: {
    right: 32,
    transform: [{ rotate: '24deg' }],
  },
  cheek: {
    position: 'absolute',
    bottom: 72,
    width: 76,
    height: 58,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  cheekLeft: {
    left: 40,
  },
  cheekRight: {
    right: 40,
  },
  eye: {
    position: 'absolute',
    bottom: 68,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  eyeLeft: {
    left: 64,
  },
  eyeRight: {
    right: 64,
  },
  pupil: {
    position: 'absolute',
    bottom: 84,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryDark,
  },
  pupilLeft: {
    left: 73,
  },
  pupilRight: {
    right: 73,
  },
  muzzle: {
    position: 'absolute',
    bottom: 56,
    width: 112,
    height: 34,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
});