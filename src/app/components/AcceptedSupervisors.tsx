import React, { useState } from 'react';
import { UserCheck, Mail, Phone, GraduationCap, Briefcase, Award, Search, Plus, Calendar, Building2, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Badge } from './ui/Badge';
import { toast } from 'sonner';

interface Supervisor {
  id: number;
  name: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  experience: string;
  specialization: string;
  assignedInternship?: {
    title: string;
    startDate: string;
    students: number;
  };
}

interface Internship {
  id: number;
  title: string;
  department: string;
  location: string;
  duration: string;
  startDate: string;
}

interface AcceptedSupervisorsProps {
  onBack?: () => void;
}

export const AcceptedSupervisors: React.FC<AcceptedSupervisorsProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [selectedInternshipId, setSelectedInternshipId] = useState<number>(0);

  const [supervisors, setSupervisors] = useState<Supervisor[]>([
    {
      id: 1,
      name: 'Dr. Sophie Laurent',
      email: 's.laurent@university.edu',
      phone: '+33 6 34 56 78 90',
      university: 'University of Toulouse',
      department: 'Business Administration',
      experience: '6 years',
      specialization: 'Marketing, Strategy',
      assignedInternship: {
        title: 'Marketing Intern',
        startDate: '2026-04-01',
        students: 2
      }
    },
    {
      id: 2,
      name: 'Dr. Emily Chen',
      email: 'e.chen@university.edu',
      phone: '+33 6 12 34 56 78',
      university: 'Sorbonne University',
      department: 'Computer Science',
      experience: '8 years',
      specialization: 'Software Engineering, AI',
    },
    {
      id: 3,
      name: 'Prof. Marc Dubois',
      email: 'm.dubois@university.fr',
      phone: '+33 6 23 45 67 89',
      university: 'École Polytechnique',
      department: 'Mechanical Engineering',
      experience: '12 years',
      specialization: 'Robotics, Automation',
    },
  ]);

  const availableInternships: Internship[] = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      department: 'Engineering',
      location: 'Paris, France',
      duration: '6 months',
      startDate: '2026-04-15'
    },
    {
      id: 2,
      title: 'UX/UI Designer Intern',
      department: 'Design',
      location: 'Remote',
      duration: '4 months',
      startDate: '2026-05-01'
    },
    {
      id: 3,
      title: 'Data Analyst Intern',
      department: 'Analytics',
      location: 'Lyon, France',
      duration: '6 months',
      startDate: '2026-04-20'
    },
    {
      id: 4,
      title: 'Backend Developer Intern',
      department: 'Engineering',
      location: 'Marseille, France',
      duration: '6 months',
      startDate: '2026-05-10'
    },
  ];

  const filteredSupervisors = supervisors.filter(sup => 
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: supervisors.length,
    assigned: supervisors.filter(s => s.assignedInternship).length,
    unassigned: supervisors.filter(s => !s.assignedInternship).length,
  };

  const handleAssignInternship = () => {
    if (!selectedSupervisor || !selectedInternshipId) {
      toast.error('Please select an internship');
      return;
    }

    const internship = availableInternships.find(i => i.id === selectedInternshipId);
    if (!internship) return;

    setSupervisors(supervisors.map(sup => 
      sup.id === selectedSupervisor.id 
        ? {
            ...sup,
            assignedInternship: {
              title: internship.title,
              startDate: internship.startDate,
              students: 0
            }
          }
        : sup
    ));

    toast.success(`Assigned ${internship.title} to ${selectedSupervisor.name}`);
    setShowAssignModal(false);
    setSelectedSupervisor(null);
    setSelectedInternshipId(0);
  };

  const handleOpenAssignModal = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowAssignModal(true);
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </button>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Accepted Supervisors</h1>
            <p className="text-slate-500 font-medium">Manage approved supervisors and assign internships</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Supervisors</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Assigned</p>
          <p className="text-3xl font-black text-slate-900">{stats.assigned}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Unassigned</p>
          <p className="text-3xl font-black text-slate-900">{stats.unassigned}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, department, or university..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Supervisors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSupervisors.map((supervisor) => (
          <div key={supervisor.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{supervisor.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{supervisor.department}</p>
                </div>
              </div>
              {supervisor.assignedInternship ? (
                <Badge variant="success">Assigned</Badge>
              ) : (
                <Badge variant="warning">Unassigned</Badge>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{supervisor.university}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{supervisor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{supervisor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{supervisor.specialization}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span className="font-medium">{supervisor.experience} of experience</span>
              </div>
            </div>

            {/* Assigned Internship */}
            {supervisor.assignedInternship && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-100 rounded-xl p-4 mb-4">
                <h4 className="font-black text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Assigned Internship
                </h4>
                <p className="font-bold text-slate-900 mb-1">{supervisor.assignedInternship.title}</p>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Start: {supervisor.assignedInternship.startDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">{supervisor.assignedInternship.students} students</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {!supervisor.assignedInternship && (
              <button
                onClick={() => handleOpenAssignModal(supervisor)}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Assign Internship
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredSupervisors.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No supervisors found</h3>
          <p className="text-slate-500 font-medium">Try adjusting your search</p>
        </div>
      )}

      {/* Assign Internship Modal */}
      {showAssignModal && selectedSupervisor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Assign Internship</h2>
                  <p className="text-slate-500 font-medium">Select an internship for {selectedSupervisor.name}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-black text-slate-700 mb-3">
                  Available Internships
                </label>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {availableInternships.map((internship) => (
                    <label
                      key={internship.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedInternshipId === internship.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="internship"
                        value={internship.id}
                        checked={selectedInternshipId === internship.id}
                        onChange={() => setSelectedInternshipId(internship.id)}
                        className="mt-1 w-4 h-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2">{internship.title}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="font-medium">{internship.department}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-medium">{internship.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">{internship.startDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="font-medium">{internship.duration}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignInternship}
                  disabled={!selectedInternshipId}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Assign Internship
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
