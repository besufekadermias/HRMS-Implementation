import Card from '../common/Card.jsx'
import Icon from '../common/Icon.jsx'
import { OPERATIONS } from '../../utils/constants/constants.js'

export default function QuickActions({ onAction, descriptions }) {
  return (
    <Card className={`quick-actions tw:[.dashboard-middle>&]:p-[18px_16px] tw:p-[22px_17px_18px]
            tw:min-[768px]:max-[1280px]:[.dashboard-middle>&]:[grid-column:1_/_-1]
            tw:min-[1024px]:max-[1280px]:px-[17px] tw:max-[768px]:p-[20px_18px] `} aria-labelledby="quick-title">
      <div className="section-heading tw:[.quick-actions_&]:mb-[15px] tw:shared-base:flex tw:shared-base:justify-between
          tw:shared-base:items-start tw:shared-base:gap-[12px] tw:shared-base:mb-[20px] tw:shared-base:[&_h2]:flex
          tw:shared-base:[&_h2]:items-center tw:shared-base:[&_h2]:gap-[9px]
          tw:shared-base:[&_h2_>_svg]:[color:var(--primary)] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:mt-[6px] tw:shared-base:[&_p]:leading-[1.5]
          tw:max-[768px]:shared-base:[&_h2]:text-[15px]
          tw:max-[768px]:shared-base:gap-[8px] tw:max-[768px]:shared-base:[&_p]:text-[11px]">
        <div>
          <h2 id="quick-title">Quick Operations</h2>
          <p>Your everyday tasks, one click away</p>
        </div>
      </div>
      <div className="operation-list tw:flex tw:flex-col tw:gap-[8px]
          tw:min-[768px]:max-[1280px]:[.dashboard-middle>.quick-actions_&]:grid
          tw:min-[768px]:max-[1280px]:[.dashboard-middle>.quick-actions_&]:grid-cols-[repeat(2,_minmax(0,_1fr))]">
        {OPERATIONS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`operation tw:flex tw:items-center tw:gap-[11px] tw:[border:1px_solid_var(--border)] tw:rounded-[9px] tw:bg-[white]
          tw:p-[9px_11px] tw:w-full tw:min-h-[56px] tw:text-left tw:[transition:border_0.15s,background_0.15s]
          tw:hover:bg-[#f7fcfa] tw:hover:[border-color:#a5d7ca] tw:max-[768px]:min-h-[62px]
          tw:max-[768px]:px-[13px] `}
            onClick={() => onAction(item.id)}
          >
            <span className={`icon-circle tone-${item.tone} tw:shared-base:w-[46px] tw:shared-base:h-[46px] tw:shared-base:shrink-0 tw:shared-base:rounded-[50%]
          tw:shared-base:inline-flex tw:shared-base:items-center tw:shared-base:justify-center
          tw:[:where(&.tone-green)]:[color:#0b8972] tw:[:where(&.tone-green)]:[background:#e3f5f0]
          tw:[:where(&.tone-amber)]:[color:#a36b0d] tw:[:where(&.tone-amber)]:[background:#fff5dd]
          tw:[:where(&.tone-blue)]:[color:#4b8397] tw:[:where(&.tone-blue)]:[background:#eaf2f7]
          tw:[:where(&.tone-lavender)]:[color:#7566ba] tw:[:where(&.tone-lavender)]:[background:#f0edfb]
          tw:w-[34px] tw:h-[34px] `}>
              <Icon name={item.icon} size={19} />
            </span>
            <span className="operation-text tw:block tw:min-w-[0] tw:flex-[1]">
              <strong className="tw:block tw:text-[11px] tw:font-[600] tw:leading-[1.5] tw:max-[768px]:text-[12px]">{item.title}</strong>
              <small className="tw:block tw:text-[10px] tw:leading-[1.4] tw:text-[var(--text-muted)] tw:mt-[2px] tw:max-[768px]:text-[11px]">{descriptions[item.id] ?? item.description}</small>
            </span>
            <Icon className="tw:text-[#7b98a7]" name="chevron" size={16} />
          </button>
        ))}
      </div>
    </Card>
  )
}
