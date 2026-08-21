'use client';

import React, { useEffect, useRef } from 'react';
import { GeoPoint } from '@campunex/shared';

interface MapProps {
  origin?: GeoPoint;
  destination?: GeoPoint;
  driverLocation?: GeoPoint | null;
  routeGeometryGeoJson?: string;
  zoom?: number;
  height?: string;
}

export default function Map({
  origin,
  destination,
  driverLocation,
  routeGeometryGeoJson,
  zoom = 13,
  height = '400px',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import leaflet to avoid SSR window errors
    import('leaflet').then((L) => {
      // Import CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const defaultCenter: [number, number] = origin
        ? [origin.latitude, origin.longitude]
        : [31.2536, 75.7037]; // Default LPU coordinates

      if (!mapRef.current) return;

      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView(defaultCenter, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(leafletMap.current);
      }

      const map = leafletMap.current;

      // Render Origin Marker
      if (origin) {
        L.circleMarker([origin.latitude, origin.longitude], {
          color: '#10b981',
          radius: 8,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup('Pickup / Origin');
      }

      // Render Destination Marker
      if (destination) {
        L.circleMarker([destination.latitude, destination.longitude], {
          color: '#f43f5e',
          radius: 8,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup('Destination');
      }

      // Render Route Polyline if GeoJSON provided
      if (routeGeometryGeoJson && !routePolylineRef.current) {
        try {
          const parsedGeoJson = JSON.parse(routeGeometryGeoJson);
          routePolylineRef.current = L.geoJSON(parsedGeoJson, {
            style: {
              color: '#06b6d4',
              weight: 5,
              opacity: 0.8,
            },
          }).addTo(map);

          map.fitBounds(routePolylineRef.current.getBounds(), { padding: [30, 30] });
        } catch (e) {
          console.error('GeoJSON parse error in map:', e);
        }
      }
    });

    return () => {
      // Keep map instance alive during state re-renders
    };
  }, [origin, destination, routeGeometryGeoJson]);

  // Update Driver Live GPS Marker dynamically
  useEffect(() => {
    if (!driverLocation || !leafletMap.current) return;

    import('leaflet').then((L) => {
      const map = leafletMap.current;
      const latLng: [number, number] = [driverLocation.latitude, driverLocation.longitude];

      if (!driverMarkerRef.current) {
        // Custom Car Icon Marker
        const carIcon = L.divIcon({
          html: `<div style="background:#0284c7; width:28px; height:28px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.4); font-size:14px;">🚘</div>`,
          className: 'custom-car-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        driverMarkerRef.current = L.marker(latLng, { icon: carIcon })
          .addTo(map)
          .bindPopup('Live Driver Location');
      } else {
        driverMarkerRef.current.setLatLng(latLng);
      }

      map.panTo(latLng);
    });
  }, [driverLocation]);

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-xl overflow-hidden shadow-inner border border-slate-800" />;
}
