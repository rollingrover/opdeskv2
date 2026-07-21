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

  const loadProfile = useCallback(async (userId) => {
    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', userId).single()
    if (!prof) return
    setProfile(prof)
    if (prof.company_id) {
      const { data: comp } = await supabase
        .from('companies').select('*').eq('id', prof.company_id).single()
      setCompany(comp)
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
    // Create company
    const { data: comp, error: compErr } = await supabase
      .from('companies')
      .insert([{ name: companyName, operator_type: operatorType, email }])
      .select().single()
    if (compErr) return { error: compErr }
    // Link profile to company
    await supabase.from('profiles')
      .update({ company_id: comp.id, full_name: fullName, role: 'owner' })
      .eq('id', data.user.id)
    return { data }
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
      user, profile, company, loading,
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
