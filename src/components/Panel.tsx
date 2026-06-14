import type { ReactNode } from 'react'

interface PanelProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  accent?: 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose'
  glow?: boolean
}

const ACCENT_BORDER: Record<string, string> = {
  indigo:  'border-q-indigo/30',
  cyan:    'border-q-cyan/30',
  emerald: 'border-q-emerald/30',
  amber:   'border-q-amber/30',
  rose:    'border-q-rose/30',
}

const ACCENT_BAR: Record<string, string> = {
  indigo:  'bg-q-indigo',
  cyan:    'bg-q-cyan',
  emerald: 'bg-q-emerald',
  amber:   'bg-q-amber',
  rose:    'bg-q-rose',
}

export function Panel({ title, subtitle, children, className = '', accent = 'indigo', glow }: PanelProps) {
  return (
    <div
      className={`rounded-xl border ${ACCENT_BORDER[accent]} bg-q-card shadow-card ${glow ? 'shadow-glow-sm' : ''} ${className}`}
    >
      {(title || subtitle) && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-q-border">
          <div className={`w-0.5 h-4 rounded-full ${ACCENT_BAR[accent]}`} />
          <div>
            {title && <div className="text-sm font-semibold text-q-text">{title}</div>}
            {subtitle && <div className="text-xs text-q-faint font-mono mt-0.5">{subtitle}</div>}
          </div>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

export function InsightBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg bg-indigo-950/40 border border-indigo-800/30 px-4 py-3 text-sm text-q-sub leading-relaxed ${className}`}>
      {children}
    </div>
  )
}

export function Tag({ children, color = 'indigo' }: { children: ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50',
    cyan:   'bg-cyan-900/50 text-cyan-300 border-cyan-700/50',
    amber:  'bg-amber-900/50 text-amber-300 border-amber-700/50',
    rose:   'bg-rose-900/50 text-rose-300 border-rose-700/50',
    emerald:'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${colors[color] ?? colors.indigo}`}>
      {children}
    </span>
  )
}
