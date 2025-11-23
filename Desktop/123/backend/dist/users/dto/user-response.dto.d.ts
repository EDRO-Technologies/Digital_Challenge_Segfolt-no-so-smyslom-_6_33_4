import { UserRole } from '../entities/user.entity';
export declare class UserResponseDto {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    notificationPreferences: {
        email: boolean;
        telegram: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    constructor(user: any);
}
