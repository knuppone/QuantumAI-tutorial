import { useState } from 'react'
import { BlochSphere } from '../BlochSphere'
import { Panel } from '../Panel'
import { MathLabel } from '../MathLabel'
import { StateVector } from '../../quantum/statevector'
import { angleEmbed1Qubit, amplitudeEmbed, basisEmbed, qsampleEmbed } from '../../quantum/embedding'
import { reducedBloch } from '../../quantum/density'
import { ketLabel } from '../../quantum/circuit'
import { useIsMobile } from '../../responsive/viewport'

type Mode = 'basis' | 'angle' | 'amplitude' | 'qsample'

const MODES: { id: Mode; label: string; tagline: string }[] = [
  { id: 'basis', label: 'Basis', tagline: 'n bits → n qubits' },
  { id: 'angle', label: 'Angle', tagline: '1 feature → 1 rotation' },
  { id: 'amplitude', label: 'Amplitude', tagline: '2ⁿ values → n qubits' },
  { id: 'qsample', label: 'Qsample', tagline: 'a distribution → amplitudes' },
]

function StateBars({ sv }: { sv: StateVector }) {
  const probs = sv.probabilities()
  return (
    <div className="flex flex-col gap-2">
      {probs.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs font-mono text-indigo-300 w-10">{ketLabel(i, sv.n)}</span>
          <span className="text-xs font-mono text-q-text w-14">{sv.re[i].toFixed(3)}</span>
          <div className="flex-1 h-3 bg-q-dim rounded-sm overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-sm transition-all duration-150"
              style={{ width: `${p * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-q-faint w-12 text-right">{(p * 100).toFixed(1)}%</span>
        </div>
      ))}
      <div className="mt-1 text-xs font-mono text-q-faint flex justify-between border-t border-q-border pt-2">
        <span>Norm‖ψ‖²</span>
        <span className="text-emerald-400">{sv.norm2().toFixed(4)}</span>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-q-faint w-10">{label}</span>
      <input
        type="range" min={min} max={max} step={0.01} value={value} className="flex-1"
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="text-xs font-mono text-indigo-300 w-12 text-right">{value.toFixed(2)}</span>
    </div>
  )
}

export function EncodingExplorer() {
  const isMobile = useIsMobile()
  const [mode, setMode] = useState<Mode>('angle')
  const [bits, setBits] = useState<[number, number]>([1, 0])
  const [angle, setAngle] = useState<[number, number]>([0.5, 0.3])
  const [amps, setAmps] = useState<[number, number, number, number]>([0.6, 0.2, 0.5, 0.4])
  const [dist, setDist] = useState<[number, number, number, number]>([0.4, 0.3, 0.2, 0.1])

  let sv: StateVector
  if (mode === 'basis') sv = basisEmbed(bits)
  else if (mode === 'angle') sv = angleEmbed1Qubit(angle[0], angle[1])
  else if (mode === 'amplitude') sv = amplitudeEmbed(amps)
  else sv = qsampleEmbed(dist)

  const meta: Record<Mode, { math: string; note: string }> = {
    basis: { math: `x = (${bits.join('')})_2 \\;\\Rightarrow\\; ${ketLabel(parseInt(bits.join(''), 2), 2)}`, note: 'Literal: each classical bit becomes one qubit. Simple, but no compression — n bits cost n qubits.' },
    angle: { math: `(x, y) \\;\\Rightarrow\\; R_Y(x\\pi)R_X(y\\pi)|0\\rangle`, note: 'Each feature becomes a rotation angle. Hardware-native and the most used scheme in practice.' },
    amplitude: { math: `(a_0,\\dots,a_3) \\;\\Rightarrow\\; \\tfrac{1}{\\lVert a\\rVert}\\sum_i a_i |i\\rangle`, note: 'Exponential compression: 2ⁿ numbers fit in n qubits. But preparing the state on hardware is expensive.' },
    qsample: { math: `p(i) \\;\\Rightarrow\\; \\sum_i \\sqrt{p(i)}\\,|i\\rangle`, note: 'Encode a probability distribution so that measuring the qubits samples from it (amplitudes = √p).' },
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
              mode === m.id
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm'
                : 'bg-q-dim text-q-sub border border-q-border hover:border-q-border2 hover:text-q-text'
            }`}
          >
            {m.label} <span className="opacity-60">· {m.tagline}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        {/* Controls */}
        <Panel title="Classical input" subtitle={MODES.find((m) => m.id === mode)!.tagline} className="w-full sm:w-80">
          <div className="flex flex-col gap-3">
            {mode === 'basis' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-q-sub leading-relaxed">Flip the bits — the matching computational basis state lights up.</p>
                {bits.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => setBits(bits.map((v, j) => (j === i ? (v ? 0 : 1) : v)) as [number, number])}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-q-border bg-q-dim hover:border-q-border2"
                  >
                    <span className="text-xs font-mono text-q-faint">bit {i}</span>
                    <span className={`text-lg font-mono ${b ? 'text-emerald-400' : 'text-q-faint'}`}>{b}</span>
                  </button>
                ))}
              </div>
            )}
            {mode === 'angle' && (
              <>
                <p className="text-xs text-q-sub leading-relaxed">Two features → one qubit on the Bloch sphere.</p>
                <Slider label="x" value={angle[0]} min={-1} max={1} onChange={(v) => setAngle([v, angle[1]])} />
                <Slider label="y" value={angle[1]} min={-1} max={1} onChange={(v) => setAngle([angle[0], v])} />
              </>
            )}
            {mode === 'amplitude' && (
              <>
                <p className="text-xs text-q-sub leading-relaxed">Four numbers, auto-normalized into 2 qubits.</p>
                {amps.map((v, i) => (
                  <Slider key={i} label={`a${i}`} value={v} min={-1} max={1}
                    onChange={(nv) => setAmps(amps.map((x, j) => (j === i ? nv : x)) as [number, number, number, number])} />
                ))}
              </>
            )}
            {mode === 'qsample' && (
              <>
                <p className="text-xs text-q-sub leading-relaxed">Four probabilities (auto-normalized). Measuring samples from them.</p>
                {dist.map((v, i) => (
                  <Slider key={i} label={`p${i}`} value={v} min={0} max={1}
                    onChange={(nv) => setDist(dist.map((x, j) => (j === i ? nv : x)) as [number, number, number, number])} />
                ))}
              </>
            )}
          </div>
        </Panel>

        {/* Resulting quantum state */}
        <Panel title="Resulting quantum state" subtitle="amplitude · probability per basis state" className="w-full sm:flex-shrink-0 sm:min-w-[320px]">
          <StateBars sv={sv} />
        </Panel>

        {/* Bloch view for the single-qubit angle case */}
        {mode === 'angle' && (
          <Panel title="Bloch sphere" subtitle="the single-qubit state" className="flex-shrink-0">
            <BlochSphere bloch={reducedBloch(sv, 0)} size={isMobile ? 150 : 200} />
          </Panel>
        )}
      </div>

      <div className="rounded-lg border border-q-border bg-q-dim/40 px-4 py-3">
        <div className="text-center"><MathLabel math={meta[mode].math} block /></div>
        <p className="mt-2 text-xs text-q-faint leading-relaxed">{meta[mode].note}</p>
      </div>
    </div>
  )
}
