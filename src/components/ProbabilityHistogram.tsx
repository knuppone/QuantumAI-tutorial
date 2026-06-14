import { motion } from 'framer-motion'
import { allKetLabels } from '../quantum/circuit'

interface Props {
  probabilities: number[]
  counts?: number[] | null
  nQubits: number
  highlightIndex?: number | null
  height?: number
}

export function ProbabilityHistogram({ probabilities, counts, nQubits, highlightIndex, height = 120 }: Props) {
  const labels = allKetLabels(nQubits)
  const total = counts ? counts.reduce((a, b) => a + b, 0) : 0
  const maxProb = Math.max(...probabilities, 0.001)

  return (
    <div className="w-full select-none">
      <div className="flex items-end gap-1" style={{ height }}>
        {probabilities.map((p, i) => {
          const countFrac = counts && total > 0 ? counts[i] / total : null
          const isHighlighted = highlightIndex === i
          const pct = p / maxProb
          const isSignificant = p > 0.001

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
              {/* Value label above bar */}
              <div className={`text-[9px] font-mono mb-0.5 transition-all duration-200 ${
                isHighlighted ? 'text-indigo-300 font-semibold' : 'text-q-faint'
              }`}>
                {isSignificant ? `${(p * 100).toFixed(0)}%` : ''}
              </div>
              {/* Bar container */}
              <div className="relative w-full" style={{ height: height - 28 }}>
                {/* Theory bar — gradient */}
                <motion.div
                  className={`absolute bottom-0 w-full rounded-t-sm overflow-hidden`}
                  animate={{ height: `${Math.max(pct * 100, isSignificant ? 2 : 0)}%` }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                >
                  <div
                    className={`w-full h-full ${
                      isHighlighted
                        ? 'bg-gradient-to-t from-indigo-700 to-indigo-400'
                        : 'bg-gradient-to-t from-indigo-800/90 to-indigo-500/80'
                    }`}
                  />
                  {/* Glow line on top */}
                  <div className={`absolute top-0 left-0 right-0 h-px ${
                    isHighlighted ? 'bg-indigo-300 shadow-glow-sm' : 'bg-indigo-500/60'
                  }`} />
                </motion.div>

                {/* Shot count overlay */}
                {countFrac !== null && (
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-sm overflow-hidden"
                    animate={{ height: `${Math.max(countFrac / maxProb * 100, countFrac > 0 ? 2 : 0)}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-emerald-700/50 to-emerald-400/50" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-emerald-400/80" />
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Baseline */}
      <div className="h-px bg-q-border mx-0 mt-1" />

      {/* Ket labels */}
      <div className="flex gap-1 mt-1">
        {labels.map((l, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-[10px] font-mono truncate transition-colors ${
              highlightIndex === i ? 'text-indigo-300 font-medium' : 'text-q-faint'
            }`}
          >
            {l}
          </div>
        ))}
      </div>

      {/* Legend */}
      {counts && (
        <div className="flex gap-3 mt-2 text-[11px] text-q-faint font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-indigo-800 to-indigo-500 inline-block" />
            Theory
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/50 border-t border-emerald-400 inline-block" />
            Shots ({total.toLocaleString()})
          </span>
        </div>
      )}
    </div>
  )
}
