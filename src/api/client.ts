import {
  AuthResponse,
  DashboardStats,
  Page,
  User,
  UserDetailView,
  SubscriptionGrant,
  AdminAuditLog,
  PaymentTransaction,
  SubscriptionTier,
  Announcement,
  PromoCode,
} from '../types';

const resolveBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // If running in browser and NOT on localhost/127.0.0.1, default to Render backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://springboot-igj8.onrender.com';
  }
  return 'http://localhost:8080';
};

const BASE_URL = resolveBaseUrl();

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('winterarc_admin_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('winterarc_admin_token', token);
    } else {
      localStorage.removeItem('winterarc_admin_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: any) {
      // If direct fetch to BASE_URL failed (e.g. adblocker, local network, or mixed content),
      // attempt relative fetch (which relies on Vite proxy locally or Vercel rewrites in production)
      if (BASE_URL && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
        try {
          response = await fetch(endpoint, {
            ...options,
            headers,
          });
        } catch {
          throw new Error(`Cannot connect to Winter Arc API at ${BASE_URL}. Please ensure the server is online.`);
        }
      } else {
        throw new Error(`Cannot connect to Winter Arc API at ${BASE_URL}. Please ensure the server is online.`);
      }
    }

    if (response.status === 401) {
      this.setToken(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Session expired or unauthorized. Please log in again.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}: Request failed`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // --- Auth APIs ---
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // --- Dashboard APIs ---
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/admin/dashboard/stats');
  }

  // --- User Management APIs ---
  async searchUsers(params: {
    page?: number;
    size?: number;
    query?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    direction?: string;
  }): Promise<Page<User>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    if (params.query) searchParams.set('query', params.query);
    if (params.role) searchParams.set('role', params.role);
    if (params.status) searchParams.set('status', params.status);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.direction) searchParams.set('direction', params.direction);

    return this.request<Page<User>>(`/api/admin/users?${searchParams.toString()}`);
  }

  async getUserDetails(userId: string): Promise<UserDetailView> {
    return this.request<UserDetailView>(`/api/admin/users/${userId}`);
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED', reason: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  }

  async updateUserRole(userId: string, role: string, reason: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role, reason }),
    });
  }

  // --- Complimentary Subscription Management APIs ---
  async grantComplimentarySubscription(userId: string, data: {
    tier: SubscriptionTier;
    durationDays?: number | null;
    customExpiryDate?: string | null;
    grantType?: string;
    reason: string;
  }): Promise<{ message: string; grant: SubscriptionGrant }> {
    return this.request<{ message: string; grant: SubscriptionGrant }>(`/api/admin/users/${userId}/complimentary-subscriptions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async extendSubscription(userId: string, additionalDays: number, reason: string): Promise<{ message: string; newExpiryDate: string }> {
    return this.request<{ message: string; newExpiryDate: string }>(`/api/admin/users/${userId}/subscriptions/extend`, {
      method: 'POST',
      body: JSON.stringify({ additionalDays, reason }),
    });
  }

  async revokeSubscription(userId: string, reason: string): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>(`/api/admin/users/${userId}/subscriptions/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getAllGrants(params: { page?: number; size?: number; status?: string }): Promise<Page<SubscriptionGrant>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    if (params.status) searchParams.set('status', params.status);

    return this.request<Page<SubscriptionGrant>>(`/api/admin/subscription-grants?${searchParams.toString()}`);
  }

  // --- Audit Logs APIs ---
  async getAuditLogs(params: { page?: number; size?: number; action?: string }): Promise<Page<AdminAuditLog>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    if (params.action) searchParams.set('action', params.action);

    return this.request<Page<AdminAuditLog>>(`/api/admin/audit-logs?${searchParams.toString()}`);
  }

  async getUserAuditLogs(userId: string, params: { page?: number; size?: number }): Promise<Page<AdminAuditLog>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());

    return this.request<Page<AdminAuditLog>>(`/api/admin/audit-logs/user/${userId}?${searchParams.toString()}`);
  }

  // --- Payments APIs ---
  async getPayments(params: { page?: number; size?: number }): Promise<Page<PaymentTransaction>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());

    return this.request<Page<PaymentTransaction>>(`/api/admin/payments?${searchParams.toString()}`);
  }

  // --- Security Profile APIs ---
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/admin/users/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  }

  // --- CSV Export APIs ---
  async exportUsersCsv(): Promise<void> {
    return this.downloadCsv('/api/admin/users/export/csv', 'winterarc-users.csv');
  }

  async exportGrantsCsv(): Promise<void> {
    return this.downloadCsv('/api/admin/subscription-grants/export/csv', 'winterarc-complimentary-grants.csv');
  }

  async exportPaymentsCsv(): Promise<void> {
    return this.downloadCsv('/api/admin/payments/export/csv', 'winterarc-payments.csv');
  }

  async exportAuditLogsCsv(): Promise<void> {
    return this.downloadCsv('/api/admin/audit-logs/export/csv', 'winterarc-audit-logs.csv');
  }

  private async downloadCsv(endpoint: string, fallbackFilename: string): Promise<void> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    let response: Response;
    try {
      response = await fetch(url, { headers });
    } catch {
      response = await fetch(endpoint, { headers });
    }

    if (!response.ok) {
      throw new Error(`Failed to export CSV: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fallbackFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  // --- Announcements / Broadcast APIs ---
  async getAnnouncements(params: { page?: number; size?: number }): Promise<Page<Announcement>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());

    return this.request<Page<Announcement>>(`/api/admin/announcements?${searchParams.toString()}`);
  }

  async createAnnouncement(data: {
    title: string;
    message: string;
    type: string;
    durationDays?: number;
  }): Promise<Announcement> {
    return this.request<Announcement>('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleAnnouncement(id: string): Promise<Announcement> {
    return this.request<Announcement>(`/api/admin/announcements/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteAnnouncement(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Promo Codes APIs ---
  async getPromoCodes(params: { page?: number; size?: number }): Promise<Page<PromoCode>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());

    return this.request<Page<PromoCode>>(`/api/admin/promo-codes?${searchParams.toString()}`);
  }

  async createPromoCode(data: {
    code: string;
    discountPercent: number;
    tierGrant?: string;
    durationDays?: number;
    maxRedemptions?: number;
    validDays?: number;
  }): Promise<PromoCode> {
    return this.request<PromoCode>('/api/admin/promo-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async togglePromoCode(id: string): Promise<PromoCode> {
    return this.request<PromoCode>(`/api/admin/promo-codes/${id}/toggle`, {
      method: 'PATCH',
    });
  }
}

export const api = new ApiClient();
