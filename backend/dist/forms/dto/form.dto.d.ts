export declare class FieldOptionDto {
    label: string;
    value: string;
    sortOrder?: number;
}
export declare class FormFieldDto {
    label: string;
    fieldKey: string;
    fieldType: string;
    required?: boolean;
    hasObservation?: boolean;
    score?: number;
    sortOrder?: number;
    options?: FieldOptionDto[];
}
export declare class FormSectionDto {
    title: string;
    description?: string;
    orderIndex?: number;
    weight?: number;
    fields?: FormFieldDto[];
}
export declare class CreateFormDto {
    name: string;
    description?: string;
    version?: string;
    formType?: string;
    status?: string;
    isActive?: boolean;
    sections?: FormSectionDto[];
}
export declare class UpdateFormDto extends CreateFormDto {
}
