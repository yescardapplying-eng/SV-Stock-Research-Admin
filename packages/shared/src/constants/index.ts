export const CRM_SECURITY_HEADERS = {
  TIMESTAMP: 'x-sv-crm-timestamp',
  SITE_ID: 'x-sv-crm-site',
  SIGNATURE: 'x-sv-crm-signature',
  REQUEST_ID: 'x-sv-crm-request-id',
} as const;

export const STANDARD_FIELD_KEYS = {
  FULL_NAME: 'full_name',
  PHONE: 'phone',
  EMAIL: 'email',
  STATE: 'state',
  TRADING_SEGMENT: 'trading_segment',
  TRADING_CAPITAL: 'trading_capital',
  MESSAGE: 'message',
} as const;

export const DEFAULT_WP_SITE_IDENTIFIER = 'sv-stock-research-main';

export const KNOWN_FORMS_REFERENCE = [
  { id: 1, name: 'Simple Contact Form', defaultCategory: 'contact' },
  { id: 2, name: 'Lead form sv stock', defaultCategory: 'popup_lead' },
  { id: 3, name: 'WP FORM USER CONSENT', defaultCategory: 'consent' },
] as const;

export const HMAC_ALGORITHM = 'sha256';
export const SIGNATURE_TOLERANCE_SECONDS = 300; // 5 minutes tolerance
