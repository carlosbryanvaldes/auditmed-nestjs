import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import {
  CrearBitacoraDto,
  IngresarPacienteDto,
  RegistrarEventoDto,
  CerrarBitacoraDto,
  CrearSedeDto,
  UpdateSedeDto,
  CrearServicioDto,
  UpdateServicioDto,
} from './dto/bitacora.dto';

@Controller('bitacora')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BitacoraController {
  constructor(private readonly service: BitacoraService) {}

  // ── Admin: Sedes (DEBEN ir antes que las rutas con :id) ─────────────────────

  @Get('admin/sedes')
  @RequirePermissions('bitacora:admin')
  adminListarSedes() {
    return this.service.adminListarSedes();
  }

  @Post('admin/sedes')
  @RequirePermissions('bitacora:admin')
  adminCrearSede(@Body() dto: CrearSedeDto) {
    return this.service.adminCrearSede(dto);
  }

  @Put('admin/sedes/:id')
  @RequirePermissions('bitacora:admin')
  adminActualizarSede(@Param('id') id: string, @Body() dto: UpdateSedeDto) {
    return this.service.adminActualizarSede(id, dto);
  }

  @Delete('admin/sedes/:id')
  @RequirePermissions('bitacora:admin')
  adminEliminarSede(@Param('id') id: string) {
    return this.service.adminEliminarSede(id);
  }

  // ── Admin: Servicios (DEBEN ir antes que las rutas con :id) ────────────────

  @Get('admin/servicios')
  @RequirePermissions('bitacora:admin')
  adminListarServicios(@Query('sedeId') sedeId?: string) {
    return this.service.adminListarServicios(sedeId);
  }

  @Post('admin/servicios')
  @RequirePermissions('bitacora:admin')
  adminCrearServicio(@Body() dto: CrearServicioDto) {
    return this.service.adminCrearServicio(dto);
  }

  @Put('admin/servicios/:id')
  @RequirePermissions('bitacora:admin')
  adminActualizarServicio(@Param('id') id: string, @Body() dto: UpdateServicioDto) {
    return this.service.adminActualizarServicio(id, dto);
  }

  @Delete('admin/servicios/:id')
  @RequirePermissions('bitacora:admin')
  adminEliminarServicio(@Param('id') id: string) {
    return this.service.adminEliminarServicio(id);
  }

  // ── Operacionales (rutas con parámetros :id van DESPUÉS de las estáticas) ──

  /** Lista sedes clínicas activas con sus servicios */
  @Get('sedes')
  @RequirePermissions('bitacora:read')
  listarSedes() {
    return this.service.listarSedes();
  }

  /** Historial completo de un paciente por hash */
  @Get('paciente/:hash/historial')
  @RequirePermissions('bitacora:historial')
  getHistorial(@Param('hash') hash: string) {
    return this.service.obtenerHistorialPaciente(hash);
  }

  /** Iniciar turno — crea una nueva bitácora */
  @Post()
  @RequirePermissions('bitacora:write')
  crearBitacora(@Request() req, @Body() dto: CrearBitacoraDto) {
    return this.service.crearBitacora(req.user.sub, dto);
  }

  /** Pacientes activos de una bitácora */
  @Get(':id/pacientes')
  @RequirePermissions('bitacora:read')
  getPacientes(@Param('id') id: string) {
    return this.service.obtenerPacientesActivos(id);
  }

  /** Ingresar paciente a una bitácora */
  @Post(':id/pacientes')
  @RequirePermissions('bitacora:write')
  ingresarPaciente(
    @Param('id') id: string,
    @Body() dto: IngresarPacienteDto,
  ) {
    return this.service.ingresarPaciente(id, dto);
  }

  /** Registrar evento sobre un paciente */
  @Post(':id/pacientes/:pacId/eventos')
  @RequirePermissions('bitacora:write')
  registrarEvento(
    @Param('id') bitacoraId: string,
    @Param('pacId') pacienteId: string,
    @Request() req,
    @Body() dto: RegistrarEventoDto,
  ) {
    return this.service.registrarEvento(
      pacienteId, bitacoraId, req.user.sub, dto,
    );
  }

  /** Cerrar turno */
  @Patch(':id/cerrar')
  @RequirePermissions('bitacora:close')
  cerrarBitacora(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CerrarBitacoraDto,
  ) {
    return this.service.cerrarBitacora(id, req.user.sub, dto);
  }
}
