'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GeoPoint } from '@campunex/shared';

interface MapProps {
  origin?: GeoPoint;
  destination?: GeoPoint;
  riderPickup?: GeoPoint;
  riderDestination?: GeoPoint;
  driverLocation?: GeoPoint | null;
  routeGeometryGeoJson?: string;
  matchScore?: number;
  pickupDistanceMeters?: number;
  zoom?: number;
  height?: string;
}

export default function Map({
  origin,
  destination,
  riderPickup,
  riderDestination,
  driverLocation,
  routeGeometryGeoJson,
  matchScore,
  pickupDistanceMeters,
  zoom = 13,
  height = '400px',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const riderPolylineRef = useRef<any>(null);
  const proximityCircleRef = useRef<any>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check dark mode preference
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Import Leaflet CSS
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

        const tileUrl = isDarkMode
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
          attribution: '&copy; OpenStreetMap &copy; CartoDB',
          maxZoom: 19,
        }).addTo(leafletMap.current);
      }

      const map = leafletMap.current;

      // 1. Driver Origin Marker (Green Pin)
      if (origin) {
        L.circleMarker([origin.latitude, origin.longitude], {
          color: '#0d9488',
          fillColor: '#14b8a6',
          radius: 9,
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(map)
          .bindPopup('<b>🚘 Driver Origin</b><br/>' + (origin.latitude.toFixed(4) + ', ' + origin.longitude.toFixed(4)));
      }

      // 2. Driver Destination Marker (Red Pin)
      if (destination) {
        L.circleMarker([destination.latitude, destination.longitude], {
          color: '#e11d48',
          fillColor: '#f43f5e',
          radius: 9,
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(map)
          .bindPopup('<b>🏁 Driver Destination</b><br/>' + (destination.latitude.toFixed(4) + ', ' + destination.longitude.toFixed(4)));
      }

      // 3. Rider Pickup Marker (Emerald Pin) & 500m Match Area Circle
      if (riderPickup) {
        const pickupLatLng: [number, number] = [riderPickup.latitude, riderPickup.longitude];

        L.circleMarker(pickupLatLng, {
          color: '#059669',
          fillColor: '#10b981',
          radius: 8,
          fillOpacity: 0.95,
          weight: 2,
        })
          .addTo(map)
          .bindPopup('<b>🚴 Rider Pickup Target</b><br/>' + (pickupDistanceMeters ? `Distance: ${Math.round(pickupDistanceMeters)}m` : '500m Proximity'));

        // 500-meter PostGIS match area circle buffer
        if (!proximityCircleRef.current) {
          proximityCircleRef.current = L.circle(pickupLatLng, {
            radius: 500, // 500 meters threshold
            color: '#14b8a6',
            fillColor: '#2dd4bf',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 6',
          }).addTo(map).bindPopup('<b>500m Match Area Shield</b><br/>PostGIS Spatial Overlap Zone');
        }
      }

      // 4. Rider Destination Marker (Orange Pin)
      if (riderDestination) {
        L.circleMarker([riderDestination.latitude, riderDestination.longitude], {
          color: '#d97706',
          fillColor: '#f59e0b',
          radius: 8,
          fillOpacity: 0.95,
          weight: 2,
        })
          .addTo(map)
          .bindPopup('<b>🎯 Rider Dropoff Target</b>');
      }

      // 5. Driver Route Polyline (Solid Teal)
      if (routeGeometryGeoJson && !routePolylineRef.current) {
        try {
          const parsedGeoJson = JSON.parse(routeGeometryGeoJson);
          routePolylineRef.current = L.geoJSON(parsedGeoJson, {
            style: {
              color: '#06b6d4',
              weight: 5,
              opacity: 0.85,
            },
          }).addTo(map);

          map.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
        } catch (e) {
          // Fallback straight line if GeoJSON parsing fails
          if (origin && destination) {
            routePolylineRef.current = L.polyline(
              [
                [origin.latitude, origin.longitude],
                [destination.latitude, destination.longitude],
              ],
              { color: '#06b6d4', weight: 4, opacity: 0.8 }
            ).addTo(map);
          }
        }
      } else if (origin && destination && !routePolylineRef.current) {
        routePolylineRef.current = L.polyline(
          [
            [origin.latitude, origin.longitude],
            [destination.latitude, destination.longitude],
          ],
          { color: '#06b6d4', weight: 4, opacity: 0.8 }
        ).addTo(map);
      }

      // 6. Rider Route Polyline (Dashed Amber)
      if (riderPickup && riderDestination && !riderPolylineRef.current) {
        riderPolylineRef.current = L.polyline(
          [
            [riderPickup.latitude, riderPickup.longitude],
            [riderDestination.latitude, riderDestination.longitude],
          ],
          { color: '#f59e0b', weight: 3, dashArray: '6, 8', opacity: 0.9 }
        ).addTo(map);
      }
    });

    return () => {
      // Keep map instance intact across tab changes
    };
  }, [origin, destination, riderPickup, riderDestination, routeGeometryGeoJson, isDarkMode]);

  // Live Driver Location Marker (Blue Car Icon)
  useEffect(() => {
    if (!driverLocation || !leafletMap.current) return;

    import('leaflet').then((L) => {
      const map = leafletMap.current;
      const latLng: [number, number] = [driverLocation.latitude, driverLocation.longitude];

      if (!driverMarkerRef.current) {
        const carIcon = L.divIcon({
          html: `<div style="background:#0284c7; width:30px; height:30px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 8px rgba(0,0,0,0.4); font-size:16px;">🚘</div>`,
          className: 'custom-car-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        driverMarkerRef.current = L.marker(latLng, { icon: carIcon })
          .addTo(map)
          .bindPopup('<b>Live Driver GPS Stream</b>');
      } else {
        driverMarkerRef.current.setLatLng(latLng);
      }

      map.panTo(latLng);
    });
  }, [driverLocation]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Legend & Matching Metrics Overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-[11px] font-bold space-y-1.5 max-w-[240px]">
        <div className="text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800 pb-1">
          Route Matching Engine
        </div>

        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <span className="w-5 h-1 bg-cyan-500 rounded-full inline-block" />
          <span>DRIVER ROUTE</span>
        </div>

        {riderPickup && riderDestination && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <span className="w-5 h-1 bg-amber-500 border-b border-dashed inline-block" />
            <span>RIDER ROUTE</span>
          </div>
        )}

        {riderPickup && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <span className="w-3 h-3 rounded-full bg-teal-500/20 border border-teal-500 inline-block" />
            <span>500m Match Area</span>
          </div>
        )}

        {(matchScore !== undefined || pickupDistanceMeters !== undefined) && (
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] space-y-0.5">
            {matchScore !== undefined && (
              <div className="text-teal-600 dark:text-teal-400 font-extrabold">
                Route Match: {Math.round(matchScore)}%
              </div>
            )}
            {pickupDistanceMeters !== undefined && (
              <div className="text-slate-600 dark:text-slate-300">
                Pickup Distance: {Math.round(pickupDistanceMeters)}m
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
