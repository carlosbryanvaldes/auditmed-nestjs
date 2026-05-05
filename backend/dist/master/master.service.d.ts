import { PrismaService } from '../prisma/prisma.service';
export declare class MasterService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllUnidades(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        code: string | null;
        address: string | null;
    }[]>;
    createUnidad(data: {
        name: string;
        code?: string;
        address?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        code: string | null;
        address: string | null;
    }>;
    updateUnidad(id: number, data: {
        name?: string;
        code?: string;
        address?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        code: string | null;
        address: string | null;
    }>;
    deleteUnidad(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        code: string | null;
        address: string | null;
    }>;
}
