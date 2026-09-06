'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceLayout from '../../../components/layouts/WorkspaceLayout';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LocationPicker from '../../../components/LocationPicker';
import Map from '../../../components/Map';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import {
  Car,
  Bike,
  Navigation2,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  Globe
} from 'lucide-react';

// Bounding box validation for LPU / Regional Campus service area (Punjab & North India)
const REGION_BOUNDS = {
  minLat: 29.5,
  maxLat: 32.8,
  minLng: 74.0,
  maxLng: 77.8,
};

export default function DriverOfferPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Multi-step state: 1 = Vehicle, 2 = Route, 3 = Schedule & Confirm
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1 — Vehicle State
  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE'>('CAR');
  const [vehicleMake, setVehicleMake] = useState('Honda');
  const [vehicleModel, setVehicleModel] = useState('Civic');
  const [vehicleColor, setVehicleColor] = useState('Silver');
  const [vehicleRegistration, setVehicleRegistration] = useState('PB-08-AB-1234');
  const [totalSeats, setTotalSeats] = useState<number>(4);

  // STEP 2 — Route State
  const [originName, setOriginName] = useState('LPU Main Gate, Phagwara');
  const [originLat, setOriginLat] = useState('31.2536');
  const [originLng, setOriginLng] = useState('75.7037');

  const [destName, setDestName] = useState('Jalandhar City Railway Station, Punjab');
  const [destLat, setDestLat] = useState('31.3260');
  const [destLng, setDestLng] = useState('75.5762');

  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [activePickerTarget, setActivePickerTarget] = useState<'PICKUP' | 'DROP'>('PICKUP');

  // STEP 3 — Schedule & Confirmation State
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 10)
  );
  const [departureTime, setDepartureTime] = useState(
    new Date(Date.now() + 3600000).toTimeString().slice(0, 5)
  );

  // Status & Success state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishedRideId, setPublishedRideId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Region Boundary Checker
  const isWithinRegion = (latStr: string, lngStr: string) => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) return false;
    return (
      lat >= REGION_BOUNDS.minLat &&
      lat <= REGION_BOUNDS.maxLat &&
      lng >= REGION_BOUNDS.minLng &&
      lng <= REGION_BOUNDS.maxLng
    );
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!vehicleMake.trim()) {
      setError('Please provide vehicle make (e.g. Honda, Hero)');
      return false;
    }
    if (!vehicleModel.trim()) {
      setError('Please provide vehicle model (e.g. Civic, Activa)');
      return false;
    }
    if (!vehicleRegistration.trim()) {
      setError('Please enter vehicle registration number (e.g. PB-08-AB-1234)');
      return false;
    }
    if (vehicleType === 'BIKE' && totalSeats > 1) {
      setTotalSeats(1);
    }
    setError(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!originName || !destName) {
      setError('Please enter both pickup and destination locations.');
      return false;
    }

    if (originName.trim().toLowerCase() === destName.trim().toLowerCase()) {
      setError('Pickup and Destination cannot be the exact same location.');
      return false;
    }

    if (!isWithinRegion(originLat, originLng)) {
      setError('Pickup location is outside the university service region (Punjab / North India campus area).');
      return false;
    }

    if (!isWithinRegion(destLat, destLng)) {
      setError('Destination location is outside the university service region (Punjab / North India campus area).');
      return false;
    }

    setError(null);
    return true;
  };

  // Step 3 Publish Submit
  const handlePublishRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Date & Time validation
    const fullDepartureIso = new Date(`${departureDate}T${departureTime}`).toISOString();
    if (new Date(fullDepartureIso).getTime() < Date.now()) {
      setError('Departure time cannot be in the past. Please select a future date & time.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        origin_name: originName,
        destination_name: destName,
        origin: { latitude: parseFloat(originLat), longitude: parseFloat(originLng) },
        destination: { latitude: parseFloat(destLat), longitude: parseFloat(destLng) },
        departure_time: fullDepartureIso,
        total_seats: totalSeats,
      };

      const res = await apiRequest('/rides', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const rideId = res.ride?.id || res.id || 'new';
      setPublishedRideId(rideId);
      setShowSuccessModal(true);
      showToast('🎉 Ride published successfully!', 'success');
    } catch (err: any) {
      const msg = err.message || 'Failed to publish ride. Please check backend connection.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const originPoint = { latitude: parseFloat(originLat), longitude: parseFloat(originLng) };
  const destPoint = { latitude: parseFloat(destLat), longitude: parseFloat(destLng) };

  return (
    <WorkspaceLayout mode="driver" title="Offer a Campus Ride" subtitle="Publish your route with verified 500m route proximity matching">
      <div className="space-y-8 w-full">
        {/* Header Title */}
        <div className="space-y-1">
          <Badge variant="info" className="bg-white/5 border border-white/10 text-white/70">CAMPUS DRIVER FLOW</Badge>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
            Offer a Campus Ride
          </h1>
          <p className="text-xs text-white/50">
            Publish your route with verified 500m route proximity matching
          </p>
        </div>

        {/* Wizard Multi-Step Progress Indicator */}
        <Card className="p-4 bg-[#12121e]/80 border-white/10 rounded-full shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold px-2">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-indigo-400' : 'text-white/40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${currentStep >= 1 ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md' : 'bg-white/10'}`}>
                1
              </div>
              <span className="hidden sm:inline">Vehicle</span>
            </div>

            <div className={`h-0.5 flex-1 mx-3 ${currentStep >= 2 ? 'bg-indigo-500/50' : 'bg-white/10'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-indigo-400' : 'text-white/40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${currentStep >= 2 ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md' : 'bg-white/10'}`}>
                2
              </div>
              <span className="hidden sm:inline">Route</span>
            </div>

            <div className={`h-0.5 flex-1 mx-3 ${currentStep >= 3 ? 'bg-indigo-500/50' : 'bg-white/10'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-indigo-400' : 'text-white/40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${currentStep >= 3 ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md' : 'bg-white/10'}`}>
                3
              </div>
              <span className="hidden sm:inline">Schedule & Confirm</span>
            </div>
          </div>
        </Card>

        {/* Validation Error Alert Banner */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1 — VEHICLE SELECTION */}
        {currentStep === 1 && (
          <Card className="space-y-6 bg-[#12121e]/80 border-white/10 rounded-[28px] p-6 sm:p-8">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-400" /> Step 1: Vehicle Selection & Seats
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Car Option */}
              <button
                type="button"
                onClick={() => setVehicleType('CAR')}
                className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${
                  vehicleType === 'CAR'
                    ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-[1.02]'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <Car className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">Car Commute</div>
                  <div className="text-[10px] opacity-80">1 to 6 Seats Available</div>
                </div>
              </button>

              {/* Bike Option */}
              <button
                type="button"
                onClick={() => {
                  setVehicleType('BIKE');
                  setTotalSeats(1);
                }}
                className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${
                  vehicleType === 'BIKE'
                    ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.02]'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <Bike className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">Bike Ride</div>
                  <div className="text-[10px] opacity-80">1 Passenger Seat Max</div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vehicle Make"
                required
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                placeholder="e.g. Honda, Hero, Maruti"
              />
              <Input
                label="Vehicle Model"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Civic, Activa, Swift"
              />
              <Input
                label="Vehicle Color"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                placeholder="e.g. Silver, Black, White"
              />
              <Input
                label="Registration Number"
                required
                value={vehicleRegistration}
                onChange={(e) => setVehicleRegistration(e.target.value.toUpperCase())}
                placeholder="e.g. PB-08-AB-1234"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-white/50">
                Available Passenger Seats ({vehicleType === 'BIKE' ? '1 Max for Bike' : '1 to 6 Seats'})
              </label>
              <input
                type="number"
                min={1}
                max={vehicleType === 'BIKE' ? 1 : 6}
                value={totalSeats}
                onChange={(e) => setTotalSeats(Math.min(vehicleType === 'BIKE' ? 1 : 6, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/10 transition-all"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/25 px-8"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Route
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2 — ROUTE SELECTION */}
        {currentStep === 2 && (
          <Card className="space-y-6 bg-[#12121e]/80 border-white/10 rounded-[28px] p-6 sm:p-8">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" /> Step 2: Route Autocomplete & Service Area
              </h2>
            </div>

            {/* University Service Region Notice */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs space-y-1 backdrop-blur-sm">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" /> Allowed University Service Boundary (LPU / Punjab Region)
              </div>
              <p className="text-white/60 text-[11px] leading-relaxed">
                Locations outside the university service region are not supported. All pickup and dropoff points must fall within official campus commute boundaries.
              </p>
            </div>

            {/* Location Autocomplete Inputs */}
            <div className="space-y-4">
              <LocationPicker
                label="Pickup / Departure Origin"
                placeholder="Type pickup landmark or campus gate..."
                initialName={originName}
                initialLat={originLat}
                initialLng={originLng}
                onSelectLocation={(name, lat, lng) => {
                  setOriginName(name);
                  setOriginLat(lat.toString());
                  setOriginLng(lng.toString());
                }}
              />

              <LocationPicker
                label="Drop / Destination"
                placeholder="Type destination landmark..."
                initialName={destName}
                initialLat={destLat}
                initialLng={destLng}
                onSelectLocation={(name, lat, lng) => {
                  setDestName(name);
                  setDestLat(lat.toString());
                  setDestLng(lng.toString());
                }}
              />
            </div>

            {/* Map Selection Option (Method B) */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white/80">Interactive Map Location Selection</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMapPickerModal(true)}
                  leftIcon={<MapPin className="w-3.5 h-3.5 text-indigo-400" />}
                >
                  Expand Interactive Map
                </Button>
              </div>
              <Map origin={originPoint} destination={destPoint} height="240px" />
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="hover:bg-white/5"
              >
                Back to Vehicle
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/25 px-8"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Schedule
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3 — SCHEDULE & CONFIRMATION SUMMARY */}
        {currentStep === 3 && (
          <form onSubmit={handlePublishRide} className="space-y-6">
            <Card className="space-y-6 bg-[#12121e]/80 border-white/10 rounded-[28px] p-6 sm:p-8">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Step 3: Schedule & Route Summary Review
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-white/50">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/10 transition-all [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-white/50">Departure Time</label>
                  <input
                    type="time"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/10 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Final Summary Card Before Publishing */}
              <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                  📋 Ride Offer Summary Review
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-white/40">Vehicle Info:</span>
                    <div className="font-bold text-white">
                      {vehicleType === 'CAR' ? '🚗 Car' : '🏍️ Bike'} • {vehicleMake} {vehicleModel} ({vehicleColor})
                    </div>
                    <div className="font-mono text-[11px] text-white/40">Reg: {vehicleRegistration}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-white/40">Seat Capacity:</span>
                    <div className="font-bold text-indigo-400">
                      {totalSeats} Available Passenger Seat(s)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-white/40">Pickup Origin:</span>
                    <div className="font-bold text-white">{originName}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-white/40">Drop Destination:</span>
                    <div className="font-bold text-white">{destName}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-white/40">Schedule:</span>
                    <div className="font-bold text-white">
                      {new Date(`${departureDate}T${departureTime}`).toLocaleString()}
                    </div>
                  </div>
                </div>

                <Map origin={originPoint} destination={destPoint} height="200px" />
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="hover:bg-white/5 border-white/10 text-white/70"
                >
                  Back to Route
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] px-8 font-bold tracking-wide transition-all duration-300"
                  size="lg"
                  isLoading={loading}
                  rightIcon={<Check className="w-5 h-5 text-indigo-100" />}
                >
                  Publish Ride
                </Button>
              </div>
            </Card>
          </form>
        )}

        {/* MAP PICKER MODAL (Method B) */}
        <Modal
          isOpen={showMapPickerModal}
          onClose={() => setShowMapPickerModal(false)}
          title="Interactive Map Location Selector"
        >
          <div className="space-y-4 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActivePickerTarget('PICKUP')}
                className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition ${
                  activePickerTarget === 'PICKUP'
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                📍 Pickup Target
              </button>
              <button
                type="button"
                onClick={() => setActivePickerTarget('DROP')}
                className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition ${
                  activePickerTarget === 'DROP'
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                🎯 Drop Target
              </button>
            </div>

            <Map origin={originPoint} destination={destPoint} height="300px" />

            <div className="p-4 bg-white/5 rounded-xl space-y-1">
              <div className="text-white/70">Pickup Coordinates: <strong className="text-white">{originLat}, {originLng}</strong></div>
              <div className="text-white/70">Destination Coordinates: <strong className="text-white">{destLat}, {destLng}</strong></div>
            </div>

            <Button
              className="bg-indigo-500 hover:bg-indigo-600 text-white w-full rounded-xl"
              size="md"
              onClick={() => setShowMapPickerModal(false)}
            >
              Confirm Location on Map
            </Button>
          </div>
        </Modal>

        {/* POST-PUBLISH SUCCESS MODAL */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => router.push('/driver')}
          title="🎉 Ride Published Successfully!"
        >
          <div className="space-y-4 text-xs text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <p className="text-white/60 max-w-xs mx-auto text-sm leading-relaxed">
              Your ride offer from <strong className="text-white">{originName}</strong> to <strong className="text-white">{destName}</strong> has been published and is now visible on the proximity matching engine.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                size="md"
                className="flex-1 hover:bg-white/5"
                onClick={() => router.push('/driver')}
              >
                Back to Dashboard
              </Button>

              <Button
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg"
                size="md"
                onClick={() => router.push(`/driver/requests?rideId=${publishedRideId}`)}
              >
                View Ride Requests
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </WorkspaceLayout>
  );
}
