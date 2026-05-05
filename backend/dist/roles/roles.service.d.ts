import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        rolePermissions: ({
            permission: {
                id: number;
                createdAt: Date;
                name: string;
                description: string | null;
                module: string;
            };
        } & {
            roleId: number;
            permissionId: number;
        })[];
        _count: {
            users: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    })[]>;
    findOne(id: number): Promise<{
        rolePermissions: ({
            permission: {
                id: number;
                createdAt: Date;
                name: string;
                description: string | null;
                module: string;
            };
        } & {
            roleId: number;
            permissionId: number;
        })[];
        _count: {
            users: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
    findAllPermissions(): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        description: string | null;
        module: string;
    }[]>;
    updatePermissions(roleId: number, permissionIds: number[]): Promise<{
        rolePermissions: ({
            permission: {
                id: number;
                createdAt: Date;
                name: string;
                description: string | null;
                module: string;
            };
        } & {
            roleId: number;
            permissionId: number;
        })[];
        _count: {
            users: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
}
