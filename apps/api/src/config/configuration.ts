export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  adminOrigin: process.env.ADMIN_APP_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  authSecret: process.env.AUTH_SECRET || 'fallback_development_auth_secret_key_change_in_prod',
  sessionSecret: process.env.SESSION_SECRET || 'fallback_development_session_secret_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  wpSiteUrl: process.env.WP_SITE_URL || 'https://svstockresearch.in',
  wpSiteIdentifier: process.env.WP_SITE_IDENTIFIER || 'sv-stock-research-main',
  wpWebhookSecret: process.env.WP_WEBHOOK_SECRET || '',
  wpPullSecret: process.env.WP_PULL_SECRET || '',
  logLevel: process.env.LOG_LEVEL || 'info',
});
