import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapPicker.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPicker = ({ onLocationSelect, initialLocation = null }) => {
    const [position, setPosition] = useState(initialLocation || [51.505, -0.09]);
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (initialLocation) {
            setPosition(initialLocation);
            // Reverse geocode the initial location
            fetchAddress(initialLocation[0], initialLocation[1]);
        }
    }, [initialLocation]);

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
                onLocationSelect({ lat, lng, address: data.display_name });
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                fetchAddress(lat, lng);
            },
        });

        return position ? <Marker position={position} /> : null;
    };

    return (
        <div className="map-picker">
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
            </MapContainer>
            {address && (
                <div className="selected-location">
                    <p><strong>Selected Location:</strong> {address}</p>
                    <p><strong>Coordinates:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
                </div>
            )}
        </div>
    );
};

export default MapPicker; 