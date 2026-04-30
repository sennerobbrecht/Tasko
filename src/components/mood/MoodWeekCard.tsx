import { StyleSheet, Text, View } from 'react-native';

type DayCell = {
  day: string;
  mood: string;
  active: boolean;
};

type MoodWeekCardProps = {
  dayCells: DayCell[];
  hasMoodToday: boolean;
};

export function MoodWeekCard({ dayCells, hasMoodToday }: MoodWeekCardProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.weekHeader}>
        <Text style={styles.sectionTitle}>Deze Week</Text>
        <View style={styles.weekBadge}>
          <Text style={styles.weekBadgeText}>{hasMoodToday ? 'Vandaag ingevuld' : 'Nog niet ingevuld'}</Text>
        </View>
      </View>
      <View style={styles.weekGrid}>
        {dayCells.map((entry) => (
          <View key={entry.day} style={[styles.weekCard, entry.active && styles.weekCardActive]}>
            <Text style={styles.weekDay}>{entry.day}</Text>
            <Text style={styles.weekMood}>{entry.mood}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#DDECF0', gap: 12 },
  sectionTitle: { color: '#22353F', fontSize: 18, fontWeight: '900' },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekBadge: { backgroundColor: '#EFFFF5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  weekBadgeText: { color: '#13B37E', fontWeight: '900', fontSize: 12 },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  weekCard: { width: '31.5%', minHeight: 80, borderRadius: 16, borderWidth: 1, borderColor: '#DDECF0', backgroundColor: '#FBFDFF', alignItems: 'center', justifyContent: 'center' },
  weekCardActive: { backgroundColor: '#FFF4ED' },
  weekDay: { color: '#8A97A9', fontWeight: '800' },
  weekMood: { marginTop: 6, fontSize: 20 },
});
