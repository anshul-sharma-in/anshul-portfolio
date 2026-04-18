import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'

const SKILLS = [
  {
    category: 'Backend',
    color: '#FF5800',
    items: [
      { name: 'Java', level: 85 },
      { name: '.NET (C#)', level: 88 },
      { name: 'Node.js', level: 70 },
      { name: 'REST APIs', level: 90 },
      { name: 'Microservices', level: 78 },
    ],
  },
  {
    category: 'Frontend',
    color: '#0045AD',
    items: [
      { name: 'Vue.js', level: 90 },
      { name: 'JavaScript', level: 90 },
      { name: 'HTML/CSS', level: 85 },
      { name: 'Tailwind CSS', level: 80 },
      { name: 'Three.js', level: 55 },
    ],
  },
  {
    category: 'Cloud & DevOps',
    color: '#FFD500',
    items: [
      { name: 'AWS (Lambda, S3, DynamoDB)', level: 80 },
      { name: 'AWS Amplify', level: 75 },
      { name: 'Docker', level: 72 },
      { name: 'CI/CD', level: 70 },
      { name: 'Route 53 / SES', level: 75 },
    ],
  },
  {
    category: 'Databases',
    color: '#009E60',
    items: [
      { name: 'MySQL / PostgreSQL', level: 85 },
      { name: 'DynamoDB', level: 80 },
      { name: 'MongoDB', level: 65 },
      { name: 'Redis', level: 60 },
    ],
  },
]

export default function Skills() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="section-title">Skills & Tech Stack</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {SKILLS.map((cat, ci) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: ci % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: ci * 0.15 }}
              className="glass-card"
              style={{ borderLeft: `3px solid ${cat.color}` }}
            >
              <h3
                className="font-display font-bold text-base mb-4"
                style={{ color: cat.color }}
              >
                {cat.category}
              </h3>

              <div className="space-y-3">
                {cat.items.map((skill, si) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/80 text-sm font-body">{skill.name}</span>
                      <span className="text-white/40 text-xs">{skill.level}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: ci * 0.15 + si * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rubik's Cube as bonus skill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 glass-card text-center"
          style={{ border: '1px solid rgba(255,213,0,0.3)', background: 'rgba(255,213,0,0.05)' }}
        >
          <p className="text-4xl mb-2">🧩</p>
          <p className="font-display font-bold text-[#FFD500]">Rubik's Cube Solver</p>
          <p className="text-white/50 text-sm mt-1 font-body">3×3, 4×4 | Fastest solve: &lt;30s — and counting</p>
        </motion.div>
      </div>
    </PageTransition>
  )
}
