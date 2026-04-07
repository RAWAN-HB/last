import React, { useState, useEffect } from 'react';

import { toast } from 'sonner';
import {
  Loader2, Search, Filter, CheckCircle2, XCircle,
  TrendingUp, Award, User, Briefcase, Calendar,
  ChevronDown, AlertCircle, Download
} from 'lucide-react';
import { companyAPI, conventionsAPI } from '../../services/api';

interface StudentEvaluation {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    institution?: string;
  };
  offer: {
    _id: string;
    jobTitle: string;
    location: string;
  };
  evaluation: {
    performanceScore: number;
    attendanceScore: number;
    tasksScore: number;
    overallScore: number;
    evaluation: 'excellent' | 'very good' | 'good' | 'satisfactory' | 'failed';
    passed: boolean;
    comment?: string;
    submittedAt: string;
  };
  status: string;
  appliedAt: string;
}

export const EvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingCertificateId, setGeneratingCertificateId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const res = await companyAPI.getStudentEvaluations();
      setEvaluations(res.data?.evaluations || []);
    } catch (err: any) {
      console.error('Failed to load evaluations:', err);
      toast.error('Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (applicationId: string, studentName: string) => {
    setGeneratingCertificateId(applicationId);
    try {
      const res = await conventionsAPI.generateCertificateForApplication(applicationId);
      toast.success(`Certificate generated! ${studentName} can now download it.`);
      // Refresh evaluations to update UI
      fetchEvaluations();
    } catch (err: any) {
      console.error('Failed to generate certificate:', err);
      toast.error(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGeneratingCertificateId(null);
    }
  };

  const filteredEvaluations = evaluations.filter(ev => 
    (ev.student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ev.student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    ev.offer.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(ev => 
    filterPassed === 'all' ||
    (filterPassed === 'passed' && ev.evaluation.passed) ||
    (filterPassed === 'failed' && !ev.evaluation.passed)
  );

  const stats = {
    total: evaluations.length,
    passed: evaluations.filter(e => e.evaluation.passed).length,
    failed: evaluations.filter(e => !e.evaluation.passed).length,
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'very good':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'good':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'satisfactory':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-indigo-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Student Evaluations</h1>
        <p className="text-slate-500 font-medium">
          View supervisor evaluations for students who completed internships
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Evaluated</p>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Passed ✓</p>
              <p className="text-3xl font-black text-emerald-600">{stats.passed}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Failed</p>
              <p className="text-3xl font-black text-red-600">{stats.failed}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name, email, or role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPassed('all')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                filterPassed === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPassed('passed')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                filterPassed === 'passed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Passed
            </button>
            <button
              onClick={() => setFilterPassed('failed')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                filterPassed === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="mx-auto mb-4 text-slate-300" size={48} />
          <p className="text-slate-500 font-medium">No evaluations found</p>
          <p className="text-sm text-slate-400">
            {evaluations.length === 0 
              ? 'Evaluations will appear here once supervisors complete student assessments'
              : 'Try adjusting your search filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvaluations.map((evaluation) => (
            <div
              key={evaluation._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === evaluation._id ? null : evaluation._id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Student Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {evaluation.student.name.charAt(0)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 truncate">
                      {evaluation.student.name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Briefcase size={14} />
                      {evaluation.offer.jobTitle}
                    </p>
                  </div>

                  {/* Status and Score */}
                  <div className="flex items-center gap-4">
                    {/* Pass/Fail Badge */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {evaluation.evaluation.passed ? (
                          <CheckCircle2 className="text-emerald-600" size={18} />
                        ) : (
                          <XCircle className="text-red-600" size={18} />
                        )}
                        <span className={`font-black text-sm ${
                          evaluation.evaluation.passed ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {evaluation.evaluation.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <p className={`text-2xl font-black ${getScoreColor(evaluation.evaluation.overallScore)}`}>
                        {evaluation.evaluation.overallScore}%
                      </p>
                    </div>

                    {/* Expand Icon */}
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 transition-transform ${
                        expandedId === evaluation._id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === evaluation._id && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Performance */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Performance</p>
                      <p className={`text-2xl font-black ${getScoreColor(evaluation.evaluation.performanceScore)}`}>
                        {evaluation.evaluation.performanceScore}%
                      </p>
                    </div>

                    {/* Attendance */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Attendance</p>
                      <p className={`text-2xl font-black ${getScoreColor(evaluation.evaluation.attendanceScore)}`}>
                        {evaluation.evaluation.attendanceScore}%
                      </p>
                    </div>

                    {/* Tasks */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Tasks</p>
                      <p className={`text-2xl font-black ${getScoreColor(evaluation.evaluation.tasksScore)}`}>
                        {evaluation.evaluation.tasksScore}%
                      </p>
                    </div>

                    {/* Overall */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Overall Score</p>
                      <div className="flex items-baseline gap-1">
                        <p className={`text-2xl font-black ${getScoreColor(evaluation.evaluation.overallScore)}`}>
                          {evaluation.evaluation.overallScore}
                        </p>
                        <p className="text-slate-400">%</p>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Level */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Evaluation</p>
                    <span className={`inline-block px-4 py-2 rounded-lg font-black text-sm border capitalize ${getEvaluationColor(evaluation.evaluation.evaluation)}`}>
                      {evaluation.evaluation.evaluation}
                    </span>
                  </div>

                  {/* Supervisor Comment */}
                  {evaluation.evaluation.comment && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Supervisor Comment</p>
                      <p className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 italic">
                        "{evaluation.evaluation.comment}"
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Evaluated: {new Date(evaluation.evaluation.submittedAt).toLocaleDateString()}</span>
                      <span>Applied: {new Date(evaluation.appliedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Generate Certificate Button - Only for passed students */}
                    {evaluation.evaluation.passed && (
                      <button
                        onClick={() => handleGenerateCertificate(evaluation._id, evaluation.student.name)}
                        disabled={generatingCertificateId === evaluation._id}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {generatingCertificateId === evaluation._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        {generatingCertificateId === evaluation._id ? 'Generating...' : 'Generate Certificate'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
