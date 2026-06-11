/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme 1: Luxury Gold
        ivory: '#FFF8F0',
        gold: { DEFAULT: '#D4AF37', light: '#e0c55a', dark: '#b8952e' },
        'dark-text': '#111111',
        // Theme 2: Rose Gold
        beige: '#F5F0E6',
        rosegold: { DEFAULT: '#B76E79', light: '#cc8a94', dark: '#9e5a64' },
        'dark-brown': '#3E2723',
        // Theme 3: Navy Gold
        navy: { DEFAULT: '#1A237E', light: '#283593', dark: '#0D1642' },
        // Theme 4: Purple
        lavender: '#F3E8FF',
        purple: { DEFAULT: '#6A1B9A', light: '#8E24AA', dark: '#4A136B' },
        // Keep backward compat
        'gold-old': { DEFAULT: '#C9A84C', light: '#dbbf6e', dark: '#a8852e' },
        'navy-old': { DEFAULT: '#001F5B', light: '#002d80', dark: '#001440' },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        jakarta: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        inter: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        shimmer: 'shimmer 2s infinite linear',
        'spin-slow': 'spin 3s linear infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown: { '0%': { opacity: '0', transform: 'translateY(-20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}
