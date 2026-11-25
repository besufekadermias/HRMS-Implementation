const tones = {
  teal: 'bg-[#e4f4ed] text-[#087f6d]',
  blue: 'bg-[#eaf1fc] text-[#4d77ba]',
  amber: 'bg-[#fff4df] text-[#b47b21]',
  rose: 'bg-[#fcebf0] text-[#ba5771]',
}

export default function DepartmentStatCard({ label, value, detail, icon: Icon, tone }) {
  return <article className="flex min-w-0 items-start gap-4 rounded-[14px] border border-border bg-white p-5 shadow-[0_3px_14px_#123c3504]">
    <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={21} /></span>
    <div className="min-w-0">
      <p className="text-[12px] font-medium text-text-secondary">{label}</p>
      <strong className="mt-1 block text-[29px] font-bold leading-tight tracking-[-0.5px]">{value}</strong>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">{detail}</p>
    </div>
  </article>
}
