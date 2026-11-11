import Icon from './Icon.jsx'

export default function StatCard({
  label,
  value,
  icon,
  tone = 'green',
  detail,
}) {
  return (
    <article className="stat-card">
      <div className={`icon-circle tone-${tone}`}>
        <Icon name={icon} size={25} />
      </div>
      <div className="stat-content">
        <h2>{label}</h2>
        <p className="stat-value">{value}</p>
        <p className="stat-detail">
          <span className={`status-dot tone-${tone}`} />
          {detail}
        </p>
      </div>
    </article>
  )
}
