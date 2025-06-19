import React from 'react';
import { motion } from 'framer-motion';

interface PressIndicatorProps {
  isActive: boolean;
  coordinates: { x: number; y: number } | null;
  progress: number; // 0 to 1
}

const STROKE_WIDTH = 4;
const RADIUS = 35;
const CIRCUMFERENCE = 2 * Math.PI * (RADIUS - STROKE_WIDTH / 2);

export const PressIndicator: React.FC<PressIndicatorProps> = ({ isActive, coordinates, progress }) => {
  if (!isActive || !coordinates) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: coordinates.x,
        top: coordinates.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="relative"
      >
        {/* Círculo de fondo con pulso */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/20 backdrop-blur-sm"
          style={{ width: RADIUS * 2, height: RADIUS * 2 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* SVG del indicador de progreso */}
        <svg
          width={RADIUS * 2}
          height={RADIUS * 2}
          viewBox={`0 0 ${RADIUS * 2} ${RADIUS * 2}`}
          className="relative z-10"
        >
          {/* Círculo de fondo */}
          <circle
            cx={RADIUS}
            cy={RADIUS}
            r={RADIUS - STROKE_WIDTH / 2}
            fill="rgba(255, 255, 255, 0.9)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth={1}
          />

          {/* Círculo de progreso */}
          <motion.circle
            cx={RADIUS}
            cy={RADIUS}
            r={RADIUS - STROKE_WIDTH / 2}
            fill="transparent"
            stroke="url(#progressGradient)"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            strokeLinecap="round"
            transform={`rotate(-90 ${RADIUS} ${RADIUS})`}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
            }}
          />

          {/* Gradiente para el progreso */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Icono central */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: progress > 0.1 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};
