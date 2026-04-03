import { useEffect } from 'react'

export function Modal({ open, title, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            {title && (
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
            )}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-lg px-2 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-[var(--border-subtle)] px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}

