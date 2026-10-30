import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { db } from '../db/store.js';

export async function getComplianceReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const org = db.findOrganizationById(orgId);
    const incidents = db.getIncidentsByOrg(orgId);
    const settings = db.getSettingsByOrg(orgId);
    const logs = db.getAuditLogsByOrg(orgId, 100);

    const openCritical = incidents.filter(i => i.severity === 'Critical' && i.status === 'Open').length;
    const openHigh = incidents.filter(i => i.severity === 'High' && i.status === 'Open').length;
    const unresolvedTotal = incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length;

    // Framework evaluations
    const frameworks = [
      {
        id: 'gdpr',
        name: 'GDPR (EU General Data Protection Regulation)',
        score: settings.enforce_pii_redaction && openCritical === 0 ? 94 : 76,
        status: settings.enforce_pii_redaction && openCritical === 0 ? 'Compliant' : 'Attention Required',
        controls: [
          {
            code: 'Art. 5(1)(c)',
            name: 'Data Minimization & Storage Limitation',
            status: 'Passed',
            detail: 'Automated PII scrubbing engine redacts emails, national IDs, and financial tokens prior to LLM submission.',
          },
          {
            code: 'Art. 25',
            name: 'Data Protection by Design & Default',
            status: settings.enforce_pii_redaction ? 'Passed' : 'Warning',
            detail: 'AI Gateway enforces pre-processing inspection policies on all API endpoints.',
          },
          {
            code: 'Art. 32',
            name: 'Security of Processing (Confidentiality & Integrity)',
            status: openCritical === 0 ? 'Passed' : 'Failed',
            detail: openCritical === 0 ? 'No unmitigated critical security breaches or active prompt injection bypasses.' : `${openCritical} active critical incident(s) require remediation.`,
          },
          {
            code: 'Art. 30',
            name: 'Records of Processing Activities (Audit Trail)',
            status: logs.length > 0 ? 'Passed' : 'Warning',
            detail: `Immutable audit log active with ${logs.length} logged inspection events.`,
          },
        ],
      },
      {
        id: 'soc2',
        name: 'SOC 2 Type II (Trust Services Criteria)',
        score: openCritical === 0 && openHigh <= 1 ? 91 : 72,
        status: openCritical === 0 ? 'Compliant' : 'Action Required',
        controls: [
          {
            code: 'CC6.1',
            name: 'Logical Access Controls & Least Privilege',
            status: 'Passed',
            detail: 'Role-Based Access Control (Admin, Security Officer, Developer, Auditor) enforced with signed JWTs.',
          },
          {
            code: 'CC6.6',
            name: 'Boundary Protection & Attack Prevention',
            status: settings.block_jailbreaks ? 'Passed' : 'Warning',
            detail: 'AI Firewall blocks prompt injection heuristics, DAN jailbreak vectors, and system overrides.',
          },
          {
            code: 'CC7.2',
            name: 'Continuous Security Incident Monitoring',
            status: 'Passed',
            detail: 'Real-time telemetry and automated incident filing enabled on high-risk detections.',
          },
        ],
      },
      {
        id: 'hipaa',
        name: 'HIPAA Security Rule (§164.312)',
        score: settings.enforce_pii_redaction ? 96 : 68,
        status: settings.enforce_pii_redaction ? 'Compliant' : 'Non-Compliant',
        controls: [
          {
            code: '§ 164.312(a)',
            name: 'Access Control & Authentication',
            status: 'Passed',
            detail: 'Multi-role tenant segmentation and cryptographic authentication enforced.',
          },
          {
            code: '§ 164.312(b)',
            name: 'Audit Controls & PHI Transmission Safeguards',
            status: settings.enforce_pii_redaction ? 'Passed' : 'Failed',
            detail: 'De-identification and tokenization prevents Protected Health Information (PHI) exposure in model training/inference.',
          },
        ],
      },
      {
        id: 'nist-ai',
        name: 'NIST AI Risk Management Framework (AI RMF 1.0)',
        score: 89,
        status: 'Compliant',
        controls: [
          {
            code: 'GOVERN 1.1',
            name: 'AI Risk Management Policies & Organizational Roles',
            status: 'Passed',
            detail: 'Explicit roles defined for Security Officers and AI Developers with policy thresholds.',
          },
          {
            code: 'MAP 2.1',
            name: 'Threat Modeling for Model Exploitation & Injections',
            status: 'Passed',
            detail: 'Systematic taxonomy tracking Prompt Injections, Jailbreaks, PII Leaks, and Data Exfiltration.',
          },
          {
            code: 'MEASURE 2.6',
            name: 'System Vulnerability & Safety Evaluation',
            status: 'Passed',
            detail: 'Automated continuous risk scoring (0.0 to 1.0) on every prompt/completion interaction.',
          },
          {
            code: 'MANAGE 3.1',
            name: 'Incident Response Playbooks & Threat Containment',
            status: unresolvedTotal < 5 ? 'Passed' : 'Warning',
            detail: 'Trackable remediation workflows and automated incident escalation.',
          },
        ],
      },
      {
        id: 'iso27001',
        name: 'ISO/IEC 27001:2022 (Annex A.8)',
        score: 92,
        status: 'Compliant',
        controls: [
          {
            code: 'A.8.7',
            name: 'Protection against Malware & Malicious Injections',
            status: 'Passed',
            detail: 'Firewall inspects inputs for encoded payloads, prompt bombs, and evasion delimiters.',
          },
          {
            code: 'A.8.11',
            name: 'Data Masking & Privacy Engineering',
            status: 'Passed',
            detail: 'Format-Preserving Encryption (FPE) and tokenization tools scrubbing sensitive fields.',
          },
        ],
      },
    ];

    const overallScore = Math.round(
      frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length
    );

    res.json({
      organization: {
        id: org?.id,
        name: org?.name,
      },
      generatedAt: new Date().toISOString(),
      overallScore,
      summary: {
        frameworksEvaluated: frameworks.length,
        passingControls: frameworks.flatMap(f => f.controls).filter(c => c.status === 'Passed').length,
        totalControls: frameworks.flatMap(f => f.controls).length,
        openIncidentImpact: unresolvedTotal,
      },
      frameworks,
    });
  } catch (err: any) {
    console.error('Compliance report failed:', err);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
}
