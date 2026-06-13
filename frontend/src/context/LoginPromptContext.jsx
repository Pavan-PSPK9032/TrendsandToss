import { createContext, useState, useContext, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const LoginPromptContext = createContext()

export function LoginPromptProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const showLoginPrompt = useCallback((msg) => {
    setMessage(msg || 'Please login to continue')
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  return (
    <LoginPromptContext.Provider value={{ showLoginPrompt, close }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={close}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-6 pb-8"
              style={{ background: 'var(--card-bg)' }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />

              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" style={{ background: 'var(--bg-secondary)' }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-semibold mb-1" style={{ color: 'var(--theme-text)' }}>Login Required</h3>
                <p className="text-sm" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>{message}</p>
              </div>

              <div className="space-y-3">
                <Link to="/login" onClick={close}
                  className="block w-full py-3.5 text-center font-semibold text-sm uppercase tracking-widest transition"
                  style={{ background: 'var(--theme-primary)', color: '#fff' }}
                >
                  Login
                </Link>
                <Link to="/register" onClick={close}
                  className="block w-full py-3.5 text-center font-semibold text-sm uppercase tracking-widest border transition"
                  style={{ borderColor: 'var(--border)', color: 'var(--theme-text)' }}
                >
                  Create Account
                </Link>
                <button onClick={close}
                  className="block w-full py-2 text-center text-xs font-medium uppercase tracking-wider transition"
                  style={{ color: 'var(--theme-text)', opacity: 0.4 }}
                >
                  Continue as Guest
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LoginPromptContext.Provider>
  )
}

export const useLoginPrompt = () => useContext(LoginPromptContext)
