import { EventType } from '../entities/event.entity';
export declare class CreateEventDto {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    type?: EventType;
    instructor: string;
    location: string;
    maxParticipants?: number;
    targetGroup?: string;
    courseId: number;
}
