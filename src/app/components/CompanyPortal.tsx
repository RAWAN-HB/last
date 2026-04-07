import React, { useState, useEffect } from 'react';
import {
  Plus, Users, Briefcase, ChevronRight, FileText,
  CheckCircle2, XCircle, Clock, Award, UserCheck,
  Menu, X as CloseIcon, TrendingUp, Loader2
} from 'lucide-react';

import { CreateInternship } from './CreateInternship';
import { InternshipsList } from './InternshipsList';
import { SupervisorManagement } from './SupervisorManagement';
import { CertificatePage } from './CertificatePage';
import { EvaluationsPage } from './EvaluationsPage';
import { companyAPI, applicationsAPI, offersAPI } from '../../services/api';
import './CompanyPortal.css';

/* ─────────────────────── Types ─────────────────────── */
type ViewId =
  | 'dashboard'
  | 'create-internship'
  | 'internships'
  | 'supervisor-management'
  | 'certificates'
  | 'evaluations';

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ElementType;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

/* ═══════════════════════ CompanyPortal ═════════════════════ */
export const CompanyPortal: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [currentView, setCurrentView]             = useState<ViewId>('dashboard');
  const [sidebarOpen, setSidebarOpen]             = useState<boolean>(false);

  // ── Real data state ──
  const [stats, setStats]               = useState({ activeOffers: 0, totalCandidates: 0, pendingReview: 0 });
  const [applications, setApplications] = useState<any[]>([]);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  // ── Fetch dashboard data ──
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, appsRes, offersRes] = await Promise.all([
          companyAPI.getStats(),
          companyAPI.getRecentApplications(),
          offersAPI.getMyOffers(),
        ]);
        setStats(statsRes.data);
        setApplications(appsRes.data?.applications || appsRes.data || []);
        setActiveOffers(offersRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ── Accept / Reject application ──
  const handleReview = async (id: string, status: 'pending_admin_approval' | 'rejected') => {
    try {
      await applicationsAPI.review(id, status);
      setApplications(prev =>
        prev.map(app => app._id === id ? { ...app, status } : app)
      );
      setSelectedCandidate(null);
    } catch (err) {
      console.error('Review error:', err);
    }
  };

  const navItems: NavItem[] = [
    { id: 'dashboard',             label: 'Dashboard',   icon: TrendingUp },
    { id: 'internships',           label: 'Internships',  icon: Briefcase  },
    { id: 'supervisor-management', label: 'Supervisors',  icon: UserCheck  },
    { id: 'evaluations',           label: 'Evaluations',  icon: FileText   },
    { id: 'certificates',          label: 'Certificates', icon: Award      },
  ];

  // UPDATED: Show all offers stats including pending
  const statCards: StatCard[] = [
    { label: 'Total Offers',     value: activeOffers.length,                              icon: Briefcase, color: 'indigo' },
    { label: 'Published',        value: activeOffers.filter(o => o.status === 'published').length, icon: CheckCircle2, color: 'emerald' },
    { label: 'Pending Approval', value: activeOffers.filter(o => o.status === 'pending').length,   icon: Clock,     color: 'amber'  },
    { label: 'Total Applicants', value: stats.totalCandidates,                            icon: Users,     color: 'purple' },
  ];

  const getStatusClassName = (status: string): string => {
    const map: Record<string, string> = {
      pending:                'status-pill pending',
      pending_admin_approval: 'status-pill in-review',
      accepted:               'status-pill accepted',
      rejected:               'status-pill rejected',
    };
    return map[status] ?? 'status-pill pending';
  };

  const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
      pending:                'Pending',
      pending_admin_approval: 'In Review',
      accepted:               'Accepted',
      rejected:               'Rejected',
    };
    return map[status] ?? status;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const renderActiveView = (): React.ReactNode => {
    switch (currentView) {
      case 'create-internship':
        return <CreateInternship onBack={() => setCurrentView('internships')} onSuccess={() => {
          setCurrentView('internships');
          // Refresh offers after creation
          offersAPI.getMyOffers().then(res => setActiveOffers(res.data || []));
        }} />;
      case 'internships':
        return <InternshipsList 
          offers={activeOffers} 
          loading={loading} 
          onCreateNew={() => setCurrentView('create-internship')} 
          onRefresh={() => offersAPI.getMyOffers().then(res => setActiveOffers(res.data || []))}
        />;
      case 'supervisor-management':
        return <SupervisorManagement />;
      case 'evaluations':
        return <EvaluationsPage />;
      case 'certificates':
        return <CertificatePage />;
      default:
        return <DashboardMain />;
    }
  };

  /* ──────────────────── Dashboard ──────────────────── */
  const DashboardMain: React.FC = () => (
    <div className="animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Company Dashboard</h1>
          <p className="text-slate-500 font-medium">
            Welcome back, {localStorage.getItem('userName') || 'Company'}
          </p>
        </div>
        <button onClick={() => setCurrentView('create-internship')} className="create-offer-btn">
          <Plus size={20} />
          <span>Post New Internship</span>
        </button>
      </div>

      {/* Stat cards - UPDATED */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className={`stat-icon-wrapper ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-content-grid">
        {/* Recent Applications */}
        <div className="lg:col-span-2 main-card">
          <div className="card-header">
            <h3>Recent Applications</h3>
            <button onClick={() => setCurrentView('internships')} className="view-all-link">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="candidate-list">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium">No applications yet</p>
              </div>
            ) : (
              applications.slice(0, 5).map((app: any) => (
                <div key={app._id} className="candidate-row">
                  <div className="candidate-profile">
                    <div className="avatar-circle">
                      {app.student?.name?.charAt(0) || app.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="candidate-name">
                        {app.student?.name || app.fullName || 'Unknown'}
                      </h4>
                      <p className="candidate-role">
                        {app.offer?.jobTitle || 'Unknown Role'}
                      </p>
                    </div>
                  </div>
                  <div className="candidate-actions">
                    <div className="status-badge-container">
                      <span className={getStatusClassName(app.status)}>
                        {getStatusLabel(app.status)}
                      </span>
                      <span className="applied-date">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                    <div className="action-buttons">
                      {app.status === 'pending' && (
                        <>
                          <button
                            className="btn-icon accept"
                            title="Accept"
                            onClick={() => setSelectedCandidate(app)}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            className="btn-icon refuse"
                            title="Reject"
                            onClick={() => handleReview(app._id, 'rejected')}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        className="btn-icon view"
                        title="View"
                        onClick={() => setSelectedCandidate(app)}
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar - UPDATED */}
        <div className="space-y-6">
          <div className="contract-promo-card">
            <h3>View Evaluations</h3>
            <p>Review supervisor assessments of your internship students.</p>
            <button className="contract-portal-btn" onClick={() => setCurrentView('evaluations')}>
              <FileText size={18} /> Open Evaluations
            </button>
          </div>

          {/* UPDATED: Show all offers with status breakdown */}
          <div className="main-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">
                My Offers
              </h3>
              <button 
                onClick={() => setCurrentView('internships')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                View All
              </button>
            </div>
            
            {/* Status breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Published</span>
                <span className="font-bold text-emerald-600">
                  {activeOffers.filter(o => o.status === 'published').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pending Approval</span>
                <span className="font-bold text-amber-600">
                  {activeOffers.filter(o => o.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Drafts</span>
                <span className="font-bold text-slate-600">
                  {activeOffers.filter(o => o.status === 'draft').length}
                </span>
              </div>
            </div>

            <div className="mini-job-list border-t border-slate-100 pt-4">
              {activeOffers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-2">No offers created yet</p>
              ) : (
                activeOffers.slice(0, 5).map((offer: any) => (
                  <div key={offer._id} className="mini-job-item">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        offer.status === 'published' ? 'bg-emerald-500' :
                        offer.status === 'pending' ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`} />
                      <span className="truncate">{offer.jobTitle}</span>
                    </div>
                    <span className="text-xs text-slate-400 uppercase">
                      {offer.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ──────────────────── Render ──────────────────── */
  return (
    <div className="company-portal-layout">
      {/* Sidebar */}
      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-box">S</div>
          <span>Stag.io</span>
        </div>

        <nav className="nav-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
              className={`nav-link ${currentView === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom-card">
          <UserCheck size={20} className="mb-2 text-indigo-200" />
          <p>Need help recruiting?</p>
          <button>View Guide</button>
        </div>
      </aside>

      {/* Main area */}
      <main className="portal-main-area">
        <header className="mobile-toggle-header lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <CloseIcon /> : <Menu />}
          </button>
          <span className="font-bold">Stag.io Company</span>
        </header>

        <div className="content-wrapper">
          {renderActiveView()}
        </div>

        <footer className="portal-footer">
          <p className="text-xs text-slate-500"></p>
        </footer>
      </main>

      {/* Accept modal */}
      {!!selectedCandidate && (
        <div className="agreement-modal-overlay">
          <div className="agreement-modal">
            <h3>Accept {selectedCandidate.student?.name || selectedCandidate.fullName}?</h3>
            <p>This will send the application for admin approval.</p>
            <div className="modal-actions">
              <button onClick={() => handleReview(selectedCandidate._id, 'pending_admin_approval')}>
                Accept
              </button>
              <button onClick={() => setSelectedCandidate(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};