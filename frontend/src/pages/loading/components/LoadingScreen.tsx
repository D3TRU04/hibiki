'use client';

import { motion } from 'framer-motion';
import AnimatedIcon from './AnimatedIcon';
import LoadingDots from './LoadingDots';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <AnimatedIcon />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Amplifying Voices.
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Uncovering Truth.
            </span>
            <br />
            <span className="text-gray-600">One Pin at a Time.</span>
          </h1>
        </motion.div>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <LoadingDots />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="text-sm text-gray-500 mt-6"
        >
          Preparing your world...
        </motion.p>
      </div>
    </div>
  );
} 