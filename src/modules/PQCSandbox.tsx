import { CircuitBoard } from '../components/CircuitBoard'
import { ProbabilityHistogram } from '../components/ProbabilityHistogram'
import { Panel, InsightBox } from '../components/Panel'
import { TeachPanel, Fact, CompareTable } from '../components/TeachPanel'
import { MathLabel } from '../components/MathLabel'
import { useCircuitStore, useLiveStateVector } from '../store/circuitStore'

export function PQCSandbox() {
  const {
    nQubits, circuit, selectedGateId,
    addGate, removeGate, updateGateParam, selectGate, setNQubits, resetCircuit,
  } = useCircuitStore()

  const sv = useLiveStateVector()
  const probs = sv.probabilities()

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">⊕</div>
          <h2 className="text-xl font-semibold text-white">Parameterized Quantum Circuit</h2>
        </div>
        <p className="text-sm text-q-sub max-w-2xl leading-relaxed ml-0 sm:ml-10">
          The quantum analogue of a neural network layer. Each gate with a θ parameter is a trainable weight.
          Drag gates onto the circuit, select one, then move its θ slider — the output histogram responds instantly.
        </p>
      </div>

      {/* Qubit selector + reset */}
      <div className="ml-0 sm:ml-10 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-q-faint">Qubits</span>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setNQubits(n)}
              className={`w-8 h-8 rounded-lg font-mono text-sm transition-all ${
                nQubits === n
                  ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-glow-sm'
                  : 'bg-q-dim text-q-faint border border-q-border hover:border-q-border2 hover:text-q-text'
              }`}
            >{n}</button>
          ))}
        </div>
        <button onClick={resetCircuit}
          className="px-3 py-1.5 rounded-lg text-xs font-mono text-q-faint border border-q-border hover:border-q-border2 hover:text-q-sub transition-all">
          Clear circuit
        </button>
      </div>

      <div className="ml-0 sm:ml-10 flex flex-wrap gap-6">
        {/* Circuit + output */}
        <div className="flex flex-col gap-4 w-full sm:flex-1 sm:min-w-[420px]">
          <Panel title="Circuit" subtitle="Drag gates from palette → click cell to place · right-click to remove">
            <CircuitBoard circuit={circuit} selectedGateId={selectedGateId}
              onAddGate={addGate} onRemoveGate={removeGate}
              onUpdateParam={updateGateParam} onSelect={selectGate} />
          </Panel>

          <div className="flex gap-4 flex-wrap">
            <Panel title="Output |ψ⟩" subtitle="Probability per basis state" accent="indigo" className="w-full sm:flex-1 sm:min-w-[200px]">
              <ProbabilityHistogram probabilities={probs} nQubits={nQubits} height={140} />
            </Panel>

            <Panel title="Amplitudes" subtitle="Complex state vector" accent="indigo" className="w-full sm:w-64">
              <div className="flex flex-col gap-1.5">
                {probs.map((p, i) => {
                  const label = '|' + i.toString(2).padStart(nQubits, '0') + '⟩'
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-indigo-300 w-14">{label}</span>
                      <span className="text-q-text w-14">{sv.re[i].toFixed(3)}</span>
                      <span className="text-q-faint w-16">{sv.im[i] >= 0 ? '+' : ''}{sv.im[i].toFixed(3)}i</span>
                      <div className="flex-1 h-1.5 bg-q-dim rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-150" style={{ width: `${p * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </div>
        </div>

        {/* Teaching panel */}
        <TeachPanel
          sections={[
            {
              icon: '🚪',
              label: 'What is a quantum gate?',
              content: (
                <>
                  <p>A gate is a <strong className="text-q-text">unitary matrix</strong> — it rotates the quantum state without information loss (unlike classical activation functions, which are irreversible).</p>
                  <p className="mt-2">Single-qubit gates act on one qubit's 2D space. Two-qubit gates like <Fact>CNOT</Fact> act on the 4D joint space of two qubits.</p>
                  <CompareTable rows={[
                    { classical: 'Weight matrix W', quantum: 'Unitary gate U(θ)' },
                    { classical: 'Wx (matrix multiply)', quantum: 'U(θ)|ψ⟩ (gate application)' },
                    { classical: 'ReLU (irreversible)', quantum: 'Unitary (always reversible)' },
                    { classical: 'Bias term', quantum: 'Phase shift gate (RZ)' },
                  ]} />
                </>
              ),
            },
            {
              icon: '🎚️',
              label: 'Why parameterize gates?',
              content: (
                <>
                  <p>Fixed gates like <Fact>H</Fact> and <Fact>CNOT</Fact> perform specific, hardwired operations. Parameterized gates — <Fact>RX(θ)</Fact>, <Fact>RY(θ)</Fact>, <Fact>RZ(θ)</Fact> — are <strong className="text-q-text">continuously adjustable</strong>.</p>
                  <p className="mt-2">Optimizing θ is exactly like training weights. The circuit's output distribution changes smoothly as θ changes — that's what lets gradient-based optimization work.</p>
                  <div className="mt-2 text-center">
                    <MathLabel math={`R_Y(\\theta) = \\begin{pmatrix} \\cos\\frac{\\theta}{2} & -\\sin\\frac{\\theta}{2} \\\\ \\sin\\frac{\\theta}{2} & \\cos\\frac{\\theta}{2} \\end{pmatrix}`} />
                  </div>
                </>
              ),
            },
            {
              icon: '🔗',
              label: 'Gate reference',
              content: (
                <div className="flex flex-col gap-1 text-xs font-mono">
                  {[
                    { g: 'H', desc: 'Creates superposition: |0⟩ → (|0⟩+|1⟩)/√2' },
                    { g: 'X', desc: 'Bit flip: |0⟩ ↔ |1⟩ (quantum NOT)' },
                    { g: 'Z', desc: 'Phase flip: |1⟩ → −|1⟩' },
                    { g: 'RY(θ)', desc: 'Rotates around Y-axis by θ radians' },
                    { g: 'RX(θ)', desc: 'Rotates around X-axis by θ radians' },
                    { g: 'CNOT', desc: 'Flips target if control = |1⟩ — creates entanglement' },
                  ].map(({ g, desc }) => (
                    <div key={g} className="flex gap-2">
                      <span className="text-indigo-300 w-14 flex-shrink-0">{g}</span>
                      <span className="text-q-faint">{desc}</span>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
          keyInsight={
            <>
              A PQC is universal: given enough layers, any quantum operation can be approximated. This is the quantum analogue of the universal approximation theorem for neural networks — deep enough PQCs can represent any unitary transformation.
            </>
          }
          glossary={[
            { term: 'Unitary', def: 'A matrix U where U†U = I. Preserves probabilities and is always invertible.' },
            { term: 'PQC', def: 'Parameterized Quantum Circuit — a circuit with tunable rotation angles used as a trainable model.' },
            { term: 'Expressibility', def: 'How well a PQC can approximate arbitrary quantum states. More layers = more expressive.' },
            { term: 'Circuit depth', def: 'The number of sequential gate layers. Deep circuits are more expressive but harder to train.' },
          ]}
        />
      </div>
    </div>
  )
}
