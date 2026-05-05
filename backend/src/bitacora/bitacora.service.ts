import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EstadoPaciente } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CrearBitacoraDto,
  IngresarPacienteDto,
  RegistrarEventoDto,
  CerrarBitacoraDto,
  TipoEventoDto,
} from './dto/bitacora.dto';

// ── Constantes ────────────────────────────────────────────────────────────────
const DIAS_VENTANA_REINGRESO = 30;

// ── Haversine ─────────────────────────────────────────────────────────────────
function haversineMetros(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6_371_000; // radio Tierra en metros
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class BitacoraService {
  constructor(private prisma: PrismaService) {}

  // ── 1. Validar geolocalización ──────────────────────────────────────────────
  async validarGeolocalizacion(
    sedeId: string,
    lat: number,
    lng: number,
  ): Promise<{ valida: boolean; distanciaMetros: number }> {
    const sede = await this.prisma.sedeClinica.findUnique({
      where: { id: sedeId },
      select: { latitud: true, longitud: true, radioMetros: true },
    });
    if (!sede) throw new NotFoundException('Sede no encontrada');

    const distanciaMetros = haversineMetros(
      sede.latitud, sede.longitud, lat, lng,
    );
    return {
      valida: distanciaMetros <= sede.radioMetros,
      distanciaMetros: Math.round(distanciaMetros),
    };
  }

  // ── 2. Crear bitácora (inicio de turno) ────────────────────────────────────
  async crearBitacora(medicoUserId: number, dto: CrearBitacoraDto) {
    const sede = await this.prisma.sedeClinica.findUnique({
      where: { id: dto.sedeId },
    });
    if (!sede || !sede.activa) {
      throw new NotFoundException('Sede clínica no encontrada o inactiva');
    }

    const servicio = await this.prisma.servicio.findUnique({
      where: { id: dto.servicioId },
    });
    if (!servicio || !servicio.activo) {
      throw new NotFoundException('Servicio no encontrado o inactivo');
    }

    // Validar geo solo si se envió coordenada
    if (dto.latitud != null && dto.longitud != null) {
      const { valida, distanciaMetros } = await this.validarGeolocalizacion(
        dto.sedeId, dto.latitud, dto.longitud,
      );
      if (!valida) {
        throw new ForbiddenException(
          `Fuera del perímetro de la sede (${distanciaMetros}m de ${sede.radioMetros}m permitidos)`,
        );
      }
    }

    return this.prisma.bitacora.create({
      data: {
        turno:           dto.turno,
        supervisor:      dto.supervisor,
        medicoUserId,
        sedeId:          dto.sedeId,
        servicioId:      dto.servicioId,
        latitudApertura: dto.latitud,
        longitudApertura: dto.longitud,
      },
      include: {
        sede:    { select: { id: true, nombre: true } },
        servicio:{ select: { id: true, nombre: true } },
        medico:  { select: { id: true, fullName: true } },
      },
    });
  }

  // ── 3. Detectar reingreso ──────────────────────────────────────────────────
  async detectarReingreso(documentoHash: string): Promise<{
    esReingreso: boolean;
    ultimaEstancia?: { fechaIngreso: Date; fechaEgreso: Date | null };
  }> {
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

  // ── 4. Ingresar paciente ───────────────────────────────────────────────────
  async ingresarPaciente(bitacoraId: string, dto: IngresarPacienteDto) {
    const bitacora = await this.prisma.bitacora.findUnique({
      where: { id: bitacoraId },
    });
    if (!bitacora) throw new NotFoundException('Bitácora no encontrada');
    if (bitacora.estado === 'CERRADA') {
      throw new BadRequestException('No se puede ingresar pacientes a una bitácora cerrada');
    }

    // Verificar que no haya un ingreso activo del mismo paciente
    const activo = await this.prisma.pacienteBitacora.findFirst({
      where: { documentoHash: dto.documentoHash, estado: 'ACTIVO' },
    });
    if (activo) {
      throw new BadRequestException(
        'El paciente ya tiene un ingreso activo en este servicio',
      );
    }

    const reingreso = await this.detectarReingreso(dto.documentoHash);

    const paciente = await this.prisma.pacienteBitacora.create({
      data: {
        documentoHash:    dto.documentoHash,
        documentoEnc:     dto.documentoEnc,
        tipoDocumento:    dto.tipoDocumento,
        nombreEnc:        dto.nombreEnc,
        fechaNacEnc:      dto.fechaNacEnc,
        bitacoraIngresoId: bitacoraId,
        servicioId:       dto.servicioId,
        estado:           'ACTIVO',
      },
    });

    // Registrar evento INGRESO
    await this.prisma.eventoPaciente.create({
      data: {
        pacienteId:      paciente.id,
        bitacoraId,
        tipoEvento:      'INGRESO',
        diasEstancia:    0,
        registradoPorId: bitacora.medicoUserId,
      },
    });

    return { paciente, reingreso };
  }

  // ── 5. Registrar evento ────────────────────────────────────────────────────
  async registrarEvento(
    pacienteId: string,
    bitacoraId: string,
    userId: number,
    dto: RegistrarEventoDto,
  ) {
    const paciente = await this.prisma.pacienteBitacora.findUnique({
      where: { id: pacienteId },
      include: { bitacoraIngreso: true },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    // Calcular días de estancia
    const diasEstancia = Math.floor(
      (Date.now() - paciente.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Mapear TipoEvento → EstadoPaciente
    const estadoMap: Record<TipoEventoDto, EstadoPaciente> = {
      INGRESO:           EstadoPaciente.ACTIVO,
      ALTA:              EstadoPaciente.ALTA,
      FALLECIDO:         EstadoPaciente.FALLECIDO,
      COMPLICACION:      EstadoPaciente.COMPLICACION,
      TRASLADO_INTERNO:  EstadoPaciente.TRASLADO_INTERNO,
      TRASLADO_EXTERNO:  EstadoPaciente.TRASLADO_EXTERNO,
    };

    const nuevoEstado = estadoMap[dto.tipoEvento];
    const esEgreso = dto.tipoEvento !== TipoEventoDto.INGRESO &&
                     dto.tipoEvento !== TipoEventoDto.COMPLICACION;

    // Detalle enriquecido para traslados
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
          tipoEvento:      dto.tipoEvento,
          detalle,
          diasEstancia,
          registradoPorId: userId,
        },
      }),
      this.prisma.pacienteBitacora.update({
        where: { id: pacienteId },
        data: {
          estado:      nuevoEstado,
          fechaEgreso: esEgreso ? new Date() : undefined,
        },
      }),
    ]);

    // Notificar a Auditmed Pro en background (COMPLICACION) — nunca lanza error
    if (dto.tipoEvento === TipoEventoDto.COMPLICACION) {
      this.notificarAuditmed(pacienteId, dto.tipoEvento).catch(() => {
        /* silencioso — no impacta al usuario */
      });
    }

    return evento;
  }

  // ── 6. Notificar Auditmed Pro (silencioso) ─────────────────────────────────
  private async notificarAuditmed(
    pacienteId: string,
    tipo: string,
  ): Promise<void> {
    try {
      // Comparten la misma DB → inserción directa en la tabla de alertas.
      // Por ahora registra en EventoPaciente con detalle especial para que
      // el módulo de auditorías pueda leerlo via query SQL si lo necesita.
      // Reemplazar con lógica de AuditCase cuando se defina la integración.
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO audit_cases
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
         WHERE EXISTS (SELECT 1 FROM form_templates WHERE is_default = true)`,
        pacienteId,
        tipo,
      );
    } catch {
      // Intencional: fallo silencioso
    }
  }

  // ── 7. Pacientes activos de un servicio ────────────────────────────────────
  async obtenerPacientesActivos(bitacoraId: string) {
    const bitacora = await this.prisma.bitacora.findUnique({
      where: { id: bitacoraId },
      select: { servicioId: true },
    });
    if (!bitacora) throw new NotFoundException('Bitácora no encontrada');

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

    // Calcular días de estancia en memoria
    const now = Date.now();
    return pacientes.map((p) => ({
      ...p,
      diasEstancia: Math.floor(
        (now - p.fechaIngreso.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  // ── 8. Historial completo del paciente ─────────────────────────────────────
  async obtenerHistorialPaciente(documentoHash: string) {
    const estancias = await this.prisma.pacienteBitacora.findMany({
      where: { documentoHash },
      include: {
        bitacoraIngreso: {
          select: {
            id: true, turno: true, fecha: true,
            sede:    { select: { nombre: true } },
            servicio:{ select: { nombre: true } },
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

    const complicaciones = estancias.flatMap((e) =>
      e.eventos.filter((ev) => ev.tipoEvento === 'COMPLICACION'),
    ).length;

    const reingresos = estancias.length > 1 ? estancias.length - 1 : 0;

    return { estancias, resumen: { totalEstancias: estancias.length, totalDias, complicaciones, reingresos } };
  }

  // ── 9. Cerrar bitácora ─────────────────────────────────────────────────────
  async cerrarBitacora(bitacoraId: string, userId: number, dto: CerrarBitacoraDto) {
    const bitacora = await this.prisma.bitacora.findUnique({
      where: { id: bitacoraId },
      include: {
        pacientes: { where: { estado: 'ACTIVO' } },
        _count: { select: { pacientes: true } },
      },
    });
    if (!bitacora) throw new NotFoundException('Bitácora no encontrada');
    if (bitacora.estado === 'CERRADA') {
      throw new BadRequestException('La bitácora ya está cerrada');
    }
    if (bitacora.medicoUserId !== userId) {
      throw new ForbiddenException('Solo el médico que abrió el turno puede cerrarlo');
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

  // ── 10. Listar sedes y servicios (admin) ───────────────────────────────────
  async listarSedes() {
    return this.prisma.sedeClinica.findMany({
      where: { activa: true },
      include: { servicios: { where: { activo: true }, select: { id: true, nombre: true } } },
      orderBy: { nombre: 'asc' },
    });
  }
}
