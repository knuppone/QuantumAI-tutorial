import { useMemo, useState } from 'react'
import { Panel } from '../Panel'
import { ProbabilityHistogram } from '../ProbabilityHistogram'
import { maxCutQubo, allEnergies, bruteForceMin, qaoaState, qaoaExpectedCost, indexToBits } from '../../quantum/optimization'

// Ring + chord graphs for n = 4, 5, 6.
const GRAPHS: Record<number, [number, number][]> = {
  4: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
  5: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]],
  6: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4]],
}

export function OptimizationPlayground() {
  const [n, setN] = useState(4)
  const [gamma, setGamma] = useState(0.8)
  const [beta, setBeta] = useState(0.5)
  const [p, setP] = useState(1)

  const edges = GRAPHS[n]
  const Q = useMemo(() => maxCutQubo(edges, n), [edges, n])
  const energies = useMemo(() => allEnergies(Q), [Q])
  const opt = useMemo(() => bruteForceMin(Q), [Q])
  const mean = energies.reduce((a, b) => a + b, 0) / energies.length

  const gammas = Array(p).fill(gamma)
  const betas = Array(p).fill(beta)
  const probs = qaoaState(energies, gammas, betas).probabilities()
  const expected = qaoaExpectedCost(energies, gammas, betas)

  // approximation ratio in terms of cut value (= −energy)
  const ratio = opt.energy < 0 ? expected / opt.energy : 0
  const bestIdx = probs.reduce((bi, pVal, i) => (pVal > probs[bi] ? i : bi), 0)
  const bestBits = indexToBits(bestIdx, n)

  function optimize() {
    let bg = gamma, bb = beta, best = Infinity
    for (let gi = 0; gi <= 20; gi++) {
      for (let bi = 0; bi <= 20; bi++) {
        const g = (gi / 20) * Math.PI
        const b = (bi / 20) * (Math.PI / 2)
        const c = qaoaExpectedCost(energies, Array(p).fill(g), Array(p).fill(b))
        if (c < best) { best = c; bg = g; bb = b }
      }
    }
    setGamma(bg); setBeta(bb)
  }
  function randomize() {
    setGamma(Math.round(Math.random() * 100) / 100 * Math.PI)
    setBeta(Math.round(Math.random() * 100) / 100 * (Math.PI / 2))
  }

  // node layout on a circle
  const R = 70, cx = 90, cy = 90
  const pos = Array.from({ length: n }, (_, k) => {
    const a = (2 * Math.PI * k) / n - Math.PI / 2
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-q-faint">nodes</span>
          {[4, 5, 6].map((v) => (
            <button key={v} onClick={() => setN(v)}
              className={`w-7 h-7 rounded-lg text-xs font-mono transition-all ${
                n === v ? 'bg-gradient-to-br from-fuchsia-600 to-amber-600 text-white' : 'bg-q-dim text-q-faint border border-q-border'
              }`}>{v}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-q-faint">layers p</span>
          {[1, 2, 3].map((v) => (
            <button key={v} onClick={() => setP(v)}
              className={`w-7 h-7 rounded-lg text-xs font-mono transition-all ${
                p === v ? 'bg-amber-600 text-white' : 'bg-q-dim text-q-faint border border-q-border'
              }`}>{v}</button>
          ))}
        </div>
        <button onClick={optimize} className="px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/50 transition-all">⚙ Optimize angles</button>
        <button onClick={randomize} className="px-3 py-1.5 rounded-full text-xs font-mono bg-q-dim text-q-faint border border-q-border hover:text-q-sub transition-all">🎲 Random</button>
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        <Panel title="Problem graph" subtitle="nodes coloured by the best bit-string" className="flex-shrink-0">
          <svg width={180} height={180}>
            {edges.map(([i, j], k) => {
              const cut = bestBits[i] !== bestBits[j]
              return <line key={k} x1={pos[i].x} y1={pos[i].y} x2={pos[j].x} y2={pos[j].y}
                stroke={cut ? '#10b981' : '#334155'} strokeWidth={cut ? 2.5 : 1.5} strokeDasharray={cut ? '' : '3 3'} />
            })}
            {pos.map((pt, k) => (
              <g key={k}>
                <circle cx={pt.x} cy={pt.y} r={13} fill={bestBits[k] ? '#d946ef' : '#22d3ee'} stroke="#0b1120" strokeWidth={2} />
                <text x={pt.x} y={pt.y + 4} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#0b1120" fontWeight="bold">{k}</text>
              </g>
            ))}
          </svg>
          <div className="text-[10px] font-mono text-q-faint mt-1 text-center">green = cut edge · cut = {(-expected).toFixed(2)} / max {(-opt.energy).toFixed(0)}</div>
        </Panel>

        <Panel title="QAOA controls & output" className="w-full sm:flex-1 sm:min-w-[280px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-q-faint w-8">γ</span>
              <input type="range" min={0} max={Math.PI} step={0.01} value={gamma} className="flex-1" onChange={(e) => setGamma(parseFloat(e.target.value))} />
              <span className="text-xs font-mono text-fuchsia-300 w-10 text-right">{gamma.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-q-faint w-8">β</span>
              <input type="range" min={0} max={Math.PI / 2} step={0.01} value={beta} className="flex-1" onChange={(e) => setBeta(parseFloat(e.target.value))} />
              <span className="text-xs font-mono text-amber-300 w-10 text-right">{beta.toFixed(2)}</span>
            </div>

            <ProbabilityHistogram probabilities={probs} nQubits={n} height={90} highlightIndex={opt.index} />

            <div className="rounded-lg border border-q-border bg-q-dim/40 p-3 text-xs font-mono flex flex-col gap-1">
              <div className="flex justify-between"><span className="text-q-faint">expected cost ⟨C⟩</span><span className="text-q-text">{expected.toFixed(3)}</span></div>
              <div className="flex justify-between"><span className="text-q-faint">uniform baseline</span><span className="text-q-faint">{mean.toFixed(3)}</span></div>
              <div className="flex justify-between"><span className="text-q-faint">optimum C*</span><span className="text-emerald-400">{opt.energy.toFixed(3)}</span></div>
              <div className="flex justify-between"><span className="text-q-faint">approx ratio</span><span className={ratio > 0.9 ? 'text-emerald-400' : 'text-amber-400'}>{(ratio * 100).toFixed(0)}%</span></div>
            </div>
            <p className="text-xs text-q-faint leading-relaxed">
              The cost layer phases each bit-string by its energy; the mixer spreads amplitude between them. Tune γ/β
              (or hit Optimize) and the distribution concentrates on low-cost (high-cut) strings — beating the uniform
              baseline. Brute force is 2ⁿ; QAOA's circuit only grows linearly in n.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
