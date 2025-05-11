"use client"

import { motion } from "framer-motion";

export const ChefAnimation = ({ isThinking = false, isCooking = false }) => {
  return (
    <div className="relative w-32 h-32">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: isThinking ? [0, -5, 5, -5, 0] : 0
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          {/* Тело шефа */}
          <motion.circle
            cx="50"
            cy="60"
            r="30"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Шапка */}
          <motion.path
            d="M25 45 Q50 15 75 45"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2"
          />
          
          {/* Лицо */}
          <motion.g>
            {/* Глаза */}
            <circle cx="40" cy="50" r="3" fill="#000000" />
            <circle cx="60" cy="50" r="3" fill="#000000" />
            
            {/* Улыбка */}
            <motion.path
              d="M40 65 Q50 75 60 65"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              animate={{
                d: isThinking 
                  ? "M40 65 Q50 65 60 65"
                  : "M40 65 Q50 75 60 65"
              }}
            />
          </motion.g>

          {/* Усы */}
          <motion.path
            d="M35 60 Q50 65 65 60"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />

          {/* Анимация мыслей при размышлении */}
          {isThinking && (
            <motion.g>
              <motion.circle
                cx="80"
                cy="30"
                r="5"
                fill="#E5E5E5"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0
                }}
              />
              <motion.circle
                cx="90"
                cy="20"
                r="4"
                fill="#E5E5E5"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
            </motion.g>
          )}

          {/* Анимация готовки */}
          {isCooking && (
            <motion.g>
              <motion.path
                d="M85 60 Q90 50 95 60"
                stroke="#FFD700"
                strokeWidth="2"
                fill="none"
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
              />
              <motion.path
                d="M80 70 Q85 60 90 70"
                stroke="#FFD700"
                strokeWidth="2"
                fill="none"
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: 0.3
                }}
              />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}; 