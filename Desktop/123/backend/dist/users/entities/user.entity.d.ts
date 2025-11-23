import { Model } from 'sequelize-typescript';
import { Registration } from 'src/registration/entities/registration.entity';
export declare enum UserRole {
    ADMIN = "admin",
    ORGANIZER = "organizer",
    PARTICIPANT = "participant"
}
export declare class User extends Model {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    registrations: Registration[];
}
