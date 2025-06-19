import React from 'react'
import ReactDOM from 'react-dom/client'
import HomePage from './pages/HomePage'
// Importar Mapbox CSS antes que nuestros estilos
import 'mapbox-gl/dist/mapbox-gl.css'
import './index.css'
import { configureMapbox } from '@ciudad-activa/maps/utils/mapbox-config'

// Configure Mapbox to disable telemetry
configureMapbox();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>,
)
