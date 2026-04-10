import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || ''
const TECH_TABS = ['Java', 'Advanced Java', 'JavaScript', 'React', 'Database', 'Others']
const EMPTY_FORM = { tech: 'Java', question: '', answer: '', difficulty: 'Medium' }

export default function QAManager({ token }) {
  const [qaData, setQaData] = useState({})
  const [activeTab, setActiveTab] = useState('Java')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => { if (token) fetchQA(activeTab) }, [activeTab, token])

  const fetchQA = async (tech) => {
    try {
      const r = await fetch(`${API_URL}/qa?tech=${encodeURIComponent(tech)}`, { headers: authHeaders })
      const d = await r.json()
      if (Array.isArray(d)) setQaData((prev) => ({ ...prev, [tech]: d }))
    } catch {}
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `${API_URL}/qa/${editId}` : `${API_URL}/qa`
      const r = await fetch(url, { method, headers: authHeaders, body: JSON.stringify({ ...form, tech: activeTab }) })
      if (!r.ok) throw new Error()
      setMsg('Saved!')
      setForm(EMPTY_FORM)
      setEditId(null)
      fetchQA(activeTab)
    } catch {
      setMsg('Error saving.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Q&A?')) return
    try {
      await fetch(`${API_URL}/qa/${id}`, { method: 'DELETE', headers: authHeaders })
      fetchQA(activeTab)
    } catch {}
  }

  const items = qaData[activeTab] || []

  return (
    <div>
      <h3 className="font-display font-bold text-xl text-white mb-6">Q&A Manager</h3>

      {/* Tech tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TECH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setEditId(null); setForm({ ...EMPTY_FORM, tech: tab }) }}
            className="px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all duration-200"
            style={{
              background: activeTab === tab ? '#0045AD' : 'rgba(255,255,255,0.07)',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
              border: activeTab === tab ? '1px solid #0045AD' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Add/Edit form */}
      <form onSubmit={handleSave} className="glass-card mb-6 space-y-3">
        <h4 className="text-white/60 text-xs font-body">{editId ? '✏️ Editing question' : '➕ Add new question'} — {activeTab}</h4>
        <div>
          <label className="block text-white/50 text-xs mb-1 font-body">Question</label>
          <input
            required
            maxLength={500}
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#0045AD] transition-colors font-body"
            placeholder="Enter interview question..."
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs mb-1 font-body">Answer</label>
          <textarea
            required
            rows={4}
            maxLength={3000}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#0045AD] transition-colors font-body resize-none"
            placeholder="Detailed answer..."
          />
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none font-body"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          {msg && <span className={`text-sm font-body ${msg === 'Saved!' ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>}
          <button type="submit" disabled={saving} className="btn-primary text-xs px-4 py-2 ml-auto">
            {saving ? 'Saving...' : editId ? 'Update' : 'Add Q&A'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM) }} className="btn-outline text-xs px-3 py-2">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Q&A list */}
      {items.length === 0 ? (
        <p className="text-white/30 text-sm">No questions yet for {activeTab}. Add some above.</p>
      ) : (
        <div className="space-y-3">
          {items.map((qa) => (
            <div key={qa.id} className="glass-card">
              <div className="flex justify-between gap-3 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 text-xs rounded font-body"
                      style={{
                        background: qa.difficulty === 'Easy' ? '#009E6022' : qa.difficulty === 'Hard' ? '#C41E3A22' : '#FFD50022',
                        color: qa.difficulty === 'Easy' ? '#009E60' : qa.difficulty === 'Hard' ? '#C41E3A' : '#FFD500',
                      }}
                    >
                      {qa.difficulty}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm font-semibold font-body">{qa.question}</p>
                  <p className="text-white/50 text-xs mt-1 line-clamp-2 font-body">{qa.answer}</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditId(qa.id); setForm({ tech: activeTab, question: qa.question, answer: qa.answer, difficulty: qa.difficulty }) }}
                    className="text-[#FFD500] text-xs hover:underline"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(qa.id)} className="text-red-400 text-xs hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
