import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Constants from 'expo-constants';

import { type AccessoryKey } from './MonsterPreview';
import { MonsterModel3D } from './MonsterModel3D';
import colors from '../theme/colors';

type MonsterARLauncherProps = {
  color: string;
  accessory?: AccessoryKey;
};

export default function MonsterARLauncher({ color, accessory }: MonsterARLauncherProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [visible, setVisible] = useState(false);
  const isExpoGo = Constants.appOwnership === 'expo';

  const openAr = async () => {
    if (isExpoGo) {
      Alert.alert(
        'AR Dev Build nodig',
        'Voor echte Pokemon GO AR heb je een development build nodig. In Expo Go krijg je een vereenvoudigde AR-preview.',
      );
    }
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

          {isExpoGo ? (
            <>
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
            </>
          ) : (
            <NativeArMonsterView />
          )}
        </View>
      </Modal>
    </>
  );
}

function NativeArMonsterView() {
  // Dynamic require avoids Expo Go runtime crashes.
  const { ViroARSceneNavigator, ViroARScene, ViroAmbientLight, Viro3DObject } = require('@reactvision/react-viro');

  const MonsterScene = () => (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={900} />
      <Viro3DObject
        source={require('../../assets/3d-models/Tasko.glb')}
        position={[0, -0.4, -1.2]}
        scale={[0.22, 0.22, 0.22]}
        type="GLB"
      />
    </ViroARScene>
  );

  return <ViroARSceneNavigator autofocus initialScene={{ scene: MonsterScene }} style={StyleSheet.absoluteFill} />;
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
    bottom: 40,
    alignItems: 'center',
  },
});
