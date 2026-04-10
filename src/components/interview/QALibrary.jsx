import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || ''

const TECH_TABS = ['Java', 'Advanced Java', 'JavaScript', 'React', 'Database', 'Others']

const PLACEHOLDER_QA = {
  Java: [
    { id: '1', question: 'What is the difference between JDK, JRE, and JVM?', answer: 'JVM (Java Virtual Machine) executes bytecode. JRE includes JVM + standard libraries. JDK includes JRE + development tools (compiler, debugger).' },
    { id: '2', question: 'Explain OOP principles in Java.', answer: 'The four OOP principles are: Encapsulation (hiding data), Abstraction (hiding implementation), Inheritance (code reuse via subclassing), and Polymorphism (one interface, multiple behaviors).' },
  ],
  'Advanced Java': [
    { id: '3', question: 'What is the difference between synchronized and volatile?', answer: 'volatile ensures visibility across threads for a single variable. synchronized ensures mutual exclusion and visibility for a block of code.' },
  ],
  JavaScript: [
    { id: '4', question: 'What is event loop in JavaScript?', answer: 'The event loop is a mechanism that allows JS to perform non-blocking operations despite being single-threaded. It processes the call stack, then the task queue, and microtask queue in sequence.' },
  ],
  React: [
    { id: '5', question: 'What is the difference between useEffect and useLayoutEffect?', answer: 'useEffect runs after the browser has painted. useLayoutEffect runs synchronously after DOM mutations but before the browser paints. Use useLayoutEffect for measuring DOM or avoiding visual flicker.' },
  ],
  Database: [
    { id: '6', question: 'What is database indexing and when to use it?', answer: 'An index is a data structure (usually B-Tree or Hash) that speeds up data retrieval. Use indexes on columns frequently used in WHERE, JOIN, ORDER BY. Avoid over-indexing as it slows writes.' },
  ],
  Others: [
    { id: '7', question: 'What is a microservices architecture?', answer: 'An approach where an application is built as a collection of small, independently deployable services, each running in its own process and communicating via APIs.' },
  ],
}

export default function QALibrary({ token }) {
  const [activeTab, setActiveTab] = useState('Java')
  const [qaData, setQaData] = useState(PLACEHOLDER_QA)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!API_URL || !token) return
    setLoading(true)
    fetch(`${API_URL}/qa?tech=${encodeURIComponent(activeTab)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQaData((prev) => ({ ...prev, [activeTab]: data }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab, token])

  const items = qaData[activeTab] || []

  return (
    <div>
      <h3 className="font-display font-bold text-xl text-white mb-6">Q&A Library</h3>

      {/* Tech tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TECH_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setExpandedId(null) }}
            className="px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all duration-200"
            style={{
              background: activeTab === tab ? '#FF5800' : 'rgba(255,255,255,0.07)',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
              border: activeTab === tab ? '1px solid #FF5800' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/40 text-sm">Loading Q&A...</div>
      ) : items.length === 0 ? (
        <div className="text-white/30 text-sm">No questions yet for {activeTab}.</div>
      ) : (
        <div className="space-y-3">
          {items.map((qa) => (
            <div
              key={qa.id}
              className="glass-card cursor-pointer hover:border-white/30 transition-all duration-200"
              onClick={() => setExpandedId(expandedId === qa.id ? null : qa.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-white/90 text-sm font-semibold font-body">{qa.question}</p>
                <span className="text-white/30 text-lg flex-shrink-0">
                  {expandedId === qa.id ? '▲' : '▼'}
                </span>
              </div>

              <AnimatePresence>
                {expandedId === qa.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-3 pt-3 text-white/65 text-sm leading-relaxed font-body"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {qa.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
