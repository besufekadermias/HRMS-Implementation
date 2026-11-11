import { useEffect, useState } from 'react'
import { INITIAL_CAREER_MILESTONES, recordCareerMilestone, applyDueCareerMilestones, cancelCareerMilestone } from '../../services/growth/careerService.js'

export default function useCareer(employees, grades, setEmployees, enabled = true) {
  const [milestones, setMilestones] = useState(INITIAL_CAREER_MILESTONES)

  useEffect(() => {
    if (!enabled || !milestones.some((item) => item.status === 'SCHEDULED')) return undefined
    function applyDue() {
      const result = applyDueCareerMilestones(milestones, employees, grades)
      if (result.milestones !== milestones) setMilestones(result.milestones)
      if (result.employees !== employees) setEmployees(result.employees)
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
  }, [milestones, employees, grades, setEmployees, enabled])

  function save(values) {
    const due = applyDueCareerMilestones(milestones, employees, grades)
    const result = recordCareerMilestone(due.milestones, due.employees, grades, values)
    setMilestones(result.milestones)
    if (result.employees !== employees) setEmployees(result.employees)
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
