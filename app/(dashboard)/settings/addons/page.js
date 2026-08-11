'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { notify } from '@/lib/notify'
import { Check, Clock, Plus } from 'lucide-react'

const ADDON_LABELS = {
  vehicles: 'Extra Vehicle Slot', guides: 'Extra Guide Slot', drivers: 'Extra Driver Slot',
  shuttles: 'Extra Shuttle Slot', safaris: 'Extra Safari Listing', tours: 'Extra Tour Listing',
  charters: 'Extra Charter Listing', trails: 'Extra Trail Listing', seats: 'Extra User Seat',
  firearm_register: 'Firearm Register', schedules_module: 'Schedules Module',
  white_label: 'White-Label Branding', no_watermark: 'Remove Watermark',
  storage_10gb: 'Storage +10 GB', storage_50gb: 'Storage +50 GB', storage_200gb: 'Storage +200 GB',
  bandwidth_50gb: 'Bandwidth +50 GB', bandwidth_200gb: 'Bandwidth +200 GB', bandwidth_1tb: 'Bandwidth +1 TB',
  client_list: 'Client List & Billing', certifications: 'Certifications Module', shifts: 'Shifts Module',
  cost_to_company: 'Cost to Company Module', leave: 'Leave Module', hr_bundle: 'HR Bundle (Certifications + Shifts + Cost to Company + Leave)',
}

export default function AddonsMarketplacePage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [catalog, setCatalog] = useState([])
  const [active, setActive] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(null)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [c, a, r] = await Promise.all([
      supabase.from('addon_pricing').select('*').order('addon_key'),
      supabase.from('company_addons').select('*').eq('company_id', company.id).eq('active', true),
      supabase.from('addon_requests').select('*').eq('company_id', company.id).eq('status', 'pending'),
    ])
    setCatalog(c.data || [])
    setActive(a.data || [])
    setPending(r.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  async function requestAddon(addonKey) {
    setRequesting(addonKey)
    const { error } = await supabase.from('addon_requests').insert([{
      company_id: company.id, requested_by: profile.id, addon_key: addonKey, quantity: 1,
    }])
    setRequesting(null)
    if (error) { toast.error(error.message); return }
    notify('addon_request_created', { companyName: company.name, requesterEmail: profile.email, addonKey, quantity: 1 })
    toast.success('Request sent — our team will action this shortly')
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  const isActive = key => active.some(a => a.addon_key === key)
  const isPending = key => pending.some(r => r.addon_key === key)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Add-ons</h1>
          <p className="page-subtitle">Extend your plan with extra slots and modules</p>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        Requesting an add-on sends it to our team to action — it isn't instant checkout yet. You'll see it marked <strong>Active</strong> here as soon as it's applied to your account.
      </div>

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Add-on</th><th>Price</th><th style={{ textAlign: 'right' }}>Status</th></tr>
          </thead>
          <tbody>
            {catalog.map(a => {
              const isBundle = a.addon_key === 'hr_bundle'
              const bundleSavings = isBundle
                ? ['certifications', 'schedules_module', 'cost_to_company', 'leave']
                    .reduce((sum, k) => sum + (catalog.find(c => c.addon_key === k)?.monthly_price ? Number(catalog.find(c => c.addon_key === k).monthly_price) : 0), 0) - Number(a.monthly_price)
                : 0
              return (
              <tr key={a.addon_key} style={isBundle ? { background: 'var(--cream)' } : {}}>
                <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {ADDON_LABELS[a.addon_key] || a.addon_key.replace(/_/g, ' ')}
                  {isBundle && bundleSavings > 0 && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--teal)', background: 'white', border: '1px solid var(--teal)', borderRadius: '999px', padding: '0.0625rem 0.5rem' }}>
                      Save {company.currency} {bundleSavings.toLocaleString()}/mo
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--gray-500)' }}>{company.currency} {Number(a.monthly_price).toLocaleString()}/mo</td>
                <td style={{ textAlign: 'right' }}>
                  {isActive(a.addon_key) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--teal)', fontWeight: 700, fontSize: '0.8125rem' }}>
                      <Check size={14} /> Active
                    </span>
                  ) : isPending(a.addon_key) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold)', fontWeight: 700, fontSize: '0.8125rem' }}>
                      <Clock size={14} /> Requested
                    </span>
                  ) : (
                    <button className="btn btn-outline btn-sm" disabled={requesting === a.addon_key} onClick={() => requestAddon(a.addon_key)}>
                      <Plus size={14} /> {requesting === a.addon_key ? 'Sending…' : 'Request'}
                    </button>
                  )}
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
