import React from 'react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  tooltip?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  onClick,
  className = '',
  size = 'md',
  color = '#3b82f6',
  tooltip
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  return (
    <div className="relative group">
      <motion.button
        onClick={onClick}
        className={`${sizeClasses[size]} ${className} rounded-2xl text-white shadow-xl flex items-center justify-center relative overflow-hidden`}
        style={{ 
          background: `linear-gradient(135deg, ${color}, ${color}CC)`
        }}
        whileHover={{ 
          scale: 1.05,
          y: -2,
          boxShadow: `0 8px 25px -5px ${color}60`
        }}
        whileTap={{ 
          scale: 0.95,
          y: 0
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ background: color }}
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{
            scale: [0, 1.5],
            opacity: [0.3, 0]
          }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Icon className={iconSizes[size]} />
        </motion.div>

        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>

      {/* Tooltip */}
      {tooltip && (
        <motion.div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'hover' | 'tap' | 'focus' | 'all';
  scale?: number;
  duration?: number;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type = 'all',
  scale = 1.02,
  duration = 0.2
}) => {
  const getMotionProps = () => {
    const baseProps = {
      transition: { duration }
    };

    switch (type) {
      case 'hover':
        return {
          ...baseProps,
          whileHover: { scale }
        };
      case 'tap':
        return {
          ...baseProps,
          whileTap: { scale: scale * 0.95 }
        };
      case 'focus':
        return {
          ...baseProps,
          whileFocus: { scale }
        };
      case 'all':
      default:
        return {
          ...baseProps,
          whileHover: { scale },
          whileTap: { scale: scale * 0.95 },
          whileFocus: { scale }
        };
    }
  };

  return (
    <motion.div {...getMotionProps()}>
      {children}
    </motion.div>
  );
};

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export const ParallaxCard: React.FC<ParallaxCardProps> = ({
  children,
  className = '',
  depth = 15
}) => {
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotX = ((e.clientY - centerY) / rect.height) * depth;
    const rotY = ((e.clientX - centerX) / rect.width) * depth;
    
    setRotateX(-rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={`transform-gpu ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {children}
    </motion.div>
  );
};

interface PulseIndicatorProps {
  isActive: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  isActive,
  color = '#10b981',
  size = 'md',
  position = 'top-right'
}) => {
  if (!isActive) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  return (
    <div className={`absolute ${positionClasses[position]} ${sizeClasses[size]}`}>
      <motion.div
        className="rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={`absolute inset-0 rounded-full border-2`}
        style={{ borderColor: color }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}) => {
  const variants = {
    primary: {
      bg: 'from-blue-500 to-purple-600',
      glow: '#3b82f6',
      hover: 'from-blue-600 to-purple-700'
    },
    success: {
      bg: 'from-green-500 to-emerald-600',
      glow: '#10b981',
      hover: 'from-green-600 to-emerald-700'
    },
    warning: {
      bg: 'from-yellow-500 to-orange-600',
      glow: '#f59e0b',
      hover: 'from-yellow-600 to-orange-700'
    },
    error: {
      bg: 'from-red-500 to-pink-600',
      glow: '#ef4444',
      hover: 'from-red-600 to-pink-700'
    }
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const currentVariant = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-medium rounded-xl text-white shadow-lg
        bg-gradient-to-r ${disabled ? 'from-gray-400 to-gray-500' : currentVariant.bg}
        ${sizes[size]} ${className}
        disabled:cursor-not-allowed disabled:opacity-60
        transition-all duration-300 overflow-hidden
      `}
      whileHover={!disabled ? {
        scale: 1.02,
        y: -1,
        boxShadow: `0 10px 25px -5px ${currentVariant.glow}40`
      } : {}}
      whileTap={!disabled ? {
        scale: 0.98,
        y: 0
      } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
        animate={!disabled ? {
          x: ['0%', '200%']
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>

      {/* Glow effect on hover */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0"
          style={{
            background: `radial-gradient(circle, ${currentVariant.glow}20 0%, transparent 70%)`
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
};
