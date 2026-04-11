import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300); // Small delay after 100%
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50"
    >
      <div className="text-center px-6">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="mb-8"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Logo Image */}
            <img
              src="/logo.png"
              alt="Trends&Toss Logo"
              className="w-full h-full object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback if logo not found
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback Logo (if image fails) */}
            <div
              className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl"
            >
              <span className="text-4xl font-bold text-white">T&T</span>
            </div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          Welcome to Trends&Toss
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-600 font-medium tracking-wide mb-12"
        >
          Style • Elegance • Trends
        </motion.p>

        {/* Loading Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-64 mx-auto"
        >
          {/* Progress Bar Background */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Progress Bar Fill */}
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Loading Text */}
          <p className="text-sm text-gray-500 mt-3 font-medium">
            Loading your style experience...
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 1.5 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-400 rounded-full blur-3xl"></div>
        </motion.div>
      </div>
    </motion.div>
  );
}
