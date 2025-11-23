export class ScheduleEventDto {
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

export class CreateScheduleEventDto extends ScheduleEventDto {}
export class UpdateScheduleEventDto extends ScheduleEventDto {}
