export declare class AuditResponseDto {
    fieldId: number;
    value?: string;
    observation?: string;
    conformityResult?: string;
}
export declare class CreateAuditDto {
    auditDate: string;
    formTemplateId: number;
    auditorId: number;
    unidadEjecutoraId?: number;
    historiaClinicaNum?: string;
    patientHash?: string;
    diagnosisCie10?: string;
    diagnosisDescription?: string;
    generalObservations?: string;
    responses?: AuditResponseDto[];
}
export declare class CloseAuditDto {
    generalObservations?: string;
    auditorSignature?: string;
    responses?: AuditResponseDto[];
}
