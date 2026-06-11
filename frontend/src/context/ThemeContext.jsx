import { createContext, useState, useEffect, useContext, useCallback } from 'react'

const THEMES = [
  { id: 'ivory-gold', name: 'Ivory & Gold', primary: '#D4AF37', bg: '#FFF8F0', text: '#111111', accent: '#D4AF37' },
  { id: 'beige-rose', name: 'Beige & Rose Gold', primary: '#B76E79', bg: '#F5F0E6', text: '#3E2723', accent: '#B76E79' },
  { id: 'white-navy', name: 'White & Navy', primary: '#1A237E', bg: '#FFFFFF', text: '#1A237E', accent: '#FFD700' },
  { id: 'lavender-purple', name: 'Lavender & Purple', primary: '#6A1B9A', bg: '#F3E8FF', text: '#6A1B9A', accent: '#FFFFFF' },
]

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tt_theme') || 'ivory-gold'
    return 'ivory-gold'
  })

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]

  useEffect(() => {
    localStorage.setItem('tt_theme', themeId)
    const root = document.documentElement
    root.setAttribute('data-theme', themeId)
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-bg', theme.bg)
    root.style.setProperty('--theme-text', theme.text)
    root.style.setProperty('--theme-accent', theme.accent)
  }, [themeId, theme])

  const toggleTheme = useCallback((id) => {
    setThemeId(id)
  }, [])

  return (
    <ThemeContext.Provider value={{ themeId, theme, themes: THEMES, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export { THEMES }
