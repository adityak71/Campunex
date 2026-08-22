'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Map from './Map';
import { MapPin, Navigation, Clock, AlertTriangle, Check, Search, ShieldCheck } from 'lucide-react';

// Bounding box for University Service Region (LPU / Punjab / Regional North India)
export const UNIVERSITY_REGION_BOUNDS = {
  minLat: 29.5,
  maxLat: 32.8,
  minLng: 74.0,
  maxLng: 77.8,
  regionName: 'LPU / Punjab Campus Region',
};

interface LocationItem {
  name: string;
  locality: string;
  state: string;
  lat: number;
  lng: number;
  category: 'CAMPUS' | 'NEARBY' | 'SUGGESTED' | 'RECENT';
}

interface LocationPickerProps {
  label: string;
  placeholder?: string;
  initialName?: string;
  initialLat?: string;
  initialLng?: string;
  onSelectLocation: (name: string, lat: number, lng: number) => void;
  otherLocationLat?: string;
  otherLocationLng?: string;
}

const PRESET_LOCATIONS: LocationItem[] = [
  { name: 'LPU Main Gate', locality: 'Phagwara', state: 'Punjab', lat: 31.2536, lng: 75.7037, category: 'CAMPUS' },
  { name: 'LPU Law Gate', locality: 'Phagwara', state: 'Punjab', lat: 31.2505, lng: 75.7012, category: 'CAMPUS' },
  { name: 'LPU BH-1 Hostels', locality: 'Phagwara', state: 'Punjab', lat: 31.2545, lng: 75.7048, category: 'CAMPUS' },
  { name: 'LPU GH-1 Girls Hostel', locality: 'Phagwara', state: 'Punjab', lat: 31.2520, lng: 75.7025, category: 'CAMPUS' },
  { name: 'Jalandhar City Railway Station', locality: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762, category: 'NEARBY' },
  { name: 'Phagwara Junction Railway Station', locality: 'Phagwara', state: 'Punjab', lat: 31.2240, lng: 75.7708, category: 'NEARBY' },
  { name: 'Jalandhar ISBT Bus Stand', locality: 'Jalandhar', state: 'Punjab', lat: 31.3180, lng: 75.5800, category: 'NEARBY' },
  { name: 'Haveli Heritage Resort & Dining', locality: 'Phagwara Highway', state: 'Punjab', lat: 31.2380, lng: 75.7500, category: 'NEARBY' },
];

export default function LocationPicker({
  label,
  placeholder = 'Search campus landmark or address...',
  initialName = '',
  initialLat = '',
  initialLng = '',
  onSelectLocation,
  otherLocationLat,
  otherLocationLng,
}: LocationPickerProps) {
  const [query, setQuery] = useState(initialName);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map Picker Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [pickedMapLat, setPickedMapLat] = useState<number>(parseFloat(initialLat) || 31.2536);
  const [pickedMapLng, setPickedMapLng] = useState<number>(parseFloat(initialLng) || 75.7037);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialName) setQuery(initialName);
    if (initialLat) setLat(initialLat);
    if (initialLng) setLng(initialLng);
  }, [initialName, initialLat, initialLng]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate Region Boundary
  const isWithinRegion = (latitude: number, longitude: number) => {
    return (
      latitude >= UNIVERSITY_REGION_BOUNDS.minLat &&
      latitude <= UNIVERSITY_REGION_BOUNDS.maxLat &&
      longitude >= UNIVERSITY_REGION_BOUNDS.minLng &&
      longitude <= UNIVERSITY_REGION_BOUNDS.maxLng
    );
  };

  const validateAndSelect = (name: string, latitude: number, longitude: number) => {
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Invalid geographic coordinates.');
      return false;
    }

    if (!isWithinRegion(latitude, longitude)) {
      setError('Location is outside the supported university region.');
      return false;
    }

    // Check same pickup / dropoff
    if (otherLocationLat && otherLocationLng) {
      const oLat = parseFloat(otherLocationLat);
      const oLng = parseFloat(otherLocationLng);
      if (Math.abs(latitude - oLat) < 0.0001 && Math.abs(longitude - oLng) < 0.0001) {
        setError('Pickup and Destination cannot be the exact same location.');
        return false;
      }
    }

    setError(null);
    setQuery(name);
    setLat(latitude.toFixed(6));
    setLng(longitude.toFixed(6));
    setShowDropdown(false);
    onSelectLocation(name, latitude, longitude);
    return true;
  };

  // OpenStreetMap Nominatim Search
  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}&limit=5&addressdetails=1`
      );
      const data = await res.json();

      const mapped: LocationItem[] = (data || []).map((item: any) => ({
        name: item.display_name.split(',')[0] || item.display_name,
        locality: item.address?.city || item.address?.town || item.address?.suburb || 'Punjab Region',
        state: item.address?.state || 'Punjab',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        category: 'SUGGESTED',
      }));

      setSuggestions(mapped);
      setShowDropdown(true);
    } catch (err) {
      setError('Geocoding search failed. Please check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  // HTML5 Geolocation API
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation service is unavailable on your device/browser.');
      return;
    }

    setGeoLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const { latitude, longitude } = pos.coords;
        validateAndSelect('Current Geolocation Target', latitude, longitude);
      },
      (err) => {
        setGeoLoading(false);
        setError('Location permission denied or GPS unavailable.');
      },
      { timeout: 8000 }
    );
  };

  const handleConfirmMapPicker = () => {
    const name = `Picked Map Point (${pickedMapLat.toFixed(4)}, ${pickedMapLng.toFixed(4)})`;
    if (validateAndSelect(name, pickedMapLat, pickedMapLng)) {
      setShowMapModal(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative text-left w-full">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
        <button
          type="button"
          onClick={() => setShowMapModal(true)}
          className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
        >
          <MapPin className="w-3.5 h-3.5" /> Pick on Interactive Map
        </button>
      </div>

      {/* Input Search Field */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition pr-10 shadow-sm"
        />

        {loading ? (
          <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full" />
        ) : (
          <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
        )}

        {/* Categorized Autocomplete Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
            {/* Current Geolocation Trigger */}
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="w-full text-left px-3.5 py-2.5 bg-teal-50/60 dark:bg-cyan-950/60 hover:bg-teal-100/60 dark:hover:bg-cyan-900/60 transition flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-teal-700 dark:text-cyan-300"
            >
              <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>{geoLoading ? 'Acquiring GPS Fix...' : 'Use Current Device GPS Location'}</span>
            </button>

            {/* Campus Locations Category */}
            <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950 text-[10px] font-extrabold text-teal-600 dark:text-cyan-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              Campus Locations
            </div>
            {PRESET_LOCATIONS.filter((loc) => loc.category === 'CAMPUS').map((loc, idx) => (
              <button
                key={`campus-${idx}`}
                type="button"
                onClick={() => validateAndSelect(loc.name, loc.lat, loc.lng)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800/40 text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-slate-100">🏢 {loc.name}</div>
                <div className="text-[10px] text-slate-400">{loc.locality}, {loc.state}</div>
              </button>
            ))}

            {/* Nearby Supported Locations Category */}
            <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
              Nearby Supported Locations
            </div>
            {PRESET_LOCATIONS.filter((loc) => loc.category === 'NEARBY').map((loc, idx) => (
              <button
                key={`nearby-${idx}`}
                type="button"
                onClick={() => validateAndSelect(loc.name, loc.lat, loc.lng)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800/40 text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-slate-100">📍 {loc.name}</div>
                <div className="text-[10px] text-slate-400">{loc.locality}, {loc.state}</div>
              </button>
            ))}

            {/* Geocoding API Suggestions */}
            {suggestions.length > 0 && (
              <>
                <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                  Search Results
                </div>
                {suggestions.map((s, idx) => (
                  <button
                    key={`sug-${idx}`}
                    type="button"
                    onClick={() => validateAndSelect(s.name, s.lat, s.lng)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800/30 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-slate-100">🔍 {s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.locality}, {s.state}</div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Auto-Fetched Coordinates Pill */}
      {lat && lng && !error && (
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
          <span className="text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Verified Bounds: <strong className="font-mono text-slate-900 dark:text-slate-100">{lat}° N, {lng}° E</strong>
          </span>
          <span className="text-slate-400 text-[10px]">LPU Region</span>
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title={`Select ${label} on Interactive Map`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Click on the map or move the location marker to set your precise geographic coordinates.
          </p>

          <Map
            origin={{ latitude: pickedMapLat, longitude: pickedMapLng }}
            height="280px"
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center font-mono">
            <span>Coordinates: <strong>{pickedMapLat.toFixed(4)}, {pickedMapLng.toFixed(4)}</strong></span>
            <span className="text-teal-600 font-bold">LPU Bounds</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMapModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={handleConfirmMapPicker}
              className="flex-1"
            >
              Confirm Selected Location
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
