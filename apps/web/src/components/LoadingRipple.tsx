import React from 'react';

interface LoadingRippleProps {
  isActive: boolean;
  coordinates: { x: number; y: number };
  onComplete: () => void;
}

export const LoadingRipple: React.FC<LoadingRippleProps> = ({
  isActive,
  coordinates,
  onComplete
}) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: coordinates.x - 50,
        top: coordinates.y - 50,
      }}
    >
      {/* Ripple Effect */}
      <div className="relative">
        <div 
          className="absolute w-24 h-24 border-4 border-blue-500 rounded-full animate-ping"
          style={{
            animationDuration: '2s',
            opacity: Math.max(0.1, 1 - progress / 100)
          }}
        />
        <div 
          className="absolute w-16 h-16 border-2 border-blue-400 rounded-full animate-ping"
          style={{
            animationDuration: '1.5s',
            animationDelay: '0.2s',
            left: '16px',
            top: '16px',
            opacity: Math.max(0.2, 1 - progress / 100)
          }}
        />
        <div 
          className="absolute w-8 h-8 bg-blue-600 rounded-full"
          style={{
            left: '32px',
            top: '32px',
            transform: `scale(${1 + progress / 100})`,
            opacity: Math.max(0.3, 1 - progress / 100)
          }}
        />
      </div>
      
      {/* Progress Circle */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-white rounded-full p-2 shadow-lg">
          <div className="w-8 h-8 relative">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="#e5e7eb"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                strokeDasharray={87.96}
                strokeDashoffset={87.96 - (87.96 * progress) / 100}
                className="transition-all duration-100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
