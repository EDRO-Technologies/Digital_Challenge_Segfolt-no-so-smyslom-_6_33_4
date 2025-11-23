// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsObject } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsObject()
  @IsOptional()
  notificationPreferences?: {
    email?: boolean;
    telegram?: boolean;
  };
}