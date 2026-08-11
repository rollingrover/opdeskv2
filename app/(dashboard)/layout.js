import DashboardLayoutClient from './DashboardLayoutClient'

// This MUST live in a Server Component file to actually take effect — Next.js
// does not reliably honor route segment config (dynamic, revalidate, etc.)
// exported from a 'use client' file. Every page under this layout inherited
// a `force-dynamic` export that looked correct but was silently a no-op,
// which is why Vercel's build tried to statically prerender pages that need
// a live user session and crashed the moment Supabase env vars weren't
// present at build time. Setting it here, in a real Server Component,
// cascades to every nested route automatically — no need to repeat it in
// each individual page.js.
export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
