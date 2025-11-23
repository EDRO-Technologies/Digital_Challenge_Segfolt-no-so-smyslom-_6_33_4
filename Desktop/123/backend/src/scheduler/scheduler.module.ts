import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScheduleController } from './scheduler.controller';
import { ScheduleService } from './scheduler.service';

@Module({
  imports: [AuthModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
