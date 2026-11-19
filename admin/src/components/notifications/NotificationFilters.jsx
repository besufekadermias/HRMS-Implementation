import { FormInput, FormSelect } from '../common/FormFields.jsx'
import Icon from '../common/Icon.jsx'
import Button from '../common/Button.jsx'
import { NOTIFICATION_CATEGORIES, NOTIFICATION_STATUSES } from '../../utils/constants/notificationConstants.js'

export default function NotificationFilters({ search, onSearch, category, onCategory, status, onStatus }) {
  const filtered = !!(search.trim() || category || status)
  return <div className="tw:flex tw:flex-wrap tw:items-end tw:gap-[14px] tw:p-[20px] tw:border-0 tw:border-b tw:border-solid tw:border-border tw:max-[640px]:p-[16px]">
    <label className="tw:flex-1 tw:min-w-[200px] tw:text-[11px] tw:font-semibold tw:text-text-secondary">
      Search notifications
      <div className="tw:flex tw:items-center tw:gap-[8px] tw:mt-[7px] tw:px-[11px] tw:border tw:border-solid tw:border-border tw:rounded-[7px] tw:focus-within:outline-2 tw:focus-within:outline-primary">
        <Icon name="search" size={17} />
        <FormInput type="search" value={search} onChange={event => onSearch(event.target.value)}
          placeholder="Search titles, messages or names…" aria-controls="notification-list"
          className="tw:m-0 tw:border-0 tw:bg-transparent tw:p-[10px_0] tw:focus:outline-none" />
      </div>
    </label>
    <label className="tw:text-[11px] tw:font-semibold tw:text-text-secondary tw:max-[640px]:flex-1">
      Category
      <FormSelect value={category} onChange={event => onCategory(event.target.value)} className="tw:mt-[7px]" aria-controls="notification-list">
        <option value="">All categories</option>
        {NOTIFICATION_CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      </FormSelect>
    </label>
    <label className="tw:text-[11px] tw:font-semibold tw:text-text-secondary tw:max-[640px]:flex-1">
      Read status
      <FormSelect value={status} onChange={event => onStatus(event.target.value)} className="tw:mt-[7px]" aria-controls="notification-list">
        {NOTIFICATION_STATUSES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      </FormSelect>
    </label>
    {filtered && <Button type="button" variant="secondary" onClick={() => { onSearch(''); onCategory(''); onStatus('') }}>Reset filters</Button>}
  </div>
}
