'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { OPERATOR_TYPES, CURRENCIES } from '@/lib/constants'

function SignupForm() {
  const [step, setStep]           = useState(1)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [form, setForm]           = useState({
    fullName:'', email:'', password:'', companyName:'',
    operatorType:'safari', currency:'ZAR',
  })
  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPackage = searchParams.get('package')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await signUp(form.email, form.password, form.fullName, form.companyName, form.operatorType)
    if (error) { setError(error.message); setLoading(false) }
    // Someone who picked a plan on /pricing lands straight in checkout for
    // it, instead of the dashboard, so choosing a plan actually leads
    // somewhere rather than being forgotten the moment signup starts.
    else router.replace(selectedPackage ? `/settings/billing?package=${selectedPackage}` : '/dashboard')
  }

  const steps = ['Your Details', 'Business Setup', 'Preferences']

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 60%, #2d5a8e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'white', borderRadius:'1.25rem', padding:'2.5rem', width:'100%', maxWidth:'480px', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
            <OpDeskLogo size={44} />
          </div>
          <h1 style={{ fontSize:'1.4rem', margin:'0 0 0.25rem', color:'var(--navy)' }}>Create your account</h1>
          <p style={{ color:'var(--gray-400)', fontSize:'0.875rem', margin:0 }}>Start free — no credit card required</p>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'2rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex:1, textAlign:'center' }}>
              <div style={{
                height:4, borderRadius:9999, marginBottom:'0.375rem',
                background: i + 1 <= step ? 'var(--gold)' : 'var(--gray-200)',
                transition:'background 0.3s'
              }} />
              <span style={{ fontSize:'0.7rem', color: i + 1 === step ? 'var(--navy)' : 'var(--gray-400)', fontWeight: i + 1 === step ? 600 : 400 }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.5rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', display:'flex', gap:'0.5rem' }}>
            <AlertCircle size={16} color="var(--danger)" style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ margin:0, fontSize:'0.875rem', color:'var(--danger)' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom:'1rem' }}>
                <label className="label">Full Name *</label>
                <input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder="Jane Smith" required />
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <label className="label">Email Address *</label>
                <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="jane@yourbusiness.com" required />
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label className="label">Password *</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw ? 'text' : 'password'} className="input" value={form.password}
                    onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters"
                    style={{ paddingRight:'2.5rem' }} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)', padding:0 }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="button" className="btn btn-navy btn-lg" style={{ width:'100%' }}
                onClick={() => { if (!form.fullName || !form.email || form.password.length < 8) { setError('Please fill in all fields (password min 8 chars)') } else { setError(''); setStep(2) } }}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom:'1rem' }}>
                <label className="label">Business / Company Name *</label>
                <input className="input" value={form.companyName} onChange={e => set('companyName', e.target.value)}
                  placeholder="Zulu Safari Co." required />
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label className="label">What type of operator are you? *</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginTop:'0.375rem' }}>
                  {OPERATOR_TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => set('operatorType', t.value)}
                      style={{
                        padding:'0.625rem 0.75rem', borderRadius:'0.5rem', border:'1.5px solid',
                        borderColor: form.operatorType === t.value ? 'var(--gold)' : 'var(--gray-200)',
                        background: form.operatorType === t.value ? 'var(--gold-50)' : 'white',
                        cursor:'pointer', fontSize:'0.8125rem', fontWeight: form.operatorType === t.value ? 600 : 400,
                        color: form.operatorType === t.value ? 'var(--navy)' : 'var(--gray-600)',
                        textAlign:'left', transition:'all 0.15s'
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button type="button" className="btn btn-outline btn-lg" style={{ flex:1 }} onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="button" className="btn btn-navy btn-lg" style={{ flex:2 }}
                  onClick={() => { if (!form.companyName) { setError('Please enter your business name') } else { setError(''); setStep(3) } }}>
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label className="label">Primary Billing Currency *</label>
                <p style={{ fontSize:'0.8125rem', color:'var(--gray-400)', margin:'0 0 0.5rem' }}>
                  This is the currency you'll use on guest invoices (you can change it anytime).
                </p>
                <select className="select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div style={{ background:'var(--gray-50)', borderRadius:'0.625rem', padding:'1rem', marginBottom:'1.5rem', fontSize:'0.8125rem', color:'var(--gray-500)' }}>
                <CheckCircle size={14} color="var(--teal)" style={{ display:'inline', marginRight:6 }} />
                OpDesk always charges subscription fees in South African Rand (ZAR).
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button type="button" className="btn btn-outline btn-lg" style={{ flex:1 }} onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex:2 }} disabled={loading}>
                  {loading ? 'Creating account…' : <>Start for Free <BrandIcon name="arrowRight" size={14} /></>}
                </button>
              </div>
            </div>
          )}
        </form>

        <div style={{ textAlign:'center', marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid var(--gray-100)' }}>
          <p style={{ fontSize:'0.8125rem', color:'var(--gray-400)', margin:0 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color:'var(--orange)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </AuthProvider>
  )
}

export const dynamic = 'force-dynamic'
