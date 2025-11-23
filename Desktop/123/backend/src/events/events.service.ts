// src/events/events.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Event, EventStatus, EventType } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { Course } from '../courses/entities/course.entity';
import { Registration } from 'src/registration/entities/registration.entity';

interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    try {
      // Проверяем конфликты по времени и аудитории
      await this.checkTimeConflict(createEventDto);

      const event = await this.eventModel.create({
        ...createEventDto,
        status: EventStatus.SCHEDULED,
      });

      return new EventResponseDto(event);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании события');
    }
  }

  async findAll(): Promise<EventResponseDto[]> {
    const events = await this.eventModel.findAll({
      include: [Registration],
      order: [['startTime', 'ASC']],
    });
    return events.map((event) => new EventResponseDto(event));
  }

  async findOne(id: number): Promise<EventResponseDto> {
    const event = await this.eventModel.findByPk(id, {
      include: [Registration, Course],
    });

    if (!event) {
      throw new NotFoundException(`Событие с ID ${id} не найдено`);
    }

    return new EventResponseDto(event);
  }

  async findByCourse(courseId: number): Promise<EventResponseDto[]> {
    const events = await this.eventModel.findAll({
      where: { courseId },
      include: [Registration],
      order: [['startTime', 'ASC']],
    });
    return events.map((event) => new EventResponseDto(event));
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<EventResponseDto[]> {
    const events = await this.eventModel.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [Registration, Course],
      order: [['startTime', 'ASC']],
    });
    return events.map((event) => new EventResponseDto(event));
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    changedBy: string = 'system',
  ): Promise<EventResponseDto> {
    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Событие с ID ${id} не найдено`);
    }

    // Фиксируем изменения в истории
    const changes = this.getChanges(event, updateEventDto);

    if (changes.length > 0) {
      const changeHistory: ChangeRecord[] = event.changeHistory || [];
      changeHistory.push(
        ...changes.map((change) => ({
          ...change,
          changedBy,
          changedAt: new Date(),
        })),
      );

      await event.update({
        ...updateEventDto,
        changeHistory,
      });
    }

    return new EventResponseDto(event);
  }

  async cancel(
    id: number,
    reason: string,
    changedBy: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Событие с ID ${id} не найдено`);
    }

    const changeHistory: ChangeRecord[] = event.changeHistory || [];
    changeHistory.push({
      field: 'status',
      oldValue: event.status,
      newValue: EventStatus.CANCELLED,
      changedBy,
      changedAt: new Date(),
      reason,
    });

    await event.update({
      status: EventStatus.CANCELLED,
      changeHistory,
    });

    return new EventResponseDto(event);
  }

  async reschedule(
    id: number,
    newStartTime: Date,
    newEndTime: Date,
    reason: string,
    changedBy: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Событие с ID ${id} не найдено`);
    }

    // Проверяем конфликт для нового времени
    await this.checkTimeConflictForReschedule(
      newStartTime,
      newEndTime,
      event.location,
      id,
    );

    const changeHistory: ChangeRecord[] = event.changeHistory || [];
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
      status: EventStatus.RESCHEDULED,
      changeHistory,
    });

    return new EventResponseDto(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Событие с ID ${id} не найдено`);
    }

    await event.destroy();
  }

  private async checkTimeConflict(
    createEventDto: CreateEventDto,
  ): Promise<void> {
    const { startTime, endTime, location } = createEventDto;

    if (startTime >= endTime) {
      throw new BadRequestException(
        'Время окончания должно быть позже времени начала',
      );
    }

    const conflictingEvent = await this.eventModel.findOne({
      where: {
        location,
        status: [EventStatus.SCHEDULED, EventStatus.RESCHEDULED],
        [Op.or]: [
          {
            startTime: { [Op.between]: [startTime, endTime] },
          },
          {
            endTime: { [Op.between]: [startTime, endTime] },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingEvent) {
      throw new ConflictException(
        `Конфликт времени: аудитория ${location} уже занята с ${conflictingEvent.startTime} до ${conflictingEvent.endTime}`,
      );
    }
  }

  private async checkTimeConflictForReschedule(
    newStartTime: Date,
    newEndTime: Date,
    location: string,
    excludeEventId: number,
  ): Promise<void> {
    if (newStartTime >= newEndTime) {
      throw new BadRequestException(
        'Время окончания должно быть позже времени начала',
      );
    }

    const conflictingEvent = await this.eventModel.findOne({
      where: {
        location,
        id: { [Op.ne]: excludeEventId },
        status: [EventStatus.SCHEDULED, EventStatus.RESCHEDULED],
        [Op.or]: [
          {
            startTime: { [Op.between]: [newStartTime, newEndTime] },
          },
          {
            endTime: { [Op.between]: [newStartTime, newEndTime] },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: newStartTime } },
              { endTime: { [Op.gte]: newEndTime } },
            ],
          },
        ],
      },
    });

    if (conflictingEvent) {
      throw new ConflictException(
        `Конфликт времени: аудитория ${location} уже занята с ${conflictingEvent.startTime} до ${conflictingEvent.endTime}`,
      );
    }
  }

  private getChanges(
    event: Event,
    updateEventDto: UpdateEventDto,
  ): Omit<ChangeRecord, 'changedBy' | 'changedAt'>[] {
    const changes: Omit<ChangeRecord, 'changedBy' | 'changedAt'>[] = [];
    const fields = [
      'title',
      'startTime',
      'endTime',
      'instructor',
      'location',
      'status',
    ];

    for (const field of fields) {
      if (
        updateEventDto[field] !== undefined &&
        updateEventDto[field] !== event[field]
      ) {
        changes.push({
          field,
          oldValue: event[field],
          newValue: updateEventDto[field],
        });
      }
    }

    return changes;
  }
}
