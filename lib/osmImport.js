// OpenStreetMap → dir_amenities importer (server-only).
// Data © OpenStreetMap contributors, ODbL — the directory maps show the
// attribution next to the services layer.

const OVERPASS = 'https://overpass-api.de/api/interpreter'
const UA = 'OpDesk directory importer (central@opdesk.app)'

function categoryFor(tags = {}) {
  const a = tags.amenity
  if (a === 'atm') return 'atm'
  if (a === 'fuel') return 'fuel'
  if (a === 'hospital') return 'hospital'
  if (a === 'clinic' || a === 'doctors' || tags.healthcare === 'clinic') return 'clinic'
  if (a === 'pharmacy') return 'pharmacy'
  if (a === 'police') return 'police'
  if (tags.aeroway === 'aerodrome') return 'airport'
  return null
}

function query(r) {
  const bbox = `(${r.south},${r.west},${r.north},${r.east})`
  return `[out:json][timeout:120];(
    nwr["amenity"~"^(atm|fuel|clinic|doctors|hospital|pharmacy|police)$"]${bbox};
    nwr["healthcare"="clinic"]${bbox};
    nwr["aeroway"="aerodrome"]${bbox};
  );out center tags;`
}

// Refreshes one region: upserts current features, removes ones that
// disappeared from OSM since the last run (closed ATMs, moved clinics …).
export async function importRegion(svc, region) {
  const started = new Date().toISOString()
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(query(region)),
    signal: AbortSignal.timeout(150000),
  })
  if (!res.ok) throw new Error(`Overpass ${res.status}`)
  const json = await res.json()
  const rows = []
  const seen = new Set()
  for (const el of json.elements || []) {
    const category = categoryFor(el.tags)
    const lat = el.lat ?? el.center?.lat
    const lng = el.lon ?? el.center?.lon
    if (!category || typeof lat !== 'number' || typeof lng !== 'number') continue
    const osm_id = `${el.type}/${el.id}`
    if (seen.has(osm_id)) continue
    seen.add(osm_id)
    const t = el.tags || {}
    const name = (t.name || t.brand || t.operator || null)?.slice(0, 160) || null
    rows.push({ osm_id, name, category, lat, lng, published: true, source: 'osm', updated_at: started })
  }
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await svc.from('dir_amenities').upsert(rows.slice(i, i + 500), { onConflict: 'osm_id' })
    if (error) throw new Error(error.message)
  }
  // Remove OSM rows in this box that weren't in today's data.
  await svc.from('dir_amenities').delete().eq('source', 'osm').lt('updated_at', started)
    .gte('lat', region.south).lte('lat', region.north).gte('lng', region.west).lte('lng', region.east)
  return rows.length
}

// Refreshes the `max` stalest enabled regions. Never throws.
export async function runOsmImport(svc, { max = 2, regionId } = {}) {
  let q = svc.from('dir_osm_regions').select('*').eq('enabled', true)
  q = regionId ? q.eq('id', regionId) : q.order('last_run_at', { ascending: true, nullsFirst: true }).limit(max)
  const { data: regions, error } = await q
  if (error) return [{ error: error.message }]
  const report = []
  for (const r of regions || []) {
    try {
      const count = await importRegion(svc, r)
      await svc.from('dir_osm_regions').update({ last_run_at: new Date().toISOString(), last_count: count, last_error: null }).eq('id', r.id)
      report.push({ region: r.id, count })
    } catch (e) {
      await svc.from('dir_osm_regions').update({ last_run_at: new Date().toISOString(), last_error: String(e.message || e).slice(0, 300) }).eq('id', r.id)
      report.push({ region: r.id, error: String(e.message || e) })
    }
  }
  return report
}
