"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseResponseDto = void 0;
class CourseResponseDto {
    id;
    title;
    description;
    targetGroup;
    isActive;
    eventsCount;
    createdAt;
    updatedAt;
    constructor(course) {
        this.id = course.id;
        this.title = course.title;
        this.description = course.description;
        this.targetGroup = course.targetGroup;
        this.isActive = course.isActive;
        this.eventsCount = course.events?.length || 0;
        this.createdAt = course.createdAt;
        this.updatedAt = course.updatedAt;
    }
}
exports.CourseResponseDto = CourseResponseDto;
//# sourceMappingURL=course-response.dto.js.map