import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';

class NotificationDto {
  title: string;
  message: string;
  recipients: string[];
  scheduledFor?: string;
}

@Controller('notifications')
@UseGuards(AdminGuard)
export class NotificationsController {
  private notifications: any[] = [];
  private nextId = 1;

  @Post('send')
  async sendNotification(@Body() notificationDto: NotificationDto) {
    const notification = {
      id: this.nextId++,
      ...notificationDto,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    this.notifications.push(notification);

    // Здесь можно добавить реальную логику отправки уведомлений
    console.log('Отправка уведомления:', notification);

    return { success: true, data: notification };
  }

  @Post('schedule')
  async scheduleNotification(
    @Body() notificationDto: NotificationDto & { scheduledFor: string },
  ) {
    const notification = {
      id: this.nextId++,
      ...notificationDto,
      status: 'scheduled',
      scheduledFor: notificationDto.scheduledFor,
    };

    this.notifications.push(notification);

    return { success: true, data: notification };
  }

  @Get('history')
  async getHistory() {
    return { success: true, data: this.notifications };
  }

  @Delete('scheduled/:id')
  async cancelScheduled(@Param('id') id: string) {
    const notificationIndex = this.notifications.findIndex(
      (n) => n.id === parseInt(id) && n.status === 'scheduled',
    );

    if (notificationIndex === -1) {
      return {
        success: false,
        message: 'Запланированное уведомление не найдено',
      };
    }

    this.notifications.splice(notificationIndex, 1);
    return { success: true, message: 'Уведомление отменено' };
  }
}
