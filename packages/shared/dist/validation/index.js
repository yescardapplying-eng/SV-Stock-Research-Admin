"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIndianPhoneNumber = normalizeIndianPhoneNumber;
exports.sanitizeSearchString = sanitizeSearchString;
exports.isValidEmail = isValidEmail;
function normalizeIndianPhoneNumber(phone) {
    if (!phone)
        return '';
    // Strip non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    // Strip leading 0 or 91 country code for standard 10-digit format
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = cleaned.substring(2);
    }
    return cleaned;
}
function sanitizeSearchString(term) {
    if (!term)
        return '';
    return term.trim().replace(/[<>]/g, '');
}
function isValidEmail(email) {
    if (!email)
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}
//# sourceMappingURL=index.js.map