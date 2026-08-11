'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const supabase = createClient()
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  const loadProfile = useCallback(async (userId) => {
    setProfileError(null)
    // maybeSingle() instead of single() — single() throws a 406 the moment zero
    // rows match (e.g. the signup trigger hasn't created the profile yet, or
    // it's genuinely missing), which otherwise leaves the dashboard hanging.
    const { data: prof, error: profErr } = await supabase
      .from('profiles').select('*').eq('id', userId).maybeSingle()

    if (profErr) { setProfileError(profErr.message); return }
    if (!prof) {
      // No profile row exists for this authenticated user at all. This should
      // only happen if the `on_auth_user_created` DB trigger is missing —
      // see the SQL fix that ships alongside this app.
      setProfileError('missing_profile')
      return
    }
    setProfile(prof)

    if (prof.company_id) {
      // Two plain queries instead of a PostgREST embedded join
      // (`select('*, package:marketing_packages(*)')`). The embedded-join
      // syntax depends on PostgREST's schema-relationship cache already
      // knowing about the companies→marketing_packages foreign key — which
      // can lag behind a fresh migration for a bit even when the table and
      // FK genuinely exist (a known Supabase behavior), and fails outright
      // if the migration hasn't been run yet. Since this runs on every page
      // load via AuthContext, a fragile query here breaks the whole app.
      const { data: comp } = await supabase
        .from('companies').select('*').eq('id', prof.company_id).maybeSingle()
      if (comp?.package_id) {
        const { data: pkg } = await supabase
          .from('marketing_packages').select('*').eq('id', comp.package_id).maybeSingle()
        comp.package = pkg || null
      }
      setCompany(comp || null)
    } else {
      setCompany(null)
    }
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setCompany(null) }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [loadProfile, supabase])

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp(email, password, fullName, companyName, operatorType) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error || !data.user) return { error }
    // Create the company + link this profile to it via a single atomic,
    // security-definer RPC call — NOT a raw .insert().select(), which fails
    // under RLS here: at the moment of insert this profile has no company_id
    // yet, so the companies_select policy can't see the row it just created
    // in order to hand it back, and Postgres reports that as "new row
    // violates row-level security policy". The RPC bypasses that entirely.
    const { data: comp, error: compErr } = await supabase.rpc('create_my_company', {
      p_name: companyName, p_operator_type: operatorType, p_currency: 'ZAR',
      p_language: 'en', p_country: 'ZA', p_timezone: 'Africa/Johannesburg',
      p_billing_email: email, p_phone: null, p_email: email,
    })
    if (compErr) return { error: compErr }
    return { data, company: comp }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setCompany(null)
  }

  async function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
  }

  async function updatePassword(newPassword) {
    return supabase.auth.updateUser({ password: newPassword })
  }

  async function reload() {
    if (user) await loadProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, company, loading, profileError,
      needsCompany: !!user && !loading && !profileError && !!profile && !profile.company_id,
      signIn, signUp, signOut, resetPassword, updatePassword, reload,
      supabase,
      isOwner:  profile?.role === 'owner',
      isAdmin:  ['owner','admin'].includes(profile?.role),
      isSuperAdmin: profile?.is_superadmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
