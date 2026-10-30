import {
  User,
  SecurityIncident,
  AuditLog,
  FirewallInspectionResult,
  ComplianceReport,
  DashboardMetrics,
  OrgSettings,
  UserRole,
  IncidentSeverity,
  IncidentStatus,
} from '../types';

const TOKEN_KEY = 'securetrust_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || (data.details ? data.details.join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async register(data: {
    organizationName: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  async getDemoUsers(): Promise<{ demoUsers: { email: string; role: UserRole; description: string }[] }> {
    return request<{ demoUsers: { email: string; role: UserRole; description: string }[] }>('/auth/demo-users');
  },

  logout(): void {
    setStoredToken(null);
  },

  // Dashboard
  async getDashboardMetrics(): Promise<{
    metrics: DashboardMetrics;
    categoryCounts: Record<string, number>;
    trendTimeline: Array<{ timestamp: string; inspections: number; threatsBlocked: number; piiScrubbed: number; avgRisk: number }>;
    recentIncidents: SecurityIncident[];
    recentLogs: AuditLog[];
  }> {
    return request('/dashboard/metrics');
  },

  // Firewall
  async inspectFirewall(payload: {
    prompt: string;
    sensitivity: 'Low' | 'Medium' | 'Strict';
    inputType?: string;
    complianceStandard?: string;
  }): Promise<{ success: boolean; result: FirewallInspectionResult }> {
    return request('/firewall/inspect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Anonymizer
  async maskData(payload: {
    text: string;
    maskingType: 'Redact' | 'Tokenize' | 'Partial' | 'Synthesize';
  }): Promise<{
    success: boolean;
    originalText: string;
    maskedText: string;
    entitiesFound: { type: string; original: string; replacement: string }[];
    piiRiskScore: number;
    processedAt: string;
  }> {
    return request('/anonymizer/mask', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Incidents
  async getIncidents(params?: {
    severity?: string;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ incidents: SecurityIncident[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    return request(`/incidents${qs ? `?${qs}` : ''}`);
  },

  async createIncident(data: {
    title: string;
    category: string;
    severity: IncidentSeverity;
    details: string;
  }): Promise<{ success: boolean; incident: SecurityIncident }> {
    return request('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateIncident(
    id: string,
    data: { status?: IncidentStatus; remediation_notes?: string }
  ): Promise<{ success: boolean; incident: SecurityIncident }> {
    return request(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Compliance
  async getComplianceReport(): Promise<ComplianceReport> {
    return request<ComplianceReport>('/compliance/report');
  },

  // Security Assistant
  async chatWithAssistant(payload: {
    message: string;
    history?: { role: 'user' | 'model'; text: string }[];
  }): Promise<{ success: boolean; reply: string; timestamp: string }> {
    return request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Settings & Audit Logs
  async getSettings(): Promise<{
    organization: { id: string; name: string };
    settings: OrgSettings;
    teamMembers: Omit<User, 'password_hash'>[];
  }> {
    return request('/settings');
  },

  async updateSettings(settings: Partial<OrgSettings>): Promise<{ success: boolean; settings: OrgSettings }> {
    return request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  async generateApiKey(name: string): Promise<{
    success: boolean;
    apiKey: string;
    keyMetadata: { id: string; name: string; keyPrefix: string; created_at: string };
  }> {
    return request('/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[]; total: number }> {
    return request('/audit-logs');
  },
};
