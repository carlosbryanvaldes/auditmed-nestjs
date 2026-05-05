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
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const TEMPLATE_INCLUDE = {
    sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
            fields: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    options: { orderBy: { sortOrder: 'asc' } },
                },
            },
        },
    },
};
let FormsService = class FormsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const templates = await this.prisma.formTemplate.findMany({
            where: { isActive: true },
            include: {
                _count: { select: { sections: true } },
                sections: {
                    include: {
                        _count: { select: { fields: true } },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return templates.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            version: t.version,
            formType: t.formType,
            status: t.status,
            isActive: t.isActive,
            isDefault: t.isDefault,
            createdAt: t.createdAt,
            sectionsCount: t._count.sections,
            fieldsCount: t.sections.reduce((sum, s) => sum + s._count.fields, 0),
        }));
    }
    async findOne(id) {
        const template = await this.prisma.formTemplate.findUnique({
            where: { id },
            include: TEMPLATE_INCLUDE,
        });
        if (!template)
            throw new common_1.NotFoundException('Formulario no encontrado');
        return template;
    }
    async create(dto, userId) {
        const template = await this.prisma.formTemplate.create({
            data: {
                name: dto.name,
                description: dto.description,
                version: dto.version || '1.0',
                formType: dto.formType,
                status: dto.status || 'DRAFT',
                isActive: dto.isActive ?? true,
                createdById: userId,
                sections: {
                    create: (dto.sections || []).map((sec, si) => ({
                        title: sec.title,
                        description: sec.description,
                        orderIndex: sec.orderIndex ?? si,
                        weight: sec.weight ?? 1.0,
                        fields: {
                            create: (sec.fields || []).map((fld, fi) => ({
                                label: fld.label,
                                fieldKey: fld.fieldKey,
                                fieldType: fld.fieldType,
                                required: fld.required ?? true,
                                hasObservation: fld.hasObservation ?? false,
                                score: fld.score ?? 1.0,
                                sortOrder: fld.sortOrder ?? fi,
                                options: {
                                    create: (fld.options || []).map((opt, oi) => ({
                                        label: opt.label,
                                        value: opt.value,
                                        sortOrder: opt.sortOrder ?? oi,
                                    })),
                                },
                            })),
                        },
                    })),
                },
            },
            include: TEMPLATE_INCLUDE,
        });
        return template;
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        await this.prisma.formSection.deleteMany({ where: { templateId: id } });
        return this.prisma.formTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                version: dto.version,
                formType: dto.formType,
                status: dto.status,
                isActive: dto.isActive,
                sections: {
                    create: (dto.sections || []).map((sec, si) => ({
                        title: sec.title,
                        description: sec.description,
                        orderIndex: sec.orderIndex ?? si,
                        weight: sec.weight ?? 1.0,
                        fields: {
                            create: (sec.fields || []).map((fld, fi) => ({
                                label: fld.label,
                                fieldKey: fld.fieldKey,
                                fieldType: fld.fieldType,
                                required: fld.required ?? true,
                                hasObservation: fld.hasObservation ?? false,
                                score: fld.score ?? 1.0,
                                sortOrder: fld.sortOrder ?? fi,
                                options: {
                                    create: (fld.options || []).map((opt, oi) => ({
                                        label: opt.label,
                                        value: opt.value,
                                        sortOrder: opt.sortOrder ?? oi,
                                    })),
                                },
                            })),
                        },
                    })),
                },
            },
            include: TEMPLATE_INCLUDE,
        });
    }
    async publish(id) {
        await this.findOne(id);
        return this.prisma.formTemplate.update({
            where: { id },
            data: { status: 'PUBLISHED' },
            select: { id: true, name: true, status: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.formTemplate.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, name: true, isActive: true },
        });
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map