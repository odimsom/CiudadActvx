import React from 'react';
import { MobileCityMap } from './components/MobileCityMap';
import InstallPWA from './components/InstallPWA';
import './styles/animations.css';

function App() {
  return (
    <div className="App mobile-pwa h-screen w-full">
      <InstallPWA />
      <MobileCityMap className="h-full w-full" />
    </div>
  );
}

export default App;
