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
  'delivery-management': { icon: 'delivery', groupKey: 'operations' },
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
  'booking-widget': { icon: 'bookingCalendar', groupKey: 'operations' },
  'rate-sheet-gate-fees': { icon: 'proformaInvoice', groupKey: 'finance' },
  'hr-package': { icon: 'teamRoles', groupKey: 'staffHr' },
  // Solution pages for each operator vertical — reuse the exact same
  // /features/[slug] template, static generation, and metadata pipeline as
  // the feature pages above rather than a separate system, since it's the
  // same job: one focused, crawlable page per search intent.
  'safari-lodge-software': { icon: 'safari', groupKey: 'verticals' },
  'shuttle-transfer-software': { icon: 'shuttle', groupKey: 'verticals' },
  'fishing-charter-software': { icon: 'fishing', groupKey: 'verticals' },
  'yacht-charter-software': { icon: 'yacht', groupKey: 'verticals' },
  'trail-guide-software': { icon: 'trailGuide', groupKey: 'verticals' },
  'guesthouse-hotel-software': { icon: 'gameLodge', groupKey: 'verticals' },
  'east-africa-tour-software': { icon: 'eastAfrica', groupKey: 'verticals' },
  'island-transfer-software': { icon: 'islandTransfer', groupKey: 'verticals' },
  'logistics-delivery-software': { icon: 'delivery', groupKey: 'verticals' },
  'river-boat-cruise-software': { icon: 'yacht', groupKey: 'verticals' },
}

export const FEATURE_SLUGS = Object.keys(FEATURES_META)
