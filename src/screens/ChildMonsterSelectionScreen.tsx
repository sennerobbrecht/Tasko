import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import { MonsterModel3D } from '../components/MonsterModel3D';
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

        <Text style={styles.title}>Jouw monstertje</Text>

        <View style={styles.monsterFrame}>
          <MonsterModel3D color="#D6F7FF" size={230} autoRotate={false} allowManualRotate={false} initialYRotation={0} />
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

        <TouchableOpacity activeOpacity={0.9} onPress={() => onContinue?.(monsterName)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Ga verder</Text>
        </TouchableOpacity>
      </View>

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
  monsterFrame: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 248,
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