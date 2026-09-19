'use client'
import { useTranslations } from 'next-intl'

export function Badge({ children, color = 'gray', dot = false }) {
  return (
    <span className={`badge badge-${color}`}>
      {dot && <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />}
      {children}
    </span>
  )
}

const STATUS_COLORS = {
  pending:'amber', confirmed:'green', completed:'blue', cancelled:'red', no_show:'gray',
  active:'green', inactive:'gray', available:'green', in_use:'blue', occupied:'blue', maintenance:'amber',
  valid:'green', expiring_soon:'amber', expired:'red', clean:'green', dirty:'red',
  open:'blue', resolved:'green', draft:'gray', sent:'blue', paid:'green', overdue:'red',
  accepted:'green', declined:'red', scheduled:'amber', approved:'green',
  in_progress:'amber', closed:'gray',
}

export function StatusBadge({ status }) {
  const t = useTranslations('StatusBadge')
  const color = STATUS_COLORS[status] || 'gray'
  const label = STATUS_COLORS[status] ? t(status) : status
  return <Badge color={color} dot>{label}</Badge>
}
