import { FEATURE_SLUGS } from '@/lib/featuresContent'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://opdesk.app'

export default function sitemap() {
  const now = new Date()

  const staticPages = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/features', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/web-design', changeFrequency: 'monthly', priority: 0.4 },
  ]

  // One entry per feature/solution page (28 at last count — 18 features +
  // 10 vertical solution pages) — pulled from the same list the pages
  // themselves are generated from, so a newly added slug shows up here
  // automatically with no separate sitemap edit required.
  const featurePages = FEATURE_SLUGS.map(slug => ({
    path: `/features/${slug}`, changeFrequency: 'monthly', priority: 0.7,
  }))

  return [...staticPages, ...featurePages].map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
