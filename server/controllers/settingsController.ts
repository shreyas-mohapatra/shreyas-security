import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { db } from '../db/store.js';

export async function getSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const settings = db.getSettingsByOrg(orgId);
    const users = db.getUsersByOrg(orgId);
    const org = db.findOrganizationById(orgId);

    res.json({
      organization: org,
      settings,
      teamMembers: users,
    });
  } catch (err: any) {
    console.error('Failed to get settings:', err);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const { firewall_sensitivity, enforce_pii_redaction, block_jailbreaks, log_retention_days, alert_webhook_url } = req.body;

    const updated = db.updateSettings(orgId, {
      ...(firewall_sensitivity ? { firewall_sensitivity } : {}),
      ...(typeof enforce_pii_redaction === 'boolean' ? { enforce_pii_redaction } : {}),
      ...(typeof block_jailbreaks === 'boolean' ? { block_jailbreaks } : {}),
      ...(log_retention_days ? { log_retention_days: Number(log_retention_days) } : {}),
      ...(alert_webhook_url !== undefined ? { alert_webhook_url } : {}),
    });

    db.addAuditLog({
      organization_id: orgId,
      user_id: req.user?.id || null,
      user_email: req.user?.email,
      action: 'ORGANIZATION_SECURITY_POLICY_MODIFIED',
      risk_score: 0.1,
      payload: { modified_by: req.user?.email, new_settings: req.body },
    });

    res.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('Failed to update settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

export async function generateApiKey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const { name } = req.body;

    const randomBytes = crypto.randomBytes(24).toString('hex');
    const fullKey = `st_live_${randomBytes}`;
    const keyPrefix = `st_live_${randomBytes.slice(0, 4)}...${randomBytes.slice(-4)}`;

    const currentSettings = db.getSettingsByOrg(orgId);
    const newKeyObj = {
      id: crypto.randomUUID(),
      name: name || 'API Client Key',
      keyPrefix,
      created_at: new Date().toISOString(),
    };

    const updated = db.updateSettings(orgId, {
      api_keys: [newKeyObj, ...(currentSettings.api_keys || [])],
    });

    db.addAuditLog({
      organization_id: orgId,
      user_id: req.user?.id || null,
      user_email: req.user?.email,
      action: 'API_GATEWAY_KEY_GENERATED',
      risk_score: 0.15,
      payload: { key_name: name, key_prefix: keyPrefix },
    });

    res.status(201).json({
      success: true,
      apiKey: fullKey, // returned once to user for copying
      keyMetadata: newKeyObj,
    });
  } catch (err: any) {
    console.error('Failed to generate API key:', err);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const logs = db.getAuditLogsByOrg(orgId, 100);
    res.json({ logs, total: logs.length });
  } catch (err: any) {
    console.error('Failed to get audit logs:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
}
