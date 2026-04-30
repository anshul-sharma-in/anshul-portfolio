import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getResourcesTree,
  peekResourcesCache,
  clearResourcesCache,
} from './resourcesCache'

const CDN_BASE = import.meta.env.VITE_CDN_URL || ''

function fileUrl(key) {
  return CDN_BASE ? `${CDN_BASE}/${key}` : null
}

function fileTypeLabel(name) {
  const ext = name.split('.').pop().toUpperCase()
  return ['PDF', 'PPT', 'PPTX', 'DOC', 'DOCX'].includes(ext) ? ext : 'FILE'
}

function openFile(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Themed skeleton loader — pulses with Rubik colors while API is in-flight
function ResourcesSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1].map((fi) => (
        <div key={fi}>
          {/* Folder header skeleton */}
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: fi * 0.2 }}
            className="flex items-center gap-3 mb-4"
          >
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF5800, #FFD500)' }}
            />
            <div
              className="h-3 rounded-full w-28"
              style={{ background: 'linear-gradient(90deg, rgba(255,88,0,0.3), rgba(255,213,0,0.15))' }}
            />
            <div className="flex-1 h-px" style={{ background: 'rgba(255,88,0,0.12)' }} />
            <div
              className="h-2.5 rounded-full w-14"
              style={{ background: 'rgba(255,88,0,0.12)' }}
            />
          </motion.div>

          {/* File card skeletons */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2].map((ci) => (
              <motion.div
                key={ci}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: fi * 0.2 + ci * 0.1,
                }}
                className="glass-card flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(255,88,0,0.1)' }}
                  />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <div
                      className="h-2.5 rounded-full w-3/4"
                      style={{ background: 'var(--border-primary)' }}
                    />
                    <div
                      className="h-2 rounded-full w-1/2"
                      style={{ background: 'var(--border-primary)' }}
                    />
                  </div>
                </div>
                <div
                  className="h-8 rounded-lg mt-auto"
                  style={{
                    background: 'rgba(255,88,0,0.07)',
                    border: '2px solid rgba(255,88,0,0.15)',
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Single file card — shared between root-level list and FolderSection
function FileCard({ r, i }) {
  const url = fileUrl(r.key)

  return (
    <motion.div
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
        <>
          <button
            onClick={() => openFile(url)}
            className="btn-outline text-xs py-1 text-center mt-auto flex items-center justify-center gap-1.5"
          >
            ↗ Open
          </button>
        </>
      ) : (
        <span className="btn-outline text-xs py-1 text-center mt-auto opacity-40 cursor-not-allowed">
          ⬇ Download
        </span>
      )}
    </motion.div>
  )
}

// Collapsible folder section rendered recursively
function FolderSection({ node, depth = 0 }) {
  const [open, setOpen] = useState(false)
  const hasContent = node.files.length > 0 || node.subfolders.length > 0
  if (!hasContent) return null

  const accentColors = ['#FF5800', '#0045AD', '#009E60', '#C41E3A', '#FFD500']
  const accent = accentColors[depth % accentColors.length]

  return (
    <div
      className={depth > 0 ? 'border-l-2 pl-4' : ''}
      style={{
        paddingLeft: depth > 0 ? `${depth * 16}px` : '0',
        borderLeftColor: depth > 0 ? accent + '40' : 'transparent',
      }}
    >
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
            {node.files.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {node.files.map((r, i) => (
                  <FileCard
                    key={r.key}
                    r={r}
                    i={i}
                  />
                ))}
              </div>
            )}

            {node.subfolders.length > 0 && (
              <div className="space-y-6">
                {node.subfolders.map((sub) => (
                  <FolderSection
                    key={sub.path}
                    node={sub}
                    depth={depth + 1}
                  />
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
  const [rootNode, setRootNode] = useState(() => peekResourcesCache())
  const [loading, setLoading] = useState(() => peekResourcesCache() === null)
  const [refreshing, setRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    let cancelled = false
    // If cache is warm, getResourcesTree resolves synchronously-ish; if stale or empty, refetches.
    getResourcesTree()
      .then((node) => {
        if (cancelled) return
        setRootNode(node)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setFetchError(e.message)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    setFetchError('')
    clearResourcesCache()
    try {
      const node = await getResourcesTree({ force: true })
      setRootNode(node)
    } catch (e) {
      setFetchError(e.message)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">
          📚 Study Resources
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          title="Refresh"
          className="text-xs font-body text-gray-500 dark:text-white/50 hover:text-[#FF5800] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 px-2 py-1"
        >
          <span className={refreshing ? 'inline-block animate-spin' : 'inline-block'}>↻</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <p className="text-gray-500 dark:text-white/50 text-sm mb-8 font-body">
        Free to download — no login required. Browse by topic below.
      </p>

      {loading ? (
        <ResourcesSkeleton />
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
          {rootNode.files.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rootNode.files.map((r, i) => (
                <FileCard
                  key={r.key}
                  r={r}
                  i={i}
                />
              ))}
            </div>
          )}

          {rootNode.subfolders.map((sub) => (
            <FolderSection
              key={sub.path}
              node={sub}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}