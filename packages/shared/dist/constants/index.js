"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNATURE_TOLERANCE_SECONDS = exports.HMAC_ALGORITHM = exports.KNOWN_FORMS_REFERENCE = exports.DEFAULT_WP_SITE_IDENTIFIER = exports.STANDARD_FIELD_KEYS = exports.CRM_SECURITY_HEADERS = void 0;
exports.CRM_SECURITY_HEADERS = {
    TIMESTAMP: 'x-sv-crm-timestamp',
    SITE_ID: 'x-sv-crm-site',
    SIGNATURE: 'x-sv-crm-signature',
    REQUEST_ID: 'x-sv-crm-request-id',
};
exports.STANDARD_FIELD_KEYS = {
    FULL_NAME: 'full_name',
    PHONE: 'phone',
    EMAIL: 'email',
    STATE: 'state',
    TRADING_SEGMENT: 'trading_segment',
    TRADING_CAPITAL: 'trading_capital',
    MESSAGE: 'message',
};
exports.DEFAULT_WP_SITE_IDENTIFIER = 'sv-stock-research-main';
exports.KNOWN_FORMS_REFERENCE = [
    { id: 1, name: 'Simple Contact Form', defaultCategory: 'contact' },
    { id: 2, name: 'Lead form sv stock', defaultCategory: 'popup_lead' },
    { id: 3, name: 'WP FORM USER CONSENT', defaultCategory: 'consent' },
];
exports.HMAC_ALGORITHM = 'sha256';
exports.SIGNATURE_TOLERANCE_SECONDS = 300; // 5 minutes tolerance
//# sourceMappingURL=index.js.map