import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MOBILE_QUERY = '(max-width: 768px)'
const COARSE_QUERY = '(pointer: coarse)'

/** Raw, hardware/viewport-driven mobile detection (ignores the manual override).
 *  Width is the primary signal so DevTools device emulation and window-narrowing
 *  both trigger; coarse-pointer is tracked as a secondary hint. */
export function useAutoMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const mqWidth = window.matchMedia(MOBILE_QUERY)
    const mqPointer = window.matchMedia(COARSE_QUERY)
    const update = () => setIsMobile(mqWidth.matches)
    update()
    mqWidth.addEventListener('change', update)
    mqPointer.addEventListener('change', update)
    return () => {
      mqWidth.removeEventListener('change', update)
      mqPointer.removeEventListener('change', update)
    }
  }, [])

  return isMobile
}

type Override = 'mobile' | 'desktop' | null

interface ViewportState {
  override: Override
  setOverride: (o: Override) => void
  clearOverride: () => void
}

/** Persisted manual override of the auto detection ("Desktop site" / "Mobile site"). */
export const useViewportStore = create<ViewportState>()(
  persist(
    (set) => ({
      override: null,
      setOverride: (o) => set({ override: o }),
      clearOverride: () => set({ override: null }),
    }),
    { name: 'qml-viewport-override' },
  ),
)

/** Effective mobile flag: the manual override wins, otherwise follow auto detection. */
export function useIsMobile(): boolean {
  const auto = useAutoMobile()
  const override = useViewportStore((s) => s.override)
  return override === null ? auto : override === 'mobile'
}
