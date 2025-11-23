import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: {
            id: number;
            email: string;
            name: string;
            role: "admin" | "user";
        };
        message?: undefined;
    }>;
    getCurrentUser(): Promise<{
        success: boolean;
        message: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
        };
    }>;
    validateAdmin(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        message: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: "admin";
        };
    }>;
}
export {};
