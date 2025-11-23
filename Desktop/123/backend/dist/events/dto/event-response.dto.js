"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventResponseDto = void 0;
class EventResponseDto {
    id;
    title;
    description;
    startTime;
    endTime;
    type;
    status;
    instructor;
    location;
    maxParticipants;
    targetGroup;
    courseId;
    registrationsCount;
    changeHistory;
    createdAt;
    updatedAt;
    constructor(event) {
        this.id = event.id;
        this.title = event.title;
        this.description = event.description;
        this.startTime = event.startTime;
        this.endTime = event.endTime;
        this.type = event.type;
        this.status = event.status;
        this.instructor = event.instructor;
        this.location = event.location;
        this.maxParticipants = event.maxParticipants;
        this.targetGroup = event.targetGroup;
        this.courseId = event.courseId;
        this.registrationsCount = event.registrations?.length || 0;
        this.changeHistory = event.changeHistory || [];
        this.createdAt = event.createdAt;
        this.updatedAt = event.updatedAt;
    }
}
exports.EventResponseDto = EventResponseDto;
//# sourceMappingURL=event-response.dto.js.map