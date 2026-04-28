import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  // ── Unidades ejecutoras ───────────────────────────────────────────────────

  findAllUnidades() {
    return this.prisma.unidadEjecutora.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createUnidad(data: { name: string; code?: string; address?: string }) {
    return this.prisma.unidadEjecutora.create({ data });
  }

  async updateUnidad(id: number, data: { name?: string; code?: string; address?: string; isActive?: boolean }) {
    const exists = await this.prisma.unidadEjecutora.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Unidad ejecutora no encontrada');
    return this.prisma.unidadEjecutora.update({ where: { id }, data });
  }

  async deleteUnidad(id: number) {
    const exists = await this.prisma.unidadEjecutora.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Unidad ejecutora no encontrada');
    return this.prisma.unidadEjecutora.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
