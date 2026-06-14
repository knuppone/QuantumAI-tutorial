import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { StateVector } from '../quantum/statevector'
import { allKetLabels } from '../quantum/circuit'

function hslToHex(h: number, s: number, l: number): string {
  const c = new THREE.Color()
  c.setHSL(h, s, l)
  return '#' + c.getHexString()
}

interface BarProps {
  x: number
  z: number
  height: number
  phase: number
  label: string
}

function Bar({ x, z, height, phase, label }: BarProps) {
  const h = Math.max(height, 0.005)
  const color = hslToHex(((phase / (Math.PI * 2) + 1) % 1), 0.8, 0.55)

  return (
    <group position={[x, h / 2, z]}>
      <mesh>
        <boxGeometry args={[0.6, h, 0.6]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <Text
        position={[0, -h / 2 - 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

interface Props {
  sv: StateVector
  size?: number
}

export function CityPlot({ sv, size = 300 }: Props) {
  const probs = sv.probabilities()
  const labels = allKetLabels(sv.n)
  const dim = 1 << sv.n
  const maxProb = Math.max(...probs, 0.01)

  // Lay out in a 2D grid for multi-qubit
  const cols = Math.ceil(Math.sqrt(dim))
  const rows = Math.ceil(dim / cols)

  return (
    <div style={{ width: size, height: size }} className="rounded-xl border border-slate-700 bg-slate-900/60">
      <Canvas camera={{ position: [cols * 0.8, cols * 1.2, cols * 0.8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        {/* Floor grid */}
        <gridHelper args={[cols + 1, cols, '#1e293b', '#1e293b']} position={[cols / 2 - 0.5, 0, rows / 2 - 0.5]} />
        {probs.map((p, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const phase = sv.phase(i)
          return (
            <Bar
              key={i}
              x={col}
              z={row}
              height={p / maxProb * 2.5}
              phase={phase}
              label={labels[i]}
            />
          )
        })}
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  )
}
