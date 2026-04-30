// Module-level singleton cache for the Resources S3 tree.
// - Survives tab switches in a session (no React state).
// - 5-minute TTL.
// - Dedupes concurrent calls (returns the same in-flight promise).
// - `force: true` bypasses TTL and starts a fresh request.

const RESOURCES_API = import.meta.env.VITE_RESOURCES_API_URL || ''
const TTL_MS = 5 * 60 * 1000

const cache = {
  tree: null,
  fetchedAt: 0,
  inflight: null,
}

function buildTree(flat) {
  const root = { name: '', path: '', files: [], subfolders: [] }
  for (const { key, size } of flat) {
    const parts = key.split('/')
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i]
      let child = node.subfolders.find((s) => s.name === seg)
      if (!child) {
        const parentPath = node.path ? `${node.path}/${seg}` : seg
        child = { name: seg, path: parentPath, files: [], subfolders: [] }
        node.subfolders.push(child)
      }
      node = child
    }
    const fileName = parts[parts.length - 1]
    node.files.push({ name: fileName, key, metadata: { size } })
  }
  function sortNode(n) {
    n.subfolders.sort((a, b) => a.name.localeCompare(b.name))
    n.files.sort((a, b) => a.name.localeCompare(b.name))
    n.subfolders.forEach(sortNode)
  }
  sortNode(root)
  return root
}

async function doFetch(signal) {
  if (!RESOURCES_API) throw new Error('VITE_RESOURCES_API_URL is not set')
  const res = await fetch(RESOURCES_API, { signal })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const flat = await res.json()
  return buildTree(flat)
}

export function hasResourcesCache() {
  return cache.tree !== null
}

export function peekResourcesCache() {
  return cache.tree
}

export function getResourcesCacheAge() {
  return cache.fetchedAt ? Date.now() - cache.fetchedAt : null
}

export function getResourcesTree({ force = false, signal } = {}) {
  const fresh = cache.tree && Date.now() - cache.fetchedAt < TTL_MS
  if (!force && fresh) return Promise.resolve(cache.tree)

  if (cache.inflight) return cache.inflight

  cache.inflight = doFetch(signal)
    .then((tree) => {
      cache.tree = tree
      cache.fetchedAt = Date.now()
      return tree
    })
    .finally(() => {
      cache.inflight = null
    })

  return cache.inflight
}

export function clearResourcesCache() {
  cache.tree = null
  cache.fetchedAt = 0
}
