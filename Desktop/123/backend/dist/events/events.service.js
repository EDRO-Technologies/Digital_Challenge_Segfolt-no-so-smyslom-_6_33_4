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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const event_entity_1 = require("./entities/event.entity");
const event_response_dto_1 = require("./dto/event-response.dto");
const course_entity_1 = require("../courses/entities/course.entity");
const registration_entity_1 = require("../registration/entities/registration.entity");
let EventsService = class EventsService {
    eventModel;
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async create(createEventDto) {
        try {
            await this.checkTimeConflict(createEventDto);
            const event = await this.eventModel.create({
                ...createEventDto,
                status: event_entity_1.EventStatus.SCHEDULED,
            });
            return new event_response_dto_1.EventResponseDto(event);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при создании события');
        }
    }
    async findAll() {
        const events = await this.eventModel.findAll({
            include: [registration_entity_1.Registration],
            order: [['startTime', 'ASC']],
        });
        return events.map((event) => new event_response_dto_1.EventResponseDto(event));
    }
    async findOne(id) {
        const event = await this.eventModel.findByPk(id, {
            include: [registration_entity_1.Registration, course_entity_1.Course],
        });
        if (!event) {
            throw new common_1.NotFoundException(`Событие с ID ${id} не найдено`);
        }
        return new event_response_dto_1.EventResponseDto(event);
    }
    async findByCourse(courseId) {
        const events = await this.eventModel.findAll({
            where: { courseId },
            include: [registration_entity_1.Registration],
            order: [['startTime', 'ASC']],
        });
        return events.map((event) => new event_response_dto_1.EventResponseDto(event));
    }
    async findByDateRange(startDate, endDate) {
        const events = await this.eventModel.findAll({
            where: {
                startTime: {
                    [sequelize_2.Op.between]: [startDate, endDate],
                },
            },
            include: [registration_entity_1.Registration, course_entity_1.Course],
            order: [['startTime', 'ASC']],
        });
        return events.map((event) => new event_response_dto_1.EventResponseDto(event));
    }
    async update(id, updateEventDto, changedBy = 'system') {
        const event = await this.eventModel.findByPk(id);
        if (!event) {
            throw new common_1.NotFoundException(`Событие с ID ${id} не найдено`);
        }
        const changes = this.getChanges(event, updateEventDto);
        if (changes.length > 0) {
            const changeHistory = event.changeHistory || [];
            changeHistory.push(...changes.map((change) => ({
                ...change,
                changedBy,
                changedAt: new Date(),
            })));
            await event.update({
                ...updateEventDto,
                changeHistory,
            });
        }
        return new event_response_dto_1.EventResponseDto(event);
    }
    async cancel(id, reason, changedBy) {
        const event = await this.eventModel.findByPk(id);
        if (!event) {
            throw new common_1.NotFoundException(`Событие с ID ${id} не найдено`);
        }
        const changeHistory = event.changeHistory || [];
        changeHistory.push({
            field: 'status',
            oldValue: event.status,
            newValue: event_entity_1.EventStatus.CANCELLED,
            changedBy,
            changedAt: new Date(),
            reason,
        });
        await event.update({
            status: event_entity_1.EventStatus.CANCELLED,
            changeHistory,
        });
        return new event_response_dto_1.EventResponseDto(event);
    }
    async reschedule(id, newStartTime, newEndTime, reason, changedBy) {
        const event = await this.eventModel.findByPk(id);
        if (!event) {
            throw new common_1.NotFoundException(`Событие с ID ${id} не найдено`);
        }
        await this.checkTimeConflictForReschedule(newStartTime, newEndTime, event.location, id);
        const changeHistory = event.changeHistory || [];
        changeHistory.push({
            field: 'time',
            oldValue: { start: event.startTime, end: event.endTime },
            newValue: { start: newStartTime, end: newEndTime },
            changedBy,
            changedAt: new Date(),
            reason,
        });
        await event.update({
            startTime: newStartTime,
            endTime: newEndTime,
            status: event_entity_1.EventStatus.RESCHEDULED,
            changeHistory,
        });
        return new event_response_dto_1.EventResponseDto(event);
    }
    async remove(id) {
        const event = await this.eventModel.findByPk(id);
        if (!event) {
            throw new common_1.NotFoundException(`Событие с ID ${id} не найдено`);
        }
        await event.destroy();
    }
    async checkTimeConflict(createEventDto) {
        const { startTime, endTime, location } = createEventDto;
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('Время окончания должно быть позже времени начала');
        }
        const conflictingEvent = await this.eventModel.findOne({
            where: {
                location,
                status: [event_entity_1.EventStatus.SCHEDULED, event_entity_1.EventStatus.RESCHEDULED],
                [sequelize_2.Op.or]: [
                    {
                        startTime: { [sequelize_2.Op.between]: [startTime, endTime] },
                    },
                    {
                        endTime: { [sequelize_2.Op.between]: [startTime, endTime] },
                    },
                    {
                        [sequelize_2.Op.and]: [
                            { startTime: { [sequelize_2.Op.lte]: startTime } },
                            { endTime: { [sequelize_2.Op.gte]: endTime } },
                        ],
                    },
                ],
            },
        });
        if (conflictingEvent) {
            throw new common_1.ConflictException(`Конфликт времени: аудитория ${location} уже занята с ${conflictingEvent.startTime} до ${conflictingEvent.endTime}`);
        }
    }
    async checkTimeConflictForReschedule(newStartTime, newEndTime, location, excludeEventId) {
        if (newStartTime >= newEndTime) {
            throw new common_1.BadRequestException('Время окончания должно быть позже времени начала');
        }
        const conflictingEvent = await this.eventModel.findOne({
            where: {
                location,
                id: { [sequelize_2.Op.ne]: excludeEventId },
                status: [event_entity_1.EventStatus.SCHEDULED, event_entity_1.EventStatus.RESCHEDULED],
                [sequelize_2.Op.or]: [
                    {
                        startTime: { [sequelize_2.Op.between]: [newStartTime, newEndTime] },
                    },
                    {
                        endTime: { [sequelize_2.Op.between]: [newStartTime, newEndTime] },
                    },
                    {
                        [sequelize_2.Op.and]: [
                            { startTime: { [sequelize_2.Op.lte]: newStartTime } },
                            { endTime: { [sequelize_2.Op.gte]: newEndTime } },
                        ],
                    },
                ],
            },
        });
        if (conflictingEvent) {
            throw new common_1.ConflictException(`Конфликт времени: аудитория ${location} уже занята с ${conflictingEvent.startTime} до ${conflictingEvent.endTime}`);
        }
    }
    getChanges(event, updateEventDto) {
        const changes = [];
        const fields = [
            'title',
            'startTime',
            'endTime',
            'instructor',
            'location',
            'status',
        ];
        for (const field of fields) {
            if (updateEventDto[field] !== undefined &&
                updateEventDto[field] !== event[field]) {
                changes.push({
                    field,
                    oldValue: event[field],
                    newValue: updateEventDto[field],
                });
            }
        }
        return changes;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(event_entity_1.Event)),
    __metadata("design:paramtypes", [Object])
], EventsService);
//# sourceMappingURL=events.service.js.map