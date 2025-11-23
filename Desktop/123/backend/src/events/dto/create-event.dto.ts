// src/events/dto/create-event.dto.ts
import {
  IsString,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventStatus } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsString()
  @IsNotEmpty()
  instructor: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxParticipants?: number;

  @IsString()
  @IsOptional()
  targetGroup?: string;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
