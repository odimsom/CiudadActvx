import React from 'react'
import ReactDOM from 'react-dom/client'
import HomePage from './pages/HomePage'
// Importar Mapbox CSS antes que nuestros estilos
import 'mapbox-gl/dist/mapbox-gl.css'
import './index.css'
import { configureMapbox } from '@ciudad-activa/maps/utils/mapbox-config'

// Configure Mapbox to disable telemetry
configureMapbox();

// Registrar Service Worker para PWA solo en producción
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>,
)
