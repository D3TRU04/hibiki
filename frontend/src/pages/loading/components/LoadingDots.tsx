'use client';

import { motion } from 'framer-motion';

export default function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
} 