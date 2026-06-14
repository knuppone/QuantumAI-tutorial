import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
}

/** A generic left slide-over used for mobile navigation. Backdrop closes it;
 *  body scroll is locked while open. */
export function NavDrawer({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 w-[82vw] max-w-xs z-[70] bg-q-panel border-r border-q-border flex flex-col overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 flex items-center justify-between px-4 border-b border-q-border flex-shrink-0">
              <span className="text-sm font-semibold text-q-text truncate">{title}</span>
              <button onClick={onClose} aria-label="Close menu" className="text-q-faint hover:text-q-text p-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex-1">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
