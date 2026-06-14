import { motion } from 'framer-motion'
import { ProbabilityHistogram } from '../components/ProbabilityHistogram'
import { CircuitBoard } from '../components/CircuitBoard'
import { Panel } from '../components/Panel'
import { TeachPanel, Fact, CompareTable } from '../components/TeachPanel'
import { MathLabel } from '../components/MathLabel'
import { useCircuitStore, useLiveStateVector } from '../store/circuitStore'
import { allKetLabels } from '../quantum/circuit'

function WaveViz({ probs, collapsed }: { probs: number[]; collapsed: number | null }) {
  const n = probs.length
  const W = 320
  const H = 72
  const labels = allKetLabels(Math.round(Math.log2(n)))
  const bars = probs.map((p, i) => ({ x: (i + 0.5) * (W / n), h: Math.sqrt(p) * H * 0.85, p }))

  if (collapsed !== null) {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-2 py-4">
        <div className="text-4xl font-mono font-bold text-indigo-300 text-glow-indigo">{labels[collapsed]}</div>
        <div className="text-xs text-q-faint font-mono">wave function collapsed</div>
      </motion.div>
    )
  }

  return (
    <svg width={W} height={H + 20} className="overflow-visible">
      <motion.path
        d={`M ${bars[0].x} ${H / 2} ` + bars.map((b) => `L ${b.x} ${H / 2 - b.h}`).join(' ') + ` L ${bars[n-1].x} ${H / 2} ` + bars.slice().reverse().map((b) => `L ${b.x} ${H / 2 + b.h}`).join(' ') + ' Z'}
        fill="#4f46e5" fillOpacity={0.2}
        animate={{ fillOpacity: [0.15, 0.3, 0.15] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      />
      <motion.polyline points={bars.map((b) => `${b.x},${H / 2 - b.h}`).join(' ')}
        fill="none" stroke="#818cf8" strokeWidth={2}
        animate={{ strokeOpacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
      {bars.map(({ x, h }, i) => (
        <motion.line key={i} x1={x} x2={x} y1={H / 2 - h} y2={H / 2 + h} stroke="#6366f1" strokeWidth={2}
          animate={{ y1: [H / 2 - h * 0.85, H / 2 - h * 1.1, H / 2 - h * 0.85] }}
          transition={{ repeat: Infinity, duration: 1.6 + i * 0.18, ease: 'easeInOut' }}
        />
      ))}
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#1a2744" strokeWidth={1} />
      {labels.map((l, i) => (
        <text key={i} x={bars[i]?.x ?? 0} y={H + 16} textAnchor="middle" fill="#475569" fontSize={9} fontFamily="JetBrains Mono, monospace">{l}</text>
      ))}
    </svg>
  )
}

export function MeasurementReactor() {
  const {
    nQubits, circuit, shots, selectedGateId, addGate, removeGate, updateGateParam, selectGate,
    setNQubits, resetCircuit, setShots, measure, resetMeasurement, measurementCounts, collapsedState,
  } = useCircuitStore()

  const sv = useLiveStateVector()
  const probs = sv.probabilities()

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">◎</div>
          <h2 className="text-xl font-semibold text-white">Measurement & Wave Collapse</h2>
        </div>
        <p className="text-sm text-q-sub max-w-2xl leading-relaxed ml-0 sm:ml-10">
          In transformers, the output is a Softmax distribution you can read directly. In quantum computing,
          measurement <em className="text-q-text not-italic font-medium">destroys</em> the superposition.
          The shots slider shows how statistical noise becomes a clean distribution.
        </p>
      </div>

      <div className="ml-0 sm:ml-10 flex flex-wrap gap-6">
        {/* Circuit */}
        <Panel title="Circuit" className="w-full sm:flex-1 sm:min-w-[380px]">
          <CircuitBoard circuit={circuit} selectedGateId={selectedGateId}
            onAddGate={addGate} onRemoveGate={removeGate}
            onUpdateParam={updateGateParam} onSelect={selectGate} />
        </Panel>

        {/* Controls + histogram */}
        <div className="flex flex-col gap-4 w-full sm:w-80">
          <Panel title="Quantum superposition |ψ⟩" accent="cyan" glow={!collapsedState && probs.some(p => p > 0.01 && p < 0.99)}>
            <div className="flex flex-col items-center gap-4">
              <WaveViz probs={probs} collapsed={collapsedState ?? null} />
              <motion.button onClick={measure} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-sm shadow-glow-sm transition-all">
                ⚡ MEASURE
              </motion.button>
              {collapsedState !== null && (
                <button onClick={resetMeasurement} className="text-xs text-q-faint hover:text-q-sub font-mono underline underline-offset-2 transition-colors">
                  Reset superposition
                </button>
              )}
            </div>
          </Panel>

          <Panel title="Shots (circuit executions)" subtitle="Low = noisy · High = converged" accent="cyan">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-q-faint">Number of samples</span>
                <span className="text-sm font-mono font-bold text-indigo-300">{shots.toLocaleString()}</span>
              </div>
              <input type="range" min={1} max={4096} step={1} value={shots}
                onChange={(e) => setShots(parseInt(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] font-mono text-q-faint">
                <span>1 shot (random)</span><span>4096 shots (converged)</span>
              </div>
              {shots <= 20 && (
                <div className="text-xs text-amber-400 bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2">
                  With {shots} shot{shots > 1 ? 's' : ''}, each MEASURE gives a different result — quantum randomness in action.
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Theory vs shots" accent="cyan">
            <ProbabilityHistogram probabilities={probs} counts={measurementCounts} nQubits={nQubits} highlightIndex={collapsedState ?? undefined} height={110} />
          </Panel>
        </div>

        {/* Teaching panel */}
        <TeachPanel
          sections={[
            {
              icon: '📐',
              label: 'The Born rule',
              content: (
                <>
                  <p>Measurement probabilities come from the <strong className="text-q-text">Born rule</strong> — the probability of observing basis state |i⟩ is the squared magnitude of its amplitude:</p>
                  <div className="my-2 text-center">
                    <MathLabel math={`P(i) = |\\langle i | \\psi \\rangle|^2 = |\\alpha_i|^2`} />
                  </div>
                  <p>The heights in the histogram above are these probabilities. The animated wave shows the amplitudes — you're seeing the square root of the bar heights.</p>
                </>
              ),
            },
            {
              icon: '💥',
              label: 'Why measurement destroys the state',
              content: (
                <>
                  <p>Before measurement, the qubit is in superposition — <em>genuinely</em> in multiple states at once. The instant you measure, the wave function <strong className="text-q-text">collapses</strong> to one definite outcome.</p>
                  <p className="mt-2">This isn't a technical limitation — it's a fundamental feature of quantum mechanics. You can't <em>peek</em> at an intermediate quantum state without changing it.</p>
                  <p className="mt-2 text-q-faint text-xs">This is why we can't use classical backprop on a quantum chip: reading gradients mid-circuit would collapse the computation.</p>
                </>
              ),
            },
            {
              icon: '🎰',
              label: 'Why we need many shots',
              content: (
                <>
                  <p>A single measurement gives a random outcome drawn from the probability distribution. To <em>estimate</em> the distribution, you run the circuit many times (shots) and count outcomes.</p>
                  <CompareTable rows={[
                    { classical: 'Forward pass → deterministic', quantum: 'Measurement → random sample' },
                    { classical: 'Softmax → read directly', quantum: 'Must average over many shots' },
                    { classical: '1 pass = full distribution', quantum: '~1000 shots = ~1% accuracy' },
                  ]} />
                  <p className="mt-2 text-q-faint text-xs">The shot count needed grows as 1/ε² to achieve error ε in the estimated probability — the same as Monte Carlo sampling.</p>
                </>
              ),
            },
          ]}
          keyInsight={
            <>
              The <em>amplitude</em> <MathLabel math={`\\alpha`} /> is complex and carries phase information. The <em>probability</em> <MathLabel math={`|\\alpha|^2`} /> is real and what you actually observe. Most of the quantum information — the phase — is invisible to measurement but shapes interference and computation.
            </>
          }
          glossary={[
            { term: 'Born rule', def: 'P(i) = |αᵢ|². The fundamental postulate connecting amplitudes to observable probabilities.' },
            { term: 'Wave function collapse', def: 'The irreversible transition from superposition to a definite classical outcome upon measurement.' },
            { term: 'Shot', def: 'One execution of the full circuit followed by a measurement. Multiple shots estimate the output distribution.' },
            { term: 'Shot noise', def: 'Statistical error in estimated probabilities from a finite number of shots. Scales as 1/√shots.' },
          ]}
        />
      </div>
    </div>
  )
}
