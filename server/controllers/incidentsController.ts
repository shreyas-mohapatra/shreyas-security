import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { db, IncidentSeverity, IncidentStatus } from '../db/store.js';

export async function getIncidents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    let incidents = db.getIncidentsByOrg(orgId);

    const { severity, status, category, search } = req.query;

    if (severity) {
      incidents = incidents.filter(i => i.severity.toLowerCase() === String(severity).toLowerCase());
    }
    if (status) {
      incidents = incidents.filter(i => i.status.toLowerCase() === String(status).toLowerCase());
    }
    if (category) {
      incidents = incidents.filter(i => i.category.toLowerCase().includes(String(category).toLowerCase()));
    }
    if (search) {
      const q = String(search).toLowerCase();
      incidents = incidents.filter(i => i.title.toLowerCase().includes(q) || i.details.toLowerCase().includes(q));
    }

    res.json({
      incidents,
      total: incidents.length,
    });
  } catch (err: any) {
    console.error('Failed to get incidents:', err);
    res.status(500).json({ error: 'Failed to fetch security incidents' });
  }
}

export async function createIncident(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const { title, category, severity, details } = req.body;

    const incident = db.createIncident({
      organization_id: orgId,
      title,
      category,
      severity: severity as IncidentSeverity,
      details,
      status: 'Open',
    });

    db.addAuditLog({
      organization_id: orgId,
      user_id: req.user?.id || null,
      user_email: req.user?.email,
      action: 'INCIDENT_MANUALLY_CREATED',
      risk_score: severity === 'Critical' ? 0.9 : severity === 'High' ? 0.7 : 0.4,
      payload: { incident_id: incident.id, title, severity },
    });

    res.status(201).json({ success: true, incident });
  } catch (err: any) {
    console.error('Failed to create incident:', err);
    res.status(500).json({ error: 'Failed to create incident' });
  }
}

export async function updateIncident(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orgId = req.user?.organization_id || 'org-securetrust-enterprise';
    const incidentId = req.params.id;
    const { status, remediation_notes } = req.body;

    const updated = db.updateIncident(incidentId, orgId, {
      status: status as IncidentStatus,
      remediation_notes,
    });

    if (!updated) {
      res.status(404).json({ error: 'Incident not found or unauthorized' });
      return;
    }

    db.addAuditLog({
      organization_id: orgId,
      user_id: req.user?.id || null,
      user_email: req.user?.email,
      action: 'INCIDENT_UPDATED',
      risk_score: 0.1,
      payload: { incident_id: incidentId, status, has_notes: Boolean(remediation_notes) },
    });

    res.json({ success: true, incident: updated });
  } catch (err: any) {
    console.error('Failed to update incident:', err);
    res.status(500).json({ error: 'Failed to update incident record' });
  }
}
