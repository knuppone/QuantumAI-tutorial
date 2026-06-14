import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UNITS, LESSONS, lessonById, unitOfLesson, lessonIndex } from './curriculum'
import { useProgressStore } from './progressStore'
import { SelfCheck, AnalogyChip, BookRef } from '../components/TeachPrimitives'
import { Panel } from '../components/Panel'
import { useIsMobile } from '../responsive/viewport'
import { NavDrawer } from '../responsive/NavDrawer'
import { MobileToggle } from '../responsive/MobileToggle'

interface Props {
  lessonId: string
  onSelectLesson: (id: string) => void
  onExit: () => void
  onOpenModule: (id: string) => void
}

export function CourseShell({ lessonId, onSelectLesson, onExit, onOpenModule }: Props) {
  const lesson = lessonById(lessonId) ?? LESSONS[0]
  const unit = unitOfLesson(lesson.id)!
  const idx = lessonIndex(lesson.id)
  const mainRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const completed = useProgressStore((s) => s.completed)
  const markComplete = useProgressStore((s) => s.markComplete)
  const visit = useProgressStore((s) => s.visit)

  useEffect(() => {
    visit(lesson.id)
    mainRef.current?.scrollTo({ top: 0 })
  }, [lesson.id, visit])

  const Content = lesson.Content
  const Interactive = lesson.interactive
  const doneCount = LESSONS.filter((l) => completed[l.id]).length

  function goNext() {
    if (idx < LESSONS.length - 1) onSelectLesson(LESSONS[idx + 1].id)
  }
  function completeAndNext() {
    markComplete(lesson.id)
    goNext()
  }

  // Shared unit → lesson tree, used by the desktop sidebar and the mobile drawer.
  function lessonTree(pick: (id: string) => void) {
    return UNITS.map((u) => (
      <div key={u.id} className="mb-1">
        <div className="px-4 py-1.5 flex items-center gap-2">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-gradient-to-br ${u.color} text-white`}>{u.num}</span>
          <span className="text-xs font-semibold text-q-sub">{u.title}</span>
        </div>
        {u.lessons.map((l) => {
          const isActive = l.id === lesson.id
          const isDone = !!completed[l.id]
          return (
            <button
              key={l.id}
              onClick={() => pick(l.id)}
              className={`relative w-full flex items-center gap-2.5 pl-6 pr-3 py-1.5 text-left transition-all group ${
                isActive ? 'bg-indigo-950/60' : 'hover:bg-q-dim/50'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-q-indigo" />}
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                isDone ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-700/50'
                : isActive ? 'bg-q-indigo text-white' : 'bg-q-dim text-q-faint border border-q-border'
              }`}>{isDone ? '✓' : ''}</span>
              <span className={`text-xs truncate transition-colors ${isActive ? 'text-white' : 'text-q-sub group-hover:text-q-text'}`}>{l.title}</span>
            </button>
          )
        })}
      </div>
    ))
  }

  const pickFromDrawer = (id: string) => { onSelectLesson(id); setDrawerOpen(false) }

  return (
    <div className="h-screen bg-q-bg flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-12 border-b border-q-border bg-q-panel/80 backdrop-blur z-50 flex items-center px-3 sm:px-4 gap-2 sm:gap-4 flex-shrink-0">
        {isMobile && (
          <button onClick={() => setDrawerOpen(true)} aria-label="Open lessons" className="text-q-sub hover:text-q-text p-1 -ml-1">
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
              <span className="text-amber-400/80">Course</span>
              <span className="text-q-faint mx-1">·</span>
              <span className="text-q-faint">{unit.num}</span>
            </>
          )}
          <span className="text-q-indigo font-medium truncate">{lesson.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] font-mono text-q-faint hidden sm:inline">{doneCount}/{LESSONS.length} done</span>
          <button onClick={() => onOpenModule('study')} className="text-[11px] font-mono text-q-faint hover:text-amber-300 transition-colors hidden sm:inline">Reference ↗</button>
          <button onClick={onExit} className="text-[11px] font-mono text-q-faint hover:text-q-sub transition-colors hidden sm:inline">Overview</button>
          <MobileToggle />
        </div>
      </header>

      {isMobile && (
        <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Course lessons">
          <div className="py-3">{lessonTree(pickFromDrawer)}</div>
          <div className="px-4 py-3 border-t border-q-border flex flex-col gap-2">
            <button onClick={() => { onOpenModule('study'); setDrawerOpen(false) }} className="text-xs font-mono text-q-faint hover:text-amber-300 text-left transition-colors">Reference ↗</button>
            <button onClick={() => { onExit(); setDrawerOpen(false) }} className="text-xs font-mono text-q-faint hover:text-q-sub text-left transition-colors">Overview</button>
          </div>
        </NavDrawer>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: units → lessons (desktop only) */}
        {!isMobile && (
          <aside className="w-60 flex-shrink-0 border-r border-q-border bg-q-panel flex flex-col py-3 overflow-y-auto">
            {lessonTree(onSelectLesson)}
          </aside>
        )}

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 min-h-full max-w-4xl"
            >
              {/* Lesson header */}
              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center gap-2 text-xs font-mono text-q-faint">
                  <span>{unit.num}.{idx + 1}</span>
                  <span>·</span>
                  <span>{unit.title}</span>
                </div>
                <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
                <p className="text-sm text-q-faint">{lesson.subtitle}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <AnalogyChip ml={lesson.classicalAnalogy} />
                  {lesson.bookRefs?.map((r) => <BookRef key={r.book + r.where} book={r.book} where={r.where} />)}
                </div>
              </div>

              {/* Prose */}
              <Content />

              {/* Embedded interactive */}
              {Interactive && (
                <div className="mt-6">
                  <Panel
                    title="Try it"
                    subtitle={lesson.interactiveLabel}
                    accent="cyan"
                  >
                    <Interactive />
                    {lesson.playgroundId && (
                      <button
                        onClick={() => onOpenModule(lesson.playgroundId!)}
                        className="mt-3 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Open full module in Playground ↗
                      </button>
                    )}
                  </Panel>
                </div>
              )}

              {/* Self-check */}
              <SelfCheck questions={lesson.selfChecks} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer: prev / progress / next */}
      <footer className="h-12 border-t border-q-border bg-q-panel/60 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-3 sm:gap-4">
        <button
          onClick={() => idx > 0 && onSelectLesson(LESSONS[idx - 1].id)}
          disabled={idx === 0}
          className="text-xs text-q-faint hover:text-q-sub disabled:opacity-30 flex items-center gap-1.5 transition-colors font-mono"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Prev
        </button>

        <div className="flex-1 max-w-md flex items-center gap-3">
          <span className="text-[10px] font-mono text-q-faint whitespace-nowrap hidden sm:inline">Lesson {idx + 1}/{LESSONS.length}</span>
          <div className="flex-1 h-1.5 bg-q-dim rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full transition-all" style={{ width: `${((idx + 1) / LESSONS.length) * 100}%` }} />
          </div>
        </div>

        {idx < LESSONS.length - 1 ? (
          <button
            onClick={completeAndNext}
            className="text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95"
          >
            {completed[lesson.id] ? 'Next' : 'Mark done & next'}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : (
          <button
            onClick={() => markComplete(lesson.id)}
            className="text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-1.5 rounded-full transition-all active:scale-95"
          >
            Finish course ✓
          </button>
        )}
      </footer>
    </div>
  )
}
