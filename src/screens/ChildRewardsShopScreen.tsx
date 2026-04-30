import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';
import { type AccessoryKey } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';

type ChildRewardsShopScreenProps = {
  monsterName: string;
  selectedAccessory?: AccessoryKey;
  selectedMonsterColor: string;
  coins: number;
  onBack: () => void;
  onSelectAccessory: (accessory: AccessoryKey) => void;
};

const items: Array<{ id: AccessoryKey; name: string; category: string; cost?: number; owned?: boolean; emoji: string }> = [
  { id: 'sunglasses', name: 'Coole Zonnebril', category: 'Gezicht', cost: 0, owned: false, emoji: '🕶️' },
  { id: 'hoodie', name: 'Feest Hoodie', category: 'Hoofd', cost: 0, owned: false, emoji: '🎩' },
  { id: 'crown', name: 'Koning Kroon', category: 'Hoofd', cost: 0, owned: false, emoji: '👑' },
  { id: 'wand', name: 'Magische Staf', category: 'Hand', cost: 0, owned: false, emoji: '✨' },
  { id: 'bowtie', name: 'Bowtie', category: 'Lichaam', cost: 0, owned: false, emoji: '🎀' },
  { id: 'flower', name: 'Bloemen Krans', category: 'Hoofd', cost: 0, owned: false, emoji: '🌸' },
  { id: 'patch', name: 'Piraat Eye Patch', category: 'Gezicht', cost: 0, owned: false, emoji: '🏴‍☠️' },
];

const categories = ['Alle', 'Hoofd', 'Gezicht', 'Lichaam'];

export default function ChildRewardsShopScreen({ monsterName, selectedAccessory, selectedMonsterColor, coins, onBack, onSelectAccessory }: ChildRewardsShopScreenProps) {
  const selectedAccessoryName = selectedAccessory ? items.find((item) => item.id === selectedAccessory)?.name ?? 'je keuze' : 'je keuze';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Beloningen Shop</Text>
        <View style={styles.coinPill}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewText}>Zo ziet {monsterName || 'je monstertje'} eruit met {selectedAccessoryName}</Text>
        <View style={styles.previewBox}>
          <MonsterModel3D color={selectedMonsterColor} size={180} zoom={1.95} autoRotate={false} initialYRotation={0} />
        </View>
      </View>

      <View style={styles.categoryRow}>
        {categories.map((category, index) => (
          <View key={category} style={[styles.categoryPill, index === 0 && styles.categoryPillActive]}>
            <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{category}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {items.map((item) => {
          const selected = item.id === selectedAccessory;

          return (
            <Pressable key={item.id} onPress={() => onSelectAccessory(item.id)} style={({ pressed }) => [styles.itemCard, selected && styles.itemCardSelected, pressed && styles.itemCardPressed]}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <View style={[styles.itemStatus, item.owned ? styles.itemStatusOwned : styles.itemStatusCost, selected && styles.itemStatusSelected]}>
                <Text style={[styles.itemStatusText, item.owned && styles.itemStatusTextOwned]}>
                  {selected ? 'Gekozen' : item.owned ? 'In bezit' : `🪙 ${item.cost ?? 0}`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 28,
    backgroundColor: colors.background,
    gap: 14,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDECF0' },
  backArrow: { fontSize: 24, color: colors.primary, fontWeight: '900' },
  title: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: colors.textStrong },
  coinPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, borderWidth: 1, borderColor: '#DDECF0' },
  coinIcon: { fontSize: 14 },
  coinText: { fontSize: 16, color: colors.textStrong, fontWeight: '900' },
  previewCard: { backgroundColor: colors.white, borderRadius: 22, borderWidth: 1, borderColor: '#DDECF0', padding: 14, gap: 10 },
  previewText: { textAlign: 'center', color: '#8A97A9', fontSize: 13, fontWeight: '700' },
  previewBox: { backgroundColor: '#F3EFFD', borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: '#E5EEF1' },
  categoryPillActive: { backgroundColor: '#6C78E8' },
  categoryText: { color: '#8A97A9', fontWeight: '800' },
  categoryTextActive: { color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard: { width: '48.5%', backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: '#DDECF0', padding: 12, alignItems: 'center', gap: 6 },
  itemCardSelected: { borderColor: '#6C78E8', shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  itemCardPressed: { transform: [{ scale: 0.99 }] },
  itemEmoji: { fontSize: 28 },
  itemName: { fontSize: 15, fontWeight: '900', textAlign: 'center', color: colors.textStrong },
  itemCategory: { fontSize: 11, color: '#90A0B1', fontWeight: '700' },
  itemStatus: { width: '100%', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginTop: 4 },
  itemStatusOwned: { backgroundColor: '#EFFEEC' },
  itemStatusCost: { backgroundColor: '#FFF5E8' },
  itemStatusSelected: { backgroundColor: '#EEF1FF' },
  itemStatusText: { fontSize: 12, fontWeight: '900', color: '#F4A23C' },
  itemStatusTextOwned: { color: '#13B37E' },
});