export declare const CRM_SECURITY_HEADERS: {
    readonly TIMESTAMP: "x-sv-crm-timestamp";
    readonly SITE_ID: "x-sv-crm-site";
    readonly SIGNATURE: "x-sv-crm-signature";
    readonly REQUEST_ID: "x-sv-crm-request-id";
};
export declare const STANDARD_FIELD_KEYS: {
    readonly FULL_NAME: "full_name";
    readonly PHONE: "phone";
    readonly EMAIL: "email";
    readonly STATE: "state";
    readonly TRADING_SEGMENT: "trading_segment";
    readonly TRADING_CAPITAL: "trading_capital";
    readonly MESSAGE: "message";
};
export declare const DEFAULT_WP_SITE_IDENTIFIER = "sv-stock-research-main";
export declare const KNOWN_FORMS_REFERENCE: readonly [{
    readonly id: 1;
    readonly name: "Simple Contact Form";
    readonly defaultCategory: "contact";
}, {
    readonly id: 2;
    readonly name: "Lead form sv stock";
    readonly defaultCategory: "popup_lead";
}, {
    readonly id: 3;
    readonly name: "WP FORM USER CONSENT";
    readonly defaultCategory: "consent";
}];
export declare const HMAC_ALGORITHM = "sha256";
export declare const SIGNATURE_TOLERANCE_SECONDS = 300;
