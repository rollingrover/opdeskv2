'use client'
export function Badge({ children, color = 'gray', dot = false }) {
  return (
    <span className={`badge badge-${color}`}>
      {dot && <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    pending:    { color:'amber', label:'Pending' },
    confirmed:  { color:'green', label:'Confirmed' },
    completed:  { color:'blue',  label:'Completed' },
    cancelled:  { color:'red',   label:'Cancelled' },
    no_show:    { color:'gray',  label:'No Show' },
    active:     { color:'green', label:'Active' },
    inactive:   { color:'gray',  label:'Inactive' },
    available:  { color:'green', label:'Available' },
    in_use:     { color:'blue',  label:'In Use' },
    maintenance:{ color:'amber', label:'Maintenance' },
    valid:      { color:'green', label:'Valid' },
    expiring_soon:{ color:'amber',label:'Expiring Soon' },
    expired:    { color:'red',   label:'Expired' },
    clean:      { color:'green', label:'Clean' },
    dirty:      { color:'red',   label:'Dirty' },
    open:       { color:'blue',  label:'Open' },
    resolved:   { color:'green', label:'Resolved' },
    draft:      { color:'gray',  label:'Draft' },
    sent:       { color:'blue',  label:'Sent' },
    paid:       { color:'green', label:'Paid' },
    overdue:    { color:'red',   label:'Overdue' },
  }
  const { color, label } = map[status] || { color:'gray', label: status }
  return <Badge color={color} dot>{label}</Badge>
}
