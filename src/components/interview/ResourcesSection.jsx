import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || ''

const PLACEHOLDER_RESOURCES = [
  { name: 'Java Interview Notes - Core Concepts', type: 'PDF', size: '1.2 MB', key: 'java-core-notes.pdf' },
  { name: 'Advanced Java - Multithreading & Collections', type: 'PDF', size: '0.9 MB', key: 'java-advanced-notes.pdf' },
  { name: 'JavaScript + React Interview Prep', type: 'PDF', size: '1.5 MB', key: 'js-react-notes.pdf' },
  { name: 'SQL & Database Design Questions', type: 'PDF', size: '0.7 MB', key: 'database-qp.pdf' },
  { name: 'Previous Interview Question Paper - 2025', type: 'PDF', size: '0.4 MB', key: 'qp-2025.pdf' },
  { name: 'Previous Interview Question Paper - 2024', type: 'PDF', size: '0.3 MB', key: 'qp-2024.pdf' },
]

export default function ResourcesSection() {
  const [resources, setResources] = useState(PLACEHOLDER_RESOURCES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!API_URL) return
    setLoading(true)
    fetch(`${API_URL}/resources`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setResources(data) })
      .catch(() => {/* fall back to placeholder */})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h3 className="font-display font-bold text-xl text-white mb-2">
        📚 Study Resources & Question Papers
      </h3>
      <p className="text-white/50 text-sm mb-6 font-body">
        Free to download — no login required
      </p>

      {loading ? (
        <div className="text-white/40 text-sm font-body">Loading resources...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card flex flex-col gap-3 hover:border-white/30 transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'rgba(255,88,0,0.15)' }}
                >
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-semibold font-body leading-snug line-clamp-2 group-hover:text-[#FF5800] transition-colors">
                    {r.name}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">{r.type} · {r.size}</p>
                </div>
              </div>

              <a
                href={r.url || '#'}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs py-1.5 text-center mt-auto"
                onClick={(e) => { if (!r.url) { e.preventDefault(); alert('Upload resources to S3 first — see ResourcesSection.jsx') } }}
              >
                ⬇ Download
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
