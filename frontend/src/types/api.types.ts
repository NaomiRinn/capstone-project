import { z } from 'zod';

// ─── Shared ────────────────────────────────────────────────────────────────
export const SeveritySchema = z.enum(['mild', 'moderate', 'severe']);
export type Severity = z.infer<typeof SeveritySchema>;

export const ScanStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type ScanStatus = z.infer<typeof ScanStatusSchema>;

// ─── Analysis Feature ──────────────────────────────────────────────────────
export const AnalysisFeatureSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  description: z.string(),
  icon: z.string().optional(),
});
export type AnalysisFeature = z.infer<typeof AnalysisFeatureSchema>;

// ─── Recommendation ────────────────────────────────────────────────────────
export const RecommendationSchema = z.object({
  id: z.string(),
  type: z.enum(['natural', 'diagnostic', 'lifestyle']),
  title: z.string(),
  description: z.string(),
  priority: z.number(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

// ─── Scan Analysis Result ──────────────────────────────────────────────────
export const ScanResultSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  status: ScanStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  severity: SeveritySchema.optional(),
  overallScore: z.number().min(0).max(100).optional(),
  features: z.array(AnalysisFeatureSchema).optional(),
  recommendations: z.array(RecommendationSchema).optional(),
  heatmapData: z.array(z.array(z.number())).optional(),
  inferenceTimeMs: z.number().optional(),
  modelVersion: z.string().optional(),
  processingSource: z.enum(['on-device', 'cloud']).optional(),
});
export type ScanResult = z.infer<typeof ScanResultSchema>;

// ─── Scan List Item ────────────────────────────────────────────────────────
export const ScanListItemSchema = ScanResultSchema.pick({
  id: true,
  status: true,
  createdAt: true,
  thumbnailUrl: true,
  severity: true,
  overallScore: true,
}).extend({ imagePreview: z.string().optional() });
export type ScanListItem = z.infer<typeof ScanListItemSchema>;

// ─── Upload Response ───────────────────────────────────────────────────────
export const UploadResponseSchema = z.object({
  scanId: z.string(),
  status: ScanStatusSchema,
  message: z.string(),
});
export type UploadResponse = z.infer<typeof UploadResponseSchema>;


// ─── API Error ─────────────────────────────────────────────────────────────
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

// ─── Auth ──────────────────────────────────────────────────────────────────
export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});
export type AuthToken = z.infer<typeof AuthTokenSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;
