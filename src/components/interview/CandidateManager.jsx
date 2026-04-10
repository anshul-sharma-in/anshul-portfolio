import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || ''

const EMPTY_FORM = { name: '', email: '', phone: '', interviewDate: '', score: '', feedback: '' }

export default function CandidateManager({ token }) {
  const [candidates, setCandidates] = useState([])
  const [applications, setApplications] = useState([])
  const [activeTab, setActiveTab] = useState('applications')
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (!token) return
    fetchApplications()
    fetchCandidates()
  }, [token])

  const fetchApplications = async () => {
    try {
      const r = await fetch(`${API_URL}/apply`, { headers: authHeaders })
      const d = await r.json()
      if (Array.isArray(d)) setApplications(d)
    } catch {}
  }

  const fetchCandidates = async () => {
    try {
      const r = await fetch(`${API_URL}/candidates`, { headers: authHeaders })
      const d = await r.json()
      if (Array.isArray(d)) setCandidates(d)
    } catch {}
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const method = editItem?.id ? 'PUT' : 'POST'
      const url = editItem?.id ? `${API_URL}/candidates/${editItem.id}` : `${API_URL}/candidates`
      const r = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(form) })
      if (!r.ok) throw new Error()
      setMsg('Saved! Email will be sent to candidate.')
      setEditItem(null)
      setForm(EMPTY_FORM)
      fetchCandidates()
    } catch {
      setMsg('Error saving. Check API connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h3 className="font-display font-bold text-xl text-white mb-6">Candidate Management</h3>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {['applications', 'results'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all duration-200 capitalize"
            style={{
              background: activeTab === t ? '#009E60' : 'rgba(255,255,255,0.07)',
              color: activeTab === t ? '#fff' : 'rgba(255,255,255,0.6)',
              border: activeTab === t ? '1px solid #009E60' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {t === 'applications' ? `📥 Applications (${applications.length})` : `📊 Results (${candidates.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'applications' && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="text-white/30 text-sm">No applications yet. Populate VITE_API_URL in .env.</p>
          ) : (
            applications.map((a) => (
              <div key={a.id} className="glass-card border border-white/10">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white font-body">{a.name}</p>
                    <p className="text-white/50 text-xs">{a.email} · {a.phone} · {a.experience} exp</p>
                    {a.message && <p className="text-white/40 text-xs mt-1">"{a.message}"</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-white/30 text-xs">{new Date(a.appliedAt).toLocaleDateString()}</p>
                    <button
                      onClick={() => { setActiveTab('results'); setForm({ ...EMPTY_FORM, name: a.name, email: a.email, phone: a.phone || '' }); setEditItem({}) }}
                      className="mt-2 btn-primary text-xs px-3 py-1"
                    >
                      Enter Result →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Enter/Edit result form */}
          <form onSubmit={handleSave} className="glass-card space-y-4">
            <h4 className="font-display font-bold text-white/80 text-sm">
              {editItem?.id ? 'Edit Result' : 'Enter New Result'}
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Candidate Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'interviewDate', label: 'Interview Date', type: 'date' },
                { key: 'score', label: 'Score (e.g. 78/100)', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-white/50 text-xs mb-1 font-body">{f.label}</label>
                  <input
                    type={f.type}
                    required={['name', 'email', 'score'].includes(f.key)}
                    maxLength={200}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#009E60] transition-colors font-body"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1 font-body">Feedback / Notes</label>
              <textarea
                rows={4}
                maxLength={2000}
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#009E60] transition-colors font-body resize-none"
                placeholder="Detailed feedback to be emailed to candidate..."
              />
            </div>
            {msg && <p className={`text-sm font-body ${msg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}
            <button type="submit" disabled={saving} className="btn-primary w-full text-sm">
              {saving ? 'Saving & Sending Email...' : 'Save Result & Email Candidate 📧'}
            </button>
          </form>

          {/* Results list */}
          {candidates.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white/50 text-sm font-display">Recorded Results</h4>
              {candidates.map((c) => (
                <div key={c.id} className="glass-card flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <p className="font-semibold text-white font-body">{c.name}</p>
                    <p className="text-white/50 text-xs">{c.email}</p>
                    <p className="text-[#FFD500] font-bold text-sm mt-1">Score: {c.score}</p>
                    {c.feedback && <p className="text-white/40 text-xs mt-1 line-clamp-2">{c.feedback}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-white/30 text-xs">{c.interviewDate}</p>
                    <p className="text-green-400 text-xs mt-1">📧 Email sent: {c.resultSentAt ? new Date(c.resultSentAt).toLocaleDateString() : 'pending'}</p>
                    <button
                      onClick={() => { setEditItem(c); setForm({ name: c.name, email: c.email, phone: c.phone || '', interviewDate: c.interviewDate || '', score: c.score || '', feedback: c.feedback || '' }) }}
                      className="mt-2 btn-outline text-xs px-3 py-1"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
