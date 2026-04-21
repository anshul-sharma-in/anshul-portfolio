import { createContext, useContext, useState, useEffect } from 'react'

const FunModeContext = createContext(null)

export function FunModeProvider({ children }) {
  // Always start in professional mode on page load/refresh
  const [isFunMode, setIsFunMode] = useState(false)

  // Sync dark class whenever isFunMode changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isFunMode)
  }, [isFunMode])

  function toggleFunMode() {
    setIsFunMode((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return (
    <FunModeContext.Provider value={{ isFunMode, toggleFunMode }}>
      {children}
    </FunModeContext.Provider>
  )
}

export function useFunMode() {
  return useContext(FunModeContext)
}
