
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Sparkles,
  Stars,
  Torus,
} from "@react-three/drei";

function OrbitalObjects() {
  const group = useRef();

  useFrame(({ pointer, clock }) => {
    if (!group.current) return;

    // Mouse movement creates real 3D parallax.
    group.current.rotation.y +=
      (pointer.x * 0.2 - group.current.rotation.y) * 0.035;

    group.current.rotation.x +=
      (-pointer.y * 0.13 - group.current.rotation.x) * 0.035;

    // Slow continuous rotation.
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.18) * 0.08;
  });

  return (
    <group ref={group} position={[1.1, 0, 0]}>
      {/* Large transparent orbital rings */}
      <Torus args={[1.85, 0.012, 12, 160]} rotation={[0.9, 0.3, 0.2]}>
        <meshBasicMaterial
          color="#c4a5ff"
          transparent
          opacity={0.75}
        />
      </Torus>

      <Torus args={[2.2, 0.008, 12, 160]} rotation={[1.15, -0.5, 0.5]}>
        <meshBasicMaterial
          color="#7c8cff"
          transparent
          opacity={0.5}
        />
      </Torus>

      <Torus args={[1.45, 0.01, 12, 160]} rotation={[0.2, 1, 0.8]}>
        <meshBasicMaterial
          color="#f0d8ff"
          transparent
          opacity={0.45}
        />
      </Torus>

      {/* Floating glass-like crystal */}
      <Float speed={1.4} rotationIntensity={0.45} floatIntensity={0.65}>
        <mesh position={[1.65, 1.05, -0.4]} scale={0.48}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial
            color="#b68aff"
            roughness={0.12}
            metalness={0.45}
            transparent
            opacity={0.8}
            distort={0.22}
            speed={2}
          />
        </mesh>
      </Float>

      {/* Small floating glass sphere */}
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh position={[-1.65, -1.05, 0.3]} scale={0.22}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#8b9cff"
            metalness={0.25}
            roughness={0.08}
            transmission={0.35}
            thickness={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Small glowing satellite */}
      <Float speed={2} floatIntensity={0.7}>
        <mesh position={[1.95, -0.85, 0.5]} scale={0.1}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color="#f0d8ff" />
        </mesh>
      </Float>

      <Float speed={1.2} floatIntensity={0.5}>
        <mesh position={[-1.25, 1.35, -0.5]} scale={0.14}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#7c8cff"
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function GlassScene() {
  return (
    <div className="glass-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.2} />

        <pointLight
          position={[3, 3, 4]}
          intensity={35}
          color="#bb86fc"
        />

        <pointLight
          position={[-3, -2, 2]}
          intensity={20}
          color="#7188ff"
        />

        <Stars
          radius={12}
          depth={5}
          count={180}
          factor={2}
          saturation={0.4}
          fade
          speed={0.5}
        />

        <Sparkles
          count={65}
          scale={7}
          size={2.2}
          speed={0.35}
          opacity={0.7}
          color="#d9c4ff"
        />

        <OrbitalObjects />
      </Canvas>
    </div>
  );
}
