import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Plus, Download, Eye, CheckCircle2,
  Clock, XCircle, ArrowLeft, PenLine, Trash2,
  Send, RotateCcw, Shield, Calendar, Building2,
  GraduationCap, User, Briefcase, DollarSign
} from 'lucide-react';
import { contractsAPI } from '../../services/api';
import { toast } from 'sonner';

/* ─────────────────────────── Types ─────────────────────────── */
type ContractStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired';
type ContractView   = 'list' | 'create' | 'preview';

interface Contract {
  _id?: string;
  id?: number;
  internName: string;
  role: string;
  school: string;
  department: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
  stipend: string;
  status: ContractStatus;
  createdAt: string;
  signature?: string;
}

interface ContractFormData {
  internName: string;
  role: string;
  school: string;
  startDate: string;
  endDate: string;
  supervisorName: string;
  department: string;
  stipend: string;
}

/* ─────────────────────────── Helpers ───────────────────────── */
const statusConfig: Record<ContractStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Draft:   { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: Clock        },
  Sent:    { color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    icon: Send         },
  Signed:  { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  Expired: { color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     icon: XCircle      },
};

const emptyForm: ContractFormData = {
  internName: '', role: '', school: '',
  startDate: '', endDate: '',
  supervisorName: '', department: '', stipend: '',
};

const fmt = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const getId = (c: Contract) => c._id ?? String(c.id);

/* ═══════════════════════ ContractPage ═══════════════════════ */
export const ContractPage: React.FC = () => {
  const [view, setView]           = useState<ContractView>('list');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [form, setForm]           = useState<ContractFormData>(emptyForm);
  const [errors, setErrors]       = useState<Partial<ContractFormData>>({});
  const [preview, setPreview]     = useState<Contract | null>(null);
  const [sigText, setSigText]     = useState('');
  const [signed, setSigned]       = useState(false);
  const [sigMode, setSigMode]     = useState<'type' | 'draw'>('type');
  const [loading, setLoading]     = useState(true);
  const canvasRef                 = useRef<HTMLCanvasElement>(null);
  const isDrawing                 = useRef(false);

  /* ── Load contracts ── */
  useEffect(() => {
    contractsAPI.list()
      .then(res => setContracts(res.data || []))
      .catch(() => toast.error('Failed to load contracts'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Validation ── */
  const validate = (): boolean => {
    const e: Partial<ContractFormData> = {};
    if (!form.internName.trim())     e.internName     = 'Required';
    if (!form.role.trim())           e.role           = 'Required';
    if (!form.school.trim())         e.school         = 'Required';
    if (!form.startDate)             e.startDate      = 'Required';
    if (!form.endDate)               e.endDate        = 'Required';
    if (!form.supervisorName.trim()) e.supervisorName = 'Required';
    if (!form.department.trim())     e.department     = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Create contract ── */
  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const res = await contractsAPI.create(form);
      setContracts(p => [{ ...res.data, id: res.data._id }, ...p]);
      setForm(emptyForm);
      setErrors({});
      setView('list');
      toast.success('Contract created!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create contract');
    }
  };

  /* ── Open preview ── */
  const openPreview = (c: Contract) => {
    setPreview(c);
    setSigned(!!c.signature);
    setSigText(c.signature ?? '');
    setView('preview');
  };

  /* ── Apply e-signature ── */
  const applySignature = async () => {
    if (!preview) return;
    const sig = sigMode === 'draw'
      ? canvasRef.current?.toDataURL() ?? ''
      : sigText.trim();
    if (!sig) return;
    try {
      const res = await contractsAPI.sign(getId(preview), sig);
      const updated = { ...res.data, id: res.data._id };
      setContracts(p => p.map(c => getId(c) === getId(preview) ? updated : c));
      setPreview(updated);
      setSigned(true);
      toast.success('Contract signed!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sign contract');
    }
  };

  /* ── Delete contract ── */
  const deleteContract = async (c: Contract) => {
    try {
      await contractsAPI.remove(getId(c));
      setContracts(p => p.filter(x => getId(x) !== getId(c)));
      toast.success('Contract deleted');
    } catch {
      toast.error('Failed to delete contract');
    }
  };

  /* ── Canvas drawing ── */
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); }
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { ctx.lineWidth = 2; ctx.strokeStyle = '#4f46e5'; ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke(); }
  };
  const stopDraw = () => { isDrawing.current = false; };
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  /* ─────────────────────── Field component ──────────────────── */
  const Field: React.FC<{
    label: string; field: keyof ContractFormData;
    type?: string; placeholder?: string; icon?: React.ElementType; span?: boolean;
  }> = ({ label, field, type = 'text', placeholder, icon: Icon, span }) => (
    <div className={`flex flex-col gap-1.5 ${span ? 'md:col-span-2' : ''}`}>
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon size={11} />}{label}
      </label>
      <input
        type={type}
        value={form[field]}
        placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
        className={`px-4 py-3 rounded-xl border text-sm font-medium text-slate-800 outline-none transition-all
          ${errors[field]
            ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 bg-white hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
          }`}
      />
      {errors[field] && (
        <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
          <XCircle size={11} /> {errors[field]}
        </span>
      )}
    </div>
  );

  /* ══════════════════════════ LIST VIEW ════════════════════════ */
  if (view === 'list') return (
    <div className="animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contracts</h1>
          <p className="text-slate-500 font-medium">
            {contracts.length} contract{contracts.length !== 1 ? 's' : ''} · {contracts.filter(c => c.status === 'Signed').length} signed
          </p>
        </div>
        <button onClick={() => setView('create')} className="create-offer-btn">
          <Plus size={18} /><span>New Contract</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="stats-grid mb-8">
        {(['Draft', 'Sent', 'Signed'] as ContractStatus[]).map(s => {
          const { color, bg, icon: Icon } = statusConfig[s];
          const count = contracts.filter(c => c.status === s).length;
          return (
            <div key={s} className="stat-card">
              <div className={`stat-icon-wrapper rounded-xl p-3 ${bg} ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="stat-label">{s}</p>
                <p className="stat-value">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="main-card">
        <div className="card-header mb-2">
          <h3 className="font-black text-slate-900">All Contracts</h3>
        </div>
        <div className="candidate-list">
          {loading && (
            <div className="py-16 text-center text-slate-400">
              <p className="font-semibold">Loading...</p>
            </div>
          )}
          {!loading && contracts.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No contracts yet</p>
            </div>
          )}
          {contracts.map(c => {
            const status = (c.status as string) in statusConfig
              ? c.status
              : 'Draft' as ContractStatus;
            const { color, bg, border, icon: Icon } = statusConfig[status];
            return (
              <div key={getId(c)} className="candidate-row">
                <div className="candidate-profile">
                  <div className="avatar-circle">{c.internName?.charAt(0) || '?'}</div>
                  <div>
                    <h4 className="candidate-name">{c.internName}</h4>
                    <p className="candidate-role">{c.role} · {c.school}</p>
                  </div>
                </div>
                <div className="candidate-actions">
                  <div className="status-badge-container">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bg} ${color} ${border}`}>
                      <Icon size={11} />{status}
                    </span>
                    <span className="applied-date">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="action-buttons">
                    <button className="btn-icon view" title="Preview & Sign" onClick={() => openPreview(c)}>
                      <Eye size={17} />
                    </button>
                    <button className="btn-icon accept" title="Download">
                      <Download size={17} />
                    </button>
                    <button className="btn-icon refuse" title="Delete" onClick={() => deleteContract(c)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════ CREATE VIEW ══════════════════════ */
  if (view === 'create') return (
    <div className="animate-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => { setForm(emptyForm); setErrors({}); setView('list'); }}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Contract</h1>
          <p className="text-slate-500 font-medium">Fill in all details to generate the internship agreement</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="main-card p-8">
          <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <User size={12} /> Intern Information
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name"           field="internName"     placeholder="e.g. Alice Johnson"             icon={User}         />
            <Field label="School / University" field="school"         placeholder="e.g. Paris Tech University"     icon={GraduationCap}/>
            <Field label="Role / Position"     field="role"           placeholder="e.g. Frontend Developer Intern" icon={Briefcase}    />
            <Field label="Department"          field="department"     placeholder="e.g. Engineering"               icon={Building2}    />
          </div>
        </div>

        <div className="main-card p-8">
          <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Shield size={12} /> Contract Terms
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Start Date"       field="startDate"      type="date"                          icon={Calendar}  />
            <Field label="End Date"         field="endDate"        type="date"                          icon={Calendar}  />
            <Field label="Supervisor Name"  field="supervisorName" placeholder="e.g. John Smith"        icon={User}      />
            <Field label="Monthly Stipend"  field="stipend"        placeholder="e.g. €600 (optional)"  icon={DollarSign}/>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} className="create-offer-btn">
            <FileText size={18} /> Generate Contract
          </button>
          <button
            onClick={() => { setForm(emptyForm); setErrors({}); setView('list'); }}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════ PREVIEW VIEW ═════════════════════ */
  if (view === 'preview' && preview) return (
    <div className="animate-in">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button onClick={() => setView('list')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight truncate">Contract Preview</h1>
          <p className="text-slate-500 font-medium">{preview.internName} · {preview.role}</p>
        </div>
        <button className="create-offer-btn">
          <Download size={18} /> Download PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Contract document */}
        <div className="main-card p-10 shadow-xl space-y-7 font-serif text-slate-800">
          <div className="text-center border-b border-slate-100 pb-7">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-lg shadow-indigo-200">
              S
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Internship Agreement</h2>
            <p className="text-slate-400 text-sm mt-1 font-sans">
              Stag.io Platform · Generated {preview.createdAt ? new Date(preview.createdAt).toLocaleDateString() : '—'}
            </p>
            {(() => {
              const status = (preview.status as string) in statusConfig ? preview.status : 'Draft' as ContractStatus;
              const cfg = statusConfig[status];
              return (
                <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                  {React.createElement(cfg.icon, { size: 11 })} {status}
                </div>
              );
            })()}
          </div>

          <section className="space-y-2.5">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 font-sans">1. Parties</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              This internship agreement is entered into between <strong className="text-slate-900">Stag.io Company</strong> (the "Company")
              and <strong className="text-slate-900">{preview.internName}</strong> (the "Intern"), currently enrolled
              at <strong className="text-slate-900">{preview.school}</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 font-sans">2. Position & Duration</h3>
            <div className="grid grid-cols-2 gap-3 font-sans">
              {[
                { label: 'Role',       value: preview.role,            icon: Briefcase   },
                { label: 'Department', value: preview.department,      icon: Building2   },
                { label: 'Start Date', value: fmt(preview.startDate),  icon: Calendar    },
                { label: 'End Date',   value: fmt(preview.endDate),    icon: Calendar    },
                { label: 'Supervisor', value: preview.supervisorName,  icon: User        },
                { label: 'Stipend',    value: preview.stipend || '—',  icon: DollarSign  },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="mt-0.5 text-indigo-400"><Icon size={14} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 font-sans">3. Terms & Conditions</h3>
            <ul className="text-sm space-y-2 text-slate-600 font-sans">
              {[
                'The intern agrees to maintain strict confidentiality of all company information.',
                'Working hours shall not exceed 35 hours per week.',
                'The company agrees to provide meaningful, supervised work experience.',
                "Either party may terminate this agreement with 7 days' written notice.",
                'The intern remains enrolled and in good standing at their academic institution.',
                'All work produced during the internship is the intellectual property of the Company.',
              ].map((clause, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1 w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {clause}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-slate-100 pt-7 font-sans">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-5">4. Signatures</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Company Representative</p>
                <div className="h-14 border-b-2 border-slate-200 mb-2 flex items-end pb-1">
                  <span className="text-xl text-slate-400 italic font-serif">Stag.io</span>
                </div>
                <p className="text-[11px] text-slate-400">Authorised Signatory</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Intern Signature {preview.status !== 'Signed' && <span className="text-red-400">*required</span>}
                </p>
                {signed && preview.signature ? (
                  <div className="h-14 border-b-2 border-emerald-300 mb-2 flex items-end pb-1 gap-2">
                    {preview.signature.startsWith('data:') ? (
                      <img src={preview.signature} alt="signature" className="h-10 object-contain" />
                    ) : (
                      <span className="text-2xl text-indigo-600 italic font-serif">{preview.signature}</span>
                    )}
                    <CheckCircle2 size={16} className="text-emerald-500 mb-1" />
                  </div>
                ) : (
                  <div className="h-14 border-b-2 border-dashed border-slate-300 mb-2 flex items-center justify-center text-slate-300 text-xs font-semibold">
                    awaiting signature
                  </div>
                )}
                <p className="text-[11px] text-slate-400">{preview.internName} · {fmt(preview.startDate)}</p>
              </div>
            </div>
          </section>
        </div>

        {/* E-Signature panel */}
        {!signed && (
          <div className="main-card p-7 border-2 border-indigo-100">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <PenLine size={16} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">E-Signature</h3>
                <p className="text-xs text-slate-500">Sign digitally to finalise this contract</p>
              </div>
            </div>

            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
              {(['type', 'draw'] as const).map(mode => (
                <button key={mode} onClick={() => setSigMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                    sigMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {mode === 'type' ? '✏️ Type' : '🖊 Draw'}
                </button>
              ))}
            </div>

            {sigMode === 'type' ? (
              <input type="text" value={sigText} onChange={e => setSigText(e.target.value)}
                placeholder={`Type your full name: ${preview.internName}`}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xl italic font-serif text-indigo-700 placeholder:text-slate-300 placeholder:not-italic placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            ) : (
              <div className="relative">
                <canvas ref={canvasRef} width={600} height={100}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl cursor-crosshair bg-white"
                  style={{ touchAction: 'none' }} />
                <button onClick={clearCanvas} className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Clear">
                  <RotateCcw size={14} className="text-slate-400" />
                </button>
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">Draw your signature above</p>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={applySignature}
                disabled={sigMode === 'type' && !sigText.trim()}
                className="create-offer-btn disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle2 size={16} /> Apply Signature
              </button>
              <p className="text-[11px] text-slate-400 self-center leading-tight">
                By signing you agree to the terms<br />outlined in this contract.
              </p>
            </div>
          </div>
        )}

        {/* Signed confirmation */}
        {signed && (
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-black text-emerald-800 text-sm">Contract Signed Successfully</p>
              <p className="text-emerald-600 text-xs">This agreement is now legally binding. Download a copy for your records.</p>
            </div>
            <button className="ml-auto create-offer-btn !bg-emerald-600 hover:!bg-emerald-700">
              <Download size={16} /> Download
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return null;
};