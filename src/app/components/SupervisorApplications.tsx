import React, { useState } from 'react';
import { UserCheck, Mail, Phone, GraduationCap, Briefcase, MapPin, Calendar, Check, X, Eye, Search, Filter, TrendingUp, Clock, Award } from 'lucide-react';
import { Badge } from './ui/Badge';
import { toast } from 'sonner';

interface SupervisorApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  experience: string;
  specialization: string;
  location: string;
  appliedDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  cv: string;
  motivation: string;
}

interface SupervisorApplicationsProps {
  onViewAccepted?: () => void;
}

export const SupervisorApplications: React.FC<SupervisorApplicationsProps> = ({ onViewAccepted }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Accepted' | 'Rejected'>('All');
  const [selectedApplication, setSelectedApplication] = useState<SupervisorApplication | null>(null);

  const [applications, setApplications] = useState<SupervisorApplication[]>([
    {
      id: 1,
      name: 'Dr. Emily Chen',
      email: 'e.chen@university.edu',
      phone: '+33 6 12 34 56 78',
      university: 'Sorbonne University',
      department: 'Computer Science',
      experience: '8 years',
      specialization: 'Software Engineering, AI',
      location: 'Paris, France',
      appliedDate: '2026-03-05',
      status: 'Pending',
      cv: 'emily_chen_cv.pdf',
      motivation: 'Passionate about mentoring students and bridging academia with industry...'
    },
    {
      id: 2,
      name: 'Prof. Marc Dubois',
      email: 'm.dubois@university.fr',
      phone: '+33 6 23 45 67 89',
      university: 'École Polytechnique',
      department: 'Mechanical Engineering',
      experience: '12 years',
      specialization: 'Robotics, Automation',
      location: 'Lyon, France',
      appliedDate: '2026-03-06',
      status: 'Pending',
      cv: 'marc_dubois_cv.pdf',
      motivation: 'Dedicated to providing practical industry exposure to engineering students...'
    },
    {
      id: 3,
      name: 'Dr. Sophie Laurent',
      email: 's.laurent@university.edu',
      phone: '+33 6 34 56 78 90',
      university: 'University of Toulouse',
      department: 'Business Administration',
      experience: '6 years',
      specialization: 'Marketing, Strategy',
      location: 'Toulouse, France',
      appliedDate: '2026-03-07',
      status: 'Accepted',
      cv: 'sophie_laurent_cv.pdf',
      motivation: 'Experienced in corporate training and student development programs...'
    },
    {
      id: 4,
      name: 'Dr. Ahmed Hassan',
      email: 'a.hassan@university.com',
      phone: '+33 6 45 67 89 01',
      university: 'Paris-Saclay University',
      department: 'Data Science',
      experience: '5 years',
      specialization: 'Machine Learning, Analytics',
      location: 'Paris, France',
      appliedDate: '2026-03-04',
      status: 'Pending',
      cv: 'ahmed_hassan_cv.pdf',
      motivation: 'Committed to fostering data literacy and analytical skills in students...'
    },
  ]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'Pending').length,
    accepted: applications.filter(a => a.status === 'Accepted').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const handleAccept = (id: number) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: 'Accepted' as const } : app
    ));
    toast.success('Supervisor application accepted!');
    setSelectedApplication(null);
  };

  const handleReject = (id: number) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: 'Rejected' as const } : app
    ));
    toast.error('Supervisor application rejected');
    setSelectedApplication(null);
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Supervisor Applications</h1>
          <p className="text-slate-500 font-medium">Review and manage supervisor registration requests</p>
        </div>
        <button
          onClick={onViewAccepted}
          className="py-3 px-6 bg-emerald-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          View Accepted ({stats.accepted})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Review</p>
          <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Accepted</p>
          <p className="text-3xl font-black text-slate-900">{stats.accepted}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Rejected</p>
          <p className="text-3xl font-black text-slate-900">{stats.rejected}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Applications</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, department, or university..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-12 pr-8 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4">Supervisor</th>
                <th className="px-6 py-4">University & Department</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{application.name}</p>
                      <div className="space-y-0.5 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          {application.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          {application.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900 text-sm">{application.university}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                        {application.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 font-medium">{application.specialization}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-900">{application.experience}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{application.appliedDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={
                        application.status === 'Accepted' ? 'success' : 
                        application.status === 'Rejected' ? 'error' : 
                        'warning'
                      }
                    >
                      {application.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </button>
                      {application.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(application.id)}
                            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group"
                            title="Accept"
                          >
                            <Check className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleReject(application.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Reject"
                          >
                            <X className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-16">
            <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedApplication(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedApplication.name}</h2>
                    <p className="text-slate-500 font-medium">{selectedApplication.department}</p>
                  </div>
                </div>
                <Badge 
                  variant={
                    selectedApplication.status === 'Accepted' ? 'success' : 
                    selectedApplication.status === 'Rejected' ? 'error' : 
                    'warning'
                  }
                >
                  {selectedApplication.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedApplication.email}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Phone</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedApplication.phone}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">University</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedApplication.university}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">Experience</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedApplication.experience}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 col-span-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">Specialization</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedApplication.specialization}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Motivation Letter
                </h3>
                <p className="text-slate-700 font-medium leading-relaxed">{selectedApplication.motivation}</p>
              </div>

              {selectedApplication.status === 'Pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(selectedApplication.id)}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleAccept(selectedApplication.id)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Accept Supervisor
                  </button>
                </div>
              )}

              {selectedApplication.status !== 'Pending' && (
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { FileText } from 'lucide-react';
