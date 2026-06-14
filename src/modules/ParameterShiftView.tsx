import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProbabilityHistogram } from '../components/ProbabilityHistogram'
import { CircuitBoard } from '../components/CircuitBoard'
import { Panel } from '../components/Panel'
import { TeachPanel, Fact, CompareTable } from '../components/TeachPanel'
import { MathLabel } from '../components/MathLabel'
import { useCircuitStore, useLiveStateVector } from '../store/circuitStore'
import { parameterShift, obsZ0 } from '../quantum/gradient'
import { PARAMETERIZED_GATES } from '../quantum/gates'

export function ParameterShiftView() {
  const {
    circuit, nQubits, selectedGateId, addGate, removeGate, updateGateParam, selectGate,
    setNQubits, resetCircuit,
  } = useCircuitStore()

  const sv = useLiveStateVector()
  const probs = sv.probabilities()

  const paramGates = circuit.gates.filter((g) => PARAMETERIZED_GATES.includes(g.type as any))
  const focusGateId = selectedGateId && paramGates.find((g) => g.id === selectedGateId)
    ? selectedGateId : paramGates[0]?.id ?? null
  const focusGateIdx = focusGateId ? circuit.gates.findIndex((g) => g.id === focusGateId) : -1
  const focusGate = focusGateIdx >= 0 ? circuit.gates[focusGateIdx] : null

  const [gradResult, setGradResult] = useState<ReturnType<typeof parameterShift> | null>(null)
  const [steps, setSteps] = useState(0)

  function computeGradient() {
    if (focusGateIdx < 0) return
    setGradResult(parameterShift(circuit, focusGateIdx, obsZ0))
  }

  function stepOptimizer() {
    if (focusGateIdx < 0) return
    const r = parameterShift(circuit, focusGateIdx, obsZ0)
    setGradResult(r)
    updateGateParam(focusGate!.id, (focusGate!.param ?? 0) - 0.3 * r.grad)
    setSteps((s) => s + 1)
  }

  const svPlus = gradResult?.svPlus
  const svMinus = gradResult?.svMinus

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">∇</div>
          <h2 className="text-xl font-semibold text-white">Parameter-Shift Rule</h2>
        </div>
        <p className="text-sm text-q-sub max-w-2xl leading-relaxed ml-0 sm:ml-10">
          Classical backprop can't run on quantum hardware — you can't peek at intermediate activations.
          The Parameter-Shift Rule runs the circuit twice at θ ± π/2 and subtracts to get the exact gradient.
        </p>
      </div>

      <div className="ml-0 sm:ml-10 flex flex-wrap gap-6">
        {/* Left: circuit + gradient */}
        <div className="flex flex-col gap-4 w-full sm:flex-1 sm:min-w-[380px]">
          <Panel title="Circuit"
            subtitle={focusGate ? `Computing gradient for ${focusGate.type} (θ = ${focusGate.param?.toFixed(3)})` : 'Add an RX, RY, or RZ gate'}>
            <CircuitBoard circuit={circuit} selectedGateId={selectedGateId}
              onAddGate={addGate} onRemoveGate={removeGate}
              onUpdateParam={updateGateParam} onSelect={selectGate} />
            {paramGates.length === 0 && (
              <div className="mt-3 text-xs text-amber-400 font-mono bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2">
                Add at least one RX, RY, or RZ gate to compute a gradient.
              </div>
            )}
          </Panel>

          <Panel title="Parameter-shift: three circuit evaluations" subtitle="Main circuit + two shifted variants" accent="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Main', sub: `θ = ${focusGate?.param?.toFixed(2) ?? '—'}`, probs, color: 'text-indigo-300' },
                { label: 'θ + π/2', sub: `⟨Z⟩ = ${gradResult ? gradResult.ePlus.toFixed(3) : '—'}`, probs: svPlus?.probabilities() ?? probs.map(() => 1/probs.length), color: 'text-emerald-400' },
                { label: 'θ − π/2', sub: `⟨Z⟩ = ${gradResult ? gradResult.eMinus.toFixed(3) : '—'}`, probs: svMinus?.probabilities() ?? probs.map(() => 1/probs.length), color: 'text-rose-400' },
              ].map(({ label, sub, probs: p, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <div className={`text-xs font-mono font-semibold ${color}`}>{label}</div>
                  <div className="text-[10px] font-mono text-q-faint">{sub}</div>
                  <ProbabilityHistogram probabilities={p} nQubits={nQubits} height={80} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Gradient" accent="emerald">
            <div className="flex flex-col gap-3">
              <div className="bg-q-bg/60 rounded-lg p-3">
                <MathLabel math={`\\nabla_\\theta \\mathcal{L} = \\frac{1}{2}\\bigl(\\langle Z\\rangle_{\\theta+\\pi/2} - \\langle Z\\rangle_{\\theta-\\pi/2}\\bigr)`} />
              </div>
              {gradResult && (
                <div className="text-sm font-mono text-q-sub">
                  = ½ × (<span className="text-emerald-400">{gradResult.ePlus.toFixed(3)}</span> − <span className="text-rose-400">{gradResult.eMinus.toFixed(3)}</span>) = <span className={`font-bold ${Math.abs(gradResult.grad) > 0.01 ? 'text-white' : 'text-q-faint'}`}>{gradResult.grad.toFixed(4)}</span>
                </div>
              )}
              {gradResult && (
                <div className="relative h-5 bg-q-dim rounded-full overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-q-faint">
                    θ = {focusGate?.param?.toFixed(3)}
                  </div>
                  <motion.div
                    className={`absolute top-1 bottom-1 w-2 rounded-full ${gradResult.grad > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ left: '50%' }}
                    animate={{ x: gradResult.grad > 0 ? -28 : 28 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={computeGradient} disabled={!focusGate}
                  className="flex-1 py-2 rounded-lg bg-q-dim text-sm font-mono text-indigo-300 border border-indigo-800/50 hover:bg-indigo-950/50 disabled:opacity-40 transition-all">
                  Compute gradient
                </button>
                <button onClick={stepOptimizer} disabled={!focusGate}
                  className="flex-1 py-2 rounded-lg bg-emerald-950/50 text-sm font-mono text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40 disabled:opacity-40 transition-all">
                  Step optimizer (η=0.3)
                </button>
              </div>
              {steps > 0 && <div className="text-xs font-mono text-emerald-400 text-center">{steps} optimizer step{steps > 1 ? 's' : ''} taken</div>}
            </div>
          </Panel>
        </div>

        {/* Teaching panel */}
        <TeachPanel
          sections={[
            {
              icon: '🚫',
              label: "Why can't we use backprop?",
              content: (
                <>
                  <p>Classical backpropagation needs to store intermediate activations and differentiate through them. On a quantum chip, <strong className="text-q-text">reading an intermediate state collapses it</strong> — the measurement destroys the computation.</p>
                  <p className="mt-2">There is also no "quantum tape" like PyTorch's autograd. Quantum circuits are black boxes from the perspective of the hardware — you only get output measurement results.</p>
                  <CompareTable rows={[
                    { classical: 'Autograd tape', quantum: 'No — measurement destroys state' },
                    { classical: 'Chain rule through layers', quantum: 'Parameter-shift rule per gate' },
                    { classical: '1 backward pass', quantum: '2 circuit runs per parameter' },
                    { classical: 'Exact gradient', quantum: 'Exact gradient (not estimated!)' },
                  ]} />
                </>
              ),
            },
            {
              icon: '📐',
              label: 'Why shift by exactly π/2?',
              content: (
                <>
                  <p>The expectation value of a Pauli observable through a rotation gate is a <strong className="text-q-text">sinusoidal function of θ</strong>:</p>
                  <div className="my-2 text-center">
                    <MathLabel math={`f(\\theta) = A\\sin(\\theta + \\phi) + B`} />
                  </div>
                  <p>For a sine, the derivative at any point equals the function evaluated a quarter-period (π/2) forward, minus a quarter-period backward, divided by 2. The shift of π/2 is <em>exact</em> — not an approximation like finite differences.</p>
                  <p className="mt-2 text-q-faint text-xs">This only works because quantum gates are parameterized as e^{'{'}−iθG{'}'} where G is a Pauli operator — the "generator" property guarantees sinusoidal output.</p>
                </>
              ),
            },
            {
              icon: '💡',
              label: 'Connecting to classical SGD',
              content: (
                <>
                  <p>Once you have the gradient <MathLabel math={`\\nabla_\\theta`} />, the optimizer step is identical to classical ML:</p>
                  <div className="my-2 text-center">
                    <MathLabel math={`\\theta \\leftarrow \\theta - \\eta \\cdot \\nabla_\\theta \\mathcal{L}`} />
                  </div>
                  <p>You can use Adam, SGD, or any classical optimizer. The only difference is that computing each gradient costs 2 circuit runs on hardware (or is free in simulation).</p>
                </>
              ),
            },
          ]}
          keyInsight={
            <>
              The parameter-shift gradient is <em>exact</em>, not an approximation. Classical finite differences approximate the derivative as <MathLabel math={`(f(θ+ε)-f(θ))/ε`} />. The shift rule gives the exact answer using a shift of π/2 — a remarkable property that comes directly from the sinusoidal structure of quantum gates.
            </>
          }
          glossary={[
            { term: 'Parameter-shift rule', def: '∇θf = ½(f(θ+π/2) − f(θ−π/2)). Exact gradient from 2 circuit evaluations.' },
            { term: '⟨Z⟩ (expectation value)', def: 'Average measurement outcome of the Z (Pauli-Z) operator. The "loss" we differentiate.' },
            { term: 'Generator', def: 'The Pauli operator G in U(θ)=exp(−iθG/2). Determines the sinusoidal output structure.' },
            { term: 'QNG', def: 'Quantum Natural Gradient — like Adam but accounts for the curvature of the quantum state space.' },
          ]}
        />
      </div>
    </div>
  )
}
