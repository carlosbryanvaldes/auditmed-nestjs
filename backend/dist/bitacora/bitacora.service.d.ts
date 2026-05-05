import { PrismaService } from '../prisma/prisma.service';
import { CrearBitacoraDto, IngresarPacienteDto, RegistrarEventoDto, CerrarBitacoraDto, CrearSedeDto, UpdateSedeDto, CrearServicioDto, UpdateServicioDto } from './dto/bitacora.dto';
export declare class BitacoraService {
    private prisma;
    constructor(prisma: PrismaService);
    validarGeolocalizacion(sedeId: string, lat: number, lng: number): Promise<{
        valida: boolean;
        distanciaMetros: number;
    }>;
    crearBitacora(medicoUserId: number, dto: CrearBitacoraDto): Promise<{
        servicio: {
            id: string;
            nombre: string;
        };
        sede: {
            id: string;
            nombre: string;
        };
        medico: {
            id: number;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        turno: import(".prisma/client").$Enums.TurnoBitacora;
        supervisor: string;
        sedeId: string;
        servicioId: string;
        fecha: Date;
        estado: import(".prisma/client").$Enums.EstadoBitacora;
        latitudApertura: number | null;
        longitudApertura: number | null;
        medicoUserId: number;
    }>;
    detectarReingreso(documentoHash: string): Promise<{
        esReingreso: boolean;
        ultimaEstancia?: {
            fechaIngreso: Date;
            fechaEgreso: Date | null;
        };
    }>;
    ingresarPaciente(bitacoraId: string, dto: IngresarPacienteDto): Promise<{
        paciente: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            servicioId: string | null;
            tipoDocumento: import(".prisma/client").$Enums.TipoDocumento;
            documentoHash: string;
            documentoEnc: string;
            nombreEnc: string;
            fechaNacEnc: string;
            estado: import(".prisma/client").$Enums.EstadoPaciente;
            bitacoraIngresoId: string;
            fechaIngreso: Date;
            fechaEgreso: Date | null;
        };
        reingreso: {
            esReingreso: boolean;
            ultimaEstancia?: {
                fechaIngreso: Date;
                fechaEgreso: Date | null;
            };
        };
    }>;
    registrarEvento(pacienteId: string, bitacoraId: string, userId: number, dto: RegistrarEventoDto): Promise<{
        id: string;
        createdAt: Date;
        tipoEvento: import(".prisma/client").$Enums.TipoEvento;
        detalle: string | null;
        bitacoraId: string;
        diasEstancia: number;
        pacienteId: string;
        registradoPorId: number;
    }>;
    private notificarAuditmed;
    obtenerPacientesActivos(bitacoraId: string): Promise<{
        diasEstancia: number;
        eventos: {
            createdAt: Date;
            tipoEvento: import(".prisma/client").$Enums.TipoEvento;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        servicioId: string | null;
        tipoDocumento: import(".prisma/client").$Enums.TipoDocumento;
        documentoHash: string;
        documentoEnc: string;
        nombreEnc: string;
        fechaNacEnc: string;
        estado: import(".prisma/client").$Enums.EstadoPaciente;
        bitacoraIngresoId: string;
        fechaIngreso: Date;
        fechaEgreso: Date | null;
    }[]>;
    obtenerHistorialPaciente(documentoHash: string): Promise<{
        estancias: ({
            bitacoraIngreso: {
                servicio: {
                    nombre: string;
                };
                id: string;
                turno: import(".prisma/client").$Enums.TurnoBitacora;
                sede: {
                    nombre: string;
                };
                fecha: Date;
            };
            eventos: ({
                registradoPor: {
                    fullName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                tipoEvento: import(".prisma/client").$Enums.TipoEvento;
                detalle: string | null;
                bitacoraId: string;
                diasEstancia: number;
                pacienteId: string;
                registradoPorId: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            servicioId: string | null;
            tipoDocumento: import(".prisma/client").$Enums.TipoDocumento;
            documentoHash: string;
            documentoEnc: string;
            nombreEnc: string;
            fechaNacEnc: string;
            estado: import(".prisma/client").$Enums.EstadoPaciente;
            bitacoraIngresoId: string;
            fechaIngreso: Date;
            fechaEgreso: Date | null;
        })[];
        resumen: {
            totalEstancias: number;
            totalDias: number;
            complicaciones: number;
            reingresos: number;
        };
    }>;
    cerrarBitacora(bitacoraId: string, userId: number, dto: CerrarBitacoraDto): Promise<{
        id: string;
        _count: {
            pacientes: number;
        };
        turno: import(".prisma/client").$Enums.TurnoBitacora;
        fecha: Date;
        estado: import(".prisma/client").$Enums.EstadoBitacora;
    }>;
    listarSedes(): Promise<({
        servicios: {
            id: string;
            nombre: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitud: number;
        longitud: number;
        nombre: string;
        radioMetros: number;
        activa: boolean;
    })[]>;
    adminListarSedes(): Promise<({
        _count: {
            bitacoras: number;
            servicios: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitud: number;
        longitud: number;
        nombre: string;
        radioMetros: number;
        activa: boolean;
    })[]>;
    adminCrearSede(dto: CrearSedeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitud: number;
        longitud: number;
        nombre: string;
        radioMetros: number;
        activa: boolean;
    }>;
    adminActualizarSede(id: string, dto: UpdateSedeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitud: number;
        longitud: number;
        nombre: string;
        radioMetros: number;
        activa: boolean;
    }>;
    adminEliminarSede(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        latitud: number;
        longitud: number;
        nombre: string;
        radioMetros: number;
        activa: boolean;
    }>;
    adminListarServicios(sedeId?: string): Promise<({
        _count: {
            bitacoras: number;
        };
        sede: {
            id: string;
            nombre: string;
        };
    } & {
        id: string;
        createdAt: Date;
        sedeId: string;
        nombre: string;
        activo: boolean;
    })[]>;
    adminCrearServicio(dto: CrearServicioDto): Promise<{
        sede: {
            id: string;
            nombre: string;
        };
    } & {
        id: string;
        createdAt: Date;
        sedeId: string;
        nombre: string;
        activo: boolean;
    }>;
    adminActualizarServicio(id: string, dto: UpdateServicioDto): Promise<{
        sede: {
            id: string;
            nombre: string;
        };
    } & {
        id: string;
        createdAt: Date;
        sedeId: string;
        nombre: string;
        activo: boolean;
    }>;
    adminEliminarServicio(id: string): Promise<{
        id: string;
        createdAt: Date;
        sedeId: string;
        nombre: string;
        activo: boolean;
    }>;
}
