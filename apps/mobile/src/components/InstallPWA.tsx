import React, { useState, useEffect } from 'react';

interface InstallPWAProps {}

const InstallPWA: React.FC<InstallPWAProps> = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installada exitosamente');
    } else {
      console.log('Usuario declinó la instalación');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🏛️</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Instalar Ciudad Activa</h3>
            <p className="text-sm text-gray-600">Descarga la app para acceso rápido</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
