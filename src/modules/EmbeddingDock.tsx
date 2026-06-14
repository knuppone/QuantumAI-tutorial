import { useRef, useState } from 'react'
import { BlochSphere } from '../components/BlochSphere'
import { MathLabel } from '../components/MathLabel'
import { Panel, InsightBox } from '../components/Panel'
import { TeachPanel, Fact, CompareTable } from '../components/TeachPanel'
import { useCircuitStore } from '../store/circuitStore'
import { angleEmbed1Qubit, amplitudeEmbed } from '../quantum/embedding'
import { reducedBloch } from '../quantum/density'

const PLOT_SIZE = 220

export function EmbeddingDock() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState(false)
  const { embeddingMode, dataX, dataY, amplitudeValues, setDataPoint, setEmbeddingMode, setAmplitudeValues } =
    useCircuitStore()

  const sv1 = angleEmbed1Qubit(dataX, dataY)
  const bloch = reducedBloch(sv1, 0)
  const sv2 = amplitudeEmbed(amplitudeValues)

  function coordsFromEvent(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / PLOT_SIZE) * 2 - 1
    const y = -(((e.clientY - rect.top) / PLOT_SIZE) * 2 - 1)
    setDataPoint(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
  }

  const px = ((dataX + 1) / 2) * PLOT_SIZE
  const py = ((1 - dataY) / 2) * PLOT_SIZE

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">⟩</div>
          <h2 className="text-xl font-semibold text-white">Classical → Quantum Embedding</h2>
        </div>
        <p className="text-sm text-q-sub max-w-2xl leading-relaxed ml-0 sm:ml-10">
          Before a quantum circuit can process data, it must be loaded into a quantum state.
          Drag the point on the plot — the Bloch sphere updates in real time.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="ml-0 sm:ml-10 flex items-center gap-2">
        {(['angle', 'amplitude'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setEmbeddingMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-mono transition-all ${
              embeddingMode === m
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm'
                : 'bg-q-dim text-q-sub border border-q-border hover:border-q-border2 hover:text-q-text'
            }`}
          >
            {m === 'angle' ? 'Angle Embedding' : 'Amplitude Embedding'}
          </button>
        ))}
      </div>

      <div className="ml-0 sm:ml-10 flex flex-wrap gap-6">
        {/* Interactive area */}
        {embeddingMode === 'angle' ? (
          <>
            <Panel title="Data point" subtitle="Click or drag in [-1, 1]²" className="flex-shrink-0">
              <svg
                ref={svgRef} width={PLOT_SIZE} height={PLOT_SIZE}
                className="rounded-lg cursor-crosshair block touch-none max-w-full"
                style={{ background: 'radial-gradient(ellipse at center, #0f1e3a 0%, #060b18 100%)' }}
                onPointerDown={(e) => { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); coordsFromEvent(e) }}
                onPointerMove={(e) => dragging && coordsFromEvent(e)}
                onPointerUp={() => setDragging(false)}
                onPointerCancel={() => setDragging(false)}
              >
                {[-0.5, 0, 0.5].map((v) => {
                  const gx = ((v + 1) / 2) * PLOT_SIZE
                  const gy = ((1 - v) / 2) * PLOT_SIZE
                  return (
                    <g key={v}>
                      <line x1={gx} y1={0} x2={gx} y2={PLOT_SIZE} stroke={v === 0 ? '#334155' : '#1e293b'} strokeWidth={v === 0 ? 1.5 : 1} />
                      <line x1={0} y1={gy} x2={PLOT_SIZE} y2={gy} stroke={v === 0 ? '#334155' : '#1e293b'} strokeWidth={v === 0 ? 1.5 : 1} />
                    </g>
                  )
                })}
                <text x={PLOT_SIZE / 2 + 4} y={13} fill="#475569" fontSize={9} fontFamily="JetBrains Mono, monospace">+y</text>
                <text x={PLOT_SIZE / 2 + 4} y={PLOT_SIZE - 4} fill="#475569" fontSize={9} fontFamily="JetBrains Mono, monospace">-y</text>
                <text x={PLOT_SIZE - 20} y={PLOT_SIZE / 2 - 4} fill="#475569" fontSize={9} fontFamily="JetBrains Mono, monospace">+x</text>
                <text x={4} y={PLOT_SIZE / 2 - 4} fill="#475569" fontSize={9} fontFamily="JetBrains Mono, monospace">-x</text>
                <circle cx={px} cy={py} r={20} fill="#6366f1" opacity={0.07} />
                <circle cx={px} cy={py} r={12} fill="#6366f1" opacity={0.14} />
                <circle cx={px} cy={py} r={7} fill="#6366f1" />
                <circle cx={px} cy={py} r={7} fill="none" stroke="#a5b4fc" strokeWidth={2} />
                <circle cx={px} cy={py} r={3} fill="white" opacity={0.6} />
                <text x={Math.min(px + 12, PLOT_SIZE - 70)} y={Math.max(py - 10, 16)} fill="#a5b4fc" fontSize={10} fontFamily="JetBrains Mono, monospace">
                  ({dataX.toFixed(2)}, {dataY.toFixed(2)})
                </text>
              </svg>
            </Panel>

            <Panel title="Qubit state |ψ⟩" subtitle="Bloch sphere representation" className="flex-shrink-0">
              <BlochSphere bloch={bloch} size={220} />
            </Panel>
          </>
        ) : (
          <>
            <Panel title="Input values" subtitle="4 classical numbers → 2 qubits" className="w-80">
              <div className="flex flex-col gap-4">
                <p className="text-xs text-q-sub leading-relaxed">
                  Adjust each value. The vector is automatically normalized so the total probability sums to 1.
                </p>
                {amplitudeValues.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-q-faint w-5">a<sub>{i}</sub></span>
                    <input type="range" min={-1} max={1} step={0.01} value={v} className="flex-1"
                      onChange={(e) => {
                        const nv = [...amplitudeValues] as [number, number, number, number]
                        nv[i] = parseFloat(e.target.value)
                        setAmplitudeValues(nv)
                      }} />
                    <span className="text-xs font-mono text-indigo-300 w-12 text-right">{v.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Normalized 2-qubit state" subtitle="Amplitude and probability per basis state" className="flex-shrink-0">
              <div className="flex flex-col gap-2">
                {sv2.probabilities().map((p, i) => {
                  const label = '|' + i.toString(2).padStart(2, '0') + '⟩'
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-indigo-300 w-10">{label}</span>
                      <span className="text-xs font-mono text-q-text w-14">{sv2.re[i].toFixed(3)}</span>
                      <div className="flex-1 h-3 bg-q-dim rounded-sm overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-sm transition-all duration-150" style={{ width: `${p * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-q-faint w-10 text-right">{(p * 100).toFixed(1)}%</span>
                    </div>
                  )
                })}
                <div className="mt-1 text-xs font-mono text-q-faint flex justify-between border-t border-q-border pt-2">
                  <span>Norm</span>
                  <span className="text-emerald-400">{sv2.norm2().toFixed(6)}</span>
                </div>
              </div>
            </Panel>
          </>
        )}

        {/* Teaching panel */}
        <TeachPanel
          sections={[
            {
              icon: '🧩',
              label: 'What is a qubit?',
              content: (
                <>
                  <p>A classical bit is either <Fact>0</Fact> or <Fact>1</Fact>. A qubit is a unit vector in a 2D <em>complex</em> vector space:</p>
                  <div className="my-2 text-center">
                    <MathLabel math={`|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle`} />
                  </div>
                  <p>where <MathLabel math={`|\\alpha|^2 + |\\beta|^2 = 1`} />. The <strong className="text-q-text">Bloch sphere</strong> is just a way to visualize this unit vector — the north pole is |0⟩, the south pole is |1⟩, and every other point is a superposition.</p>
                </>
              ),
            },
            {
              icon: '🔌',
              label: 'Why do we need embedding?',
              content: (
                <>
                  <p>Quantum circuits operate on qubits — they can't directly consume floats from a CSV. Embedding is the translation layer that maps classical feature vectors into quantum states.</p>
                  <p className="mt-2">It's exactly like tokenization in NLP: raw text → token IDs → embeddings. Here: raw floats → qubit rotations.</p>
                  <CompareTable rows={[
                    { classical: 'Word → token ID', quantum: 'Float → rotation angle θ' },
                    { classical: 'Embedding lookup', quantum: 'RY(θ)|0⟩ rotation' },
                    { classical: 'n features → n dims', quantum: 'n features → log₂(n) qubits' },
                  ]} />
                </>
              ),
            },
            {
              icon: '⚖️',
              label: 'Angle vs Amplitude',
              content: (
                <>
                  <p><strong className="text-q-text">Angle Embedding</strong> uses one qubit per feature. Easy to implement, but doesn't compress data.</p>
                  <p className="mt-2"><strong className="text-q-text">Amplitude Embedding</strong> packs <MathLabel math={`2^n`} /> values into <MathLabel math={`n`} /> qubits — exponential compression. But preparing such states on hardware is expensive.</p>
                  <p className="mt-2 text-q-faint text-xs">In practice, angle embedding dominates because it maps naturally to hardware-native rotation gates.</p>
                </>
              ),
            },
          ]}
          keyInsight={
            <>
              The Bloch sphere arrow always has length ≤ 1. For a pure (non-entangled) qubit it sits exactly on the surface. When you <em>entangle</em> qubits (Module 3), each individual qubit's arrow shrinks toward the center — it no longer has a well-defined single state.
            </>
          }
          glossary={[
            { term: '|ψ⟩ (ket)', def: 'Dirac notation for a quantum state vector.' },
            { term: 'α, β (amplitudes)', def: 'Complex numbers whose squared magnitudes give measurement probabilities.' },
            { term: 'Bloch sphere', def: 'Geometric representation of a single qubit on the surface of a unit sphere.' },
            { term: 'RY(θ)', def: 'Rotation gate: rotates the Bloch vector by angle θ around the Y-axis.' },
          ]}
        />
      </div>
    </div>
  )
}
