import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(createEventDto: CreateEventDto): Promise<EventResponseDto>;
    findAll(): Promise<EventResponseDto[]>;
    findByCourse(courseId: number): Promise<EventResponseDto[]>;
    findByDateRange(startDate: string, endDate: string): Promise<EventResponseDto[]>;
    findOne(id: number): Promise<EventResponseDto>;
    update(id: number, updateEventDto: UpdateEventDto): Promise<EventResponseDto>;
    cancel(id: number, reason: string): Promise<EventResponseDto>;
    reschedule(id: number, rescheduleData: {
        newStartTime: Date;
        newEndTime: Date;
        reason: string;
    }): Promise<EventResponseDto>;
    remove(id: number): Promise<void>;
}
