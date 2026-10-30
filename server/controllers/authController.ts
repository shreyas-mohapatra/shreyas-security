import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserRole } from '../db/store.js';
import { AuthRequest, JWT_SECRET } from '../middleware/auth.js';

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { organizationName, email, password, role } = req.body;

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email address already exists' });
      return;
    }

    const org = db.createOrganization(organizationName);
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = db.createUser({
      organization_id: org.id,
      email,
      password_hash,
      role: (role as UserRole) || 'Developer',
    });

    db.addAuditLog({
      organization_id: org.id,
      user_id: user.id,
      user_email: user.email,
      action: 'ORGANIZATION_AND_USER_REGISTERED',
      risk_score: 0.0,
      payload: { org_id: org.id, role: user.role },
    });

    const token = jwt.sign(
      {
        id: user.id,
        organization_id: user.organization_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: org.name,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password credentials' });
      return;
    }

    const org = db.findOrganizationById(user.organization_id);

    db.addAuditLog({
      organization_id: user.organization_id,
      user_id: user.id,
      user_email: user.email,
      action: 'USER_AUTHENTICATED',
      risk_score: 0.05,
      payload: { role: user.role },
    });

    const token = jwt.sign(
      {
        id: user.id,
        organization_id: user.organization_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: org?.name || 'Secure Organization',
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication process failed' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = db.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User record not found' });
    return;
  }

  const org = db.findOrganizationById(user.organization_id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
      organization_name: org?.name || 'Secure Organization',
    },
  });
}

export function getDemoAccounts(req: AuthRequest, res: Response): void {
  // Return pre-configured demo users for quick role testing
  const demoUsers = [
    { email: 'admin@securetrust.ai', role: 'Admin', description: 'Full access to policies, RBAC, API keys & audit logs' },
    { email: 'security@securetrust.ai', role: 'Security Officer', description: 'Threat investigation, incident resolution & firewall tuning' },
    { email: 'developer@securetrust.ai', role: 'Developer', description: 'Testing AI gateway, prompt sanitization & tokenization APIs' },
    { email: 'auditor@securetrust.ai', role: 'Auditor', description: 'Read-only access to compliance scores and audit verification' },
  ];
  res.json({ demoUsers });
}
