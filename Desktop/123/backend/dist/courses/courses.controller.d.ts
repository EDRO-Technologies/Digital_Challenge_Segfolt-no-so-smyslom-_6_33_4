import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto>;
    findAll(): Promise<CourseResponseDto[]>;
    findActive(): Promise<CourseResponseDto[]>;
    findByTargetGroup(targetGroup: string): Promise<CourseResponseDto[]>;
    findOne(id: number): Promise<CourseResponseDto>;
    getCourseStats(id: number): Promise<any>;
    update(id: number, updateCourseDto: UpdateCourseDto): Promise<CourseResponseDto>;
    remove(id: number): Promise<void>;
    deactivate(id: number): Promise<CourseResponseDto>;
    activate(id: number): Promise<CourseResponseDto>;
}
