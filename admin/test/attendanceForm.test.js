import assert from 'node:assert/strict'
import test from 'node:test'
import { zodResolver } from '@hookform/resolvers/zod'
import { attendanceSettingsSchema } from '../src/utils/validation/operationsSchemas.js'
import { validateAttendanceSettingsRules, normalizeAttendanceSettings } from '../src/services/operations/attendanceService.js'

const resolve = zodResolver(attendanceSettingsSchema, undefined, { raw: true })
const options = { fields: {}, shouldUseNativeValidation: false }
const settings = { startTime: '08:00', endTime: '17:00', gracePeriod: '15', allowedIps: '' }

test('attendance form rejects malformed times and fractional grace periods', async () => {
  const response = await resolve({ ...settings, startTime: '25:00', endTime: '', gracePeriod: '1.5' }, {}, options)
  assert.match(response.errors.startTime.message, /valid start time/)
  assert.match(response.errors.endTime.message, /valid end time/)
  assert.match(response.errors.gracePeriod.message, /whole number/)
  assert.deepEqual(response.values, {})
})

test('attendance form retains schedule limits and duplicate IP checks after field validation', async () => {
  const response = await resolve({ ...settings, endTime: '07:00', allowedIps: '::1,0:0:0:0:0:0:0:1' }, {}, options)
  assert.deepEqual(response.errors, {})
  const errors = validateAttendanceSettingsRules(response.values)
  assert.match(errors.endTime, /after start time/)
  assert.match(errors.allowedIps, /duplicate/)
  assert.match(validateAttendanceSettingsRules({ ...settings, gracePeriod: '540' }).gracePeriod, /shorter/)
  assert.match(validateAttendanceSettingsRules({ ...settings, allowedIps: 'https://example.com' }).allowedIps, /IPv4 or IPv6/)
})

test('attendance settings normalize only on save and keep blank IP lists valid', async () => {
  const values = { ...settings, gracePeriod: '0015', allowedIps: '192.0.2.10, 2001:0db8:0:0:0:0:0:10' }
  const response = await resolve(values, {}, options)
  assert.deepEqual(response.errors, {})
  assert.deepEqual(validateAttendanceSettingsRules(response.values), {})
  const normalized = normalizeAttendanceSettings(response.values)
  assert.deepEqual(normalized, { ...settings, gracePeriod: '15', allowedIps: '192.0.2.10\n2001:db8::10' })
  assert.equal(values.gracePeriod, '0015')
  assert.equal(response.values.allowedIps, values.allowedIps)
  assert.deepEqual(validateAttendanceSettingsRules(settings), {})
  assert.equal(normalizeAttendanceSettings(settings).allowedIps, '')
})
