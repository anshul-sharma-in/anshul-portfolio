import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFunMode } from '../context/FunModeContext'
import { MiniRubiksCube } from './RubiksCube3D'
import BrandLogo from './BrandLogo'

const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Experience' },
  { to: '/contact', label: 'Contact' },
  { to: '/interview', label: 'Interview' },
]

export default function Navbar() {
  const { toggleFunMode } = useFunMode()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 group"
          title="Anshul Sharma — Home"
        >
          <BrandLogo size={28} />
          <span className="font-display font-bold text-lg text-gray-900 tracking-wide group-hover:text-[#FF5800] transition-colors">
            Anshul Sharma
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors ${
                  isActive
                    ? 'text-[#FF5800] bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFunMode}
            title="Switch to Cube Mode"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MiniRubiksCube size={34} />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-gray-700 transition-transform duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}
            />
            <span
              className={`block w-5 h-0.5 bg-gray-700 transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block w-5 h-0.5 bg-gray-700 transition-transform duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg py-2 px-4"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-md text-sm font-body font-medium transition-colors ${
                    isActive
                      ? 'text-[#FF5800] bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => { toggleFunMode(); setMobileOpen(false) }}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-body font-medium text-gray-500 hover:text-[#FF5800] transition-colors"
              >
                🧩 Switch to Cube Mode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
