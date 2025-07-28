import React from 'react';
import HomePage from '../../web/src/pages/HomePage';
import InstallPWA from './components/InstallPWA';

function App() {
  return (
    <div className="App mobile-pwa">
      <InstallPWA />
      <HomePage />
    </div>
  );
}

export default App;
