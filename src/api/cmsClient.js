import { apiFetch } from './apiClient.js'
import { apiFetchNoAuth } from '../utils/apiNoAuth.js'

export const CMS_KEYS = {
  homeHero: 'home_hero',
  homeSectionKeys: 'home_section_keys',
  homeCollections: 'home_collections',
  aboutContent: 'about_content',
  aboutBlogs: 'about_blogs',
}

export async function fetchCmsKeys(keys) {
  const list = Array.isArray(keys) ? keys : []
  const qs = encodeURIComponent(list.join(','))
  const data = await apiFetchNoAuth(`/api/cms?keys=${qs}`)
  return data?.values || {}
}

export async function saveCmsValue(key, value) {
  return apiFetch('/api/admin/cms', { method: 'POST', body: { key, value } })
}

