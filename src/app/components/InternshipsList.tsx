// InternshipsList.tsx
import React, { useState } from 'react';
import { Plus, Briefcase, MapPin, Clock, Users, CheckCircle2, Clock4, FileText, Loader2, AlertCircle } from 'lucide-react';

interface InternshipsListProps {
  offers: any[];
  loading: boolean;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const InternshipsList: React.FC<InternshipsListProps> = ({ 
  offers, 
  loading, 
  onCreateNew,
  onRefresh 
}) => {
  const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'draft' | 'expired'>('all');

  const isExpired = (offer: any) => {
    const deadline = new Date(offer.applicationDeadline);
    return deadline < new Date();
  };

  const getDaysLeft = (offer: any) => {
    const deadline = new Date(offer.applicationDeadline);
    const diffTime = deadline.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredOffers = (() => {
    let result = offers;
    if (filter === 'published') result = offers.filter(o => o.status === 'published');
    else if (filter === 'pending') result = offers.filter(o => o.status === 'pending');
    else if (filter === 'draft') result = offers.filter(o => o.status === 'draft');
    else if (filter === 'expired') result = offers.filter(isExpired);
    return result;
  })();

  const getStatusStyles = (status: string, isExp: boolean) => {
    if (isExp && status !== 'closed') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    const styles: Record<string, string> = {
      published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      draft: 'bg-slate-100 text-slate-600 border-slate-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      closed: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return styles[status] || styles.pending;
  };

  const formatStatus = (offer: any) => {
    if (isExpired(offer) && offer.status !== 'closed') return 'expired';
    return offer.status;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">My Internship Offers</h2>
          <p className="text-slate-500 font-medium">
            Manage your job postings and track their status
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Refresh
          </button>
          <button 
            onClick={onCreateNew} 
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black hover:shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Offer
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'all', label: `All Offers (${offers.length})` },
          { id: 'published', label: `Published (${offers.filter(o => o.status === 'published').length})` },
          { id: 'pending', label: `Pending (${offers.filter(o => o.status === 'pending').length})` },
          { id: 'draft', label: `Drafts (${offers.filter(o => o.status === 'draft').length})` },
          { id: 'expired', label: `Expired (${offers.filter(isExpired).length})` },
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offers list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Briefcase size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="font-bold text-lg text-slate-900 mb-2">
            {filter === 'all' ? 'No offers yet' : `No ${filter} offers`}
          </p>
          <p className="text-slate-500 mb-6">
            {filter === 'all' 
              ? 'Create your first internship offer to get started' 
              : `You don't have any ${filter} offers at the moment`}
          </p>
          <button 
            onClick={onCreateNew}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all"
          >
            Create New Offer
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const expired = isExpired(offer);
            const status = formatStatus(offer);
            const daysLeft = getDaysLeft(offer);
            const deadlineText = expired ? 'Expired' : `${daysLeft > 0 ? daysLeft + ' days left' : 'Today'} • ${new Date(offer.applicationDeadline).toLocaleDateString()}`;
            
            return (
              <div 
                key={offer._id} 
                className={`rounded-2xl border p-6 hover:shadow-lg transition-all ${
                  expired ? 'border-red-200 bg-red-50/50 opacity-90' : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Left: Job info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                        {offer.jobTitle?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{offer.jobTitle}</h3>
                        <p className="text-slate-500 text-sm">{offer.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" />
                        {offer.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" />
                        {offer.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} className="text-slate-400" />
                        {offer.numberOfPositions} position{offer.numberOfPositions > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Deadline info */}
                    <div className={`flex items-center gap-2 mt-3 p-2 rounded-lg ${
                      expired ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'
                    }`}>
                      <Clock4 size={14} className={expired ? 'text-red-500' : 'text-emerald-600'} />
                      <span className={`text-sm font-bold ${expired ? 'text-red-700' : 'text-emerald-700'}`}>
                        {deadlineText}
                      </span>
                    </div>

                    {offer.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {offer.requiredSkills.slice(0, 3).map((skill: string) => (
                          <span 
                            key={skill} 
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                        {offer.requiredSkills.length > 3 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                            +{offer.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Status & actions */}
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border ${getStatusStyles(offer.status, expired)} flex items-center gap-1`}>
                      {expired && offer.status !== 'closed' ? (
                        <>
                          <AlertCircle size={12} />
                          Expired
                        </>
                      ) : offer.status === 'pending' ? (
                        'Pending Approval'
                      ) : (
                        offer.status.charAt(0).toUpperCase() + offer.status.slice(1)
                      )}
                    </span>
                    
                    <p className="text-xs text-slate-400">
                      Created {new Date(offer.createdAt).toLocaleDateString()}
                    </p>

                    {offer.status === 'pending' && !expired && (
                      <p className="text-xs text-amber-600 font-medium text-right">
                        Awaiting admin<br />approval
                      </p>
                    )}

                    {offer.status === 'published' && !expired && (
                      <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                        <CheckCircle2 size={14} />
                        Live
                      </div>
                    )}

                    <button className={`mt-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${expired ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {expired ? 'Expired' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
