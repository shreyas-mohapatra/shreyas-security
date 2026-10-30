import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Controllers & Middlewares
import { register, login, getMe, getDemoAccounts } from './server/controllers/authController.js';
import { inspectPrompt } from './server/controllers/firewallController.js';
import { maskData } from './server/controllers/anonymizerController.js';
import { getIncidents, createIncident, updateIncident } from './server/controllers/incidentsController.js';
import { getComplianceReport } from './server/controllers/complianceController.js';
import { getDashboardMetrics } from './server/controllers/dashboardController.js';
import { chatWithSecurityAssistant } from './server/controllers/assistantController.js';
import { getSettings, updateSettings, generateApiKey, getAuditLogs } from './server/controllers/settingsController.js';

import { authenticateJWT, requireRole } from './server/middleware/auth.js';
import {
  validate,
  registerSchema,
  loginSchema,
  firewallInspectSchema,
  anonymizeSchema,
  createIncidentSchema,
  updateIncidentSchema,
  assistantChatSchema,
} from './server/middleware/validation.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body parsing
  app.use(express.json({ limit: '10mb' }));

  // API Router
  const api = express.Router();

  // Auth Routes
  api.post('/auth/register', validate(registerSchema), register);
  api.post('/auth/login', validate(loginSchema), login);
  api.get('/auth/me', authenticateJWT, getMe);
  api.get('/auth/demo-users', getDemoAccounts);

  // Dashboard Metrics
  api.get('/dashboard/metrics', authenticateJWT, getDashboardMetrics);

  // Firewall Inspection Gateway
  api.post('/firewall/inspect', authenticateJWT, validate(firewallInspectSchema), inspectPrompt);

  // Anonymizer & PII Scrubbing
  api.post('/anonymizer/mask', authenticateJWT, validate(anonymizeSchema), maskData);

  // Incidents
  api.get('/incidents', authenticateJWT, getIncidents);
  api.post('/incidents', authenticateJWT, validate(createIncidentSchema), createIncident);
  api.patch('/incidents/:id', authenticateJWT, validate(updateIncidentSchema), updateIncident);

  // Compliance
  api.get('/compliance/report', authenticateJWT, getComplianceReport);

  // Interactive AI Security Assistant
  api.post('/assistant/chat', authenticateJWT, validate(assistantChatSchema), chatWithSecurityAssistant);

  // Settings & RBAC
  api.get('/settings', authenticateJWT, getSettings);
  api.patch('/settings', authenticateJWT, requireRole(['Admin']), updateSettings);
  api.post('/settings/api-keys', authenticateJWT, requireRole(['Admin', 'Security Officer']), generateApiKey);
  api.get('/audit-logs', authenticateJWT, requireRole(['Admin', 'Security Officer', 'Auditor']), getAuditLogs);

  // Mount API
  app.use('/api', api);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Frontend integration: Vite middleware in dev, static files in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SecureTrust AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
