import { generalSettingsSchema, notificationSettingsSchema, normalizeWebsiteUrl } from '../../utils/validation/settingsSchemas.js'

// Local demo adapter. Keep API integration here when persistence is available.
export async function saveGeneralSettings(values) {
  const settings = generalSettingsSchema.parse(values)
  return { ...settings, website: normalizeWebsiteUrl(settings.website) }
}

export async function saveNotificationSettings(values) {
  return notificationSettingsSchema.parse(values)
}
