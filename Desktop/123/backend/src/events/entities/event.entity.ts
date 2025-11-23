// src/events/entities/event.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Course } from '../../courses/entities/course.entity';
import { Registration } from 'src/registration/entities/registration.entity';

export enum EventType {
  LECTURE = 'lecture',
  SEMINAR = 'seminar',
  PRACTICAL = 'practical',
  LABORATORY = 'laboratory',
  CONSULTATION = 'consultation',
  EXAM = 'exam',
  HACKATHON = 'hackathon',
  WORKSHOP = 'workshop',
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  COMPLETED = 'completed',
  ONLINE = 'online',
}

@Table({
  tableName: 'events',
  timestamps: true,
})
export class Event extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endTime: Date;

  @Column({
    type: DataType.ENUM(...Object.values(EventType)),
    defaultValue: EventType.LECTURE,
  })
  type: EventType;

  @Column({
    type: DataType.ENUM(...Object.values(EventStatus)),
    defaultValue: EventStatus.SCHEDULED,
  })
  status: EventStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  instructor: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'max_participants',
  })
  maxParticipants: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  targetGroup: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'change_history',
  })
  changeHistory: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    changedAt: Date;
    reason?: string;
  }>;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'course_id',
  })
  courseId: number;

  @BelongsTo(() => Course)
  course: Course;

  @HasMany(() => Registration)
  registrations: Registration[];
}
