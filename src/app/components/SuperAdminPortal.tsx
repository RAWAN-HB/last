import React, { useState, useEffect } from 'react';
import {
  Settings, Users, Building2, ShieldCheck, Activity, Briefcase,
  Globe, Database, CreditCard, Lock, Server,
  Search, Filter, MoreVertical, CheckCircle2, AlertTriangle,
  ArrowUpRight, Download, Loader2, UserCheck, Trash2,
  ToggleLeft, ToggleRight, Plus, X, Eye
} from 'lucide-react';
import { Badge } from './ui/Badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { superAdminAPI, offersAPI } from '../../services/api';
import { toast } from 'sonner';

const platformHealthData = [
  { time: '00:00', load: 32, latency: 45 },
  { time: '04:00', load: 12, latency: 38 },
  { time: '08:00', load: 65, latency: 52 },
  { time: '12:00', load: 88, latency: 68 },
  { time: '16:00', load: 74, latency: 60 },
  { time: '20:00', load: 45, latency: 48 },
  { time: '23:59', load: 28, latency: 42 },
];

export const SuperAdminPortal: React.FC = () => {
  const [activeTab, setActiveTab]           = useState('overview');
  const [pendingOffers, setPendingOffers]   = useState<any[]>([]);
  const [stats, setStats]                   = useState<any>(null);
  const [users, setUsers]                   = useState<any[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [pendingOffersLoading, setPendingOffersLoading] = useState(false);
  const [loading, setLoading]               = useState(true);
  const [usersLoading, setUsersLoading]     = useState(false);
  const [search, setSearch]                 = useState('');
  const [roleFilter, setRoleFilter]         = useState('');
  const [processingId, setProcessingId]     = useState<string | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showRoleModal, setShowRoleModal]   = useState(false);
  const [selectedUser, setSelectedUser]     = useState<any>(null);
  const [adminForm, setAdminForm]           = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchStats();
    fetchPendingCompanies();
    fetchPendingOffers();
  }, []);

  const fetchPendingOffers = async () => {
    setPendingOffersLoading(true);
    try {
      const offers = await superAdminAPI.getPendingOffers();
      setPendingOffers(offers);
    } catch {
      toast.error('Failed to load pending offers');
    } finally {
      setPendingOffersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, search, roleFilter]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getStats();
      setStats(res.data);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await superAdminAPI.getAllUsers({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.data?.users || res.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPendingCompanies = async () => {
    try {
      const res = await superAdminAPI.getPendingCompanies();
      setPendingCompanies(res.data || []);
    } catch {}
  };

  const handleApproveCompany = async (id: string) => {
    setProcessingId(id);
    try {
      await superAdminAPI.approveCompany(id);
      setPendingCompanies(prev => prev.filter(c => c._id !== id));
      toast.success('Company approved!');
      fetchStats();
    } catch {
      toast.error('Failed to approve company');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspendCompany = async (id: string) => {
    setProcessingId(id);
    try {
      await superAdminAPI.suspendCompany(id);
      toast.success('Company suspended');
      fetchUsers();
    } catch {
      toast.error('Failed to suspend company');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleUser = async (id: string) => {
    setProcessingId(id);
    try {
      await superAdminAPI.toggleUserStatus(id);
      setUsers(prev => prev.map(u =>
        u._id === id ? { ...u, isApproved: !u.isApproved } : u
      ));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    setProcessingId(id);
    try {
      await superAdminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    setProcessingId(id);
    try {
      await superAdminAPI.updateUserRole(id, role);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      toast.success('Role updated');
      setShowRoleModal(false);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await superAdminAPI.createAdmin(adminForm);
      toast.success('Admin created successfully!');
      setShowCreateAdmin(false);
      setAdminForm({ name: '', email: '', password: '' });
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const revenueData = stats ? [
    { month: 'Students',    rev: stats.users?.totalStudents    || 0 },
    { month: 'Companies',   rev: stats.users?.totalCompanies   || 0 },
    { month: 'Supervisors', rev: stats.users?.totalSupervisors || 0 },
    { month: 'Admins',      rev: stats.users?.totalAdmins      || 0 },
  ] : [];

  const getRoleVariant = (role: string) => {
    if (role === 'admin' || role === 'super_admin') return 'error';
    if (role === 'company')    return 'info';
    if (role === 'supervisor') return 'warning';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 flex flex-col lg:flex-row">

      {/* ── SIDEBAR ── */}
      <aside className="w-full lg:w-64 bg-white border-r border-slate-200 p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Super Admin</h2>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">System Active</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: 'overview',     label: 'Platform Hub',        icon: Activity   },
            { id: 'offers',       label: 'Pending Offers',      icon: Briefcase   },
            { id: 'companies',    label: 'Pending Companies',   icon: Building2  },
            { id: 'users',        label: 'Global Users',        icon: Users      },
            { id: 'admins',       label: 'Admin Management',    icon: ShieldCheck},
            { id: 'settings',     label: 'System Settings',     icon: Server     },
          ].map(item => {
            const count = item.id === 'companies' ? pendingCompanies.length : 
                         item.id === 'offers' ? pendingOffers.length : 0;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
                {count > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-10 p-4 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
          <Globe className="absolute -right-4 -bottom-4 w-20 h-20 text-white/5" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Stats</p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Users</span>
              <span>{stats ? Object.values(stats.users || {}).reduce((a: any, b: any) => a + b, 0) : '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Offers</span>
              <span>{stats?.platform?.totalOffers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Applications</span>
              <span>{stats?.platform?.totalApplications || 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Platform Hub</h1>
                <p className="text-slate-500 font-medium">Monitoring <span className="text-indigo-600 font-bold">Stag.io</span> global infrastructure.</p>
              </div>
            </header>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { label: 'Total Students',    value: stats?.users?.totalStudents    || 0, icon: Users,         trend: 'up'     },
                  { label: 'Total Companies',   value: stats?.users?.totalCompanies   || 0, icon: Building2,     trend: 'up'     },
                  { label: 'Total Supervisors', value: stats?.users?.totalSupervisors || 0, icon: UserCheck,     trend: 'stable' },
                  { label: 'Pending Companies', value: stats?.pending?.pendingCompanies|| 0, icon: AlertTriangle, trend: 'down'   },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <stat.icon className="w-5 h-5 text-slate-900" />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Platform stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { label: 'Total Offers',       value: stats?.platform?.totalOffers       || 0 },
                { label: 'Total Applications', value: stats?.platform?.totalApplications || 0 },
                { label: 'Total Conventions',  value: stats?.platform?.totalConventions  || 0 },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <p className="text-3xl font-black text-indigo-600 mb-1">{s.value}</p>
                  <p className="text-sm font-bold text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">Platform Load</h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={platformHealthData}>
                      <defs>
                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="load" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">User Distribution</h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="rev" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ PENDING COMPANIES TAB ══ */}
        {activeTab === 'companies' && (
          <>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Pending Companies</h1>
            <p className="text-slate-500 font-medium mb-8">
              {pendingCompanies.length} companies awaiting approval
            </p>

            {pendingCompanies.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400 opacity-50" />
                <p className="font-bold text-slate-900 text-lg">All companies approved</p>
                <p className="text-slate-500 text-sm">No pending company registrations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCompanies.map(company => (
                  <div key={company._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                      {company.name?.charAt(0) || 'C'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900">{company.name}</h3>
                      <p className="text-sm text-slate-500">{company.email}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Registered: {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveCompany(company._id)}
                        disabled={processingId === company._id}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2">
                        {processingId === company._id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <CheckCircle2 size={14} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleSuspendCompany(company._id)}
                        disabled={processingId === company._id}
                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-sm hover:bg-red-100 transition-all disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ USERS TAB ══ */}
        {activeTab === 'users' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Global Users</h1>
                <p className="text-slate-500 font-medium">{users.length} users found</p>
              </div>
            </div>

            {/* Search & filter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search by name or email..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="company">Companies</option>
                <option value="supervisor">Supervisors</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Users table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={24} />
                        </td>
                      </tr>
                    ) : users.map(user => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                              {user.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getRoleVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.isApproved ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-xs font-bold text-slate-700">
                              {user.isApproved ? 'Active' : 'Suspended'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Change Role">
                              <Settings size={15} className="text-slate-400 hover:text-indigo-600" />
                            </button>
                            <button
                              onClick={() => handleToggleUser(user._id)}
                              disabled={processingId === user._id}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Toggle Status">
                              {user.isApproved
                                ? <ToggleRight size={18} className="text-emerald-500" />
                                : <ToggleLeft size={18} className="text-slate-400" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={processingId === user._id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={15} className="text-slate-400 hover:text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && !usersLoading && (
                <div className="text-center py-12 text-slate-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No users found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ ADMIN MANAGEMENT TAB ══ */}
        {activeTab === 'admins' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Admin Management</h1>
                <p className="text-slate-500 font-medium">Create and manage admin accounts</p>
              </div>
              <button onClick={() => setShowCreateAdmin(true)}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all">
                <Plus size={18} /> Create Admin
              </button>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
              <p className="text-indigo-800 font-bold text-sm">
                ℹ️ Use the <strong>Global Users</strong> tab to view and manage all admins. Filter by role "admin" to see them.
              </p>
            </div>
          </>
        )}

        {/* ══ PENDING OFFERS TAB ══ */}
        {activeTab === 'offers' && (
          <>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Pending Offers</h1>
            <p className="text-slate-500 font-medium mb-8">
              {pendingOffers.length} internship offers awaiting approval
            </p>

            {pendingOffersLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : pendingOffers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400 opacity-50" />
                <p className="font-bold text-slate-900 text-lg">All offers approved</p>
                <p className="text-slate-500 text-sm">No pending internship offers</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOffers.map(offer => (
                  <div key={offer._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                      {offer.jobTitle?.charAt(0) || 'O'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 truncate">{offer.jobTitle}</h3>
                      <p className="text-sm text-slate-500">by {offer.company?.name || 'Unknown Company'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Domain: {offer.domain || 'N/A'} • Created: {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          setProcessingId(offer._id);
                          try {
                            await offersAPI.updateStatus(offer._id, 'published');
                            setPendingOffers(prev => prev.filter(o => o._id !== offer._id));
                            toast.success('Offer published!');
                            fetchStats();
                          } catch {
                            toast.error('Failed to approve offer');
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === offer._id}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2">
                        {processingId === offer._id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <CheckCircle2 size={14} />}
                        Publish
                      </button>
                      <button
                        onClick={async () => {
                          setProcessingId(offer._id);
                          try {
                            await offersAPI.updateStatus(offer._id, 'rejected');
                            setPendingOffers(prev => prev.filter(o => o._id !== offer._id));
                            toast.success('Offer rejected');
                          } catch {
                            toast.error('Failed to reject offer');
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === offer._id}
                        className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-sm hover:bg-red-100 transition-all disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {activeTab === 'settings' && (
          <>
            <h1 className="text-3xl font-black text-slate-900 mb-8">System Settings</h1>
            <div className="space-y-4">
              {[
                { label: 'Platform Name',    value: 'Stag.io',                 type: 'text'  },
                { label: 'Support Email',    value: 'support@stagio.com',       type: 'email' },
                { label: 'Max File Size',    value: '10MB',                     type: 'text'  },
                { label: 'JWT Expiry',       value: '7 days',                   type: 'text'  },
              ].map((setting, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-900">{setting.label}</p>
                    <p className="text-sm text-slate-500">{setting.value}</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ══ CREATE ADMIN MODAL ══ */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateAdmin(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create Admin</h2>
              <button onClick={() => setShowCreateAdmin(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {[
                { label: 'Full Name',  key: 'name',     type: 'text',     placeholder: 'Admin Name'       },
                { label: 'Email',      key: 'email',    type: 'email',    placeholder: 'admin@stagio.com' },
                { label: 'Password',   key: 'password', type: 'password', placeholder: 'Min 6 characters' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-black text-slate-700 mb-2">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(adminForm as any)[key]}
                    onChange={e => setAdminForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateAdmin(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button onClick={handleCreateAdmin}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all">
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CHANGE ROLE MODAL ══ */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRoleModal(false)}>
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Change Role</h2>
            <p className="text-slate-500 text-sm mb-6">
              Current: <strong>{selectedUser.name}</strong> → <Badge variant={getRoleVariant(selectedUser.role)}>{selectedUser.role}</Badge>
            </p>
            <div className="space-y-3 mb-6">
              {['student', 'company', 'supervisor', 'admin'].map(role => (
                <button key={role} onClick={() => handleUpdateRole(selectedUser._id, role)}
                  disabled={selectedUser.role === role || processingId === selectedUser._id}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm capitalize transition-all ${
                    selectedUser.role === role
                      ? 'bg-indigo-600 text-white cursor-default'
                      : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                  } disabled:opacity-50`}>
                  {role}
                </button>
              ))}
            </div>
            <button onClick={() => setShowRoleModal(false)}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};