import React from 'react';
import { motion } from 'framer-motion';

interface SonarWaveProps {
  isActive: boolean;
  coordinates: { x: number; y: number } | null;
}

export const SonarWave: React.FC<SonarWaveProps> = ({ isActive, coordinates }) => {
  if (!isActive || !coordinates) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${coordinates.x}px`,
        top: `${coordinates.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Container para asegurar centrado exacto */}
      <div className="relative w-0 h-0">
        
        {/* Pulso de impacto inicial - MUY LLAMATIVO */}
        <motion.div
          className="absolute rounded-full shadow-2xl"
          style={{
            width: '24px',
            height: '24px',
            left: '-12px',
            top: '-12px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.7) 50%, rgba(29, 78, 216, 0.4) 100%)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)',
          }}
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1.8, 0.8, 0], 
            opacity: [0, 1, 0.6, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.175, 0.885, 0.32, 1.275]
          }}
        />

        {/* Primera onda sonar - Principal y más vibrante */}
        <motion.div
          className="absolute border-[3px] rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '-5px',
            top: '-5px',
            borderColor: '#3b82f6',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 3, 6, 10],
            opacity: [1, 0.9, 0.6, 0.3, 0],
            borderWidth: [3, 3, 2, 1, 0.5],
          }}
          transition={{
            duration: 2.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            repeat: Infinity,
            times: [0, 0.1, 0.3, 0.6, 1],
          }}
        />
        
        {/* Segunda onda sonar - Retrasada para efecto cascada */}
        <motion.div
          className="absolute border-[2px] rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '-5px',
            top: '-5px',
            borderColor: '#60a5fa',
            boxShadow: '0 0 15px rgba(96, 165, 250, 0.5)',
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{
            scale: [0, 1, 3, 6, 10],
            opacity: [0.8, 0.7, 0.5, 0.2, 0],
            borderWidth: [2, 2, 1.5, 1, 0.5],
          }}
          transition={{
            duration: 2.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            repeat: Infinity,
            delay: 0.4,
            times: [0, 0.1, 0.3, 0.6, 1],
          }}
        />
        
        {/* Tercera onda sonar */}
        <motion.div
          className="absolute border-[2px] rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '-5px',
            top: '-5px',
            borderColor: '#93c5fd',
            boxShadow: '0 0 10px rgba(147, 197, 253, 0.4)',
          }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{
            scale: [0, 1, 3, 6, 10],
            opacity: [0.6, 0.5, 0.3, 0.1, 0],
            borderWidth: [2, 2, 1.5, 1, 0.5],
          }}
          transition={{
            duration: 2.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            repeat: Infinity,
            delay: 0.8,
            times: [0, 0.1, 0.3, 0.6, 1],
          }}
        />

        {/* Cuarta onda sonar - Para más densidad */}
        <motion.div
          className="absolute border-[1px] rounded-full"
          style={{
            width: '10px',
            height: '10px',
            left: '-5px',
            top: '-5px',
            borderColor: '#bfdbfe',
            boxShadow: '0 0 8px rgba(191, 219, 254, 0.3)',
          }}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{
            scale: [0, 1, 3, 6, 10],
            opacity: [0.4, 0.3, 0.2, 0.1, 0],
          }}
          transition={{
            duration: 2.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            repeat: Infinity,
            delay: 1.2,
            times: [0, 0.1, 0.3, 0.6, 1],
          }}
        />

        {/* Punto central exacto - MÁS PROMINENTE */}
        <motion.div
          className="absolute rounded-full shadow-lg"
          style={{
            width: '4px',
            height: '4px',
            left: '-2px',
            top: '-2px',
            background: 'radial-gradient(circle, #1e40af 0%, #3b82f6 100%)',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 2, 1.5, 1], 
            opacity: [0, 1, 1, 1],
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.68, -0.55, 0.265, 1.55],
            times: [0, 0.3, 0.7, 1],
          }}
        />
        
        {/* Círculo de confirmación con glow */}
        <motion.div
          className="absolute border-2 rounded-full"
          style={{
            width: '16px',
            height: '16px',
            left: '-8px',
            top: '-8px',
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 10px rgba(59, 130, 246, 0.1)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.3, 1], 
            opacity: [0, 0.8, 0.4],
          }}
          transition={{ 
            duration: 0.6, 
            ease: [0.68, -0.55, 0.265, 1.55],
            delay: 0.1
          }}
        />

        {/* Anillo de energía pulsante */}
        <motion.div
          className="absolute border rounded-full"
          style={{
            width: '28px',
            height: '28px',
            left: '-14px',
            top: '-14px',
            borderColor: '#60a5fa',
            borderWidth: '1px',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 1.1, 1], 
            opacity: [0, 0.6, 0.3, 0.2],
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Partículas de energía */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: '-0.5px',
              top: '-0.5px',
            }}
            initial={{ 
              scale: 0, 
              opacity: 0,
              x: 0,
              y: 0,
            }}
            animate={{ 
              scale: [0, 1, 0.5, 0], 
              opacity: [0, 1, 0.5, 0],
              x: Math.cos((i * 60) * Math.PI / 180) * 20,
              y: Math.sin((i * 60) * Math.PI / 180) * 20,
            }}
            transition={{ 
              duration: 1.5, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.3 + (i * 0.1),
            }}
          />
        ))}
      </div>
    </div>
  );
};
