import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ROUND_CATEGORIES } from './qaConstants'

const ROUNDS = [
  { value: 'screening',  label: 'Screening' },
  { value: 'technical1', label: 'Technical 1' },
  { value: 'technical2', label: 'Technical 2' },
  { value: 'hr',         label: 'HR' },
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const DIFFICULTY_COLOR = {
  Easy:   { bg: 'rgba(0,158,96,0.15)',  text: '#009E60', border: 'rgba(0,158,96,0.4)'  },
  Medium: { bg: 'rgba(255,213,0,0.18)', text: '#B8860B', border: 'rgba(255,213,0,0.4)' },
  Hard:   { bg: 'rgba(196,30,58,0.15)', text: '#C41E3A', border: 'rgba(196,30,58,0.35)' },
}

const arrToCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '')
const csvToArr = (csv) =>
  (csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export default function QAModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    question:     initial?.question     || '',
    answer:       initial?.answer       || '',
    round:        initial?.round        || 'screening',
    category:     initial?.category     || 'Java',
    difficulty:   initial?.difficulty   || 'Medium',
    tags:          arrToCsv(initial?.tags),
    source:        arrToCsv(initial?.source),
    score_weight:  initial?.score_weight ?? 5,
    display_order: initial?.display_order ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Categories allowed for the currently selected round.
  const allowedCategories = useMemo(
    () => ROUND_CATEGORIES[form.round] || [],
    [form.round],
  )

  // Auto-correct category when it's not allowed for the chosen round.
  useEffect(() => {
    if (allowedCategories.length === 0) return
    if (!allowedCategories.includes(form.category)) {
      setForm((prev) => ({ ...prev, category: allowedCategories[0] }))
    }
  }, [allowedCategories, form.category])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canSave =
    form.question.trim().length > 0 &&
    form.answer.trim().length > 0 &&
    !saving

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      await onSave({
        question:     form.question.trim(),
        answer:       form.answer.trim(),
        round:        form.round,
        category:     form.category,
        difficulty:   form.difficulty,
        tags:          csvToArr(form.tags),
        source:        csvToArr(form.source),
        score_weight:  Number(form.score_weight) || 5,
        display_order: form.display_order === '' || form.display_order === null
          ? null
          : Number.isFinite(Number(form.display_order))
            ? Number(form.display_order)
            : null,
      })
    } catch (err) {
      setError(err?.message || 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'var(--modal-overlay)' }}
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl my-8 rounded-2xl overflow-hidden"
        style={{ background: 'var(--modal-panel)', border: '1px solid var(--border-primary)' }}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-primary)', background: 'rgba(255,88,0,0.04)' }}
        >
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
              {initial ? '✏️ Edit Question' : '➕ Add Question'}
            </h3>
            <p className="text-gray-500 dark:text-white/50 text-xs font-body">
              {ROUNDS.find((r) => r.value === form.round)?.label} · {form.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Question */}
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Question</label>
            <input
              required
              maxLength={500}
              autoFocus
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter interview question..."
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
            />
            <p className="text-right text-gray-400 dark:text-white/30 text-xs font-body mt-1">{form.question.length} / 500</p>
          </div>

          {/* Answer */}
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Answer</label>
            <textarea
              required
              rows={6}
              maxLength={3000}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Detailed answer..."
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body resize-none"
            />
            <p className="text-right text-gray-400 dark:text-white/30 text-xs font-body mt-1">{form.answer.length} / 3000</p>
          </div>

          {/* Round */}
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-2 font-body uppercase tracking-wider">Round</label>
            <div className="flex gap-2 flex-wrap">
              {ROUNDS.map((r) => {
                const active = form.round === r.value
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm({ ...form, round: r.value })}
                    className="px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all duration-150"
                    style={{
                      background: active ? 'rgba(255,88,0,0.15)' : 'transparent',
                      color: active ? '#FF5800' : 'var(--text-muted)',
                      border: `1.5px solid ${active ? 'rgba(255,88,0,0.5)' : 'var(--border-primary)'}`,
                    }}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
            >
              {allowedCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-2 font-body uppercase tracking-wider">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => {
                const c = DIFFICULTY_COLOR[d]
                const active = form.difficulty === d
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setForm({ ...form, difficulty: d })}
                    className="px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all duration-150"
                    style={{
                      background: active ? c.bg : 'transparent',
                      color: active ? c.text : 'var(--text-muted)',
                      border: `1.5px solid ${active ? c.border : 'var(--border-primary)'}`,
                    }}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">
              Tags <span className="text-gray-400 dark:text-white/30 normal-case tracking-normal">(comma-separated)</span>
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="OOPS, SQL, API"
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">
              Source <span className="text-gray-400 dark:text-white/30 normal-case tracking-normal">(comma-separated companies)</span>
            </label>
            <input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Credit Suisse, Morningstar"
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
            />
          </div>

          {/* Score weight + Display order */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">
                Score Weight <span className="text-gray-400 dark:text-white/30 normal-case tracking-normal">(1–10)</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.score_weight}
                onChange={(e) => setForm({ ...form, score_weight: e.target.value })}
                className="w-32 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">
                Display Order <span className="text-gray-400 dark:text-white/30 normal-case tracking-normal">(lower = shown first)</span>
              </label>
              <input
                type="number"
                step={1}
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                placeholder="—"
                className="w-32 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-body">{error}</p>}
        </div>

        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/60 text-sm font-body hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : initial ? 'Update' : 'Add Question'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}
