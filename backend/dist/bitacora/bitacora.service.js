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
exports.BitacoraService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const bitacora_dto_1 = require("./dto/bitacora.dto");
const DIAS_VENTANA_REINGRESO = 30;
function haversineMetros(lat1, lon1, lat2, lon2) {
    const R = 6_371_000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
let BitacoraService = class BitacoraService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validarGeolocalizacion(sedeId, lat, lng) {
        const sede = await this.prisma.sedeClinica.findUnique({
            where: { id: sedeId },
            select: { latitud: true, longitud: true, radioMetros: true },
        });
        if (!sede)
            throw new common_1.NotFoundException('Sede no encontrada');
        const distanciaMetros = haversineMetros(sede.latitud, sede.longitud, lat, lng);
        return {
            valida: distanciaMetros <= sede.radioMetros,
            distanciaMetros: Math.round(distanciaMetros),
        };
    }
    async crearBitacora(medicoUserId, dto) {
        const sede = await this.prisma.sedeClinica.findUnique({
            where: { id: dto.sedeId },
        });
        if (!sede || !sede.activa) {
            throw new common_1.NotFoundException('Sede clínica no encontrada o inactiva');
        }
        const servicio = await this.prisma.servicio.findUnique({
            where: { id: dto.servicioId },
        });
        if (!servicio || !servicio.activo) {
            throw new common_1.NotFoundException('Servicio no encontrado o inactivo');
        }
        if (dto.latitud != null && dto.longitud != null) {
            const { valida, distanciaMetros } = await this.validarGeolocalizacion(dto.sedeId, dto.latitud, dto.longitud);
            if (!valida) {
                throw new common_1.ForbiddenException(`Fuera del perímetro de la sede (${distanciaMetros}m de ${sede.radioMetros}m permitidos)`);
            }
        }
        return this.prisma.bitacora.create({
            data: {
                turno: dto.turno,
                supervisor: dto.supervisor,
                medicoUserId,
                sedeId: dto.sedeId,
                servicioId: dto.servicioId,
                latitudApertura: dto.latitud,
                longitudApertura: dto.longitud,
            },
            include: {
                sede: { select: { id: true, nombre: true } },
                servicio: { select: { id: true, nombre: true } },
                medico: { select: { id: true, fullName: true } },
            },
        });
    }
    async detectarReingreso(documentoHash) {
        const ventana = new Date();
        ventana.setDate(ventana.getDate() - DIAS_VENTANA_REINGRESO);
        const ultimaEstancia = await this.prisma.pacienteBitacora.findFirst({
            where: {
                documentoHash,
                estado: { not: 'ACTIVO' },
                fechaEgreso: { gte: ventana },
            },
            orderBy: { fechaEgreso: 'desc' },
            select: { fechaIngreso: true, fechaEgreso: true },
        });
        return {
            esReingreso: !!ultimaEstancia,
            ultimaEstancia: ultimaEstancia ?? undefined,
        };
    }
    async ingresarPaciente(bitacoraId, dto) {
        const bitacora = await this.prisma.bitacora.findUnique({
            where: { id: bitacoraId },
        });
        if (!bitacora)
            throw new common_1.NotFoundException('Bitácora no encontrada');
        if (bitacora.estado === 'CERRADA') {
            throw new common_1.BadRequestException('No se puede ingresar pacientes a una bitácora cerrada');
        }
        const activo = await this.prisma.pacienteBitacora.findFirst({
            where: { documentoHash: dto.documentoHash, estado: 'ACTIVO' },
        });
        if (activo) {
            throw new common_1.BadRequestException('El paciente ya tiene un ingreso activo en este servicio');
        }
        const reingreso = await this.detectarReingreso(dto.documentoHash);
        const paciente = await this.prisma.pacienteBitacora.create({
            data: {
                documentoHash: dto.documentoHash,
                documentoEnc: dto.documentoEnc,
                tipoDocumento: dto.tipoDocumento,
                nombreEnc: dto.nombreEnc,
                fechaNacEnc: dto.fechaNacEnc,
                bitacoraIngresoId: bitacoraId,
                servicioId: dto.servicioId,
                estado: 'ACTIVO',
            },
        });
        await this.prisma.eventoPaciente.create({
            data: {
                pacienteId: paciente.id,
                bitacoraId,
                tipoEvento: 'INGRESO',
                diasEstancia: 0,
                registradoPorId: bitacora.medicoUserId,
            },
        });
        return { paciente, reingreso };
    }
    async registrarEvento(pacienteId, bitacoraId, userId, dto) {
        const paciente = await this.prisma.pacienteBitacora.findUnique({
            where: { id: pacienteId },
            include: { bitacoraIngreso: true },
        });
        if (!paciente)
            throw new common_1.NotFoundException('Paciente no encontrado');
        const diasEstancia = Math.floor((Date.now() - paciente.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
        const estadoMap = {
            INGRESO: client_1.EstadoPaciente.ACTIVO,
            ALTA: client_1.EstadoPaciente.ALTA,
            FALLECIDO: client_1.EstadoPaciente.FALLECIDO,
            COMPLICACION: client_1.EstadoPaciente.COMPLICACION,
            TRASLADO_INTERNO: client_1.EstadoPaciente.TRASLADO_INTERNO,
            TRASLADO_EXTERNO: client_1.EstadoPaciente.TRASLADO_EXTERNO,
        };
        const nuevoEstado = estadoMap[dto.tipoEvento];
        const esEgreso = dto.tipoEvento !== bitacora_dto_1.TipoEventoDto.INGRESO &&
            dto.tipoEvento !== bitacora_dto_1.TipoEventoDto.COMPLICACION;
        let detalle = dto.detalle ?? null;
        if (dto.destinoServicioId) {
            const destino = await this.prisma.servicio.findUnique({
                where: { id: dto.destinoServicioId },
                select: { nombre: true },
            });
            detalle = detalle
                ? `${detalle} → ${destino?.nombre ?? dto.destinoServicioId}`
                : `Destino: ${destino?.nombre ?? dto.destinoServicioId}`;
        }
        const [evento] = await this.prisma.$transaction([
            this.prisma.eventoPaciente.create({
                data: {
                    pacienteId,
                    bitacoraId,
                    tipoEvento: dto.tipoEvento,
                    detalle,
                    diasEstancia,
                    registradoPorId: userId,
                },
            }),
            this.prisma.pacienteBitacora.update({
                where: { id: pacienteId },
                data: {
                    estado: nuevoEstado,
                    fechaEgreso: esEgreso ? new Date() : undefined,
                },
            }),
        ]);
        if (dto.tipoEvento === bitacora_dto_1.TipoEventoDto.COMPLICACION) {
            this.notificarAuditmed(pacienteId, dto.tipoEvento).catch(() => {
            });
        }
        return evento;
    }
    async notificarAuditmed(pacienteId, tipo) {
        try {
            await this.prisma.$executeRawUnsafe(`INSERT INTO audit_cases
           (case_number, audit_date, status, form_template_id, auditor_id,
            general_observations, created_at, updated_at)
         SELECT
           'BIT-' || $1::text || '-' || extract(epoch from now())::bigint,
           to_char(now(), 'YYYY-MM-DD'),
           'DRAFT',
           (SELECT id FROM form_templates WHERE is_default = true LIMIT 1),
           (SELECT medico_user_id FROM bitacoras b
            JOIN pacientes_bitacora pb ON pb.bitacora_ingreso_id = b.id
            WHERE pb.id = $1 LIMIT 1),
           'Generado automáticamente por Bitácora — evento: ' || $2,
           now(), now()
         WHERE EXISTS (SELECT 1 FROM form_templates WHERE is_default = true)`, pacienteId, tipo);
        }
        catch {
        }
    }
    async obtenerPacientesActivos(bitacoraId) {
        const bitacora = await this.prisma.bitacora.findUnique({
            where: { id: bitacoraId },
            select: { servicioId: true },
        });
        if (!bitacora)
            throw new common_1.NotFoundException('Bitácora no encontrada');
        const pacientes = await this.prisma.pacienteBitacora.findMany({
            where: {
                estado: 'ACTIVO',
                bitacoraIngreso: { servicioId: bitacora.servicioId },
            },
            include: {
                eventos: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { tipoEvento: true, createdAt: true },
                },
            },
            orderBy: { fechaIngreso: 'asc' },
        });
        const now = Date.now();
        return pacientes.map((p) => ({
            ...p,
            diasEstancia: Math.floor((now - p.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24)),
        }));
    }
    async obtenerHistorialPaciente(documentoHash) {
        const estancias = await this.prisma.pacienteBitacora.findMany({
            where: { documentoHash },
            include: {
                bitacoraIngreso: {
                    select: {
                        id: true, turno: true, fecha: true,
                        sede: { select: { nombre: true } },
                        servicio: { select: { nombre: true } },
                    },
                },
                eventos: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        registradoPor: { select: { fullName: true } },
                    },
                },
            },
            orderBy: { fechaIngreso: 'desc' },
        });
        const totalDias = estancias.reduce((acc, e) => {
            const egreso = e.fechaEgreso?.getTime() ?? Date.now();
            return acc + Math.floor((egreso - e.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        const complicaciones = estancias.flatMap((e) => e.eventos.filter((ev) => ev.tipoEvento === 'COMPLICACION')).length;
        const reingresos = estancias.length > 1 ? estancias.length - 1 : 0;
        return { estancias, resumen: { totalEstancias: estancias.length, totalDias, complicaciones, reingresos } };
    }
    async cerrarBitacora(bitacoraId, userId, dto) {
        const bitacora = await this.prisma.bitacora.findUnique({
            where: { id: bitacoraId },
            include: {
                pacientes: { where: { estado: 'ACTIVO' } },
                _count: { select: { pacientes: true } },
            },
        });
        if (!bitacora)
            throw new common_1.NotFoundException('Bitácora no encontrada');
        if (bitacora.estado === 'CERRADA') {
            throw new common_1.BadRequestException('La bitácora ya está cerrada');
        }
        if (bitacora.medicoUserId !== userId) {
            throw new common_1.ForbiddenException('Solo el médico que abrió el turno puede cerrarlo');
        }
        const pacientesActivosCount = bitacora.pacientes.length;
        return this.prisma.bitacora.update({
            where: { id: bitacoraId },
            data: { estado: 'CERRADA' },
            select: {
                id: true, estado: true, turno: true, fecha: true,
                _count: { select: { pacientes: true } },
            },
        });
    }
    async listarSedes() {
        return this.prisma.sedeClinica.findMany({
            where: { activa: true },
            include: { servicios: { where: { activo: true }, select: { id: true, nombre: true } } },
            orderBy: { nombre: 'asc' },
        });
    }
    async adminListarSedes() {
        return this.prisma.sedeClinica.findMany({
            include: {
                _count: { select: { servicios: true, bitacoras: true } },
            },
            orderBy: { nombre: 'asc' },
        });
    }
    async adminCrearSede(dto) {
        return this.prisma.sedeClinica.create({
            data: {
                nombre: dto.nombre,
                latitud: dto.latitud,
                longitud: dto.longitud,
                radioMetros: dto.radioMetros ?? 200,
            },
        });
    }
    async adminActualizarSede(id, dto) {
        const sede = await this.prisma.sedeClinica.findUnique({ where: { id } });
        if (!sede)
            throw new common_1.NotFoundException('Sede no encontrada');
        return this.prisma.sedeClinica.update({ where: { id }, data: dto });
    }
    async adminEliminarSede(id) {
        const sede = await this.prisma.sedeClinica.findUnique({ where: { id } });
        if (!sede)
            throw new common_1.NotFoundException('Sede no encontrada');
        const bitacorasActivas = await this.prisma.bitacora.count({
            where: { sedeId: id, estado: 'ABIERTA' },
        });
        if (bitacorasActivas > 0) {
            throw new common_1.BadRequestException('No se puede desactivar una sede con bitácoras activas abiertas');
        }
        return this.prisma.sedeClinica.update({
            where: { id },
            data: { activa: false },
        });
    }
    async adminListarServicios(sedeId) {
        return this.prisma.servicio.findMany({
            where: sedeId ? { sedeId } : undefined,
            include: {
                sede: { select: { id: true, nombre: true } },
                _count: { select: { bitacoras: true } },
            },
            orderBy: [{ sede: { nombre: 'asc' } }, { nombre: 'asc' }],
        });
    }
    async adminCrearServicio(dto) {
        const sede = await this.prisma.sedeClinica.findUnique({
            where: { id: dto.sedeId },
        });
        if (!sede)
            throw new common_1.NotFoundException('Sede no encontrada');
        return this.prisma.servicio.create({
            data: { nombre: dto.nombre, sedeId: dto.sedeId },
            include: { sede: { select: { id: true, nombre: true } } },
        });
    }
    async adminActualizarServicio(id, dto) {
        const srv = await this.prisma.servicio.findUnique({ where: { id } });
        if (!srv)
            throw new common_1.NotFoundException('Servicio no encontrado');
        return this.prisma.servicio.update({
            where: { id },
            data: dto,
            include: { sede: { select: { id: true, nombre: true } } },
        });
    }
    async adminEliminarServicio(id) {
        const srv = await this.prisma.servicio.findUnique({ where: { id } });
        if (!srv)
            throw new common_1.NotFoundException('Servicio no encontrado');
        const bitacorasActivas = await this.prisma.bitacora.count({
            where: { servicioId: id, estado: 'ABIERTA' },
        });
        if (bitacorasActivas > 0) {
            throw new common_1.BadRequestException('No se puede desactivar un servicio con bitácoras activas');
        }
        return this.prisma.servicio.update({
            where: { id },
            data: { activo: false },
        });
    }
};
exports.BitacoraService = BitacoraService;
exports.BitacoraService = BitacoraService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BitacoraService);
//# sourceMappingURL=bitacora.service.js.map