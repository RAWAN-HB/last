import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, TrendingUp, Award, AlertCircle, CheckCircle, XCircle,
  Filter, Search, Download, Mail, Clock, BarChart3,
  UserCheck, Eye, ChevronDown, Star, Target, Activity, Loader2,
  PenLine, Plus, CheckCircle2
} from 'lucide-react';
import { supervisorAPI } from '../../services/api';
import { toast } from 'sonner';

export const SupervisorPortal: React.FC = () => {
  const [students, setStudents]               = useState<any[]>([]);
  const [stats, setStats]                     = useState<any>(null);
  const [loading, setLoading]                 = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus]   = useState('all');
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [trackingDetail, setTrackingDetail]   = useState<any>(null);
  const [loadingDetail, setLoadingDetail]     = useState(false);
  const [activeModal, setActiveModal]         = useState<'detail' | 'attendance' | 'weekly' | 'evaluate' | null>(null);

  // Forms
  const [attendanceForm, setAttendanceForm] = useState({ date: '', status: 'present', note: '' });
  const [weeklyForm, setWeeklyForm]         = useState({
    weekNumber: 1, startDate: '', endDate: '',
    tasksCompleted: '', tasksCompletedCount: 0,
    totalTasks: 0, performanceScore: 0, supervisorComment: '',
  });
  const [evalForm, setEvalForm] = useState({
    performanceScore: 0, attendanceScore: 0, tasksScore: 0, comment: '',
  });

  const userName = localStorage.getItem('userName') || 'Supervisor';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await supervisorAPI.getStudents();
      setStudents(res.data?.students || []);
      setStats(res.data?.stats || null);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const openStudentDetail = async (student: any) => {
    setSelectedStudent(student);
    setActiveModal('detail');
    setLoadingDetail(true);
    try {
      const res = await supervisorAPI.getStudentDetails(student.trackingId);
      setTrackingDetail(res.data);
    } catch {
      toast.error('Failed to load student details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedStudent) return;
    if (!attendanceForm.date) { toast.error('Please select a date'); return; }
    try {
      await supervisorAPI.markAttendance(selectedStudent.trackingId, attendanceForm);
      toast.success('Attendance marked!');
      setAttendanceForm({ date: '', status: 'present', note: '' });
      setActiveModal('detail');
      openStudentDetail(selectedStudent);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleSubmitWeekly = async () => {
    if (!selectedStudent) return;
    try {
      await supervisorAPI.submitWeeklyReport(selectedStudent.trackingId, weeklyForm);
      toast.success('Weekly report submitted!');
      setActiveModal('detail');
      openStudentDetail(selectedStudent);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedStudent) return;
    try {
      await supervisorAPI.submitFinalEvaluation(selectedStudent.trackingId, evalForm);
      toast.success('Final evaluation submitted!');
      setActiveModal(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation');
    }
  };

  const getStatusColor = (student: any) => {
    if (student.evaluation) {
      return student.evaluation.passed 
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
        : 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredStudents = students.filter(s => {
    const matchSearch =
      s.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.offer?.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchStatus = true;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'accepted') {
        // Passed students: have evaluation and passed is true
        matchStatus = s.evaluation && s.evaluation.passed === true;
      } else if (selectedStatus === 'pending_admin_approval') {
        // Failed students: have evaluation and passed is false
        matchStatus = s.evaluation && s.evaluation.passed === false;
      }
    }
    
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 pt-24 pb-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
            <UserCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900">Supervisor Dashboard</h1>
            <p className="text-slate-500 font-medium">Welcome, {userName} — Monitor and evaluate your assigned interns</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Students',    value: stats?.totalStudents    || 0, icon: Users,        gradient: 'from-indigo-600 to-blue-600',   textColor: 'text-indigo-600'  },
            { label: 'Passed',            value: stats?.accepted         || 0, icon: CheckCircle,  gradient: 'from-emerald-600 to-green-600', textColor: 'text-emerald-600' },
            { label: 'Failed',            value: stats?.pendingApproval  || 0, icon: XCircle,      gradient: 'from-red-600 to-red-600',       textColor: 'text-red-600'     },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-md`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl font-black mb-1 ${stat.textColor}`}>{stat.value}</div>
              <div className="text-sm text-slate-600 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar filters */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900">Filters</h3>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Search students..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Status</label>
                <div className="space-y-2">
                  {['all', 'accepted', 'pending_admin_approval'].map(status => {
                    const labels: Record<string, string> = {
                      'all': 'All Students',
                      'accepted': 'Passed',
                      'pending_admin_approval': 'Failed'
                    };
                    return (
                      <button key={status} onClick={() => setSelectedStatus(status)}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all capitalize ${
                          selectedStatus === status
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}>
                        {labels[status]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Students grid */}
          <div className="lg:col-span-3">
            {filteredStudents.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-lg text-center">
                <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2">No Students Assigned</h3>
                <p className="text-slate-500 font-medium">You have no assigned students yet. Wait for a company to assign you to a convention.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStudents.map(student => (
                  <div key={student.trackingId}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all">

                    {/* Student header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
                        {student.student?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-lg mb-1 truncate">
                          {student.student?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mb-2 truncate">
                          {student.offer?.jobTitle || 'N/A'}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black border-2 capitalize ${getStatusColor(student)}`}>
                          {student.evaluation ? 
                            (student.evaluation.passed ? 'Passed' : 'Failed') : 
                            'Not Evaluated'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 font-medium truncate">{student.student?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 font-medium">
                          Applied: {new Date(student.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => openStudentDetail(student)}
                        className="py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-sm hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" /> Details
                      </button>
                      <button onClick={() => { setSelectedStudent(student); setActiveModal('evaluate'); }}
                        disabled={student.finalEvaluationSubmitted}
                        className="py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        <Award className="w-4 h-4" />
                        {student.finalEvaluationSubmitted ? 'Evaluated' : 'Evaluate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ DETAIL MODAL ══ */}
      {activeModal === 'detail' && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 max-w-4xl w-[min(95vw,950px)] max-h-[90vh] overflow-y-auto shadow-2xl mx-auto"
            onClick={e => e.stopPropagation()}>
            <div className="relative h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-t-[2.5rem] p-8 flex items-end">
              <button onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all">
                ✕
              </button>
              <div>
                <h2 className="text-3xl font-black text-white">{selectedStudent.student?.name}</h2>
                <p className="text-white/80">{selectedStudent.offer?.jobTitle}</p>
              </div>
            </div>

            <div className="p-8">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : (
                <>
                  {/* Student Info */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-indigo-600" /> Student Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 font-medium">{trackingDetail?.student?.email || selectedStudent.student?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 font-medium">
                          Applied: {new Date(trackingDetail?.createdAt || selectedStudent.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 font-medium">{trackingDetail?.offer?.jobTitle || selectedStudent.offer?.jobTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Application Status */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" /> Application Status
                    </h3>
                    <span className={`inline-block px-4 py-2 rounded-xl text-sm font-black border-2 capitalize ${
                      getStatusColor(trackingDetail || selectedStudent)
                    }`}>
                      {trackingDetail?.evaluation ? 
                        (trackingDetail.evaluation.passed ? 'Passed' : 'Failed') : 
                        (selectedStudent.evaluation ? 
                          (selectedStudent.evaluation.passed ? 'Passed' : 'Failed') : 
                          'Not Evaluated')}
                    </span>
                  </div>

                  {/* Motivation */}
                  {trackingDetail?.motivationStatement && (
                    <div>
                      <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                        <PenLine className="w-5 h-5 text-cyan-600" /> Motivation Statement
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl">
                        {trackingDetail.motivationStatement}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ FINAL EVALUATION MODAL ══ */}
      {activeModal === 'evaluate' && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-[100px]"
          onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-[min(95vw,900px)] max-h-[85vh] overflow-y-auto shadow-2xl p-8 mx-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Final Evaluation</h2>
            <p className="text-slate-500 text-sm mb-6">For: <strong>{selectedStudent.student?.name}</strong></p>

            <div className="space-y-4 mb-6">
              {[
                { label: 'Performance Score (%)', key: 'performanceScore' },
                { label: 'Attendance Score (%)',  key: 'attendanceScore'  },
                { label: 'Tasks Score (%)',        key: 'tasksScore'       },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-black text-slate-700 mb-2">{label}</label>
                  <input type="number" min="0" max="100"
                    value={(evalForm as any)[key]}
                    onChange={e => setEvalForm(p => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              ))}

              {/* Overall preview */}
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-sm text-slate-500 mb-1">Overall Score (average)</p>
                <p className="text-3xl font-black text-indigo-600">
                  {Math.round((evalForm.performanceScore + evalForm.attendanceScore + evalForm.tasksScore) / 3)}%
                </p>
                <p className={`text-sm font-bold mt-1 ${
                  Math.round((evalForm.performanceScore + evalForm.attendanceScore + evalForm.tasksScore) / 3) >= 50
                    ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {Math.round((evalForm.performanceScore + evalForm.attendanceScore + evalForm.tasksScore) / 3) >= 50
                    ? '→ Will PASS' : '→ Will FAIL'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">Comment</label>
                <textarea value={evalForm.comment}
                  onChange={e => setEvalForm(p => ({ ...p, comment: e.target.value }))}
                  rows={3} placeholder="Overall evaluation comment..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none" />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-700 font-bold">⚠️ This action is irreversible. Once submitted, the evaluation cannot be changed.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button onClick={handleSubmitEvaluation}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-indigo-500/30 transition-all">
                Submit Final Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};