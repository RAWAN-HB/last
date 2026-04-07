import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, FileText, Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationFormProps {
  onBack: () => void;
  internshipTitle: string;
  companyName: string;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onBack, internshipTitle, companyName }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Application Sent!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Your application for <span className="text-indigo-600 font-bold">{internshipTitle}</span> at <span className="text-indigo-600 font-bold">{companyName}</span> has been received. The company will review your profile and get back to you shortly.
          </p>
          <button 
            onClick={onBack}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Internship Search
        </button>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Internship Application</h1>
                <p className="text-slate-500 font-medium">Applying for <span className="text-indigo-600 font-bold">{internshipTitle}</span> at {companyName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">AI Profile Matching Active</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input required type="email" placeholder="john@university.edu" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Motivation Statement</label>
              <textarea 
                required 
                rows={5} 
                placeholder="Why are you the perfect fit for this role?" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Resume / CV</label>
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:scale-110 transition-all">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 font-medium">PDF, DOCX (Max 10MB)</p>
              </div>
            </div>

            <div className="pt-6">
              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                By submitting, you agree to share your profile data with {companyName}.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
