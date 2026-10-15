'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Card, { CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { apiRequest } from '../../../lib/api';
import {
  Car,
  ShieldCheck,
  CreditCard,
  Calendar,
  Phone,
  Palette,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function DriverOnboardingPage() {
  const [formData, setFormData] = useState({
    phone_number: '',
    dob: '',
    aadhaar_number: '',
    driving_license_number: '',
    rc_number: '',
    vehicle_number: '',
    vehicle_make: 'Maruti Suzuki',
    vehicle_model: '',
    vehicle_color: 'White',
  });
  const [loading, setLoading] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    async function checkCurrentProfile() {
      try {
        const res = await apiRequest('/driver/profile');
        if (res.profile) {
          setExistingStatus(res.profile.approval_status);
          setFormData({
            phone_number: res.profile.phone_number || '',
            dob: res.profile.dob ? new Date(res.profile.dob).toISOString().slice(0, 10) : '',
            aadhaar_number: res.profile.aadhaar_number || '',
            driving_license_number: res.profile.driving_license_number || '',
            rc_number: res.profile.rc_number || '',
            vehicle_number: res.profile.vehicle_number || '',
            vehicle_make: res.profile.vehicle_make || 'Maruti Suzuki',
            vehicle_model: res.profile.vehicle_model || '',
            vehicle_color: res.profile.vehicle_color || 'White',
          });
        }
      } catch (err) {
        // No profile yet, proceed with onboarding
      }
    }
    checkCurrentProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validations
    const cleanPhone = formData.phone_number.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile phone number.');
      return;
    }

    const cleanAadhaar = formData.aadhaar_number.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setError('Aadhaar number must be exactly 12 digits.');
      return;
    }

    if (!formData.driving_license_number.trim()) {
      setError('Driving License number is required for verification.');
      return;
    }

    if (!formData.rc_number.trim()) {
      setError('Vehicle Registration Certificate (RC) number is required.');
      return;
    }

    if (!formData.vehicle_number.trim()) {
      setError('Vehicle registration number is required (e.g. PB-08-AB-1234).');
      return;
    }

    if (!formData.vehicle_model.trim()) {
      setError('Vehicle model is required (e.g. Swift, Activa, i20).');
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/driver/profile', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: cleanPhone,
          dob: formData.dob,
          aadhaar_number: cleanAadhaar,
          driving_license_number: formData.driving_license_number.trim().toUpperCase(),
          rc_number: formData.rc_number.trim().toUpperCase(),
          vehicle_number: formData.vehicle_number.trim().toUpperCase(),
          vehicle_make: formData.vehicle_make.trim(),
          vehicle_model: formData.vehicle_model.trim(),
          vehicle_color: formData.vehicle_color.trim(),
        }),
      });

      showToast('Driver details submitted! Status: Pending Admin Verification.', 'success');
      router.push('/driver');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to submit driver documents';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d1c] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-[650px] p-8 md:p-10 !rounded-[28px] border-white/10 bg-[#12162e]/90 shadow-2xl">
          <CardBody className="!p-0 space-y-7">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mandatory Driver KYC Verification
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Driver & Vehicle Registration
              </h1>
              <p className="text-xs text-white/60">
                To ensure campus passenger safety, all drivers must register their government ID and authorized campus vehicle.
              </p>
            </div>

            {existingStatus === 'PENDING' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Application Pending Review</span>
                  <p className="text-amber-300/80">
                    Your details are currently in the verification queue. Admin approval usually takes 24-48 hours. You may update your info below if needed.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Personal Identification */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-accent1 uppercase tracking-wider border-b border-white/10 pb-1">
                  1. Driver Identification
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="tel"
                        required
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20 text-sm"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all text-sm [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Aadhaar Card Number (12 Digits)</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={formData.aadhaar_number}
                        onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20 text-sm"
                        placeholder="1234 5678 9012"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Driving License (DL) Number</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="text"
                        required
                        value={formData.driving_license_number}
                        onChange={(e) => setFormData({ ...formData, driving_license_number: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono uppercase focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20 text-sm tracking-wider"
                        placeholder="DL-0420110012345"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-white/40">Stored securely and strictly verified by campus administration for passenger safety compliance.</p>
              </div>

              {/* Section 2: Vehicle Details */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold text-accent1 uppercase tracking-wider border-b border-white/10 pb-1 flex justify-between items-center">
                  <span>2. Vehicle Specifications</span>
                  <span className="text-[10px] text-white/50 lowercase">reused & locked during ride creation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">License Plate / Vehicle Number</label>
                    <div className="relative">
                      <Car className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="text"
                        required
                        value={formData.vehicle_number}
                        onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono uppercase focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20 text-sm tracking-wider"
                        placeholder="PB-08-AB-1234"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Registration Certificate (RC) Number</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="text"
                        required
                        value={formData.rc_number}
                        onChange={(e) => setFormData({ ...formData, rc_number: e.target.value.toUpperCase() })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono uppercase focus:outline-none focus:border-accent1/50 focus:ring-1 focus:ring-accent1/50 transition-all placeholder:text-white/20 text-sm tracking-wider"
                        placeholder="RC-PB-08-AB-1234"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Make / Brand</label>
                    <select
                      value={formData.vehicle_make}
                      onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-3 text-white text-xs focus:outline-none focus:border-accent1/50"
                    >
                      <option value="Maruti Suzuki">Maruti Suzuki</option>
                      <option value="Honda">Honda</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Tata">Tata</option>
                      <option value="Hero">Hero</option>
                      <option value="Bajaj">Bajaj</option>
                      <option value="Royal Enfield">Royal Enfield</option>
                      <option value="Yamaha">Yamaha</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Model</label>
                    <input
                      type="text"
                      required
                      value={formData.vehicle_model}
                      onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white text-xs focus:outline-none focus:border-accent1/50 placeholder:text-white/20"
                      placeholder="Swift / Activa / i20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-white/90">Vehicle Color</label>
                    <select
                      value={formData.vehicle_color}
                      onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-3 text-white text-xs focus:outline-none focus:border-accent1/50"
                    >
                      <option value="White">White</option>
                      <option value="Silver">Silver</option>
                      <option value="Grey">Grey</option>
                      <option value="Black">Black</option>
                      <option value="Red">Red</option>
                      <option value="Blue">Blue</option>
                      <option value="Yellow">Yellow</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  leftIcon={<ShieldCheck className="w-4 h-4 shrink-0" />}
                  rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
                  className="w-full !rounded-xl py-3.5 font-bold"
                >
                  Submit Documents for Admin Verification
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
