import { useRef } from 'react'
import { useEmployeeStore } from '../../store/index.js'
import { createDepartmentEmployee, loadDepartmentTeam } from '../../services/department/departmentService.js'
import { matchesCreatedEmployee } from '../../utils/validation/departmentEmployeeSchemas.js'
import { isDepartmentHead } from '../../utils/helpers/portalAccess.js'

export default function useCreateDepartmentEmployee(options) {
  const user = useEmployeeStore(state => state.user)
  const saving = useRef(false)

  async function save(values, key) {
    const current = useEmployeeStore.getState()
    if (saving.current || current.employeeBusy) throw new Error('An employee is already being saved.')
    if (!options?.canCreateEmployee || options.department.id !== user.departmentId ||
      current.user?.id !== user.id || !isDepartmentHead(current.user) || current.user.mustChangePassword) {
      throw new Error('Refresh the employee form before saving.')
    }
    saving.current = true
    current.setEmployeeBusy(true)
    try {
      let employee
      try {
        employee = await createDepartmentEmployee(user, values, key)
      } catch (failure) {
        // A lost response must not create another account on retry.
        try {
          const team = await loadDepartmentTeam(user)
          employee = team.employees.find(member => matchesCreatedEmployee(member, values, key))
        } catch {
          // Preserve the original failure when its receipt cannot be confirmed.
        }
        if (!employee) throw failure
      }
      const active = useEmployeeStore.getState().user
      if (active?.id !== user.id || active.departmentId !== user.departmentId || !isDepartmentHead(active) || active.mustChangePassword) {
        throw new Error('Your session changed. Sign in again before continuing.')
      }
      return employee
    } finally {
      saving.current = false
      useEmployeeStore.getState().setEmployeeBusy(false)
    }
  }
  return save
}
