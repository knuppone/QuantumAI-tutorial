import type { ComponentType } from 'react'

export interface BookRef {
  book: 'A' | 'B' | 'C'
  where: string
}

export interface Lesson {
  /** Stable id, e.g. 'u2-l1'. Used for progress tracking + sidebar keys. */
  id: string
  title: string
  subtitle: string
  /** The ML-analogy hook chip, e.g. 'dense layer'. */
  classicalAnalogy: string
  /** The lesson body (prose + Teach* primitives). */
  Content: ComponentType
  /** Optional embedded interactive: an existing module or a new widget. */
  interactive?: ComponentType
  /** Caption shown above the embedded interactive. */
  interactiveLabel?: string
  /** "question → answer" strings rendered by <SelfCheck>. */
  selfChecks: string[]
  /** Which source books this lesson draws from. */
  bookRefs?: BookRef[]
  /** Optional deep-link into the playground module id. */
  playgroundId?: string
}

export interface Unit {
  id: string
  num: string
  title: string
  subtitle: string
  /** Tailwind gradient string, same convention as App's MODULES. */
  color: string
  lessons: Lesson[]
}
