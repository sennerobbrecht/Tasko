import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { type AccessoryKey } from './MonsterPreview';
import { MonsterModel3D } from './MonsterModel3D';
import colors from '../theme/colors';

type MonsterARLauncherProps = {
  color: string;
  accessory?: AccessoryKey;
};

/**
 * AR in Expo Go en native builds: live camera + 3D-monster (geen Viro/dev build nodig).
 * Web gebruikt MonsterARLauncher.web.tsx (model-viewer).
 */
export default function MonsterARLauncher({ color, accessory }: MonsterARLauncherProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [visible, setVisible] = useState(false);

  const openAr = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        return;
      }
    }
    setVisible(true);
  };

  return (
    <>
      <Pressable onPress={openAr} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Text style={styles.fabIcon}>📷</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Sluiten</Text>
            </Pressable>
          </View>

          <CameraView style={StyleSheet.absoluteFill} facing="back" />
          <View style={styles.monsterWrap} pointerEvents="none">
            <MonsterModel3D
              color={color}
              accessory={accessory}
              size={300}
              zoom={2.35}
              autoRotate={false}
              allowManualRotate={false}
              initialYRotation={0}
              transparentBackground
            />
          </View>

          {Platform.OS !== 'web' ? (
            <View style={styles.tipBar} pointerEvents="none">
              <Text style={styles.tipText}>Richt op de kamer — je monster staat in beeld</Text>
            </View>
          ) : null}
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
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    zIndex: 2,
  },
  closeButton: {
    borderRadius: 12,
    backgroundColor: 'rgba(15, 22, 30, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
  monsterWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 56,
    alignItems: 'center',
    zIndex: 1,
  },
  tipBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: 'rgba(15, 22, 30, 0.7)',
    borderRadius: 12,
    padding: 10,
  },
  tipText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
});
