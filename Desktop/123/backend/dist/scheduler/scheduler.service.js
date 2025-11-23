"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
let ScheduleService = class ScheduleService {
    events = [];
    nextId = 1;
    async getAllEvents() {
        return this.events;
    }
    async createEvent(eventData) {
        const newEvent = {
            ...eventData,
            id: this.nextId++,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.events.push(newEvent);
        return newEvent;
    }
    async updateEvent(id, eventData) {
        const eventIndex = this.events.findIndex((e) => e.id === id);
        if (eventIndex === -1) {
            return null;
        }
        this.events[eventIndex] = {
            ...this.events[eventIndex],
            ...eventData,
            updatedAt: new Date(),
        };
        return this.events[eventIndex];
    }
    async deleteEvent(id) {
        const eventIndex = this.events.findIndex((e) => e.id === id);
        if (eventIndex === -1) {
            return false;
        }
        this.events.splice(eventIndex, 1);
        return true;
    }
    async getEventById(id) {
        return this.events.find((e) => e.id === id) || null;
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)()
], ScheduleService);
//# sourceMappingURL=scheduler.service.js.map