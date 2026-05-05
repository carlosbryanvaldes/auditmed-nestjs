"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditsController = void 0;
const common_1 = require("@nestjs/common");
const audits_service_1 = require("./audits.service");
const audit_dto_1 = require("./dto/audit.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
let AuditsController = class AuditsController {
    constructor(auditsService) {
        this.auditsService = auditsService;
    }
    getStats() {
        return this.auditsService.getStats();
    }
    findAll(page, limit, status, auditorId) {
        return this.auditsService.findAll({ page: +page, limit: +limit, status, auditorId: +auditorId });
    }
    findOne(id) {
        return this.auditsService.findOne(id);
    }
    create(dto) {
        return this.auditsService.create(dto);
    }
    update(id, dto) {
        return this.auditsService.update(id, dto);
    }
    close(id, dto) {
        return this.auditsService.close(id, dto);
    }
    remove(id) {
        return this.auditsService.remove(id);
    }
};
exports.AuditsController = AuditsController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.RequirePermissions)('audits:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('audits:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('auditorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('audits:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('audits:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.CreateAuditDto]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('audits:write'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    (0, permissions_decorator_1.RequirePermissions)('audits:close'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, audit_dto_1.CloseAuditDto]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "close", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('audits:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "remove", null);
exports.AuditsController = AuditsController = __decorate([
    (0, common_1.Controller)('audits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [audits_service_1.AuditsService])
], AuditsController);
//# sourceMappingURL=audits.controller.js.map