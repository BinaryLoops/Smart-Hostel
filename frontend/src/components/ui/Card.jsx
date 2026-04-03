import { motion } from 'framer-motion'

export function Card({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
