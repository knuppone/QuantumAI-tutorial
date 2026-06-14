import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmbeddingDock } from './modules/EmbeddingDock'
import { PQCSandbox } from './modules/PQCSandbox'
import { EntanglementView } from './modules/EntanglementView'
import { MeasurementReactor } from './modules/MeasurementReactor'
import { ParameterShiftView } from './modules/ParameterShiftView'
import { BarrenPlateauSim } from './modules/BarrenPlateauSim'
import { StudyGuide } from './modules/StudyGuide'
import { CourseShell } from './course/CourseShell'
import { UNITS, LESSONS, firstLessonId, lessonById } from './course/curriculum'
import { useProgressStore } from './course/progressStore'
import { useIsMobile } from './responsive/viewport'
import { NavDrawer } from './responsive/NavDrawer'
import { MobileToggle } from './responsive/MobileToggle'

interface ModuleDef {
  id: string
  num: string
  title: string
  subtitle: string
  icon: string
  classicalAnalogy: string
  description: string
  color: string
  component: React.ComponentType
}

const MODULES: ModuleDef[] = [
  {
    id: 'embedding', num: '01',
    title: 'Embedding',
    subtitle: 'Classical → Quantum',
    icon: '⟩',
    classicalAnalogy: 'Tokenization / normalization',
    description: 'Drag a 2D data point and watch it rotate the Bloch sphere in real time via Angle or Amplitude embedding.',
    color: 'from-indigo-600 to-violet-600',
    component: EmbeddingDock,
  },
  {
    id: 'pqc', num: '02',
    title: 'PQC Sandbox',
    subtitle: 'Parameterized Quantum Circuit',
    icon: '⊕',
    classicalAnalogy: 'Dense / Conv layer',
    description: 'Drag gates onto a circuit board and tune θ sliders — the output probability histogram animates live.',
    color: 'from-violet-600 to-purple-600',
    component: PQCSandbox,
  },
  {
    id: 'entanglement', num: '03',
    title: 'Entanglement',
    subtitle: 'Joint quantum states',
    icon: '∞',
    classicalAnalogy: 'Attention / correlations',
    description: 'Add a CNOT to entangle qubits. Bloch spheres go fuzzy (purity < 1) as the joint City Plot lights up.',
    color: 'from-purple-600 to-cyan-600',
    component: EntanglementView,
  },
  {
    id: 'measurement', num: '04',
    title: 'Measurement',
    subtitle: 'Wave collapse & shots',
    icon: '◎',
    classicalAnalogy: 'Softmax + sampling',
    description: 'Hit MEASURE and watch the wave function collapse. The shots slider shows noise turning into distribution.',
    color: 'from-cyan-600 to-teal-600',
    component: MeasurementReactor,
  },
  {
    id: 'gradient', num: '05',
    title: 'Parameter-Shift',
    subtitle: 'Quantum backpropagation',
    icon: '∇',
    classicalAnalogy: 'Backprop / chain rule',
    description: 'Computes the exact gradient by running the circuit at θ ± π/2. No autograd — pure quantum math.',
    color: 'from-teal-600 to-emerald-600',
    component: ParameterShiftView,
  },
  {
    id: 'barren', num: '06',
    title: 'Barren Plateau',
    subtitle: 'The optimizer graveyard',
    icon: '⊘',
    classicalAnalogy: 'Vanishing gradient ×1000',
    description: 'Crank up depth and qubit count. The loss landscape flattens to a featureless desert — gradients die.',
    color: 'from-rose-700 to-orange-600',
    component: BarrenPlateauSim,
  },
  {
    id: 'study', num: '07',
    title: 'Study Guide',
    subtitle: 'Du et al. 2025 · arXiv:2502.01146',
    icon: '📖',
    classicalAnalogy: 'QML textbook (260 pages)',
    description: 'Chapter-by-chapter study notes from the QML tutorial paper: qubits, quantum kernels, QNNs, quantum transformers, and self-check questions.',
    color: 'from-amber-600 to-orange-500',
    component: StudyGuide,
  },
]

// ─── App view state ────────────────────────────────────────────────────────────

type View =
  | { kind: 'landing' }
  | { kind: 'course'; lessonId: string }
  | { kind: 'module'; id: string }

// ─── Landing ──────────────────────────────────────────────────────────────────

const MAPPING_ROWS = [
  { cl: 'Input tokens / pixels',  qu: 'Quantum state |ψ⟩', tag: 'Embedding' },
  { cl: 'Trainable weight W',     qu: 'Gate parameter θ (RX, RY, RZ)', tag: 'PQC' },
  { cl: 'Matrix multiply',        qu: 'Unitary gate U(θ)|ψ⟩', tag: 'PQC' },
  { cl: 'Non-linearity',          qu: 'Entanglement via CNOT', tag: 'Entanglement' },
  { cl: 'Softmax output',         qu: 'Measurement / wave collapse', tag: 'Measurement' },
  { cl: 'Backpropagation',        qu: 'Parameter-Shift Rule', tag: 'Gradient' },
  { cl: 'Vanishing gradient',     qu: 'Barren Plateau', tag: 'Danger' },
]

function HeroQubit() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="opacity-80">
      <defs>
        <radialGradient id="sphereGrad" cx="42%" cy="38%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3730a3" stopOpacity="0.05" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Sphere */}
      <circle cx="90" cy="90" r="70" fill="url(#sphereGrad)" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.4" />
      {/* Equator ellipse */}
      <ellipse cx="90" cy="90" rx="70" ry="22" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="4 3" />
      {/* Meridian */}
      <ellipse cx="90" cy="90" rx="22" ry="70" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.2" />
      {/* Z axis */}
      <line x1="90" y1="15" x2="90" y2="165" stroke="#10b981" strokeWidth="1" strokeOpacity="0.35" />
      {/* X axis */}
      <line x1="20" y1="90" x2="160" y2="90" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.35" />
      {/* Bloch vector — animated */}
      <g filter="url(#glow)">
        <line x1="90" y1="90" x2="138" y2="48" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 90 90" to="360 90 90" dur="8s" repeatCount="indefinite" />
        </line>
        <circle cx="138" cy="48" r="4" fill="#818cf8">
          <animateTransform attributeName="transform" type="rotate" from="0 90 90" to="360 90 90" dur="8s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* |0⟩ label */}
      <text x="92" y="11" fill="#10b981" fontSize="10" fontFamily="JetBrains Mono, monospace" opacity="0.7">|0⟩</text>
      {/* |1⟩ label */}
      <text x="92" y="172" fill="#ef4444" fontSize="10" fontFamily="JetBrains Mono, monospace" opacity="0.7">|1⟩</text>
    </svg>
  )
}

interface LandingProps {
  onStartCourse: () => void
  onResume: () => void
  onOpenModule: (id: string) => void
  resumeLesson: string | null
}

function Landing({ onStartCourse, onResume, onOpenModule, resumeLesson }: LandingProps) {
  const resume = resumeLesson ? lessonById(resumeLesson) : undefined
  const doneCount = useProgressStore((s) => Object.keys(s.completed).length)

  return (
    <div className="min-h-screen bg-q-bg bg-grid overflow-auto">
      {/* Hero glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 flex flex-col gap-12 sm:gap-16">

        {/* Hero */}
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 tracking-widest uppercase">
              <span className="w-6 h-px bg-indigo-500" />
              Interactive Curriculum
              <span className="ml-auto normal-case tracking-normal"><MobileToggle /></span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              Quantum AI<br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                for ML People
              </span>
            </h1>
            <p className="text-q-sub text-lg leading-relaxed max-w-lg">
              A guided, intuition-first course that maps everything you know about ML onto quantum machine learning —
              built from two books for AI practitioners. Every concept comes with a <em className="text-q-text not-italic">live</em> widget.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <button
                onClick={onStartCourse}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-glow-md transition-all hover:shadow-glow-lg active:scale-95"
              >
                Start the course
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {resume && (
                <button
                  onClick={onResume}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border border-q-border2 bg-q-card hover:border-q-indigo text-q-sub hover:text-q-text font-medium transition-all"
                >
                  Resume · <span className="font-mono text-xs text-indigo-300">{resume.title}</span>
                </button>
              )}
            </div>
            {doneCount > 0 && (
              <div className="text-xs font-mono text-q-faint">{doneCount}/{LESSONS.length} lessons completed</div>
            )}
          </div>
          <div className="flex-shrink-0">
            <HeroQubit />
          </div>
        </div>

        {/* Classical ↔ Quantum mapping */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-q-sub uppercase tracking-widest">The whole course in one table</h2>
          <div className="rounded-xl border border-q-border overflow-hidden shadow-card">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] text-xs font-mono bg-q-dim px-5 py-2.5 text-q-faint border-b border-q-border">
              <div>Classical ML (what you know)</div>
              <div>Quantum ML (what you'll learn)</div>
              <div>Module</div>
            </div>
            {MAPPING_ROWS.map(({ cl, qu, tag }) => (
              <div
                key={cl}
                className="flex flex-col gap-1 sm:gap-0 sm:grid sm:grid-cols-[1fr_1fr_auto] sm:items-center px-4 sm:px-5 py-3 border-b border-q-border/50 last:border-0 hover:bg-q-dim/50 transition-colors text-sm"
              >
                <div className="text-q-sub">{cl}</div>
                <div className="text-indigo-300 font-mono text-xs flex items-center">{qu}</div>
                <div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    tag === 'Danger'
                      ? 'bg-rose-900/40 text-rose-300 border-rose-700/40'
                      : 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40'
                  }`}>{tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guided course units */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-q-sub uppercase tracking-widest">Guided Course · {UNITS.length} units · {LESSONS.length} lessons</h2>
            <button onClick={onStartCourse} className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors">Begin →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UNITS.map((u) => (
              <motion.button
                key={u.id}
                onClick={() => onOpenModule('__course__' + u.lessons[0].id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="text-left p-5 rounded-xl border border-q-border bg-q-card hover:border-q-border2 shadow-card transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-xs font-bold font-mono shadow-glow-sm`}>
                    {u.num}
                  </div>
                  <span className="text-[10px] font-mono text-q-faint">{u.lessons.length} lessons</span>
                </div>
                <div className="font-semibold text-q-text mb-0.5 group-hover:text-white transition-colors">{u.title}</div>
                <div className="text-xs text-q-faint font-mono mb-2">{u.subtitle}</div>
                <div className="flex flex-col gap-1 mt-2">
                  {u.lessons.map((l) => (
                    <div key={l.id} className="text-xs text-q-sub flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-q-border2" />
                      {l.title}
                    </div>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Playground modules */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-q-sub uppercase tracking-widest">Playground · explore the modules freely</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => onOpenModule(m.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="text-left p-5 rounded-xl border border-q-border bg-q-card hover:border-q-border2 shadow-card transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-lg font-bold shadow-glow-sm`}>
                    {m.icon}
                  </div>
                  <span className="text-xs font-mono text-q-faint">{m.num}</span>
                </div>
                <div className="font-semibold text-q-text mb-0.5 group-hover:text-white transition-colors">{m.title}</div>
                <div className="text-xs text-q-faint font-mono mb-2">{m.subtitle}</div>
                <div className="text-xs text-q-sub leading-relaxed">{m.description}</div>
                <div className="mt-3 flex items-center gap-1 text-xs text-q-faint">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-q-dim border border-q-border text-q-faint">
                    ≈ {m.classicalAnalogy}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Module shell (Playground / Reference) ─────────────────────────────────────

function ModuleView({ activeId, onSelect, onExit }: { activeId: string; onSelect: (id: string) => void; onExit: () => void }) {
  const activeIdx = MODULES.findIndex((m) => m.id === activeId)
  const active = MODULES[activeIdx]
  const ActiveComponent = active.component
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function moduleList(pick: (id: string) => void) {
    return MODULES.map((m, i) => {
      const isActive = m.id === activeId
      const isDone = i < activeIdx
      return (
        <button
          key={m.id}
          onClick={() => pick(m.id)}
          className={`relative flex items-center gap-3 px-4 py-2.5 text-left transition-all group w-full ${
            isActive ? 'bg-indigo-950/60' : 'hover:bg-q-dim/50'
          }`}
        >
          {isActive && (
            <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-q-indigo" />
          )}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold font-mono transition-all ${
            isActive
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow-sm'
              : isDone
              ? 'bg-q-dim text-indigo-400 border border-indigo-700/50'
              : 'bg-q-dim text-q-faint border border-q-border'
          }`}>
            {m.num}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-medium truncate transition-colors ${
              isActive ? 'text-white' : 'text-q-sub group-hover:text-q-text'
            }`}>
              {m.title}
            </span>
            <span className="text-[10px] text-q-faint font-mono truncate">{m.subtitle}</span>
          </div>
        </button>
      )
    })
  }

  const pickFromDrawer = (id: string) => { onSelect(id); setDrawerOpen(false) }

  return (
    <div className="h-screen bg-q-bg flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-12 border-b border-q-border bg-q-panel/80 backdrop-blur z-50 flex items-center px-3 sm:px-4 gap-2 sm:gap-4 flex-shrink-0">
        {isMobile && (
          <button onClick={() => setDrawerOpen(true)} aria-label="Open modules" className="text-q-sub hover:text-q-text p-1 -ml-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        )}
        <button onClick={onExit} className="flex items-center gap-2 group min-w-0">
          <span className="text-indigo-400 text-base">⚛</span>
          {!isMobile && <span className="font-semibold text-q-text text-sm group-hover:text-white transition-colors">Quantum AI Explainer</span>}
        </button>
        {!isMobile && <div className="h-4 w-px bg-q-border mx-1" />}
        <div className="flex items-center gap-1.5 text-xs text-q-faint font-mono min-w-0">
          {!isMobile && (
            <>
              <span className="text-cyan-400/80">Playground</span>
              <span className="text-q-faint mx-1">·</span>
              <span className="text-q-faint">{active.num}</span>
            </>
          )}
          <span className="text-q-indigo font-medium truncate">{active.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-mono text-q-faint hidden sm:flex items-center gap-1.5">
            <span className="opacity-50">≈ classical:</span>
            <span className="text-amber-400/80">{active.classicalAnalogy}</span>
          </span>
          <MobileToggle />
        </div>
      </header>

      {isMobile && (
        <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Playground modules">
          <div className="py-2">{moduleList(pickFromDrawer)}</div>
          <div className="px-4 py-3 border-t border-q-border">
            <button onClick={() => { onExit(); setDrawerOpen(false) }} className="text-xs font-mono text-q-faint hover:text-q-sub text-left transition-colors">Overview</button>
          </div>
        </NavDrawer>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop only) */}
        {!isMobile && (
          <aside className="w-52 flex-shrink-0 border-r border-q-border bg-q-panel flex flex-col pt-2 pb-4 overflow-y-auto">
            {moduleList(onSelect)}
            <div className="mt-auto px-4 pt-4 border-t border-q-border mt-4">
              <button
                onClick={onExit}
                className="w-full text-xs text-q-faint hover:text-q-sub font-mono text-left flex items-center gap-2 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Overview
              </button>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 min-h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom nav */}
      <footer className="h-10 border-t border-q-border bg-q-panel/60 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <button
          onClick={() => activeIdx > 0 && onSelect(MODULES[activeIdx - 1].id)}
          disabled={activeIdx === 0}
          className="text-xs text-q-faint hover:text-q-sub disabled:opacity-30 flex items-center gap-1.5 transition-colors font-mono"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="hidden sm:inline">{activeIdx > 0 ? MODULES[activeIdx - 1].title : 'Previous'}</span>
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {MODULES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`rounded-full transition-all ${
                i === activeIdx
                  ? 'w-4 h-1.5 bg-q-indigo'
                  : i < activeIdx
                  ? 'w-1.5 h-1.5 bg-indigo-700'
                  : 'w-1.5 h-1.5 bg-q-border'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => activeIdx < MODULES.length - 1 && onSelect(MODULES[activeIdx + 1].id)}
          disabled={activeIdx === MODULES.length - 1}
          className="text-xs text-q-faint hover:text-q-sub disabled:opacity-30 flex items-center gap-1.5 transition-colors font-mono"
        >
          <span className="hidden sm:inline">{activeIdx < MODULES.length - 1 ? MODULES[activeIdx + 1].title : 'Next'}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </footer>
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>({ kind: 'landing' })
  const lastLessonId = useProgressStore((s) => s.lastLessonId)

  // Landing's unit cards pass '__course__<lessonId>'; module cards pass a module id.
  function openFromLanding(id: string) {
    if (id.startsWith('__course__')) {
      setView({ kind: 'course', lessonId: id.replace('__course__', '') })
    } else {
      setView({ kind: 'module', id })
    }
  }

  if (view.kind === 'landing') {
    return (
      <Landing
        onStartCourse={() => setView({ kind: 'course', lessonId: firstLessonId })}
        onResume={() => setView({ kind: 'course', lessonId: lastLessonId ?? firstLessonId })}
        onOpenModule={openFromLanding}
        resumeLesson={lastLessonId}
      />
    )
  }

  if (view.kind === 'course') {
    return (
      <CourseShell
        lessonId={view.lessonId}
        onSelectLesson={(id) => setView({ kind: 'course', lessonId: id })}
        onExit={() => setView({ kind: 'landing' })}
        onOpenModule={(id) => setView({ kind: 'module', id })}
      />
    )
  }

  return (
    <ModuleView
      activeId={view.id}
      onSelect={(id) => setView({ kind: 'module', id })}
      onExit={() => setView({ kind: 'landing' })}
    />
  )
}
