declare class NotificationDto {
    title: string;
    message: string;
    recipients: string[];
    scheduledFor?: string;
}
export declare class NotificationsController {
    private notifications;
    private nextId;
    sendNotification(notificationDto: NotificationDto): Promise<{
        success: boolean;
        data: {
            status: string;
            sentAt: string;
            title: string;
            message: string;
            recipients: string[];
            scheduledFor?: string;
            id: number;
        };
    }>;
    scheduleNotification(notificationDto: NotificationDto & {
        scheduledFor: string;
    }): Promise<{
        success: boolean;
        data: {
            status: string;
            scheduledFor: string;
            title: string;
            message: string;
            recipients: string[];
            id: number;
        };
    }>;
    getHistory(): Promise<{
        success: boolean;
        data: any[];
    }>;
    cancelScheduled(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
