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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateServicioDto = exports.CrearServicioDto = exports.UpdateSedeDto = exports.CrearSedeDto = exports.CerrarBitacoraDto = exports.RegistrarEventoDto = exports.IngresarPacienteDto = exports.CrearBitacoraDto = exports.TipoEventoDto = exports.TipoDocumentoDto = exports.TurnoBitacoraDto = void 0;
const class_validator_1 = require("class-validator");
var TurnoBitacoraDto;
(function (TurnoBitacoraDto) {
    TurnoBitacoraDto["MANANA"] = "MANANA";
    TurnoBitacoraDto["TARDE"] = "TARDE";
    TurnoBitacoraDto["NOCHE"] = "NOCHE";
    TurnoBitacoraDto["GUARDIA_24"] = "GUARDIA_24";
    TurnoBitacoraDto["ESPECIAL"] = "ESPECIAL";
})(TurnoBitacoraDto || (exports.TurnoBitacoraDto = TurnoBitacoraDto = {}));
var TipoDocumentoDto;
(function (TipoDocumentoDto) {
    TipoDocumentoDto["CEDULA"] = "CEDULA";
    TipoDocumentoDto["PASAPORTE"] = "PASAPORTE";
    TipoDocumentoDto["CARNET_EXTRANJERIA"] = "CARNET_EXTRANJERIA";
    TipoDocumentoDto["SIN_DOCUMENTO"] = "SIN_DOCUMENTO";
})(TipoDocumentoDto || (exports.TipoDocumentoDto = TipoDocumentoDto = {}));
var TipoEventoDto;
(function (TipoEventoDto) {
    TipoEventoDto["INGRESO"] = "INGRESO";
    TipoEventoDto["ALTA"] = "ALTA";
    TipoEventoDto["FALLECIDO"] = "FALLECIDO";
    TipoEventoDto["COMPLICACION"] = "COMPLICACION";
    TipoEventoDto["TRASLADO_INTERNO"] = "TRASLADO_INTERNO";
    TipoEventoDto["TRASLADO_EXTERNO"] = "TRASLADO_EXTERNO";
})(TipoEventoDto || (exports.TipoEventoDto = TipoEventoDto = {}));
class CrearBitacoraDto {
}
exports.CrearBitacoraDto = CrearBitacoraDto;
__decorate([
    (0, class_validator_1.IsEnum)(TurnoBitacoraDto),
    __metadata("design:type", String)
], CrearBitacoraDto.prototype, "turno", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearBitacoraDto.prototype, "supervisor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearBitacoraDto.prototype, "sedeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearBitacoraDto.prototype, "servicioId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CrearBitacoraDto.prototype, "latitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CrearBitacoraDto.prototype, "longitud", void 0);
class IngresarPacienteDto {
}
exports.IngresarPacienteDto = IngresarPacienteDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoDocumentoDto),
    __metadata("design:type", String)
], IngresarPacienteDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IngresarPacienteDto.prototype, "documentoHash", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IngresarPacienteDto.prototype, "documentoEnc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IngresarPacienteDto.prototype, "nombreEnc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IngresarPacienteDto.prototype, "fechaNacEnc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngresarPacienteDto.prototype, "servicioId", void 0);
class RegistrarEventoDto {
}
exports.RegistrarEventoDto = RegistrarEventoDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoEventoDto),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "tipoEvento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "detalle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "destinoServicioId", void 0);
class CerrarBitacoraDto {
}
exports.CerrarBitacoraDto = CerrarBitacoraDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CerrarBitacoraDto.prototype, "observacionesCierre", void 0);
class CrearSedeDto {
}
exports.CrearSedeDto = CrearSedeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearSedeDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CrearSedeDto.prototype, "latitud", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CrearSedeDto.prototype, "longitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CrearSedeDto.prototype, "radioMetros", void 0);
class UpdateSedeDto {
}
exports.UpdateSedeDto = UpdateSedeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateSedeDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], UpdateSedeDto.prototype, "latitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], UpdateSedeDto.prototype, "longitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateSedeDto.prototype, "radioMetros", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSedeDto.prototype, "activa", void 0);
class CrearServicioDto {
}
exports.CrearServicioDto = CrearServicioDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearServicioDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearServicioDto.prototype, "sedeId", void 0);
class UpdateServicioDto {
}
exports.UpdateServicioDto = UpdateServicioDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateServicioDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateServicioDto.prototype, "activo", void 0);
//# sourceMappingURL=bitacora.dto.js.map