import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import { MonsterModel3D } from '../components/MonsterModel3D';
import { MONSTER_COLORS } from '../components/MonsterPreview';
import ScreenScroll from '../components/ScreenScroll';
import colors from '../theme/colors';

export type ChildMonsterSelectionResult = {
  name: string;
  color: string;
};

type ChildMonsterSelectionScreenProps = {
  onBack?: () => void;
  onContinue?: (result: ChildMonsterSelectionResult) => void;
};

export default function ChildMonsterSelectionScreen({ onBack, onContinue }: ChildMonsterSelectionScreenProps) {
  const [monsterName, setMonsterName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(MONSTER_COLORS[0]);

  return (
    <View style={styles.screen}>
      <ScreenScroll contentContainerStyle={styles.content}>
        <TouchableOpacity activeOpacity={0.7} hitSlop={16} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Jouw monstertje</Text>

        <View style={styles.monsterFrame}>
          <MonsterModel3D
            color={selectedColor}
            size={230}
            autoRotate={false}
            allowManualRotate
            initialYRotation={0}
          />
        </View>
        <Text style={styles.rotateHint}>Sleep horizontaal om te draaien</Text>

        <Text style={styles.sectionTitle}>Kies een kleur</Text>
        <View style={styles.colorRow}>
          {MONSTER_COLORS.map((color) => {
            const active = color === selectedColor;
            return (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[styles.colorSwatch, { backgroundColor: color }, active && styles.colorSwatchActive]}
                accessibilityRole="button"
                accessibilityLabel={`Kleur ${color}`}
                accessibilityState={{ selected: active }}
              />
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

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onContinue?.({ name: monsterName, color: selectedColor })}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>Ga verder</Text>
        </TouchableOpacity>
      </ScreenScroll>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
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
  monsterFrame: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 248,
  },
  rotateHint: {
    textAlign: 'center',
    marginTop: 8,
    color: '#8A97A9',
    fontSize: 14,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: colors.textStrong,
    marginTop: 24,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: colors.primaryDark,
    transform: [{ scale: 1.08 }],
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
