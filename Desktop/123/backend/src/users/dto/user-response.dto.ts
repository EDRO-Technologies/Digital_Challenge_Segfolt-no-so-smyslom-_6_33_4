// src/users/dto/user-response.dto.ts
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
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

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
    this.isActive = user.isActive;
    this.notificationPreferences = user.notificationPreferences || {
      email: true,
      telegram: false,
    };
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
