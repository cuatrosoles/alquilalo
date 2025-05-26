import React, { useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const GoogleMapsWrapper = ({ children, onMapsAvailable }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (isLoaded) {
      onMapsAvailable?.(true);
    } else if (loadError) {
      console.error('Error loading Google Maps:', loadError);
      onMapsAvailable?.(false);
    }
  }, [isLoaded, loadError, onMapsAvailable]);

  if (loadError) {
    return (
      <div>
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            No se pudo cargar el selector de ubicación. Por favor, ingresa la dirección manualmente.
          </p>
        </div>
        {children}
      </div>
    );
  }

  if (!isLoaded) {
    return <div>Cargando...</div>;
  }

  return <>{children}</>;
};

export default GoogleMapsWrapper; 