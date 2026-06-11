import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeSelector() {
  const { themeId, themes, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors px-3 py-2"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        title="Change Theme"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="hidden lg:inline">Theme</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl border z-[200] animate-scale-in" style={{ borderColor: 'var(--border)' }}>
          <div className="p-3 space-y-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => { toggleTheme(t.id); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 ${
                  themeId === t.id ? 'font-semibold border-l-2' : 'hover:bg-gray-50 border-l-2 border-transparent'
                }`}
                style={{
                  borderLeftColor: themeId === t.id ? t.primary : 'transparent',
                  background: themeId === t.id ? 'var(--bg-secondary)' : 'transparent',
                  color: 'var(--theme-text)',
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex-shrink-0 border border-gray-200"
                  style={{ background: `linear-gradient(135deg, ${t.bg}, ${t.primary})` }}
                />
                <span>{t.name}</span>
                {themeId === t.id && (
                  <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--theme-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
