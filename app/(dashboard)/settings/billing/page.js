'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Package, Calendar, AlertTriangle, Check } from 'lucide-react'

function BillingContent() {
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const searchParams = useSearchParams()
  const highlightSlug = searchParams.get('package')
  const [pkg, setPkg] = useState(null)
  const [allPackages, setAllPackages] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(null)

  useEffect(() => {
    if (searchParams.get('subscribed')) toast.success('Subscription set up — your trial has started')
    if (searchParams.get('cancelled')) toast.error('Checkout was cancelled')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!company) { setLoading(false); return }
    ;(async () => {
      setLoading(true)
      const [p, allP, a] = await Promise.all([
        company.package_id
          ? supabase.from('marketing_packages').select('*').eq('id', company.package_id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from('marketing_packages').select('*').eq('active', true).order('sort_order'),
        supabase.from('company_addons').select('*').eq('company_id', company.id).eq('active', true),
      ])
      setPkg(p.data)
      setAllPackages(allP.data || [])
      setAddons(a.data || [])
      setLoading(false)
    })()
  }, [company])

  async function startCheckout(packageId) {
    setCheckingOut(packageId)
    try {
      const res = await fetch('/api/payfast/create-subscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.paymentUrl
    } catch (err) {
      toast.error(err.message)
      setCheckingOut(null)
    }
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  const addonTotal = addons.reduce((sum, a) => sum + (Number(a.price_per_unit) || 0) * (a.quantity || 1), 0)
  const packagePrice = pkg?.monthly_price || 0
  const monthlyTotal = packagePrice + addonTotal
  const inTrial = company.account_status === 'trial' && company.trial_ends_at
  const trialDaysLeft = inTrial ? Math.ceil((new Date(company.trial_ends_at) - new Date()) / 86400000) : null
  const paymentFailed = company.account_status === 'payment_failed'
  const upgradeOptions = allPackages.filter(p => p.id !== company.package_id && p.monthly_price > 0)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">Your current plan and add-ons</p>
        </div>
      </div>

      {paymentFailed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem' }}>
          <AlertTriangle size={16} color="#DC2626" />
          <span style={{ fontSize: '0.8125rem', color: '#991B1B' }}>Your last payment didn't go through — please check your card details with PayFast or contact support.</span>
        </div>
      )}

      {inTrial && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'var(--cream)', border: '1px solid var(--gold)', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem' }}>
          <Check size={16} color="var(--gold)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--navy)' }}>
            You're on a free trial — {trialDaysLeft > 0 ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left` : 'ending today'}. Billing starts automatically after that, no action needed.
          </span>
        </div>
      )}

      <div className="card card-shadow" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Package size={22} color="var(--gold)" />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.125rem', color: 'var(--navy)' }}>{pkg?.name || 'No plan assigned'}</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{pkg?.tagline || 'Choose a plan below to get started.'}</p>
            </div>
          </div>
          <Link href="/pricing" className="btn btn-outline btn-sm">Compare Plans</Link>
        </div>
        {company.subscription_expires_at && !inTrial && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
            <Calendar size={14} /> Next charge {new Date(company.subscription_expires_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>

      {pkg && (
        <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>Monthly Charges</h3>
            <Link href="/settings/addons" className="btn btn-primary btn-sm">Manage Add-ons</Link>
          </div>
          <table className="table">
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{pkg.name}</td>
                <td style={{ textAlign: 'right', color: 'var(--gray-500)' }}>{company.currency} {packagePrice.toLocaleString()}/mo</td>
              </tr>
              {addons.map(a => (
                <tr key={a.id}>
                  <td style={{ color: 'var(--navy)', textTransform: 'capitalize' }}>{a.addon_key?.replace(/_/g, ' ')} {a.quantity > 1 ? `×${a.quantity}` : ''}</td>
                  <td style={{ textAlign: 'right', color: Number(a.price_per_unit) === 0 ? 'var(--teal)' : 'var(--gray-500)' }}>
                    {Number(a.price_per_unit) === 0 ? 'Free' : `${company.currency} ${(a.price_per_unit * a.quantity).toLocaleString()}/mo`}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--navy)' }}>Total</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>{company.currency} {monthlyTotal.toLocaleString()}/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {upgradeOptions.length > 0 && (
        <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{pkg ? 'Upgrade Your Plan' : 'Choose a Plan'}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Every paid plan starts with a free 30-day trial — you won't be charged until it ends.</p>
          </div>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upgradeOptions.map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1rem', borderRadius: '0.625rem',
                border: p.slug === highlightSlug ? '2px solid var(--gold)' : '1px solid var(--gray-100)',
                background: p.slug === highlightSlug ? 'var(--cream)' : 'white',
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{p.tagline} · {p.currency} {Number(p.monthly_price).toLocaleString()}/mo</p>
                </div>
                <button className="btn btn-primary btn-sm" disabled={checkingOut === p.id} onClick={() => startCheckout(p.id)}>
                  {checkingOut === p.id ? 'Redirecting…' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BillingContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
