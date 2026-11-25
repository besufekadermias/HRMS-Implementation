import { ArrowLeft, Users, Building2, KeyRound, Info, Upload, FileText, Image, Eye, EyeOff, Check } from 'lucide-react'
const icons = { 'arrow-left': ArrowLeft, users: Users, building: Building2, key: KeyRound, info: Info, upload: Upload, file: FileText, image: Image, eye: Eye, 'eye-off': EyeOff, check: Check }
export function Icon({ name, size = 20, ...props }) { const Component = icons[name] || Info; return <Component size={size} aria-hidden="true" {...props} /> }

const buttonBase = 'inline-flex items-center justify-center gap-[9px] rounded-[7px] border border-solid font-semibold leading-[1.4] [transition:background_0.15s,box-shadow_0.15s]'
const buttonSizes = {
  default: 'min-h-[42px] px-[17px] py-[10px] text-[13px]',
  payslip: 'min-h-[33px] px-[10px] py-[6px] text-[11px]',
  'leave-manage': 'min-h-[34px] px-[9px] py-[6px] text-[11px]',
}

const buttonVariants = {
  primary: 'border-transparent text-white bg-primary [box-shadow:0_3px_8px_#087f6d10] hover:bg-primary-hover',
  secondary: 'bg-white border-[#d6e4e8] text-text-secondary hover:bg-[var(--search-bg)]',
  danger: 'border-transparent text-white bg-[#c73f5b] hover:bg-[#ac2d49]',
  'danger-outline': 'bg-white border-[#f0cbd4] text-[#be3e58] hover:bg-[#fff2f5]',
  discipline: 'text-white bg-[#df0015] border-[#df0015] hover:bg-[#bd0012] hover:border-[#bd0012]',
  reject: 'text-[#b52f3f] border-[#f3c6cd] bg-[#fff3f5] hover:bg-[#ffe1e7]',
}

const iconBase = 'items-center justify-center p-2 bg-transparent'
const iconVariants = {
  default: 'inline-flex [border:none] rounded-lg text-text-secondary hover:bg-[#edf6f5] hover:text-primary',
  edit: 'inline-flex border border-solid border-border rounded-[9px] text-text-secondary hover:bg-[#edf6f5] hover:text-primary',
  delete: 'inline-flex [border:none] rounded-lg text-text-secondary hover:bg-[#fff0f3] hover:text-[#b42344]',
  'muted-delete': 'inline-flex [border:none] rounded-lg text-[var(--text-muted)] hover:bg-[#fff0f3] hover:text-[#b42344]',
  menu: 'hidden max-[1024px]:inline-flex max-[1024px]:shrink-0 [border:none] rounded-lg text-text-secondary hover:bg-[#edf6f5] hover:text-primary',
  sidebar: 'inline-flex [border:none] rounded-lg text-[#9bbdb7] hover:bg-[#ffffff12] hover:text-primary',
}

// Marker classes support contextual Tailwind selectors in existing page layouts.
export function Button({ as: Tag = 'button', variant = 'primary', size = 'default', className = '', ...props }) {
  return <Tag {...props} className={`button button-${variant}  ${buttonBase}  ${buttonSizes[size]}  ${buttonVariants[variant]}  ${className}`} />
}

export function IconButton({ variant = 'default', notification = false, className = '', ...props }) {
  return <button {...props} className={`icon-button ${iconBase}  ${variant === "sidebar" ? "w-8 h-9 ml-auto" : "size-10"}  ${iconVariants[variant]}  ${notification ? "relative" : ""}  ${className}`} />
}

export function TextButton({ className = '', ...props }) {
  return <button {...props} className={`text-button inline-flex items-center justify-center gap-[9px] min-h-9 py-1 pr-0 pl-2
          [border:0] bg-none bg-transparent text-primary text-[12px] font-semibold
          whitespace-nowrap hover:text-primary-hover hover:underline max-[768px]:text-[11px]
          max-[768px]:gap-[5px] ${className}`} />
}

const fieldBase = 'block w-full min-w-0 px-3 py-[11px] border border-solid bg-white text-text-primary font-normal'
const fieldVariants = {
  form: `${fieldBase} mt-[9px] border-[#d6e4e8] rounded-md text-[13px] max-[480px]:text-[16px] placeholder:text-[#879eab]`,
  employee: `${fieldBase} h-[45px] mt-2 border-[#dbe7e4] rounded-[7px] text-[12px]`,
  'employee-file': 'placeholder:text-[#92a49f] aria-invalid:border-[#d87589] aria-invalid:bg-[#fffafb]',
  'leave-note': 'w-full px-3 py-[10px] border border-solid border-[#d6e4e8] rounded-[7px] bg-white text-text-primary text-[13px] max-[768px]:text-[16px]',
}
const employeeInputStates = 'max-[560px]:text-[16px] aria-invalid:border-[#d87589] aria-invalid:bg-[#fffafb]'

// React 19 passes ref as a prop, so RHF's register ref reaches the native field.
// Keep input types, events, disabled state, and file/checkbox values untouched.
export function FormInput({ variant = 'form', className = '', ...props }) {
  const states = variant === 'employee' ? `${employeeInputStates} placeholder:text-[#92a49f]` : ''
  return <input {...props} className={`${fieldVariants[variant]}  ${states}  ${className}`} />
}

export function FormSelect({ variant = 'form', className = '', ...props }) {
  const states = variant === 'employee' ? employeeInputStates : ''
  return <select {...props} className={`${fieldVariants[variant]}  ${states}  ${className}`} />
}

export function FormTextarea({ variant = 'form', className = '', ...props }) {
  const sizing = variant === 'form' ? 'resize-y min-h-[130px]'
    : variant === 'leave-note' ? 'resize-y min-h-[85px]' : ''
  return <textarea {...props} className={`${fieldVariants[variant]}  ${sizing}  ${className}`} />
}

// Keep each card's native tag and page-specific layout classes.
export function Card({ as: Tag = 'section', background = 'surface', className = '', ...props }) {
  return <Tag {...props} className={`card employee-base:min-w-0 employee-base:border employee-base:border-solid employee-base:border-border
          employee-base:rounded-[var(--card-radius)] employee-base:[box-shadow:var(--card-shadow)] ${background === "white" ? "employee-base:bg-white" : "employee-base:bg-surface"}  ${className}`} />
}
