export declare class ScheduleEventDto {
    title: string;
    type: 'lecture' | 'seminar' | 'pair';
    instructor: string;
    participants: string[];
    startTime: string;
    endTime: string;
    duration: number;
    date: string;
    description?: string;
}
export declare class CreateScheduleEventDto extends ScheduleEventDto {
}
export declare class UpdateScheduleEventDto extends ScheduleEventDto {
}
