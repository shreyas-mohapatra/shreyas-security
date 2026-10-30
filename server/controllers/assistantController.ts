import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { askSecurityAssistant } from '../services/gemini.js';
import { db } from '../db/store.js';

export async function chatWithSecurityAssistant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { message, history = [] } = req.body;
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';

    const reply = await askSecurityAssistant(message, history);

    db.addAuditLog({
      organization_id: orgId,
      user_id: req.user?.id || null,
      user_email: req.user?.email,
      action: 'SECURITY_ASSISTANT_QUERY',
      risk_score: 0.05,
      payload: { query_snippet: message.slice(0, 100) },
    });

    res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Security assistant error:', err);
    res.status(500).json({ error: 'Security assistant error: ' + (err.message || 'Unknown error') });
  }
}
