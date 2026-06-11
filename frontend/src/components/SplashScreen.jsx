import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 200);
          return 100;
        }
        return prev + 3;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="relative w-28 h-28 mx-auto mb-6">
            <img
              src="/logo.png"
              alt="Trends&Toss"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-full h-full items-center justify-center" style={{ background: 'var(--theme-primary)' }}>
              <span className="text-3xl font-bold text-white">T&T</span>
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-4xl font-heading font-semibold mb-3"
          style={{ color: 'var(--theme-text)' }}
        >
          Trends&Toss
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-base md:text-lg tracking-wide mb-10"
          style={{ color: 'var(--theme-primary)' }}
        >
          Premium Jewellery
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-56 mx-auto"
        >
          <div className="h-1 overflow-hidden" style={{ background: 'var(--skeleton)' }}>
            <motion.div
              className="h-full"
              style={{ background: 'var(--theme-primary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-xs mt-3 tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
            Crafting your experience...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
