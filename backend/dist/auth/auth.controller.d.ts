import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            fullName: string;
            role: string;
            permissions: string[];
        };
    }>;
    getMe(user: any): Promise<{
        id: number;
        username: string;
        email: string;
        fullName: string;
        role: string;
        permissions: string[];
    }>;
}
