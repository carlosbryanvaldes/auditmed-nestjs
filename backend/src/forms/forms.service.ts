import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, UpdateFormDto } from './dto/form.dto';

const TEMPLATE_INCLUDE = {
  sections: {
    orderBy: { orderIndex: 'asc' as const },
    include: {
      fields: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          options: { orderBy: { sortOrder: 'asc' as const } },
        },
      },
    },
  },
};

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: number) {
    const template = await this.prisma.formTemplate.findUnique({
      where: { id },
      include: TEMPLATE_INCLUDE,
    });
    if (!template) throw new NotFoundException('Formulario no encontrado');
    return template;
  }

  async create(dto: CreateFormDto, userId?: number) {
    const template = await this.prisma.formTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        version: dto.version || '1.0',
        formType: dto.formType,
        status: (dto.status as any) || 'DRAFT',
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
                fieldType: fld.fieldType as any,
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

  async update(id: number, dto: UpdateFormDto) {
    const existing = await this.findOne(id);

    // Delete all sections (cascade handles fields + options)
    await this.prisma.formSection.deleteMany({ where: { templateId: id } });

    return this.prisma.formTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        version: dto.version,
        formType: dto.formType,
        status: dto.status as any,
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
                fieldType: fld.fieldType as any,
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

  async publish(id: number) {
    await this.findOne(id);
    return this.prisma.formTemplate.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      select: { id: true, name: true, status: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.formTemplate.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });
  }
}
