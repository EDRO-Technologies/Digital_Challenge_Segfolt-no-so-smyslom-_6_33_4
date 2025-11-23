// src/courses/dto/create-course.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  targetGroup: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
