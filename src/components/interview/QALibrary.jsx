import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QAModal from './QAModal'
import { supabase } from '../../lib/supabaseClient'
import { categoriesForRound } from './qaConstants'

// Round filter values must match the `questions.round` column.
const ROUND_TABS = [
  { value: 'all',        label: 'All' },
  { value: 'screening',  label: 'Screening' },
  { value: 'technical1', label: 'Technical 1' },
  { value: 'technical2', label: 'Technical 2' },
  { value: 'hr',         label: 'HR' },
]

const ROUND_LABEL = {
  screening:  'Screening',
  technical1: 'Technical 1',
  technical2: 'Technical 2',
  hr:         'HR',
}

const ROUND_COLOR = {
  screening:  { bg: 'rgba(0,69,173,0.15)',  text: '#0045AD', border: 'rgba(0,69,173,0.4)' },
  technical1: { bg: 'rgba(255,88,0,0.15)',  text: '#FF5800', border: 'rgba(255,88,0,0.4)' },
  technical2: { bg: 'rgba(196,30,58,0.15)', text: '#C41E3A', border: 'rgba(196,30,58,0.4)' },
  hr:         { bg: 'rgba(13,115,119,0.15)', text: '#0D7377', border: 'rgba(13,115,119,0.4)' },
}

const DIFFICULTY_COLOR = {
  Easy:   { bg: 'rgba(0,158,96,0.15)',  text: '#009E60', border: 'rgba(0,158,96,0.4)'  },
  Medium: { bg: 'rgba(255,213,0,0.18)', text: '#B8860B', border: 'rgba(255,213,0,0.4)' },
  Hard:   { bg: 'rgba(196,30,58,0.15)', text: '#C41E3A', border: 'rgba(196,30,58,0.35)' },
}

export default function QALibrary() {
  const [activeRound, setActiveRound]       = useState('all')
  const [activeCategory, setActiveCategory] = useState('All')
  const [items, setItems]                   = useState([])
  const [expandedId, setExpandedId]         = useState(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [search, setSearch]                 = useState('')
  const [selectedTags, setSelectedTags]       = useState(() => new Set())
  const [selectedSources, setSelectedSources] = useState(() => new Set())
  const [filterOpen, setFilterOpen]         = useState(false)
  const filterRef                           = useRef(null)
  const [modalState, setModalState]         = useState({ open: false, editing: null })

  const fetchQA = useCallback(async (round, category) => {
    setLoading(true)
    setError('')
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (round    && round    !== 'all') query = query.eq('round', round)
    if (category && category !== 'All') query = query.eq('category', category)
    const { data, error: err, count, status } = await query
    if (err) {
      setError(`${err.message} (status ${status})`)
    } else {
      setItems(data || [])
      if ((data?.length ?? 0) === 0) {
        // Helpful hint when RLS hides rows silently
        // eslint-disable-next-line no-console
        console.info('[QALibrary] questions query returned 0 rows', { round, category, count, status })
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchQA(activeRound, activeCategory) }, [activeRound, activeCategory, fetchQA])

  const handleSave = async (form) => {
    if (modalState.editing) {
      const { error: err } = await supabase
        .from('questions')
        .update(form)
        .eq('id', modalState.editing.id)
      if (err) throw err
    } else {
      const { error: err } = await supabase
        .from('questions')
        .insert(form)
      if (err) throw err
    }
    setModalState({ open: false, editing: null })
    fetchQA(activeRound, activeCategory)
  }

  const handleDelete = async (qa) => {
    if (!window.confirm(`Delete this question?\n\n"${qa.question}"`)) return
    const { error: err } = await supabase.from('questions').delete().eq('id', qa.id)
    if (err) {
      setError(err.message)
      return
    }
    fetchQA(activeRound, activeCategory)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const tagSel = selectedTags
    const srcSel = selectedSources
    return items.filter((it) => {
      if (tagSel.size > 0) {
        const tags = it.tags || []
        if (!tags.some((t) => tagSel.has(t))) return false
      }
      if (srcSel.size > 0) {
        const src = it.source || []
        if (!src.some((s) => srcSel.has(s))) return false
      }
      if (!q) return true
      return [
        it.question,
        it.answer,
        it.difficulty,
        it.category,
        ...(it.tags   || []),
        ...(it.source || []),
      ].some((v) => (v || '').toString().toLowerCase().includes(q))
    })
  }, [items, search, selectedTags, selectedSources])

  const availableTags = useMemo(() => {
    const set = new Set()
    items.forEach((it) => (it.tags || []).forEach((t) => t && set.add(t)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  const availableSources = useMemo(() => {
    const set = new Set()
    items.forEach((it) => (it.source || []).forEach((s) => s && set.add(s)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  const totalSelected = selectedTags.size + selectedSources.size

  const toggleSet = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value); else next.add(value)
      return next
    })
    setExpandedId(null)
  }

  const clearFilters = () => {
    setSelectedTags(new Set())
    setSelectedSources(new Set())
    setExpandedId(null)
  }

  // Reset tag/source selections when round or category changes
  useEffect(() => {
    setSelectedTags(new Set())
    setSelectedSources(new Set())
  }, [activeRound, activeCategory])

  // Categories shown in the tab bar depend on the selected round.
  const categoryTabs = useMemo(
    () => ['All', ...categoriesForRound(activeRound)],
    [activeRound],
  )

  // If the active category falls out of the new round's allowed list, reset.
  useEffect(() => {
    if (!categoryTabs.includes(activeCategory)) {
      setActiveCategory('All')
    }
  }, [categoryTabs, activeCategory])

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!filterOpen) return
    const onClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    const onKey = (e) => { if (e.key === 'Escape') setFilterOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [filterOpen])

  const emptyMsg = (() => {
    const parts = []
    if (activeRound    !== 'all') parts.push(ROUND_LABEL[activeRound] || activeRound)
    if (activeCategory !== 'All') parts.push(activeCategory)
    return parts.length
      ? `No questions yet for ${parts.join(' · ')}.`
      : 'No questions yet.'
  })()
  return (
    <div>
      <AnimatePresence>
        {modalState.open && (
          <QAModal
            initial={modalState.editing}
            onClose={() => setModalState({ open: false, editing: null })}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">❓ Q&amp;A Library</h3>
        <button
          onClick={() => setModalState({ open: true, editing: null })}
          className="btn-primary text-xs px-4 py-2"
        >
          + Add Question
        </button>
      </div>

      {/* Round filter (primary) */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 mb-1.5 font-body">Round</p>
        <div className="flex flex-wrap gap-2">
          {ROUND_TABS.map((tab) => {
            const active = activeRound === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => { setActiveRound(tab.value); setExpandedId(null) }}
                className={`px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all duration-200 border ${
                  active
                    ? 'bg-[#FF5800] text-white border-[#FF5800]'
                    : 'bg-black/5 dark:bg-white/[0.07] text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/10 hover:text-[#FF5800]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category filter (secondary) */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 mb-1.5 font-body">Category</p>
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((tab) => {
            const active = activeCategory === tab
            return (
              <button
                key={tab}
                onClick={() => { setActiveCategory(tab); setExpandedId(null) }}
                className={`px-3 py-1 rounded-full text-xs font-body font-semibold transition-all duration-200 border ${
                  active
                    ? 'bg-[#0045AD] text-white border-[#0045AD]'
                    : 'bg-black/5 dark:bg-white/[0.07] text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/10 hover:text-[#0045AD]'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search + Filter dropdown */}
      <div className="mb-5 flex flex-wrap items-stretch gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question, answer, tags, source…"
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
        />
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={`h-full px-4 py-2 rounded-lg border text-sm font-body font-semibold flex items-center gap-2 transition-colors ${
              totalSelected > 0
                ? 'bg-[#FF5800]/10 border-[#FF5800]/40 text-[#FF5800]'
                : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:text-[#FF5800]'
            }`}
          >
            <span>Filters</span>
            {totalSelected > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#FF5800] text-white text-[10px] leading-none">
                {totalSelected}
              </span>
            )}
            <span className="text-xs opacity-70">{filterOpen ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 z-30 rounded-xl shadow-2xl overflow-hidden"
                style={{ background: 'var(--modal-panel, #fff)', border: '1px solid var(--border-primary, rgba(0,0,0,0.1))' }}
              >
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-white/10">
                  <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Filters</span>
                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={totalSelected === 0}
                    className="text-[11px] font-body text-[#FF5800] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    Clear all
                  </button>
                </div>

                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 font-body mb-1.5">Tags</p>
                  {availableTags.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-white/30 font-body italic mb-2">No tags in current view</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1 mb-2 pr-1">
                      {availableTags.map((t) => {
                        const checked = selectedTags.has(t)
                        return (
                          <label key={`tag-${t}`} className="flex items-center gap-2 cursor-pointer text-xs font-body py-0.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSet(setSelectedTags, t)}
                              className="accent-[#FF5800]"
                            />
                            <span className="px-1.5 py-0.5 rounded bg-[#FF5800]/10 text-[#FF5800] border border-[#FF5800]/20">
                              #{t}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="px-4 pt-2 pb-3 border-t border-gray-100 dark:border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 font-body mb-1.5">Source</p>
                  {availableSources.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-white/30 font-body italic">No sources in current view</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {availableSources.map((s) => {
                        const checked = selectedSources.has(s)
                        return (
                          <label key={`src-${s}`} className="flex items-center gap-2 cursor-pointer text-xs font-body py-0.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSet(setSelectedSources, s)}
                              className="accent-[#FF5800]"
                            />
                            <span className="px-1.5 py-0.5 rounded bg-gray-200/40 dark:bg-white/[0.04] text-gray-600 dark:text-white/60 border border-gray-300/40 dark:border-white/10">
                              🏢 {s}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-500 text-sm font-body">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-500 dark:text-white/40 text-sm font-body">Loading questions…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-white/30 font-body">
          <div className="text-3xl mb-2">❔</div>
          <p className="text-sm">
            {items.length === 0
              ? emptyMsg
              : search.trim()
                ? `No matches for "${search}"${totalSelected > 0 ? ' with selected filters' : ''}.`
                : totalSelected > 0
                  ? 'No questions match the selected filters.'
                  : 'No matches.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((qa) => {
            const dc     = DIFFICULTY_COLOR[qa.difficulty] || DIFFICULTY_COLOR.Medium
            const rc     = ROUND_COLOR[qa.round]
            const isOpen = expandedId === qa.id
            return (
              <div
                key={qa.id}
                className="glass-card hover:border-gray-300 dark:hover:border-white/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(isOpen ? null : qa.id)}
                    className="flex-1 text-left flex flex-col gap-2 min-w-0"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      {qa.round && rc && (
                        <span
                          className="px-2 py-0.5 text-[10px] rounded font-body font-semibold"
                          style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                        >
                          {ROUND_LABEL[qa.round] || qa.round}
                        </span>
                      )}
                      {qa.category && (
                        <span className="px-2 py-0.5 text-[10px] rounded font-body font-semibold border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/60">
                          {qa.category}
                        </span>
                      )}
                      {qa.difficulty && (
                        <span
                          className="px-2 py-0.5 text-[10px] rounded font-body font-semibold"
                          style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}
                        >
                          {qa.difficulty}
                        </span>
                      )}
                      {Number.isFinite(qa.score_weight) && (
                        <span className="text-[10px] text-gray-400 dark:text-white/40 font-body">
                          · weight {qa.score_weight}
                        </span>
                      )}
                      {Number.isFinite(qa.display_order) && (
                        <span className="text-[10px] text-gray-400 dark:text-white/40 font-body">
                          · #{qa.display_order}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-3 min-w-0 w-full">
                      <p className="text-gray-800 dark:text-white/90 text-sm font-semibold font-body flex-1 min-w-0">
                        {qa.question}
                      </p>
                      <span className="text-gray-400 dark:text-white/30 text-sm flex-shrink-0">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                    {((qa.tags?.length || 0) + (qa.source?.length || 0)) > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(qa.tags || []).map((t) => (
                          <span
                            key={`t-${t}`}
                            className="px-1.5 py-0.5 text-[9px] rounded bg-[#FF5800]/10 text-[#FF5800] border border-[#FF5800]/20 font-body"
                          >
                            #{t}
                          </span>
                        ))}
                        {(qa.source || []).map((s) => (
                          <span
                            key={`s-${s}`}
                            className="px-1.5 py-0.5 text-[9px] rounded bg-gray-200/40 dark:bg-white/[0.04] text-gray-500 dark:text-white/50 border border-gray-300/40 dark:border-white/10 font-body"
                          >
                            🏢 {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => setModalState({ open: true, editing: qa })}
                      className="text-[#0045AD] dark:text-[#FFD500] text-xs font-body hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(qa)}
                      className="text-red-500 dark:text-red-400 text-xs font-body hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 text-gray-600 dark:text-white/65 text-sm leading-relaxed font-body whitespace-pre-wrap border-t border-gray-100 dark:border-white/[0.08]">
                        {qa.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
