import { Suspense, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';

type MonsterModel3DProps = {
  size?: number;
  color: string;
};

type LoadedModelProps = {
  color: string;
};

function applyStrongTint(material: THREE.Material, color: string) {
  const tint = new THREE.Color(color);

  if ('color' in material && material.color instanceof THREE.Color) {
    material.color = tint;
  }

  if ('emissive' in material && material.emissive instanceof THREE.Color) {
    material.emissive = tint.clone().multiplyScalar(0.25);
  }

  if ('emissiveIntensity' in material) {
    (material as THREE.MeshStandardMaterial).emissiveIntensity = 0.45;
  }
}

function LoadedModel({ color }: LoadedModelProps) {
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

  return <primitive object={scene} scale={2.3} position={[0, -1.45, 0]} />;
}

export function MonsterModel3D({ size = 170, color }: MonsterModel3DProps) {
  return (
    <View style={[styles.shell, { width: size, height: size }]}>
      <Canvas camera={{ position: [0, 0, 3.15], fov: 34 }}>
        <color attach="background" args={['#111417']} />
        <ambientLight intensity={1.05} />
        <directionalLight position={[2, 2, 3]} intensity={1.2} />
        <directionalLight position={[-2, 1, -1]} intensity={0.5} />

        <Suspense fallback={null}>
          <LoadedModel color={color} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.2}
          rotateSpeed={0.9}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </View>
  );
}

useGLTF.preload(require('../../assets/3d-models/Tasko.glb'));

const styles = StyleSheet.create({
  shell: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111417',
  },
});
