import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditDto, CloseAuditDto } from './dto/audit.dto';

function generateCaseNumber(): string {
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

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: string; auditorId?: number }) {
    const page  = Number(query.page)  || 1;
    const limit = Number(query.limit) || 20;
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (query.status)    where.status    = query.status;
    if (query.auditorId) where.auditorId = Number(query.auditorId);

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

  async findOne(id: number) {
    const audit = await this.prisma.auditCase.findUnique({
      where: { id },
      include: CASE_INCLUDE,
    });
    if (!audit) throw new NotFoundException('Caso de auditoría no encontrado');
    return audit;
  }

  async create(dto: CreateAuditDto) {
    let caseNumber = generateCaseNumber();
    // Ensure uniqueness
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

  async update(id: number, dto: Partial<CreateAuditDto>) {
    await this.findOne(id);

    const data: any = {};
    if (dto.auditDate)           data.auditDate           = dto.auditDate;
    if (dto.unidadEjecutoraId)   data.unidadEjecutoraId   = dto.unidadEjecutoraId;
    if (dto.historiaClinicaNum)  data.historiaClinicaNum  = dto.historiaClinicaNum;
    if (dto.patientHash)         data.patientHash         = dto.patientHash;
    if (dto.diagnosisCie10)      data.diagnosisCie10      = dto.diagnosisCie10;
    if (dto.diagnosisDescription) data.diagnosisDescription = dto.diagnosisDescription;
    if (dto.generalObservations) data.generalObservations = dto.generalObservations;

    // Upsert responses
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

  async close(id: number, dto: CloseAuditDto) {
    const audit = await this.findOne(id);
    if (audit.status === 'CLOSED') {
      throw new BadRequestException('El caso ya está cerrado');
    }

    // Save final responses
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

    // Calculate compliance
    const responses = await this.prisma.auditResponse.findMany({
      where: { caseId: id },
      include: { field: true },
    });

    const totalItems    = responses.length;
    const compliantItems = responses.filter(
      (r) => r.conformityResult === 'conforme' || r.value === 'yes' || r.value === 'si',
    ).length;
    const compliancePct = totalItems > 0 ? (compliantItems / totalItems) * 100 : 0;
    const globalRating =
      compliancePct >= 90 ? 'excelente'
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

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.auditCase.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: { id: true, caseNumber: true, status: true },
    });
  }
}
