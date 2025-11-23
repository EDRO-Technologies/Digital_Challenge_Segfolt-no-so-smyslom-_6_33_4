// src/courses/dto/course-response.dto.ts
export class CourseResponseDto {
  id: number;
  title: string;
  description: string;
  targetGroup: string;
  isActive: boolean;
  eventsCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(course: any) {
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
