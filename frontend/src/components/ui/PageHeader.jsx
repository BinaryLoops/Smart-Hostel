import { motion } from 'framer-motion'

export function PageHeader({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {action}
    </motion.div>
  )
}
