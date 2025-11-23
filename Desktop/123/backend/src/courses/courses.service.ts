// src/courses/courses.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course)
    private courseModel: typeof Course,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    try {
      // Проверяем, существует ли курс с таким названием
      const existingCourse = await this.courseModel.findOne({
        where: { title: createCourseDto.title },
      });

      if (existingCourse) {
        throw new ConflictException('Курс с таким названием уже существует');
      }

      const course = await this.courseModel.create({
        ...createCourseDto,
        isActive: createCourseDto.isActive ?? true,
      });

      return new CourseResponseDto(course);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при создании курса: ' + error.message,
      );
    }
  }

  async findAll(): Promise<CourseResponseDto[]> {
    try {
      const courses = await this.courseModel.findAll({
        include: [Event],
        order: [['createdAt', 'DESC']],
      });
      return courses.map((course) => new CourseResponseDto(course));
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении списка курсов',
      );
    }
  }

  async findOne(id: number): Promise<CourseResponseDto> {
    try {
      const course = await this.courseModel.findByPk(id, {
        include: [Event],
      });

      if (!course) {
        throw new NotFoundException(`Курс с ID ${id} не найден`);
      }

      return new CourseResponseDto(course);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при получении курса');
    }
  }

  async findByTargetGroup(targetGroup: string): Promise<CourseResponseDto[]> {
    try {
      const courses = await this.courseModel.findAll({
        where: { targetGroup },
        include: [Event],
        order: [['title', 'ASC']],
      });
      return courses.map((course) => new CourseResponseDto(course));
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при поиске курсов по целевой группе',
      );
    }
  }

  async findActive(): Promise<CourseResponseDto[]> {
    try {
      const courses = await this.courseModel.findAll({
        where: { isActive: true },
        include: [Event],
        order: [['title', 'ASC']],
      });
      return courses.map((course) => new CourseResponseDto(course));
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении активных курсов',
      );
    }
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    try {
      const course = await this.courseModel.findByPk(id);
      if (!course) {
        throw new NotFoundException(`Курс с ID ${id} не найден`);
      }

      // Если обновляется название, проверяем уникальность
      if (updateCourseDto.title && updateCourseDto.title !== course.title) {
        const existingCourse = await this.courseModel.findOne({
          where: { title: updateCourseDto.title },
        });

        if (existingCourse) {
          throw new ConflictException('Курс с таким названием уже существует');
        }
      }

      await course.update(updateCourseDto);
      return new CourseResponseDto(course);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении курса');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const course = await this.courseModel.findByPk(id);
      if (!course) {
        throw new NotFoundException(`Курс с ID ${id} не найден`);
      }

      // Проверяем, есть ли связанные события
      const eventsCount = await course.$count('events');
      if (eventsCount > 0) {
        throw new ConflictException(
          'Невозможно удалить курс: есть связанные события',
        );
      }

      await course.destroy();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении курса');
    }
  }

  async deactivate(id: number): Promise<CourseResponseDto> {
    try {
      const course = await this.courseModel.findByPk(id);
      if (!course) {
        throw new NotFoundException(`Курс с ID ${id} не найден`);
      }

      await course.update({ isActive: false });
      return new CourseResponseDto(course);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при деактивации курса');
    }
  }

  async activate(id: number): Promise<CourseResponseDto> {
    try {
      const course = await this.courseModel.findByPk(id);
      if (!course) {
        throw new NotFoundException(`Курс с ID ${id} не найден`);
      }

      await course.update({ isActive: true });
      return new CourseResponseDto(course);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при активации курса');
    }
  }

  async getCourseStats(id: number): Promise<any> {
    try {
      const course = await this.courseModel.findByPk(id, {
        include: [Event],
      });

      if (!course) {
        throw new NotFoundException(`Курс с ID ${id} не найден`);
      }

      const events = course.events || [];
      const totalEvents = events.length;
      const scheduledEvents = events.filter(
        (e) => e.status === 'scheduled',
      ).length;
      const completedEvents = events.filter(
        (e) => e.status === 'completed',
      ).length;
      const cancelledEvents = events.filter(
        (e) => e.status === 'cancelled',
      ).length;

      return {
        course: new CourseResponseDto(course),
        stats: {
          totalEvents,
          scheduledEvents,
          completedEvents,
          cancelledEvents,
          completionRate:
            totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении статистики курса',
      );
    }
  }
}
