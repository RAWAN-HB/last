import React, { useState, useEffect } from 'react';
import {
  UserCheck, Mail, Search, Check, X, Briefcase,
  Loader2, Clock, AlertCircle, ChevronRight, MapPin, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { companyAPI, offersAPI } from '../../services/api';

export const SupervisorManagement: React.FC = () => {
  const [searchTerm, setSearchTerm]                 = useState('');
  const [activeTab, setActiveTab]                   = useState<'requests' | 'approved'>('requests');
  const [requests, setRequests]                     = useState<any[]>([]);
  const [approved, setApproved]                     = useState<any[]>([]);
  const [myOffers, setMyOffers]                     = useState<any[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [processingId, setProcessingId]             = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal]       = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [selectedOfferId, setSelectedOfferId]       = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reqRes, appRes, offersRes] = await Promise.all([
        companyAPI.getSupervisorRequests(),
        companyAPI.getApprovedSupervisors(),
        offersAPI.getMyOffers(),
      ]);
      setRequests(reqRes.data || []);
      setApproved(appRes.data || []);
      // Only show published or pending offers for assignment
      setMyOffers((offersRes.data || []).filter(
        (o: any) => o.status === 'published' || o.status === 'pending'
      ));
    } catch {
      toast.error('Failed to load supervisors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await companyAPI.approveSupervisor(id);
      const sup = requests.find(r => r._id === id);
      setRequests(prev => prev.filter(r => r._id !== id));
      if (sup) setApproved(prev => [{ ...sup, isApproved: true }, ...prev]);
      toast.success('Supervisor approved! They can now login.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject and remove this supervisor request?')) return;
    setProcessingId(id);
    try {
      await companyAPI.rejectSupervisor(id);
      setRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Supervisor rejected');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const openAssignModal = (supervisor: any) => {
    setSelectedSupervisor(supervisor);
    setSelectedOfferId(supervisor.assignedOfferId || '');
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedSupervisor || !selectedOfferId) {
      toast.error('Please select an internship');
      return;
    }
    try {
      await companyAPI.assignSupervisorToOffer(selectedSupervisor._id, selectedOfferId);
      // Update local state
      setApproved(prev => prev.map(s =>
        s._id === selectedSupervisor._id
          ? { ...s, assignedOfferId: selectedOfferId }
          : s
      ));
      const offer = myOffers.find(o => o._id === selectedOfferId);
      toast.success(`${selectedSupervisor.name} assigned to "${offer?.jobTitle}"!`);
      setShowAssignModal(false);
      setSelectedSupervisor(null);
      setSelectedOfferId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const filterList = (list: any[]) =>
    list.filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Supervisor Management</h1>
        <p className="text-slate-500 font-medium">Review requests and assign supervisors to your internships</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Pending Requests', value: requests.length, icon: Clock,     color: 'amber'   },
          { label: 'Approved',         value: approved.length, icon: UserCheck, color: 'emerald' },
          { label: 'My Offers',        value: myOffers.length, icon: Briefcase, color: 'indigo'  },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-4`}>
              <s.icon className={`w-6 h-6 text-${s.color}-600`} />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'requests', label: `Pending Requests (${requests.length})` },
          { id: 'approved', label: `Approved Supervisors (${approved.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {tab.label}
            {tab.id === 'requests' && requests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all" />
        </div>
      </div>

      {/* ── PENDING REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Supervisor Registration Requests
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Supervisors who selected your company during registration
            </p>
          </div>

          {filterList(requests).length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">No pending requests</p>
              <p className="text-sm mt-1">New supervisor registrations will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filterList(requests).map(sup => (
                <div key={sup._id} className="p-6 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                    {sup.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900">{sup.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Mail size={12} />{sup.email}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Requested: {new Date(sup.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    ⏳ Pending
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(sup._id)}
                      disabled={processingId === sup._id}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2">
                      {processingId === sup._id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Check size={14} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(sup._id)}
                      disabled={processingId === sup._id}
                      className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all disabled:opacity-50 flex items-center gap-2">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── APPROVED SUPERVISORS ── */}
      {activeTab === 'approved' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Approved Supervisors
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Assign each supervisor to one of your internship offers
            </p>
          </div>

          {filterList(approved).length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">No approved supervisors yet</p>
              <p className="text-sm mt-1">Approve requests from the Pending tab first</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filterList(approved).map(sup => {
                const assignedOffer = myOffers.find(o => o._id === sup.assignedOfferId);
                return (
                  <div key={sup._id} className="p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                      {sup.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900">{sup.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Mail size={12} />{sup.email}
                      </p>
                      {/* Show assigned offer */}
                      {assignedOffer ? (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Briefcase size={10} /> {assignedOffer.jobTitle}
                          </span>
                          <span className="text-xs text-slate-400">
                            {assignedOffer.location} · {assignedOffer.duration}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-500 font-bold mt-2">
                          ⚠️ Not assigned to any internship yet
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        ✓ Active
                      </span>
                      <button
                        onClick={() => openAssignModal(sup)}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2">
                        <Briefcase size={14} />
                        {assignedOffer ? 'Reassign' : 'Assign Internship'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ASSIGN INTERNSHIP MODAL ── */}
      {showAssignModal && selectedSupervisor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-[200px]"
          onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl">
                  {selectedSupervisor.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Assign Internship</h2>
                  <p className="text-slate-500 text-sm">For: <strong>{selectedSupervisor.name}</strong></p>
                </div>
              </div>

              {myOffers.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No internships available</p>
                  <p className="text-sm mt-1">Create internship offers first from the Internships tab</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    Select an internship:
                  </p>
                  {myOffers.map(offer => (
                    <label key={offer._id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedOfferId === offer._id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}>
                      <input type="radio" name="offer" value={offer._id}
                        checked={selectedOfferId === offer._id}
                        onChange={() => setSelectedOfferId(offer._id)}
                        className="mt-1 w-4 h-4 text-indigo-600" />
                      <div className="flex-1">
                        <p className="font-black text-slate-900">{offer.jobTitle}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />{offer.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />{offer.duration}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            offer.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {offer.status}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssign}
                  disabled={!selectedOfferId || myOffers.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Check size={16} /> Assign Supervisor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};