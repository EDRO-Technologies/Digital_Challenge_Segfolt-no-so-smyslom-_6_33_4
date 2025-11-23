// src/auth/dto/login-response.dto.ts
import { UserRole } from '../../users/entities/user.entity';

export class LoginResponseDto {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
  message?: string;

  constructor(success: boolean, user?: any, message?: string) {
    this.success = success;
    if (user) {
      this.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
    this.message = message;
  }
}
