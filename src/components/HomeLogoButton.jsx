import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// Mini Rubik's cube SVG as 2x2 colored grid
const COLORS = ['#FF5800', '#0045AD', '#FFD500', '#009E60']

export default function HomeLogoButton() {
  const navigate = useNavigate()

  return (
    <motion.button
      onClick={() => navigate('/')}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
      whileHover={{ scale: 1.15, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      title="Back to Home"
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-lg shadow-2xl grid grid-cols-2 gap-0.5 p-1.5 bg-[#1a1a1a] border border-white/20"
      style={{ boxShadow: '0 0 20px rgba(255,88,0,0.4)' }}
    >
      {COLORS.map((color, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </motion.button>
  )
}
