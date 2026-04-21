import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'

const PROJECTS = [
  {
    title: 'Grandfather Stories',
    desc: 'A collection of stories told by my grandfather, brought to life with text-to-speech narration. Users click play and hear each story in the same voice, regardless of their browser.',
    tech: ['Vue.js', 'Python', 'Text-to-Speech API'],
    github: 'https://github.com/anshul-sharma-in/grandfather-stories',
    githubBackend: 'https://github.com/anshul-sharma-in/speaker-backend',
    live: 'https://stories.anshulsharma.net/',
    color: '#FF5800',
  },
  {
    title: 'Portfolio Website',
    desc: "This very website! Built with React, Three.js, Framer Motion, and hosted on AWS Amplify with a Rubik's cube themed navigation grid.",
    tech: ['React', 'Three.js', 'Tailwind CSS', 'AWS Amplify'],
    github: 'https://github.com/anshul-sharma-in/anshul-portfolio',
    live: null,
    color: '#0045AD',
  },
  {
    title: 'Interview Platform',
    desc: 'A mock interview scheduling and Q&A management platform with admin dashboard, email notifications via SES, and a categorized Q&A library.',
    tech: ['React', 'Node.js', 'AWS Lambda', 'DynamoDB', 'SES'],
    github: 'https://github.com/anshul-sharma-in/interview-platform',
    live: null,
    color: '#009E60',
  },
]

export default function Projects() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="section-title">Projects</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card hover:border-gray-300 dark:hover:border-white/30 transition-all duration-300 group"
              style={{ borderTop: `3px solid ${p.color}` }}
            >
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#FF5800] transition-colors">
                {p.title}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-white/60 text-sm leading-relaxed font-body">{p.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs rounded font-body text-gray-600 dark:text-white/70"
                    style={{ background: `${p.color}22`, border: `1px solid ${p.color}55` }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs px-4 py-2">
                    GitHub
                  </a>
                )}
                {p.githubBackend && (
                  <a href={p.githubBackend} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs px-4 py-2">
                    GitHub (Backend)
                  </a>
                )}
                {p.live && (
                  <a href={p.live} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-4 py-2">
                    Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
