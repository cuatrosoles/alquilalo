import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Solución para el problema de los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

// Componente para manejar eventos del mapa
const MapEvents = ({ onSetPosition }) => {
  useMapEvents({
    click: onSetPosition,
  });
  return null;
};

const Mapa = ({ position = [-34.6037, -58.3816], setPosition, editable = true }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Asegurarse de que solo se renderice en el cliente
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSetPosition = (e) => {
    if (editable && e && e.latlng) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    }
  };

  // Si no estamos en el cliente o no hay posición, mostrar un contenedor vacío
  if (!isMounted) {
    return <div className="h-[300px] w-full bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {editable && <MapEvents onSetPosition={handleSetPosition} />}
        <Circle
          center={position}
          radius={500}
          pathOptions={{
            color: '#FFC107',
            fillColor: '#FFC107',
            fillOpacity: 0.2,
            weight: 2
          }}
        />
      </MapContainer>
    </div>
  );
};

export default Mapa;