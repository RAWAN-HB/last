import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search, MapPin, Briefcase, Calendar, Send,
  ChevronRight, LayoutGrid, List, SlidersHorizontal,
  GraduationCap, Building2, Clock, CheckCircle2,
  X, Sparkles, Loader2, DollarSign, Download,
  FileText, UserCheck, AlertCircle, RefreshCw,
  TrendingUp, Award, ClipboardList, Star
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { motion } from 'motion/react';
import { offersAPI, applicationsAPI, studentAPI, conventionsAPI } from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface Offer {
  _id: string;
  jobTitle: string;
  department: string;
  location: string;
  workType: string;
  duration: string;
  salary?: string;
  numberOfPositions: number;
  internshipType: string;
  domain: string;
  educationLevel: string;
  requiredSkills: string[];
  description: string;
  company: { _id: string; name: string; email: string };
  applicationDeadline: string;
  startDate: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  hasActiveConvention: boolean;
  conventionStatus: string | null;
  recentApplications: any[];
}

export const StudentPortal: React.FC<{
  onApply: (job: { title: string; company: string }) => void;
}> = ({ onApply }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'browse' | 'applications' | 'dashboard' | 'convention'>('browse');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [motivation, setMotivation] = useState('');
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [myConventions, setMyConventions] = useState<any[]>([]);
  const [conventionsLoading, setConventionsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  const userName = localStorage.getItem('userName') || 'Student';
  const userEmail = localStorage.getItem('userEmail') || '';

  // ─── DATA FETCHING ───────────────────────────────────────────────────────────

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await offersAPI.list({ limit: 50 });
      setOffers(res.data?.offers || res.data || []);
    } catch (err) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await studentAPI.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await applicationsAPI.getMyApplications();
      setMyApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await offersAPI.getDomains();
      setDomains(res.data || []);
    } catch (err) {
      console.error('Failed to load domains:', err);
    }
  };

  // FIX: Dedicated convention fetcher with loading state
  const fetchMyConventions = useCallback(async (silent = false) => {
    if (!silent) setConventionsLoading(true);
    try {
      const res = await conventionsAPI.getMy();
      const data = res.data || [];
      // Normalize: handle both array and single-object responses
      setMyConventions(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      if (!silent) {
        // 404 just means no convention yet — not an error
        if (err?.response?.status !== 404) {
          toast.error('Failed to load conventions');
        }
        setMyConventions([]);
      }
    } finally {
      if (!silent) setConventionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    fetchDashboard();
    fetchMyApplications();
    fetchDomains();
    fetchMyConventions();
  }, [fetchMyConventions]);

  // FIX: Auto-refresh conventions when tab becomes active
  useEffect(() => {
    if (activeTab === 'convention') {
      fetchMyConventions(true);
    }
    if (activeTab === 'dashboard') {
      fetchDashboard();
    }
  }, [activeTab, fetchMyConventions]);

  // FIX: Poll for convention updates every 30s when on convention tab
  useEffect(() => {
    if (activeTab !== 'convention') return;
    const interval = setInterval(() => fetchMyConventions(true), 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchMyConventions]);

  // ─── DOWNLOADS ───────────────────────────────────────────────────────────────

  const handleDownloadConvention = async (conventionId: string) => {
    setDownloadingId(conventionId);
    const toastId = toast.loading('Generating official document...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/conventions/my/${conventionId}/download`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Convention_Stage_${userName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Convention downloaded!', { id: toastId });
    } catch (err) {
      toast.error('Download failed. Please try again.', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadCertificate = async (applicationId: string) => {
    setDownloadingCertId(applicationId);
    const toastId = toast.loading('Generating certificate...');
    try {
      const response = await fetch(
        `http://localhost:5000/api/conventions/application/${applicationId}/certificate`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (!response.ok) throw new Error('Failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${userName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!', { id: toastId });
    } catch {
      toast.error('Failed to download certificate', { id: toastId });
    } finally {
      setDownloadingCertId(null);
    }
  };

  // ─── APPLICATION ACTIONS ─────────────────────────────────────────────────────

  const handleApply = async () => {
    if (!selectedOffer) return;
    if (!cvFile) { toast.error('Please upload your CV'); return; }
    if (!motivation.trim()) { toast.error('Please write a motivation statement'); return; }

    setApplyingId(selectedOffer._id);
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      formData.append('motivationStatement', motivation);
      formData.append('fullName', userName);
      formData.append('email', userEmail);

      await applicationsAPI.apply(selectedOffer._id, formData);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      setCvFile(null);
      setMotivation('');
      fetchMyApplications();
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplyingId(null);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await applicationsAPI.withdraw(id);
      setMyApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application withdrawn');
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cannot withdraw this application');
    }
  };

  // ─── UI HELPERS ──────────────────────────────────────────────────────────────

  const openDetailsModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const isExpiredOffer = (offer: Offer) =>
    new Date(offer.applicationDeadline) < new Date();

  const filteredOffers = offers.filter(offer => {
    if (isExpiredOffer(offer)) return false;
    const matchSearch =
      offer.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
      offer.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      offer.domain?.toLowerCase().includes(search.toLowerCase());
    const matchLocation = !locationFilter ||
      offer.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchDomain = !domainFilter ||
      offer.domain?.toLowerCase().includes(domainFilter.toLowerCase());
    const matchType =
      selectedFilters.length === 0 || selectedFilters.includes(offer.internshipType);
    return matchSearch && matchLocation && matchDomain && matchType;
  });

  const getStatusVariant = (status: string) => {
    if (status === 'accepted') return 'bg-emerald-100 text-emerald-700 border-emerald-200 font-bold';
    if (status === 'pending_admin_approval') return 'bg-amber-100 text-amber-700 border-amber-200 font-bold';
    if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200 font-bold';
    return 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pending Review',
      pending_admin_approval: 'Under Approval',
      accepted: 'Accepted ✓',
      rejected: 'Rejected',
    };
    return map[status] ?? status;
  };

  const getConventionStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; border: string }> = {
      pending:   { label: 'Pending Review',    color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
      approved:  { label: 'Approved ✓',        color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      rejected:  { label: 'Rejected',          color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
      generated: { label: 'Ready to Download', color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
    };
    return configs[status] ?? { label: status, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };
  };

  const toggleFilter = (type: string) => {
    setSelectedFilters(prev =>
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    );
  };

  const tabs = [
    { id: 'browse',       label: '🔍 Browse Offers' },
    { id: 'applications', label: '📋 My Applications' },
    { id: 'convention',   label: '📄 My Convention' },
    { id: 'dashboard',    label: '📊 My Dashboard' },
  ];

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex pt-[100px]">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 bg-white border-r border-slate-200 flex-col p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Menu</h2>
        </div>

        <div className="flex flex-col gap-1 mb-8">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}>
              {tab.label}
              {tab.id === 'convention' && myConventions.length > 0 && (
                <span className="ml-2 bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {myConventions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Internship Type</h3>
              <div className="space-y-2">
                {['PFE', 'graduation', 'seasonal', 'part-time', 'academic'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter(type)}>
                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                      selectedFilters.includes(type) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'
                    }`}>
                      {selectedFilters.includes(type) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-bold capitalize ${selectedFilters.includes(type) ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 min-w-0 lg:p-10">

        {/* ══ BROWSE TAB ══ */}
        {activeTab === 'browse' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Find Your Path</h1>
                <p className="text-slate-500 font-medium">
                  <span className="text-indigo-600 font-bold">{filteredOffers.length}</span> opportunities available
                </p>
              </div>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search by role, company, or domain..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                <Search className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="font-bold text-slate-500 text-lg">No internships found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredOffers.map(offer => (
                  <div key={offer._id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-indigo-500 transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-bold capitalize">
                        {offer.internshipType}
                      </Badge>
                    </div>
                    <h3 className="font-black text-lg mb-1 text-slate-900 leading-tight">{offer.jobTitle}</h3>
                    <p className="text-slate-500 text-sm mb-1 font-medium">{offer.company?.name}</p>
                    <p className="text-slate-400 text-xs mb-4 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {offer.location}
                    </p>
                    <div className="flex gap-2 mb-4">
                      {offer.requiredSkills?.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-medium">{s}</span>
                      ))}
                    </div>
                    <button onClick={() => openDetailsModal(offer)}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ MY APPLICATIONS TAB ══ */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-black text-slate-900">My Applications</h1>
              <span className="text-slate-500 text-sm font-medium">{myApplications.length} total</span>
            </div>

            {myApplications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="font-bold text-slate-500 text-lg">No applications yet</p>
                <p className="text-slate-400 text-sm mt-1">Browse internships and start applying!</p>
              </div>
            ) : (
              myApplications.map(app => (
                <div key={app._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{app.offer?.jobTitle}</h3>
                      <p className="text-slate-500 text-sm font-medium">{app.offer?.company?.name}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusVariant(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                      {app.status === 'pending' && (
                        <button onClick={() => handleWithdraw(app._id)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold underline">
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EVALUATION SECTION */}
                  {app.evaluation?.submittedAt && (
                    <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="text-indigo-600 w-5 h-5" />
                          <span className="font-black text-slate-900 text-sm">Final Evaluation</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          app.evaluation.passed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {app.evaluation.passed ? '✓ PASSED' : '✗ FAILED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Performance', value: app.evaluation.performanceScore },
                          { label: 'Attendance',  value: app.evaluation.attendanceScore },
                          { label: 'Tasks',       value: app.evaluation.tasksScore },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-white rounded-xl p-3 text-center border border-indigo-100">
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mb-1">{label}</p>
                            <p className="font-black text-indigo-600 text-xl">{value}%</p>
                            <div className="mt-2 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {app.evaluation.passed && (
                        <button
                          onClick={() => downloadCertificate(app._id)}
                          disabled={downloadingCertId === app._id}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60"
                        >
                          {downloadingCertId === app._id ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                          ) : (
                            <><Award size={16} /> Download Certificate</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ CONVENTION TAB ══ */}
        {activeTab === 'convention' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-black text-slate-900">My Convention</h1>
                <p className="text-slate-500 font-medium mt-1">Official Internship Agreements</p>
              </div>
              <button
                onClick={() => fetchMyConventions()}
                disabled={conventionsLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${conventionsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="mt-8">
              {conventionsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : myConventions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                  <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="font-bold text-slate-500 text-lg">No convention found</p>
                  <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                    Conventions are generated automatically once your application is approved by the admin.
                  </p>
                  <button
                    onClick={() => fetchMyConventions()}
                    className="mt-4 px-5 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
                  >
                    Check Again
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myConventions.map(conv => {
                    const cfg = getConventionStatusConfig(conv.status);
                    const canDownload = conv.status === 'approved' || conv.status === 'generated';
                    return (
                      <div key={conv._id}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <FileText className="text-indigo-600" size={24} />
                            </div>
                            <div>
                              <h3 className="font-black text-slate-900 text-lg">
                                Convention de Stage
                              </h3>
                              <p className="text-sm text-slate-500 font-medium mt-0.5">
                                {conv.offer?.jobTitle || conv.application?.offer?.jobTitle || 'Internship Agreement'}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {conv.company?.name || conv.application?.offer?.company?.name || ''}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                  {cfg.label}
                                </span>
                                {conv.createdAt && (
                                  <span className="text-xs text-slate-400">
                                    {new Date(conv.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {canDownload ? (
                              <button
                                onClick={() => handleDownloadConvention(conv._id)}
                                disabled={downloadingId === conv._id}
                                className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-lg disabled:opacity-60"
                              >
                                {downloadingId === conv._id ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
                                ) : (
                                  <><Download size={16} /> Download PDF</>
                                )}
                              </button>
                            ) : (
                              <div className="text-center px-5 py-3">
                                <p className="text-xs text-slate-400 font-medium">Available after approval</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress timeline */}
                        <div className="mt-5 pt-5 border-t border-slate-100">
                          <div className="flex items-center gap-0">
                            {[
                              { key: 'created',  label: 'Created' },
                              { key: 'pending',  label: 'Under Review' },
                              { key: 'approved', label: 'Approved' },
                            ].map((step, idx) => {
                              const isActive =
                                (step.key === 'created') ||
                                (step.key === 'pending' && ['pending', 'approved', 'generated'].includes(conv.status)) ||
                                (step.key === 'approved' && ['approved', 'generated'].includes(conv.status));
                              return (
                                <React.Fragment key={step.key}>
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                      {isActive ? '✓' : idx + 1}
                                    </div>
                                    <p className={`text-[10px] mt-1 font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                      {step.label}
                                    </p>
                                  </div>
                                  {idx < 2 && (
                                    <div className={`flex-1 h-0.5 mx-1 mb-4 ${isActive ? 'bg-indigo-300' : 'bg-slate-200'}`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ DASHBOARD TAB ══ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900">My Dashboard</h1>
              <p className="text-slate-500 font-medium mt-1">Welcome back, {userName} 👋</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Applications',
                  value: dashboard?.totalApplications ?? myApplications.length,
                  icon: ClipboardList,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50',
                },
                {
                  label: 'Pending Review',
                  value: dashboard?.pendingApplications ?? myApplications.filter(a => a.status === 'pending').length,
                  icon: Clock,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                },
                {
                  label: 'Accepted',
                  value: dashboard?.acceptedApplications ?? myApplications.filter(a => a.status === 'accepted').length,
                  icon: CheckCircle2,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                },
                {
                  label: 'Rejected',
                  value: dashboard?.rejectedApplications ?? myApplications.filter(a => a.status === 'rejected').length,
                  icon: X,
                  color: 'text-red-600',
                  bg: 'bg-red-50',
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{value ?? 0}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Convention status card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Convention Status
              </h3>
              {myConventions.length > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {myConventions[0].offer?.jobTitle || 'Internship Convention'}
                    </p>
                    <div className="mt-2">
                      {(() => {
                        const cfg = getConventionStatusConfig(myConventions[0].status);
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-black border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('convention')}
                    className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <p className="text-sm text-slate-500 font-medium">
                    No convention yet. Conventions are generated once your application is approved.
                  </p>
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Recent Applications
                </h3>
                {myApplications.length > 3 && (
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {myApplications.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="mx-auto text-slate-300 mb-3" size={36} />
                  <p className="text-slate-500 font-medium text-sm">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.slice(0, 5).map(app => (
                    <div key={app._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{app.offer?.jobTitle}</p>
                          <p className="text-xs text-slate-500">{app.offer?.company?.name}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusVariant(app.status)} text-xs`}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile completion hint */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-lg mb-1">Ready to land your internship?</h4>
                  <p className="text-indigo-100 text-sm font-medium">
                    Browse available offers and submit your application with a strong CV and motivation letter.
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-3 px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-black hover:bg-indigo-50 transition-all"
                  >
                    Browse Internships →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ DETAILS MODAL ══ */}
        {showDetailsModal && selectedOffer && (
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
              <DialogHeader className="p-8 border-b border-slate-200">
                <DialogTitle className="text-2xl font-black text-slate-900">
                  {selectedOffer.jobTitle}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  {selectedOffer.company?.name} • {selectedOffer.location} •{' '}
                  <span className="font-bold text-indigo-600">
                    {selectedOffer.numberOfPositions} position{selectedOffer.numberOfPositions !== 1 ? 's' : ''}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 text-lg">Internship Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-700 text-xs uppercase tracking-wide">Duration</p>
                          <p className="font-semibold">{selectedOffer.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Briefcase className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-700 text-xs uppercase tracking-wide">Work Type</p>
                          <p className="font-semibold">{selectedOffer.workType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-700 text-xs uppercase tracking-wide">Education Level</p>
                          <p className="font-semibold">{selectedOffer.educationLevel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 text-lg">Company Info</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-700 text-xs uppercase tracking-wide">Location</p>
                          <p className="font-semibold text-slate-900">{selectedOffer.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <Building2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-indigo-700 text-xs uppercase tracking-wide">Domain</p>
                          <p className="font-semibold">{selectedOffer.domain}</p>
                        </div>
                      </div>
                      {selectedOffer.salary && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-amber-700 text-xs uppercase tracking-wide">Salary</p>
                            <p className="font-semibold text-slate-900">{selectedOffer.salary}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedOffer.requiredSkills?.length > 0 && (
                  <div className="pt-6 border-t border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4 text-lg">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.requiredSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary"
                          className="px-3 py-1.5 bg-indigo-100 text-indigo-800 border-indigo-200 font-bold">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900 mb-4 text-lg">About This Internship</h4>
                  <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base">
                      {selectedOffer.description || 'No description available.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-2">Application Deadline</p>
                    <p className="text-2xl font-black text-slate-900">
                      {new Date(selectedOffer.applicationDeadline).toLocaleDateString()}
                    </p>
                    <p className={`text-sm font-bold mt-1 ${isExpiredOffer(selectedOffer) ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isExpiredOffer(selectedOffer) ? 'Expired' : 'Still Open'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-2">Posted</p>
                    <p className="text-lg font-black text-slate-900">
                      {new Date(selectedOffer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-8 pt-0 border-t bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-b-3xl">
                <div className="flex w-full gap-4">
                  <button onClick={() => setShowDetailsModal(false)}
                    className="flex-1 h-14 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                    Close
                  </button>
                  <button
                    onClick={() => { setShowDetailsModal(false); setShowApplyModal(true); }}
                    disabled={isExpiredOffer(selectedOffer)}
                    className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black hover:shadow-2xl hover:shadow-indigo-500/50 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500">
                    <Send className="w-5 h-5" />
                    Apply Now
                  </button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ══ APPLY MODAL ══ */}
        {showApplyModal && selectedOffer && (
          <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
            <DialogContent className="max-w-lg rounded-3xl">
              <DialogHeader className="p-8 border-b border-slate-200">
                <DialogTitle className="text-2xl font-black text-slate-900">
                  Apply for {selectedOffer.jobTitle}
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  {selectedOffer.company?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cv-upload" className="text-sm font-bold text-slate-900">
                    📎 Upload your CV <span className="text-amber-600">*</span>
                  </Label>
                  <Input id="cv-upload" type="file" accept=".pdf,.doc,.docx"
                    onChange={e => setCvFile(e.target.files ? e.target.files[0] : null)}
                    className="file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 h-12" />
                  {cvFile && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      ✅ {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation" className="text-sm font-bold text-slate-900">
                    💬 Motivation Letter <span className="text-amber-600">*</span>
                  </Label>
                  <Textarea id="motivation" value={motivation}
                    onChange={e => setMotivation(e.target.value)}
                    placeholder="Why are you perfect for this internship? Share your motivation, relevant experience, and enthusiasm..."
                    rows={6} className="min-h-[120px] resize-none" />
                  <p className="text-xs text-slate-500">200–500 words recommended</p>
                </div>

                {selectedOffer.requiredSkills?.length > 0 && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <h5 className="font-bold text-indigo-900 text-sm mb-2">💡 Tip: Highlight these skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.requiredSkills.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="p-8 pt-0 border-t bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-b-3xl">
                <div className="flex w-full gap-3">
                  <button type="button" onClick={() => setShowApplyModal(false)}
                    className="flex-1 py-4 px-6 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm text-sm">
                    Cancel
                  </button>
                  <button type="button" onClick={handleApply}
                    disabled={!cvFile || !motivation.trim() || !!applyingId}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {applyingId ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : 'Submit Application'}
                  </button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

      </main>
    </div>
  );
};