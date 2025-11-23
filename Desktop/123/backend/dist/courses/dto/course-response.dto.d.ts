export declare class CourseResponseDto {
    id: number;
    title: string;
    description: string;
    targetGroup: string;
    isActive: boolean;
    eventsCount: number;
    createdAt: Date;
    updatedAt: Date;
    constructor(course: any);
}
