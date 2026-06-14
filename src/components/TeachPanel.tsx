import type { ReactNode } from 'react'
import { MathLabel } from './MathLabel'

interface TeachSection {
  icon: string
  label: string
  content: ReactNode
}

interface Props {
  sections: TeachSection[]
  keyInsight?: ReactNode
  glossary?: { term: string; def: string }[]
}

export function TeachPanel({ sections, keyInsight, glossary }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full sm:w-72 sm:flex-shrink-0">
      {sections.map(({ icon, label, content }) => (
        <div key={label} className="rounded-xl border border-q-border bg-q-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-q-sub uppercase tracking-wide">
            <span className="text-base">{icon}</span>
            {label}
          </div>
          <div className="text-sm text-q-sub leading-relaxed">{content}</div>
        </div>
      ))}

      {keyInsight && (
        <div className="rounded-xl border border-indigo-700/50 bg-indigo-950/40 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wide">
            <span>💡</span> Key Insight
          </div>
          <div className="text-sm text-indigo-200 leading-relaxed">{keyInsight}</div>
        </div>
      )}

      {glossary && glossary.length > 0 && (
        <div className="rounded-xl border border-q-border bg-q-card p-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-q-sub uppercase tracking-wide mb-1">Glossary</div>
          {glossary.map(({ term, def }) => (
            <div key={term} className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-indigo-300">{term}</span>
              <span className="text-xs text-q-faint leading-relaxed">{def}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** A small highlighted "fact chip" for inline use inside teach sections */
export function Fact({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-mono rounded px-1.5 py-0.5 mx-0.5">
      {children}
    </span>
  )
}

/** Side-by-side classical vs quantum comparison rows */
export function CompareTable({ rows }: { rows: { classical: string; quantum: string }[] }) {
  return (
    <div className="mt-2 rounded-lg border border-q-border overflow-hidden text-xs font-mono">
      <div className="grid grid-cols-2 bg-q-dim px-3 py-1.5 text-q-faint">
        <span>Classical</span><span>Quantum</span>
      </div>
      {rows.map(({ classical, quantum }) => (
        <div key={classical} className="grid grid-cols-2 px-3 py-1.5 border-t border-q-border/50">
          <span className="text-q-sub">{classical}</span>
          <span className="text-indigo-300">{quantum}</span>
        </div>
      ))}
    </div>
  )
}
