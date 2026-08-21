'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LocationPickerProps {
  label: string;
  placeholder?: string;
  initialName?: string;
  initialLat?: string;
  initialLng?: string;
  onSelectLocation: (name: string, lat: number, lng: number) => void;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const POPULAR_CAMPUS_LOCATIONS = [
  { name: 'LPU Main Gate, Phagwara', lat: 31.2536, lng: 75.7037 },
  { name: 'LPU Law Gate, Campus', lat: 31.2505, lng: 75.7012 },
  { name: 'Jalandhar City Railway Station', lat: 31.3260, lng: 75.5762 },
  { name: 'Phagwara Junction Railway Station', lat: 31.2240, lng: 75.7708 },
  { name: 'Jalandhar ISBT Bus Stand', lat: 31.3180, lng: 75.5800 },
  { name: 'Chandigarh Sector 17 ISBT', lat: 30.7410, lng: 76.7850 },
];

export default function LocationPicker({
  label,
  placeholder = 'Search campus address or landmark...',
  initialName = '',
  initialLat = '',
  initialLng = '',
  onSelectLocation,
}: LocationPickerProps) {
  const [query, setQuery] = useState(initialName);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialName) setQuery(initialName);
    if (initialLat) setLat(initialLat);
    if (initialLng) setLng(initialLng);
  }, [initialName, initialLat, initialLng]);

  // Real-time Geocoding Search
  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}&limit=5&addressdetails=1`
      );
      const data: Suggestion[] = await response.json();
      setSuggestions(data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Geocoding search error:', err);
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

  const handleSelectSuggestion = (name: string, latitude: number, longitude: number) => {
    setQuery(name);
    setLat(latitude.toFixed(6));
    setLng(longitude.toFixed(6));
    setSuggestions([]);
    setShowDropdown(false);
    onSelectLocation(name, latitude, longitude);
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-xs font-semibold text-slate-300">{label}</label>

      {/* Address Search Autocomplete Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 transition pr-10 shadow-sm"
        />

        {loading ? (
          <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
        ) : (
          <span className="absolute right-3 top-2.5 text-slate-400 text-sm">📍</span>
        )}

        {/* Autocomplete Dropdown List */}
        {showDropdown && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
            {/* Quick Campus Shortcuts */}
            <div className="p-2 bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Popular Campus Locations
            </div>
            {POPULAR_CAMPUS_LOCATIONS.map((loc, idx) => (
              <button
                key={`pop-${idx}`}
                type="button"
                onClick={() => handleSelectSuggestion(loc.name, loc.lat, loc.lng)}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition flex items-center justify-between border-b border-slate-800/40"
              >
                <span className="font-semibold text-white">🏢 {loc.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {loc.lat}, {loc.lng}
                </span>
              </button>
            ))}

            {/* Geocoding API Suggestions */}
            {suggestions.length > 0 && (
              <>
                <div className="p-2 bg-slate-950/80 border-y border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Address Search Results
                </div>
                {suggestions.map((s, idx) => (
                  <button
                    key={`sug-${idx}`}
                    type="button"
                    onClick={() =>
                      handleSelectSuggestion(s.display_name, parseFloat(s.lat), parseFloat(s.lon))
                    }
                    className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition border-b border-slate-800/30"
                  >
                    <div>📍 {s.display_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Auto-Fetched: {s.lat}, {s.lon}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Auto-Fetched Coordinates Badge */}
      {lat && lng && (
        <div className="flex items-center justify-between bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-Fetched Coordinates: <strong className="font-mono text-white">{lat}° N, {lng}° E</strong>
          </span>
          <button
            type="button"
            onClick={() => setShowManualCoords(!showManualCoords)}
            className="text-slate-400 hover:text-cyan-400 underline text-[10px]"
          >
            {showManualCoords ? 'Hide Lat/Lng' : 'Edit Lat/Lng'}
          </button>
        </div>
      )}

      {/* Optional Manual Coordinate Adjustment */}
      {showManualCoords && (
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => {
                setLat(e.target.value);
                onSelectLocation(query, parseFloat(e.target.value) || 0, parseFloat(lng) || 0);
              }}
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">Longitude</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => {
                setLng(e.target.value);
                onSelectLocation(query, parseFloat(lat) || 0, parseFloat(e.target.value) || 0);
              }}
              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
