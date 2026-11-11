import Icon from '../common/Icon.jsx'
import { OPERATIONS } from '../../utils/constants/constants.js'

export default function QuickActions({ onAction, leaveSummary }) {
  return (
    <section className="card quick-actions" aria-labelledby="quick-title">
      <div className="section-heading">
        <div>
          <h2 id="quick-title">Quick Operations</h2>
          <p>Your everyday tasks, one click away</p>
        </div>
      </div>
      <div className="operation-list">
        {OPERATIONS.map((item) => (
          <button
            type="button"
            key={item.id}
            className="operation"
            onClick={() => onAction(item.id)}
          >
            <span className={`icon-circle tone-${item.tone}`}>
              <Icon name={item.icon} size={19} />
            </span>
            <span className="operation-text">
              <strong>{item.title}</strong>
              <small>{leaveSummary && item.id === 'pending-leave'
                ? `${leaveSummary.pending} requests awaiting your review`
                : leaveSummary && item.id === 'approved-leave'
                  ? `${leaveSummary.approved} approved leave requests`
                  : item.description}</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </div>
    </section>
  )
}
