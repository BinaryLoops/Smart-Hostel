import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui/Button'

export function Login() {
  const { login, loginWithVtop, loginWithGoogle, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [vtopId, setVtopId] = useState('')
  const [vtopPassword, setVtopPassword] = useState('')
  const [vtopBusy, setVtopBusy] = useState(false)
  const [vtopError, setVtopError] = useState('')
  const [captchaFlow, setCaptchaFlow] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  if (user) {
    const to = loc.state?.from?.pathname || '/'
    return <Navigate to={to} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleBusy(true)
    setError('')
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err?.message || 'Google Login failed')
    } finally {
      setGoogleBusy(false)
    }
  }

  async function handleVtopLogin(e) {
    e.preventDefault()
    setVtopError('')
    setCaptchaFlow(false)
    setVtopBusy(true)
    try {
      await loginWithVtop(vtopId.trim(), vtopPassword)
    } catch (err) {
      const msg = err?.message || 'VTOP login failed'
      if (msg.includes('CAPTCHA_REQUIRED')) {
        setVtopError('VTOP captcha is required. Open VTOP, solve captcha/login, then retry here.')
        setCaptchaFlow(true)
      } else {
        setVtopError(msg)
      }
    } finally {
      setVtopBusy(false)
    }
  }

  function openVtopCaptcha() {
    window.open('https://vtopcc.vit.ac.in/vtop/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_100%_0%,var(--accent-soft),transparent_50%),radial-gradient(ellipse_80%_50%_at_0%_100%,rgba(99,102,241,0.12),transparent_45%)]" />
      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text-primary)]">
                  Smart Hostel
                </p>
                <p className="text-xs text-[var(--text-secondary)]">Management Portal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/90 p-8 shadow-xl backdrop-blur-xl">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Sign in with your institute email. Demo: use an email containing{' '}
              <code className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 text-[var(--accent)]">
                admin
              </code>{' '}
              for admin access without Firebase.
            </p>

            <div className="mt-8 mb-6">
              <Button
                type="button"
                className="w-full !py-3 flex items-center justify-center gap-2 !bg-white !text-gray-900 border border-gray-200 hover:!bg-gray-50 focus:ring-gray-200"
                onClick={handleGoogleLogin}
                disabled={googleBusy}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {googleBusy ? 'Connecting...' : 'Continue with Google'}
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              <span className="text-xs text-[var(--text-secondary)]">OR CONTINUE WITH EMAIL</span>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <input
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent)] transition focus:ring-2"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Password
                </label>
                <input
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent)] transition focus:ring-2"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-[var(--danger)]">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full !py-3" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              <span className="text-xs text-[var(--text-secondary)]">OR</span>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>

            <form onSubmit={handleVtopLogin} className="space-y-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">Login with VTOP</p>
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent)] transition focus:ring-2"
                value={vtopId}
                onChange={(e) => setVtopId(e.target.value)}
                placeholder="VTOP Username"
                required
              />
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent)] transition focus:ring-2"
                type="password"
                value={vtopPassword}
                onChange={(e) => setVtopPassword(e.target.value)}
                placeholder="VTOP Password"
                required
              />
              {vtopError && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-[var(--danger)]">{vtopError}</p>
              )}
              <Button type="submit" className="w-full !py-3" disabled={vtopBusy}>
                {vtopBusy ? 'Verifying VTOP…' : 'Continue with VTOP'}
              </Button>
              {captchaFlow && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={openVtopCaptcha}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:opacity-90"
                  >
                    Open VTOP Captcha Page
                  </button>
                  <p className="text-xs text-[var(--text-secondary)]">
                    After solving captcha/login in that tab, return here and click "Continue with VTOP" again.
                  </p>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              New here?{' '}
              <Link to="/signup" className="font-semibold text-[var(--accent)] hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center lg:flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mx-12 max-w-lg rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-10 backdrop-blur-2xl"
        >
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[var(--text-primary)]">
            One portal for mess, rooms, and campus life.
          </p>
          <p className="mt-4 text-[var(--text-secondary)]">
            Real-time insights, QR mess entry, and admin analytics — built for demo-day polish.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
            {['Mess QR', 'Leave flow', 'Charts', 'Dark mode'].map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-center font-medium text-[var(--text-primary)]"
              >
                {t}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
