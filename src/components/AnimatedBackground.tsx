import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

const SKILLS = [
  "React", "TypeScript", "Python", "SQL", "Docker",
  "Node.js", "Git", "Figma", "Kubernetes", "Testing",
  "CSS", "GraphQL", "CI/CD", "REST APIs", "Agile",
];

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

const useResponsiveScale = () => {
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w < 480) setScale(0.5);
      else if (w < 768) setScale(0.65);
      else if (w < 1024) setScale(0.8);
      else setScale(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return { scale, isMobile };
};

const getColors = (isDark: boolean) => ({
  bg: isDark ? "#0f1318" : "#f8f6f1",
  // Light mode: warmer, richer, more visible tags
  tagBg: isDark ? "#4a9eff" : "#7c6f5b",
  tagBgHover: isDark ? "#6bb3ff" : "#b8943e",
  tagText: isDark ? "#7ec8ff" : "#5a4e3a",
  tagTextHover: isDark ? "#a8d8ff" : "#3d3222",
  tagFillOpacity: isDark ? 0.4 : 0.45,
  tagFillOpacityHover: isDark ? 0.85 : 0.9,
  tagBgOpacity: isDark ? 0.12 : 0.12,
  tagBgOpacityHover: isDark ? 0.25 : 0.3,
  glowOpacity: isDark ? 0.15 : 0.14,
  // Light mode: warmer document sheets
  resumeSheet: isDark ? "#3a4a5a" : "#bfb097",
  resumeSheetOpacity: isDark ? 0.1 : 0.1,
  resumeLine: isDark ? "#5a7a9a" : "#a08e6e",
  resumeLineOpacity: isDark ? 0.12 : 0.09,
  resumeLineHeaderOpacity: isDark ? 0.18 : 0.16,
  // Light mode: more saturated bars
  barGreen: isDark ? "#4ade80" : "#4d9e60",
  barRed: isDark ? "#f87171" : "#c45a4a",
  barOpacity: isDark ? 0.15 : 0.14,
  barWireOpacity: isDark ? 0.08 : 0.07,
  // Light mode: warm gold rings
  ringColor: isDark ? "#60a5fa" : "#b8943e",
  ringOpacity: isDark ? 0.2 : 0.18,
  tickColor: isDark ? "#93c5fd" : "#7c6f5b",
  tickOpacity: isDark ? 0.25 : 0.22,
  // Light mode: richer particles
  particleColor: isDark ? "#64748b" : "#7c6f5b",
  particleOpacity: isDark ? 0.6 : 0.5,
  // Light mode: warmer graph
  nodeColor: isDark ? "#94a3b8" : "#7c6f5b",
  nodeOpacity: isDark ? 0.35 : 0.28,
  lineColor: isDark ? "#475569" : "#a08e6e",
  lineOpacity: isDark ? 0.15 : 0.12,
  // Lighting
  ambientIntensity: isDark ? 0.4 : 0.9,
  dirLight1Intensity: isDark ? 0.3 : 0.7,
  dirLight2Color: isDark ? "#4a9eff" : "#e8c46a",
  dirLight2Intensity: isDark ? 0.2 : 0.35,
});

type Colors = ReturnType<typeof getColors>;

const SkillLabel = ({
  text, position, speed, onClick, colors,
}: {
  text: string;
  position: [number, number, number];
  speed: number;
  onClick?: (skill: string) => void;
  colors: Colors;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const targetScale = useRef(1);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.3;
    targetScale.current = hovered ? 1.5 : 1;
    const s = groupRef.current.scale.x;
    const next = s + (targetScale.current - s) * 0.1;
    groupRef.current.scale.set(next, next, next);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group
        ref={groupRef}
        position={position}
        onClick={(e) => { e.stopPropagation(); onClick?.(text); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[text.length * 0.18 + 0.4, 0.38]} />
          <meshBasicMaterial color={hovered ? colors.tagBgHover : colors.tagBg} transparent opacity={hovered ? colors.tagBgOpacityHover : colors.tagBgOpacity} />
        </mesh>
        {hovered && (
          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[text.length * 0.18 + 0.7, 0.58]} />
            <meshBasicMaterial color={colors.tagBgHover} transparent opacity={colors.glowOpacity} />
          </mesh>
        )}
        <Text
          fontSize={0.16}
          color={hovered ? colors.tagTextHover : colors.tagText}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2"
          fillOpacity={hovered ? colors.tagFillOpacityHover : colors.tagFillOpacity}
        >
          {text}
        </Text>
      </group>
    </Float>
  );
};

const ResumeSheet = ({
  position, rotation, scale, colors,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  colors: Colors;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z =
      rotation[2] + Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.05;
  });

  return (
    <Float speed={0.8} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <planeGeometry args={[1.2, 1.6]} />
        <meshBasicMaterial color={colors.resumeSheet} transparent opacity={colors.resumeSheetOpacity} side={THREE.DoubleSide} />
      </mesh>
      {[0.45, 0.25, 0.05, -0.15, -0.35, -0.55].map((y, i) => (
        <mesh
          key={i}
          position={[position[0], position[1] + y * scale, position[2] + 0.01]}
          rotation={rotation}
          scale={scale}
        >
          <planeGeometry args={[i === 0 ? 0.6 : 0.9, 0.04]} />
          <meshBasicMaterial color={colors.resumeLine} transparent opacity={i === 0 ? colors.resumeLineHeaderOpacity : colors.resumeLineOpacity} />
        </mesh>
      ))}
    </Float>
  );
};

const SkillBar = ({
  position, height, color, colors,
}: {
  position: [number, number, number];
  height: number;
  color: string;
  colors: Colors;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetScale = height + Math.sin(state.clock.elapsedTime * 0.5 + position[0] * 2) * 0.15;
    meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.02;
  });

  return (
    <Float speed={0.5} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.12, 1, 0.12]} />
        <meshBasicMaterial color={color} transparent opacity={colors.barOpacity} />
      </mesh>
      <mesh position={position}>
        <boxGeometry args={[0.12, height, 0.12]} />
        <meshBasicMaterial wireframe color={color} transparent opacity={colors.barWireOpacity} />
      </mesh>
    </Float>
  );
};

const ScoreRing = ({
  position, radius, speed, colors,
}: {
  position: [number, number, number];
  radius: number;
  speed: number;
  colors: Colors;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z += speed * delta;
    meshRef.current.rotation.x += speed * 0.3 * delta;
  });

  return (
    <Float speed={1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[radius, 0.02, 8, 64, Math.PI * 1.4]} />
        <meshBasicMaterial color={colors.ringColor} transparent opacity={colors.ringOpacity} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              position[0] + Math.cos(angle) * radius,
              position[1] + Math.sin(angle) * radius,
              position[2],
            ]}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color={colors.tickColor} transparent opacity={colors.tickOpacity} />
          </mesh>
        );
      })}
    </Float>
  );
};

const ParticleField = ({ count = 200, colors }: { count?: number; colors: Colors }) => {
  const points = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.015;
    points.current.rotation.x += delta * 0.005;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={colors.particleColor} transparent opacity={colors.particleOpacity} sizeAttenuation />
    </points>
  );
};

const CameraRig = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.current.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

const SkillGraph = ({ colors }: { colors: Colors }) => {
  const groupRef = useRef<THREE.Group>(null);

  const { nodes, lines } = useMemo(() => {
    const n = 12;
    const nodePositions: [number, number, number][] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.8;
      nodePositions.push([Math.cos(angle) * r, Math.sin(angle) * r * 0.7, 0]);
    }
    const lineData: { from: number; to: number }[] = [];
    for (let i = 0; i < n; i++) {
      lineData.push({ from: i, to: (i + 1) % n });
      if (i < n - 3) lineData.push({ from: i, to: i + 3 });
    }
    return { nodes: nodePositions, lines: lineData };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.03;
  });

  return (
    <Float speed={0.6} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, 0, -6]} scale={1.2}>
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={colors.nodeColor} transparent opacity={colors.nodeOpacity} />
          </mesh>
        ))}
        {lines.map(({ from, to }, i) => {
          const start = new THREE.Vector3(...nodes[from]);
          const end = new THREE.Vector3(...nodes[to]);
          const mid = start.clone().add(end).multiplyScalar(0.5);
          const length = start.distanceTo(end);
          const dir = end.clone().sub(start).normalize();
          const angle = Math.atan2(dir.y, dir.x);
          return (
            <mesh key={i} position={[mid.x, mid.y, mid.z]} rotation={[0, 0, angle]}>
              <planeGeometry args={[length, 0.008]} />
              <meshBasicMaterial color={colors.lineColor} transparent opacity={colors.lineOpacity} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
};

const Scene = ({ onSkillClick, colors, responsiveScale }: { onSkillClick?: (skill: string) => void; colors: Colors; responsiveScale: number }) => {
  const skillPositions = useMemo(() => {
    return SKILLS.map((_, i) => {
      const angle = (i / SKILLS.length) * Math.PI * 2;
      const r = 3 + (i % 3) * 1.5;
      return [Math.cos(angle) * r, Math.sin(angle) * r * 0.6, -3 - (i % 4) * 1.5] as [number, number, number];
    });
  }, []);

  return (
    <>
      <color attach="background" args={[colors.bg]} />
      <ambientLight intensity={colors.ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={colors.dirLight1Intensity} />
      <directionalLight position={[-3, -2, 4]} intensity={colors.dirLight2Intensity} color={colors.dirLight2Color} />

      <CameraRig />

      <group scale={responsiveScale}>
        <ParticleField count={responsiveScale < 0.7 ? 100 : 180} colors={colors} />

        {SKILLS.map((skill, i) => (
          <SkillLabel key={skill} text={skill} position={skillPositions[i]} speed={0.3 + (i % 5) * 0.1} onClick={onSkillClick} colors={colors} />
        ))}

        <ResumeSheet position={[-4, 0.5, -3]} rotation={[0.1, 0.3, 0.05]} scale={1.2} colors={colors} />
        <ResumeSheet position={[4.5, -0.8, -4]} rotation={[-0.05, -0.2, -0.08]} scale={0.9} colors={colors} />
        <ResumeSheet position={[1, 3, -5]} rotation={[0.08, 0.15, 0.12]} scale={1} colors={colors} />

        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <SkillBar key={i} position={[-2.5 + i * 0.25, -2.5, -2]} height={0.4 + Math.random() * 1.2} color={i < 4 ? colors.barGreen : colors.barRed} colors={colors} />
        ))}

        <ScoreRing position={[3, 2, -3]} radius={0.7} speed={0.2} colors={colors} />
        <ScoreRing position={[-3.5, -1.5, -4]} radius={0.5} speed={-0.15} colors={colors} />

        <SkillGraph colors={colors} />
      </group>
    </>
  );
};

const AnimatedBackground = ({ onSkillClick }: { onSkillClick?: (skill: string) => void }) => {
  const isDark = useDarkMode();
  const colors = useMemo(() => getColors(isDark), [isDark]);
  const { scale, isMobile } = useResponsiveScale();

  return (
    <>
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, isMobile ? 8 : 6], fov: isMobile ? 55 : 50 }}
          dpr={[1, isMobile ? 1 : 1.5]}
          gl={{ antialias: !isMobile, alpha: false }}
        >
          <Scene onSkillClick={onSkillClick} colors={colors} responsiveScale={scale} />
        </Canvas>
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: isDark
          ? 'linear-gradient(to bottom, transparent 0%, rgba(15,19,24,0.3) 50%, rgba(15,19,24,0.8) 100%)'
          : 'linear-gradient(to bottom, transparent 0%, rgba(248,246,241,0.25) 40%, rgba(248,246,241,0.75) 100%)'
      }} />
      <div className="grain-overlay" />
    </>
  );
};

export default AnimatedBackground;
