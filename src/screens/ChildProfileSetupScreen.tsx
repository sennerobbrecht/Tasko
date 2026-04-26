import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import colors from '../theme/colors';

type ChildProfileSetupScreenProps = {
  onBack?: () => void;
  onContinue?: () => void;
};

export default function ChildProfileSetupScreen({ onBack, onContinue }: ChildProfileSetupScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity activeOpacity={0.7} hitSlop={16} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Maak je profiel aan</Text>
          <Text style={styles.subtitle}>Kies een foto en gebruikersnaam</Text>
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <View style={styles.avatarHead} />
              <View style={styles.avatarBody} />
            </View>
          </View>
        </View>

        <View style={styles.tagPill}>
          <Text style={styles.tagIcon}>◌</Text>
          <Text style={styles.tagText}>Kies je gebruikersnaam</Text>
        </View>

        <View style={styles.inputShell}>
          <TextInput placeholder="sennero2005" placeholderTextColor="#B8C7D4" style={styles.input} />
        </View>

        <Text style={styles.helper}>Deze naam zien anderen in je gezin</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={onContinue} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Ga verder</Text>
        </TouchableOpacity>
      </ScrollView>

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
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: 'flex-start',
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 34,
    color: colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: colors.textStrong,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 18,
    fontSize: 18,
    lineHeight: 26,
    color: '#8A97A9',
    textAlign: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 26,
    position: 'relative',
  },
  avatarRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: '#47C7D6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  avatarInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D0D0D0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatarHead: {
    width: 96,
    height: 112,
    borderRadius: 48,
    backgroundColor: '#A9A9A9',
    marginBottom: -10,
  },
  avatarBody: {
    width: 140,
    height: 88,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    backgroundColor: '#A9A9A9',
    marginTop: -10,
  },
  tagPill: {
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#DDF5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  tagIcon: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  tagText: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '800',
  },
  inputShell: {
    minHeight: 78,
    borderRadius: 22,
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
    marginTop: 14,
    marginBottom: 28,
    textAlign: 'center',
    fontSize: 16,
    color: '#8A97A9',
  },
  primaryButton: {
    minHeight: 78,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D7EEF3',
    marginBottom: 8,
  },
  primaryText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
});