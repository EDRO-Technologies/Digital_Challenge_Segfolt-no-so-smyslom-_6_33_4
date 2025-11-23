import { Injectable } from '@nestjs/common';

interface ScheduleEvent {
  id: number;
  title: string;
  type: 'lecture' | 'seminar' | 'pair';
  instructor: string;
  participants: string[];
  startTime: string;
  endTime: string;
  duration: number;
  date: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ScheduleService {
  private events: ScheduleEvent[] = [];
  private nextId = 1;

  async getAllEvents(): Promise<ScheduleEvent[]> {
    return this.events;
  }

  async createEvent(
    eventData: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ScheduleEvent> {
    const newEvent: ScheduleEvent = {
      ...eventData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.events.push(newEvent);
    return newEvent;
  }

  async updateEvent(
    id: number,
    eventData: Partial<ScheduleEvent>,
  ): Promise<ScheduleEvent | null> {
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

  async deleteEvent(id: number): Promise<boolean> {
    const eventIndex = this.events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return false;
    }

    this.events.splice(eventIndex, 1);
    return true;
  }

  async getEventById(id: number): Promise<ScheduleEvent | null> {
    return this.events.find((e) => e.id === id) || null;
  }
}
