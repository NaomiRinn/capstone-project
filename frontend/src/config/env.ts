import { z } from 'zod';

// ─── Environment Schema ────────────────────────────────────────────────────
// .default() must receive the correct primitive type, not a string.
// We parse booleans/numbers AFTER applying defaults via .pipe().

const envSchema = z.object({
  VITE_APP_NAME:        z.string().default('AUVRA'),
  VITE_API_BASE_URL:    z.string().default(''),
  VITE_AI_MODEL_VERSION: z.string().default('1.0.0-dummy'),
  VITE_SENTRY_DSN:      z.string().optional(),

  // Booleans: parse from string, default to correct primitive
  VITE_ENABLE_TELEMETRY: z.string().default('false').transform((v) => v === 'true'),

  // Numbers: parse from string, default to correct primitive
  VITE_MAX_FILE_SIZE_MB: z.string().default('10').transform(Number),
});

// import.meta.env is typed via vite/client — ensure it is referenced via Record
const parsed = envSchema.safeParse(import.meta.env as Record<string, string>);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export type Env = typeof env;
