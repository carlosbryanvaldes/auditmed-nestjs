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
exports.FormsController = void 0;
const common_1 = require("@nestjs/common");
const forms_service_1 = require("./forms.service");
const form_dto_1 = require("./dto/form.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let FormsController = class FormsController {
    constructor(formsService) {
        this.formsService = formsService;
    }
    findAll() {
        return this.formsService.findAll();
    }
    findOne(id) {
        return this.formsService.findOne(id);
    }
    create(dto, user) {
        return this.formsService.create(dto, user?.id);
    }
    update(id, dto) {
        return this.formsService.update(id, dto);
    }
    publish(id) {
        return this.formsService.publish(id);
    }
    remove(id) {
        return this.formsService.remove(id);
    }
};
exports.FormsController = FormsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('forms:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('forms:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('forms:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_dto_1.CreateFormDto, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('forms:write'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, form_dto_1.UpdateFormDto]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, permissions_decorator_1.RequirePermissions)('forms:write'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "publish", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('forms:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "remove", null);
exports.FormsController = FormsController = __decorate([
    (0, common_1.Controller)('forms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], FormsController);
//# sourceMappingURL=forms.controller.js.map