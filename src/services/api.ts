import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth interceptor ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor (auto-logout on 401) ─
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/* ══════════════════════════════════════════════
   AUTH  →  /api/auth
══════════════════════════════════════════════ */
export const authAPI = {
  login:    (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: {
    name: string; email: string; password: string;
    role: 'student' | 'company' | 'supervisor';
    companyId?: string;
  }) => api.post('/auth/register', userData),

  me: () => api.get('/auth/me'),
};

/* ══════════════════════════════════════════════
   OFFERS  →  /api/offers
══════════════════════════════════════════════ */
export const offersAPI = {
  list:         (params?: object)          => api.get('/offers', { params }),
  getById:      (id: string)               => api.get(`/offers/${id}`),
  getMyOffers:  ()                         => api.get('/offers/company/my'),
  getDomains:   ()                         => api.get('/offers/domains'),
  getLocations: ()                         => api.get('/offers/locations'),
  getAllAdmin:   ()                         => api.get('/offers/admin/all'),
  create:       (data: object)             => api.post('/offers', data),
  update:       (id: string, data: object) => api.put(`/offers/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.put(`/offers/${id}/status`, { status }),
  close:        (id: string)               => api.patch(`/offers/${id}/close`),
  remove:       (id: string)               => api.delete(`/offers/${id}`),
};

/* ══════════════════════════════════════════════
   APPLICATIONS  →  /api/applications
══════════════════════════════════════════════ */
export const applicationsAPI = {
  apply: (offerId: string, data: FormData) =>
    api.post(`/applications/apply/${offerId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }, // ✅ Fixed
    }),
  
  getMyApplications:    ()              => api.get('/applications/my/applications'),
  getMyApplicationById: (id: string)    => api.get(`/applications/my/${id}`),
  withdraw:             (id: string)    => api.delete(`/applications/my/${id}`),
  getOfferApplications: (offerId: string) =>
    api.get(`/applications/offer/${offerId}`),
  review:     (id: string, status: string) =>
    api.put(`/applications/${id}/review`, { status }),
  validate:   (id: string, status: string, adminNote?: string) =>
    api.put(`/applications/${id}/validate`, { status, adminNote }),
  getAllAdmin: ()                        => api.get('/applications/admin/all'),
};

/* ══════════════════════════════════════════════
   CONVENTIONS  →  /api/conventions
══════════════════════════════════════════════ */
export const conventionsAPI = {
  // Student
  getMy:     ()           => api.get('/conventions/my'),
  download:  (id: string) => api.get(`/conventions/my/${id}/download`),

  // Admin
  getAll:    ()           => api.get('/conventions'),
  getById:   (id: string) => api.get(`/conventions/${id}`),
  validate:  (id: string, status: string, adminNote?: string) =>
    api.put(`/conventions/${id}/validate`, { status, adminNote }),

  // ✅ FIXED: Company supervisor assignment (SupervisorManagement modal)
  getCompanyConventions: () => api.get('/conventions/company'),
  getCompanyPendingSupervisor: () => api.get('/conventions/company/pending-supervisor'),
  assignSupervisor: (id: string, supervisorId: string) =>
    api.put(`/conventions/${id}/supervisor`, { supervisorId }),

  // Certificates
  getAllCertificates:   ()    => api.get('/conventions/certificates'),
  validateCertificate: (id: string, status: string, adminNote?: string) =>
    api.put(`/conventions/certificates/${id}`, { status, adminNote }),
  getMyCertificate:    ()    => api.get('/conventions/my/certificate'),
  generateCertificateForApplication: (applicationId: string) =>
    api.post(`/conventions/application/${applicationId}/certificate/generate`),
};

/* ══════════════════════════════════════════════
   CONTRACTS  →  uses conventions backend
══════════════════════════════════════════════ */
export const contractsAPI = {
  list:    ()            => api.get('/conventions'),
  getById: (id: string)  => api.get(`/conventions/${id}`),
  create:  (data: {
    internName: string; role: string; school: string;
    department: string; supervisorName: string;
    startDate: string; endDate: string;
    stipend?: string; candidateId?: string;
  })                     => api.post('/conventions', data),
  sign:    (id: string, signature: string) =>
    api.patch(`/conventions/${id}/sign`, { signature }),
  send:    (id: string)  => api.patch(`/conventions/${id}/send`),
  remove:  (id: string)  => api.delete(`/conventions/${id}`),
};

/* ══════════════════════════════════════════════
   SUPERVISOR  →  /api/supervisor
══════════════════════════════════════════════ */
export const supervisorAPI = {
  getStudents:       ()                    => api.get('/supervisor/students'),
  getStudentDetails: (trackingId: string)  => api.get(`/supervisor/students/${trackingId}`),
  markAttendance:    (trackingId: string, data: {
    date: string; status: string; note?: string;
  })                                       => api.post(`/supervisor/students/${trackingId}/attendance`, data),
  submitWeeklyReport: (trackingId: string, data: object) =>
    api.post(`/supervisor/students/${trackingId}/weekly-report`, data),
  submitFinalEvaluation: (trackingId: string, data: {
    performanceScore: number; attendanceScore: number;
    tasksScore: number; comment?: string;
  })                                       => api.post(`/supervisor/students/${trackingId}/evaluate`, data),
};

/* ══════════════════════════════════════════════
   COMPANY  →  /api/company
══════════════════════════════════════════════ */
export const companyAPI = {
  getStats:              () => api.get('/company/stats'),
  getRecentApplications: () => api.get('/company/applications/recent'),
  getSupervisors:        () => api.get('/company/supervisors'),
  
  // ✅ Supervisor Management (your component)
  getSupervisorRequests:     () => api.get('/company/supervisor-requests'),
  getApprovedSupervisors:    () => api.get('/company/approved-supervisors'),
  approveSupervisor:         (id: string) => api.put(`/company/supervisor-requests/${id}/approve`),
  rejectSupervisor:          (id: string) => api.put(`/company/supervisor-requests/${id}/reject`),
   assignSupervisorToOffer:(id: string, offerId: string) =>   // ← new
    api.put(`/company/supervisor-requests/${id}/assign-offer`, { offerId }),

  
  // Supervisor assignment to offers
  getCompanySupervisors:     () => api.get('/company/my-supervisors'),
  getMyOffersWithSupervisors: () => api.get('/company/my-offers-with-supervisors'),
  removeSupervisorFromOffer: (offerId: string) => 
    api.delete(`/company/offers/${offerId}/supervisor`),
  
  // NEW: View student evaluations
  getStudentEvaluations:     () => api.get('/company/evaluations/students'),
  
  // NEW: Get company certificates
  getCompanyCertificates:    () => api.get('/company/certificates'),
};

/* ══════════════════════════════════════════════
   ADMIN  →  /api/admin
══════════════════════════════════════════════ */
export const adminAPI = {
  getStats:               ()               => api.get('/admin/stats'),
  getValidationQueue:     ()               => api.get('/admin/validation-queue'),
  getPendingConventions:  ()               => api.get('/admin/conventions/pending'),
  getPendingCertificates: ()               => api.get('/admin/certificates/pending'),
  getAllUsers:             (params?: object) => api.get('/admin/users', { params }),
};

/* ══════════════════════════════════════════════
   SUPER ADMIN  →  /api/super
══════════════════════════════════════════════ */
export const superAdminAPI = {
  getStats:           ()                => api.get('/super/stats'),
  getAllUsers:         (params?: object) => api.get('/super/users', { params }),
  getPendingCompanies: ()               => api.get('/super/companies/pending'),
  getPendingOffers:    ()               => offersAPI.getAllAdmin().then(res => res.data.filter((o: any) => o.status === 'pending')),
  approveCompany:     (id: string)      => api.put(`/super/companies/${id}/approve`),
  suspendCompany:     (id: string)      => api.put(`/super/companies/${id}/suspend`),
  createAdmin:        (data: {
    name: string; email: string; password: string;
  })                                    => api.post('/super/admins', data),
  updateUserRole:     (id: string, role: string) =>
    api.put(`/super/users/${id}/role`, { role }),
  deleteUser:         (id: string)      => api.delete(`/super/users/${id}`),
  toggleUserStatus:   (id: string)      => api.put(`/super/users/${id}/toggle`),
};

/* ══════════════════════════════════════════════
   STUDENT  →  /api/student
══════════════════════════════════════════════ */
export const studentAPI = {
  getProfile:    ()             => api.get('/student/profile'),
  updateProfile: (data: object) => api.put('/student/profile', data),
  getDashboard:  ()             => api.get('/student/dashboard'),
};