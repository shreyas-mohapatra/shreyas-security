export type UserRole = 'Admin' | 'Security Officer' | 'Developer' | 'Auditor';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organization_id: string;
  organization_name: string;
}

export interface SecurityIncident {
  id: string;
  organization_id: string;
  title: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  details: string;
  remediation_notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  user_email?: string;
  action: string;
  risk_score: number;
  payload: Record<string, any>;
  created_at: string;
}

export interface FirewallInspectionResult {
  isSafe: boolean;
  riskScore: number;
  severity: IncidentSeverity;
  detectedThreats: string[];
  redactedContent: string;
  recommendation: string;
  categoryBreakdown: {
    promptInjection: number;
    piiLeak: number;
    toxicity: number;
    dataExfiltration: number;
  };
  defenseAction: 'ALLOW' | 'REDACT_AND_PASS' | 'BLOCK';
  mitigationSteps: string[];
  incidentCreated?: string | null;
  inspectedAt?: string;
}

export interface ComplianceControl {
  code: string;
  name: string;
  status: 'Passed' | 'Warning' | 'Failed';
  detail: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  score: number;
  status: string;
  controls: ComplianceControl[];
}

export interface ComplianceReport {
  organization: {
    id: string;
    name: string;
  };
  generatedAt: string;
  overallScore: number;
  summary: {
    frameworksEvaluated: number;
    passingControls: number;
    totalControls: number;
    openIncidentImpact: number;
  };
  frameworks: ComplianceFramework[];
}

export interface DashboardMetrics {
  trustScore: number;
  activeAlerts: number;
  criticalAlerts: number;
  threatsBlocked24h: number;
  piiRedactions24h: number;
  totalPromptsInspected: number;
  complianceReadiness: number;
  firewallStatus: string;
}

export interface OrgSettings {
  organization_id: string;
  firewall_sensitivity: 'Low' | 'Medium' | 'Strict';
  enforce_pii_redaction: boolean;
  block_jailbreaks: boolean;
  log_retention_days: number;
  alert_webhook_url: string;
  api_keys: { id: string; name: string; keyPrefix: string; created_at: string }[];
}
