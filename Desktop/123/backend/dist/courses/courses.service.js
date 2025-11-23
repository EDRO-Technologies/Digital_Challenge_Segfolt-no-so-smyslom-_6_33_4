"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const course_entity_1 = require("./entities/course.entity");
const course_response_dto_1 = require("./dto/course-response.dto");
const event_entity_1 = require("../events/entities/event.entity");
let CoursesService = class CoursesService {
    courseModel;
    constructor(courseModel) {
        this.courseModel = courseModel;
    }
    async create(createCourseDto) {
        try {
            const existingCourse = await this.courseModel.findOne({
                where: { title: createCourseDto.title },
            });
            if (existingCourse) {
                throw new common_1.ConflictException('Курс с таким названием уже существует');
            }
            const course = await this.courseModel.create({
                ...createCourseDto,
                isActive: createCourseDto.isActive ?? true,
            });
            return new course_response_dto_1.CourseResponseDto(course);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при создании курса: ' + error.message);
        }
    }
    async findAll() {
        try {
            const courses = await this.courseModel.findAll({
                include: [event_entity_1.Event],
                order: [['createdAt', 'DESC']],
            });
            return courses.map((course) => new course_response_dto_1.CourseResponseDto(course));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Ошибка при получении списка курсов');
        }
    }
    async findOne(id) {
        try {
            const course = await this.courseModel.findByPk(id, {
                include: [event_entity_1.Event],
            });
            if (!course) {
                throw new common_1.NotFoundException(`Курс с ID ${id} не найден`);
            }
            return new course_response_dto_1.CourseResponseDto(course);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при получении курса');
        }
    }
    async findByTargetGroup(targetGroup) {
        try {
            const courses = await this.courseModel.findAll({
                where: { targetGroup },
                include: [event_entity_1.Event],
                order: [['title', 'ASC']],
            });
            return courses.map((course) => new course_response_dto_1.CourseResponseDto(course));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Ошибка при поиске курсов по целевой группе');
        }
    }
    async findActive() {
        try {
            const courses = await this.courseModel.findAll({
                where: { isActive: true },
                include: [event_entity_1.Event],
                order: [['title', 'ASC']],
            });
            return courses.map((course) => new course_response_dto_1.CourseResponseDto(course));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Ошибка при получении активных курсов');
        }
    }
    async update(id, updateCourseDto) {
        try {
            const course = await this.courseModel.findByPk(id);
            if (!course) {
                throw new common_1.NotFoundException(`Курс с ID ${id} не найден`);
            }
            if (updateCourseDto.title && updateCourseDto.title !== course.title) {
                const existingCourse = await this.courseModel.findOne({
                    where: { title: updateCourseDto.title },
                });
                if (existingCourse) {
                    throw new common_1.ConflictException('Курс с таким названием уже существует');
                }
            }
            await course.update(updateCourseDto);
            return new course_response_dto_1.CourseResponseDto(course);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при обновлении курса');
        }
    }
    async remove(id) {
        try {
            const course = await this.courseModel.findByPk(id);
            if (!course) {
                throw new common_1.NotFoundException(`Курс с ID ${id} не найден`);
            }
            const eventsCount = await course.$count('events');
            if (eventsCount > 0) {
                throw new common_1.ConflictException('Невозможно удалить курс: есть связанные события');
            }
            await course.destroy();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при удалении курса');
        }
    }
    async deactivate(id) {
        try {
            const course = await this.courseModel.findByPk(id);
            if (!course) {
                throw new common_1.NotFoundException(`Курс с ID ${id} не найден`);
            }
            await course.update({ isActive: false });
            return new course_response_dto_1.CourseResponseDto(course);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при деактивации курса');
        }
    }
    async activate(id) {
        try {
            const course = await this.courseModel.findByPk(id);
            if (!course) {
                throw new common_1.NotFoundException(`Курс с ID ${id} не найден`);
            }
            await course.update({ isActive: true });
            return new course_response_dto_1.CourseResponseDto(course);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при активации курса');
        }
    }
    async getCourseStats(id) {
        try {
            const course = await this.courseModel.findByPk(id, {
                include: [event_entity_1.Event],
            });
            if (!course) {
                throw new common_1.NotFoundException(`Курс с ID ${id} не найден`);
            }
            const events = course.events || [];
            const totalEvents = events.length;
            const scheduledEvents = events.filter((e) => e.status === 'scheduled').length;
            const completedEvents = events.filter((e) => e.status === 'completed').length;
            const cancelledEvents = events.filter((e) => e.status === 'cancelled').length;
            return {
                course: new course_response_dto_1.CourseResponseDto(course),
                stats: {
                    totalEvents,
                    scheduledEvents,
                    completedEvents,
                    cancelledEvents,
                    completionRate: totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при получении статистики курса');
        }
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(course_entity_1.Course)),
    __metadata("design:paramtypes", [Object])
], CoursesService);
//# sourceMappingURL=courses.service.js.map