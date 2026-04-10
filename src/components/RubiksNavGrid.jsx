import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const BLOCKS = [
  {
    label: 'About Me',
    emoji: '👤',
    color: '#FF5800',
    textColor: '#fff',
    to: '/about',
    desc: 'Who I am',
  },
  {
    label: 'Projects',
    emoji: '🚀',
    color: '#0045AD',
    textColor: '#fff',
    to: '/projects',
    desc: 'What I built',
  },
  {
    label: 'Resume',
    emoji: '📄',
    color: '#C41E3A',
    textColor: '#fff',
    to: '/resume',
    desc: 'download CV',
  },
  {
    label: 'GitHub',
    emoji: '💻',
    color: '#1a1a1a',
    textColor: '#fff',
    to: 'https://github.com/anshulsharma',
    external: true,
    desc: 'my code',
  },
  {
    label: 'LinkedIn',
    emoji: '🔗',
    color: '#0A66C2',
    textColor: '#fff',
    to: 'https://linkedin.com/in/anshulsharma',
    external: true,
    desc: 'connect',
  },
  {
    label: 'Skills',
    emoji: '⚡',
    color: '#009E60',
    textColor: '#fff',
    to: '/skills',
    desc: 'tech stack',
  },
  {
    label: 'Contact',
    emoji: '✉️',
    color: '#FFD500',
    textColor: '#111',
    to: '/contact',
    desc: 'get in touch',
  },
  {
    label: 'Blog',
    emoji: '📝',
    color: '#e0e0e0',
    textColor: '#111',
    to: '/blog',
    desc: 'my articles',
  },
  {
    label: 'Interview',
    emoji: '🎯',
    color: 'linear-gradient(135deg, #FF5800, #FFD500, #009E60, #0045AD)',
    textColor: '#fff',
    to: '/interview',
    desc: 'with Anshul',
    isGradient: true,
    highlight: true,
  },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
}

const item = {
  hidden: { opacity: 0, scale: 0.6, rotate: -10 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } },
}

export default function RubiksNavGrid() {
  const navigate = useNavigate()

  const handleClick = (block) => {
    if (block.external) {
      window.open(block.to, '_blank', 'noopener,noreferrer')
    } else {
      navigate(block.to)
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-3 w-full max-w-lg mx-auto"
    >
      {BLOCKS.map((block) => (
        <motion.div
          key={block.label}
          variants={item}
          whileHover={{ scale: 1.06, y: -6 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handleClick(block)}
          className="rubik-block aspect-square select-none"
          style={{
            background: block.isGradient ? block.color : block.color,
            color: block.textColor,
            boxShadow: block.highlight
              ? '0 0 30px rgba(255,88,0,0.5), 0 0 60px rgba(0,158,96,0.3)'
              : undefined,
          }}
        >
          <span className="text-2xl">{block.emoji}</span>
          <span
            className="font-bold text-sm text-center leading-tight"
            style={{ fontFamily: block.highlight ? 'Playfair Display, serif' : 'Orbitron, sans-serif', fontSize: block.highlight ? '13px' : '11px' }}
          >
            {block.label}
          </span>
          <span className="text-xs opacity-75 font-light">{block.desc}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}
