import { MasterService } from './master.service';
export declare class MasterController {
    private masterService;
    constructor(masterService: MasterService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        code: string | null;
        address: string | null;
    }[]>;
    create(body: {
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
    update(id: number, body: {
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
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        code: string | null;
        address: string | null;
    }>;
}
