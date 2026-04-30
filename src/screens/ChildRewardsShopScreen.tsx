import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../theme/colors';
import { type AccessoryKey } from '../components/MonsterPreview';
import { MonsterModel3D } from '../components/MonsterModel3D';

type ChildRewardsShopScreenProps = {
  childId?: string | null;
  monsterName: string;
  selectedAccessory?: AccessoryKey;
  selectedMonsterColor: string;
  coins: number;
  ownedAccessories: AccessoryKey[];
  onBack: () => void;
  onSelectAccessory: (accessory: AccessoryKey) => void;
  onBuyAccessory: (accessory: AccessoryKey, cost: number) => Promise<{ success: boolean; message: string; newBalance: number }>;
};

const items: Array<{ id: AccessoryKey; name: string; category: string; cost: number; emoji: string }> = [
  { id: 'sunglasses', name: 'Coole Zonnebril', category: 'Gezicht', cost: 60, emoji: '🕶️' },
  { id: 'hoodie', name: 'Feest Hoodie', category: 'Hoofd', cost: 85, emoji: '🎩' },
  { id: 'crown', name: 'Koning Kroon', category: 'Hoofd', cost: 130, emoji: '👑' },
  { id: 'wand', name: 'Magische Staf', category: 'Hand', cost: 105, emoji: '✨' },
  { id: 'bowtie', name: 'Bowtie', category: 'Lichaam', cost: 55, emoji: '🎀' },
  { id: 'flower', name: 'Bloemen Krans', category: 'Hoofd', cost: 75, emoji: '🌸' },
  { id: 'patch', name: 'Piraat Eye Patch', category: 'Gezicht', cost: 70, emoji: '🏴‍☠️' },
  { id: 'neon_glasses', name: 'Neon Glasses', category: 'Gezicht', cost: 95, emoji: '🥽' },
  { id: 'chef_hat', name: 'Chef Muts', category: 'Hoofd', cost: 90, emoji: '👨‍🍳' },
  { id: 'space_helmet', name: 'Space Helm', category: 'Hoofd', cost: 165, emoji: '👨‍🚀' },
  { id: 'laser_blade', name: 'Laser Blade', category: 'Hand', cost: 185, emoji: '🗡️' },
  { id: 'super_cape', name: 'Super Cape', category: 'Lichaam', cost: 180, emoji: '🦸' },
  { id: 'disco_crown', name: 'Disco Kroon', category: 'Hoofd', cost: 140, emoji: '🪩' },
  { id: 'cyber_visor', name: 'Cyber Vizier', category: 'Gezicht', cost: 145, emoji: '🤖' },
  { id: 'heart_glasses', name: 'Hart Bril', category: 'Gezicht', cost: 110, emoji: '💖' },
  { id: 'ice_hat', name: 'IJs Muts', category: 'Hoofd', cost: 125, emoji: '🧊' },
  { id: 'dragon_crown', name: 'Draken Kroon', category: 'Hoofd', cost: 220, emoji: '🐉' },
  { id: 'golden_scepter', name: 'Gouden Scepter', category: 'Hand', cost: 260, emoji: '🔱' },
  { id: 'galaxy_suit', name: 'Galaxy Suit', category: 'Lichaam', cost: 240, emoji: '🌌' },
  { id: 'leaf_wreath', name: 'Blad Krans', category: 'Hoofd', cost: 98, emoji: '🍃' },
  { id: 'star_patch', name: 'Ster Patch', category: 'Gezicht', cost: 102, emoji: '⭐' },
];

const categories = ['Alle', 'Hoofd', 'Gezicht', 'Lichaam', 'Hand'] as const;

export default function ChildRewardsShopScreen({
  childId,
  monsterName,
  selectedAccessory,
  selectedMonsterColor,
  coins,
  ownedAccessories,
  onBack,
  onSelectAccessory,
  onBuyAccessory,
}: ChildRewardsShopScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('Alle');
  const selectedAccessoryName = selectedAccessory ? items.find((item) => item.id === selectedAccessory)?.name ?? 'je keuze' : 'je keuze';
  const ownedSet = useMemo(() => new Set(ownedAccessories), [ownedAccessories]);
  const visibleItems = useMemo(() => {
    if (selectedCategory === 'Alle') {
      return items;
    }
    return items.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handlePressItem = async (item: (typeof items)[number]) => {
    if (!childId) {
      Alert.alert('Niet beschikbaar', 'Geen kindprofiel gevonden.');
      return;
    }

    if (ownedSet.has(item.id)) {
      onSelectAccessory(item.id);
      return;
    }

    const result = await onBuyAccessory(item.id, item.cost);
    if (!result.success) {
      Alert.alert('Aankoop mislukt', result.message);
      return;
    }

    onSelectAccessory(item.id);
    Alert.alert('Gekocht!', `${item.name} is nu van jou.`);
  };

  return (
    <View style={styles.screen}>
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
          <MonsterModel3D color={selectedMonsterColor} size={180} zoom={1.95} autoRotate={false} allowManualRotate={false} initialYRotation={0} accessory={selectedAccessory} />
        </View>
      </View>

      <View style={styles.categoryRow}>
        {categories.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[styles.categoryPill, selectedCategory === category && styles.categoryPillActive]}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>{category}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        {visibleItems.map((item) => {
          const selected = item.id === selectedAccessory;
          const owned = ownedSet.has(item.id);
          const canAfford = coins >= item.cost;

          return (
            <Pressable
              key={item.id}
              onPress={() => {
                void handlePressItem(item);
              }}
              style={({ pressed }) => [
                styles.itemCard,
                selected && styles.itemCardSelected,
                !owned && !canAfford && styles.itemCardLocked,
                pressed && styles.itemCardPressed,
              ]}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <View style={[styles.itemStatus, owned ? styles.itemStatusOwned : styles.itemStatusCost, selected && styles.itemStatusSelected]}>
                <Text style={[styles.itemStatusText, owned && styles.itemStatusTextOwned]}>
                  {selected ? 'Gekozen' : owned ? 'In bezit' : canAfford ? `Koop • 🪙 ${item.cost}` : `Te duur • 🪙 ${item.cost}`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

        <StatusBar style="dark" />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 48,
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
  itemCardLocked: { opacity: 0.7 },
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