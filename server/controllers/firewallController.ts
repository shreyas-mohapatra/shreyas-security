import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { analyzePromptSecurity } from '../services/gemini.js';
import { db } from '../db/store.js';

export async function inspectPrompt(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { prompt, sensitivity = 'Medium', inputType = 'Prompt', complianceStandard = 'GDPR' } = req.body;
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || 'api-gateway@system';

    const result = await analyzePromptSecurity(prompt, sensitivity, inputType, complianceStandard);

    // Audit log recording
    db.addAuditLog({
      organization_id: orgId,
      user_id: userId,
      user_email: userEmail,
      action: result.isSafe ? 'FIREWALL_PROMPT_PERMITTED' : 'FIREWALL_THREAT_BLOCKED',
      risk_score: result.riskScore,
      payload: {
        sensitivity,
        inputType,
        complianceStandard,
        threats: result.detectedThreats,
        defenseAction: result.defenseAction,
        snippet: prompt.slice(0, 120),
      },
    });

    // Automatically file a security incident if high or critical risk
    let createdIncidentId: string | null = null;
    if (!result.isSafe || result.riskScore >= 0.55 || result.severity === 'High' || result.severity === 'Critical') {
      const primaryCategory = result.detectedThreats[0] || 'AI Threat Detected';
      const incident = db.createIncident({
        organization_id: orgId,
        title: `AI Firewall Triggered: ${primaryCategory}`,
        category: primaryCategory.includes('Injection')
          ? 'Prompt Injection'
          : primaryCategory.includes('PII') || primaryCategory.includes('SSN')
          ? 'PII Leak'
          : primaryCategory.includes('Secret') || primaryCategory.includes('Key')
          ? 'Unauthorized Access'
          : 'Toxicity',
        severity: result.severity,
        status: 'Open',
        details: `Detected Threats: ${result.detectedThreats.join(', ')}. Action Taken: ${result.defenseAction}. Recommendation: ${result.recommendation}`,
      });
      createdIncidentId = incident.id;
    }

    res.json({
      success: true,
      result: {
        ...result,
        incidentCreated: createdIncidentId,
        inspectedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Firewall inspection endpoint failed:', err);
    res.status(500).json({ error: 'Firewall inspection failed: ' + (err.message || 'Internal error') });
  }
}
