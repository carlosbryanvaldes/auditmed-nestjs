import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, UpdateFormDto } from './dto/form.dto';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        description: string;
        version: string;
        formType: string;
        status: string;
        isActive: boolean;
        isDefault: boolean;
        createdAt: Date;
        sectionsCount: number;
        fieldsCount: number;
    }[]>;
    findOne(id: number): Promise<{
        sections: ({
            fields: ({
                options: {
                    id: number;
                    label: string;
                    value: string;
                    sortOrder: number;
                    fieldId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                label: string;
                sortOrder: number;
                fieldKey: string;
                fieldType: string;
                required: boolean;
                hasObservation: boolean;
                score: number;
                sectionId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            description: string | null;
            title: string;
            orderIndex: number;
            weight: number;
            templateId: number;
        })[];
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        version: string;
        formType: string | null;
        isActive: boolean;
        isDefault: boolean;
        createdById: number | null;
    }>;
    create(dto: CreateFormDto, userId?: number): Promise<{
        sections: ({
            fields: ({
                options: {
                    id: number;
                    label: string;
                    value: string;
                    sortOrder: number;
                    fieldId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                label: string;
                sortOrder: number;
                fieldKey: string;
                fieldType: string;
                required: boolean;
                hasObservation: boolean;
                score: number;
                sectionId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            description: string | null;
            title: string;
            orderIndex: number;
            weight: number;
            templateId: number;
        })[];
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        version: string;
        formType: string | null;
        isActive: boolean;
        isDefault: boolean;
        createdById: number | null;
    }>;
    update(id: number, dto: UpdateFormDto): Promise<{
        sections: ({
            fields: ({
                options: {
                    id: number;
                    label: string;
                    value: string;
                    sortOrder: number;
                    fieldId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                label: string;
                sortOrder: number;
                fieldKey: string;
                fieldType: string;
                required: boolean;
                hasObservation: boolean;
                score: number;
                sectionId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            description: string | null;
            title: string;
            orderIndex: number;
            weight: number;
            templateId: number;
        })[];
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        version: string;
        formType: string | null;
        isActive: boolean;
        isDefault: boolean;
        createdById: number | null;
    }>;
    publish(id: number): Promise<{
        id: number;
        status: string;
        name: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        isActive: boolean;
    }>;
}
