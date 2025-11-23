import { UserRole } from '../../users/entities/user.entity';
export declare class LoginResponseDto {
    success: boolean;
    user?: {
        id: number;
        email: string;
        name: string;
        role: UserRole;
    };
    message?: string;
    constructor(success: boolean, user?: any, message?: string);
}
