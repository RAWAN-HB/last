import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Calendar, DollarSign, Clock, Users, FileText, Building2, GraduationCap, Star, AlertCircle, CheckCircle, ArrowLeft, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { offersAPI, companyAPI } from '../../services/api';

interface CreateInternshipProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateInternship: React.FC<CreateInternshipProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    location: '',
    workType: 'on-site',
    duration: '',
    salary: '',
    numberOfPositions: '',
    startDate: '',
    applicationDeadline: '',
    description: '',
    additionalRequirements: '',
    keyResponsibilities: '',
    requiredSkills: '',
    educationLevel: 'bachelor',
    experienceLevel: 'entry level',
    domain: '',
    internshipType: 'PFE',
    supervisorId: '', // ✅ NEW: Selected supervisor
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ NEW: Fetch approved supervisors on mount
  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    setLoadingSupervisors(true);
    try {
      const res = await companyAPI.getCompanySupervisors();
      setSupervisors(res.data || []);
    } catch (err) {
      console.error('Failed to load supervisors:', err);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    if (!formData.numberOfPositions || Number(formData.numberOfPositions) < 1) {
      newErrors.numberOfPositions = 'Number of positions must be at least 1';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (!formData.keyResponsibilities.trim()) {
      newErrors.keyResponsibilities = 'Key responsibilities are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' = 'published') => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        numberOfPositions: Number(formData.numberOfPositions),
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        status,
        // Only include supervisorId if selected
        ...(formData.supervisorId && { supervisorId: formData.supervisorId }),
      };

      await offersAPI.create(payload);
      toast.success(status === 'draft' ? 'Offer saved as draft!' : 'Offer submitted for approval!');
      onSuccess();
    } catch (err: any) {
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create offer';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => errors[fieldName] ? (
    <p className="text-red-500 text-xs mt-1 font-medium">{errors[fieldName]}</p>
  ) : null;

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full px-4 py-3 bg-slate-50 border-2 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all";
    return errors[fieldName] 
      ? baseClass.replace('border-slate-200', 'border-red-300 focus:border-red-500') 
      : baseClass.replace('border-slate-200', 'border-slate-200');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Create New Internship Offer</h1>
              <p className="text-slate-500 font-medium">Fill in the details to post a new opportunity</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'published')} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Basic Info */}
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Basic Information
            </h2>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input 
                name="jobTitle" 
                value={formData.jobTitle} 
                onChange={handleChange}
                className={getInputClassName('jobTitle')}
                placeholder="e.g., Frontend Developer Intern" 
              />
              {getFieldError('jobTitle')}
            </div>

            {[
              { label: 'Department', name: 'department', icon: Building2, placeholder: 'e.g., Engineering', required: true },
              { label: 'Location', name: 'location', icon: MapPin, placeholder: 'e.g., Paris, France', required: true },
              { label: 'Duration', name: 'duration', icon: Clock, placeholder: 'e.g., 6 months', required: true },
              { label: 'Salary', name: 'salary', icon: DollarSign, placeholder: 'e.g., €1500/month', required: false },
              { label: 'Domain', name: 'domain', icon: Star, placeholder: 'e.g., Web Development', required: false },
            ].map(({ label, name, icon: Icon, placeholder, required }) => (
              <div key={name}>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    name={name} 
                    value={(formData as any)[name]} 
                    onChange={handleChange}
                    className={getInputClassName(name)}
                    placeholder={placeholder} 
                  />
                </div>
                {getFieldError(name)}
              </div>
            ))}

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Number of Positions <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  name="numberOfPositions" 
                  value={formData.numberOfPositions} 
                  onChange={handleChange} 
                  min="1"
                  className={getInputClassName('numberOfPositions')}
                  placeholder="e.g., 3" 
                />
              </div>
              {getFieldError('numberOfPositions')}
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Application Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  name="applicationDeadline" 
                  value={formData.applicationDeadline} 
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Work Type</label>
              <select 
                name="workType" 
                value={formData.workType} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="on-site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Internship Type</label>
              <select 
                name="internshipType" 
                value={formData.internshipType} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="PFE">PFE</option>
                <option value="graduation">Graduation</option>
                <option value="seasonal">Seasonal</option>
                <option value="part-time">Part-time</option>
                <option value="academic">Academic</option>
              </select>
            </div>

            {/* ✅ NEW: Supervisor Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Assign Supervisor
                <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <select 
                name="supervisorId" 
                value={formData.supervisorId} 
                onChange={handleChange}
                disabled={loadingSupervisors}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              >
                <option value="">
                  {loadingSupervisors ? 'Loading supervisors...' : 'Select a supervisor (optional)'}
                </option>
                {supervisors.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name} - {sup.department || 'No department'} ({sup.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                This supervisor will be pre-assigned to interns who join this program. You can change this later.
              </p>
              {supervisors.length === 0 && !loadingSupervisors && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">
                    <strong>No approved supervisors found.</strong>{' '}
                    <a href="/company-portal?tab=supervisors" className="underline hover:text-amber-900">
                      Go to Supervisor Management
                    </a>{' '}
                    to approve supervisor requests first.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="p-8 border-t border-slate-100 bg-gradient-to-r from-emerald-50/30 to-cyan-50/30">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Requirements
            </h2>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Education Level</label>
              <select 
                name="educationLevel" 
                value={formData.educationLevel} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="phd">PhD</option>
                <option value="any">Any</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Experience Level</label>
              <select 
                name="experienceLevel" 
                value={formData.experienceLevel} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="entry level">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-slate-700 mb-2">Required Skills (comma separated)</label>
              <input 
                name="requiredSkills" 
                value={formData.requiredSkills} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g., React, TypeScript, Git" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-slate-700 mb-2">Additional Requirements</label>
              <textarea 
                name="additionalRequirements" 
                value={formData.additionalRequirements} 
                onChange={handleChange} 
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none"
                placeholder="Any additional requirements..." 
              />
            </div>
          </div>

          {/* Description - REQUIRED */}
          <div className="p-8 border-t border-slate-100 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" /> Job Description <span className="text-red-500">*</span>
            </h2>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={5}
                className={getInputClassName('description')}
                placeholder="Detailed description of the internship..." 
              />
              {getFieldError('description')}
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Key Responsibilities <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="keyResponsibilities" 
                value={formData.keyResponsibilities} 
                onChange={handleChange} 
                rows={5}
                className={getInputClassName('keyResponsibilities')}
                placeholder="Main responsibilities and duties..." 
              />
              {getFieldError('keyResponsibilities')}
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 font-medium">
                Fields marked with <span className="text-red-500">*</span> are required. 
                Once submitted, your offer will be reviewed by an admin before being published.
                {formData.supervisorId && (
                  <span className="block mt-1 text-indigo-600">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Supervisor will be pre-assigned to this offer.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
            <button 
              type="button" 
              onClick={onBack} 
              className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={(e) => handleSubmit(e as any, 'draft')} 
                disabled={loading}
                className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};