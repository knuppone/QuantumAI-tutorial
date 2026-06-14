import { useMemo, useState } from 'react'
import { Panel } from '../Panel'
import { StateVector } from '../../quantum/statevector'
import { GH, RZ } from '../../quantum/gates'
import { kernelMatrix } from '../../quantum/kernel'

interface Pt { x: number; y: number }

// Two clusters → a clear block structure in the kernel matrix at low depth.
const POINTS: Pt[] = [
  { x: -0.6, y: -0.5 }, { x: -0.5, y: -0.7 }, { x: -0.7, y: -0.4 },
  { x: 0.6, y: 0.5 }, { x: 0.5, y: 0.7 }, { x: 0.7, y: 0.45 },
]

/** A simple IQP-style feature map U(x)|0⟩ on 3 qubits, repeated `depth` times.
 *  Deeper / more expressive maps push the feature states apart → kernel concentrates. */
function featureState(p: Pt, depth: number): StateVector {
  const n = 3
  const sv = new StateVector(n)
  const feats = [p.x, p.y, p.x * p.y]
  for (let l = 0; l < depth; l++) {
    for (let q = 0; q < n; q++) sv.applySingleQubitGate(GH, q)
    for (let q = 0; q < n; q++) sv.applySingleQubitGate(RZ(feats[q] * Math.PI), q)
    for (let q = 0; q < n - 1; q++) sv.applyCZ(q, q + 1)
  }
  return sv
}

function cellColor(v: number): string {
  // 0 → near background, 1 → bright indigo
  const t = Math.max(0, Math.min(1, v))
  const r = Math.round(13 + t * (129 - 13))
  const g = Math.round(20 + t * (140 - 20))
  const b = Math.round(36 + t * (248 - 36))
  return `rgb(${r}, ${g}, ${b})`
}

export function KernelVisualizer() {
  const [depth, setDepth] = useState(1)
  const { K, offDiag } = useMemo(() => {
    const states = POINTS.map((p) => featureState(p, depth))
    const K = kernelMatrix(states)
    let sum = 0
    let count = 0
    for (let i = 0; i < K.length; i++)
      for (let j = 0; j < K.length; j++)
        if (i !== j) { sum += K[i][j]; count++ }
    return { K, offDiag: sum / count }
  }, [depth])

  const N = POINTS.length
  const cell = 34

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <Panel title="Kernel matrix" subtitle={`K[i][j] = |⟨ψᵢ|ψⱼ⟩|²  ·  depth ${depth}`} className="flex-shrink-0">
        <svg width={cell * N + 1} height={cell * N + 1} className="block rounded">
          {K.map((row, i) =>
            row.map((v, j) => (
              <g key={`${i}-${j}`}>
                <rect x={j * cell} y={i * cell} width={cell} height={cell} fill={cellColor(v)} stroke="#060b18" strokeWidth={1} />
                <text x={j * cell + cell / 2} y={i * cell + cell / 2 + 3} textAnchor="middle"
                  fontSize={9} fontFamily="JetBrains Mono, monospace" fill={v > 0.5 ? '#0b1120' : '#64748b'}>
                  {v.toFixed(2)}
                </text>
              </g>
            )),
          )}
        </svg>
      </Panel>

      <Panel title="Expressivity / depth" subtitle="how scrambled the feature map is" className="w-full sm:flex-1 sm:min-w-[280px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-q-faint w-12">depth</span>
            <input type="range" min={1} max={12} step={1} value={depth} className="flex-1"
              onChange={(e) => setDepth(parseInt(e.target.value))} />
            <span className="text-xs font-mono text-indigo-300 w-8 text-right">{depth}</span>
          </div>

          <div className="rounded-lg border border-q-border bg-q-dim/40 p-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-q-faint">avg off-diagonal similarity</span>
              <span className={offDiag < 0.1 ? 'text-rose-400' : 'text-emerald-400'}>{offDiag.toFixed(3)}</span>
            </div>
            <div className="mt-1 h-2 bg-q-dim rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-rose-500 transition-all" style={{ width: `${Math.min(1, offDiag * 3) * 100}%` }} />
            </div>
          </div>

          <p className="text-xs text-q-faint leading-relaxed">
            The two clusters start out clearly similar within each block (bright squares) and different
            across blocks — a useful kernel. Crank the depth: the off-diagonals collapse toward zero and the
            matrix approaches the identity. Every point looks equally dissimilar to every other —
            <strong className="text-q-text"> exponential kernel concentration</strong>, the kernel cousin of the
            barren plateau. An over-expressive feature map is a useless one.
          </p>
        </div>
      </Panel>
    </div>
  )
}
