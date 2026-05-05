import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: number;
        username: string;
    }): Promise<{
        id: number;
        username: string;
        email: string;
        fullName: string;
        role: string;
        permissions: string[];
    }>;
}
export {};
