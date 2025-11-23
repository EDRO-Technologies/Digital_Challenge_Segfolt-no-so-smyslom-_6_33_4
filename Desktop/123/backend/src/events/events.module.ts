// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { Course } from '../courses/entities/course.entity';
import { Registration } from 'src/registration/entities/registration.entity';

@Module({
  imports: [SequelizeModule.forFeature([Event, Registration, Course])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
