import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { scrubAndAnonymizeData } from '../services/gemini.js';
import { db } from '../db/store.js';

export async function maskData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { text, maskingType = 'Redact' } = req.body;
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || 'anonymizer@system';

    const result = await scrubAndAnonymizeData(text, maskingType);

    db.addAuditLog({
      organization_id: orgId,
      user_id: userId,
      user_email: userEmail,
      action: 'DATA_ANONYMIZED_PII_SCRUBBED',
      risk_score: result.piiRiskScore,
      payload: {
        maskingType,
        entitiesCount: result.entitiesFound.length,
        entityTypes: [...new Set(result.entitiesFound.map(e => e.type))],
      },
    });

    res.json({
      success: true,
      originalText: result.originalText,
      maskedText: result.maskedText,
      entitiesFound: result.entitiesFound,
      piiRiskScore: result.piiRiskScore,
      processedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Anonymizer mask failed:', err);
    res.status(500).json({ error: 'Failed to anonymize data: ' + (err.message || 'Unknown error') });
  }
}
