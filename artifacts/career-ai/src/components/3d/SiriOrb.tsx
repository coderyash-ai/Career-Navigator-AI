import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function Orb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;

      const targetX = state.pointer.x * 2;
      const targetY = state.pointer.y * 2;
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
    }
    if (materialRef.current) {
      materialRef.current.distort = 0.4 + Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        ref={materialRef}
        color="#a855f7"
        emissive="#06b6d4"
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.1}
        distort={0.4}
        speed={2}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function CSSFallbackOrb() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-[700px] h-[700px]">
        <div
          className="absolute inset-0 rounded-full blur-[120px] animate-pulse"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(168,85,247,0.5), rgba(6,182,212,0.3), transparent)',
            animationDuration: '3s',
          }}
        />
        <div
          className="absolute inset-24 rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4), rgba(14,165,233,0.3))',
            animation: 'spin 10s linear infinite',
          }}
        />
        <div
          className="absolute inset-40 rounded-full blur-[50px]"
          style={{
            background: 'radial-gradient(circle, rgba(192,132,252,0.5), rgba(34,211,238,0.4))',
            animation: 'spin 15s linear infinite reverse',
          }}
        />
      </div>
    </div>
  );
}

export function SiriOrb() {
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setWebGLAvailable(isWebGLAvailable());
  }, []);

  if (webGLAvailable === null) return null;

  if (!webGLAvailable) {
    return <CSSFallbackOrb />;
  }

  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#a855f7" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#06b6d4" />
        <Orb />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
