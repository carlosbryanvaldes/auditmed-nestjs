import { RolesService } from './roles.service';
export declare class RolesController {
    private rolesService;
    constructor(rolesService: RolesService);
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
    getPermissions(): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        description: string | null;
        module: string;
    }[]>;
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
    updatePermissions(id: number, body: {
        permissionIds: number[];
    }): Promise<{
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
