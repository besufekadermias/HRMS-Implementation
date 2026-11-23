import api from '../api/api.js'
import { rewardsResponseSchema } from '../../utils/validation/rewardSchemas.js'
export async function loadRewards(employeeId, signal) {
  const parsed = rewardsResponseSchema.safeParse(
    (
      await api.get('/employee/rewards', {
        signal,
      })
    ).data,
  )
  if (!parsed.success) {
    throw new Error(
      'Recognition records are incomplete or inconsistent. Please retry or contact HR.',
    )
  }
  if (parsed.data.employeeId !== employeeId) {
    throw new Error('The service returned another employee’s recognitions. Contact HR.')
  }
  return {
    ...parsed.data,
    records: [...parsed.data.records].sort(
      (a, b) => b.awardDate.localeCompare(a.awardDate) || a.id.localeCompare(b.id),
    ),
  }
}
