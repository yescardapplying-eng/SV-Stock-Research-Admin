# Security & HMAC-SHA256 Implementation

## Server-to-Server Authentication

Communication between WordPress (`svstockresearch.in`) and the Render Backend API is protected by cryptographic HMAC-SHA256 signatures.

### Canonical Signing Format

Every request payload must be signed using:
```
string_to_sign = timestamp + "." + raw_payload
signature = HMAC-SHA256(string_to_sign, secret)
```

### Security Headers Required

- `x-sv-crm-timestamp`: Current UTC Unix timestamp in seconds. Requests with timestamps older than 300 seconds are rejected to prevent replay attacks.
- `x-sv-crm-site`: Unique site identifier (`sv-stock-research-main`).
- `x-sv-crm-signature`: Hex-encoded HMAC-SHA256 signature.
- `x-sv-crm-request-id`: Unique UUID/Event ID for idempotency checks.

### Secret Management

- Secrets are never hardcoded in source code or committed to Git.
- On WordPress: Configured via constants in `wp-config.php`:
  ```php
  define('SV_STOCK_CRM_WEBHOOK_SECRET', 'your_secure_random_64_char_hex');
  define('SV_STOCK_CRM_PULL_SECRET', 'your_secure_random_64_char_hex');
  define('SV_STOCK_CRM_BACKEND_URL', 'https://sv-stock-crm-api.onrender.com');
  ```
- On Render: Configured via Render Environment Variables.

## Admin Authentication

- No public signup or registration routes.
- Initial admin provisioning through controlled CLI / seed scripts.
- Passwords hashed using bcrypt (12 rounds) or Argon2id.
- Tokens stored in HttpOnly, SameSite=Lax cookies to mitigate XSS and CSRF.
