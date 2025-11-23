import { EventType, EventStatus } from '../entities/event.entity';
export declare class EventResponseDto {
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
    constructor(event: any);
}
