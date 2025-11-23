import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
export declare class EventsService {
    private eventModel;
    constructor(eventModel: typeof Event);
    create(createEventDto: CreateEventDto): Promise<EventResponseDto>;
    findAll(): Promise<EventResponseDto[]>;
    findOne(id: number): Promise<EventResponseDto>;
    findByCourse(courseId: number): Promise<EventResponseDto[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<EventResponseDto[]>;
    update(id: number, updateEventDto: UpdateEventDto, changedBy?: string): Promise<EventResponseDto>;
    cancel(id: number, reason: string, changedBy: string): Promise<EventResponseDto>;
    reschedule(id: number, newStartTime: Date, newEndTime: Date, reason: string, changedBy: string): Promise<EventResponseDto>;
    remove(id: number): Promise<void>;
    private checkTimeConflict;
    private checkTimeConflictForReschedule;
    private getChanges;
}
