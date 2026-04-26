import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import colors from '../theme/colors';

type ChildRewardScreenProps = {
  onBack?: () => void;
  onContinue?: () => void;
};

export default function ChildRewardScreen({ onBack, onContinue }: ChildRewardScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.7} hitSlop={16} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓</Text>
          <Text style={styles.badgeLabel}>Verdien punten en pas je monstertje aan</Text>
        </View>

        <View style={styles.rewardIllustration}>
          <View style={styles.coin}>
            <Text style={styles.coinText}>🏅</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.paletteCard}>
            <Text style={styles.paletteText}>🎨</Text>
          </View>
          <View style={styles.sparkle}>
            <Text style={styles.sparkleText}>✦</Text>
          </View>
        </View>

        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.title}>Verdien punten en pas je monstertje aan</Text>

        <View style={styles.bodyBlock}>
          <Text style={styles.body}>
            Door taken af te vinken, <Text style={styles.bold}>verdien je punten (XP)</Text>. Als je genoeg punten hebt, kan je je monstertje aanpassen.
          </Text>
          <Text style={styles.body}>
            Geef je monstertje nieuwe kleuren, spullen of accessoires en maak het helemaal van jou.
          </Text>

          <View style={[styles.tipBox, styles.tipBoxReward]}>
            <View style={styles.tipBarReward} />
            <Text style={styles.tipText}>
              Hoe meer je doet, hoe leuker je monstertje wordt! ⭐
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={onContinue} style={styles.primaryButton}>
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
    paddingBottom: 28,
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
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 26,
    backgroundColor: '#DDF5F9',
    marginTop: 10,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 18,
  },
  badgeLabel: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
  rewardIllustration: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  coin: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FFD94F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  coinText: {
    fontSize: 44,
  },
  arrow: {
    fontSize: 42,
    color: colors.primary,
    fontWeight: '900',
  },
  paletteCard: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: '#D164A0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  paletteText: {
    fontSize: 46,
  },
  sparkle: {
    position: 'absolute',
    top: 4,
    right: 68,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
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
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.textStrong,
    marginBottom: 20,
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
    backgroundColor: '#F7E6EF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 14,
  },
  tipBoxReward: {
    backgroundColor: '#F8DCEA',
  },
  tipBarReward: {
    width: 4,
    borderRadius: 4,
    backgroundColor: '#FFD21C',
  },
  tipText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 28,
    minHeight: 78,
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