import { useState, useRef, useEffect } from 'react'
import { useFont } from '../context/FontContext'

export default function FontSelector() {
  const { fontId, fonts, toggleFont } = useFont()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const categories = [...new Set(fonts.map(f => f.category))]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors px-3 py-2"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        title="Change Font"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V4h16v3M9 20h6M12 4v16" />
        </svg>
        <span className="hidden lg:inline">Font</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl border z-[200] animate-scale-in" style={{ borderColor: 'var(--border)' }}>
          <div className="p-4 space-y-4">
            {categories.map(cat => (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--theme-primary)' }}>{cat}</p>
                <div className="space-y-1">
                  {fonts.filter(f => f.category === cat).map(f => (
                    <button
                      key={f.id}
                      onClick={() => { toggleFont(f.id); setOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 ${
                        fontId === f.id
                          ? 'font-semibold border-l-2'
                          : 'hover:bg-gray-50 border-l-2 border-transparent'
                      }`}
                      style={{
                        fontFamily: f.family,
                        color: fontId === f.id ? 'var(--theme-primary)' : 'var(--theme-text)',
                        borderLeftColor: fontId === f.id ? 'var(--theme-primary)' : 'transparent',
                        background: fontId === f.id ? 'var(--bg-secondary)' : 'transparent',
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
