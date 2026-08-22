'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Bell,
  Navigation2,
  Clock,
  Car,
  Bike,
  Pause,
  Play,
  Trash2,
  Edit2,
  CheckCircle2,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface RideAlert {
  id: string;
  origin_name: string;
  destination_name: string;
  target_date: string;
  time_window: string;
  vehicle_preference: 'ANY' | 'CAR' | 'BIKE';
  status: 'ACTIVE' | 'PAUSED' | 'TRIGGERED' | 'EXPIRED';
  created_at: string;
}

const INITIAL_ALERTS: RideAlert[] = [
  {
    id: 'a1',
    origin_name: 'LPU Main Gate, Phagwara',
    destination_name: 'Jalandhar City Railway Station',
    target_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time_window: 'EVENING (5PM - 10PM)',
    vehicle_preference: 'CAR',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a2',
    origin_name: 'LPU Law Gate',
    destination_name: 'Phagwara Junction Railway Station',
    target_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    time_window: 'MORNING (6AM - 12PM)',
    vehicle_preference: 'ANY',
    status: 'TRIGGERED',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'a3',
    origin_name: 'LPU BH-1 Hostels',
    destination_name: 'Chandigarh Sector 17 ISBT',
    target_date: new Date(Date.now() - 432000000).toISOString().slice(0, 10),
    time_window: 'AFTERNOON (12PM - 5PM)',
    vehicle_preference: 'BIKE',
    status: 'EXPIRED',
    created_at: new Date(Date.now() - 518400000).toISOString(),
  },
];

export default function RideAlertsPage() {
  const [alerts, setAlerts] = useState<RideAlert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'TRIGGERED' | 'EXPIRED'>('ACTIVE');
  const [deleteAlertId, setDeleteAlertId] = useState<string | null>(null);
  const [editAlert, setEditAlert] = useState<RideAlert | null>(null);

  const { showToast } = useToast();

  const togglePauseAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          showToast(`Alert ${nextStatus === 'PAUSED' ? 'paused' : 'resumed'} successfully`, 'info');
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const handleDeleteAlert = () => {
    if (!deleteAlertId) return;
    setAlerts((prev) => prev.filter((a) => a.id !== deleteAlertId));
    setDeleteAlertId(null);
    showToast('Ride alert deleted', 'info');
  };

  const handleSaveEditAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAlert) return;
    setAlerts((prev) => prev.map((a) => (a.id === editAlert.id ? editAlert : a)));
    setEditAlert(null);
    showToast('Ride alert preferences updated', 'success');
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === 'ACTIVE') return a.status === 'ACTIVE' || a.status === 'PAUSED';
    if (activeTab === 'TRIGGERED') return a.status === 'TRIGGERED';
    if (activeTab === 'EXPIRED') return a.status === 'EXPIRED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Badge variant="info">AUTOMATED RIDE MONITORING</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
              Ride Availability Alerts
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive notifications automatically when a compatible driver publishes a matching route
            </p>
          </div>

          <Link href="/rides/find">
            <Button variant="teal" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create New Alert
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {(['ACTIVE', 'TRIGGERED', 'EXPIRED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  activeTab === tab
                    ? 'bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-300 border-teal-300 dark:border-cyan-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab === 'ACTIVE' ? 'Active Alerts' : tab === 'TRIGGERED' ? 'Triggered Alerts' : 'Expired Alerts'}
              </button>
            ))}
          </div>
        </Card>

        {/* Alerts Cards Grid */}
        {filteredAlerts.length === 0 ? (
          <EmptyState
            title={`No ${activeTab.toLowerCase()} ride alerts`}
            description="Set automated alerts when searching for rides to monitor future driver route publishes."
            action={
              <Link href="/rides/find">
                <Button variant="teal" size="sm">Search & Set Alert</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} hoverable className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Navigation2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>{alert.origin_name} ➔ {alert.destination_name}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Target Date: <strong>{alert.target_date}</strong> ({alert.time_window})</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      alert.status === 'ACTIVE'
                        ? 'success'
                        : alert.status === 'TRIGGERED'
                        ? 'info'
                        : alert.status === 'PAUSED'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {alert.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>Vehicle: <strong>{alert.vehicle_preference}</strong></div>
                  <div>Proximity: <strong>500m Match Engine</strong></div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2">
                    {alert.status !== 'EXPIRED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePauseAlert(alert.id)}
                        leftIcon={alert.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      >
                        {alert.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditAlert(alert)}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteAlertId(alert.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteAlertId}
          onClose={() => setDeleteAlertId(null)}
          title="Delete Ride Availability Alert?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this ride availability alert? You will no longer receive notifications when matching drivers publish routes.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteAlertId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAlert}
                className="flex-1"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Alert Modal */}
        <Modal
          isOpen={!!editAlert}
          onClose={() => setEditAlert(null)}
          title="Edit Ride Availability Alert"
        >
          {editAlert && (
            <form onSubmit={handleSaveEditAlert} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Target Commute Date</label>
                <input
                  type="date"
                  required
                  value={editAlert.target_date}
                  onChange={(e) => setEditAlert({ ...editAlert, target_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Vehicle Preference</label>
                <select
                  value={editAlert.vehicle_preference}
                  onChange={(e) => setEditAlert({ ...editAlert, vehicle_preference: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="ANY">ANY Vehicle</option>
                  <option value="CAR">Car Commute Only</option>
                  <option value="BIKE">Bike Ride Only</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditAlert(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
