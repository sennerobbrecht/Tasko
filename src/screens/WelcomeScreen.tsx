import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';

type WelcomeScreenProps = {
  onLogin?: () => void;
  onRegisterChild?: () => void;
  onRegisterParent?: () => void;
};

export default function WelcomeScreen({ onLogin, onRegisterChild, onRegisterParent }: WelcomeScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.backgroundBlobBottom} />

      <View style={styles.content}>
        <View style={styles.hero}>
          <Image source={require('../../assets/Tasko.png')} style={styles.logo} resizeMode="contain" />

          <View style={styles.copyBlock}>
            <Text style={styles.title}>Welkom bij Tasko</Text>
            <Text style={styles.subtitle}>Bouw routines op die blijven.</Text>
            <Text style={styles.body}>
              Tasko helpt je om overzicht te creëren, gewoontes te volgen en stap voor stap meer structuur in je dag te brengen.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            android_ripple={{ color: 'rgba(255, 255, 255, 0.18)' }}
            onPress={onLogin}
            style={({ pressed }) => [styles.buttonBase, styles.buttonPrimary, pressed && styles.buttonPressed]}
          >
            <Text style={[styles.buttonLabel, styles.buttonLabelPrimary]}>Login</Text>
          </Pressable>

          <Pressable
            android_ripple={{ color: 'rgba(66, 199, 213, 0.12)' }}
            onPress={onRegisterChild}
            style={({ pressed }) => [styles.buttonBase, styles.buttonSecondary, pressed && styles.buttonPressed]}
          >
            <Text style={[styles.buttonLabel, styles.buttonLabelSecondary]}>Register als kind</Text>
          </Pressable>

          <Pressable
            android_ripple={{ color: 'rgba(66, 199, 213, 0.12)' }}
            onPress={onRegisterParent}
            style={({ pressed }) => [styles.buttonBase, styles.buttonGhost, pressed && styles.buttonPressed]}
          >
            <Text style={[styles.buttonLabel, styles.buttonLabelSecondary]}>Register als ouder</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Start vandaag met meer structuur</Text>
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  backgroundBlobTop: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#E6FBFD',
    opacity: 0.9,
  },
  backgroundBlobBottom: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: colors.backgroundBlob,
    opacity: 0.8,
  },
  hero: {
    alignItems: 'center',
    marginTop: 8,
  },
  logo: {
    width: 280,
    height: 250,
    marginBottom: 8,
  },
  copyBlock: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: colors.textStrong,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 18,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.textStrong,
    textAlign: 'center',
  },
  body: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    textAlign: 'center',
    maxWidth: 500,
  },
  actions: {
    gap: 14,
    marginTop: 28,
  },
  buttonBase: {
    minHeight: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 20,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  buttonGhost: {
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  buttonLabel: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonLabelPrimary: {
    color: colors.white,
  },
  buttonLabelSecondary: {
    color: colors.primaryDark,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 24,
    color: colors.footer,
  },
});