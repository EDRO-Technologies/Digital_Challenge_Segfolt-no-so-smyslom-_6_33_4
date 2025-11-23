import { ScheduleService } from './scheduler.service';
import { ScheduleEventDto } from './dto/scheduler-event.dto';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    getAll(): Promise<{
        success: boolean;
        data: any[];
    }>;
    create(eventDto: ScheduleEventDto): Promise<{
        success: boolean;
        data: any;
    }>;
    update(id: string, eventDto: Partial<ScheduleEventDto>): Promise<{
        success: boolean;
        data?: any;
        message?: string;
    }>;
    exportSchedule(): Promise<{
        success: boolean;
        data: any[];
    }>;
}
