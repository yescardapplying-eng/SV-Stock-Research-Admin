"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryStatus = exports.AdminRole = exports.ActivityAction = exports.SyncJobStatus = exports.SyncJobType = exports.LeadStatus = void 0;
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "NEW";
    LeadStatus["CONTACTED"] = "CONTACTED";
    LeadStatus["INTERESTED"] = "INTERESTED";
    LeadStatus["FOLLOW_UP"] = "FOLLOW_UP";
    LeadStatus["CONVERTED"] = "CONVERTED";
    LeadStatus["NOT_INTERESTED"] = "NOT_INTERESTED";
    LeadStatus["REJECTED"] = "REJECTED";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var SyncJobType;
(function (SyncJobType) {
    SyncJobType["HISTORICAL_IMPORT"] = "HISTORICAL_IMPORT";
    SyncJobType["INCREMENTAL_SYNC"] = "INCREMENTAL_SYNC";
    SyncJobType["RETRY_FAILED"] = "RETRY_FAILED";
})(SyncJobType || (exports.SyncJobType = SyncJobType = {}));
var SyncJobStatus;
(function (SyncJobStatus) {
    SyncJobStatus["PENDING"] = "PENDING";
    SyncJobStatus["IN_PROGRESS"] = "IN_PROGRESS";
    SyncJobStatus["PAUSED"] = "PAUSED";
    SyncJobStatus["COMPLETED"] = "COMPLETED";
    SyncJobStatus["FAILED"] = "FAILED";
})(SyncJobStatus || (exports.SyncJobStatus = SyncJobStatus = {}));
var ActivityAction;
(function (ActivityAction) {
    ActivityAction["IMPORTED"] = "IMPORTED";
    ActivityAction["STATUS_CHANGED"] = "STATUS_CHANGED";
    ActivityAction["NOTE_ADDED"] = "NOTE_ADDED";
    ActivityAction["LEAD_UPDATED"] = "LEAD_UPDATED";
    ActivityAction["FOLLOWUP_SCHEDULED"] = "FOLLOWUP_SCHEDULED";
    ActivityAction["OVERRIDE_APPLIED"] = "OVERRIDE_APPLIED";
    ActivityAction["ARCHIVED"] = "ARCHIVED";
    ActivityAction["RESTORED"] = "RESTORED";
})(ActivityAction || (exports.ActivityAction = ActivityAction = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["AGENT"] = "AGENT";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "PENDING";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
    DeliveryStatus["FAILED"] = "FAILED";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
//# sourceMappingURL=index.js.map