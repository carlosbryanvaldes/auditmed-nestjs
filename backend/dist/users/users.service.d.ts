import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        role: {
            id: number;
            name: string;
        };
        username: string;
        id: number;
        email: string;
        fullName: string;
        status: string;
        roleId: number;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        role: {
            id: number;
            name: string;
        };
        username: string;
        id: number;
        email: string;
        fullName: string;
        status: string;
        roleId: number;
        createdAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        role: {
            id: number;
            name: string;
        };
        username: string;
        id: number;
        email: string;
        fullName: string;
        status: string;
        roleId: number;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        role: {
            id: number;
            name: string;
        };
        username: string;
        id: number;
        email: string;
        fullName: string;
        status: string;
        roleId: number;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        role: {
            id: number;
            name: string;
        };
        username: string;
        id: number;
        email: string;
        fullName: string;
        status: string;
        roleId: number;
        createdAt: Date;
    }>;
}
