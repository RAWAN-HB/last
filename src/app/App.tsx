import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StudentPortal } from './components/StudentPortal';
import { CompanyPortal } from './components/CompanyPortal';
import { AdminPortal } from './components/AdminPortal';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { SupervisorPortal } from './components/SupervisorPortal';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Toaster } from 'sonner';
import { Briefcase, Mail, Phone, Globe, Instagram, Twitter, Linkedin, Facebook, User, Building2, ShieldCheck, ArrowRight, Settings, UserCheck } from 'lucide-react';
import { Features } from './components/Features';
import { ApplicationForm } from './components/ApplicationForm';

type View = 'landing' | 'student' | 'company' | 'admin' | 'application' | 'super-admin' | 'supervisor' | 'login' | 'register';

const Footer: React.FC = () => (
  <footer className="bg-[#0A0118] text-slate-400 py-24 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              Stag<span className="text-indigo-400">.io</span>
            </span>
          </div>
          <p className="text-lg leading-relaxed mb-8 text-slate-500 font-medium">
            Bridging the gap between university brilliance and industrial excellence through a high-performance ecosystem.
          </p>
          <div className="flex gap-4">
            {[Twitter, Linkedin, Instagram, Facebook].map((Icon, idx) => (
              <div key={idx} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                <Icon className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">For Students</h4>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Find Internships</li>
            <li className="hover:text-white cursor-pointer transition-colors">Build Digital CV</li>
            <li className="hover:text-white cursor-pointer transition-colors">Application Tracking</li>
            <li className="hover:text-white cursor-pointer transition-colors">Skill Matching</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">For Partners</h4>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Post Offers</li>
            <li className="hover:text-white cursor-pointer transition-colors">Talent Sourcing</li>
            <li className="hover:text-white cursor-pointer transition-colors">Agreement Portal</li>
            <li className="hover:text-white cursor-pointer transition-colors">Hiring Analytics</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              hello@stag.io
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              +1 (555) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              www.stag.io
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
        <p>© 2026 Stag.io - University Internship Management. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
          <span className="hover:text-white cursor-pointer">Cookie Settings</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedJob, setSelectedJob] = useState<{ title: string; company: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // ── Rehydrate session on page load ──────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('userRole');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      const roleToView: Record<string, View> = {
        student:     'student',
        company:     'company',
        admin:       'admin',
        supervisor:  'supervisor',
        super_admin: 'super-admin',
      };
      if (roleToView[role]) setCurrentView(roleToView[role]);
    }
  }, []);

  const handleApply = (job: { title: string; company: string }) => {
    setSelectedJob(job);
    setCurrentView('application');
  };

  const handleLogin = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    const roleToView: Record<string, View> = {
      student:     'student',
      company:     'company',
      admin:       'admin',
      supervisor:  'supervisor',
      super_admin: 'super-admin',
    };
    const view = roleToView[role];
    if (view) setCurrentView(view);
    else console.error('Unknown role:', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentView('landing');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'student':
        return <StudentPortal onApply={handleApply} />;

      case 'company':
        return <CompanyPortal />;

      case 'admin':
        return <AdminPortal />;

      case 'super-admin':
        return <SuperAdminPortal />;

      case 'supervisor':
        return <SupervisorPortal />;

      case 'application':
        return (
          <ApplicationForm
            onBack={() => setCurrentView('student')}
            internshipTitle={selectedJob?.title || ''}
            companyName={selectedJob?.company || ''}
          />
        );

      case 'login':
        return (
          <Login
            onSwitchToRegister={() => setCurrentView('register')}
            onLogin={handleLogin}
          />
        );

      case 'register':
        return (
          <Register
            onSwitchToLogin={() => setCurrentView('login')}
            onRegister={handleLogin}
          />
        );

      default:
        return (
          <>
            <Hero />
            <Features />
            <section className="bg-slate-50 py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose your journey</h2>
                <p className="text-slate-500 mb-12 max-w-2xl mx-auto">
                  Whether you're looking for your dream internship or the perfect talent for your team, Stag.io has the tools you need.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10">
                  {[
                    {
                      title: 'I am a Student',
                      desc: 'Build your profile, showcase skills, and land top-tier internships with AI matching.',
                      view: 'student' as View,
                      cta: 'Explore Opportunities',
                      gradient: 'from-indigo-600 to-blue-600',
                      icon: User,
                    },
                    {
                      title: 'I am a Company',
                      desc: 'Post offers, review talent, and manage digital agreements effortlessly.',
                      view: 'company' as View,
                      cta: 'Recruit Talent',
                      gradient: 'from-purple-600 to-pink-600',
                      icon: Building2,
                    },
                    {
                      title: 'I am Admin',
                      desc: 'Monitor platform health, validate placements, and view global statistics.',
                      view: 'admin' as View,
                      cta: 'Open Dashboard',
                      gradient: 'from-amber-500 to-orange-600',
                      icon: ShieldCheck,
                    },
                    {
                      title: 'Super Admin',
                      desc: 'Full system control, university onboarding, and global infrastructure management.',
                      view: 'super-admin' as View,
                      cta: 'System Console',
                      gradient: 'from-slate-700 to-slate-900',
                      icon: Settings,
                    },
                    {
                      title: 'Supervisor',
                      desc: 'Manage student progress, provide feedback, and ensure successful internships.',
                      view: 'supervisor' as View,
                      cta: 'Supervisor Dashboard',
                      gradient: 'from-green-500 to-teal-600',
                      icon: UserCheck,
                    },
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col text-left"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                        <card.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-3">{card.title}</h3>
                      <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm flex-1">{card.desc}</p>
                      <button
                        onClick={() => setCurrentView(card.view)}
                        className="w-full py-4 px-6 bg-slate-50 text-slate-900 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all border border-slate-100 group-hover:border-transparent flex items-center justify-center gap-2"
                      >
                        {card.cta}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-right" richColors />
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      <main className="animate-in fade-in duration-700">
        {renderContent()}
      </main>

      {currentView !== 'login' && currentView !== 'register' && <Footer />}
    </div>
  );
}