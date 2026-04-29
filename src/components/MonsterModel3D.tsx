import { Suspense, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';

type MonsterModel3DProps = {
  size?: number;
  color: string;
  zoom?: number;
};

type LoadedModelProps = {
  color: string;
  zoom: number;
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

function LoadedModel({ color, zoom }: LoadedModelProps) {
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

  return <primitive object={scene} scale={1.9 * zoom} position={[0, -0.75, 0]} />;
}

export function MonsterModel3D({ size = 170, color, zoom = 1 }: MonsterModel3DProps) {
  return (
    <View style={[styles.shell, { width: size, height: size }]}>
      <Canvas camera={{ position: [0, 0, 4.9], fov: 42 }}>
        <ambientLight intensity={1.05} />
        <directionalLight position={[2, 2, 3]} intensity={1.2} />
        <directionalLight position={[-2, 1, -1]} intensity={0.5} />

        <Suspense fallback={null}>
          <LoadedModel color={color} zoom={zoom} />
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
    backgroundColor: '#EEF4F7',
  },
});
