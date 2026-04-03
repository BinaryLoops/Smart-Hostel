export function Button({ variant = 'primary', className = '', type = 'button', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none'
  const styles = {
    primary:
      'bg-[var(--accent)] text-white shadow-[0_0_20px_var(--accent-glow)] hover:brightness-110 active:scale-[0.98]',
    ghost:
      'bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--accent-soft)]',
    outline:
      'border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
  }
  return (
    <button type={type} className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
