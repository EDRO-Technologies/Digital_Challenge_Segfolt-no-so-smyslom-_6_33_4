import { Model } from 'sequelize-typescript';
import { Event } from '../../events/entities/event.entity';
export declare class Course extends Model {
    id: number;
    title: string;
    description: string;
    targetGroup: string;
    isActive: boolean;
    events: Event[];
    createdAt: Date;
    updatedAt: Date;
}
