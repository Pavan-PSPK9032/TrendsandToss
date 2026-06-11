import { createContext, useState, useEffect, useContext, useCallback } from 'react'

const FONTS = [
  // Luxury / Jewelry
  { id: 'font-poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'Luxury / Jewelry' },
  { id: 'font-montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Luxury / Jewelry' },
  { id: 'font-playfair', name: 'Playfair Display', family: "'Playfair Display', Georgia, serif", category: 'Luxury / Jewelry' },
  { id: 'font-cinzel', name: 'Cinzel', family: "'Cinzel', serif", category: 'Luxury / Jewelry' },
  { id: 'font-cormorant', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'Luxury / Jewelry' },
  // Modern eCommerce
  { id: 'font-inter', name: 'Inter', family: "'Inter', sans-serif", category: 'Modern eCommerce' },
  { id: 'font-manrope', name: 'Manrope', family: "'Manrope', sans-serif", category: 'Modern eCommerce' },
  { id: 'font-dmsans', name: 'DM Sans', family: "'DM Sans', sans-serif", category: 'Modern eCommerce' },
  { id: 'font-outfit', name: 'Outfit', family: "'Outfit', sans-serif", category: 'Modern eCommerce' },
]

const FontContext = createContext()

export function FontProvider({ children }) {
  const [fontId, setFontId] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tt_font') || 'font-inter'
    return 'font-inter'
  })

  const font = FONTS.find(f => f.id === fontId) || FONTS[0]

  useEffect(() => {
    localStorage.setItem('tt_font', fontId)
    document.documentElement.style.setProperty('--font-body', font.family)
    document.documentElement.style.setProperty('--font-heading', font.family)
    document.body.style.fontFamily = font.family
  }, [fontId, font])

  const toggleFont = useCallback((id) => {
    setFontId(id)
  }, [])

  return (
    <FontContext.Provider value={{ fontId, font, fonts: FONTS, toggleFont }}>
      {children}
    </FontContext.Provider>
  )
}

export const useFont = () => useContext(FontContext)
export { FONTS }
