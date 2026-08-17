// Central env validator: Fails fast if any critical env var is missing
// Usage: import and call at app startup (e.g., in index.ts)

const REQUIRED_ENV = [
  'FRONTEND_URL',
  'BACKEND_URL',
  'DATABASE_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'SMTP_FROM_NAME',
  'SMTP_FROM_EMAIL',
];

export function validateEnvOrExit(): void {
  let failed = false;
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: $${key}`);
      failed = true;
    }
  }
  if (failed) {
    console.error('Aborting startup due to missing env vars.');
    process.exit(1);
  }
}
// You may import this and call at top of main entry (e.g., index.ts)

export function getEnv(key: keyof NodeJS.ProcessEnv): string {
  const val = process.env[key];
  if (!val)
    throw new Error(`Environment variable $${key} is required but missing.`);
  return val;
}
