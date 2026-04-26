import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import colors from '../theme/colors';

type ChildMonsterSelectionScreenProps = {
  onBack?: () => void;
  onContinue?: (monsterName: string) => void;
};

export default function ChildMonsterSelectionScreen({ onBack, onContinue }: ChildMonsterSelectionScreenProps) {
  const [monsterName, setMonsterName] = useState('');

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.7} hitSlop={16} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Kies jouw monstertje</Text>
        <Text style={styles.subtitle}>Swipe om verschillende kleuren te zien</Text>

        <View style={styles.carouselRow}>
          <NavCircle symbol="‹" />
          <View style={styles.monsterFrame}>
            <View style={styles.monsterBody}>
              <View style={styles.monsterGlow} />
              <View style={styles.monsterFace} />
              <View style={[styles.horn, styles.hornLeft]} />
              <View style={[styles.horn, styles.hornRight]} />
              <View style={styles.monsterEyeLeft} />
              <View style={styles.monsterEyeRight} />
              <View style={styles.monsterSmile} />
            </View>
          </View>
          <NavCircle symbol=">" />
        </View>

        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        <Text style={styles.sectionTitle}>Geef jouw monster een naam</Text>

        <View style={styles.inputShell}>
          <TextInput value={monsterName} onChangeText={setMonsterName} placeholder="Sparky" placeholderTextColor="#B8C7D4" style={styles.input} />
        </View>

        <Text style={styles.helper}>{monsterName.length}/20 karakters</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={() => onContinue?.(monsterName)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Ga verder</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

function NavCircle({ symbol }: { symbol: string }) {
  return (
    <View style={styles.navCircle}>
      <Text style={styles.navSymbol}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    minWidth: 52,
    minHeight: 52,
    justifyContent: 'center',
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 34,
    color: colors.primary,
  },
  title: {
    textAlign: 'center',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.textStrong,
    marginTop: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
    color: '#8A97A9',
    marginTop: 14,
  },
  carouselRow: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFEAF0',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  navSymbol: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '900',
  },
  monsterFrame: {
    width: 166,
    height: 166,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterBody: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D6F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monsterGlow: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#C5FFF5',
    opacity: 0.7,
  },
  monsterFace: {
    position: 'absolute',
    bottom: 14,
    width: 88,
    height: 58,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
  },
  horn: {
    position: 'absolute',
    top: 8,
    width: 22,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '16deg' }],
  },
  hornLeft: {
    left: 18,
  },
  hornRight: {
    right: 18,
    transform: [{ rotate: '-16deg' }],
  },
  monsterEyeLeft: {
    position: 'absolute',
    top: 54,
    left: 33,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D6C7A',
  },
  monsterEyeRight: {
    position: 'absolute',
    top: 54,
    right: 33,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D6C7A',
  },
  monsterSmile: {
    position: 'absolute',
    bottom: 23,
    width: 42,
    height: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF',
    borderRadius: 30,
  },
  dotsRow: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CFEAF0',
  },
  dotActive: {
    width: 42,
    backgroundColor: '#58C9D7',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: colors.textStrong,
    marginTop: 30,
  },
  inputShell: {
    marginTop: 18,
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#BFEAF0',
    backgroundColor: colors.white,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  input: {
    textAlign: 'center',
    fontSize: 20,
    color: colors.textStrong,
  },
  helper: {
    textAlign: 'center',
    marginTop: 10,
    color: '#8A97A9',
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 28,
    minHeight: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#58C9D7',
  },
  primaryText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
});