import { useState } from 'react'
import { BlochSphere } from '../components/BlochSphere'
import { CityPlot } from '../components/CityPlot'
import { CircuitBoard } from '../components/CircuitBoard'
import { ProbabilityHistogram } from '../components/ProbabilityHistogram'
import { Panel } from '../components/Panel'
import { TeachPanel, Fact, CompareTable } from '../components/TeachPanel'
import { MathLabel } from '../components/MathLabel'
import { useCircuitStore, useLiveBlochVectors, useLiveStateVector } from '../store/circuitStore'
import { useIsMobile } from '../responsive/viewport'

export function EntanglementView() {
  const { circuit, nQubits, selectedGateId, addGate, removeGate, updateGateParam, selectGate, setNQubits, resetCircuit } =
    useCircuitStore()
  const isMobile = useIsMobile()
  const blochVectors = useLiveBlochVectors()
  const sv = useLiveStateVector()
  const probs = sv.probabilities()
  const [view, setView] = useState<'city' | 'bloch'>('bloch')

  const anyEntangled = blochVectors.some((b) => b.purity < 0.92)
  const maxEntangled = blochVectors.some((b) => b.purity < 0.55)

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">∞</div>
          <h2 className="text-xl font-semibold text-white">Quantum Entanglement</h2>
        </div>
        <p className="text-sm text-q-sub max-w-2xl leading-relaxed ml-0 sm:ml-10">
          Entangled qubits lose their independent states — you can't describe qubit 0 without qubit 1.
          Bloch spheres go fuzzy as purity drops below 1. The joint state lives in an exponentially larger space.
        </p>
      </div>

      {/* Controls */}
      <div className="ml-0 sm:ml-10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-q-faint">Qubits</span>
          {[2, 3, 4].map((n) => (
            <button key={n} onClick={() => setNQubits(n)}
              className={`w-8 h-8 rounded-lg font-mono text-sm transition-all ${
                nQubits === n
                  ? 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white shadow-glow-sm'
                  : 'bg-q-dim text-q-faint border border-q-border hover:border-q-border2'
              }`}>{n}</button>
          ))}
        </div>
        <button onClick={resetCircuit} className="px-3 py-1.5 rounded-lg text-xs font-mono text-q-faint border border-q-border hover:border-q-border2 transition-all">Clear</button>
        <button
          onClick={() => { resetCircuit(); setTimeout(() => { addGate('H', [0], 0); addGate('CNOT', [0, 1], 1) }, 10) }}
          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60 transition-all"
        >
          ✨ Bell state preset
        </button>
      </div>

      {anyEntangled && (
        <div className={`ml-0 sm:ml-10 flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${
          maxEntangled ? 'bg-amber-950/40 border-amber-700/40 text-amber-300' : 'bg-amber-950/20 border-amber-800/30 text-amber-400/80'
        }`}>
          <span className="text-base mt-0.5">⚠</span>
          <div>
            <span className="font-medium">Qubits are entangled.</span>
            {' '}Individual Bloch spheres are <span className="font-mono">mixed</span> (purity &lt; 1) — they no longer have definite independent states.
            The joint City Plot is the only complete description.
          </div>
        </div>
      )}

      <div className="ml-0 sm:ml-10 flex flex-wrap gap-6">
        {/* Left: circuit + visualizations */}
        <div className="flex flex-col gap-4 w-full sm:flex-1 sm:min-w-[380px]">
          <Panel title="Circuit" subtitle="Add H + CNOT to entangle qubits">
            <CircuitBoard circuit={circuit} selectedGateId={selectedGateId}
              onAddGate={addGate} onRemoveGate={removeGate}
              onUpdateParam={updateGateParam} onSelect={selectGate} />
          </Panel>

          <div className="flex gap-1 bg-q-dim rounded-lg p-1 w-fit">
            {(['bloch', 'city'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  view === v ? 'bg-q-panel text-q-text shadow-sm' : 'text-q-faint hover:text-q-sub'
                }`}>
                {v === 'bloch' ? 'Bloch Spheres' : 'City Plot (joint)'}
              </button>
            ))}
          </div>

          {view === 'bloch' ? (
            <div className="flex flex-wrap gap-3">
              {blochVectors.map((b, q) => (
                <BlochSphere key={q} bloch={b} size={isMobile ? 130 : 160} label={`Qubit ${q}`} />
              ))}
            </div>
          ) : (
            <CityPlot sv={sv} size={isMobile ? 260 : 320} />
          )}

          <Panel title={`Joint state (${nQubits} qubits → ${1 << nQubits} basis states)`} accent="cyan">
            <ProbabilityHistogram probabilities={probs} nQubits={nQubits} height={90} />
            <p className="text-xs text-q-faint mt-2">
              Adding one qubit doubles the Hilbert space: <MathLabel math={`2^{${nQubits}} = ${1 << nQubits}`} /> dimensions.
            </p>
          </Panel>
        </div>

        {/* Teaching panel */}
        <TeachPanel
          sections={[
            {
              icon: '🔮',
              label: 'What is entanglement?',
              content: (
                <>
                  <p>Two qubits are entangled when their joint state <strong className="text-q-text">cannot be written</strong> as a product of two independent qubit states:</p>
                  <div className="my-2 text-center">
                    <MathLabel math={`|\\Phi^+\\rangle = \\tfrac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)`} />
                  </div>
                  <p>This is a Bell state — qubit 0 and qubit 1 are perfectly correlated. Measuring one instantly determines the other, regardless of distance. Einstein called it "spooky action at a distance."</p>
                </>
              ),
            },
            {
              icon: '📉',
              label: 'Why do Bloch spheres go fuzzy?',
              content: (
                <>
                  <p>When qubits are entangled, the <strong className="text-q-text">reduced density matrix</strong> of each qubit — computed by "tracing out" the others — becomes <em>mixed</em>.</p>
                  <p className="mt-2">Purity <MathLabel math={`\\text{Tr}(\\rho^2)`} /> drops from 1 (pure state, on the Bloch surface) toward 0.5 (maximally mixed, at the center).</p>
                  <p className="mt-2 text-q-faint text-xs">The individual qubit Bloch arrow shortens because there's no longer a single well-defined direction — the qubit's state is statistically uncertain until the <em>other</em> qubit is also measured.</p>
                </>
              ),
            },
            {
              icon: '⚡',
              label: 'The quantum advantage',
              content: (
                <>
                  <p>In classical ML, <Fact>n</Fact> features → <Fact>n</Fact>-dimensional space. With qubits, <Fact>n</Fact> qubits → <MathLabel math={`2^n`} />-dimensional Hilbert space.</p>
                  <p className="mt-2">Entanglement lets the circuit encode correlations across this exponential space simultaneously — this is the source of potential quantum speedup.</p>
                  <CompareTable rows={[
                    { classical: 'n neurons', quantum: '2ⁿ dimensional state' },
                    { classical: 'Skip connections', quantum: 'CNOT entanglement' },
                    { classical: 'Attention (pairwise)', quantum: 'Multipartite entanglement' },
                    { classical: 'Correlation matrix', quantum: 'Density matrix ρ' },
                  ]} />
                </>
              ),
            },
          ]}
          keyInsight={
            <>
              The City Plot is <em>the</em> true representation once qubits are entangled. Each bar's height is the probability of measuring that joint basis state; its colour is the phase. Individual Bloch spheres are only projections — they lose information about the correlations between qubits.
            </>
          }
          glossary={[
            { term: 'Bell state', def: 'Maximally entangled 2-qubit state. Measuring one qubit instantly determines the other.' },
            { term: 'Density matrix ρ', def: 'A generalization of the state vector that can describe mixed (non-pure) states.' },
            { term: 'Partial trace', def: 'The operation of "tracing out" one qubit from a joint system to get the reduced state of the other.' },
            { term: 'Purity Tr(ρ²)', def: '= 1 for a pure qubit (on Bloch surface), = 0.5 for maximally mixed (entangled).' },
          ]}
        />
      </div>
    </div>
  )
}
