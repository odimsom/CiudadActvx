import React from 'react';
import { CityMap } from '../components/CityMap';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* Contenedor del mapa que ocupa todo el espacio */}
      <main className="flex-1">
        <CityMap className="h-full w-full" />
      </main>
    </div>
  );
};

export default HomePage;