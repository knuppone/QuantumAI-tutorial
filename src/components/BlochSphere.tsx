import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { BlochVector } from '../quantum/density'

interface ArrowProps {
  bloch: BlochVector
}

function BlochArrow({ bloch }: ArrowProps) {
  const ref = useRef<THREE.Mesh>(null!)
  const { x, y, z, purity } = bloch

  const dir = useMemo(() => new THREE.Vector3(x, z, -y).normalize(), [x, y, z])
  const len = Math.sqrt(x * x + y * y + z * z)
  const opacity = 0.3 + 0.7 * purity

  const position = useMemo(
    () => new THREE.Vector3((x * 0.5), (z * 0.5), (-y * 0.5)),
    [x, y, z],
  )

  return (
    <group>
      {/* shaft */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(x * 0.95, z * 0.95, -y * 0.95)]}
        color={purity > 0.9 ? '#818cf8' : '#94a3b8'}
        lineWidth={3}
        transparent
        opacity={opacity}
      />
      {/* tip cone */}
      <mesh
        position={[x * 0.95, z * 0.95, -y * 0.95]}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir,
        )}
      >
        <coneGeometry args={[0.04, 0.12, 16]} />
        <meshStandardMaterial
          color={purity > 0.9 ? '#818cf8' : '#94a3b8'}
          transparent
          opacity={opacity}
          emissive={purity > 0.9 ? '#6366f1' : '#374151'}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

function BlochScene({ bloch }: { bloch: BlochVector }) {
  // Wireframe sphere
  const sphere = (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#1e293b"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  )

  // Axis labels
  const axes = [
    { pos: [0, 1.3, 0] as [number, number, number], label: '+z (|0⟩)', color: '#10b981' },
    { pos: [0, -1.3, 0] as [number, number, number], label: '-z (|1⟩)', color: '#ef4444' },
    { pos: [1.3, 0, 0] as [number, number, number], label: '+x', color: '#6366f1' },
    { pos: [0, 0, 1.3] as [number, number, number], label: '+y', color: '#f59e0b' },
  ]

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={1} />
      {sphere}
      {/* Axes */}
      <Line points={[[0, -1.1, 0], [0, 1.1, 0]]} color="#10b981" lineWidth={1} transparent opacity={0.4} />
      <Line points={[[-1.1, 0, 0], [1.1, 0, 0]]} color="#6366f1" lineWidth={1} transparent opacity={0.4} />
      <Line points={[[0, 0, -1.1], [0, 0, 1.1]]} color="#f59e0b" lineWidth={1} transparent opacity={0.4} />
      {axes.map(({ pos, label, color }) => (
        <Text key={label} position={pos} fontSize={0.12} color={color} anchorX="center" anchorY="middle">
          {label}
        </Text>
      ))}
      {/* Equator circle */}
      <Line
        points={Array.from({ length: 65 }, (_, i) => {
          const a = (i / 64) * Math.PI * 2
          return new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
        })}
        color="#334155"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
      <BlochArrow bloch={bloch} />
      <OrbitControls enableZoom={false} />
    </>
  )
}

interface BlochSphereProps {
  bloch: BlochVector
  size?: number
  label?: string
}

export function BlochSphere({ bloch, size = 200, label }: BlochSphereProps) {
  const { purity } = bloch
  const isPure = purity > 0.95

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <div className="text-xs text-slate-400 font-mono">{label}</div>
      )}
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl border ${isPure ? 'border-indigo-500/40' : 'border-slate-700/40'} bg-slate-900/60 transition-all duration-300`}
      >
        <Canvas camera={{ position: [2, 1.5, 2], fov: 40 }}>
          <BlochScene bloch={bloch} />
        </Canvas>
      </div>
      <div className="flex gap-3 text-xs font-mono text-slate-400">
        <span>x={bloch.x.toFixed(2)}</span>
        <span>y={bloch.y.toFixed(2)}</span>
        <span>z={bloch.z.toFixed(2)}</span>
      </div>
      <div className={`text-xs font-mono ${isPure ? 'text-emerald-400' : 'text-amber-400'}`}>
        purity={purity.toFixed(3)} {!isPure && '⚠ mixed'}
      </div>
    </div>
  )
}
