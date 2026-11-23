// Matches the brand mark used in the admin portal.
export default function BrandMark({ className = '' }) {
  return (
    <svg
      className={className}
      width="35"
      height="39"
      viewBox="0 0 35 39"
      aria-hidden="true"
    >
      <path
        fill="#10ba91"
        d="M15 3h13a6 6 0 0 1 6 6v22a6 6 0 0 1-10 4L11 22V9a6 6 0 0 1 4-6"
      />
      <path
        fill="#079d7a"
        d="m16 12 12 13-11 11a6 6 0 0 1-9-4V20z"
      />
      <path
        fill="#19c59b"
        d="M7 20h3l8 8-8 8H7a6 6 0 0 1-6-6v-4a6 6 0 0 1 6-6"
      />
    </svg>
  )
}
