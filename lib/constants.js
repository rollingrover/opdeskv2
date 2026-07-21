export const OPERATOR_TYPES = [
  { value: 'safari',   label: 'Safari / Game Lodge',       icon: 'safari-operations-icon2.png' },
  { value: 'shuttle',  label: 'Shuttle & Transfers',        icon: 'shuttle-companies-icon2.png' },
  { value: 'fishing',  label: 'Fishing Charter',            icon: 'fishing-charters-icon2.png' },
  { value: 'yacht',    label: 'Yacht Charter',              icon: 'yacht-charters-icon2.png' },
  { value: 'trail',    label: 'Trail Guide & Adventure',    icon: 'trail-guides-icon2.png' },
  { value: 'lodge',    label: 'Hotel / Guesthouse / B&B',  icon: 'game-lodges-icon2.png' },
  { value: 'eastafrica', label: 'East Africa Tours',        icon: 'east-africa-tours-icon.png' },
  { value: 'transfer', label: 'Island Transfers',           icon: 'island-transfers-icon.png' },
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
  { value: 'single',    label: 'Single Room' },
  { value: 'double',    label: 'Double Room' },
  { value: 'twin',      label: 'Twin Room' },
  { value: 'family',    label: 'Family Room' },
  { value: 'suite',     label: 'Suite' },
  { value: 'chalet',    label: 'Chalet' },
  { value: 'tent',      label: 'Luxury Tent' },
  { value: 'dormitory', label: 'Dormitory' },
]

export const SUBSCRIPTION_TIERS_TOURS = [
  {
    id: 'explorer', label: 'Explorer', price: 0,
    users: 1, bookings: 10,
    features: ['1 user', '10 bookings/month', 'Basic calendar', 'Email support'],
  },
  {
    id: 'operator', label: 'Operator', price: 349,
    users: 5, bookings: -1,
    features: ['5 users', 'Unlimited bookings', 'Guide & fleet management', 'Pro forma invoices', 'CSV export'],
  },
  {
    id: 'pro', label: 'Pro', price: 749,
    users: 15, bookings: -1,
    features: ['15 users', 'All modules', 'Staff HR & cost tracking', 'Certifications', 'Priority support'],
    popular: true,
  },
  {
    id: 'enterprise', label: 'Enterprise', price: 1499,
    users: -1, bookings: -1,
    features: ['Unlimited users', 'White-label branding', 'Marketing page', 'API access', 'Dedicated support'],
  },
]

export const SUBSCRIPTION_TIERS_LODGING = [
  {
    id: 'room',       label: 'Room',       price: 0,
    rooms: 5,
    features: ['Up to 5 rooms', 'Basic calendar', '1 user'],
  },
  {
    id: 'guesthouse', label: 'Guesthouse', price: 449,
    rooms: 20,
    features: ['Up to 20 rooms', 'Guest management', 'Invoices', 'Staff management'],
  },
  {
    id: 'boutique',   label: 'Boutique',   price: 849,
    rooms: 50,
    features: ['Up to 50 rooms', 'Housekeeping tasks', 'Reports & analytics', 'White-label'],
    popular: true,
  },
  {
    id: 'property',   label: 'Property',   price: 1699,
    rooms: -1,
    features: ['Unlimited rooms', 'Multi-property', 'White-label', 'Priority support'],
  },
]

// Modules available per operator type
export const OPERATOR_MODULES = {
  safari:     ['bookings','staff','certs','costs','shifts','leave','vehicles','rooms','housekeeping','firearm','invoices','guides','reports'],
  shuttle:    ['bookings','staff','certs','costs','shifts','leave','vehicles','invoices','drivers','reports'],
  fishing:    ['bookings','staff','certs','costs','shifts','leave','vessels','firearm','invoices','guides','reports'],
  yacht:      ['bookings','staff','certs','costs','shifts','leave','vessels','invoices','reports'],
  trail:      ['bookings','staff','certs','costs','shifts','leave','vehicles','trails','firearm','invoices','guides','reports'],
  lodge:      ['bookings','staff','certs','costs','shifts','leave','rooms','housekeeping','invoices','reports'],
  eastafrica: ['bookings','staff','certs','costs','shifts','leave','vehicles','invoices','guides','reports'],
  transfer:   ['bookings','staff','certs','costs','shifts','leave','vehicles','invoices','drivers','reports'],
}
