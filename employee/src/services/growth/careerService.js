import api from '../api/api.js'
import { careerResponseSchema } from '../../utils/validation/careerSchemas.js'
export async function loadCareer(employeeId, signal) {
  const { data } = await api.get('/employee/career', {
    signal,
  })
  const parsed = careerResponseSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Career records are incomplete or inconsistent. Please retry or contact HR.')
  }
  if (parsed.data.employeeId !== employeeId) {
    throw new Error('The service returned another employee’s career records. Contact HR.')
  }
  return {
    ...parsed.data,
    records: [...parsed.data.records].sort(
      (a, b) => b.effectiveDate.localeCompare(a.effectiveDate) || a.id.localeCompare(b.id),
    ),
  }
}
