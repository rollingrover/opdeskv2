import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request, { params }) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, logo_url, currency, operator_type, widget_enabled, language')
    .eq('slug', slug)
    .maybeSingle()

  if (!company || !company.widget_enabled) {
    return NextResponse.json({ error: 'Booking widget not found or not enabled for this business' }, { status: 404 })
  }

  const { data: bookingTypes } = await supabase
    .from('booking_types')
    .select('slug, name, durations')
    .eq('company_id', company.id)
    .eq('active', true)
    .eq('public_bookable', true)
    .order('sort_order')
    .order('name')

  return NextResponse.json({
    company: { name: company.name, logo_url: company.logo_url, currency: company.currency, operator_type: company.operator_type, language: company.language },
    bookingTypes: bookingTypes || [],
  })
}
