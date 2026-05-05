import {
  Controller, Get, Post, Patch,
  Body, Param, UseGuards, Request,
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
} from './dto/bitacora.dto';

@Controller('bitacora')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BitacoraController {
  constructor(private readonly service: BitacoraService) {}

  /** Lista sedes clínicas activas con sus servicios */
  @Get('sedes')
  @RequirePermissions('bitacora:read')
  listarSedes() {
    return this.service.listarSedes();
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

  /** Historial completo de un paciente por hash (solo JEFE/AUDITOR/ADMIN) */
  @Get('paciente/:hash/historial')
  @RequirePermissions('bitacora:historial')
  getHistorial(@Param('hash') hash: string) {
    return this.service.obtenerHistorialPaciente(hash);
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
