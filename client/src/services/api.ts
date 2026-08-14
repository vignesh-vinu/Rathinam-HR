import { Application, User, ApplicationStatus, NotificationItem, AuditLogItem, PDFFieldMapping } from '../types';

const API_BASE = '/api';

async function fetchJSON(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('rathinam_hr_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  verify2FA: async (otp: string) => {
    return fetchJSON(`${API_BASE}/auth/verify-2fa`, {
      method: 'POST',
      body: JSON.stringify({ otp })
    });
  },

  getCurrentUser: async () => {
    return fetchJSON(`${API_BASE}/auth/me`);
  },

  // Applications Public
  submitApplication: async (payload: Partial<Application>) => {
    return fetchJSON(`${API_BASE}/applications/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  trackApplication: async (applicationId: string, identifier?: string) => {
    return fetchJSON(`${API_BASE}/applications/track`, {
      method: 'POST',
      body: JSON.stringify({ applicationId, identifier })
    });
  },

  // Applications HR Admin
  getApplications: async (params: {
    organizationId?: string;
    status?: string;
    search?: string;
    qualification?: string;
    dateFilter?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.organizationId) query.append('organizationId', params.organizationId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.qualification) query.append('qualification', params.qualification);
    if (params.dateFilter) query.append('dateFilter', params.dateFilter);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    return fetchJSON(`${API_BASE}/applications?${query.toString()}`);
  },

  getApplicationById: async (id: string) => {
    return fetchJSON(`${API_BASE}/applications/${id}`);
  },

  updateApplication: async (id: string, payload: Partial<Application>) => {
    return fetchJSON(`${API_BASE}/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  updateStatus: async (id: string, status: ApplicationStatus, remarks: string, updatedBy?: string) => {
    return fetchJSON(`${API_BASE}/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks, updatedBy })
    });
  },

  addHRNote: async (id: string, content: string, author?: string) => {
    return fetchJSON(`${API_BASE}/applications/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, author })
    });
  },

  deleteApplication: async (id: string, deletedBy?: string) => {
    return fetchJSON(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ deletedBy })
    });
  },

  bulkAction: async (action: 'STATUS_CHANGE' | 'DELETE', ids: string[], status?: string, remarks?: string) => {
    return fetchJSON(`${API_BASE}/applications/bulk`, {
      method: 'POST',
      body: JSON.stringify({ action, ids, status, remarks })
    });
  },

  // Analytics
  getDashboardAnalytics: async (organizationId?: string) => {
    const query = organizationId ? `?organizationId=${organizationId}` : '';
    return fetchJSON(`${API_BASE}/analytics/dashboard${query}`);
  },

  // Notifications
  getNotifications: async (organizationId?: string) => {
    const query = organizationId ? `?organizationId=${organizationId}` : '';
    return fetchJSON(`${API_BASE}/notifications${query}`);
  },

  markNotificationRead: async (id: string) => {
    return fetchJSON(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead: async () => {
    return fetchJSON(`${API_BASE}/notifications/mark-all-read`, { method: 'POST' });
  },

  // Audit Logs
  getAuditLogs: async () => {
    return fetchJSON(`${API_BASE}/audit`);
  },

  // PDF Mapping
  getPDFMapping: async () => {
    return fetchJSON(`${API_BASE}/pdf-mapping`);
  },

  addPDFMapping: async (mapping: Partial<PDFFieldMapping>) => {
    return fetchJSON(`${API_BASE}/pdf-mapping/add`, {
      method: 'POST',
      body: JSON.stringify(mapping)
    });
  },

  // File Upload
  uploadFile: async (file: File, docType: string = 'Document') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    const token = localStorage.getItem('rathinam_hr_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
      headers
    });
    return response.json();
  }
};
