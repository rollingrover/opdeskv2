'use client'
import Image from 'next/image'

// Maps semantic names to the custom icon pack shipped in /public/icons.
// Each entry carries its real width/height ratio (measured directly from the
// PNG). This matters: Next/Image's dev-mode warning ("has either width or
// height modified, but not the other") fires when the *declared* width/height
// props imply a different aspect ratio than the image actually renders at —
// not just when inline CSS conflicts. Forcing every icon into a square
// width=height in an earlier version of this component satisfied the props
// but not the real file, which both distorted non-square crops and kept
// triggering the warning. Passing the correct ratio as props (rather than
// overriding size via `style`) fixes both at the source.
const ICONS = {
  // operator types
  safari: { file: 'safari-operations-icon.png', ratio: 1 },
  gameLodge: { file: 'game-lodges-icon.png', ratio: 1 },
  fishing: { file: 'fishing-charters-icon.png', ratio: 1 },
  yacht: { file: 'yacht-charters-icon.png', ratio: 1 },
  shuttle: { file: 'shuttle-companies-icon.png', ratio: 1 },
  trailGuide: { file: 'trail-guides-icon.png', ratio: 1 },
  eastAfrica: { file: 'east-africa-tours-icon.png', ratio: 1 },
  islandTransfer: { file: 'island-transfers-icon.png', ratio: 1 },

  // feature icons (marketing / features page)
  fleet: { file: 'fleet-management-icon.png', ratio: 1 },
  guides: { file: 'guide-management-icon.png', ratio: 1 },
  driversShuttles: { file: 'drivers-shuttles-icon.png', ratio: 1 },
  bookingCalendar: { file: 'booking-and-calender-icon.png', ratio: 1 },
  trailsModule: { file: 'trails-module-icon.png', ratio: 1 },
  firearmRegister: { file: 'firearm-register-icon.png', ratio: 1 },
  multiCurrency: { file: 'multi-currency-and-languge-icon.png', ratio: 1 },
  whiteLabel: { file: 'white-label-branding-icon.png', ratio: 1 },
  csvExport: { file: 'csv-data-export-icon.png', ratio: 1 },
  autoBackup: { file: 'auto-email-backup-icon.png', ratio: 1 },
  schedules: { file: 'schedules-shiofts-icon.png', ratio: 1 },
  teamRoles: { file: 'team-roles-icon.png', ratio: 1 },
  dashboardReports: { file: 'dashboard-and-reports-icon.png', ratio: 1 },
  proformaInvoice: { file: 'proforma-invoice-icon.png', ratio: 1 },
  marketing: { file: 'marketing-page-icon.png', ratio: 1 },

  // dashboard stat-card icons
  totalRevenue: { file: 'total-revenue-icon.png', ratio: 1 },
  totalBookings: { file: 'total-bookings-icon.png', ratio: 1 },
  totalGuides: { file: 'total-guides-icon.png', ratio: 1 },
  thisMonth: { file: 'this-month-icon.png', ratio: 1 },

  // status icons
  confirmed: { file: 'confirmed-icon.png', ratio: 1 },
  cancelled: { file: 'cancelled-icon.png', ratio: 1 },
  pending: { file: 'pending-icon.png', ratio: 1 },
  upcoming: { file: 'upcoming-icon.png', ratio: 1 },

  // emoji replacements (empty states, quick actions, misc UI) — the
  // non-square crops that were triggering the warning
  comingSoon: { file: 'coming-soon-icon.png', ratio: 1.220 },
  greeting: { file: 'greeting-icon.png', ratio: 1.212 },
  companySetup: { file: 'company-setup-icon.png', ratio: 1.308 },
  errorIcon: { file: 'error-icon.png', ratio: 1.159 },
  noBookings: { file: 'no-bookings-icon.png', ratio: 1.190 },
  addStaff: { file: 'add-staff-icon.png', ratio: 1.027 },
  newInvoice: { file: 'new-invoice-icon.png', ratio: 1.135 },
  settingsIcon: { file: 'settings-icon.png', ratio: 1.073 },
  noVehicles: { file: 'no-vehicles-icon.png', ratio: 1.264 },
  noVessels: { file: 'no-vessels-icon.png', ratio: 1.240 },
  noRooms: { file: 'no-rooms-icon.png', ratio: 1.250 },
  reportsIcon: { file: 'reports-icon.png', ratio: 1.127 },
  arrowRight: { file: 'arrow-right-icon.png', ratio: 2.422 },
}

// `size` is treated as the icon's height; width is derived from the real
// aspect ratio so the declared props always match the actual file.
export function BrandIcon({ name, size = 32, alt, className, style }) {
  const icon = ICONS[name]
  if (!icon) return null
  const height = size
  const width = Math.round(size * icon.ratio)
  return (
    <Image
      src={`/icons/${icon.file}`}
      alt={alt || name}
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  )
}

export const BRAND_ICON_KEYS = Object.keys(ICONS)
