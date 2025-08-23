import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastManagerProps {
  toasts: ToastNotification[];
  onRemoveToast: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      message: 'text-green-600',
      button: 'text-green-700 hover:text-green-800'
    }
  },
  error: {
    icon: XCircle,
    colors: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-600',
      button: 'text-red-700 hover:text-red-800'
    }
  },
  warning: {
    icon: AlertCircle,
    colors: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-600',
      button: 'text-yellow-700 hover:text-yellow-800'
    }
  },
  info: {
    icon: Info,
    colors: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      message: 'text-blue-600',
      button: 'text-blue-700 hover:text-blue-800'
    }
  }
};

const ToastItem: React.FC<{ 
  toast: ToastNotification; 
  onRemove: (id: string) => void;
  index: number;
}> = ({ toast, onRemove, index }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 5000;

  useEffect(() => {
    if (isExiting) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          setIsExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [toast.id, duration, onRemove, isExiting]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    handleClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        y: index * -10 // Stagger effect
      }}
      exit={{ 
        opacity: 0, 
        x: 300, 
        scale: 0.9,
        transition: { duration: 0.2 }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      className={`relative w-96 max-w-sm mx-4 rounded-2xl border-2 shadow-lg backdrop-blur-sm ${config.colors.bg} ${config.colors.border} overflow-hidden`}
      style={{ zIndex: 1000 - index }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 h-1 bg-gray-200">
        <motion.div 
          className="h-full bg-gradient-to-r from-gray-400 to-gray-600"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            className={`flex-shrink-0 ${config.colors.icon}`}
          >
            <Icon className="w-5 h-5" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${config.colors.title}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`text-sm mt-1 ${config.colors.message}`}>
                {toast.message}
              </p>
            )}
            
            {/* Action button */}
            {toast.action && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleAction}
                className={`mt-2 text-sm font-medium underline ${config.colors.button} transition-colors`}
              >
                {toast.action.label}
              </motion.button>
            )}
          </div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-lg ${config.colors.button} hover:bg-gray-200/50 transition-colors`}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Pulse effect for urgent notifications */}
      {toast.type === 'error' && (
        <motion.div
          className="absolute inset-0 border-2 border-red-400 rounded-2xl"
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9998] space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemoveToast}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook para usar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Shortcuts for common toast types
  const showSuccess = (title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'success', title, message, action });
  };

  const showError = (title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'error', title, message, action, duration: 7000 });
  };

  const showWarning = (title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'warning', title, message, action });
  };

  const showInfo = (title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'info', title, message, action });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastManager: () => <ToastManager toasts={toasts} onRemoveToast={removeToast} />
  };
};
