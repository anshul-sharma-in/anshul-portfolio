import { motion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    title: 'Apply',
    description: 'Fill out the short form with your experience, role, and tech stack. Upload your resume in under 2 minutes.',
    color: '#FF5800',
    icon: '📋',
  },
  {
    number: '02',
    title: 'I Review & Schedule',
    description: "I review your profile, pick a suitable time, and send you a calendar invite with the platform link.",
    color: '#0045AD',
    icon: '🔍',
  },
  {
    number: '03',
    title: 'Interview & Feedback',
    description: 'We do a real-world mock interview. You get honest feedback, curated Q&A, and a clear path forward.',
    color: '#009E60',
    icon: '🎯',
  },
]

export default function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-[#FF5800] font-display text-sm tracking-widest uppercase mb-2">Simple Process</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 dark:text-white">
          How It Works
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="relative glass-card"
            style={{ borderTop: `3px solid ${step.color}` }}
          >
            <div
              className="text-5xl font-black font-display mb-3 opacity-10 select-none"
              style={{ color: step.color }}
            >
              {step.number}
            </div>
            <div className="text-3xl mb-3">{step.icon}</div>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: step.color }}>
              {step.title}
            </h3>
            <p className="text-sm font-body leading-relaxed text-gray-500 dark:text-white/60">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
