'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { Building, Plus, Search, CheckCircle, Trash2, Power } from 'lucide-react';

const INITIAL_UNIVS = [
  { id: 'u1', name: 'Lovely Professional University', domain: 'lpu.in', users: 2341, status: 'ACTIVE' },
  { id: 'u2', name: 'IIT Delhi', domain: 'iitd.ac.in', users: 3012, status: 'ACTIVE' },
  { id: 'u3', name: 'BITS Pilani', domain: 'bits-pilani.ac.in', users: 1876, status: 'ACTIVE' },
  { id: 'u4', name: 'Delhi University', domain: 'du.ac.in', users: 4521, status: 'ACTIVE' },
  { id: 'u5', name: 'Manipal University', domain: 'manipal.edu', users: 1234, status: 'ACTIVE' },
  { id: 'u6', name: 'State College Campus', domain: 'college.edu', users: 987, status: 'ACTIVE' },
];

export default function AdminUniversitiesPage() {
  const [univs, setUnivs] = useState(INITIAL_UNIVS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const { showToast } = useToast();

  const handleAddUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDomain) return;

    const newUniv = {
      id: `u${Date.now()}`,
      name: newName,
      domain: newDomain.toLowerCase().replace('@', ''),
      users: 0,
      status: 'ACTIVE',
    };

    setUnivs((prev) => [newUniv, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewDomain('');
    showToast(`Added ${newName} (@${newUniv.domain}) to permitted domains`, 'success');
  };

  const handleToggleStatus = (id: string) => {
    setUnivs((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : u))
    );
    showToast('Campus domain status updated', 'info');
  };

  const handleDeleteUniv = (id: string) => {
    setUnivs((prev) => prev.filter((u) => u.id !== id));
    showToast('Removed campus domain permission', 'error');
  };

  const filtered = univs.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Badge variant="info">CAMPUS DOMAIN CONTROL</Badge>
            <h1 className="text-3xl font-extrabold text-[#1e3a8a] dark:text-cyan-300 tracking-tight mt-1">
              University Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage permitted campus email domains for institutional identity verification
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            variant="teal"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Campus Domain
          </Button>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
          <Link href="/admin" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Dashboard
          </Link>
          <Link href="/admin/universities" className="px-3.5 py-2 bg-[#1e3a8a] text-white rounded-xl shadow-sm">
            Universities
          </Link>
          <Link href="/admin/users" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Users
          </Link>
          <Link href="/admin/verification" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Verification Queue
          </Link>
          <Link href="/admin/rides" className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition">
            Ride Monitoring
          </Link>
        </div>

        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-base font-bold text-[#1e3a8a] dark:text-cyan-300">Permitted Institutions ({filtered.length})</h2>
            <div className="w-full sm:w-64">
              <Input
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search domain..."
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Institution Name</th>
                  <th className="p-3">Email Domain</th>
                  <th className="p-3">Registered Users</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((univ) => (
                  <tr key={univ.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{univ.name}</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">@{univ.domain}</td>
                    <td className="p-3 font-bold text-[#1e3a8a] dark:text-cyan-400">{univ.users.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge variant={univ.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {univ.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(univ.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Toggle Status"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUniv(univ.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Domain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add University Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Permitted Campus Domain"
        >
          <form onSubmit={handleAddUniversity} className="space-y-4">
            <Input
              label="University Name"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Stanford University"
            />
            <Input
              label="Email Domain"
              required
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. stanford.edu"
              helperText="Without @ symbol"
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="teal" size="sm" type="submit" className="flex-1">
                Add Domain
              </Button>
            </div>
          </form>
        </Modal>
      </main>

      <Footer />
    </div>
  );
}
