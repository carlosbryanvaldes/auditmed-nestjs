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
exports.BitacoraController = void 0;
const common_1 = require("@nestjs/common");
const bitacora_service_1 = require("./bitacora.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const bitacora_dto_1 = require("./dto/bitacora.dto");
let BitacoraController = class BitacoraController {
    constructor(service) {
        this.service = service;
    }
    adminListarSedes() {
        return this.service.adminListarSedes();
    }
    adminCrearSede(dto) {
        return this.service.adminCrearSede(dto);
    }
    adminActualizarSede(id, dto) {
        return this.service.adminActualizarSede(id, dto);
    }
    adminEliminarSede(id) {
        return this.service.adminEliminarSede(id);
    }
    adminListarServicios(sedeId) {
        return this.service.adminListarServicios(sedeId);
    }
    adminCrearServicio(dto) {
        return this.service.adminCrearServicio(dto);
    }
    adminActualizarServicio(id, dto) {
        return this.service.adminActualizarServicio(id, dto);
    }
    adminEliminarServicio(id) {
        return this.service.adminEliminarServicio(id);
    }
    listarSedes() {
        return this.service.listarSedes();
    }
    getHistorial(hash) {
        return this.service.obtenerHistorialPaciente(hash);
    }
    crearBitacora(req, dto) {
        return this.service.crearBitacora(req.user.sub, dto);
    }
    getPacientes(id) {
        return this.service.obtenerPacientesActivos(id);
    }
    ingresarPaciente(id, dto) {
        return this.service.ingresarPaciente(id, dto);
    }
    registrarEvento(bitacoraId, pacienteId, req, dto) {
        return this.service.registrarEvento(pacienteId, bitacoraId, req.user.sub, dto);
    }
    cerrarBitacora(id, req, dto) {
        return this.service.cerrarBitacora(id, req.user.sub, dto);
    }
};
exports.BitacoraController = BitacoraController;
__decorate([
    (0, common_1.Get)('admin/sedes'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminListarSedes", null);
__decorate([
    (0, common_1.Post)('admin/sedes'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bitacora_dto_1.CrearSedeDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminCrearSede", null);
__decorate([
    (0, common_1.Put)('admin/sedes/:id'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bitacora_dto_1.UpdateSedeDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminActualizarSede", null);
__decorate([
    (0, common_1.Delete)('admin/sedes/:id'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminEliminarSede", null);
__decorate([
    (0, common_1.Get)('admin/servicios'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __param(0, (0, common_1.Query)('sedeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminListarServicios", null);
__decorate([
    (0, common_1.Post)('admin/servicios'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bitacora_dto_1.CrearServicioDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminCrearServicio", null);
__decorate([
    (0, common_1.Put)('admin/servicios/:id'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bitacora_dto_1.UpdateServicioDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminActualizarServicio", null);
__decorate([
    (0, common_1.Delete)('admin/servicios/:id'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "adminEliminarServicio", null);
__decorate([
    (0, common_1.Get)('sedes'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "listarSedes", null);
__decorate([
    (0, common_1.Get)('paciente/:hash/historial'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:historial'),
    __param(0, (0, common_1.Param)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "getHistorial", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:write'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bitacora_dto_1.CrearBitacoraDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "crearBitacora", null);
__decorate([
    (0, common_1.Get)(':id/pacientes'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "getPacientes", null);
__decorate([
    (0, common_1.Post)(':id/pacientes'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bitacora_dto_1.IngresarPacienteDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "ingresarPaciente", null);
__decorate([
    (0, common_1.Post)(':id/pacientes/:pacId/eventos'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('pacId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, bitacora_dto_1.RegistrarEventoDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "registrarEvento", null);
__decorate([
    (0, common_1.Patch)(':id/cerrar'),
    (0, permissions_decorator_1.RequirePermissions)('bitacora:close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, bitacora_dto_1.CerrarBitacoraDto]),
    __metadata("design:returntype", void 0)
], BitacoraController.prototype, "cerrarBitacora", null);
exports.BitacoraController = BitacoraController = __decorate([
    (0, common_1.Controller)('bitacora'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [bitacora_service_1.BitacoraService])
], BitacoraController);
//# sourceMappingURL=bitacora.controller.js.map