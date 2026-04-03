import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'

export function Signup() {
  const { signup, user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup(email, password, name, role)
    } catch (err) {
      setError(err.message || 'Could not sign up')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_55%)]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/95 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)]">
              Create account
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">Join your hostel portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Full name
            </label>
            <input
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Role
            </label>
            <select
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="admin">Admin (demo)</option>
            </select>
          </div>
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full !py-3" disabled={busy}>
            {busy ? 'Creating…' : 'Sign up'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
