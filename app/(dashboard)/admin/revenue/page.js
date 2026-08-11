'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

function SARevenueOverview() {
  const supabase = createClient();
  const [stats, setStats] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [rrRequests, setRrRequests] = useState([]);
  const [subPayments, setSubPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [s, c, p, rr, sp] = await Promise.all([
      supabase.rpc('sa_get_revenue_stats'),
      supabase.rpc('sa_get_all_companies'),
      supabase.from('marketing_packages').select('slug, monthly_price'),
      supabase.from('rollingrover_requests').select('status, quote_amount, billing_type, currency'),
      supabase.from('subscription_payments').select('amount, payment_status, is_initial_setup, created_at'),
    ]);
    setStats(s.data || []);
    setCompanies(c.data || []);
    setPackages(p.data || []);
    setRrRequests(rr.data || []);
    setSubPayments(sp.data || []);
    setLoading(false);
  }

  if (loading) {
    return <div style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>Loading revenue data...</div>;
  }

  // TIER_PRICE is built live from Marketing Packages, not hardcoded — so
  // this always matches whatever superadmin last set there, for tiers with
  // zero companies on them too (company.package_monthly_price only exists
  // per-company, so the per-tier breakdown below still needs this map).
  const TIER_PRICE = { free: 0 };
  packages.forEach(p => { TIER_PRICE[p.slug] = Number(p.monthly_price) || 0 });
  const tierColor = { free: '#6b7280', basic: '#3b82f6', standard: '#9333ea', professional: '#D4A853', enterprise: '#dc2626' };

  // Real MRR: sum each company's own linked package price (accurate even if
  // two companies on the same tier were granted custom pricing historically).
  const liveMRR = companies.reduce((s, c) => s + (Number(c.package_monthly_price) || 0), 0);
  const liveARR = liveMRR * 12;
  const byTier = { free: 0, basic: 0, standard: 0, professional: 0, enterprise: 0 };
  
  companies.forEach(c => {
    byTier[c.subscription_tier || 'free']++;
  });
  
  const paying = companies.filter(c => c.subscription_tier !== 'free').length;
  const churned = companies.filter(c => (c.account_status || 'active') === 'churned').length;
  const avgRevPerPaying = paying > 0 ? Math.round(liveMRR / paying) : 0;
  const stillFree = byTier.free || 0;
  const conversionRate = companies.length > 0 ? Math.round((paying / companies.length) * 100) : 0;

  const cardStyle = { background: '#1a1a1a', borderRadius: 12, padding: '16px 20px', border: '1px solid #222' };
  const labelStyle = { color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 };

  return (
    <div>
      <h2 style={{ color: 'white', fontWeight: 900, fontSize: 20, marginBottom: 20 }}>Revenue Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          ['MRR', `R${liveMRR.toLocaleString()}`, '#D4A853'],
          ['ARR', `R${liveARR.toLocaleString()}`, '#9333ea'],
          ['Paying', paying, '#22c55e'],
          ['Avg Rev/Paying', `R${avgRevPerPaying}`, '#3b82f6'],
        ].map(([l, v, c]) => (
          <div key={l} style={cardStyle}>
            <div style={labelStyle}>{l}</div>
            <div style={{ color: c, fontSize: 26, fontWeight: 900 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Free tier conversion — the metric that actually tells you whether
          pricing is calibrated right, as opposed to comparing sticker price
          against other platforms */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Free Tier Conversion</h3>
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 16 }}>
          If most signups stay stuck here, the free tier's limits usually aren't the right lever to fix that — pricing may be.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <div>
            <div style={labelStyle}>Total Signups</div>
            <div style={{ color: 'white', fontSize: 24, fontWeight: 900 }}>{companies.length}</div>
          </div>
          <div>
            <div style={labelStyle}>Still on Free</div>
            <div style={{ color: tierColor.free, fontSize: 24, fontWeight: 900 }}>{stillFree}</div>
          </div>
          <div>
            <div style={labelStyle}>Converted to Paid</div>
            <div style={{ color: '#22c55e', fontSize: 24, fontWeight: 900 }}>{paying}</div>
          </div>
          <div>
            <div style={labelStyle}>Conversion Rate</div>
            <div style={{ color: conversionRate >= 20 ? '#22c55e' : conversionRate >= 10 ? '#f59e0b' : '#ef4444', fontSize: 24, fontWeight: 900 }}>
              {conversionRate}%
            </div>
          </div>
        </div>
        <div style={{ background: '#111', borderRadius: 999, height: 8, overflow: 'hidden', marginTop: 14, display: 'flex' }}>
          <div style={{ background: '#22c55e', width: `${conversionRate}%`, height: '100%' }} />
          <div style={{ background: tierColor.free, width: `${100 - conversionRate}%`, height: '100%' }} />
        </div>
      </div>

      {/* RollingRover Productions — kept as a separate summary, not merged
          into MRR/ARR above, since recurring SaaS subscriptions and
          project-based web design income are genuinely different kinds of
          revenue and combining them into one number would make both less
          useful, not more. */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>RollingRover Productions</h3>
          <a href="/admin/rollingrover" style={{ color: '#D4A853', fontSize: 12, textDecoration: 'none' }}>Manage →</a>
        </div>
        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 16 }}>
          Separate business, separate ledger — tracked here for a combined view only.
          {' '}The MRR/ARR above is projected from current plan assignments; actual PayFast-confirmed SaaS payments received so far: R{subPayments.filter(p => p.payment_status === 'COMPLETE' && !p.is_initial_setup).reduce((s, p) => s + (Number(p.amount) || 0), 0).toLocaleString()}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <div>
            <div style={labelStyle}>Total Paid</div>
            <div style={{ color: '#22c55e', fontSize: 22, fontWeight: 900 }}>
              R{rrRequests.filter(r => r.status === 'paid').reduce((s, r) => s + (Number(r.quote_amount) || 0), 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Awaiting Quote</div>
            <div style={{ color: '#3b82f6', fontSize: 22, fontWeight: 900 }}>{rrRequests.filter(r => r.status === 'new').length}</div>
          </div>
          <div>
            <div style={labelStyle}>Active Recurring</div>
            <div style={{ color: '#D4A853', fontSize: 22, fontWeight: 900 }}>
              R{rrRequests.filter(r => r.status === 'paid' && r.billing_type === 'recurring').reduce((s, r) => s + (Number(r.quote_amount) || 0), 0).toLocaleString()}/mo
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Tier breakdown */}
        <div style={cardStyle}>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Companies by Tier</h3>
          {Object.entries(byTier).map(([tier, count]) => {
            const pct = companies.length > 0 ? Math.round((count / companies.length) * 100) : 0;
            const tierMRR = count * (TIER_PRICE[tier] || 0);
            return (
              <div key={tier} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: tierColor[tier], fontWeight: 700, textTransform: 'capitalize', fontSize: 13 }}>{tier}</span>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>
                    {count} companies · R{tierMRR.toLocaleString()}/mo
                  </span>
                </div>
                <div style={{ background: '#111', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: tierColor[tier], width: `${pct}%`, height: '100%', borderRadius: 999, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Account status breakdown */}
        <div style={cardStyle}>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Account Health</h3>
          {['active', 'trial', 'vip', 'churned', 'suspended'].map(status => {
            const count = companies.filter(c => (c.account_status || 'active') === status).length;
            const pct = companies.length > 0 ? Math.round((count / companies.length) * 100) : 0;
            const statusColor = {
              active: '#22c55e',
              trial: '#f59e0b',
              vip: '#D4A853',
              churned: '#6b7280',
              suspended: '#ef4444'
            }[status];
            
            return (
              <div key={status} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: statusColor, fontWeight: 700, textTransform: 'capitalize', fontSize: 13 }}>{status}</span>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>{count}</span>
                </div>
                <div style={{ background: '#111', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                  <div style={{ background: statusColor, width: `${pct}%`, height: '100%', borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: 12 }}>Churn rate</span>
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 13 }}>
              {companies.length > 0 ? Math.round((churned / companies.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Monthly cohort table */}
      <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #222' }}>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>Monthly Cohorts (signups by month)</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d0d' }}>
              {['Month', 'New Signups', 'Free', 'Basic', 'Standard', 'Professional', 'Enterprise', 'MRR from cohort'].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #222' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                  No data yet
                </td>
              </tr>
            ) : (
              stats.map(row => {
                const freeCount = Math.max(0, (row.new_companies || 0) - (row.basic_count || 0) - (row.standard_count || 0) - (row.professional_count || 0) - (row.enterprise_count || 0))
                return (
                <tr key={row.month} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '10px 16px', color: 'white', fontWeight: 600 }}>{row.month}</td>
                  <td style={{ padding: '10px 16px', color: '#9ca3af' }}>{row.new_companies}</td>
                  <td style={{ padding: '10px 16px', color: tierColor.free }}>{freeCount}</td>
                  <td style={{ padding: '10px 16px', color: tierColor.basic }}>{row.basic_count || 0}</td>
                  <td style={{ padding: '10px 16px', color: tierColor.standard }}>{row.standard_count || 0}</td>
                  <td style={{ padding: '10px 16px', color: tierColor.professional }}>{row.professional_count || 0}</td>
                  <td style={{ padding: '10px 16px', color: tierColor.enterprise }}>{row.enterprise_count || 0}</td>
                  <td style={{ padding: '10px 16px', color: '#D4A853', fontWeight: 700 }}>
                    R{Number(row.mrr_zar || 0).toLocaleString()}
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page() {
  return <SARevenueOverview />;
}