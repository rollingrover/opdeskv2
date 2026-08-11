// Genuine Server Component (no 'use client') — see the comment in
// app/(dashboard)/layout.js for why this matters. Every page under
// app/auth/ uses AuthProvider, which needs real Supabase env vars the
// moment it's instantiated; without force-dynamic actually taking effect,
// Next.js tries to prerender these at build time and crashes if those vars
// aren't present in the build environment.
export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }) {
  return children
}
