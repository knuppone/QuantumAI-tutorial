import { useMemo, useState } from 'react'
import { Panel } from '../Panel'
import { svd, lowRankApprox, frobeniusError, paramCount } from '../../quantum/tensor'
import { makeRng } from '../../quantum/rng'
import { useIsMobile } from '../../responsive/viewport'

const N = 8

// Two preset matrices with very different singular-value spectra.
const SMOOTH: number[][] = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (_, j) =>
    Math.exp(-(((i - 3.5) ** 2 + (j - 3.5) ** 2)) / 10) + 0.3 * Math.cos(i / 2) * Math.cos(j / 2),
  ),
)
const RANDOM: number[][] = (() => {
  const rng = makeRng(7)
  return Array.from({ length: N }, () => Array.from({ length: N }, () => rng() * 2 - 1))
})()

function cellColor(t: number): string {
  const c = Math.max(0, Math.min(1, t))
  const r = Math.round(13 + c * (129 - 13))
  const g = Math.round(20 + c * (140 - 20))
  const b = Math.round(36 + c * (248 - 36))
  return `rgb(${r}, ${g}, ${b})`
}

function MatrixGrid({ m, cell, min, max }: { m: number[][]; cell: number; min: number; max: number }) {
  const span = max - min || 1
  return (
    <svg width={cell * N} height={cell * N} className="block rounded">
      {m.map((row, i) =>
        row.map((v, j) => (
          <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell}
            fill={cellColor((v - min) / span)} stroke="#060b18" strokeWidth={0.5} />
        )),
      )}
    </svg>
  )
}

export function CompressionExplorer() {
  const isMobile = useIsMobile()
  const [preset, setPreset] = useState<'smooth' | 'random'>('smooth')
  const [rank, setRank] = useState(3)

  const matrix = preset === 'smooth' ? SMOOTH : RANDOM
  const spectrum = useMemo(() => svd(matrix).s, [matrix])
  const approx = useMemo(() => lowRankApprox(matrix, rank), [matrix, rank])
  const err = frobeniusError(matrix, approx)
  const total = Math.sqrt(matrix.flat().reduce((a, v) => a + v * v, 0))
  const relErr = err / (total || 1)

  const cell = isMobile ? 20 : 28
  const allVals = matrix.flat()
  const min = Math.min(...allVals)
  const max = Math.max(...allVals)

  const params = paramCount(N, N, rank)
  const full = N * N
  const ratio = full / params

  const maxS = spectrum[0] || 1

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {(['smooth', 'random'] as const).map((p) => (
          <button key={p} onClick={() => setPreset(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
              preset === p ? 'bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white shadow-glow-sm'
                : 'bg-q-dim text-q-sub border border-q-border hover:border-q-border2 hover:text-q-text'
            }`}>
            {p === 'smooth' ? 'Smooth "image"' : 'Random weights'}
          </button>
        ))}
        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <span className="text-xs font-mono text-q-faint">rank r</span>
          <input type="range" min={1} max={N} step={1} value={rank} className="flex-1"
            onChange={(e) => setRank(parseInt(e.target.value))} />
          <span className="text-xs font-mono text-fuchsia-300 w-6 text-right">{rank}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        <Panel title="Original" subtitle={`${N}×${N} = ${full} numbers`} className="flex-shrink-0">
          <MatrixGrid m={matrix} cell={cell} min={min} max={max} />
        </Panel>
        <Panel title={`Rank-${rank} reconstruction`} subtitle={`${params} numbers · ${ratio.toFixed(1)}× smaller`} className="flex-shrink-0">
          <MatrixGrid m={approx} cell={cell} min={min} max={max} />
        </Panel>

        <Panel title="Singular values" subtitle="kept (bright) vs dropped (dim)" className="w-full sm:flex-1 sm:min-w-[240px]">
          <div className="flex flex-col gap-3">
            <svg width="100%" height={110} viewBox={`0 0 ${N * 26} 110`} preserveAspectRatio="none">
              {spectrum.map((v, k) => {
                const h = (v / maxS) * 90
                const kept = k < rank
                return (
                  <g key={k}>
                    <rect x={k * 26 + 4} y={100 - h} width={18} height={h} rx={2}
                      fill={kept ? '#d946ef' : '#3b3357'} />
                    <text x={k * 26 + 13} y={108} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="JetBrains Mono, monospace">σ{k + 1}</text>
                  </g>
                )
              })}
            </svg>
            <div className="rounded-lg border border-q-border bg-q-dim/40 p-3 text-xs font-mono flex flex-col gap-1">
              <div className="flex justify-between"><span className="text-q-faint">reconstruction error</span><span className={relErr < 0.05 ? 'text-emerald-400' : 'text-amber-400'}>{(relErr * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-q-faint">parameters</span><span className="text-q-text">{params} / {full}</span></div>
              <div className="flex justify-between"><span className="text-q-faint">compression</span><span className="text-fuchsia-300">{ratio.toFixed(1)}×</span></div>
            </div>
            <p className="text-xs text-q-faint leading-relaxed">
              The smooth matrix has a fast-decaying spectrum — a few singular values capture almost everything, so
              a low rank reconstructs it with tiny error. Random weights decay slowly: every component carries
              signal, so truncation hurts. This is exactly why low-rank / tensor-network compression works on
              real (structured) model weights but not on noise.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
