import { Model } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
export declare class Registration extends Model<Registration> {
    userId: string;
    eventId: string;
    status: string;
    user: User;
    event: Event;
}
