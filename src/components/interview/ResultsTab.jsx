import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { avg, formatScore, overallScore, scoreColor, subSkillLabel } from './evaluationHelpers'

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'tech_stack', label: 'Tech Stack' },
  { key: 'created_at', label: 'Date' },
  { key: 'tech_avg', label: 'Tech', align: 'center' },
  { key: 'communication', label: 'Comm', align: 'center' },
  { key: 'attitude', label: 'Attitude', align: 'center' },
  { key: 'confidence', label: 'Conf', align: 'center' },
  { key: 'overall', label: 'Overall', align: 'center' },
]

function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function exportCSV(rows) {
  const header = ['Name', 'Email', 'Phone', 'Tech Stack', 'Role', 'Date', 'Tech Avg', 'Communication', 'Attitude', 'Confidence', 'Overall', 'Sub-skills', 'Notes']
  const lines = [header.join(',')]
  for (const r of rows) {
    const techAvg = avg(r.evaluation?.technical)
    const overall = overallScore(r.evaluation)
    const subSkills = Object.entries(r.evaluation?.technical || {})
      .map(([k, v]) => `${subSkillLabel(k)}:${v}`)
      .join('; ')
    lines.push([
      csvEscape(r.name),
      csvEscape(r.email),
      csvEscape(r.phone),
      csvEscape(r.tech_stack),
      csvEscape(r.role),
      csvEscape(new Date(r.created_at).toLocaleDateString('en-IN')),
      csvEscape(formatScore(techAvg)),
      csvEscape(r.evaluation?.communication ?? ''),
      csvEscape(r.evaluation?.attitude ?? ''),
      csvEscape(r.evaluation?.confidence ?? ''),
      csvEscape(formatScore(overall)),
      csvEscape(subSkills),
      csvEscape(r.evaluation?.overall_notes),
    ].join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `interview-results-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function ScoreCell({ value }) {
  if (value === null || value === undefined || value === 0) {
    return <span className="text-gray-300 dark:text-white/20 text-sm">–</span>
  }
  const c = scoreColor(value)
  return (
    <span
      className="inline-block min-w-[2.25rem] px-2 py-0.5 rounded text-xs font-body font-bold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {formatScore(value)}
    </span>
  )
}

export default function ResultsTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'overall', dir: 'desc' })
  const [expandedId, setExpandedId] = useState(null)

  const fetchResults = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'done')
      .not('evaluation', 'is', null)
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchResults() }, [fetchResults])

  const enriched = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      tech_avg: avg(r.evaluation?.technical),
      overall: overallScore(r.evaluation),
      communication: r.evaluation?.communication || 0,
      attitude: r.evaluation?.attitude || 0,
      confidence: r.evaluation?.confidence || 0,
    }))
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return enriched
    return enriched.filter((r) =>
      [r.name, r.email, r.tech_stack, r.role].some((v) => (v || '').toLowerCase().includes(q))
    )
  }, [enriched, search])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    const { key, dir } = sort
    arr.sort((a, b) => {
      let av = a[key], bv = b[key]
      if (key === 'created_at') { av = new Date(av).getTime(); bv = new Date(bv).getTime() }
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase() }
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (av < bv) return dir === 'asc' ? -1 : 1
      if (av > bv) return dir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [filtered, sort])

  const toggleSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: ['name', 'tech_stack', 'created_at'].includes(key) ? 'asc' : 'desc' }
    )
  }

  const sortIcon = (key) => {
    if (sort.key !== key) return ''
    return sort.dir === 'asc' ? ' ▲' : ' ▼'
  }

  if (loading) {
    return <div className="text-gray-500 dark:text-white/40 text-sm font-body py-6">Loading results…</div>
  }
  if (error) {
    return <p className="text-red-500 dark:text-red-400 text-sm font-body">Failed to load: {error}</p>
  }

  return (
    <div className="results-tab">
      {/* Header — hidden in print */}
      <div className="print:hidden">
        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">📊 Interview Results</h3>
        <p className="text-gray-400 dark:text-white/40 text-sm font-body mb-4">
          {sorted.length} evaluated candidate{sorted.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, tech stack…"
            className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
          />
          <div className="flex gap-2">
            <button
              onClick={() => exportCSV(sorted)}
              disabled={!sorted.length}
              className="px-4 py-2 rounded-lg text-sm font-body font-semibold bg-[#009E60]/15 text-[#009E60] border border-[#009E60]/40 hover:bg-[#009E60]/25 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => window.print()}
              disabled={!sorted.length}
              className="px-4 py-2 rounded-lg text-sm font-body font-semibold bg-[#0045AD]/15 text-[#0045AD] border border-[#0045AD]/40 hover:bg-[#0045AD]/25 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              🖨 Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block mb-4">
        <h2 className="text-2xl font-bold">Interview Results</h2>
        <p className="text-sm">Generated {new Date().toLocaleString('en-IN')}</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-white/30 font-body">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm">No evaluated candidates yet. Mark interviews as Done to see results here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 print:border-0">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="px-3 py-2.5 text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-white/50 cursor-pointer hover:text-[#FF5800] transition-colors select-none whitespace-nowrap"
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.label}{sortIcon(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors print:cursor-default"
                  >
                    <td className="px-3 py-2.5">
                      <p className="text-gray-900 dark:text-white font-semibold">{r.name}</p>
                      <p className="text-gray-400 dark:text-white/40 text-xs">{r.email}</p>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-white/60 text-xs max-w-[180px] truncate">
                      {r.tech_stack || <span className="text-gray-300 dark:text-white/25">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-white/50 text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-3 py-2.5 text-center"><ScoreCell value={r.tech_avg} /></td>
                    <td className="px-3 py-2.5 text-center"><ScoreCell value={r.communication} /></td>
                    <td className="px-3 py-2.5 text-center"><ScoreCell value={r.attitude} /></td>
                    <td className="px-3 py-2.5 text-center"><ScoreCell value={r.confidence} /></td>
                    <td className="px-3 py-2.5 text-center"><ScoreCell value={r.overall} /></td>
                  </tr>
                  <AnimatePresence>
                    {expandedId === r.id && (
                      <motion.tr
                        key={r.id + '-exp'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-gray-50 dark:bg-white/[0.02] print:hidden"
                      >
                        <td colSpan={COLUMNS.length} className="px-4 py-3">
                          <p className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-2 font-body">Sub-skills</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {Object.entries(r.evaluation?.technical || {}).map(([k, v]) => {
                              const c = scoreColor(v)
                              return (
                                <span
                                  key={k}
                                  className="text-xs px-2 py-0.5 rounded font-body"
                                  style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                                >
                                  {subSkillLabel(k)}: {v}
                                </span>
                              )
                            })}
                          </div>
                          {r.evaluation?.overall_notes && (
                            <>
                              <p className="text-gray-400 dark:text-white/40 text-[10px] uppercase tracking-wider mb-1 font-body">Notes</p>
                              <p className="text-gray-600 dark:text-white/70 text-xs font-body italic">"{r.evaluation.overall_notes}"</p>
                            </>
                          )}
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
