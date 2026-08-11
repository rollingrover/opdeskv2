'use client'
import { Check, AlertTriangle, Shield, Users, Star, DollarSign, FileText, Settings, LogOut } from 'lucide-react'

// The original superadmin pages (ported from the old Vite app) call
// `<Icon name="check" size={16} />` etc. via `../lib/constants.jsx`, which
// doesn't exist in this Next.js app. This shim preserves that call signature
// so the ported files didn't need every icon reference rewritten by hand,
// mapped onto the lucide-react icons already used elsewhere in this app.
const MAP = {
  check: Check,
  alert: AlertTriangle,
  shield: Shield,
  guests: Users,
  star: Star,
  billing: DollarSign,
  invoice: FileText,
  settings: Settings,
  logout: LogOut,
}

export function Icon({ name, size = 16, className, style }) {
  const Cmp = MAP[name] || AlertTriangle
  return <Cmp size={size} className={className} style={style} />
}
