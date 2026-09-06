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

  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const handleConfirmMapPicker = async () => {
    setIsReverseGeocoding(true);
    let name = `Picked Map Point (${pickedMapLat.toFixed(4)}, ${pickedMapLng.toFixed(4)})`;
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pickedMapLat}&lon=${pickedMapLng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        // Create a shorter, cleaner name from the address parts
        const addr = data.address || {};
        const main = addr.amenity || addr.building || addr.road || addr.neighbourhood || addr.suburb || addr.village || addr.hamlet;
        const city = addr.city || addr.town || addr.county || addr.state_district || 'Punjab';
        
        if (main && city) {
          name = `${main}, ${city}`;
        } else if (data.display_name) {
          // Fallback to taking the first 2-3 parts of the display name
          name = data.display_name.split(',').slice(0, 3).join(', ').trim();
        }
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      // Fallback to coordinates string if API fails
    } finally {
      setIsReverseGeocoding(false);
    }

    if (validateAndSelect(name, pickedMapLat, pickedMapLng)) {
      setShowMapModal(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative text-left w-full">
      <div className="flex justify-between items-center">
        <label className="block text-[12px] font-[900] text-white/72">{label}</label>
        <button
          type="button"
          onClick={() => setShowMapModal(true)}
          className="text-[12px] font-bold text-accent3 hover:text-accent3 hover:underline flex items-center gap-1 transition-colors"
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
          className="w-full px-3.5 py-[12px] bg-black/[0.18] border border-white/16 rounded-[14px] text-[13px] text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition pr-10 shadow-sm"
        />

        {loading ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-accent3 border-t-transparent rounded-full" />
        ) : (
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        )}

        {/* Categorized Autocomplete Dropdown */}
        {showDropdown && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-[#12121e]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
            {/* Current Geolocation Trigger */}
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="w-full text-left px-3.5 py-2.5 bg-white/10 hover:bg-white/10 transition flex items-center gap-2 border-b border-white/5 text-xs font-bold text-accent3"
            >
              <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>{geoLoading ? 'Acquiring GPS Fix...' : 'Use Current Device GPS Location'}</span>
            </button>

            {/* Campus Locations Category */}
            <div className="px-3.5 py-1.5 bg-white/5 text-[10px] font-extrabold text-accent3 uppercase tracking-wider border-b border-white/5">
              Campus Locations
            </div>
            {PRESET_LOCATIONS.filter((loc) => loc.category === 'CAMPUS').map((loc, idx) => (
              <button
                key={`campus-${idx}`}
                type="button"
                onClick={() => validateAndSelect(loc.name, loc.lat, loc.lng)}
                className="w-full text-left px-3.5 py-2 hover:bg-white/5 transition border-b border-white/5 text-xs"
              >
                <div className="font-bold text-white">🏢 {loc.name}</div>
                <div className="text-[10px] text-white/40">{loc.locality}, {loc.state}</div>
              </button>
            ))}

            {/* Nearby Supported Locations Category */}
            <div className="px-3.5 py-1.5 bg-white/5 text-[10px] font-extrabold text-white/50 uppercase tracking-wider border-y border-white/5">
              Nearby Supported Locations
            </div>
            {PRESET_LOCATIONS.filter((loc) => loc.category === 'NEARBY').map((loc, idx) => (
              <button
                key={`nearby-${idx}`}
                type="button"
                onClick={() => validateAndSelect(loc.name, loc.lat, loc.lng)}
                className="w-full text-left px-3.5 py-2 hover:bg-white/5 transition border-b border-white/5 text-xs"
              >
                <div className="font-bold text-white">📍 {loc.name}</div>
                <div className="text-[10px] text-white/40">{loc.locality}, {loc.state}</div>
              </button>
            ))}

            {/* Geocoding API Suggestions */}
            {suggestions.length > 0 && (
              <>
                <div className="px-3.5 py-1.5 bg-white/5 text-[10px] font-extrabold text-white/50 uppercase tracking-wider border-y border-white/5">
                  Search Results
                </div>
                {suggestions.map((s, idx) => (
                  <button
                    key={`sug-${idx}`}
                    type="button"
                    onClick={() => validateAndSelect(s.name, s.lat, s.lng)}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/5 transition border-b border-white/5 text-xs"
                  >
                    <div className="font-bold text-white">🔍 {s.name}</div>
                    <div className="text-[10px] text-white/40">{s.locality}, {s.state}</div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Auto-Fetched Coordinates Pill */}
      {lat && lng && !error && (
        <div className="flex items-center justify-between bg-black/20 px-3 py-1.5 rounded-[12px] border border-white/5 text-[11px] backdrop-blur-sm">
          <span className="text-accent3 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent3 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
            Verified Bounds: <strong className="font-mono text-white/90 font-normal tracking-wide">{lat}° N, {lng}° E</strong>
          </span>
          <span className="text-white/30 text-[10px] font-bold">LPU Region</span>
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title={`Select ${label} on Interactive Map`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-white/50 leading-relaxed">
            Click on the map or move the location marker to set your precise geographic coordinates.
          </p>

          <Map
            origin={{ latitude: pickedMapLat, longitude: pickedMapLng }}
            height="280px"
            onLocationSelect={(lat: number, lng: number) => {
              setPickedMapLat(lat);
              setPickedMapLng(lng);
            }}
          />

          <div className="p-3 bg-white/5 border border-white/10 rounded-[14px] flex justify-between items-center font-mono">
            <span className="text-white/70">Coordinates: <strong className="text-white">{pickedMapLat.toFixed(4)}, {pickedMapLng.toFixed(4)}</strong></span>
            <span className="text-accent3 font-bold">LPU Bounds</span>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/5" onClick={() => setShowMapModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmMapPicker}
              disabled={!isWithinRegion(pickedMapLat, pickedMapLng)}
              isLoading={isReverseGeocoding}
              leftIcon={<Check className="w-4 h-4" />}
              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              {isReverseGeocoding ? 'Analyzing...' : 'Confirm Location'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
