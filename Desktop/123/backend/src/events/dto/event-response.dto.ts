// src/events/dto/event-response.dto.ts
import { EventType, EventStatus } from '../entities/event.entity';

export class EventResponseDto {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  status: EventStatus;
  instructor: string;
  location: string;
  maxParticipants: number;
  targetGroup: string;
  courseId: number;
  registrationsCount: number;
  changeHistory: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    changedAt: Date;
    reason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;

  constructor(event: any) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
    this.type = event.type;
    this.status = event.status;
    this.instructor = event.instructor;
    this.location = event.location;
    this.maxParticipants = event.maxParticipants;
    this.targetGroup = event.targetGroup;
    this.courseId = event.courseId;
    this.registrationsCount = event.registrations?.length || 0;
    this.changeHistory = event.changeHistory || [];
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}
