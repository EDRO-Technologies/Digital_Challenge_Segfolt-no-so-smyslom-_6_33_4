import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ScheduleService } from './scheduler.service';
import { ScheduleEventDto } from './dto/scheduler-event.dto';

@Controller('schedule')
@UseGuards(AdminGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getAll(): Promise<{ success: boolean; data: any[] }> {
    const events = await this.scheduleService.getAllEvents();
    return { success: true, data: events };
  }

  @Post()
  async create(
    @Body() eventDto: ScheduleEventDto,
  ): Promise<{ success: boolean; data: any }> {
    const event = await this.scheduleService.createEvent(eventDto);
    return { success: true, data: event };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() eventDto: Partial<ScheduleEventDto>,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const event = await this.scheduleService.updateEvent(
      parseInt(id),
      eventDto,
    );
    if (!event) {
      return { success: false, message: 'Событие не найдено' };
    }
    return { success: true, data: event };
  }

  @Get('export')
  async exportSchedule(): Promise<{ success: boolean; data: any[] }> {
    const events = await this.scheduleService.getAllEvents();
    return { success: true, data: events };
  }

  // ... другие методы
}
