import { useEffect } from 'react'
import { useAdminStore } from '../../store/index.js'
import { INITIAL_CAREER_MILESTONES, recordCareerMilestone, applyDueCareerMilestones, cancelCareerMilestone } from '../../services/growth/careerService.js'

export default function useCareer(employees, grades, enabled = true) {
  const milestones = useAdminStore(state => state.careerMilestones)
  const setMilestones = useAdminStore(state => state.setCareerMilestones)
  const setCareerState = useAdminStore(state => state.setCareerState)

  useEffect(() => {
    if (!enabled || !milestones.some((item) => item.status === 'SCHEDULED')) return undefined
    function applyDue() {
      const result = applyDueCareerMilestones(milestones, employees, grades)
      if (result.milestones !== milestones || result.employees !== employees)
        setCareerState(result)
    }
    // Catch up after sleep/focus; a minute check also handles Nairobi midnight.
    const initialCheck = window.setTimeout(applyDue, 0)
    const timer = window.setInterval(applyDue, 60000)
    window.addEventListener('focus', applyDue)
    document.addEventListener('visibilitychange', applyDue)
    return () => {
      window.clearTimeout(initialCheck)
      window.clearInterval(timer)
      window.removeEventListener('focus', applyDue)
      document.removeEventListener('visibilitychange', applyDue)
    }
  }, [milestones, employees, grades, enabled, setCareerState])

  function save(values) {
    const due = applyDueCareerMilestones(milestones, employees, grades)
    const result = recordCareerMilestone(due.milestones, due.employees, grades, values)
    setCareerState(result)
    return result.milestone
  }

  return {
    milestones, save,
    cancel: (id) => setMilestones(cancelCareerMilestone(milestones, id)),
    reset: () => setMilestones(INITIAL_CAREER_MILESTONES),
    remapEmployeeId: (oldId, newId) => setMilestones((current) => current.map((item) => item.employeeId === oldId ? { ...item, employeeId: newId } : item)),
    removeEmployee: (id) => setMilestones((current) => current.filter((item) => item.employeeId !== id)),
  }
}
