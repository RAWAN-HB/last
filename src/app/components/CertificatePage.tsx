import React, { useState, useEffect } from 'react';
import { Award, Download, Eye, Search, Calendar, User, Building2, CheckCircle, Clock, Stamp, Loader2 } from 'lucide-react';
import { Badge } from './ui/Badge';
import { companyAPI } from '../../services/api';
import { toast } from 'sonner';

export const CertificatePage: React.FC = () => {
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterStatus, setFilterStatus]     = useState('All');
  const [certificates, setCertificates]     = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selectedCert, setSelectedCert]     = useState<any>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await companyAPI.getCompanyCertificates();
      setCertificates(res.data || []);
    } catch (err: any) {
      console.error('Failed to load certificates:', err);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const filtered = certificates.filter(c => {
    const matchSearch =
      c.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.offer?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'All' || c.status === filterStatus.toLowerCase();
    return matchSearch && matchFilter;
  });

  const stats = {
    approved:   certificates.filter(c => c.status === 'approved').length,
    pending:    certificates.filter(c => c.status === 'pending').length,
    rejected:   certificates.filter(c => c.status === 'rejected').length,
    total:      certificates.length,
  };

  const getStatusVariant = (status: string) => {
    if (status === 'approved') return 'success';
    if (status === 'pending')  return 'warning';
    return 'default';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="animate-in">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
          <Award className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Internship Certificates</h1>
          <p className="text-slate-500 font-medium">View and manage completion certificates</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Approved',  value: stats.approved, icon: CheckCircle, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
          { label: 'Pending',   value: stats.pending,  icon: Clock,       bgColor: 'bg-amber-50',   textColor: 'text-amber-600'   },
          { label: 'Rejected',  value: stats.rejected, icon: Stamp,       bgColor: 'bg-red-50',     textColor: 'text-red-600'     },
          { label: 'Total',     value: stats.total,    icon: Award,       bgColor: 'bg-indigo-50',  textColor: 'text-indigo-600'  },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-xl ${s.bgColor} flex items-center justify-center mb-4`}>
              <s.icon className={`w-6 h-6 ${s.textColor}`} />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by student name or internship..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all">
            <option>All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Internship</th>
                <th className="px-6 py-4">Supervisor</th>
                <th className="px-6 py-4">Evaluation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(cert => (
                <tr key={cert._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{cert.student?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{cert.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{cert.offer?.jobTitle || 'N/A'}</p>
                    <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold mt-1">
                      {cert.company?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">
                        {cert.offer?.supervisor?.name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={cert.evaluation === 'excellent' ? 'success' : 'info'}>
                      {cert.evaluation || 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(cert.status)}>
                      {cert.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedCert(cert)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors group" title="Preview">
                        <Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </button>
                      {cert.status === 'approved' && (
                        <button className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group" title="Download">
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No certificates found</h3>
            <p className="text-slate-500 font-medium">Certificates are generated automatically when supervisors submit final evaluations</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCert(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
              <div className="bg-white border-4 border-amber-400 rounded-2xl p-10 shadow-2xl text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center mb-4 shadow-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Certificate of Completion</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full mb-6"></div>
                <p className="text-slate-600 font-medium mb-2">This certifies that</p>
                <h3 className="text-3xl font-black text-indigo-600 mb-2">{selectedCert.student?.name}</h3>
                <p className="text-slate-600 font-medium mb-2">has successfully completed the internship as</p>
                <h4 className="text-xl font-black text-slate-900 mb-1">{selectedCert.offer?.jobTitle}</h4>
                <p className="text-slate-500 mb-6">at {selectedCert.company?.name}</p>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 text-left mb-6">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Completion Date</p>
                    <p className="font-bold text-slate-900">{selectedCert.completionDate ? new Date(selectedCert.completionDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Evaluation</p>
                    <p className="font-bold text-slate-900 capitalize">{selectedCert.evaluation}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="h-12 border-b-2 border-slate-300 mb-2"></div>
                    <p className="font-bold text-slate-900 text-sm">Company Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 border-b-2 border-slate-300 mb-2"></div>
                    <p className="font-bold text-slate-900 text-sm">Supervisor Signature</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => setSelectedCert(null)}
                className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-100 transition-all">
                Close
              </button>
              {selectedCert.status === 'approved' && (
                <button className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-black flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" /> Download PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};