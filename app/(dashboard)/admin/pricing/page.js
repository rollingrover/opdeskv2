'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@/lib/saIcons';

// Toast notification system
function useToast() {
  const [toast, setToast] = useState(null);

  function showToast(message, type = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  return { toast, showToast };
}

// Toast component
function Toast({ toast }) {
  if (!toast) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      padding: '12px 20px',
      borderRadius: 8,
      backgroundColor: toast.type === 'success' ? '#22c55e' : 
                     toast.type === 'error' ? '#ef4444' : '#3b82f6',
      color: 'white',
      fontWeight: 600,
      fontSize: 14,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
      <Icon name={toast.type === 'success' ? 'check' : 'alert'} size={16} />
      {toast.message}
    </div>
  );
}

// ─── SA: PRICING EDITOR ───────────────────────
function SAPricingEditor() {
  const supabase = createClient();
  const { toast, showToast } = useToast();
  const [pricing, setPricing] = useState([]);
  const [addonEdits, setAddonEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('addon_pricing').select('*').order('addon_key');
      if (error) throw error;

      const pdata = data || [];
      setPricing(pdata);

      const ae = {};
      pdata.forEach(p => {
        ae[p.id] = {
          monthly_price: p.monthly_price,
          annual_price: p.annual_price
        };
      });

      setAddonEdits(ae);
      setDirty(false);

    } catch (error) {
      console.error('Error loading pricing:', error);
      showToast('Failed to load pricing data', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onAddonChange(id, field, val) {
    setAddonEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
    setDirty(true);
  }

  async function applyAll() {
    setSaving(true);

    try {
      const addonUpdates = pricing.map(p => {
        const e = addonEdits[p.id] || {};
        return supabase
          .from('addon_pricing')
          .update({
            monthly_price: parseFloat(e.monthly_price) || 0,
            annual_price: parseFloat(e.annual_price) || 0,
          })
          .eq('id', p.id);
      });

      const results = await Promise.all(addonUpdates);

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error('Update errors:', errors);
        throw new Error(`Failed to update ${errors.length} items`);
      }

      showToast('All pricing updated — landing page will reflect changes on next load', 'success');
      await load();

    } catch (error) {
      console.error('Error saving pricing:', error);
      showToast('Error saving pricing: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefaults() {
    if (!confirm('Reset all add-on prices to default values? This will overwrite any unsaved changes.')) return;

    setSaving(true);

    try {
      // Kept in sync with what's actually agreed and live — this list
      // previously had stale values (e.g. hr_bundle at R499 instead of
      // the current R250) left over from before the pooled-tier pricing
      // redesign, and clicking this button silently overwrote the real,
      // correct live prices with those old numbers. Only add-on keys that
      // still exist in the catalog are listed; the old per-vertical/
      // storage/bandwidth add-ons removed during the catalog cleanup are
      // deliberately not included here.
      const defaultAddons = {
        vehicles: 99, vessels: 99, rooms: 79, guides: 99, seats: 79,
        schedules_module: 199, certifications: 149, cost_to_company: 249, leave: 99,
        hr_bundle: 250, logistics_bundle: 250,
        quotations: 99, ical_sync: 149, delivery_management: 199, checklists: 99,
      };

      const addonUpdates = Object.entries(defaultAddons).map(([key, price]) =>
        supabase
          .from('addon_pricing')
          .update({ monthly_price: price, annual_price: price * 10 })
          .eq('addon_key', key)
      );

      await Promise.all(addonUpdates);

      showToast('Prices reset to defaults', 'success');
      await load();

    } catch (error) {
      console.error('Error resetting prices:', error);
      showToast('Failed to reset prices', 'error');
    } finally {
      setSaving(false);
    }
  }

  const addonLabels = {
    vehicles: 'Extra Vehicle Slot',
    guides: 'Extra Guide Slot',
    drivers: 'Extra Driver Slot',
    shuttles: 'Extra Shuttle Slot',
    safaris: 'Extra Safari Listing',
    tours: 'Extra Tour Listing',
    charters: 'Extra Charter Listing',
    trails: 'Extra Trail Listing',
    seats: 'Extra User Seat',
    firearm_register: 'Firearm Register',
    white_label: 'White-Label',
    client_list: 'Client List & Billing',
    no_watermark: 'Remove Watermark',
    storage_10gb: 'Storage +10 GB',
    storage_50gb: 'Storage +50 GB',
    storage_200gb: 'Storage +200 GB',
    bandwidth_50gb: 'Bandwidth +50 GB',
    bandwidth_200gb: 'Bandwidth +200 GB',
    bandwidth_1tb: 'Bandwidth +1 TB',
    certifications: 'Certifications Module',
    schedules_module: 'Schedules & Shifts Module',
    cost_to_company: 'Cost to Company Module',
    leave: 'Leave Module',
    hr_bundle: 'HR Bundle (all 4 modules)',
    quotations: 'Quotations Module',
    ical_sync: 'Channel Sync (Airbnb/Booking.com)',
    delivery_management: 'Delivery & Supply Management',
    checklists: 'Checklists & Inventory Lists',
  };

  if (loading) {
    return (
      <div style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}>Loading pricing data...</div>
        <div style={{ fontSize: 13 }}>Please wait</div>
      </div>
    );
  }

  const inputStyle = {
    background: '#111',
    border: '1px solid #333',
    color: 'white',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box'
  };
  
  const numInputStyle = {
    ...inputStyle,
    width: 110
  };

  return (
    <div>
      <Toast toast={toast} />

      <div style={{ background: '#1a1a00', border: '1px solid #ca8a04', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fde047', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="alert" size={16} />
        <span>
          For package/tier prices (what customers pick on the public pricing page), use <a href="/admin/packages" style={{ color: '#D4A853' }}>Marketing Packages</a>. This page is only for add-on unit prices.
        </span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: 0 }}>Add-on Unit Pricing</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '2px 0 0' }}>
            Prices shown on the public pricing page's "Need more capacity?" table and in the logged-in Add-ons page. For packages/tiers, use <a href="/admin/packages" style={{ color: '#D4A853' }}>Marketing Packages</a>.
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          disabled={saving}
          style={{
            background: '#222',
            color: '#9ca3af',
            border: '1px solid #333',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          Reset to Defaults
        </button>
      </div>

      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222', marginBottom: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ background: '#0d0d0d' }}>
                {['Add-on', 'Monthly (R)', 'Annual (R)'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricing.map(p => {
                const e = addonEdits[p.id] || {};
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '10px 12px', color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>
                      {addonLabels[p.addon_key] || p.addon_key?.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={e.monthly_price ?? p.monthly_price}
                        onChange={ev => onAddonChange(p.id, 'monthly_price', ev.target.value)}
                        style={numInputStyle}
                      />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={e.annual_price ?? p.annual_price}
                        onChange={ev => onAddonChange(p.id, 'annual_price', ev.target.value)}
                        style={numInputStyle}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={applyAll}
          disabled={saving || !dirty}
          style={{
            background: dirty ? '#D4A853' : '#444',
            color: dirty ? '#0F2540' : '#888',
            border: 'none',
            borderRadius: 8,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: 14,
            cursor: dirty ? 'pointer' : 'not-allowed',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Icon name="check" size={16} />
              Apply Changes
            </>
          )}
        </button>
        
        {dirty && !saving && (
          <span style={{ color: '#f59e0b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="alert" size={14} />
            Unsaved changes
          </span>
        )}
        
        {!dirty && !saving && !loading && (
          <span style={{ color: '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="check" size={14} />
            All prices saved
          </span>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return <SAPricingEditor />;
}

export const dynamic = 'force-dynamic'
