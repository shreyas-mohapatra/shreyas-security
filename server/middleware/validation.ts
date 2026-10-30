import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const registerSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['Admin', 'Security Officer', 'Developer', 'Auditor']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
});

export const firewallInspectSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(10000, 'Prompt too large'),
  sensitivity: z.enum(['Low', 'Medium', 'Strict']).default('Medium'),
  inputType: z.enum(['Prompt', 'Model Response', 'JSON Payload', 'API Log']).default('Prompt').optional(),
  complianceStandard: z.enum(['GDPR', 'ISO 27001', 'SOC 2', 'HIPAA']).default('GDPR').optional(),
});

export const anonymizeSchema = z.object({
  text: z.string().min(1, 'Text content is required').max(20000),
  maskingType: z.enum(['Redact', 'Tokenize', 'Partial', 'Synthesize']).default('Redact'),
});

export const updateIncidentSchema = z.object({
  status: z.enum(['Open', 'Investigating', 'Resolved', 'Dismissed']).optional(),
  remediation_notes: z.string().optional(),
});

export const createIncidentSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  details: z.string().min(5),
});

export const assistantChatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        text: z.string(),
      })
    )
    .default([]),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
