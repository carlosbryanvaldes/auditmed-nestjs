export declare enum TurnoBitacoraDto {
    MANANA = "MANANA",
    TARDE = "TARDE",
    NOCHE = "NOCHE",
    GUARDIA_24 = "GUARDIA_24",
    ESPECIAL = "ESPECIAL"
}
export declare enum TipoDocumentoDto {
    CEDULA = "CEDULA",
    PASAPORTE = "PASAPORTE",
    CARNET_EXTRANJERIA = "CARNET_EXTRANJERIA",
    SIN_DOCUMENTO = "SIN_DOCUMENTO"
}
export declare enum TipoEventoDto {
    INGRESO = "INGRESO",
    ALTA = "ALTA",
    FALLECIDO = "FALLECIDO",
    COMPLICACION = "COMPLICACION",
    TRASLADO_INTERNO = "TRASLADO_INTERNO",
    TRASLADO_EXTERNO = "TRASLADO_EXTERNO"
}
export declare class CrearBitacoraDto {
    turno: TurnoBitacoraDto;
    supervisor: string;
    sedeId: string;
    servicioId: string;
    latitud?: number;
    longitud?: number;
}
export declare class IngresarPacienteDto {
    tipoDocumento: TipoDocumentoDto;
    documentoHash: string;
    documentoEnc: string;
    nombreEnc: string;
    fechaNacEnc: string;
    servicioId?: string;
}
export declare class RegistrarEventoDto {
    tipoEvento: TipoEventoDto;
    detalle?: string;
    destinoServicioId?: string;
}
export declare class CerrarBitacoraDto {
    observacionesCierre?: string;
}
export declare class CrearSedeDto {
    nombre: string;
    latitud: number;
    longitud: number;
    radioMetros?: number;
}
export declare class UpdateSedeDto {
    nombre?: string;
    latitud?: number;
    longitud?: number;
    radioMetros?: number;
    activa?: boolean;
}
export declare class CrearServicioDto {
    nombre: string;
    sedeId: string;
}
export declare class UpdateServicioDto {
    nombre?: string;
    activo?: boolean;
}
