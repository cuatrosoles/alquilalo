import React from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir el problema de los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Mapa = ({ position, setPosition, editable = true }) => {
  const handleSetPosition = (e) => {
    if (editable) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    }
  };

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {editable && <MapEvents onSetPosition={handleSetPosition} />}
        <Circle
          center={position}
          radius={500} // Radio de 500 metros
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

const MapEvents = ({ onSetPosition }) => {
  useMapEvents({
    click: onSetPosition,
  });
  return null;
};

export default Mapa; 