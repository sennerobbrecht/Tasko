import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { type AccessoryKey } from './MonsterPreview';
import { MonsterModel3D } from './MonsterModel3D';
import colors from '../theme/colors';

type MonsterARLauncherProps = {
  color: string;
  accessory?: AccessoryKey;
};

/**
 * Live camera + 3D-monster (Expo Go, native én web/Vercel).
 * Geen aparte dev build nodig.
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
          {visible ? <CameraView style={styles.camera} facing="back" active /> : null}

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

          <View style={styles.header} pointerEvents="box-none">
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Sluiten</Text>
            </Pressable>
          </View>

          <View style={styles.tipBar} pointerEvents="none">
            <Text style={styles.tipText}>Je ziet je kamer met je monster ervoor</Text>
          </View>
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
  camera: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  header: {
    position: 'absolute',
    top: 54,
    right: 16,
    zIndex: 3,
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
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 56,
    zIndex: 2,
  },
  tipBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 3,
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
