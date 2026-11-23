import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ImagePlus, RotateCcw, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import PersonalInfoCard from '../../components/profile/PersonalInfoCard.jsx'
import EmploymentDetailsCard from '../../components/profile/EmploymentDetailsCard.jsx'
import {
  loadProfile,
  removeProfilePhoto,
  saveProfilePhoto,
} from '../../services/auth/profileService.js'
import { validatePhoto } from '../../utils/validation/profileSchemas.js'
import { formatEmploymentLabel } from '../../utils/formatters/profileDate.js'
import { useEmployeeStore } from '../../store/index.js'

function ProfileContent({ initialData }) {
  const {
    user: sessionUser,
    setUser,
    securityBusy,
    profileBusy,
    setProfileBusy,
    setProfileDirty,
  } = useEmployeeStore()
  const [data, setData] = useState(initialData)
  const [draft, setDraft] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [reading, setReading] = useState(false)
  const inputRef = useRef(null)
  const mounted = useRef(false)
  const operation = useRef(0)
  const saving = useRef(false)
  const dirty = draft !== null
  const locked = profileBusy || securityBusy || reading
  const { user, profile } = data
  const image = draft?.remove ? null : preview || profile.photoUrl

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    setProfileDirty(dirty)
  }, [dirty, setProfileDirty])
  useEffect(() => () => setProfileDirty(false), [setProfileDirty])
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )
  useEffect(() => {
    if (!dirty && !profileBusy) return
    function warn(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, profileBusy])

  async function choosePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || locked || saving.current) return
    const version = ++operation.current
    setReading(true)
    setError('')
    setSaved(false)
    try {
      validatePhoto(file)
      const bitmap = await createImageBitmap(file)
      bitmap.close()
      if (!mounted.current || version !== operation.current) return
      setDraft({ file })
      setPreview(URL.createObjectURL(file))
      setImageFailed(false)
    } catch (failure) {
      if (mounted.current && version === operation.current)
        setError(
          failure.name === 'InvalidStateError'
            ? 'This image could not be read. Choose another JPG, PNG, or WebP photo.'
            : failure.message,
        )
    } finally {
      if (mounted.current && version === operation.current) setReading(false)
    }
  }
  function resetPhoto() {
    if (locked || saving.current) return
    setDraft(null)
    setPreview(null)
    setError('')
    setSaved(false)
    setImageFailed(false)
  }
  function stageRemoval() {
    if (locked || saving.current) return
    setDraft(profile.photoUrl ? { remove: true } : null)
    setPreview(null)
    setError('')
    setSaved(false)
    setImageFailed(false)
  }
  async function savePhoto(event) {
    event.preventDefault()
    if (!dirty || locked || saving.current) return
    saving.current = true
    setProfileBusy(true)
    setError('')
    setSaved(false)
    try {
      const updated = await (draft.remove ? removeProfilePhoto() : saveProfilePhoto(draft.file))
      if (
        updated.user.id !== sessionUser.id ||
        updated.user.employeeId !== sessionUser.employeeId ||
        useEmployeeStore.getState().user?.id !== sessionUser.id
      )
        throw new Error('Your session changed. Sign in again before continuing.')
      if (
        (draft.remove && updated.profile.photoUrl !== null) ||
        (!draft.remove && !updated.profile.photoUrl)
      )
        throw new Error('The photo change was not confirmed. Please try again.')
      setUser(updated.user)
      if (mounted.current) {
        setData(updated)
        setDraft(null)
        setPreview(null)
        setProfileDirty(false)
        setSaved(true)
        setImageFailed(false)
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          failure.fields?.photo ||
            failure.message ||
            'Your photo could not be saved. Please try again.',
        )
    } finally {
      saving.current = false
      setProfileBusy(false)
    }
  }

  return (
    <>
      <section
        className={String.raw`surface content-card mb-5 employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
        aria-labelledby="profile-name"
      >
        <form
          onSubmit={savePhoto}
          aria-busy={locked}
        >
          <div
            className={String.raw`profile-overview employee-base:flex employee-base:items-center employee-base:gap-[24px]
    employee-base:p-[6px_0] employee-page:screen-max-900:flex-wrap employee-page:screen-max-900:gap-[20px]
    employee-page:screen-max-480:gap-[16px]`}
          >
            <div
              className={String.raw`profile-photo-wrap employee-base:relative employee-base:[flex-shrink:0]`}
            >
              <div
                className={String.raw`profile-photo employee-base:flex employee-base:items-center employee-base:justify-center
    employee-base:w-[104px] employee-base:h-[104px] employee-base:[border:1px_solid_#cfe5df]
    employee-base:rounded-[18px] employee-base:[background:#edf7f3] employee-base:text-[color:#4c9382]
    employee-base:overflow-hidden employee-base:[&_img]:w-[100%] employee-base:[&_img]:h-[100%]
    employee-base:[&_img]:[object-fit:cover] employee-page:screen-max-480:w-[80px]
    employee-page:screen-max-480:h-[80px] employee-page:screen-max-480:rounded-[14px]`}
              >
                {image && !imageFailed ? (
                  <img
                    src={image}
                    alt={`${user.fullName}'s profile`}
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <UserRound
                    size={42}
                    aria-hidden="true"
                  />
                )}
              </div>
              <button
                type="button"
                className={String.raw`profile-camera employee-base:absolute employee-base:[right:-6px] employee-base:[bottom:-6px]
    employee-base:flex employee-base:items-center employee-base:justify-center employee-base:w-[34px]
    employee-base:h-[34px] employee-base:[border:3px_solid_white] employee-base:rounded-[50%]
    employee-base:[background:var(--primary)] employee-base:text-[color:white]`}
                aria-label="Change profile photo"
                onClick={() => inputRef.current?.click()}
                disabled={locked}
              >
                <Camera size={17} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={String.raw`eyebrow mb-2 employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
              >
                EMPLOYEE RECORD
              </p>
              <h2
                id="profile-name"
                className="break-words text-[24px] leading-[1.3]"
              >
                {user.fullName}
              </h2>
              <p className="mt-2 text-[12px] text-text-secondary">
                {profile.qualification || 'Qualification not provided'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
                <span
                  className={`rounded-full px-3 py-1 font-semibold ${user.employmentStatus === 'ACTIVE' ? String.raw`tone-green employee-base:text-[color:#0b8972] employee-base:[background:#e3f5f0]` : String.raw`tone-blue employee-base:text-[color:#4b8397] employee-base:[background:#eaf2f7]`}`}
                >
                  {formatEmploymentLabel(user.employmentStatus)}
                </span>
                <span className="text-text-secondary">
                  ID: <strong>{user.serialNumber || 'Not assigned'}</strong>
                </span>
              </div>
            </div>
            <div
              className={String.raw`profile-photo-actions employee-base:flex employee-base:flex-wrap employee-base:justify-end
    employee-base:gap-[10px] employee-base:max-w-[310px] employee-page:screen-max-900:max-w-[none]
    employee-page:screen-max-900:w-[100%] employee-page:screen-max-900:justify-start
    employee-page:screen-max-480:[&_>_button]:[flex:1]
    employee-page:screen-max-480:[&_>_button]:text-[length:12px]
    employee-page:screen-max-480:[&_>_button]:pl-[10px] employee-page:screen-max-480:[&_>_button]:pr-[10px]`}
            >
              <button
                type="button"
                className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
                onClick={() => inputRef.current?.click()}
                disabled={locked}
              >
                <ImagePlus size={17} />
                {image ? 'Change Photo' : 'Upload Photo'}
              </button>
              {(image || profile.photoUrl) && (
                <button
                  type="button"
                  className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
                  onClick={stageRemoval}
                  disabled={locked || draft?.remove}
                >
                  <Trash2 size={16} />
                  Remove Photo
                </button>
              )}
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose profile photo file"
            aria-describedby="profile-photo-help"
            onChange={choosePhoto}
            disabled={locked}
          />
          <p
            id="profile-photo-help"
            className="mt-5 text-[11px] leading-[1.7] text-muted"
          >
            JPG, PNG, or WebP · Maximum 5 MB. Preview your photo, then save the change.
          </p>
          {imageFailed && (
            <p
              className={String.raw`warning-notice mt-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f1e2bd]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#9b650e] employee-base:[border-color:#f1e2bd] employee-base:[background:#fff8e8]`}
              role="status"
            >
              Your saved photo could not be displayed. You can upload a replacement or remove it.
            </p>
          )}
          {error && (
            <p
              className={String.raw`error-notice mt-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#b42344] employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
              role="alert"
            >
              {error}
            </p>
          )}
          {saved && (
            <p
              className={String.raw`info-notice mt-4 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
              role="status"
            >
              Your profile photo was saved successfully.
            </p>
          )}
          {(dirty || reading) && (
            <div
              className={String.raw`profile-save-actions mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5
    employee-page:screen-max-480:[&_>_span]:[flex-basis:100%]
    employee-page:screen-max-480:[&_>_button]:[flex:1]`}
            >
              <span
                className="mr-auto text-[11px] text-muted"
                role="status"
              >
                {reading
                  ? 'Checking your photo…'
                  : profileBusy
                    ? 'Saving your photo…'
                    : draft.remove
                      ? 'Photo will be removed when you save.'
                      : 'Unsaved photo change'}
              </span>
              <button
                type="button"
                className={String.raw`secondary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
                onClick={resetPhoto}
                disabled={locked}
              >
                <RotateCcw size={16} />
                Reset Photo
              </button>
              <button
                type="submit"
                className={String.raw`primary-button employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_transparent] employee-base:rounded-[7px]
    employee-base:[background:var(--primary)] employee-base:text-[color:white] employee-base:font-[600]
    employee-base:text-[length:13px] employee-base:leading-[1.4]
    employee-base:[box-shadow:0_3px_8px_#087f6d10] employee-base:[transition:background_0.15s]
    employee-base:[&:hover:not(:disabled)]:[background:var(--primary-hover)]`}
                disabled={locked || !dirty}
              >
                <Check size={17} />
                {profileBusy ? 'Saving…' : 'Save Photo'}
              </button>
            </div>
          )}
        </form>
      </section>
      <div
        className={String.raw`profile-details-grid employee-base:grid employee-base:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]
    employee-base:gap-[20px] employee-page:screen-max-900:grid-cols-[minmax(0,_1fr)]
    employee-page:screen-max-480:[&_.detail-grid]:grid-cols-[minmax(0,_1fr)]`}
      >
        <PersonalInfoCard
          user={user}
          profile={profile}
        />
        <EmploymentDetailsCard
          user={user}
          profile={profile}
        />
      </div>
      <div
        className={String.raw`info-notice mt-5 flex items-start gap-3 employee-base:p-[12px_14px] employee-base:[border:1px_solid_#d7ece4]
    employee-base:rounded-[7px] employee-base:text-[length:12px] employee-base:leading-[1.7]
    employee-base:text-[color:#166c5b] employee-base:[border-color:#d7ece4] employee-base:[background:#f0faf5]`}
      >
        <ShieldCheck
          size={18}
          className="mt-0.5"
        />
        <p>
          Your personal and employment details are maintained by HR. Contact HR if any information
          needs correcting.
        </p>
      </div>
    </>
  )
}

export default function MyProfile() {
  const user = useEmployeeStore((state) => state.user)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    loadProfile(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        if (result.user.id !== user.id || result.user.employeeId !== user.employeeId)
          throw new Error(
            'The service returned a different employee profile. Sign in again or contact HR.',
          )
        setData(result)
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message)
      })
    return () => controller.abort()
  }, [user.id, user.employeeId, retry])
  return (
    <div className="max-w-[1180px]">
      <div
        className={String.raw`dashboard-intro employee-base:flex employee-base:items-center employee-base:justify-between
    employee-base:gap-[22px] employee-base:mb-[25px] employee-page:screen-max-768:block
    employee-page:screen-max-768:mb-[22px]`}
      >
        <div>
          <p
            className={String.raw`intro-eyebrow employee-base:flex employee-base:items-center employee-base:gap-[11px] employee-base:mb-[10px]
    employee-base:text-[length:10px] employee-base:text-[color:var(--text-muted)]
    employee-page:screen-max-480:gap-[8px] employee-page:screen-max-480:text-[length:9px]`}
          >
            <span
              className={String.raw`eyebrow employee-base:text-[length:10px] employee-base:font-[700] employee-base:tracking-[1.4px]
    employee-base:uppercase employee-base:text-[color:var(--primary)]
    employee-page:screen-max-480:text-[length:9px] employee-page:screen-max-480:tracking-[1.1px]`}
            >
              MY WORKSPACE
            </span>
          </p>
          <h1>My Staff Profile</h1>
          <p
            className={String.raw`intro-description employee-base:mt-[9px] employee-base:text-[length:12px] employee-base:leading-[1.8]
    employee-base:text-[color:var(--text-secondary)]`}
          >
            Your official employee record with Hadiya Science &amp; IT Department.
          </p>
        </div>
      </div>
      {error ? (
        <section
          className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
        >
          <p
            className={String.raw`error-notice employee-base:p-[12px_14px] employee-base:[border:1px_solid_#f0d3dc] employee-base:rounded-[7px]
    employee-base:text-[length:12px] employee-base:leading-[1.7] employee-base:text-[color:#b42344]
    employee-base:[border-color:#f0d3dc] employee-base:[background:#fff0f3]`}
            role="alert"
          >
            {error}
          </p>
          <button
            className={String.raw`secondary-button mt-4 employee-base:inline-flex employee-base:min-h-[42px] employee-base:items-center
    employee-base:justify-center employee-base:gap-[9px] employee-base:p-[10px_17px]
    employee-base:[border:1px_solid_#d6e4e8] employee-base:rounded-[7px] employee-base:[background:white]
    employee-base:text-[color:var(--text-secondary)] employee-base:font-[600] employee-base:text-[length:13px]
    employee-base:leading-[1.4] employee-base:[box-shadow:none] employee-base:[transition:background_0.15s]
    employee-base:[border-color:#d6e4e8] employee-base:[&:hover:not(:disabled)]:[background:var(--search-bg)]`}
            onClick={() => {
              setError('')
              setRetry((value) => value + 1)
            }}
          >
            Try Again
          </button>
        </section>
      ) : data ? (
        <ProfileContent
          key={user.id}
          initialData={data}
        />
      ) : (
        <section
          className={String.raw`surface content-card employee-base:min-w-[0] employee-base:[border:1px_solid_var(--border)]
    employee-base:[background:var(--surface)] employee-base:rounded-[var(--card-radius)]
    employee-base:[box-shadow:var(--card-shadow)] employee-base:p-[22px_23px]
    employee-page:screen-max-768:p-[20px_17px]`}
        >
          <p
            role="status"
            className="text-[13px] text-text-secondary"
          >
            Loading your profile…
          </p>
        </section>
      )}
    </div>
  )
}
