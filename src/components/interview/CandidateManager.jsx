import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import EvaluationModal from './EvaluationModal'
import { avg, formatScore, overallScore, scoreColor, subSkillLabel } from './evaluationHelpers'

const STATUS_COLORS = {
  applied: 'text-yellow-600 dark:text-yellow-300',
  scheduled: 'text-purple-600 dark:text-purple-300',
  confirmed: 'text-green-600 dark:text-green-400',
  completed: 'text-fuchsia-600 dark:text-fuchsia-300',
  reschedule_requested: 'text-blue-600 dark:text-blue-300',
  cancelled: 'text-red-600 dark:text-red-400',
}

const STATUS_LABELS = {
  applied: 'Applied 📥',
  scheduled: 'Scheduled 🚀',
  confirmed: 'Confirmed ✅',
  completed: 'Completed 🏁',
  reschedule_requested: 'Reschedule Requested 🔄',
  cancelled: 'Cancelled ❌',
}

const HIDDEN_STATUSES = new Set(['rejected'])

const DURATION_OPTIONS = [30, 45, 60, 90]

function toLocalInputs(iso) {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

function ScheduleModal({ applicant, onClose, onConfirm }) {
  const seed = toLocalInputs(applicant.scheduled_at)
  const [date, setDate] = useState(seed.date)
  const [time, setTime] = useState(seed.time)
  const [duration, setDuration] = useState(applicant.duration_minutes || 60)
  const [meetingLink, setMeetingLink] = useState(applicant.meeting_link || '')
  const [instructions, setInstructions] = useState(applicant.schedule_instructions || '')
  const [submitting, setSubmitting] = useState(false)

  const isValid = date && time && meetingLink.trim().length > 0

  const handleConfirm = async () => {
    if (!isValid) return
    setSubmitting(true)
    const scheduledAt = new Date(`${date}T${time}`).toISOString()
    await onConfirm({
      scheduled_at: scheduledAt,
      duration_minutes: Number(duration),
      meeting_link: meetingLink.trim(),
      schedule_instructions: instructions.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-gray-900 dark:text-white font-display font-bold text-lg">Schedule Interview</h3>
        <p className="text-gray-500 dark:text-white/50 text-sm font-body">For: {applicant.name} ({applicant.email})</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>{d} minutes</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Meeting Link *</label>
          <input
            type="url"
            placeholder="https://meet.google.com/… or https://zoom.us/…"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Instructions (optional)</label>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="Anything the candidate should prepare or know beforehand…"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-white/20 text-gray-500 dark:text-white/60 text-sm font-body hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={!isValid || submitting}
            onClick={handleConfirm}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
            style={{ background: isValid && !submitting ? '#FF5800' : '#333' }}
          >
            {submitting ? 'Saving…' : 'Save & Notify'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function CandidateManager() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [scheduleTarget, setScheduleTarget] = useState(null)
  const [evalTarget, setEvalTarget] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [showCancelled, setShowCancelled] = useState(false)
  const [resumeLoadingId, setResumeLoadingId] = useState(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setApplications(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const sendStatusEmail = (applicant, newStatus, extras = {}) => {
    const fnByStatus = {
      scheduled: 'notify-applicant-scheduled',
      completed: 'notify-applicant-completed',
      cancelled: 'notify-applicant-cancelled',
    }
    const fn = fnByStatus[newStatus]
    if (!fn) return
    supabase.functions.invoke(fn, {
      body: {
        to_email: applicant.email,
        applicant_name: applicant.name,
        app_id: applicant.id,
        response_token: applicant.response_token,
        ...extras,
      },
    }).catch(() => {})
  }

  const updateStatus = async (row, newStatus, extra = {}, emailExtras = null) => {
    setActionLoading(row.id)
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: newStatus, ...extra })
      .eq('id', row.id)
    if (!updateError) {
      if (emailExtras !== false) sendStatusEmail(row, newStatus, emailExtras || {})
      setApplications((prev) =>
        prev.map((a) => a.id === row.id ? { ...a, status: newStatus, ...extra } : a)
      )
    }
    setActionLoading(null)
  }

  const handleScheduleConfirm = async (schedule) => {
    await updateStatus(
      scheduleTarget,
      'scheduled',
      schedule,
      {
        scheduled_at: schedule.scheduled_at,
        duration_minutes: schedule.duration_minutes,
        meeting_link: schedule.meeting_link,
        schedule_instructions: schedule.schedule_instructions,
      },
    )
    setScheduleTarget(null)
  }

  const handleEvalSave = async (evaluation) => {
    await updateStatus(evalTarget, 'completed', { evaluation })
    setEvalTarget(null)
  }

  const handleCancel = (row) => {
    if (!window.confirm(`Cancel interview with ${row.name}?`)) return
    updateStatus(row, 'cancelled')
  }

  const handleViewResume = async (row) => {
    if (!row.resume_url) return
    setResumeLoadingId(row.id)
    try {
      // resume_url is stored as `resume/<filename>`. Strip the bucket prefix.
      const path = row.resume_url.startsWith('resume/')
        ? row.resume_url.slice('resume/'.length)
        : row.resume_url
      const { data, error: signErr } = await supabase
        .storage
        .from('resume')
        .createSignedUrl(path, 60 * 10)
      if (signErr || !data?.signedUrl) {
        window.alert(`Could not generate resume link: ${signErr?.message || 'unknown error'}`)
        return
      }
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setResumeLoadingId(null)
    }
  }

  if (loading) {
    return <div className="text-gray-500 dark:text-white/40 text-sm font-body py-6">Loading applications…</div>
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-red-500 dark:text-red-400 text-sm font-body">Failed to load: {error}</p>
        <p className="text-gray-400 dark:text-white/30 text-xs font-body">Check Supabase RLS policies — authenticated users need SELECT access.</p>
      </div>
    )
  }

  const visible = applications.filter((a) => {
    if (HIDDEN_STATUSES.has(a.status)) return false
    if (!showCancelled && a.status === 'cancelled') return false
    return true
  })
  const cancelledCount = applications.filter((a) => a.status === 'cancelled').length

  return (
    <>
      <AnimatePresence>
        {scheduleTarget && (
          <ScheduleModal
            applicant={scheduleTarget}
            onClose={() => setScheduleTarget(null)}
            onConfirm={handleScheduleConfirm}
          />
        )}
        {evalTarget && (
          <EvaluationModal
            applicant={evalTarget}
            initial={evalTarget.evaluation}
            onClose={() => setEvalTarget(null)}
            onSave={handleEvalSave}
          />
        )}
      </AnimatePresence>

      <div>
        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">Candidate Management</h3>
        <div className="flex items-center justify-between mb-6 gap-3">
          <p className="text-gray-400 dark:text-white/40 text-sm font-body">
            {visible.length} application{visible.length !== 1 ? 's' : ''} · Click a row to expand
          </p>
          {cancelledCount > 0 && (
            <button
              onClick={() => setShowCancelled((v) => !v)}
              className="text-xs font-body text-gray-500 dark:text-white/50 hover:text-[#FF5800] transition-colors"
            >
              {showCancelled ? 'Hide' : 'Show'} cancelled ({cancelledCount})
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-12 text-gray-300 dark:text-white/30 font-body">
            <div className="text-4xl mb-3">📭</div>
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 overflow-hidden"
              >
                {/* Main row */}
                <div
                  className="flex flex-wrap items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white font-body">{a.name}</p>
                    <p className="text-gray-500 dark:text-white/50 text-xs">
                      {a.email}
                      {a.phone ? ` · ${a.phone}` : ''}
                      {a.experience ? ` · ${a.experience} exp` : ''}
                    </p>
                    {a.scheduled_at && (
                      <p className="text-purple-500 dark:text-purple-300/90 text-xs mt-1">
                        🚀 {new Date(a.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        {a.duration_minutes ? ` · ${a.duration_minutes} min` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-gray-400 dark:text-white/30 text-xs">
                        {new Date(a.created_at).toLocaleDateString('en-IN')}
                      </p>
                      <p className={`text-xs font-semibold mt-0.5 ${STATUS_COLORS[a.status] || 'text-gray-500 dark:text-white/50'}`}>
                        {STATUS_LABELS[a.status] || a.status}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
                      {(a.status === 'applied' || a.status === 'reschedule_requested' || a.status === 'scheduled' || a.status === 'confirmed') && (
                        <button
                          disabled={actionLoading === a.id}
                          onClick={() => setScheduleTarget(a)}
                          title={a.scheduled_at ? 'Reschedule interview' : 'Schedule interview'}
                          className="px-3 py-1.5 rounded-lg text-xs bg-[#FF5800]/15 text-[#FF5800] hover:bg-[#FF5800]/30 disabled:opacity-30 transition-colors font-semibold"
                        >
                          {a.scheduled_at ? '🔄 Reschedule' : '📅 Schedule Interview'}
                        </button>
                      )}
                      {(a.status === 'scheduled' || a.status === 'confirmed') && (
                        <button
                          disabled={actionLoading === a.id}
                          onClick={() => setEvalTarget(a)}
                          title="Mark completed & evaluate"
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-500/40 disabled:opacity-30 transition-colors"
                        >
                          🏁 Complete
                        </button>
                      )}
                      {a.status === 'completed' && (
                        <button
                          onClick={() => setEvalTarget(a)}
                          title="Edit evaluation"
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors"
                        >
                          ✏️
                        </button>
                      )}
                      {a.status !== 'cancelled' && a.status !== 'completed' && (
                        <button
                          disabled={actionLoading === a.id}
                          onClick={() => handleCancel(a)}
                          title="Cancel interview"
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/35 disabled:opacity-30 transition-colors"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded message */}
                <AnimatePresence>
                  {expandedId === a.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-white/5 px-4 py-3 bg-gray-50 dark:bg-white/3"
                    >
                      <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Message</p>
                      <p className="text-gray-700 dark:text-white/75 text-sm font-body whitespace-pre-wrap">
                        {a.message || <em className="text-gray-300 dark:text-white/25">No message provided</em>}
                      </p>
                      {a.evaluation && (
                        <div className="mt-4">
                          <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-2 font-body">Evaluation</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(() => {
                              const overall = overallScore(a.evaluation)
                              const techAvg = avg(a.evaluation.technical)
                              const items = [
                                { label: 'Overall', val: overall },
                                { label: 'Technical', val: techAvg },
                                { label: 'Communication', val: a.evaluation.communication },
                                { label: 'Attitude', val: a.evaluation.attitude },
                                { label: 'Confidence', val: a.evaluation.confidence },
                              ]
                              return items.map(({ label, val }) => {
                                const c = scoreColor(val)
                                return (
                                  <div
                                    key={label}
                                    className="rounded-lg px-3 py-2 text-center"
                                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                                  >
                                    <p className="text-[10px] uppercase tracking-wider font-body" style={{ color: c.text }}>{label}</p>
                                    <p className="font-display font-bold text-lg" style={{ color: c.text }}>{formatScore(val)}</p>
                                  </div>
                                )
                              })
                            })()}
                          </div>
                          {Object.keys(a.evaluation.technical || {}).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {Object.entries(a.evaluation.technical).map(([k, v]) => {
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
                          )}
                          {a.evaluation.overall_notes && (
                            <p className="mt-3 text-gray-600 dark:text-white/65 text-xs font-body italic">
                              "{a.evaluation.overall_notes}"
                            </p>
                          )}
                        </div>
                      )}
                      {(a.role || a.tech_stack || a.interview_type) && (
                        <div className="mt-3 flex flex-wrap gap-4">
                          {a.role && (
                            <div>
                              <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Role</p>
                              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(255,88,0,0.1)', color: '#FF5800', border: '1px solid rgba(255,88,0,0.3)' }}>{a.role}</span>
                            </div>
                          )}
                          {a.interview_type && (
                            <div>
                              <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Interview Type</p>
                              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(13,115,119,0.12)', color: '#0D7377', border: '1px solid rgba(13,115,119,0.3)' }}>{a.interview_type}</span>
                            </div>
                          )}
                          {a.tech_stack && (
                            <div>
                              <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Tech Stack</p>
                              <p className="text-gray-600 dark:text-white/70 text-xs font-body">{a.tech_stack}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {a.resume_url && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleViewResume(a)}
                            disabled={resumeLoadingId === a.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                          >
                            📎 {resumeLoadingId === a.id ? 'Opening…' : 'View Resume'}
                          </button>
                        </div>
                      )}
                      {a.preferred_time && (
                        <div className="mt-3">
                          <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Preferred Time</p>
                          <p className="text-[#FFD500]/80 text-sm font-body">📅 {a.preferred_time}</p>
                        </div>
                      )}
                      {a.scheduled_at && (
                        <div className="mt-3 rounded-lg border border-purple-300/30 bg-purple-500/5 p-3 space-y-1">
                          <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider font-body">Scheduled</p>
                          <p className="text-purple-500 dark:text-purple-300 text-sm font-body">
                            🚀 {new Date(a.scheduled_at).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                            {a.duration_minutes ? ` · ${a.duration_minutes} min` : ''}
                          </p>
                          {a.meeting_link && (
                            <p className="text-xs font-body break-all">
                              <a href={a.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                🔗 {a.meeting_link}
                              </a>
                            </p>
                          )}
                          {a.schedule_instructions && (
                            <p className="text-gray-600 dark:text-white/70 text-xs font-body whitespace-pre-wrap mt-1">
                              {a.schedule_instructions}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="mt-4">
                        <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Admin Notes</p>
                        <textarea
                          rows={3}
                          defaultValue={a.notes || ''}
                          placeholder="Add private notes about this candidate..."
                          onBlur={async (e) => {
                            await supabase.from('applications').update({ notes: e.target.value }).eq('id', a.id)
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/25 text-xs font-body resize-none focus:outline-none focus:border-[#FF5800] transition-colors"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
