import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios'; // Import axios directly for public calls
import { authAPI } from '../../services/api';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegister?: (role: string) => void;
}

type UserType = 'student' | 'company' | 'supervisor' | null;

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ UPDATED: Fetching companies using a PUBLIC route
  // We use /api/offers because it's public in your routes list
  // Replace the useEffect for supervisor companies:
useEffect(() => {
  if (userType === 'supervisor') {
    // Fetch approved companies directly
    axios.get('http://localhost:5000/api/offers')
      .then(res => {
        const offers = res.data?.offers || res.data || [];
        // Extract unique companies from offers
        const companyMap = new Map();
        offers.forEach((o: any) => {
          if (o.company?._id && !companyMap.has(o.company._id)) {
            companyMap.set(o.company._id, { _id: o.company._id, name: o.company.name });
          }
        });
        setCompanies(Array.from(companyMap.values()));
      })
      .catch(() => setCompanies([]));
  }
}, [userType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (userType === 'supervisor' && !formData.companyId) {
      newErrors.companyId = 'Please select a company';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      toast.error('Please select a role');
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    try {
      const body: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: userType,
      };

      if (userType === 'supervisor') {
        body.companyId = formData.companyId;
      }

      const res = await authAPI.register(body);
      const { token, role, user } = res.data || {};

      // Handle roles that require manual approval (Inactive by default)
      if (role === 'company' || role === 'supervisor') {
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} account created! Waiting for approval.`);
        onSwitchToLogin();
        return;
      }

      // Students auto-login
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', user.name);
      toast.success('Account created successfully!');
      if (onRegister) onRegister(role);

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName: string, hasError: boolean) => {
    const baseClass = "w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:outline-none transition-all font-medium";
    return hasError ? `${baseClass} border-red-300 focus:border-red-500` : `${baseClass} border-slate-200 focus:border-indigo-500`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-white/50">
          
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-black text-purple-600 uppercase">Join Stag.io</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-3">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Account</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!userType ? (
              <div className="space-y-3">
                <p className="text-sm font-black text-slate-500 uppercase text-center mb-4 text-center">I am a...</p>
                {[
                  { type: 'student', label: '🎓 Student', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' },
                  { type: 'company', label: '🏢 Company', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
                  { type: 'supervisor', label: '👨‍🏫 Supervisor', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
                ].map(({ type, label, color }) => (
                  <button key={type} type="button" onClick={() => setUserType(type as UserType)} className={`w-full p-4 rounded-2xl border-2 font-bold transition-all ${color}`}>
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <button type="button" onClick={() => setUserType(null)} className="flex items-center gap-2 text-sm text-slate-500 font-bold mb-4">
                  <ArrowLeft size={16} /> Change role
                </button>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">Full Name *</label>
                  <input name="name" placeholder="Alice Johnson" value={formData.name} className={getInputClassName('name', !!errors.name)} onChange={handleInputChange} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">Email Address *</label>
                  <input name="email" type="email" placeholder="you@example.com" value={formData.email} className={getInputClassName('email', !!errors.email)} onChange={handleInputChange} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} className={getInputClassName('password', !!errors.password)} onChange={handleInputChange} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">Confirm *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} className={getInputClassName('confirmPassword', !!errors.confirmPassword)} onChange={handleInputChange} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {userType === 'supervisor' && (
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">Select Company *</label>
                    <select name="companyId" value={formData.companyId} onChange={handleInputChange} className={getInputClassName('companyId', !!errors.companyId)}>
                      <option value="">Select a company...</option>
                      {companies.map((c: any) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>}
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <button onClick={onSwitchToLogin} className="text-purple-600 font-bold">Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
};