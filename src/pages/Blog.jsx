import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'

const ARTICLES = [
  {
    title: 'How Rubik\'s Cube Thinking Improves Your Debugging Skills',
    date: 'March 2026',
    tag: 'Dev Mindset',
    tagColor: '#FF5800',
    excerpt:
      'Breaking a complex bug down layer by layer — just like solving a cube face by face. Here\'s how I apply cube-solving strategies to real code problems.',
    readTime: '5 min read',
  },
  {
    title: 'Java Spring Boot + AWS Lambda: A Practical Guide',
    date: 'February 2026',
    tag: 'Backend',
    tagColor: '#0045AD',
    excerpt:
      'Running Spring Boot on AWS Lambda with SnapStart for cold-start optimization. Real numbers, real tradeoffs, and production lessons learned.',
    readTime: '8 min read',
  },
  {
    title: 'DynamoDB Modeling for Interview Scheduling Apps',
    date: 'January 2026',
    tag: 'AWS / Database',
    tagColor: '#009E60',
    excerpt:
      'Single-table design patterns for a real interview platform — access patterns, GSIs, and when NOT to use DynamoDB.',
    readTime: '6 min read',
  },
  {
    title: 'React Three Fiber: Build a Rubik\'s Cube in 30 Minutes',
    date: 'December 2025',
    tag: 'Frontend / 3D',
    tagColor: '#FFD500',
    excerpt:
      'A step-by-step guide to rendering an interactive 3D Rubik\'s cube using React Three Fiber — from geometry to rotation logic.',
    readTime: '7 min read',
  },
]

export default function Blog() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="section-title">Blog & Articles</h2>

        <div className="space-y-5">
          {ARTICLES.map((a, i) => (
            <motion.article
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card hover:border-white/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span
                  className="px-2 py-0.5 text-xs rounded font-body font-semibold"
                  style={{ background: `${a.tagColor}22`, color: a.tagColor, border: `1px solid ${a.tagColor}55` }}
                >
                  {a.tag}
                </span>
                <span className="text-white/30 text-xs">{a.date}</span>
                <span className="text-white/30 text-xs">{a.readTime}</span>
              </div>

              <h3 className="font-display font-bold text-base text-white group-hover:text-[#FF5800] transition-colors">
                {a.title}
              </h3>
              <p className="mt-2 text-white/55 text-sm leading-relaxed font-body">{a.excerpt}</p>

              <div className="mt-3 text-[#FF5800] text-xs font-semibold group-hover:translate-x-1 transition-transform inline-block">
                Read more →
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-white/30 text-sm font-body"
        >
          Update article content in <code className="text-white/50">src/pages/Blog.jsx</code>
        </motion.div>
      </div>
    </PageTransition>
  )
}
