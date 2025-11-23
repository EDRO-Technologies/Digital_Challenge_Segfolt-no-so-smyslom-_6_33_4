import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
export declare class CoursesService {
    private courseModel;
    constructor(courseModel: typeof Course);
    create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto>;
    findAll(): Promise<CourseResponseDto[]>;
    findOne(id: number): Promise<CourseResponseDto>;
    findByTargetGroup(targetGroup: string): Promise<CourseResponseDto[]>;
    findActive(): Promise<CourseResponseDto[]>;
    update(id: number, updateCourseDto: UpdateCourseDto): Promise<CourseResponseDto>;
    remove(id: number): Promise<void>;
    deactivate(id: number): Promise<CourseResponseDto>;
    activate(id: number): Promise<CourseResponseDto>;
    getCourseStats(id: number): Promise<any>;
}
