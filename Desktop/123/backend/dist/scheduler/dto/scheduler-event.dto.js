"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScheduleEventDto = exports.CreateScheduleEventDto = exports.ScheduleEventDto = void 0;
class ScheduleEventDto {
    title;
    type;
    instructor;
    participants;
    startTime;
    endTime;
    duration;
    date;
    description;
}
exports.ScheduleEventDto = ScheduleEventDto;
class CreateScheduleEventDto extends ScheduleEventDto {
}
exports.CreateScheduleEventDto = CreateScheduleEventDto;
class UpdateScheduleEventDto extends ScheduleEventDto {
}
exports.UpdateScheduleEventDto = UpdateScheduleEventDto;
//# sourceMappingURL=scheduler-event.dto.js.map