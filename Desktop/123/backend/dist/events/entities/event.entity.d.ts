import { Model } from 'sequelize-typescript';
import { Course } from '../../courses/entities/course.entity';
import { Registration } from 'src/registration/entities/registration.entity';
export declare enum EventType {
    LECTURE = "lecture",
    SEMINAR = "seminar",
    PRACTICAL = "practical",
    LABORATORY = "laboratory",
    CONSULTATION = "consultation",
    EXAM = "exam",
    HACKATHON = "hackathon",
    WORKSHOP = "workshop"
}
export declare enum EventStatus {
    SCHEDULED = "scheduled",
    CANCELLED = "cancelled",
    RESCHEDULED = "rescheduled",
    COMPLETED = "completed",
    ONLINE = "online"
}
export declare class Event extends Model {
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
    changeHistory: Array<{
        field: string;
        oldValue: any;
        newValue: any;
        changedBy: string;
        changedAt: Date;
        reason?: string;
    }>;
    courseId: number;
    course: Course;
    registrations: Registration[];
}
