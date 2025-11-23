// src/registrations/entities/registration.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Table({
  tableName: 'registrations',
  timestamps: true,
})
export class Registration extends Model<Registration> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId: string;

  @ForeignKey(() => Event)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'event_id',
  })
  eventId: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'registered',
  })
  status: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Event)
  event: Event;
}
