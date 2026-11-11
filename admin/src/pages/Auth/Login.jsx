import { useState } from 'react'
import { DEMO_LOGIN } from '../../services/auth/authService.js'

export default function Login({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSignIn({ email, password })
    } catch (error) {
      setError(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function fillDemoAccount() {
    setEmail(DEMO_LOGIN.email)
    setPassword(DEMO_LOGIN.password)
    setShowPassword(false)
    setError('')
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <img className="login-logo" src="/favicon.svg" alt="" width="42" height="42" />
        <p className="login-brand">Hadiya Science HRMS</p>
        <h1 id="login-title">Admin login</h1>
        <p className="login-subtitle">Welcome back. Sign in to your HR workspace.</p>

        <form className="login-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <label htmlFor="login-email">Email address</label>
          <input
            className="login-input"
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError('')
            }}
            disabled={isSubmitting}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            className="login-input"
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError('')
            }}
            disabled={isSubmitting}
            required
          />

          <label className="login-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              disabled={isSubmitting}
            />
            Show password
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <button className="login-demo-button" type="button" onClick={fillDemoAccount} disabled={isSubmitting}>
          Use demo account
        </button>
        <p className="login-demo-note">Demo only · Besufekad Ermias, HR Manager</p>
        <p className="login-help">Forgot your password? Contact your administrator.</p>
      </section>
    </main>
  )
}
