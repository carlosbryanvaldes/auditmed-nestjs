import {
  IsString, IsNotEmpty, IsOptional, IsNumber,
  IsEnum, IsInt, IsPositive,
} from 'class-validator';

export enum TurnoBitacoraDto {
  MANANA    = 'MANANA',
  TARDE     = 'TARDE',
  NOCHE     = 'NOCHE',
  GUARDIA_24 = 'GUARDIA_24',
  ESPECIAL  = 'ESPECIAL',
}

export enum TipoDocumentoDto {
  CEDULA             = 'CEDULA',
  PASAPORTE          = 'PASAPORTE',
  CARNET_EXTRANJERIA = 'CARNET_EXTRANJERIA',
  SIN_DOCUMENTO      = 'SIN_DOCUMENTO',
}

export enum TipoEventoDto {
  INGRESO           = 'INGRESO',
  ALTA              = 'ALTA',
  FALLECIDO         = 'FALLECIDO',
  COMPLICACION      = 'COMPLICACION',
  TRASLADO_INTERNO  = 'TRASLADO_INTERNO',
  TRASLADO_EXTERNO  = 'TRASLADO_EXTERNO',
}

// ── Crear bitácora (inicio de turno) ─────────────────────────────────────────
export class CrearBitacoraDto {
  @IsEnum(TurnoBitacoraDto)
  turno: TurnoBitacoraDto;

  @IsString() @IsNotEmpty()
  supervisor: string;

  @IsString() @IsNotEmpty()
  sedeId: string;

  @IsString() @IsNotEmpty()
  servicioId: string;

  @IsOptional() @IsNumber()
  latitud?: number;

  @IsOptional() @IsNumber()
  longitud?: number;
}

// ── Ingresar paciente ─────────────────────────────────────────────────────────
export class IngresarPacienteDto {
  @IsEnum(TipoDocumentoDto)
  tipoDocumento: TipoDocumentoDto;

  /** Hash SHA-256 del número de documento (nunca viaja el doc real) */
  @IsString() @IsNotEmpty()
  documentoHash: string;

  /** Número de documento cifrado (AES, solo para display al jefe/auditor) */
  @IsString() @IsNotEmpty()
  documentoEnc: string;

  /** Nombre completo cifrado */
  @IsString() @IsNotEmpty()
  nombreEnc: string;

  /** Fecha de nacimiento cifrada (YYYY-MM-DD) */
  @IsString() @IsNotEmpty()
  fechaNacEnc: string;

  @IsOptional() @IsString()
  servicioId?: string;
}

// ── Registrar evento ──────────────────────────────────────────────────────────
export class RegistrarEventoDto {
  @IsEnum(TipoEventoDto)
  tipoEvento: TipoEventoDto;

  @IsOptional() @IsString()
  detalle?: string;

  /** Servicio destino para traslados internos */
  @IsOptional() @IsString()
  destinoServicioId?: string;
}

// ── Cerrar bitácora (cierre de turno) ─────────────────────────────────────────
export class CerrarBitacoraDto {
  @IsOptional() @IsString()
  observacionesCierre?: string;
}
