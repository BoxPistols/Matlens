import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Material properties → visual parameters mapping
function getVisualParams(cat: string, hv: number, ts: number, el: number) {
  const hvNorm = Math.min(hv / 3000, 1);   // hardness 0-3000
  const tsNorm = Math.min(ts / 2000, 1);   // tensile 0-2000
  const elNorm = Math.min(el / 400, 1);    // elastic 0-400

  switch (cat) {
    case '金属合金':
      return {
        color: new THREE.Color().setHSL(0.58 - hvNorm * 0.15, 0.3 + tsNorm * 0.4, 0.55 + hvNorm * 0.2),
        metalness: 0.85 + hvNorm * 0.15,
        roughness: 0.08 + (1 - hvNorm) * 0.25,
        clearcoat: 0.8,
        envIntensity: 1.5,
        geometry: 'sphere' as const,
      };
    case 'セラミクス':
      return {
        color: new THREE.Color().setHSL(0.08 + hvNorm * 0.05, 0.15 + tsNorm * 0.2, 0.7 + hvNorm * 0.15),
        metalness: 0.05,
        roughness: 0.35 + (1 - hvNorm) * 0.4,
        clearcoat: 0.3,
        envIntensity: 0.8,
        geometry: 'cube' as const,
      };
    case 'ポリマー':
      return {
        color: new THREE.Color().setHSL(0.35 + elNorm * 0.25, 0.5 + tsNorm * 0.3, 0.55),
        metalness: 0.0,
        roughness: 0.15 + elNorm * 0.3,
        clearcoat: 0.6,
        envIntensity: 1.0,
        geometry: 'torus' as const,
        transmission: 0.3 + (1 - elNorm) * 0.4,
      };
    case '複合材料':
      return {
        color: new THREE.Color().setHSL(0.55, 0.4 + tsNorm * 0.3, 0.45 + hvNorm * 0.2),
        metalness: 0.3 + hvNorm * 0.3,
        roughness: 0.2 + (1 - tsNorm) * 0.3,
        clearcoat: 0.5,
        envIntensity: 1.2,
        geometry: 'icosa' as const,
      };
    default:
      return {
        color: new THREE.Color(0.6, 0.6, 0.65),
        metalness: 0.5,
        roughness: 0.3,
        clearcoat: 0.4,
        envIntensity: 1.0,
        geometry: 'sphere' as const,
      };
  }
}

function MaterialMesh({ cat, hv, ts, el, animate = true }: {
  cat: string; hv: number; ts: number; el: number; animate?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const params = useMemo(() => getVisualParams(cat, hv, ts, el), [cat, hv, ts, el]);

  useFrame((_, delta) => {
    if (meshRef.current && animate) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  const geometry = useMemo(() => {
    switch (params.geometry) {
      case 'cube':   return <boxGeometry args={[1.3, 1.3, 1.3]} />;
      case 'torus':  return <torusGeometry args={[0.7, 0.3, 32, 64]} />;
      case 'icosa':  return <icosahedronGeometry args={[0.85, 1]} />;
      default:       return <sphereGeometry args={[0.85, 64, 64]} />;
    }
  }, [params.geometry]);

  return (
    <Float speed={animate ? 1.5 : 0} rotationIntensity={animate ? 0.3 : 0} floatIntensity={animate ? 0.5 : 0}>
      <mesh ref={meshRef} castShadow>
        {geometry}
        <meshPhysicalMaterial
          color={params.color}
          metalness={params.metalness}
          roughness={params.roughness}
          clearcoat={params.clearcoat}
          clearcoatRoughness={0.1}
          envMapIntensity={params.envIntensity}
          {...('transmission' in params ? { transmission: params.transmission, thickness: 0.5 } : {})}
        />
      </mesh>
    </Float>
  );
}

interface MaterialVisualProps {
  cat: string;
  hv: number;
  ts: number;
  el: number;
  size?: number;
  animate?: boolean;
  className?: string;
}

export const MaterialVisual = ({ cat, hv, ts, el, size = 160, animate = true, className = '' }: MaterialVisualProps) => (
  <div className={`rounded-lg overflow-hidden ${className}`} style={{ width: size, height: size, background: 'var(--bg-sunken)' }}>
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} color="#8888ff" />
      <directionalLight position={[0, -5, 0]} intensity={0.3} color="#444466" />
      <MaterialMesh cat={cat} hv={hv} ts={ts} el={el} animate={animate} />
    </Canvas>
  </div>
);

// Compact thumbnail version for lists
export const MaterialThumbnail = ({ cat, hv, ts, el, className = '' }: Omit<MaterialVisualProps, 'size' | 'animate'>) => (
  <MaterialVisual cat={cat} hv={hv} ts={ts} el={el} size={48} animate={false} className={`rounded-md ${className}`} />
);
