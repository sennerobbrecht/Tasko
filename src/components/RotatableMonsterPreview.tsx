import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';

import { MonsterPreview, type AccessoryKey } from './MonsterPreview';

type RotatableMonsterPreviewProps = {
  accessory?: AccessoryKey;
  color: string;
  size?: number;
  hint?: string;
};

export function RotatableMonsterPreview({
  accessory,
  color,
  size = 160,
  hint = 'Sleep om te draaien',
}: RotatableMonsterPreviewProps) {
  const [rotationY, setRotationY] = useState(0);
  const dragStartRotation = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartRotation.current = rotationY;
      },
      onPanResponderMove: (_, gestureState) => {
        setRotationY(dragStartRotation.current + gestureState.dx * 0.9);
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      <View
        {...panResponder.panHandlers}
        style={[
          styles.rotateSurface,
          { width: size, height: size, transform: [{ perspective: 900 }, { rotateY: `${rotationY}deg` }] },
        ]}
      >
        <MonsterPreview accessory={accessory} color={color} size={size} />
      </View>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateSurface: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: '#8A97A9',
    fontWeight: '700',
  },
});
