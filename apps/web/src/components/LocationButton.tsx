import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@ciudad-activa/maps/components/ui/button';

interface LocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  onLocationFound,
  className = '',
  size = 'default',
  variant = 'default'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    // Verificar si la geolocalización está disponible
    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en este navegador');
      setIsLoading(false);
      return;
    }

    // Opciones para la geolocalización
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 segundos de timeout
      maximumAge: 60000 // Cache de 1 minuto
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { latitude, longitude } = position.coords;
      
      // Llamar al callback con las coordenadas
      onLocationFound(latitude, longitude);
      
      console.log('📍 Ubicación obtenida:', { latitude, longitude });
      
    } catch (err) {
      let errorMessage = 'Error al obtener la ubicación';
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado. Inténtalo de nuevo.';
            break;
          default:
            errorMessage = 'Error desconocido al obtener la ubicación.';
        }
      }
      
      setError(errorMessage);
      console.error('❌ Error de geolocalización:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={getCurrentLocation}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}
        title="Usar mi ubicación actual"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MapPin className="w-5 h-5" />
        )}
        <span className="font-medium">
          {isLoading ? 'Ubicando...' : 'Mi Ubicación'}
        </span>
      </Button>
      
      {error && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl shadow-xl z-50 min-w-80 max-w-sm">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium mb-2">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-md transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
