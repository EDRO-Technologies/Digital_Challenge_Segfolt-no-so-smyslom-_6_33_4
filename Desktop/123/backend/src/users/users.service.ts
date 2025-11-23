// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      console.log('Creating user with data:', createUserDto);

      // Проверяем, существует ли пользователь с таким email
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Создаем пользователя - ID сгенерируется автоматически
      const user = await this.userModel.create({
        email: createUserDto.email,
        passwordHash: hashedPassword,
        role: createUserDto.role || UserRole.PARTICIPANT,
        isActive: true,
        notificationPreferences: {
          email: true,
          telegram: false,
        },
      });

      console.log('User created successfully with ID:', user.id);
      return new UserResponseDto(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя: ' + error.message,
      );
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.userModel.findAll({
        attributes: { exclude: ['passwordHash'] },
      });
      console.log('Found users:', users.length);
      return users.map((user) => new UserResponseDto(user));
    } catch (error) {
      console.error('Error finding users:', error);
      throw new InternalServerErrorException(
        'Ошибка при получении списка пользователей',
      );
    }
  }

  async findOne(id: number): Promise<UserResponseDto> {
    try {
      console.log('Finding user by ID:', id);
      const user = await this.userModel.findByPk(id, {
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${id} не найден`);
      }

      console.log('User found:', user.id);
      return new UserResponseDto(user);
    } catch (error) {
      console.error('Error finding user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении пользователя',
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      console.log('Searching user by email:', email);
      const user = await this.userModel.findOne({
        where: { email },
      });
      console.log('User found by email:', user ? user.id : 'null');
      return user;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      return null;
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userModel.findByPk(id);
      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${id} не найден`);
      }

      // Подготавливаем данные для обновления
      const updateData: any = {};

      if (updateUserDto.email !== undefined) {
        updateData.email = updateUserDto.email;
      }

      if (updateUserDto.password) {
        updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (updateUserDto.role) {
        updateData.role = updateUserDto.role;
      }

      await user.update(updateData);
      return new UserResponseDto(user);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при обновлении пользователя',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.userModel.findByPk(id);
      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${id} не найден`);
      }

      await user.destroy();
    } catch (error) {
      console.error('Error removing user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при удалении пользователя',
      );
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }
}
