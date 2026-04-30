import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { deriveTechSubSkills, subSkillLabel, scoreColor } from './evaluationHelpers'

const RATINGS = [1, 2, 3, 4, 5]

function RatingDots({ value, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 dark:text-white/90 text-sm font-body font-semibold">{label}</p>
        {description && (
          <p className="text-gray-400 dark:text-white/40 text-xs font-body mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {RATINGS.map((n) => {
          const filled = value >= n
          const c = filled ? scoreColor(value) : null
          return (
            <button
              type="button"
              key={n}
              onClick={() => onChange(n)}
              aria-label={`${label} ${n} of 5`}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-body font-bold transition-all duration-150 hover:scale-110"
              style={{
                background: filled ? c.bg : 'transparent',
                color: filled ? c.text : 'var(--text-muted)',
                border: `1.5px solid ${filled ? c.border : 'var(--border-primary)'}`,
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function EvaluationModal({ applicant, initial, onClose, onSave }) {
  const subSkills = useMemo(() => deriveTechSubSkills(applicant.tech_stack), [applicant.tech_stack])

  const [evaluation, setEvaluation] = useState(() => ({
    technical: subSkills.reduce((acc, k) => ({ ...acc, [k]: initial?.technical?.[k] || 0 }), {}),
    communication: initial?.communication || 0,
    attitude: initial?.attitude || 0,
    confidence: initial?.confidence || 0,
    overall_notes: initial?.overall_notes || '',
  }))
  const [saving, setSaving] = useState(false)

  const setTech = (key, val) =>
    setEvaluation((e) => ({ ...e, technical: { ...e.technical, [key]: val } }))

  const allTechFilled = subSkills.every((k) => evaluation.technical[k] > 0)
  const canSave =
    allTechFilled &&
    evaluation.communication > 0 &&
    evaluation.attitude > 0 &&
    evaluation.confidence > 0 &&
    !saving

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(evaluation)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'var(--modal-overlay)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl my-8 rounded-2xl overflow-hidden"
        style={{
          background: 'var(--modal-panel)',
          border: '1px solid var(--border-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-primary)', background: 'rgba(255,88,0,0.04)' }}
        >
          <div className="min-w-0">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
              Evaluate Candidate
            </h3>
            <p className="text-gray-500 dark:text-white/50 text-xs font-body truncate">
              {applicant.name} · {applicant.email}
              {applicant.tech_stack ? ` · ${applicant.tech_stack}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Technical */}
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#FF5800]">
                ▾ Technical
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              <span className="text-xs text-gray-400 dark:text-white/30 font-body">
                {subSkills.length} skill{subSkills.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="pl-3 border-l-2 border-[#FF5800]/30 divide-y divide-gray-100 dark:divide-white/5">
              {subSkills.map((k) => (
                <RatingDots
                  key={k}
                  label={subSkillLabel(k)}
                  value={evaluation.technical[k]}
                  onChange={(v) => setTech(k, v)}
                />
              ))}
            </div>
          </section>

          {/* Soft skills */}
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#0045AD]">
                ▾ Soft Skills
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>
            <div className="pl-3 border-l-2 border-[#0045AD]/30 divide-y divide-gray-100 dark:divide-white/5">
              <RatingDots
                label="Communication"
                description="Clarity, articulation, listening"
                value={evaluation.communication}
                onChange={(v) => setEvaluation((e) => ({ ...e, communication: v }))}
              />
              <RatingDots
                label="Attitude"
                description="Coachability, professionalism"
                value={evaluation.attitude}
                onChange={(v) => setEvaluation((e) => ({ ...e, attitude: v }))}
              />
              <RatingDots
                label="Confidence"
                description="Composure, ownership of answers"
                value={evaluation.confidence}
                onChange={(v) => setEvaluation((e) => ({ ...e, confidence: v }))}
              />
            </div>
          </section>

          {/* Notes */}
          <section>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">
              Overall Notes
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Strengths, gaps, recommended next steps…"
              value={evaluation.overall_notes}
              onChange={(e) => setEvaluation((ev) => ({ ...ev, overall_notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#FF5800] transition-colors font-body resize-none"
            />
            <p className="text-right text-gray-400 dark:text-white/30 text-xs font-body mt-1">
              {evaluation.overall_notes.length} / 500
            </p>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/60 text-sm font-body hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : '🏁 Save & Mark Done'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
