import { Suspense, useMemo, useRef } from 'react';
import { PanResponder, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { OrbitControls, useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';
import { type AccessoryKey } from './MonsterPreview';

type MonsterModel3DProps = {
  size?: number;
  color: string;
  zoom?: number;
  autoRotate?: boolean;
  allowManualRotate?: boolean;
  initialYRotation?: number;
  accessory?: AccessoryKey;
};

type LoadedModelProps = {
  color: string;
  zoom: number;
  rotationRef: { current: number };
};

function applyStrongTint(material: THREE.Material, color: string) {
  const tint = new THREE.Color(color);
  const vividTint = tint.clone().offsetHSL(0, 0.08, -0.02);

  if ('color' in material && material.color instanceof THREE.Color) {
    material.color = vividTint;
  }

  if ('emissive' in material && material.emissive instanceof THREE.Color) {
    material.emissive = vividTint.clone().multiplyScalar(0.5);
  }

  if ('emissiveIntensity' in material) {
    (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
  }

  if ('toneMapped' in material) {
    (material as THREE.MeshStandardMaterial).toneMapped = false;
  }

  if ('map' in material) {
    (material as THREE.MeshStandardMaterial).map = null;
    material.needsUpdate = true;
  }
}

function LoadedModel({ color, zoom, rotationRef }: LoadedModelProps) {
  const gltf = useGLTF(require('../../assets/3d-models/Tasko.glb')) as { scene: THREE.Group };

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((child: THREE.Object3D) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.Material) {
          const material = mesh.material.clone();
          applyStrongTint(material, color);
          mesh.material = material;
        } else if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((material) => {
            const clonedMaterial = material.clone();
            applyStrongTint(clonedMaterial, color);
            return clonedMaterial;
          });
        }
      }
    });
    return cloned;
  }, [color, gltf.scene]);

  const modelRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    if (!modelRef.current) return;
    modelRef.current.rotation.y = rotationRef.current;
  });

  return <primitive ref={modelRef} object={scene} scale={1.9 * zoom} position={[0, -0.75, 0]} />;
}

const ACCESSORY_EMOJIS: Record<AccessoryKey, string> = {
  sunglasses: '🕶️',
  hoodie: '🎩',
  crown: '👑',
  bowtie: '🎀',
  flower: '🌸',
  wand: '✨',
  patch: '🏴‍☠️',
  neon_glasses: '🥽',
  chef_hat: '👨‍🍳',
  space_helmet: '👨‍🚀',
  laser_blade: '🗡️',
  super_cape: '🦸',
  disco_crown: '🪩',
  cyber_visor: '🤖',
  heart_glasses: '💖',
  ice_hat: '🧊',
  dragon_crown: '🐉',
  golden_scepter: '🔱',
  galaxy_suit: '🌌',
  leaf_wreath: '🍃',
  star_patch: '⭐',
};

const ACCESSORY_POSITIONS: Record<AccessoryKey, StyleProp<TextStyle>> = {
  sunglasses: { top: '13%', left: '24%', fontSize: 86 },
  hoodie: { top: '12%', left: '42%' },
  crown: { top: '4%', left: '42%' },
  bowtie: { top: '58%', left: '45%' },
  flower: { top: '11%', left: '32%' },
  wand: { top: '56%', left: '66%' },
  patch: { top: '34%', left: '33%' },
  neon_glasses: { top: '13%', left: '24%', fontSize: 86 },
  chef_hat: { top: '6%', left: '40%' },
  space_helmet: { top: '6%', left: '39%' },
  laser_blade: { top: '55%', left: '68%' },
  super_cape: { top: '52%', left: '40%' },
  disco_crown: { top: '5%', left: '41%' },
  cyber_visor: { top: '32%', left: '38%' },
  heart_glasses: { top: '13%', left: '24%', fontSize: 86 },
  ice_hat: { top: '7%', left: '41%' },
  dragon_crown: { top: '4%', left: '40%' },
  golden_scepter: { top: '55%', left: '67%' },
  galaxy_suit: { top: '53%', left: '40%' },
  leaf_wreath: { top: '9%', left: '39%' },
  star_patch: { top: '34%', left: '33%' },
};

export function MonsterModel3D({
  size = 170,
  color,
  zoom = 1,
  autoRotate = false,
  allowManualRotate = false,
  initialYRotation = 0,
  accessory,
}: MonsterModel3DProps) {
  const rotationRef = useRef(initialYRotation);
  const panStartRotation = useRef(initialYRotation);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !autoRotate && allowManualRotate,
        onMoveShouldSetPanResponder: () => !autoRotate && allowManualRotate,
        onPanResponderGrant: () => {
          panStartRotation.current = rotationRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          if (autoRotate || !allowManualRotate) return;
          rotationRef.current = panStartRotation.current + gestureState.dx * 0.015;
        },
      }),
    [autoRotate, allowManualRotate],
  );

  return (
    <View {...panResponder.panHandlers} style={[styles.shell, { width: size, height: size }]}>
      <Canvas camera={{ position: [0, 0, 4.9], fov: 42 }}>
        <ambientLight intensity={1.05} />
        <directionalLight position={[2, 2, 3]} intensity={1.2} />
        <directionalLight position={[-2, 1, -1]} intensity={0.5} />

        <Suspense fallback={null}>
          <LoadedModel color={color} zoom={zoom} rotationRef={rotationRef} />
        </Suspense>

        {autoRotate ? (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1.2}
            rotateSpeed={0.9}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        ) : null}
      </Canvas>
      {accessory ? (
        <Text style={[styles.accessoryOverlay, ACCESSORY_POSITIONS[accessory]]}>{ACCESSORY_EMOJIS[accessory]}</Text>
      ) : null}
    </View>
  );
}

useGLTF.preload(require('../../assets/3d-models/Tasko.glb'));

const styles = StyleSheet.create({
  shell: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#EEF4F7',
    position: 'relative',
  },
  accessoryOverlay: {
    position: 'absolute',
    fontSize: 28,
    zIndex: 5,
  },
});
