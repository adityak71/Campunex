'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  onLocationSelect?: (lat: number, lng: number) => void;
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
  onLocationSelect,
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

    // Import Leaflet CSS is handled at the top of the file natively

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

    // Handle map clicks for coordinate selection
    if (onLocationSelect) {
      map.off('click'); // Remove any previous listeners to avoid duplicates
      map.on('click', (e: any) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
      // Change cursor to crosshair if map is clickable
      if (mapRef.current) {
        mapRef.current.style.cursor = 'crosshair';
      }
    }

    // Refs for marker instances to prevent duplicates
    if (!leafletMap.current.originMarkerRef) leafletMap.current.originMarkerRef = null;
    if (!leafletMap.current.destMarkerRef) leafletMap.current.destMarkerRef = null;
    if (!leafletMap.current.riderPickupRef) leafletMap.current.riderPickupRef = null;
    if (!leafletMap.current.riderDestRef) leafletMap.current.riderDestRef = null;

    // 1. Driver Origin Marker (Indigo Pin)
    if (origin) {
      if (!leafletMap.current.originMarkerRef) {
        leafletMap.current.originMarkerRef = L.circleMarker([origin.latitude, origin.longitude], {
          color: '#4f46e5',
          fillColor: '#6366f1',
          radius: 9,
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(map);
      } else {
        leafletMap.current.originMarkerRef.setLatLng([origin.latitude, origin.longitude]);
      }
      leafletMap.current.originMarkerRef.bindPopup('<b>🚘 Driver Origin</b><br/>' + (origin.latitude.toFixed(4) + ', ' + origin.longitude.toFixed(4)));
    } else if (leafletMap.current.originMarkerRef) {
      map.removeLayer(leafletMap.current.originMarkerRef);
      leafletMap.current.originMarkerRef = null;
    }

    // 2. Driver Destination Marker (Purple Pin)
    if (destination) {
      if (!leafletMap.current.destMarkerRef) {
        leafletMap.current.destMarkerRef = L.circleMarker([destination.latitude, destination.longitude], {
          color: '#7c3aed',
          fillColor: '#8b5cf6',
          radius: 9,
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(map);
      } else {
        leafletMap.current.destMarkerRef.setLatLng([destination.latitude, destination.longitude]);
      }
      leafletMap.current.destMarkerRef.bindPopup('<b>🏁 Driver Destination</b><br/>' + (destination.latitude.toFixed(4) + ', ' + destination.longitude.toFixed(4)));
    } else if (leafletMap.current.destMarkerRef) {
      map.removeLayer(leafletMap.current.destMarkerRef);
      leafletMap.current.destMarkerRef = null;
    }

    // 3. Rider Pickup Marker (Emerald Pin) & 500m Match Area Circle
    if (riderPickup) {
      const pickupLatLng: [number, number] = [riderPickup.latitude, riderPickup.longitude];

      if (!leafletMap.current.riderPickupRef) {
        leafletMap.current.riderPickupRef = L.circleMarker(pickupLatLng, {
          color: '#059669',
          fillColor: '#10b981',
          radius: 8,
          fillOpacity: 0.95,
          weight: 2,
        }).addTo(map);
      } else {
        leafletMap.current.riderPickupRef.setLatLng(pickupLatLng);
      }
      leafletMap.current.riderPickupRef.bindPopup('<b>🚴 Rider Pickup Target</b><br/>' + (pickupDistanceMeters ? `Distance: ${Math.round(pickupDistanceMeters)}m` : '500m Proximity'));

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
      } else {
        proximityCircleRef.current.setLatLng(pickupLatLng);
      }
    } else {
      if (leafletMap.current.riderPickupRef) {
        map.removeLayer(leafletMap.current.riderPickupRef);
        leafletMap.current.riderPickupRef = null;
      }
      if (proximityCircleRef.current) {
        map.removeLayer(proximityCircleRef.current);
        proximityCircleRef.current = null;
      }
    }

    // 4. Rider Destination Marker (Orange Pin)
    if (riderDestination) {
      if (!leafletMap.current.riderDestRef) {
        leafletMap.current.riderDestRef = L.circleMarker([riderDestination.latitude, riderDestination.longitude], {
          color: '#d97706',
          fillColor: '#f59e0b',
          radius: 8,
          fillOpacity: 0.95,
          weight: 2,
        }).addTo(map);
      } else {
        leafletMap.current.riderDestRef.setLatLng([riderDestination.latitude, riderDestination.longitude]);
      }
      leafletMap.current.riderDestRef.bindPopup('<b>🎯 Rider Dropoff Target</b>');
    } else if (leafletMap.current.riderDestRef) {
      map.removeLayer(leafletMap.current.riderDestRef);
      leafletMap.current.riderDestRef = null;
    }

    // 5. Driver Route Polyline (Solid Indigo)
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeGeometryGeoJson) {
      try {
        const parsedGeoJson = JSON.parse(routeGeometryGeoJson);
        routePolylineRef.current = L.geoJSON(parsedGeoJson, {
          style: {
            color: '#6366f1',
            weight: 5,
            opacity: 0.85,
          },
        }).addTo(map);

        map.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
      } catch (e) {
        if (origin && destination) {
          routePolylineRef.current = L.polyline(
            [
              [origin.latitude, origin.longitude],
              [destination.latitude, destination.longitude],
            ],
            { color: '#6366f1', weight: 4, opacity: 0.8 }
          ).addTo(map);
        }
      }
    } else if (origin && destination) {
      // Fetch dynamic real road route from OSRM API
      const fetchRealRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`);
          const data = await res.json();
          
          if (data.routes && data.routes.length > 0) {
            if (routePolylineRef.current) {
              map.removeLayer(routePolylineRef.current);
            }
            routePolylineRef.current = L.geoJSON(data.routes[0].geometry, {
              style: { color: '#6366f1', weight: 4, opacity: 0.8 },
            }).addTo(map);
            
            // Optionally fit bounds to the route
            map.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
          } else {
            throw new Error('No routes found');
          }
        } catch (err) {
          console.error("OSRM Route Fetch Error:", err);
          // Fallback to straight line
          if (routePolylineRef.current) {
            map.removeLayer(routePolylineRef.current);
          }
          routePolylineRef.current = L.polyline(
            [
              [origin.latitude, origin.longitude],
              [destination.latitude, destination.longitude],
            ],
            { color: '#6366f1', weight: 4, opacity: 0.8 }
          ).addTo(map);
        }
      };
      
      fetchRealRoute();
    }

    // 6. Rider Route Polyline (Dashed Amber)
    if (riderPolylineRef.current) {
      map.removeLayer(riderPolylineRef.current);
      riderPolylineRef.current = null;
    }

    if (riderPickup && riderDestination) {
      const fetchRiderRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${riderPickup.longitude},${riderPickup.latitude};${riderDestination.longitude},${riderDestination.latitude}?overview=full&geometries=geojson`);
          const data = await res.json();
          
          if (data.routes && data.routes.length > 0) {
            if (riderPolylineRef.current) {
              map.removeLayer(riderPolylineRef.current);
            }
            riderPolylineRef.current = L.geoJSON(data.routes[0].geometry, {
              style: { color: '#f59e0b', weight: 3, dashArray: '6, 8', opacity: 0.9 },
            }).addTo(map);
          } else {
            throw new Error('No routes found');
          }
        } catch (err) {
          if (riderPolylineRef.current) {
            map.removeLayer(riderPolylineRef.current);
          }
          riderPolylineRef.current = L.polyline(
            [
              [riderPickup.latitude, riderPickup.longitude],
              [riderDestination.latitude, riderDestination.longitude],
            ],
            { color: '#f59e0b', weight: 3, dashArray: '6, 8', opacity: 0.9 }
          ).addTo(map);
        }
      };
      
      fetchRiderRoute();
    }

    return () => {
      // Keep map instance intact across tab changes
    };
  }, [origin, destination, riderPickup, riderDestination, routeGeometryGeoJson, isDarkMode]);

  // Live Driver Location Marker (Blue Car Icon)
  useEffect(() => {
    if (!driverLocation || !leafletMap.current) return;

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
  }, [driverLocation]);

  return (
    <div className="relative z-10 isolate rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Legend & Matching Metrics Overlay */}
      <div className="absolute top-3 right-3 z-20 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-[11px] font-bold space-y-1.5 max-w-[240px]">
        <div className="text-[#1e3a8a] text-accent3 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800 pb-1">
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
            <span className="w-3 h-3 rounded-full bg-accent3/20 border border-accent3 inline-block" />
            <span>500m Match Area</span>
          </div>
        )}

        {(matchScore !== undefined || pickupDistanceMeters !== undefined) && (
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] space-y-0.5">
            {matchScore !== undefined && (
              <div className="text-accent3 dark:text-accent3 font-extrabold">
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
