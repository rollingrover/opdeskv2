export const OPERATOR_TYPES = [
  { value: 'safari',   label: 'Safari / Game Lodge',       icon: 'safari-operations-icon2.png' },
  { value: 'shuttle',  label: 'Shuttle & Transfers',        icon: 'shuttle-companies-icon2.png' },
  { value: 'fishing',  label: 'Fishing Charter',            icon: 'fishing-charters-icon2.png' },
  { value: 'yacht',    label: 'Yacht Charter',              icon: 'yacht-charters-icon2.png' },
  { value: 'trail',    label: 'Trail Guide & Adventure',    icon: 'trail-guides-icon2.png' },
  { value: 'lodge',    label: 'Hotel / Guesthouse / B&B',  icon: 'game-lodges-icon2.png' },
  { value: 'eastafrica', label: 'East Africa Tours',        icon: 'east-africa-tours-icon.png' },
  { value: 'transfer', label: 'Island Transfers',           icon: 'island-transfers-icon.png' },
  { value: 'delivery', label: 'Logistics & Support Services',  icon: 'shuttle-companies-icon2.png' },
  { value: 'river_cruise', label: 'Boat Cruises / River, Estuary & Dam', icon: 'yacht-charters-icon2.png' },
  { value: 'hr_bureau', label: 'HR Services Bureau', icon: 'team-roles-icon.png' },
]

export const CURRENCIES = [
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'BWP', symbol: 'P',   name: 'Botswana Pula' },
  { code: 'NAD', symbol: 'N$',  name: 'Namibian Dollar' },
  { code: 'ZWL', symbol: 'Z$',  name: 'Zimbabwean Dollar' },
  { code: 'MZN', symbol: 'MT',  name: 'Mozambican Metical' },
  { code: 'ZMW', symbol: 'ZK',  name: 'Zambian Kwacha' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'RWF', symbol: 'RF',  name: 'Rwandan Franc' },
  { code: 'MWK', symbol: 'MK',  name: 'Malawian Kwacha' },
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar' },
]

export const LANGUAGES = [
  { code: 'en',    name: 'English' },
  { code: 'af',    name: 'Afrikaans' },
  { code: 'fr',    name: 'French' },
  { code: 'pt',    name: 'Portuguese' },
  { code: 'sw',    name: 'Swahili' },
  { code: 'zu',    name: 'Zulu' },
  { code: 'xh',    name: 'Xhosa' },
  { code: 'st',    name: 'Sotho' },
  { code: 'de',    name: 'German' },
  { code: 'nl',    name: 'Dutch' },
  { code: 'es',    name: 'Spanish' },
  { code: 'it',    name: 'Italian' },
]

export const CERT_TYPES = [
  { value: 'FGASA_L1',    label: 'FGASA Level 1' },
  { value: 'FGASA_L2',    label: 'FGASA Level 2' },
  { value: 'FGASA_L3',    label: 'FGASA Level 3' },
  { value: 'first_aid_l1', label: 'First Aid Level 1' },
  { value: 'first_aid_adv', label: 'First Aid Advanced' },
  { value: 'firearm',     label: 'Firearm Competency' },
  { value: 'pdp',         label: 'PDP (Professional Driving Permit)' },
  { value: 'skipper',     label: "Skipper's Licence" },
  { value: 'padi',        label: 'PADI Dive Certification' },
  { value: 'yellow_fever', label: 'Yellow Fever Vaccination' },
  { value: 'pax_vehicle', label: 'Passenger Vehicle Licence' },
  { value: 'custom',      label: 'Other / Custom' },
]

export const STAFF_TYPES = [
  { value: 'guide',        label: 'Guide / Ranger' },
  { value: 'driver',       label: 'Driver' },
  { value: 'skipper',      label: 'Skipper / Crew' },
  { value: 'housekeeper',  label: 'Housekeeper' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'chef',         label: 'Chef / Cook' },
  { value: 'maintenance',  label: 'Maintenance' },
  { value: 'admin',        label: 'Admin / Office' },
  { value: 'security',     label: 'Security' },
  { value: 'other',        label: 'Other' },
]

export const BOOKING_STATUSES = [
  { value: 'pending',    label: 'Pending',    color: 'amber' },
  { value: 'confirmed',  label: 'Confirmed',  color: 'green' },
  { value: 'completed',  label: 'Completed',  color: 'blue' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'red' },
  { value: 'no_show',    label: 'No Show',    color: 'gray' },
]

export const ROOM_TYPES = [
  { value: 'single',         label: 'Single Room' },
  { value: 'double',         label: 'Double Room' },
  { value: 'twin',           label: 'Twin Room' },
  { value: 'family',         label: 'Family Room' },
  { value: 'suite',          label: 'Suite' },
  { value: 'chalet',         label: 'Chalet' },
  { value: 'tent',           label: 'Luxury Tent' },
  { value: 'tented_camp',    label: 'Tented Camp' },
  { value: 'campsite_small', label: 'Campsite (Small)' },
  { value: 'campsite_large', label: 'Campsite (Large)' },
  { value: 'dormitory',      label: 'Dormitory' },
]

// Extra staff seats are sold in packs rather than one at a time — bigger
// packs carry a steeper per-seat discount off the base rate in
// addon_pricing ('guides', currently R99/seat). Total price per pack,
// not per-seat — divide by the pack size to get the effective rate.
export const STAFF_PACK_PRICING = {
  5: 445,   // R89/seat
  10: 790,  // R79/seat
  20: 1380, // R69/seat
  50: 2950, // R59/seat
}

// Modules available per operator type
export const OPERATOR_MODULES = {
  safari:     ['bookings','staff','certs','costs','shifts','leave','vehicles','rooms','housekeeping','firearm','invoices','quotations','guides','reports'],
  shuttle:    ['bookings','staff','certs','costs','shifts','leave','vehicles','invoices','quotations','drivers','reports'],
  fishing:    ['bookings','staff','certs','costs','shifts','leave','vessels','firearm','invoices','quotations','guides','reports'],
  yacht:      ['bookings','staff','certs','costs','shifts','leave','vessels','invoices','quotations','reports'],
  trail:      ['bookings','staff','certs','costs','shifts','leave','vehicles','trails','firearm','invoices','quotations','guides','reports'],
  lodge:      ['bookings','staff','certs','costs','shifts','leave','rooms','housekeeping','invoices','quotations','reports'],
  eastafrica: ['bookings','staff','certs','costs','shifts','leave','vehicles','invoices','quotations','guides','reports'],
  transfer:   ['bookings','staff','certs','costs','shifts','leave','vehicles','invoices','quotations','drivers','reports'],
  delivery:   ['staff','certs','costs','shifts','leave','vehicles','invoices','quotations','drivers','reports','delivery_clients','delivery_orders'],
  river_cruise: ['bookings','staff','certs','costs','shifts','leave','vessels','invoices','quotations','reports'],
  hr_bureau: ['staff','certs','costs','shifts','leave','reports'],
}

// The 5 subscription tiers, in ascending order. Every vertical (safari,
// shuttle, lodging, etc.) uses this exact same ladder — pricing and gating
// logic is intentionally universal across operator types; OPERATOR_MODULES
// above only controls which modules make sense for a given *business type*,
// completely separately from which modules a company can afford/has bought.
export const TIERS = ['free', 'basic', 'standard', 'professional', 'enterprise']
export const TIER_LABELS = { free: 'Free', basic: 'Basic', standard: 'Standard', professional: 'Professional', enterprise: 'Enterprise' }

// Gated modules: these are real, fully built features, but only usable if
// the company's tier includes them OR they've bought the matching add-on.
// A module NOT listed here (bookings, staff, invoices, reports, settings...)
// is never gated — it's available to everyone regardless of tier.
export const GATED_MODULES = ['certifications', 'shifts', 'costs', 'leave', 'quotations', 'ical_sync', 'delivery_management', 'checklists']

// Every module in the app, base and gated alike — used by the superadmin
// Marketing Packages editor to show the complete feature matrix per
// package, not just the historically tier-gated subset. A package's
// modules JSON can now explicitly set ANY of these to false to hide it
// regardless of operator type (see Sidebar.js isVisible) — missing/
// undefined means "not overridden", which for a base module means
// included (its long-standing default behavior), and for a gated module
// means excluded (matching GATED_MODULES' existing default-false).
export const ALL_MODULE_INFO = {
  bookings: { label: 'Bookings & Calendar', description: 'Core booking creation, editing and calendar view.', base: true },
  staff: { label: 'Staff Directory', description: 'Staff member records and roles.', base: true },
  certifications: { label: 'Certifications', description: 'Track staff certifications and expiry dates.' },
  costs: { label: 'Cost to Company', description: 'Per-staff cost-to-company tracking.' },
  shifts: { label: 'Shifts & Scheduling', description: 'Staff shift scheduling.' },
  leave: { label: 'Leave', description: 'Staff leave requests and balances.' },
  rooms: { label: 'Lodging & Rooms', description: 'Room inventory, bookings and availability calendar.', base: true },
  housekeeping: { label: 'Housekeeping', description: 'Room housekeeping task board.', base: true },
  vehicles: { label: 'Fleet — Vehicles', description: 'Vehicle records and fleet management.', base: true },
  vessels: { label: 'Fleet — Vessels', description: 'Boats, yachts and vessel records.', base: true },
  guides: { label: 'Guides Directory', description: 'Professional guide directory (distinct from general staff).', base: true },
  trails: { label: 'Trails', description: 'Trail routes, difficulty and capacity.', base: true },
  firearm: { label: 'Firearm Register', description: 'Compliant firearm tracking for safari/fishing operators.', base: true },
  invoices: { label: 'Invoices', description: 'Pro forma and tax invoicing.', base: true },
  quotations: { label: 'Quotations', description: 'Client quotations before booking confirmation.' },
  checklists: { label: 'Checklists & Inventory', description: 'Printable checklists and inventory lists.' },
  ical_sync: { label: 'Channel Sync', description: 'Airbnb/Booking.com calendar sync.' },
  delivery_management: { label: 'Delivery & Supply Management', description: 'Full logistics module — client price lists, orders, statements.' },
  delivery_clients: { label: 'Logistics — Clients', description: 'Delivery client directory and price lists.', base: true },
  delivery_orders: { label: 'Logistics — Orders', description: 'Delivery order log and statements.', base: true },
  reports: { label: 'Reports & Analytics', description: 'Occupancy, revenue and booking trend reports.', base: true },
}

// Which tiers include each gated module for free, out of the box.
// Quotations sits with Basic upward rather than free — it's a sales tool for
// operators actively trying to close paying business, not a Free-tier
// exploration feature — but it's deliberately not locked as far up the
// ladder as the HR modules, since a Basic-tier operator sending quotes to
// prospective clients is exactly the kind of usage that should feel included.
// delivery_management sits with certifications/ical_sync at Professional+ —
// it's a genuinely new vertical's core feature set (clients, price lists,
// cost calculator), not a small add-on, so it's priced and gated like the
// other substantial modules rather than bundled in earlier for free.
// Kept in sync with the universal pooled-tier rows in marketing_packages —
// this is only the fallback path for a company not yet linked to a package
// row (see moduleAccess.js), so the DB is the real source of truth.
export const TIER_INCLUDED_MODULES = {
  free: [],
  basic: ['quotations'],
  standard: ['shifts', 'leave', 'quotations', 'checklists'],
  professional: ['shifts', 'leave', 'certifications', 'quotations', 'checklists', 'ical_sync', 'delivery_management'],
  enterprise: ['shifts', 'leave', 'certifications', 'costs', 'quotations', 'checklists', 'ical_sync', 'delivery_management'],
}

// Which addon_pricing/company_addons key unlocks each gated module when
// purchased individually, regardless of tier.
export const MODULE_ADDON_KEY = {
  certifications: 'certifications',
  shifts: 'schedules_module',
  costs: 'cost_to_company',
  leave: 'leave',
  quotations: 'quotations',
  ical_sync: 'ical_sync',
  delivery_management: 'delivery_management',
  checklists: 'checklists',
}

export const MODULE_LABELS = {
  certifications: 'Certifications',
  shifts: 'Shifts',
  costs: 'Cost to Company',
  leave: 'Leave',
  quotations: 'Quotations',
  delivery_management: 'Delivery & Supply Management',
  ical_sync: 'Channel Sync (Airbnb/Booking.com)',
  checklists: 'Checklists & Inventory Lists',
}
