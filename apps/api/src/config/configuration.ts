function cleanEnv(val?: string, fallback = ''): string {
  if (!val) return fallback;
  let s = val.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export default () => ({
  port: parseInt(cleanEnv(process.env.PORT, '4000'), 10),
  adminOrigin: cleanEnv(process.env.ADMIN_APP_ORIGIN, 'http://localhost:3000'),
  databaseUrl: cleanEnv(process.env.DATABASE_URL, ''),
  authSecret: cleanEnv(process.env.AUTH_SECRET, 'fallback_development_auth_secret_key_change_in_prod'),
  sessionSecret: cleanEnv(process.env.SESSION_SECRET, 'fallback_development_session_secret_change_in_prod'),
  jwtExpiresIn: cleanEnv(process.env.JWT_EXPIRES_IN, '8h'),
  wpSiteUrl: cleanEnv(process.env.WP_SITE_URL, 'https://svstockresearch.in'),
  wpSiteIdentifier: cleanEnv(process.env.WP_SITE_IDENTIFIER, 'sv-stock-research-main'),
  wpWebhookSecret: cleanEnv(process.env.WP_WEBHOOK_SECRET, ''),
  wpPullSecret: cleanEnv(process.env.WP_PULL_SECRET, ''),
  logLevel: cleanEnv(process.env.LOG_LEVEL, 'info'),
});
