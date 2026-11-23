import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from 'react-router-dom'
import { loginSchema } from '../../utils/validation/authSchemas.js'
import { signIn, getDemoLogin } from '../../services/auth/authService.js'
import { useEmployeeStore } from '../../store/index.js'
import { USE_DEMO_API } from '../../config/api.js'

export default function Login() {
  const { user, setUser } = useEmployeeStore()
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { identifier: '', password: '' },
    resolver: zodResolver(loginSchema),
  })
  if (user)
    return (
      <Navigate
        to={user.mustChangePassword ? '/change-password' : '/dashboard'}
        replace
      />
    )
  const demoLogin = getDemoLogin()

  async function submit(values) {
    setError('')
    try {
      const account = await signIn(values)
      reset()
      setUser(account)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <main
      className={String.raw`auth-screen employee-base:min-h-[100dvh] employee-base:flex employee-base:items-center
    employee-base:justify-center employee-base:p-[24px] employee-base:[background:var(--page-bg)]
    employee-page:screen-max-480:p-[16px]`}
    >
      <section
        className={String.raw`auth-card employee-base:w-[100%] employee-base:max-w-[420px] employee-base:p-[36px]
    employee-base:[border:1px_solid_var(--border)] employee-base:rounded-[12px]
    employee-base:[background:white] employee-base:[box-shadow:0_8px_30px_#092a3208]
    employee-page:screen-max-480:p-[24px]`}
        aria-labelledby="login-title"
      >
        <img
          className="mb-4 block"
          src="/favicon.svg"
          alt=""
          width="42"
          height="42"
        />
        <p className="mb-3 text-[13px] font-semibold text-primary">Hadiya Science HRMS</p>
        <h1 id="login-title">Employee login</h1>
        <p className="mt-2.5 text-[13px] leading-[1.6] text-text-secondary">
          Welcome back. Sign in to your employee workspace.
        </p>
        <form
          className="mt-7 space-y-5"
          onSubmit={handleSubmit(submit)}
          noValidate
          aria-busy={isSubmitting}
        >
          <div>
            <label htmlFor="identifier">Username or email</label>
            <input
              id="identifier"
              autoComplete="username"
              placeholder="Enter your username or email"
              {...register('identifier', { onChange: () => setError('') })}
              disabled={isSubmitting}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
              required
            />
            {errors.identifier && (
              <p
                id="identifier-error"
                className={String.raw`field-error employee-base:mt-[8px] employee-base:text-[color:#b33450] employee-base:text-[length:12px]
    employee-base:leading-[1.7]`}
              >
                {errors.identifier.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password', { onChange: () => setError('') })}
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              required
            />
            {errors.password && (
              <p
                id="password-error"
                className={String.raw`field-error employee-base:mt-[8px] employee-base:text-[color:#b33450] employee-base:text-[length:12px]
    employee-base:leading-[1.7]`}
              >
                {errors.password.message}
              </p>
            )}
          </div>
          <label className="flex items-center gap-2 text-[13px] font-medium">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
              disabled={isSubmitting}
            />
            Show password
          </label>
          {error && (
            <p
              role="alert"
              className={String.raw`error-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc] employee-base:rounded-[7px]
    employee-base:text-[length:12px] employee-base:leading-[1.7] employee-base:text-[color:#b42344]
    employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className={String.raw`primary-button w-full employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        {USE_DEMO_API && (
          <>
            <button
              className={String.raw`secondary-button mt-3 w-full employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                reset(demoLogin)
                setError('')
                setVisible(false)
              }}
            >
              {demoLogin?.password ? 'Use demo account' : 'Use demo email'}
            </button>
            <p className="mt-4 text-center text-[11px] leading-[1.6] text-muted">
              Demo preview · Sample account
            </p>
            {!demoLogin?.password && (
              <p className="mt-2 text-center text-[11px] leading-[1.6] text-muted">
                Enter the new password you saved in this tab. Reload restores the original demo
                account.
              </p>
            )}
          </>
        )}
        <p className="mt-5 text-center text-[11px] leading-[1.6] text-muted">
          First time here? You’ll set a new password before entering your dashboard.
        </p>
      </section>
    </main>
  )
}
