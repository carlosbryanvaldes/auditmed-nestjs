import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditDto, CloseAuditDto } from './dto/audit.dto';
export declare class AuditsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        page?: number;
        limit?: number;
        status?: string;
        auditorId?: number;
    }): Promise<{
        items: ({
            unidadEjecutora: {
                id: number;
                name: string;
            };
            formTemplate: {
                id: number;
                name: string;
            };
            auditor: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            auditDate: string;
            formTemplateId: number;
            auditorId: number;
            unidadEjecutoraId: number | null;
            historiaClinicaNum: string | null;
            patientHash: string | null;
            diagnosisCie10: string | null;
            diagnosisDescription: string | null;
            generalObservations: string | null;
            auditorSignature: string | null;
            caseNumber: string;
            totalItems: number | null;
            compliantItems: number | null;
            compliancePercentage: number | null;
            globalRating: string | null;
            signedAt: Date | null;
            closedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        unidadEjecutora: {
            id: number;
            name: string;
        };
        formTemplate: {
            id: number;
            name: string;
        };
        responses: ({
            field: {
                id: number;
                label: string;
                fieldKey: string;
                fieldType: string;
                score: number;
            };
        } & {
            id: number;
            createdAt: Date;
            value: string | null;
            fieldId: number;
            observation: string | null;
            conformityResult: string | null;
            caseId: number;
        })[];
        auditor: {
            username: string;
            id: number;
            fullName: string;
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditDate: string;
        formTemplateId: number;
        auditorId: number;
        unidadEjecutoraId: number | null;
        historiaClinicaNum: string | null;
        patientHash: string | null;
        diagnosisCie10: string | null;
        diagnosisDescription: string | null;
        generalObservations: string | null;
        auditorSignature: string | null;
        caseNumber: string;
        totalItems: number | null;
        compliantItems: number | null;
        compliancePercentage: number | null;
        globalRating: string | null;
        signedAt: Date | null;
        closedAt: Date | null;
    }>;
    create(dto: CreateAuditDto): Promise<{
        unidadEjecutora: {
            id: number;
            name: string;
        };
        formTemplate: {
            id: number;
            name: string;
        };
        responses: ({
            field: {
                id: number;
                label: string;
                fieldKey: string;
                fieldType: string;
                score: number;
            };
        } & {
            id: number;
            createdAt: Date;
            value: string | null;
            fieldId: number;
            observation: string | null;
            conformityResult: string | null;
            caseId: number;
        })[];
        auditor: {
            username: string;
            id: number;
            fullName: string;
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditDate: string;
        formTemplateId: number;
        auditorId: number;
        unidadEjecutoraId: number | null;
        historiaClinicaNum: string | null;
        patientHash: string | null;
        diagnosisCie10: string | null;
        diagnosisDescription: string | null;
        generalObservations: string | null;
        auditorSignature: string | null;
        caseNumber: string;
        totalItems: number | null;
        compliantItems: number | null;
        compliancePercentage: number | null;
        globalRating: string | null;
        signedAt: Date | null;
        closedAt: Date | null;
    }>;
    update(id: number, dto: Partial<CreateAuditDto>): Promise<{
        unidadEjecutora: {
            id: number;
            name: string;
        };
        formTemplate: {
            id: number;
            name: string;
        };
        responses: ({
            field: {
                id: number;
                label: string;
                fieldKey: string;
                fieldType: string;
                score: number;
            };
        } & {
            id: number;
            createdAt: Date;
            value: string | null;
            fieldId: number;
            observation: string | null;
            conformityResult: string | null;
            caseId: number;
        })[];
        auditor: {
            username: string;
            id: number;
            fullName: string;
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditDate: string;
        formTemplateId: number;
        auditorId: number;
        unidadEjecutoraId: number | null;
        historiaClinicaNum: string | null;
        patientHash: string | null;
        diagnosisCie10: string | null;
        diagnosisDescription: string | null;
        generalObservations: string | null;
        auditorSignature: string | null;
        caseNumber: string;
        totalItems: number | null;
        compliantItems: number | null;
        compliancePercentage: number | null;
        globalRating: string | null;
        signedAt: Date | null;
        closedAt: Date | null;
    }>;
    close(id: number, dto: CloseAuditDto): Promise<{
        unidadEjecutora: {
            id: number;
            name: string;
        };
        formTemplate: {
            id: number;
            name: string;
        };
        responses: ({
            field: {
                id: number;
                label: string;
                fieldKey: string;
                fieldType: string;
                score: number;
            };
        } & {
            id: number;
            createdAt: Date;
            value: string | null;
            fieldId: number;
            observation: string | null;
            conformityResult: string | null;
            caseId: number;
        })[];
        auditor: {
            username: string;
            id: number;
            fullName: string;
        };
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditDate: string;
        formTemplateId: number;
        auditorId: number;
        unidadEjecutoraId: number | null;
        historiaClinicaNum: string | null;
        patientHash: string | null;
        diagnosisCie10: string | null;
        diagnosisDescription: string | null;
        generalObservations: string | null;
        auditorSignature: string | null;
        caseNumber: string;
        totalItems: number | null;
        compliantItems: number | null;
        compliancePercentage: number | null;
        globalRating: string | null;
        signedAt: Date | null;
        closedAt: Date | null;
    }>;
    getStats(): Promise<{
        total: number;
        byStatus: {
            status: string;
            count: number;
        }[];
        avgCompliance: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        status: string;
        caseNumber: string;
    }>;
}
