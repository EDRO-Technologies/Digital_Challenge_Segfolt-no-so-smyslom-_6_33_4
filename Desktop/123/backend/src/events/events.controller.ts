// src/events/events.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';

@Controller('events')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  async findAll(): Promise<EventResponseDto[]> {
    return this.eventsService.findAll();
  }

  @Get('course/:courseId')
  async findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.findByCourse(courseId);
  }

  @Get('schedule')
  async findByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ): Promise<EventResponseDto[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Неверный формат даты');
    }

    return this.eventsService.findByDateRange(start, end);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EventResponseDto> {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.update(id, updateEventDto, 'user@system.ru'); // TODO: заменить на реального пользователя
  }

  @Put(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.cancel(id, reason, 'user@system.ru');
  }

  @Put(':id/reschedule')
  async reschedule(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    rescheduleData: { newStartTime: Date; newEndTime: Date; reason: string },
  ): Promise<EventResponseDto> {
    return this.eventsService.reschedule(
      id,
      rescheduleData.newStartTime,
      rescheduleData.newEndTime,
      rescheduleData.reason,
      'user@system.ru',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventsService.remove(id);
  }
}
