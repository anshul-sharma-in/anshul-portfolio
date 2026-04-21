import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'

const STATUS_COLORS = {
  pending: 'text-yellow-600 dark:text-yellow-300',
  approved: 'text-green-600 dark:text-green-400',
  time_suggested: 'text-blue-600 dark:text-blue-300',
  scheduled: 'text-purple-600 dark:text-purple-300',
  completed: 'text-gray-500 dark:text-gray-400',
}

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved ✅',
  time_suggested: 'Time Suggested 📅',
  scheduled: 'Scheduled 🚀',
  completed: 'Completed 🏁',
}

function SuggestTimeModal({ applicant, onClose, onConfirm }) {
  const [datetime, setDatetime] = useState('')
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4"
      >
        <h3 className="text-gray-900 dark:text-white font-display font-bold text-lg">Suggest Interview Time</h3>
        <p className="text-gray-500 dark:text-white/50 text-sm font-body">For: {applicant.name} ({applicant.email})</p>
        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Date &amp; Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Note (optional)</label>
          <input
            type="text"
            maxLength={200}
            placeholder="e.g. Google Meet link, platform…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#FF5800] transition-colors font-body text-sm"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-white/20 text-gray-500 dark:text-white/60 text-sm font-body hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!datetime}
            onClick={() => onConfirm(datetime, note)}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
            style={{ background: datetime ? '#FF5800' : '#333' }}
          >
            Confirm & Notify
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
  const [suggestTarget, setSuggestTarget] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setApplications((data ?? []).filter(a => a.status !== 'rejected'))
    setLoading(false)
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const sendStatusEmail = (applicant, newStatus, suggestedTime = '') => {
    supabase.functions.invoke('notify-applicant', {
      body: {
        to_email: applicant.email,
        applicant_name: applicant.name,
        new_status: newStatus,
        suggested_time: suggestedTime,
        app_id: applicant.id,
        response_token: applicant.response_token,
      },
    }).catch(() => {})
  }

  const updateStatus = async (row, newStatus, extra = {}) => {
    setActionLoading(row.id)
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: newStatus, ...extra })
      .eq('id', row.id)
    if (!updateError) {
      sendStatusEmail(row, newStatus, extra.suggested_time || '')
      setApplications((prev) =>
        prev.map((a) => a.id === row.id ? { ...a, status: newStatus, ...extra } : a)
      )
    }
    setActionLoading(null)
  }

  const handleSuggestConfirm = async (datetime, note) => {
    const formatted = new Date(datetime).toLocaleString('en-IN', {
      dateStyle: 'medium', timeStyle: 'short',
    }) + (note ? ` — ${note}` : '')
    await updateStatus(suggestTarget, 'time_suggested', { suggested_time: formatted })
    setSuggestTarget(null)
  }

  if (loading) {
    return <div className="text-white/40 text-sm font-body py-6">Loading applications…</div>
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-red-400 text-sm font-body">Failed to load: {error}</p>
        <p className="text-white/30 text-xs font-body">Check Supabase RLS policies — authenticated users need SELECT access.</p>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {suggestTarget && (
          <SuggestTimeModal
            applicant={suggestTarget}
            onClose={() => setSuggestTarget(null)}
            onConfirm={handleSuggestConfirm}
          />
        )}
      </AnimatePresence>

      <div>
        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">Candidate Management</h3>
        <p className="text-gray-400 dark:text-white/40 text-sm font-body mb-6">
          {applications.length} application{applications.length !== 1 ? 's' : ''} · Click a row to expand message
        </p>

        {applications.length === 0 ? (
          <div className="text-center py-12 text-gray-300 dark:text-white/30 font-body">
            <div className="text-4xl mb-3">📭</div>
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((a) => (
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
                    {a.suggested_time && (
                      <p className="text-blue-300/80 text-xs mt-1">🕐 {a.suggested_time}</p>
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
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled={actionLoading === a.id || a.status === 'approved'}
                        onClick={() => updateStatus(a, 'approved')}
                        title="Approve"
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/40 disabled:opacity-30 transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        disabled={actionLoading === a.id}
                        onClick={() => setSuggestTarget(a)}
                        title="Propose new time"
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/40 disabled:opacity-30 transition-colors"
                      >
                        📅
                      </button>
                      {a.status === 'scheduled' && (
                        <button
                          disabled={actionLoading === a.id}
                          onClick={() => updateStatus(a, 'completed')}
                          title="Mark as completed"
                          className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-500/20 text-gray-600 dark:text-gray-300 hover:bg-gray-500/40 disabled:opacity-30 transition-colors"
                        >
                          🏁
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
                      {(a.role || a.tech_stack) && (
                        <div className="mt-3 flex flex-wrap gap-4">
                          {a.role && (
                            <div>
                              <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Role</p>
                              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: 'rgba(255,88,0,0.1)', color: '#FF5800', border: '1px solid rgba(255,88,0,0.3)' }}>{a.role}</span>
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
                          <a
                            href={a.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                          >
                            📎 View Resume
                          </a>
                        </div>
                      )}
                      {a.preferred_time && (
                        <div className="mt-3">
                          <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Preferred Time</p>
                          <p className="text-[#FFD500]/80 text-sm font-body">📅 {a.preferred_time}</p>
                        </div>
                      )}
                      {a.suggested_time && (
                        <div className="mt-3">
                          <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1 font-body">Suggested Time</p>
                          <p className="text-blue-400 text-sm font-body">📅 {a.suggested_time}</p>
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
