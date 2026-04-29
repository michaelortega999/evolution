/**
 * Three.js holographic objects: Earth, Brain, Bonsai.
 * Uses @react-three/fiber for declarative scene management.
 *
 * Color palette (holographic blue):
 *   primary glow #00d4ff, secondary #0066ff, ambient rgba(0,180,255,0.3)
 */
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { HologramKey } from "@/lib/holograms";

const COLOR_PRIMARY = "#00d4ff";
const COLOR_SECONDARY = "#0066ff";

/* ---------------- EARTH ---------------- */

function EarthHologram() {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  // Continent dot positions distributed over the sphere (latitude/longitude approximations)
  const continentDots = useMemo(() => {
    const positions: [number, number, number][] = [];
    const points = [
      // Africa / Europe
      [0, 30], [10, 20], [20, 10], [25, 0], [15, -10], [0, -20], [-10, -25], [10, 50], [20, 45],
      // Americas
      [-80, 40], [-90, 30], [-100, 20], [-70, -10], [-60, -20], [-65, -30], [-70, 10],
      // Asia
      [60, 50], [80, 40], [100, 30], [110, 20], [120, 35], [90, 60], [70, 25],
      // Australia
      [130, -25], [140, -30], [120, -20],
    ];
    for (const [lon, lat] of points) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const r = 1.02;
      positions.push([
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ]);
    }
    return positions;
  }, []);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.35;
    if (ring1.current) ring1.current.rotation.z += dt * 0.4;
    if (ring2.current) ring2.current.rotation.x += dt * 0.3;
    if (ring3.current) ring3.current.rotation.y += dt * 0.25;
  });

  return (
    <group ref={group}>
      {/* Solid sphere — dark transparent inner */}
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color={COLOR_SECONDARY} transparent opacity={0.08} />
      </mesh>

      {/* Wireframe lat/long grid */}
      <mesh>
        <sphereGeometry args={[1.001, 32, 24]} />
        <meshBasicMaterial color={COLOR_PRIMARY} wireframe transparent opacity={0.55} />
      </mesh>

      {/* Continent dots */}
      {continentDots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={COLOR_PRIMARY} />
        </mesh>
      ))}

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.22, 32, 32]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Orbital rings (armillary) */}
      <mesh ref={ring1} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.45, 0.008, 8, 128]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.55, 0.006, 8, 128]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring3} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <torusGeometry args={[1.65, 0.005, 8, 128]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ---------------- BRAIN ---------------- */

/**
 * Procedural brain: a base sphere displaced with multi-octave noise to simulate
 * the gyri/sulci folds, scaled into an ovoid, with a frontal lobe bias and a
 * cerebellum sphere at the back-bottom. Two hemispheres are rendered as
 * separate displaced meshes with a thin gap.
 */
function makeBrainHemisphereGeometry(side: 1 | -1): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 96, 96);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  // Simple value-noise replacement: stacked sin/cos perturbations
  const noise = (x: number, y: number, z: number) => {
    return (
      Math.sin(x * 7.0 + y * 5.0) * 0.5 +
      Math.cos(y * 9.0 + z * 6.0) * 0.4 +
      Math.sin(z * 11.0 + x * 4.0) * 0.35 +
      Math.cos((x + y + z) * 13.0) * 0.25 +
      Math.sin(x * 17.0) * Math.cos(y * 15.0) * 0.2
    );
  };

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = noise(v.x, v.y, v.z);
    // Folds: 0.06 amplitude, plus a slightly larger lobe shape
    const fold = 0.06 * n;
    const r = 1 + fold;
    v.multiplyScalar(r);
    // Squash into an ovoid — longer front-back, shorter top-bottom
    v.x *= 0.95;
    v.y *= 0.85;
    v.z *= 1.1;
    // Lift the frontal area (positive z) slightly
    if (v.z > 0) v.y += v.z * 0.05;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  // Move the hemisphere outward on X to create the central fissure
  geo.translate(side * 0.04, 0, 0);
  // Crop the hemisphere — only keep the side facing outward by mirroring later? We keep full for volume.
  return geo;
}

function BrainHologram() {
  const group = useRef<THREE.Group>(null);
  const synapses = useRef<THREE.Group>(null);
  const scanLine = useRef<THREE.Mesh>(null);

  const leftGeo = useMemo(() => makeBrainHemisphereGeometry(-1), []);
  const rightGeo = useMemo(() => makeBrainHemisphereGeometry(1), []);

  // Synapse positions on a slightly larger radius
  const synapsePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 28; i++) {
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = 2 * Math.PI * Math.random();
      const r = 1.1;
      pts.push([
        r * Math.sin(phi) * Math.cos(theta) * 0.95,
        r * Math.cos(phi) * 0.85,
        r * Math.sin(phi) * Math.sin(theta) * 1.1,
      ]);
    }
    return pts;
  }, []);

  // Neural connection line pairs
  const connections = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < 18; i++) {
      const a = synapsePoints[Math.floor(Math.random() * synapsePoints.length)];
      const b = synapsePoints[Math.floor(Math.random() * synapsePoints.length)];
      pairs.push([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
    }
    return pairs;
  }, [synapsePoints]);

  useFrame((state, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.3;
    if (synapses.current) {
      const t = state.clock.elapsedTime;
      synapses.current.children.forEach((c, i) => {
        const m = c as THREE.Mesh;
        const s = 0.6 + Math.sin(t * 2 + i) * 0.4;
        m.scale.setScalar(s);
      });
    }
    if (scanLine.current) {
      scanLine.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.9;
    }
  });

  return (
    <group ref={group} scale={1.05}>
      {/* Hemispheres — semi-transparent fill */}
      <mesh geometry={leftGeo}>
        <meshPhongMaterial
          color={COLOR_SECONDARY}
          emissive={COLOR_PRIMARY}
          emissiveIntensity={0.35}
          transparent
          opacity={0.35}
          shininess={80}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={rightGeo}>
        <meshPhongMaterial
          color={COLOR_SECONDARY}
          emissive={COLOR_PRIMARY}
          emissiveIntensity={0.35}
          transparent
          opacity={0.35}
          shininess={80}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe overlay on the surface */}
      <mesh geometry={leftGeo}>
        <meshBasicMaterial color={COLOR_PRIMARY} wireframe transparent opacity={0.45} />
      </mesh>
      <mesh geometry={rightGeo}>
        <meshBasicMaterial color={COLOR_PRIMARY} wireframe transparent opacity={0.45} />
      </mesh>

      {/* Inner glow core */}
      <mesh>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.18} />
      </mesh>

      {/* Cerebellum (lower back) */}
      <mesh position={[0, -0.55, -0.55]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhongMaterial
          color={COLOR_SECONDARY}
          emissive={COLOR_PRIMARY}
          emissiveIntensity={0.3}
          transparent
          opacity={0.45}
          wireframe
        />
      </mesh>

      {/* Brain stem */}
      <mesh position={[0, -0.85, -0.35]}>
        <cylinderGeometry args={[0.08, 0.1, 0.35, 16]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.6} />
      </mesh>

      {/* Neural connection lines */}
      {connections.map((pair, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pair);
        return (
          <line key={i}>
            <primitive object={geo} attach="geometry" />
            <lineBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.5} />
          </line>
        );
      })}

      {/* Synapse pulse nodes */}
      <group ref={synapses}>
        {synapsePoints.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={COLOR_PRIMARY} />
          </mesh>
        ))}
      </group>

      {/* Scanning line */}
      <mesh ref={scanLine}>
        <torusGeometry args={[1.15, 0.012, 6, 64]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ---------------- BONSAI ---------------- */

interface Branch {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radiusStart: number;
  radiusEnd: number;
  level: number;
}

function generateBonsai(): { branches: Branch[]; leafClusters: THREE.Vector3[] } {
  const branches: Branch[] = [];
  const leafClusters: THREE.Vector3[] = [];

  // Trunk — curved tube via segments
  const trunkPath = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.05, 0.25, 0.02),
    new THREE.Vector3(-0.04, 0.5, 0.05),
    new THREE.Vector3(0.08, 0.75, -0.03),
    new THREE.Vector3(0.02, 0.95, 0.0),
  ];
  for (let i = 0; i < trunkPath.length - 1; i++) {
    branches.push({
      start: trunkPath[i],
      end: trunkPath[i + 1],
      radiusStart: 0.12 - i * 0.018,
      radiusEnd: 0.12 - (i + 1) * 0.018,
      level: 0,
    });
  }

  const trunkTop = trunkPath[trunkPath.length - 1];

  // Recursive branching
  const recurse = (
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    level: number,
  ) => {
    if (level > 3 || length < 0.08) {
      // leaf cluster at tip
      leafClusters.push(origin.clone());
      return;
    }
    const end = origin.clone().add(direction.clone().multiplyScalar(length));
    branches.push({
      start: origin.clone(),
      end,
      radiusStart: radius,
      radiusEnd: radius * 0.6,
      level,
    });

    // 2–3 children with angle spread
    const childCount = level < 2 ? 3 : 2;
    for (let i = 0; i < childCount; i++) {
      const angleY = ((i - (childCount - 1) / 2) * Math.PI) / 2.5 + (Math.random() - 0.5) * 0.4;
      const angleX = -0.2 - Math.random() * 0.4; // tend slightly downward (drooping bonsai)
      const dir = direction.clone();
      const axisY = new THREE.Vector3(0, 1, 0);
      const axisX = new THREE.Vector3(1, 0, 0);
      dir.applyAxisAngle(axisY, angleY);
      dir.applyAxisAngle(axisX, angleX);
      dir.normalize();
      recurse(end, dir, length * (0.65 + Math.random() * 0.1), radius * 0.6, level + 1);
    }
  };

  // Spawn 3 main branches from trunk top
  const startDirs = [
    new THREE.Vector3(0.7, 0.5, 0).normalize(),
    new THREE.Vector3(-0.7, 0.5, 0.2).normalize(),
    new THREE.Vector3(0.1, 0.6, -0.7).normalize(),
  ];
  startDirs.forEach((d) => recurse(trunkTop, d, 0.32, 0.05, 1));

  return { branches, leafClusters };
}

function BonsaiHologram() {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  const { branches, leafClusters } = useMemo(() => generateBonsai(), []);

  // Build a tube geometry per branch
  const branchMeshes = useMemo(() => {
    return branches.map((b, i) => {
      const dir = b.end.clone().sub(b.start);
      const length = dir.length();
      const mid = b.start.clone().add(b.end).multiplyScalar(0.5);
      const orientation = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize(),
      );
      const geo = new THREE.CylinderGeometry(b.radiusEnd, b.radiusStart, length, 12, 1, false);
      return { geo, position: mid, quaternion: orientation, key: i };
    });
  }, [branches]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.3;
    if (ring1.current) ring1.current.rotation.z += dt * 0.6;
    if (ring2.current) ring2.current.rotation.z -= dt * 0.4;
  });

  return (
    <group ref={group} position={[0, -0.6, 0]} scale={1.3}>
      {/* Pot (flattened wide cylinder) */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.28, 0.12, 24, 1]} />
        <meshPhongMaterial
          color={COLOR_SECONDARY}
          emissive={COLOR_PRIMARY}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.28, 0.12, 24, 1]} />
        <meshBasicMaterial color={COLOR_PRIMARY} wireframe transparent opacity={0.7} />
      </mesh>

      {/* Pot rim */}
      <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.012, 8, 32]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.8} />
      </mesh>

      {/* Root flare */}
      <mesh position={[0, 0.04, 0]}>
        <coneGeometry args={[0.18, 0.08, 16]} />
        <meshBasicMaterial color={COLOR_PRIMARY} wireframe transparent opacity={0.5} />
      </mesh>

      {/* Branches */}
      {branchMeshes.map(({ geo, position, quaternion, key }) => (
        <group key={key} position={position} quaternion={quaternion}>
          <mesh geometry={geo}>
            <meshPhongMaterial
              color={COLOR_SECONDARY}
              emissive={COLOR_PRIMARY}
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh geometry={geo}>
            <meshBasicMaterial color={COLOR_PRIMARY} wireframe transparent opacity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Leaf clusters at tips */}
      {leafClusters.map((p, i) => (
        <group key={i} position={p}>
          {[
            [0, 0, 0],
            [0.04, 0.03, 0.02],
            [-0.03, 0.02, 0.04],
            [0.02, -0.02, -0.03],
            [-0.04, 0.04, -0.02],
          ].map((offset, j) => (
            <mesh key={j} position={offset as [number, number, number]}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshPhongMaterial
                color={COLOR_PRIMARY}
                emissive={COLOR_PRIMARY}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Base rings on the ground */}
      <mesh ref={ring1} position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.005, 6, 64]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2} position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.004, 6, 64]} />
        <meshBasicMaterial color={COLOR_PRIMARY} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ---------------- PARTICLES (shared) ---------------- */

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 60;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i);
      y += dt * 0.15;
      if (y > 1.8) y = -1.8;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={COLOR_PRIMARY} size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ---------------- HOST ---------------- */

interface Hologram3DProps {
  kind: HologramKey;
  size?: number;
}

export function Hologram3D({ kind, size = 320 }: Hologram3DProps) {
  return (
    <div style={{ width: size, height: size }} aria-hidden>
      <Canvas
        camera={{ position: [0, 0.2, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} color={COLOR_PRIMARY} />
        <pointLight position={[2, 3, 2]} intensity={1.4} color={COLOR_PRIMARY} />
        <pointLight position={[-2, -1, -2]} intensity={0.7} color={COLOR_SECONDARY} />
        <Suspense fallback={null}>
          {kind === "earth" && <EarthHologram />}
          {kind === "brain" && <BrainHologram />}
          {kind === "bonsai" && <BonsaiHologram />}
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  );
}
