// src/courses/courses.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';

@Controller('courses')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  async findAll(): Promise<CourseResponseDto[]> {
    return this.coursesService.findAll();
  }

  @Get('active')
  async findActive(): Promise<CourseResponseDto[]> {
    return this.coursesService.findActive();
  }

  @Get('target-group/:targetGroup')
  async findByTargetGroup(
    @Param('targetGroup') targetGroup: string,
  ): Promise<CourseResponseDto[]> {
    return this.coursesService.findByTargetGroup(targetGroup);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  @Get(':id/stats')
  async getCourseStats(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.coursesService.getCourseStats(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coursesService.remove(id);
  }

  @Put(':id/deactivate')
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseResponseDto> {
    return this.coursesService.deactivate(id);
  }

  @Put(':id/activate')
  async activate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseResponseDto> {
    return this.coursesService.activate(id);
  }
}
