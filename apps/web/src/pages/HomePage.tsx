import React from 'react';
import { CityMap } from '../components/CityMap';
import { AppHeader } from '../components/AppHeader';
import { useIncidents } from '../hooks/useIncidents';

const HomePage: React.FC = () => {
  const { incidents } = useIncidents();
  
  // Contar incidencias pendientes
  const pendingIncidents = incidents.filter(
    incident => incident.status === 'pending'
  ).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* Header de la aplicación */}
      <AppHeader incidentCount={pendingIncidents} />
      
      {/* Contenedor del mapa que ocupa el espacio restante */}
      <main className="flex-1">
        <CityMap className="h-full w-full" />
      </main>
    </div>
  );
};

export default HomePage;