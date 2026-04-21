import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CDN_BASE = import.meta.env.VITE_CDN_URL || ''
const RESOURCES_API = import.meta.env.VITE_RESOURCES_API_URL || ''

function fileUrl(key) {
  return CDN_BASE ? `${CDN_BASE}/${key}` : null
}

function fileTypeLabel(name) {
  const ext = name.split('.').pop().toUpperCase()
  return ['PDF', 'PPT', 'PPTX', 'DOC', 'DOCX'].includes(ext) ? ext : 'FILE'
}

// Fetch flat list from Lambda and build a nested tree in one call
async function fetchTree() {
  if (!RESOURCES_API) throw new Error('VITE_RESOURCES_API_URL is not set')
  const res = await fetch(RESOURCES_API)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const flat = await res.json() // [{ key: 'DSA/Arrays/file.pdf', size: 12345 }, ...]
  return buildTree(flat)
}

// Build nested { name, path, files, subfolders } tree from flat S3 object list
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

  // Sort: folders first, then files, both alphabetically
  function sortNode(n) {
    n.subfolders.sort((a, b) => a.name.localeCompare(b.name))
    n.files.sort((a, b) => a.name.localeCompare(b.name))
    n.subfolders.forEach(sortNode)
  }
  sortNode(root)
  return root
}

// Collapsible folder section rendered recursively
function FolderSection({ node, depth = 0 }) {
  const [open, setOpen] = useState(false)
  const hasContent = node.files.length > 0 || node.subfolders.length > 0
  if (!hasContent) return null

  const accentColors = ['#FF5800', '#0045AD', '#009E60', '#C41E3A', '#FFD500']
  const accent = accentColors[depth % accentColors.length]
  const paddingLeft = depth > 0 ? `${depth * 16}px` : '0'

  return (
    <div style={{ paddingLeft }} className={depth > 0 ? 'border-l-2 pl-4' : ''} style={{ paddingLeft, borderLeftColor: depth > 0 ? accent + '40' : 'transparent' }}>
      {node.name && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 w-full text-left mb-3 group"
        >
          <span
            className="text-sm font-bold font-display uppercase tracking-wider"
            style={{ color: accent }}
          >
            {open ? '▾' : '▸'}
          </span>
          <span className="font-display font-semibold text-sm uppercase tracking-wider text-gray-900 dark:text-white group-hover:text-[#FF5800] transition-colors">
            {node.name}
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10 ml-2" />
          <span className="text-xs text-gray-400 dark:text-white/30 font-body ml-2 flex-shrink-0">
            {node.files.length > 0 && `${node.files.length} file${node.files.length !== 1 ? 's' : ''}`}
            {node.files.length > 0 && node.subfolders.length > 0 && ' · '}
            {node.subfolders.length > 0 && `${node.subfolders.length} folder${node.subfolders.length !== 1 ? 's' : ''}`}
          </span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Files grid */}
            {node.files.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {node.files.map((r, i) => {
                  const url = fileUrl(r.key)
                  return (
                    <motion.div
                      key={r.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass-card flex flex-col gap-3 hover:border-gray-300 dark:hover:border-white/30 transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: 'rgba(255,88,0,0.12)' }}
                        >
                          📄
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 dark:text-white/90 text-xs font-semibold font-body leading-snug line-clamp-2 group-hover:text-[#FF5800] transition-colors">
                            {r.name}
                          </p>
                          <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">
                            {fileTypeLabel(r.name)}
                            {r.metadata?.size
                              ? ` · ${Math.round(r.metadata.size / 1024)} KB`
                              : ''}
                          </p>
                        </div>
                      </div>
                      {url ? (
                        <a
                          href={url}
                          download={r.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline text-xs py-1 text-center mt-auto"
                        >
                          ⬇ Download
                        </a>
                      ) : (
                        <span className="btn-outline text-xs py-1 text-center mt-auto opacity-40 cursor-not-allowed">
                          ⬇ Download
                        </span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Nested subfolders */}
            {node.subfolders.length > 0 && (
              <div className="space-y-6">
                {node.subfolders.map((sub) => (
                  <FolderSection key={sub.path} node={sub} depth={depth + 1} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResourcesSection() {
  const [rootNode, setRootNode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    fetchTree()
      .then((node) => setRootNode(node))
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
        📚 Study Resources
      </h3>
      <p className="text-gray-500 dark:text-white/50 text-sm mb-8 font-body">
        Free to download — no login required. Browse by topic below.
      </p>

      {loading ? (
        <div className="text-gray-400 dark:text-white/40 text-sm font-body">
          Loading resources...
        </div>
      ) : fetchError ? (
        <div className="text-red-500 text-sm font-body py-4">
          Failed to load resources: {fetchError}
        </div>
      ) : !rootNode || (rootNode.files.length === 0 && rootNode.subfolders.length === 0) ? (
        <div className="text-center py-12 text-gray-400 dark:text-white/30 font-body">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm">No resources uploaded yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Root-level files (no folder) */}
          {rootNode.files.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rootNode.files.map((r, i) => {
                const url = fileUrl(r.key)
                return (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card flex flex-col gap-3 hover:border-gray-300 dark:hover:border-white/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: 'rgba(255,88,0,0.12)' }}
                      >
                        📄
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-white/90 text-xs font-semibold font-body leading-snug line-clamp-2 group-hover:text-[#FF5800] transition-colors">
                          {r.name}
                        </p>
                        <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">
                          {fileTypeLabel(r.name)}
                          {r.metadata?.size ? ` · ${Math.round(r.metadata.size / 1024)} KB` : ''}
                        </p>
                      </div>
                    </div>
                    {url ? (
                      <a href={url} download={r.name} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1 text-center mt-auto">
                        ⬇ Download
                      </a>
                    ) : (
                      <span className="btn-outline text-xs py-1 text-center mt-auto opacity-40 cursor-not-allowed">⬇ Download</span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Top-level folders */}
          {rootNode.subfolders.map((sub) => (
            <FolderSection key={sub.path} node={sub} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}