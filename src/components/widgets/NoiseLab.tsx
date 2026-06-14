import { useState } from 'react'
import { Panel } from '../Panel'
import { noisyExpectation, sampleExpectation, zeroNoiseExtrapolate } from '../../quantum/noise'
import { makeRng } from '../../quantum/rng'

const IDEAL = 0.8 // noise-free ⟨Z⟩ of a tiny reference circuit
const MAX_DEPTH = 200
const SHOTS = [16, 64, 256, 1024, 4096]
const W = 320, H = 140

export function NoiseLab() {
  const [depth, setDepth] = useState(60)
  const [lambda, setLambda] = useState(0.008)
  const [shotIdx, setShotIdx] = useState(2)
  const [zne, setZne] = useState(false)
  const [seed, setSeed] = useState(1)

  const shots = SHOTS[shotIdx]
  const noisy = noisyExpectation(IDEAL, lambda, depth)

  // shot-sampled estimate of the noisy value (±1 observable)
  const p0 = (1 + noisy) / 2
  const sampled = sampleExpectation([p0, 1 - p0], [1, -1], shots, makeRng(seed * 131 + depth))
  const shotErr = 1 / Math.sqrt(shots)

  // decay curve points
  const curve = Array.from({ length: 41 }, (_, k) => {
    const d = (k / 40) * MAX_DEPTH
    return { d, v: noisyExpectation(IDEAL, lambda, d) }
  })
  const xOf = (d: number) => (d / MAX_DEPTH) * W
  const yOf = (v: number) => H - v * H

  // ZNE: amplify noise by factors 1,2,3
  const zneFactors = [1, 2, 3]
  const znePoints = zneFactors.map((f) => ({ x: f, y: noisyExpectation(IDEAL, lambda, depth * f) }))
  const zneValue = zeroNoiseExtrapolate(znePoints)

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <Panel title="Signal vs circuit depth" subtitle="noise eats the expectation value" className="flex-shrink-0">
        <svg width={W} height={H + 18} className="block">
          {/* axes */}
          <line x1={0} y1={H} x2={W} y2={H} stroke="#1e293b" strokeWidth={1} />
          {/* ideal line */}
          <line x1={0} y1={yOf(IDEAL)} x2={W} y2={yOf(IDEAL)} stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
          <text x={2} y={yOf(IDEAL) - 3} fontSize={8} fill="#64748b" fontFamily="JetBrains Mono, monospace">ideal {IDEAL}</text>
          {/* decay curve */}
          <polyline fill="none" stroke="#22d3ee" strokeWidth={2}
            points={curve.map((c) => `${xOf(c.d)},${yOf(c.v)}`).join(' ')} />
          {/* current depth marker */}
          <line x1={xOf(depth)} y1={0} x2={xOf(depth)} y2={H} stroke="#6366f1" strokeWidth={1} strokeOpacity={0.4} />
          {/* sampled estimate with shot error bar */}
          <line x1={xOf(depth)} y1={yOf(sampled - shotErr)} x2={xOf(depth)} y2={yOf(sampled + shotErr)} stroke="#f59e0b" strokeWidth={2} />
          <circle cx={xOf(depth)} cy={yOf(sampled)} r={4} fill="#f59e0b" />
          <text x={W / 2} y={H + 15} textAnchor="middle" fontSize={9} fill="#475569" fontFamily="JetBrains Mono, monospace">circuit depth (gates) →</text>
        </svg>
      </Panel>

      <Panel title="Controls" className="w-full sm:flex-1 sm:min-w-[260px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-q-faint w-16">depth</span>
            <input type="range" min={0} max={MAX_DEPTH} step={1} value={depth} className="flex-1" onChange={(e) => setDepth(parseInt(e.target.value))} />
            <span className="text-xs font-mono text-indigo-300 w-10 text-right">{depth}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-q-faint w-16">noise λ</span>
            <input type="range" min={0} max={0.03} step={0.001} value={lambda} className="flex-1" onChange={(e) => setLambda(parseFloat(e.target.value))} />
            <span className="text-xs font-mono text-rose-300 w-10 text-right">{lambda.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-q-faint w-16">shots</span>
            <input type="range" min={0} max={SHOTS.length - 1} step={1} value={shotIdx} className="flex-1" onChange={(e) => setShotIdx(parseInt(e.target.value))} />
            <span className="text-xs font-mono text-amber-300 w-10 text-right">{shots}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSeed((s) => s + 1)} className="px-3 py-1 rounded-full text-xs font-mono bg-q-dim text-q-faint border border-q-border hover:text-q-sub transition-all">🎲 Resample shots</button>
            <button onClick={() => setZne((z) => !z)} className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${zne ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50' : 'bg-q-dim text-q-faint border-q-border hover:text-q-sub'}`}>ZNE {zne ? 'on' : 'off'}</button>
          </div>

          <div className="rounded-lg border border-q-border bg-q-dim/40 p-3 text-xs font-mono flex flex-col gap-1">
            <div className="flex justify-between"><span className="text-q-faint">true (noise-free)</span><span className="text-q-text">{IDEAL.toFixed(3)}</span></div>
            <div className="flex justify-between"><span className="text-q-faint">noisy value</span><span className="text-rose-300">{noisy.toFixed(3)}</span></div>
            <div className="flex justify-between"><span className="text-q-faint">shot estimate</span><span className="text-amber-300">{sampled.toFixed(3)} ± {shotErr.toFixed(2)}</span></div>
            {zne && <div className="flex justify-between"><span className="text-q-faint">ZNE extrapolated</span><span className="text-emerald-400">{zneValue.toFixed(3)}</span></div>}
          </div>

          {zne && (
            <div className="rounded-lg border border-q-border bg-q-bg/60 p-3">
              <div className="text-[10px] font-mono text-q-faint mb-1">Zero-noise extrapolation — measure at noise ×1,2,3, fit, read x=0</div>
              <svg width="100%" height={90} viewBox="0 0 220 90">
                <line x1={20} y1={75} x2={210} y2={75} stroke="#1e293b" />
                {/* ideal target */}
                <line x1={20} y1={75 - IDEAL * 60} x2={210} y2={75 - IDEAL * 60} stroke="#334155" strokeDasharray="3 3" />
                {/* fitted line through intercept and factor-3 point */}
                {(() => {
                  const xf = (f: number) => 20 + (f / 3) * 190
                  const yf = (v: number) => 75 - v * 60
                  const slope = (znePoints[2].y - zneValue) / 3
                  return <line x1={xf(0)} y1={yf(zneValue)} x2={xf(3)} y2={yf(zneValue + slope * 3)} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" />
                })()}
                {znePoints.map((pt, i) => (
                  <circle key={i} cx={20 + (pt.x / 3) * 190} cy={75 - pt.y * 60} r={3.5} fill="#f59e0b" />
                ))}
                <circle cx={20} cy={75 - zneValue * 60} r={4} fill="#10b981" />
                <text x={20} y={88} fontSize={8} fill="#64748b" fontFamily="JetBrains Mono, monospace">x=0</text>
              </svg>
            </div>
          )}

          <p className="text-xs text-q-faint leading-relaxed">
            Each gate adds error, so the signal decays ~e<sup>−λ·depth</sup> — beyond ~100–200 gates it is buried.
            Fewer shots make the estimate jitter (error ~1/√shots). Zero-noise extrapolation deliberately amplifies
            the noise, then extrapolates back to zero to claw the true value back — mitigation without full error correction.
          </p>
        </div>
      </Panel>
    </div>
  )
}
