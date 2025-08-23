import React from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface ConnectionErrorFallbackProps {
  onRetry: () => void;
  error?: string;
  isRetrying?: boolean;
}

export const ConnectionErrorFallback: React.FC<ConnectionErrorFallbackProps> = ({
  onRetry,
  error,
  isRetrying = false
}) => {
  const isRateLimit = error?.includes('429') || error?.includes('Rate limit');
  const isConnectionError = error?.includes('fetch') || error?.includes('Failed');

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <div className="text-center max-w-md">
        {isRateLimit ? (
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        ) : (
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        )}
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {isRateLimit ? 'Muchas solicitudes' : 'Error de conexión'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {isRateLimit 
            ? 'Por favor espera unos momentos antes de intentar de nuevo. El servidor está limitando las solicitudes.'
            : isConnectionError 
              ? 'No se puede conectar con el servidor. Verifica tu conexión a internet.'
              : 'Ha ocurrido un error inesperado. Intenta recargar la página.'
          }
        </p>

        {error && (
          <details className="text-sm text-gray-500 mb-4">
            <summary className="cursor-pointer hover:text-gray-700">
              Ver detalles del error
            </summary>
            <p className="mt-2 p-3 bg-gray-100 rounded-md font-mono text-xs">
              {error}
            </p>
          </details>
        )}

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${isRetrying 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Reintentando...' : 'Reintentar'}
        </button>

        {isRateLimit && (
          <p className="text-xs text-yellow-600 mt-3">
            ⏳ Esperando {Math.ceil(Math.random() * 30)} segundos antes del próximo intento
          </p>
        )}
      </div>
    </div>
  );
};
