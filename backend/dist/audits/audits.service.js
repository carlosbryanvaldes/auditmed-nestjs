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
exports.AuditsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function generateCaseNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `AUD-${y}${m}${d}-${rand}`;
}
const CASE_INCLUDE = {
    formTemplate: { select: { id: true, name: true } },
    unidadEjecutora: { select: { id: true, name: true } },
    auditor: { select: { id: true, fullName: true, username: true } },
    responses: {
        include: {
            field: { select: { id: true, label: true, fieldKey: true, fieldType: true, score: true } },
        },
    },
};
let AuditsService = class AuditsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.auditorId)
            where.auditorId = Number(query.auditorId);
        const [items, total] = await Promise.all([
            this.prisma.auditCase.findMany({
                where,
                include: {
                    formTemplate: { select: { id: true, name: true } },
                    unidadEjecutora: { select: { id: true, name: true } },
                    auditor: { select: { id: true, fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.auditCase.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const audit = await this.prisma.auditCase.findUnique({
            where: { id },
            include: CASE_INCLUDE,
        });
        if (!audit)
            throw new common_1.NotFoundException('Caso de auditoría no encontrado');
        return audit;
    }
    async create(dto) {
        let caseNumber = generateCaseNumber();
        while (await this.prisma.auditCase.findUnique({ where: { caseNumber } })) {
            caseNumber = generateCaseNumber();
        }
        const audit = await this.prisma.auditCase.create({
            data: {
                caseNumber,
                auditDate: dto.auditDate,
                formTemplateId: dto.formTemplateId,
                auditorId: dto.auditorId,
                unidadEjecutoraId: dto.unidadEjecutoraId,
                historiaClinicaNum: dto.historiaClinicaNum,
                patientHash: dto.patientHash,
                diagnosisCie10: dto.diagnosisCie10,
                diagnosisDescription: dto.diagnosisDescription,
                generalObservations: dto.generalObservations,
                status: 'DRAFT',
                responses: {
                    createMany: {
                        data: (dto.responses || []).map((r) => ({
                            fieldId: r.fieldId,
                            value: r.value,
                            observation: r.observation,
                            conformityResult: r.conformityResult,
                        })),
                    },
                },
            },
            include: CASE_INCLUDE,
        });
        return audit;
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = {};
        if (dto.auditDate)
            data.auditDate = dto.auditDate;
        if (dto.unidadEjecutoraId)
            data.unidadEjecutoraId = dto.unidadEjecutoraId;
        if (dto.historiaClinicaNum)
            data.historiaClinicaNum = dto.historiaClinicaNum;
        if (dto.patientHash)
            data.patientHash = dto.patientHash;
        if (dto.diagnosisCie10)
            data.diagnosisCie10 = dto.diagnosisCie10;
        if (dto.diagnosisDescription)
            data.diagnosisDescription = dto.diagnosisDescription;
        if (dto.generalObservations)
            data.generalObservations = dto.generalObservations;
        if (dto.responses && dto.responses.length > 0) {
            for (const r of dto.responses) {
                await this.prisma.auditResponse.upsert({
                    where: { caseId_fieldId: { caseId: id, fieldId: r.fieldId } },
                    update: {
                        value: r.value,
                        observation: r.observation,
                        conformityResult: r.conformityResult,
                    },
                    create: {
                        caseId: id,
                        fieldId: r.fieldId,
                        value: r.value,
                        observation: r.observation,
                        conformityResult: r.conformityResult,
                    },
                });
            }
        }
        return this.prisma.auditCase.update({
            where: { id },
            data,
            include: CASE_INCLUDE,
        });
    }
    async close(id, dto) {
        const audit = await this.findOne(id);
        if (audit.status === 'CLOSED') {
            throw new common_1.BadRequestException('El caso ya está cerrado');
        }
        if (dto.responses) {
            for (const r of dto.responses) {
                await this.prisma.auditResponse.upsert({
                    where: { caseId_fieldId: { caseId: id, fieldId: r.fieldId } },
                    update: {
                        value: r.value,
                        observation: r.observation,
                        conformityResult: r.conformityResult,
                    },
                    create: {
                        caseId: id,
                        fieldId: r.fieldId,
                        value: r.value,
                        observation: r.observation,
                        conformityResult: r.conformityResult,
                    },
                });
            }
        }
        const responses = await this.prisma.auditResponse.findMany({
            where: { caseId: id },
            include: { field: true },
        });
        const totalItems = responses.length;
        const compliantItems = responses.filter((r) => r.conformityResult === 'conforme' || r.value === 'yes' || r.value === 'si').length;
        const compliancePct = totalItems > 0 ? (compliantItems / totalItems) * 100 : 0;
        const globalRating = compliancePct >= 90 ? 'excelente'
            : compliancePct >= 75 ? 'buena'
                : compliancePct >= 60 ? 'regular'
                    : 'deficiente';
        return this.prisma.auditCase.update({
            where: { id },
            data: {
                status: 'CLOSED',
                generalObservations: dto.generalObservations,
                auditorSignature: dto.auditorSignature,
                signedAt: dto.auditorSignature ? new Date() : undefined,
                closedAt: new Date(),
                totalItems,
                compliantItems,
                compliancePercentage: Math.round(compliancePct * 10) / 10,
                globalRating,
            },
            include: CASE_INCLUDE,
        });
    }
    async getStats() {
        const [total, byStatus, recent] = await Promise.all([
            this.prisma.auditCase.count(),
            this.prisma.auditCase.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
            this.prisma.auditCase.findMany({
                where: { status: 'CLOSED' },
                select: { compliancePercentage: true, globalRating: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
        ]);
        const avgCompliance = recent.length
            ? recent.reduce((s, r) => s + (r.compliancePercentage || 0), 0) / recent.length
            : 0;
        return {
            total,
            byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
            avgCompliance: Math.round(avgCompliance * 10) / 10,
        };
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.auditCase.update({
            where: { id },
            data: { status: 'REJECTED' },
            select: { id: true, caseNumber: true, status: true },
        });
    }
};
exports.AuditsService = AuditsService;
exports.AuditsService = AuditsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditsService);
//# sourceMappingURL=audits.service.js.map