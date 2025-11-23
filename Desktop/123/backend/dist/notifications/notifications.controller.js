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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../auth/guards/admin.guard");
class NotificationDto {
    title;
    message;
    recipients;
    scheduledFor;
}
let NotificationsController = class NotificationsController {
    notifications = [];
    nextId = 1;
    async sendNotification(notificationDto) {
        const notification = {
            id: this.nextId++,
            ...notificationDto,
            status: 'sent',
            sentAt: new Date().toISOString(),
        };
        this.notifications.push(notification);
        console.log('Отправка уведомления:', notification);
        return { success: true, data: notification };
    }
    async scheduleNotification(notificationDto) {
        const notification = {
            id: this.nextId++,
            ...notificationDto,
            status: 'scheduled',
            scheduledFor: notificationDto.scheduledFor,
        };
        this.notifications.push(notification);
        return { success: true, data: notification };
    }
    async getHistory() {
        return { success: true, data: this.notifications };
    }
    async cancelScheduled(id) {
        const notificationIndex = this.notifications.findIndex((n) => n.id === parseInt(id) && n.status === 'scheduled');
        if (notificationIndex === -1) {
            return {
                success: false,
                message: 'Запланированное уведомление не найдено',
            };
        }
        this.notifications.splice(notificationIndex, 1);
        return { success: true, message: 'Уведомление отменено' };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [NotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('schedule'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "scheduleNotification", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Delete)('scheduled/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "cancelScheduled", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard)
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map