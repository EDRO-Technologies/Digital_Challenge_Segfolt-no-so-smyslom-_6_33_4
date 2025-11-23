interface ScheduleEvent {
    id: number;
    title: string;
    type: 'lecture' | 'seminar' | 'pair';
    instructor: string;
    participants: string[];
    startTime: string;
    endTime: string;
    duration: number;
    date: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ScheduleService {
    private events;
    private nextId;
    getAllEvents(): Promise<ScheduleEvent[]>;
    createEvent(eventData: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduleEvent>;
    updateEvent(id: number, eventData: Partial<ScheduleEvent>): Promise<ScheduleEvent | null>;
    deleteEvent(id: number): Promise<boolean>;
    getEventById(id: number): Promise<ScheduleEvent | null>;
}
export {};
