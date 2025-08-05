'use client';

import { motion } from 'framer-motion';

export default function AnimatedIcon() {
  return (
    <div className="relative">
      {/* Main Lightbulb */}
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className="mx-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Lightbulb Base */}
        <motion.path
          d="M40 10 C25 10 15 20 15 35 C15 45 20 52 25 58 L25 65 L55 65 L55 58 C60 52 65 45 65 35 C65 20 55 10 40 10 Z"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Lightbulb Fill */}
        <motion.path
          d="M40 10 C25 10 15 20 15 35 C15 45 20 52 25 58 L25 65 L55 65 L55 58 C60 52 65 45 65 35 C65 20 55 10 40 10 Z"
          fill="url(#goldGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        {/* Filament */}
        <motion.path
          d="M35 25 Q40 20 45 25 Q40 30 35 25"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
        />
        
        {/* Base Screw */}
        <motion.rect
          x="35"
          y="65"
          width="10"
          height="8"
          fill="#F59E0B"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </motion.svg>
      
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full blur-xl opacity-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 0.5, 0.3]
        }}
        transition={{ 
          duration: 2,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
} 