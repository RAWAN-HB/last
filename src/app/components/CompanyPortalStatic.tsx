import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, FileCheck, Clock, Briefcase, TrendingUp } from 'lucide-react';

export const CompanyPortal: React.FC = () => {
  const stats = {
    activeOffers: 23,
    totalCandidates: 156,
    pendingReview: 12
  };

  const recentApplications = [
    {
      name: 'John Doe',
      email: 'john@university.edu',
      status: 'Pending',
      date: '2024-01-15'
    },
    {
      name: 'Jane Smith',
      email: 'jane@university.edu',
      status: 'Reviewed',
      date: '2024-01-14'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Active Offers</h3>
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.activeOffers}</div>
          </motion.div>

          <motion.div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Total Candidates</h3>
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.totalCandidates}</div>
          </motion.div>

          <motion.div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pending Review</h3>
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.pendingReview}</div>
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-black text-slate-900">Recent Applications</h2>
          </div>

          <div className="space-y-4">
            {recentApplications.map((app, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold">
                  {app.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 truncate">{app.name}</h4>
                  <p className="text-sm text-slate-500 truncate">{app.email}</p>
                </div>
                <div className="text-sm font-bold text-orange-600 px-3 py-1 bg-orange-50 rounded-full">
                  {app.status}
                </div>
                <div className="text-xs text-slate-400">
                  {app.date}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
