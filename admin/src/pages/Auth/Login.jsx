import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../../utils/validation/authSchema.js'
import { DEMO_LOGIN } from '../../services/auth/authService.js'

export default function Login({ onSignIn }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema, undefined, { raw: true }),
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  async function submit(values) {
    setError('')

    try {
      await onSignIn(values)
    } catch (error) {
      setError(error.message || 'Unable to sign in. Please try again.')
    }
  }

  function fillDemoAccount() {
    reset({ email: DEMO_LOGIN.email, password: DEMO_LOGIN.password })
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

        <form className="login-form" onSubmit={handleSubmit(submit)} aria-busy={isSubmitting} noValidate>
          <label htmlFor="login-email">Email address</label>
          <input
            className="login-input"
            id="login-email"
            {...register('email', { onChange: () => setError('') })}
            type="email"
            autoComplete="username"
            placeholder="Enter your email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            disabled={isSubmitting}
            required
          />
          {errors.email && <small id="login-email-error" className="login-error">{errors.email.message}</small>}

          <label htmlFor="login-password">Password</label>
          <input
            className="login-input"
            id="login-password"
            {...register('password', { onChange: () => setError('') })}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            disabled={isSubmitting}
            required
          />
          {errors.password && <small id="login-password-error" className="login-error">{errors.password.message}</small>}

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
