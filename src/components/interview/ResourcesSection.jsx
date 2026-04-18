import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'

const storageBase = import.meta.env.VITE_SUPABASE_STORAGE_URL

function publicUrl(fileName) {
  return storageBase ? `${storageBase}/resources/${fileName}` : null
}

function fileTypeLabel(name) {
  const ext = name.split('.').pop().toUpperCase()
  return ['PDF', 'PPT', 'PPTX', 'DOC', 'DOCX'].includes(ext) ? ext : 'FILE'
}

export default function ResourcesSection() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.storage
      .from('resources')
      .list('', { sortBy: { column: 'name', order: 'asc' } })
      .then(({ data }) => {
        if (data) {
          setResources(data.filter((f) => f.name !== '.emptyFolderPlaceholder'))
        }
      })
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
          {resources.length === 0 ? (
            <div className="col-span-full text-center py-8 text-white/30 font-body">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">No resources uploaded yet. Check back soon!</p>
            </div>
          ) : resources.map((r, i) => {
            const url = publicUrl(r.name)
            return (
              <motion.div
                key={r.name}
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
                    <p className="text-white/30 text-xs mt-0.5">
                      {fileTypeLabel(r.name)}
                      {r.metadata?.size ? ` · ${(r.metadata.size / 1024).toFixed(0)} KB` : ''}
                    </p>
                  </div>
                </div>

                {url ? (
                  <a
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs py-1.5 text-center mt-auto"
                  >
                    ⬇ Download
                  </a>
                ) : (
                  <span className="btn-outline text-xs py-1.5 text-center mt-auto opacity-40 cursor-not-allowed">
                    ⬇ Download
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
