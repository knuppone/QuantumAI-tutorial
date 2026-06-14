import { useAutoMobile, useViewportStore, useIsMobile } from './viewport'

/** "Desktop site" / "Mobile site" override toggle. Hidden on a true desktop
 *  (auto = desktop and no override active). */
export function MobileToggle({ className = '' }: { className?: string }) {
  const auto = useAutoMobile()
  const effective = useIsMobile()
  const override = useViewportStore((s) => s.override)
  const setOverride = useViewportStore((s) => s.setOverride)
  const clearOverride = useViewportStore((s) => s.clearOverride)

  // Nothing to offer on a genuine desktop with no forced mode.
  if (!auto && override === null) return null

  const base = `text-[11px] font-mono text-q-faint hover:text-q-sub transition-colors ${className}`

  if (effective) {
    return <button onClick={() => setOverride('desktop')} className={base}>Desktop site</button>
  }
  // Forced desktop while on a mobile device → offer the way back.
  return <button onClick={() => (auto ? clearOverride() : setOverride('mobile'))} className={base}>Mobile site</button>
}
