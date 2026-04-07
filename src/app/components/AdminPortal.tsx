import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  ShieldAlert, CheckCircle, TrendingUp, Users, MapPin,
  UserCheck, Key, Loader2, Eye, FileText, X, Briefcase,
  Building2, Clock
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { adminAPI, applicationsAPI, conventionsAPI } from '../../services/api';

const COLORS = ['#4f46e5', '#e2e8f0'];

export const AdminPortal: React.FC = () => {
  const [stats, setStats]                   = useState<any>(null);
  const [validationQueue, setValidationQueue] = useState<any[]>([]);
  const [pendingConventions, setPendingConventions] = useState<any[]>([]);
      const [allStudents, setAllStudents]       = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState<'queue' | 'conventions' | 'students'>('queue');
  const [processingId, setProcessingId]     = useState<string | null>(null);
  const [showConventionModal, setShowConventionModal] = useState(false);
  const [selectedConvention, setSelectedConvention]   = useState<any>(null);
  const [adminNote, setAdminNote]           = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes, conventionsRes, studentsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getValidationQueue(),
        adminAPI.getPendingConventions(),
        adminAPI.getAllUsers({ role: 'student', limit: 1000 }), // Get all students
      ]);
      setStats(statsRes.data);
      setValidationQueue(queueRes.data?.applications || queueRes.data || []);
      setPendingConventions(conventionsRes.data || []);
      // Set all students
      setAllStudents(studentsRes.data?.users || []);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  /* ── Validate application ── */
  const handleValidateApplication = async (id: string, status: 'accepted' | 'rejected') => {
    setProcessingId(id);
    try {
      await applicationsAPI.validate(id, status);
      setValidationQueue(prev => prev.filter(a => a._id !== id));
      setStats((prev: any) => prev ? {
        ...prev,
        validationQueue: prev.validationQueue - 1,
        placedStudents: status === 'accepted' ? prev.placedStudents + 1 : prev.placedStudents,
      } : prev);
      toast.success(status === 'accepted' ? 'Application approved! Convention generated.' : 'Application rejected.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process application');
    } finally {
      setProcessingId(null);
    }
  };

  /* ── Validate convention ── */
  const handleValidateConvention = async (status: 'approved' | 'rejected') => {
    if (!selectedConvention) return;
    setProcessingId(selectedConvention._id);
    try {
      await conventionsAPI.validate(selectedConvention._id, status, adminNote);
      setPendingConventions(prev => prev.filter(c => c._id !== selectedConvention._id));
      toast.success(`Convention ${status}!`);
      setShowConventionModal(false);
      setSelectedConvention(null);
      setAdminNote('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process convention');
    } finally {
      setProcessingId(null);
    }
  };



  const pieData = stats ? [
    { name: 'Placed',   value: stats.placedStudents   || 0 },
    { name: 'Unplaced', value: stats.unplacedStudents || 0 },
  ] : [];

  const statCards = stats ? [
    { label: 'Total Students',    value: stats.totalStudents    || 0, icon: Users,       color: 'indigo'  },
    { label: 'Placed Students',   value: stats.placedStudents   || 0, icon: CheckCircle, color: 'emerald' },
    { label: 'Validation Queue',  value: stats.validationQueue  || 0, icon: ShieldAlert, color: 'amber'   },
    { label: 'Partner Companies', value: stats.totalCompanies   || 0, icon: MapPin,      color: 'slate'   },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">University Administration</h1>
        <p className="text-slate-500">Global overview and internship validation portal.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pending stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Platform Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'All Students', value: allStudents.length, color: 'bg-blue-500' },
              { label: 'Pending Conventions', value: stats?.pendingConventions || 0, color: 'bg-amber-500' },
              { label: 'Pending Certificates', value: stats?.pendingCertificates || 0, color: 'bg-indigo-500' },
              { label: 'Validation Queue', value: stats?.validationQueue || 0, color: 'bg-red-500' },
              { label: 'Total Companies', value: stats?.totalCompanies || 0, color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-500 font-medium">{item.label}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all`}
                    style={{ width: `${Math.min((item.value / (stats?.totalStudents || 1)) * 100, 100)}%` }}
                  />
                </div>
                <div className="w-8 text-sm font-bold text-slate-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Student Placement Status</h3>
          <div className="flex items-center justify-around h-[260px]">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.name}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  Live data from database
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'queue',       label: `Validation Queue (${validationQueue.length})`,       icon: ShieldAlert },
          { id: 'conventions', label: `Pending Conventions (${pendingConventions.length})`, icon: FileText    },
          { id: 'students',    label: `All Students (${allStudents.length})`,               icon: Users       },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Validation Queue Tab */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Applications Pending Admin Approval</h3>
            <p className="text-sm text-slate-500">These have been accepted by companies and need your final approval</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Applied</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validationQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No applications pending review</p>
                    </td>
                  </tr>
                ) : (
                  validationQueue.map(app => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{app.student?.name || app.fullName}</p>
                          <p className="text-xs text-slate-500">{app.student?.email || app.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {app.offer?.jobTitle || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.offer?.company?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleValidateApplication(app._id, 'accepted')}
                            disabled={processingId === app._id}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 transition-all text-sm disabled:opacity-50 flex items-center gap-1"
                          >
                            {processingId === app._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleValidateApplication(app._id, 'rejected')}
                            disabled={processingId === app._id}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-all text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Conventions Tab */}
      {activeTab === 'conventions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Conventions Awaiting Approval</h3>
            <p className="text-sm text-slate-500">Review and approve internship conventions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingConventions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <FileText size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No pending conventions</p>
                    </td>
                  </tr>
                ) : (
                  pendingConventions.map(conv => (
                    <tr key={conv._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 text-sm">{conv.student?.name}</p>
                        <p className="text-xs text-slate-500">{conv.student?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{conv.company?.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{conv.offer?.jobTitle}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {conv.startDate ? new Date(conv.startDate).toLocaleDateString() : 'N/A'}
                        {' → '}
                        {conv.endDate ? new Date(conv.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setSelectedConvention(conv); setShowConventionModal(true); }}
                          className="flex items-center gap-1.5 ml-auto px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold hover:bg-indigo-100 transition-all text-sm"
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">All Students</h3>
            <p className="text-sm text-slate-500">Complete list of all registered students</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">School</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <Users size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No students found</p>
                    </td>
                  </tr>
                ) : (
                  allStudents.map(student => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        N/A
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Convention Review Modal */}
      {showConventionModal && selectedConvention && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowConventionModal(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Review Convention</h2>
                <button onClick={() => setShowConventionModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Convention details */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3 mb-6">
                {[
                  { label: 'Student',  value: selectedConvention.student?.name },
                  { label: 'Company',  value: selectedConvention.company?.name },
                  { label: 'Role',     value: selectedConvention.offer?.jobTitle },
                  { label: 'Start',    value: selectedConvention.startDate ? new Date(selectedConvention.startDate).toLocaleDateString() : 'N/A' },
                  { label: 'End',      value: selectedConvention.endDate ? new Date(selectedConvention.endDate).toLocaleDateString() : 'N/A' },
                  { label: 'Tasks',    value: selectedConvention.tasks },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-xs font-black text-slate-400 uppercase w-16 pt-0.5">{label}</span>
                    <span className="text-sm font-medium text-slate-800 flex-1">{value || 'N/A'}</span>
                  </div>
                ))}
              </div>

              {/* Admin note */}
              <div className="mb-6">
                <label className="block text-sm font-black text-slate-700 mb-2">Admin Note (optional)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  placeholder="Add a note for the student or company..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleValidateConvention('rejected')}
                  disabled={processingId === selectedConvention._id}
                  className="flex-1 py-3 bg-red-50 text-red-700 rounded-xl font-black hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleValidateConvention('approved')}
                  disabled={processingId === selectedConvention._id}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingId === selectedConvention._id
                    ? <Loader2 size={16} className="animate-spin" />
                    : <CheckCircle size={16} />
                  }
                  Approve & Generate PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};