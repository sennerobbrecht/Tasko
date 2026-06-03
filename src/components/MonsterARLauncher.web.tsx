import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import ModelViewerWeb from './ModelViewerWeb.web';
import colors from '../theme/colors';
import type { AccessoryKey } from './MonsterPreview';

type MonsterARLauncherProps = {
  color: string;
  accessory?: AccessoryKey;
};

/** Web (Vercel): echte browser-AR via model-viewer — geen Expo dev build nodig */
export default function MonsterARLauncher(_props: MonsterARLauncherProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Text style={styles.fabIcon}>📷</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <Text style={styles.hint}>Tik op het AR-icoon in de viewer om je monster in de kamer te zetten.</Text>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Sluiten</Text>
            </Pressable>
          </View>
          <ModelViewerWeb />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#DDECF0',
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabIcon: {
    fontSize: 20,
  },
  screen: {
    flex: 1,
    backgroundColor: '#0b0f14',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  hint: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    borderRadius: 12,
    backgroundColor: 'rgba(15, 22, 30, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
});
