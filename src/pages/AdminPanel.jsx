import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  pending: { label: 'Pending', bg: 'bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-300' },
  approved: { label: 'Approved', bg: 'bg-green-500/20', text: 'text-green-600 dark:text-green-300' },
  time_suggested: { label: 'Time Suggested', bg: 'bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300' },
  scheduled: { label: 'Scheduled', bg: 'bg-purple-500/20', text: 'text-purple-600 dark:text-purple-300' },
  completed: { label: 'Completed', bg: 'bg-gray-500/20', text: 'text-gray-500 dark:text-gray-400' },
}

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] || STATUS_LABELS.pending
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

// ─── login screen ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (otpError) {
      setError(otpError.message)
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })
    if (verifyError || !data.session) {
      setError(verifyError?.message || 'Invalid or expired code.')
    } else {
      onLogin()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-gray-900 dark:text-white font-display font-bold text-xl">Admin Access</h1>
          <p className="text-gray-400 dark:text-white/40 text-sm mt-1 font-body">
            {step === 'email' ? 'Enter your email to receive a one-time code.' : `Code sent to ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#0D7377] transition-colors font-body text-sm"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-body">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-display font-semibold text-white transition-all"
              style={{ background: loading ? '#444' : '#0D7377' }}
            >
              {loading ? 'Sending…' : 'Send Code →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">8-digit code from email</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                required
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-center tracking-widest text-lg placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#0D7377] transition-colors font-body"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-body">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-2.5 rounded-lg font-display font-semibold text-white transition-all"
              style={{ background: (loading || otp.length < 6) ? '#444' : '#0D7377' }}
            >
              {loading ? 'Verifying…' : 'Verify & Login →'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
              className="w-full text-gray-400 dark:text-white/40 text-sm font-body hover:text-gray-600 dark:hover:text-white/60 transition-colors"
            >
              ← Resend / change email
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

// ─── suggest-time modal ──────────────────────────────────────────────────────

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
        <h3 className="text-gray-900 dark:text-white font-display font-bold text-lg">
          Suggest Interview Time
        </h3>
        <p className="text-gray-500 dark:text-white/50 text-sm font-body">For: {applicant.name} ({applicant.email})</p>
        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Date &amp; Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-[#0D7377] transition-colors font-body text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-500 dark:text-white/50 text-xs mb-1 font-body uppercase tracking-wider">Note (optional)</label>
          <input
            type="text"
            maxLength={200}
            placeholder="e.g. Google Meet link, platform details…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#0D7377] transition-colors font-body text-sm"
          />
        </div>
        <div className="flex gap-3 pt-2">
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
            style={{ background: datetime ? '#0D7377' : '#333' }}
          >
            Confirm & Notify
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── applications tab ─────────────────────────────────────────────────────────

function ApplicationsTab() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // id of row being actioned
  const [suggestTarget, setSuggestTarget] = useState(null) // row for suggest-time modal
  const [expandedId, setExpandedId] = useState(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setFetchError(error.message)
    } else {
      setApplications((data ?? []).filter(a => a.status !== 'rejected'))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFetchError(null)
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (error) setFetchError(error.message)
      else setApplications((data ?? []).filter(a => a.status !== 'rejected'))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

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
    }).catch(() => {/* silent */})
  }

  const updateStatus = async (row, newStatus, extra = {}) => {
    setActionLoading(row.id)
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus, ...extra })
      .eq('id', row.id)
    if (!error) {
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
    return <div className="text-gray-400 dark:text-white/40 text-sm font-body py-8 text-center">Loading applications…</div>
  }

  if (fetchError) {
    return (
      <div className="text-center py-12 font-body space-y-3">
        <div className="text-3xl">⚠️</div>
        <p className="text-red-400 text-sm">Failed to load applications</p>
        <p className="text-gray-400 dark:text-white/30 text-xs font-mono bg-gray-100 dark:bg-white/5 rounded-lg px-4 py-2 inline-block max-w-lg break-all">
          {fetchError}
        </p>
        <div className="pt-2">
          <button
            onClick={fetchApplications}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-white font-body border border-gray-200 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 text-gray-300 dark:text-white/30 font-body">
        <div className="text-4xl mb-3">📭</div>
        <p>No applications yet.</p>
        <button
          onClick={fetchApplications}
          className="mt-4 px-4 py-2 rounded-lg text-xs text-gray-400 dark:text-white/40 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <>
      {suggestTarget && (
        <SuggestTimeModal
          applicant={suggestTarget}
          onClose={() => setSuggestTarget(null)}
          onConfirm={handleSuggestConfirm}
        />
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', count: applications.length, color: '#6b7280' },
          { label: 'Pending', count: applications.filter(a => a.status === 'pending').length, color: '#d97706' },
          { label: 'Approved', count: applications.filter(a => a.status === 'approved').length, color: '#22c55e' },
          { label: 'Scheduled', count: applications.filter(a => a.status === 'scheduled').length, color: '#8b5cf6' },
          { label: 'Completed', count: applications.filter(a => a.status === 'completed').length, color: '#9ca3af' },
        ].map((s) => (
          <div key={s.label} className="glass-card py-3 text-center">
            <p className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-gray-400 dark:text-white/40 text-xs font-body mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 uppercase text-xs tracking-wider">
              <th className="px-4 py-3 text-left">Applicant</th>
              <th className="px-4 py-3 text-left">Role / Stack</th>
              <th className="px-4 py-3 text-left">Applied</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <>
                <tr
                  key={app.id}
                  className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/3 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <td className="px-4 py-3">
                    <p className="text-gray-900 dark:text-white font-semibold">{app.name}</p>
                    <p className="text-gray-400 dark:text-white/40 text-xs">{app.email}</p>
                    {app.phone && <p className="text-gray-300 dark:text-white/30 text-xs">{app.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {app.role && (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold mb-1" style={{ background: 'rgba(255,88,0,0.1)', color: '#FF5800', border: '1px solid rgba(255,88,0,0.3)' }}>{app.role}</span>
                    )}
                    {app.tech_stack && <p className="text-gray-500 dark:text-white/50 text-xs">{app.tech_stack}</p>}
                    {!app.role && <span className="text-gray-300 dark:text-white/30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-white/50">
                    {new Date(app.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                    {app.suggested_time && (
                      <p className="text-blue-400/70 text-xs mt-1">{app.suggested_time}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled={actionLoading === app.id || app.status === 'approved'}
                        onClick={() => updateStatus(app, 'approved')}
                        className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/40 disabled:opacity-40 transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        disabled={actionLoading === app.id}
                        onClick={() => setSuggestTarget(app)}
                        className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/40 disabled:opacity-40 transition-colors"
                      >
                        📅 Propose Time
                      </button>
                      {app.status === 'scheduled' && (
                        <button
                          disabled={actionLoading === app.id}
                          onClick={() => updateStatus(app, 'completed')}
                          className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-600 dark:text-gray-300 hover:bg-gray-500/40 disabled:opacity-40 transition-colors"
                        >
                          🏁 Done
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === app.id && (
                  <tr key={`${app.id}-detail`} className="bg-gray-50 dark:bg-white/3 border-t border-gray-100 dark:border-white/5">
                    <td colSpan={5} className="px-4 py-3">
                      {app.preferred_time && (
                        <div className="mb-3">
                          <p className="text-gray-400 dark:text-white/50 text-xs uppercase tracking-wider mb-1">Preferred Time</p>
                          <p className="text-yellow-600 dark:text-yellow-300/80 text-sm font-body">📅 {app.preferred_time}</p>
                        </div>
                      )}
                      {app.resume_url && (
                        <div className="mb-3">
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                          >
                            📎 View Resume
                          </a>
                        </div>
                      )}
                      <p className="text-gray-400 dark:text-white/50 text-xs uppercase tracking-wider mb-1">Message</p>
                      <p className="text-gray-700 dark:text-white/80 text-sm font-body whitespace-pre-wrap">
                        {app.message || <em className="text-gray-300 dark:text-white/30">No message provided</em>}
                      </p>
                      <div className="mt-3">
                        <p className="text-gray-400 dark:text-white/50 text-xs uppercase tracking-wider mb-1">Admin Notes</p>
                        <textarea
                          rows={2}
                          defaultValue={app.notes || ''}
                          placeholder="Private notes..."
                          onBlur={async (e) => {
                            await supabase.from('applications').update({ notes: e.target.value }).eq('id', app.id)
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/25 text-xs font-body resize-none focus:outline-none focus:border-[#FF5800] transition-colors"
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-gray-400 dark:text-white/30 text-xs font-body mt-3">
        {applications.length} application{applications.length !== 1 ? 's' : ''} · Click a row to expand message
      </p>
    </>
  )
}

// ─── resources tab ────────────────────────────────────────────────────────────

function ResourcesTab() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingKey, setDeletingKey] = useState(null)

  const storageBase = import.meta.env.VITE_SUPABASE_STORAGE_URL

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.storage.from('resources').list('', {
      sortBy: { column: 'name', order: 'asc' },
    })
    if (!error && data) {
      setFiles(data.filter((f) => f.name !== '.emptyFolderPlaceholder'))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.storage.from('resources').list('', {
        sortBy: { column: 'name', order: 'asc' },
      })
      if (cancelled) return
      if (!error && data) setFiles(data.filter((f) => f.name !== '.emptyFolderPlaceholder'))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const { error } = await supabase.storage
      .from('resources')
      .upload(file.name, file, { upsert: true })
    if (!error) await fetchFiles()
    setUploading(false)
    e.target.value = ''
  }

  const handleDelete = async (fileName) => {
    setDeletingKey(fileName)
    await supabase.storage.from('resources').remove([fileName])
    setFiles((prev) => prev.filter((f) => f.name !== fileName))
    setDeletingKey(null)
  }

  const publicUrl = (fileName) =>
    storageBase ? `${storageBase}/resources/${fileName}` : '#'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <span
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: uploading ? '#333' : '#0D7377' }}
          >
            {uploading ? 'Uploading…' : '⬆ Upload File'}
          </span>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            disabled={uploading}
            className="hidden"
            onChange={handleUpload}
          />
        </label>
        <p className="text-gray-400 dark:text-white/40 text-sm font-body">PDF, PPT, DOC — shown publicly on Interview page</p>
      </div>

      {loading ? (
        <div className="text-gray-400 dark:text-white/40 text-sm font-body">Loading files…</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-gray-300 dark:text-white/30 font-body">
          <div className="text-3xl mb-2">📁</div>
          <p>No files uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">📄</span>
                <div className="min-w-0">
                  <p className="text-gray-800 dark:text-white/90 text-sm font-body truncate">{file.name}</p>
                  <p className="text-gray-400 dark:text-white/30 text-xs">
                    {file.metadata?.size
                      ? `${(file.metadata.size / 1024).toFixed(0)} KB`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <a
                  href={publicUrl(file.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors font-body"
                >
                  Preview
                </a>
                <button
                  disabled={deletingKey === file.name}
                  onClick={() => handleDelete(file.name)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40 disabled:opacity-40 transition-colors"
                >
                  {deletingKey === file.name ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── main admin panel ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'applications', label: 'Applications 📋' },
  { id: 'resources', label: 'Resources 📁' },
]

export default function AdminPanel() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [activeTab, setActiveTab] = useState('applications')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Still checking session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0D7377] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <LoginScreen onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 dark:text-white font-display font-bold text-2xl">Admin Dashboard</h1>
            <p className="text-gray-400 dark:text-white/40 text-sm font-body mt-0.5">{session.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/20 text-gray-500 dark:text-white/60 text-sm font-body hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? '#0D7377' : 'var(--bg-card)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? '#0D7377' : 'var(--border-primary)'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'applications' && <ApplicationsTab />}
            {activeTab === 'resources' && <ResourcesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
