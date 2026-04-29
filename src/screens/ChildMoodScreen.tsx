import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';
import { MonsterPreview, type AccessoryKey } from '../components/MonsterPreview';

type ChildMoodScreenProps = {
  monsterName: string;
  selectedAccessory?: AccessoryKey;
  selectedMonsterColor: string;
  onBack: () => void;
};

const moods = [
  ['😊', 'Blij'],
  ['😌', 'Kalm'],
  ['⚡', 'Energiek'],
  ['😴', 'Moe'],
  ['😢', 'Verdrietig'],
  ['😡', 'Boos'],
];

export default function ChildMoodScreen({ monsterName, selectedAccessory, selectedMonsterColor, onBack }: ChildMoodScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Hoe voel je je?</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.previewCard}>
        <MonsterPreview accessory={selectedAccessory} color={selectedMonsterColor} size={150} />
        <Text style={styles.previewText}>Vertel {monsterName || 'je monstertje'} hoe je je voelt...</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Kies je gevoel</Text>
        <View style={styles.moodGrid}>
          {moods.map(([emoji, label]) => (
            <Pressable key={label} style={styles.moodCard}>
              <Text style={styles.moodEmoji}>{emoji}</Text>
              <Text style={styles.moodLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>Deze Week</Text>
          <View style={styles.weekBadge}><Text style={styles.weekBadgeText}>0 ingevuld</Text></View>
        </View>
        <View style={styles.weekGrid}>
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day, index) => (
            <View key={day} style={[styles.weekCard, index === 0 && styles.weekCardActive]}>
              <Text style={styles.weekDay}>{day}</Text>
              <Text style={styles.weekMood}>0</Text>
            </View>
          ))}
        </View>
      </View>

      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 40, paddingHorizontal: 16, paddingBottom: 28, backgroundColor: colors.background, gap: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0' },
  backArrow: { fontSize: 24, color: colors.primary, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '900', color: colors.textStrong },
  spacer: { width: 44 },
  previewCard: { backgroundColor: colors.white, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#DDECF0', alignItems: 'center', gap: 8 },
  previewText: { color: '#8A97A9', fontSize: 13, fontWeight: '700' },
  sectionCard: { backgroundColor: colors.white, borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#DDECF0', gap: 12 },
  sectionTitle: { color: colors.textStrong, fontSize: 18, fontWeight: '900' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodCard: { width: '31.5%', minHeight: 88, borderRadius: 18, borderWidth: 1, borderColor: '#DDECF0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFDFF' },
  moodEmoji: { fontSize: 28 },
  moodLabel: { marginTop: 6, fontSize: 13, color: colors.textStrong, fontWeight: '700' },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekBadge: { backgroundColor: '#EFFFF5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  weekBadgeText: { color: '#13B37E', fontWeight: '900', fontSize: 12 },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  weekCard: { width: '31.5%', minHeight: 80, borderRadius: 16, borderWidth: 1, borderColor: '#DDECF0', backgroundColor: '#FBFDFF', alignItems: 'center', justifyContent: 'center' },
  weekCardActive: { backgroundColor: '#FFF4ED' },
  weekDay: { color: '#8A97A9', fontWeight: '800' },
  weekMood: { marginTop: 6, fontSize: 20 },
});