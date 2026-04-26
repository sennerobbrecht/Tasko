import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import colors from '../theme/colors';

type ChildHowItWorksScreenProps = {
  onBack?: () => void;
  onSkip?: () => void;
  onContinue?: () => void;
};

export default function ChildHowItWorksScreen({ onBack, onSkip, onContinue }: ChildHowItWorksScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.7} hitSlop={16} onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} hitSlop={12} onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsRow}>
          <MiniCard icon="✓" />
          <MiniCard icon="★" highlighted />
          <MiniCard icon="↗" />
        </View>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.title}>Zo werkt Tasko</Text>

        <View style={styles.bodyBlock}>
          <Text style={styles.body}>
            Deze app helpt je om <Text style={styles.bold}>overzicht te houden</Text> in je dag. Je ziet hier je dagelijkse routines, zoals opstaan, huiswerk maken en bedtijd.
          </Text>
          <Text style={styles.body}>
            <Text style={styles.bold}>Vink een taak af</Text> wanneer je klaar bent en verdien punten.
          </Text>
          <Text style={styles.body}>Zo zie je hoe goed je bezig bent en wat je al hebt gedaan.</Text>

          <View style={styles.tipBox}>
            <View style={styles.tipBar} />
            <Text style={styles.tipText}>
              Alles hoeft niet perfect te zijn.
              {'\n'}Elke stap die je zet, telt! ⭐
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={onContinue} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Ga verder</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusBar style="dark" />
    </View>
  );
}

function MiniCard({ icon, highlighted = false }: { icon: string; highlighted?: boolean }) {
  return (
    <View style={[styles.miniCard, highlighted && styles.miniCardHighlighted]}>
      <Text style={styles.miniIcon}>{icon}</Text>
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    minWidth: 52,
    minHeight: 52,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 36,
    color: colors.primary,
  },
  skipButton: {
    minWidth: 60,
    minHeight: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skipText: {
    color: '#8A97A9',
    fontSize: 21,
    fontWeight: '700',
  },
  cardsRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
  },
  miniCard: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#58C9D7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  miniCardHighlighted: {
    width: 112,
    height: 112,
  },
  miniIcon: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '800',
  },
  dotsRow: {
    marginTop: 26,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 44,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CFEAF0',
  },
  dotActive: {
    backgroundColor: '#58C9D7',
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.textStrong,
    marginBottom: 22,
  },
  bodyBlock: {
    gap: 16,
  },
  body: {
    fontSize: 17,
    lineHeight: 27,
    color: colors.text,
  },
  bold: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  tipBox: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#DDF5F9',
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 14,
  },
  tipBar: {
    width: 4,
    borderRadius: 4,
    backgroundColor: '#58C9D7',
  },
  tipText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 34,
    minHeight: 78,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#58C9D7',
    marginBottom: 8,
  },
  primaryText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
});