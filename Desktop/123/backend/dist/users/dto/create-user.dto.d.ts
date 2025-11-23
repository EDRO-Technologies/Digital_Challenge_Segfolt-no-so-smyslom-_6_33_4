import { UserRole } from '../enums/user-role.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    role?: UserRole;
    notificationPreferences?: {
        email?: boolean;
        telegram?: boolean;
    };
}
