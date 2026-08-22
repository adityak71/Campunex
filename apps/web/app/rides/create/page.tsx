'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Car, Bike, Navigation2, Calendar, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CreateRidePage() {
  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE'>('CAR');
  const [vehicleMake, setVehicleMake] = useState('Honda');
  const [vehicleModel, setVehicleModel] = useState('Civic / Activa');
  const [vehicleColor, setVehicleColor] = useState('Silver');
  const [vehicleRegistration, setVehicleRegistration] = useState('PB-08-AB-1234');

  const [originName, setOriginName] = useState('LPU Main Gate');
  const [originLat, setOriginLat] = useState('31.2536');
  const [originLng, setOriginLng] = useState('75.7037');

  const [destName, setDestName] = useState('Jalandhar City Railway Station');
  const [destLat, setDestLat] = useState('31.3260');
  const [destLng, setDestLng] = useState('75.5762');

  const [departureTime, setDepartureTime] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [totalSeats, setTotalSeats] = useState(4);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    setShowConfirmModal(false);
    setError('');
    setLoading(true);

    try {
      await apiRequest('/rides', {
        method: 'POST',
        body: JSON.stringify({
          origin_name: originName,
          destination_name: destName,
          origin: { latitude: parseFloat(originLat), longitude: parseFloat(originLng) },
          destination: { latitude: parseFloat(destLat), longitude: parseFloat(destLng) },
          departure_time: new Date(departureTime).toISOString(),
          total_seats: totalSeats,
        }),
      });

      showToast('Ride published successfully! Ready to accept rider requests.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to create ride';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const originPoint = { latitude: parseFloat(originLat), longitude: parseFloat(originLng) };
  const destPoint = { latitude: parseFloat(destLat), longitude: parseFloat(destLng) };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="space-y-2">
          <Badge variant="info">DRIVER RIDE OFFER</Badge>
          <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight">
            Offer a Campus Ride
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish your route and share available vehicle seats with verified campus commuters
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Vehicle Selection */}
          <Card className="space-y-4">
            <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
              1. Vehicle Type & Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setVehicleType('CAR'); setTotalSeats(4); }}
                className={`p-4 rounded-2xl border transition text-center space-y-2 ${
                  vehicleType === 'CAR'
                    ? 'bg-[#e0f2fe] dark:bg-cyan-950/80 border-teal-500 text-[#1e3a8a] dark:text-cyan-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Car className="w-6 h-6 mx-auto text-teal-600 dark:text-cyan-400" />
                <div className="text-xs font-bold">Car Commute (1-6 Seats)</div>
              </button>

              <button
                type="button"
                onClick={() => { setVehicleType('BIKE'); setTotalSeats(1); }}
                className={`p-4 rounded-2xl border transition text-center space-y-2 ${
                  vehicleType === 'BIKE'
                    ? 'bg-[#e0f2fe] dark:bg-cyan-950/80 border-teal-500 text-[#1e3a8a] dark:text-cyan-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bike className="w-6 h-6 mx-auto text-teal-600 dark:text-cyan-400" />
                <div className="text-xs font-bold">Bike Ride (1 Seat)</div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Vehicle Make & Model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="Honda Civic"
              />
              <Input
                label="Vehicle Registration Number"
                value={vehicleRegistration}
                onChange={(e) => setVehicleRegistration(e.target.value)}
                placeholder="PB-08-AB-1234"
              />
            </div>
          </Card>

          {/* 2. Route Autocomplete */}
          <Card className="space-y-6">
            <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
              2. Route Location Autocomplete
            </h2>

            <LocationPicker
              label="Departure Origin Address / Landmark"
              placeholder="Type departure location (e.g., LPU Main Gate)..."
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
              label="Destination Address / Landmark"
              placeholder="Type destination location (e.g., Jalandhar Railway Station)..."
              initialName={destName}
              initialLat={destLat}
              initialLng={destLng}
              onSelectLocation={(name, lat, lng) => {
                setDestName(name);
                setDestLat(lat.toString());
                setDestLng(lng.toString());
              }}
            />

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Route Map Preview</label>
              <Map origin={originPoint} destination={destPoint} height="240px" />
            </div>
          </Card>

          {/* 3. Schedule & Seats */}
          <Card className="space-y-4">
            <h2 className="text-xs font-bold text-[#1e3a8a] dark:text-cyan-300 uppercase tracking-wider">
              3. Schedule & Seat Capacity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <Input
                label="Available Passenger Seats"
                type="number"
                min={1}
                max={6}
                value={totalSeats}
                onChange={(e) => setTotalSeats(parseInt(e.target.value, 10))}
              />
            </div>
          </Card>

          <Button
            type="submit"
            variant="teal"
            size="lg"
            isLoading={loading}
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Review & Publish Campus Ride
          </Button>
        </form>

        {/* Confirmation Dialog */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Campus Ride Offer"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to offer <strong>{totalSeats} seat(s)</strong> from <strong>{originName}</strong> to <strong>{destName}</strong>?
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <div>Vehicle: <strong>{vehicleType} ({vehicleModel})</strong></div>
              <div>Departure: <strong>{new Date(departureTime).toLocaleString()}</strong></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={handleConfirmPublish}
                className="flex-1"
              >
                Confirm & Publish
              </Button>
            </div>
          </div>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
