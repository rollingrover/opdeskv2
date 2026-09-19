// Stable, locale-independent metadata for the /features/[slug] SEO pages —
// icon and category grouping. The actual translatable content (title,
// meta tags, intro, benefits, audience) lives in
// lib/featuresContentTranslations.js, keyed by locale, so this file
// doesn't need to change per language.

export const FEATURES_META = {
  'bookings-calendar': { icon: 'bookingCalendar', groupKey: 'operations' },
  'fleet-management': { icon: 'fleet', groupKey: 'operations' },
  'trails-module': { icon: 'trailsModule', groupKey: 'operations' },
  'shifts-scheduling': { icon: 'schedules', groupKey: 'operations' },
  'staff-roles': { icon: 'teamRoles', groupKey: 'staffHr' },
  'certifications': { icon: 'guides', groupKey: 'staffHr' },
  'firearm-register': { icon: 'firearmRegister', groupKey: 'staffHr' },
  'cost-to-company': { icon: 'driversShuttles', groupKey: 'staffHr' },
  'lodging-rooms': { icon: 'gameLodge', groupKey: 'guestProperty' },
  'housekeeping': { icon: 'shuttle', groupKey: 'guestProperty' },
  'guest-directory': { icon: 'islandTransfer', groupKey: 'guestProperty' },
  'invoicing': { icon: 'proformaInvoice', groupKey: 'finance' },
  'reports-analytics': { icon: 'dashboardReports', groupKey: 'finance' },
  'csv-export': { icon: 'csvExport', groupKey: 'finance' },
  'automatic-backups': { icon: 'autoBackup', groupKey: 'finance' },
  'multi-currency': { icon: 'multiCurrency', groupKey: 'platform' },
  'white-label-branding': { icon: 'whiteLabel', groupKey: 'platform' },
  'built-for-africa': { icon: 'marketing', groupKey: 'platform' },
}

export const FEATURE_SLUGS = Object.keys(FEATURES_META)
