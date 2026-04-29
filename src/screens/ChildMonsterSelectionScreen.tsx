import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import { MONSTER_COLORS } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';
import colors from '../theme/colors';

type ChildMonsterSelectionScreenProps = {
  onBack?: () => void;
  onContinue?: (monsterName: string, selectedColor: string) => void;
};

export default function ChildMonsterSelectionScreen({ onBack, onContinue }: ChildMonsterSelectionScreenProps) {
  const [monsterName, setMonsterName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const selectedColor = MONSTER_COLORS[selectedColorIndex];

  const goToPreviousColor = () => {
    setSelectedColorIndex((index) => (index - 1 + MONSTER_COLORS.length) % MONSTER_COLORS.length);
  };

  const goToNextColor = () => {
    setSelectedColorIndex((index) => (index + 1) % MONSTER_COLORS.length);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.7} hitSlop={16} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Kies jouw monstertje</Text>
        <Text style={styles.subtitle}>Swipe om verschillende kleuren te zien</Text>

        <View style={styles.carouselRow}>
          <NavCircle symbol="‹" onPress={goToPreviousColor} />
          <View style={styles.monsterFrame}>
            <MonsterModel3D color={selectedColor} size={160} />
          </View>
          <NavCircle symbol=">" onPress={goToNextColor} />
        </View>

        <View style={styles.dotsRow}>
          {MONSTER_COLORS.map((color, index) => {
            const isActive = index === selectedColorIndex;
            return (
              <Pressable key={color} onPress={() => setSelectedColorIndex(index)} style={[styles.dot, { backgroundColor: color }, isActive && styles.dotActive]} />
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Geef jouw monster een naam</Text>

        <View style={styles.inputShell}>
          <TextInput
            value={monsterName}
            onChangeText={setMonsterName}
            placeholder="Sparky"
            placeholderTextColor="#B8C7D4"
            style={styles.input}
            autoComplete="off"
            importantForAutofill="no"
            textContentType="none"
          />
        </View>

        <Text style={styles.helper}>{monsterName.length}/20 karakters</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={() => onContinue?.(monsterName, selectedColor)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Ga verder</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

function NavCircle({ symbol, onPress }: { symbol: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.navCircle}>
      <Text style={styles.navSymbol}>{symbol}</Text>
    </Pressable>
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
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D0DEE8',
  },
  dotActive: {
    transform: [{ scale: 1.25 }],
    borderColor: '#58C9D7',
    borderWidth: 2,
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