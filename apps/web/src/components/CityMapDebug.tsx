import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentReport } from '@ciudad-activa/types';

interface CityMapDebugProps {
  className?: string;
}

export const CityMapDebug: React.FC<CityMapDebugProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { incidents } = useIncidents();

  const mapboxToken = "pk.eyJ1IjoibWNhcnJhc2NvIiwiYSI6ImNtNGxmbGV1dzE5dHcyanEwZmFpa2FtYzMifQ.VCwfPuPdgGfXHvVqDWOdZA";

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-99.1332, 19.4326], // CDMX
      zoom: 12
    });

    map.current.on('load', () => {
      console.log("🗺️ Mapa cargado, incidentes:", incidents.length);
      
      incidents.forEach((incident: IncidentReport, index) => {
        console.log(`🔴 DEBUG Marcador ${index + 1}:`, {
          id: incident.id,
          title: incident.title,
          coordinates: incident.coordinates,
          type: {
            category: incident.type.category,
            color: incident.type.color,
            name: incident.type.name,
            icon: incident.type.icon
          }
        });

        // Crear marcador simple para debug
        const el = document.createElement('div');
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background: ${incident.type.color || '#6b7280'};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
        `;
        el.innerHTML = (index + 1).toString();

        new mapboxgl.Marker(el)
          .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
          .addTo(map.current!);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [incidents]);

  return (
    <div className={`relative w-full h-screen ${className || ''}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow">
        <h3 className="font-bold">Debug Info</h3>
        <p>Incidentes cargados: {incidents.length}</p>
        <p>Mapa: {map.current ? 'Cargado' : 'No cargado'}</p>
      </div>
    </div>
  );
};
