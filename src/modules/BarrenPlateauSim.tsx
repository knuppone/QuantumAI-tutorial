import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Panel } from '../components/Panel'
import { TeachPanel, Fact, CompareTable } from '../components/TeachPanel'
import { MathLabel } from '../components/MathLabel'
import { gradientVariance, lossSurface, randomAnsatz } from '../quantum/landscape'
import type { SurfacePoint } from '../quantum/landscape'

interface SurfaceMeshProps {
  grid: SurfacePoint[][]
  flatten: number
}

function SurfaceMesh({ grid, flatten }: SurfaceMeshProps) {
  const steps = grid.length
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions: number[] = []
    const colors: number[] = []
    const indices: number[] = []
    let minL = Infinity, maxL = -Infinity
    for (const row of grid) for (const pt of row) {
      if (pt.loss < minL) minL = pt.loss
      if (pt.loss > maxL) maxL = pt.loss
    }
    const range = maxL - minL || 1
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < steps; j++) {
        const pt = grid[i][j]
        const nx = (i / (steps - 1)) * 4 - 2
        const nz = (j / (steps - 1)) * 4 - 2
        const rawY = ((pt.loss - minL) / range) * 1.8
        const y = rawY * (1 - flatten)
        positions.push(nx, y, nz)
        const c = new THREE.Color()
        c.setHSL(0.7 - rawY * 0.55, 0.85, 0.4 + rawY * 0.25)
        colors.push(c.r, c.g, c.b)
      }
    }
    for (let i = 0; i < steps - 1; i++) {
      for (let j = 0; j < steps - 1; j++) {
        const a = i * steps + j, b = a + 1, c = a + steps, d = c + 1
        indices.push(a, b, c, b, d, c)
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [grid, flatten])

  return <mesh geometry={geometry}><meshStandardMaterial vertexColors side={THREE.DoubleSide} /></mesh>
}

export function BarrenPlateauSim() {
  const [qubits, setQubits] = useState(2)
  const [depth, setDepth] = useState(1)
  const [variance, setVariance] = useState<number | null>(null)
  const [grid, setGrid] = useState<SurfacePoint[][] | null>(null)
  const [computing, setComputing] = useState(false)

  useEffect(() => {
    setComputing(true)
    const timer = setTimeout(() => {
      const v = gradientVariance(qubits, depth, 30)
      setVariance(v)
      const circuit = randomAnsatz(qubits, depth)
      const paramGates = circuit.gates.filter((g) => g.param !== undefined)
      if (paramGates.length >= 2) {
        const idx1 = circuit.gates.indexOf(paramGates[0])
        const idx2 = circuit.gates.indexOf(paramGates[1])
        setGrid(lossSurface(circuit, idx1, idx2, 18))
      } else {
        setGrid(null)
      }
      setComputing(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [qubits, depth])

  const referenceVariance = 0.12
  const flatten = variance !== null ? Math.min(1, 1 - Math.sqrt(Math.min(variance / referenceVariance, 1))) : 0
  const isBarren = variance !== null && variance < 0.002
  const isWarning = variance !== null && variance < 0.02
  const pct = variance !== null ? Math.min(100, Math.sqrt(variance / referenceVariance) * 100) : 0

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-600 to-orange-600 flex items-center justify-center text-white text-sm font-bold">⊘</div>
          <h2 className="text-xl font-semibold text-white">Barren Plateau Simulator</h2>
        </div>
        <p className="text-sm text-q-sub max-w-2xl leading-relaxed ml-0 sm:ml-10">
          Deep quantum circuits suffer from Barren Plateaus — the loss landscape becomes completely flat,
          gradients vanish exponentially, and the optimizer is blind. Increase depth or qubit count and watch it happen.
        </p>
      </div>

      <div className="ml-0 sm:ml-10 flex flex-wrap gap-6">
        {/* Controls + meter */}
        <div className="flex flex-col gap-5 w-full sm:w-64">
          <Panel title="Circuit parameters" accent="rose">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-q-faint">Qubits</span>
                  <span className="text-q-text font-bold">{qubits}</span>
                </div>
                <input type="range" min={2} max={8} step={1} value={qubits}
                  onChange={(e) => setQubits(parseInt(e.target.value))} className="w-full" />
                <div className="flex justify-between text-[10px] font-mono text-q-faint">
                  <span>2 (easy)</span><span>8 (hard)</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-q-faint">Circuit depth</span>
                  <span className="text-q-text font-bold">{depth}</span>
                </div>
                <input type="range" min={1} max={12} step={1} value={depth}
                  onChange={(e) => setDepth(parseInt(e.target.value))} className="w-full" />
                <div className="flex justify-between text-[10px] font-mono text-q-faint">
                  <span>1 (shallow)</span><span>12 (deep)</span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Gradient variance" subtitle="Var[∂L/∂θ]"
            accent={isBarren ? 'rose' : isWarning ? 'amber' : 'emerald'}
            glow={isBarren}>
            <div className="flex flex-col gap-3">
              <div className={`text-2xl font-mono font-bold ${isBarren ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                {computing ? <span className="text-q-faint animate-pulse text-base">computing…</span>
                  : variance !== null ? (variance < 0.0001 ? variance.toExponential(2) : variance.toFixed(4)) : '—'}
              </div>
              <div className="h-2 bg-q-dim rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isBarren ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-q-faint">
                <span>0 (plateau)</span><span>0.12 (trainable)</span>
              </div>
              {isBarren && (
                <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-xs text-rose-400 font-semibold font-mono bg-rose-950/40 border border-rose-800/40 rounded-lg px-3 py-2">
                  ☠ Barren plateau — gradient ≈ 0
                </motion.div>
              )}
            </div>
          </Panel>
        </div>

        {/* 3D surface */}
        <Panel title="Loss landscape (two parameter axes)" subtitle="Drag to rotate · scroll to zoom" className="flex-1" accent="rose">
          <div className="w-full rounded-lg overflow-hidden bg-q-bg" style={{ height: 300 }}>
            {grid ? (
              <Canvas camera={{ position: [3.5, 3, 3.5], fov: 48 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[4, 6, 4]} intensity={1} />
                <SurfaceMesh grid={grid} flatten={flatten} />
                <axesHelper args={[2.2]} />
                <OrbitControls enableZoom />
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-q-faint text-sm font-mono">
                {computing ? <span className="animate-pulse">Computing landscape…</span> : 'Increase depth to see the surface'}
              </div>
            )}
          </div>
          <div className={`mt-2 text-center text-xs font-mono ${isBarren ? 'text-rose-400/80' : 'text-q-faint'}`}>
            {isBarren
              ? 'Surface collapsed to a flat plane — no gradient signal'
              : !computing ? 'Hills and valleys visible — optimizer can navigate' : ''}
          </div>
        </Panel>

        {/* Teaching panel */}
        <TeachPanel
          sections={[
            {
              icon: '📉',
              label: 'What is a barren plateau?',
              content: (
                <>
                  <p>A barren plateau is a region of the loss landscape where gradients are exponentially small — essentially zero. The optimizer can't tell which direction to step.</p>
                  <p className="mt-2">It's <em>much</em> worse than classical vanishing gradients: classical gradients vanish <strong className="text-q-text">polynomially</strong> with depth; quantum gradients can vanish <strong className="text-q-text">exponentially</strong> with both depth <em>and</em> the number of qubits.</p>
                  <div className="my-2 text-center">
                    <MathLabel math={`\\text{Var}[\\partial_\\theta \\mathcal{L}] \\sim \\mathcal{O}\\left(\\frac{1}{2^n}\\right)`} />
                  </div>
                </>
              ),
            },
            {
              icon: '🎲',
              label: 'Why does it happen?',
              content: (
                <>
                  <p>Random quantum circuits form "<strong className="text-q-text">unitary 2-designs</strong>" — they explore the full unitary group uniformly. In this regime, gradients concentrate exponentially tightly around zero.</p>
                  <p className="mt-2">Think of it geometrically: in high dimensions, a random point on a sphere is almost certainly near the equator — it's <em>never</em> near the poles. Similarly, a random quantum state has near-zero gradient in every direction.</p>
                  <CompareTable rows={[
                    { classical: 'Vanishing: poly(depth)', quantum: 'Vanishing: exp(n qubits)' },
                    { classical: 'Fix: residuals / BatchNorm', quantum: 'Partial fix: local cost functions' },
                    { classical: 'Common above ~100 layers', quantum: 'Occurs above ~10 layers at scale' },
                  ]} />
                </>
              ),
            },
            {
              icon: '🛠️',
              label: 'Known mitigations',
              content: (
                <div className="flex flex-col gap-1.5 text-xs">
                  {[
                    { fix: 'Local cost functions', desc: 'Measure only nearby qubits instead of the whole system.' },
                    { fix: 'Identity block init', desc: 'Initialize all gates to identity so early training has signal.' },
                    { fix: 'Layerwise training', desc: 'Train one layer at a time, freeze the rest.' },
                    { fix: 'Quantum Natural Gradient', desc: 'Accounts for the geometry of quantum state space.' },
                    { fix: 'Tensor network ansatze', desc: 'Use structured (non-random) circuit designs that avoid the problem.' },
                  ].map(({ fix, desc }) => (
                    <div key={fix} className="flex flex-col gap-0.5">
                      <span className="text-emerald-400 font-mono">{fix}</span>
                      <span className="text-q-faint">{desc}</span>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
          keyInsight={
            <>
              The barren plateau is the reason large-scale quantum ML is an open research problem. Even if you build a 100-qubit quantum computer, training a deep PQC on it is currently impractical — the gradients you'd need to measure are smaller than the noise floor of the hardware.
            </>
          }
          glossary={[
            { term: 'Barren plateau', def: 'A region of parameter space where all gradients are exponentially close to zero.' },
            { term: 'Unitary 2-design', def: 'A distribution over unitaries that matches the Haar (uniform) measure for expectation values up to degree 2.' },
            { term: 'Expressibility', def: 'How uniformly a PQC covers the unitary group. More expressible circuits are more plateau-prone.' },
            { term: 'Local cost', def: 'A loss function acting on a constant number of qubits, which avoids exponential gradient suppression.' },
          ]}
        />
      </div>
    </div>
  )
}
