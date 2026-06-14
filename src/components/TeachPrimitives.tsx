import { useState, type ReactNode } from 'react'
import { MathLabel } from './MathLabel'

// ─── Definition callout ──────────────────────────────────────────────────────

export function Definition({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-950/40 px-4 py-3 my-3">
      <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-1">{title}</div>
      <div className="text-sm text-q-sub leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Quote / remark from a source book ───────────────────────────────────────

export function PaperRemark({ children, source }: { children: ReactNode; source?: string }) {
  return (
    <div className="rounded-lg border border-q-border2 bg-q-dim/60 px-4 py-3 my-3">
      <div className="text-[10px] font-semibold text-q-faint uppercase tracking-widest mb-1">
        {source ?? 'Remark from paper'}
      </div>
      <div className="text-sm text-q-sub italic leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Collapsible self-check questions ("question → answer" strings) ───────────

export function SelfCheck({ questions }: { questions: string[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!questions.length) return null
  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Self-check questions</div>
      {questions.map((q, i) => (
        <div key={i} className="rounded-lg border border-q-border bg-q-card overflow-hidden">
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-q-sub hover:text-q-text flex items-center justify-between gap-2 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>Q{i + 1}: {q.split('→')[0]}</span>
            <span className="text-q-faint text-xs">{open === i ? '▲' : '▼'}</span>
          </button>
          {open === i && q.includes('→') && (
            <div className="px-4 pb-3 pt-1 text-xs text-emerald-300 border-t border-q-border bg-emerald-950/20 leading-relaxed">
              {q.split('→')[1].trim()}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Inline page-reference chip ──────────────────────────────────────────────

export function PageRef({ pages }: { pages: string }) {
  return (
    <span className="ml-1 text-[10px] font-mono text-q-faint bg-q-dim px-1.5 py-0.5 rounded">p. {pages}</span>
  )
}

// ─── Intuition-first equation: block math + a plain-English gloss ────────────

export function Equation({ math, gloss }: { math: string; gloss: ReactNode }) {
  return (
    <div className="my-3 rounded-lg border border-q-border bg-q-dim/40 px-4 py-3">
      <div className="text-center">
        <MathLabel math={math} block />
      </div>
      <div className="mt-2 flex items-start gap-2 text-xs text-q-faint leading-relaxed">
        <span className="text-indigo-400 font-mono shrink-0">read this as</span>
        <span>{gloss}</span>
      </div>
    </div>
  )
}

// ─── "≈ classical: X" analogy chip ──────────────────────────────────────────

export function AnalogyChip({ ml, qml }: { ml: string; qml?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-q-dim border border-q-border text-q-faint">
      <span className="text-amber-400/80">≈ {ml}</span>
      {qml && (
        <>
          <span className="opacity-40">→</span>
          <span className="text-indigo-300">{qml}</span>
        </>
      )}
    </span>
  )
}

// ─── Source provenance chips (which book a lesson draws from) ────────────────

export function BookRef({ book, where }: { book: 'A' | 'B' | 'C'; where: string }) {
  const label = book === 'A' ? 'Schuld & Petruccione' : book === 'B' ? 'Du et al. 2025' : 'Applied practice'
  const color = book === 'A'
    ? 'bg-violet-950/40 text-violet-300 border-violet-800/40'
    : book === 'B'
    ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${color}`}>
      {label} · {where}
    </span>
  )
}
