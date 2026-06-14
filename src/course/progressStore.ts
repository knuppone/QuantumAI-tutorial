import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProgressState {
  completed: Record<string, true>
  lastLessonId: string | null
  markComplete: (id: string) => void
  visit: (id: string) => void
  isComplete: (id: string) => boolean
  reset: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      lastLessonId: null,
      markComplete: (id) =>
        set((s) => ({ completed: { ...s.completed, [id]: true }, lastLessonId: id })),
      visit: (id) => set({ lastLessonId: id }),
      isComplete: (id) => !!get().completed[id],
      reset: () => set({ completed: {}, lastLessonId: null }),
    }),
    { name: 'qml-course-progress' },
  ),
)
