import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      return { success: false, message: 'Неверные учетные данные' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  async getCurrentUser() {
    return {
      success: true,
      message: 'Доступ разрешен',
      user: {
        id: 1,
        email: 'admin@university.ru',
        name: 'Администратор',
        role: 'admin',
      },
    };
  }

  @Post('validate-admin')
  async validateAdmin(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user || user.role !== 'admin') {
      return {
        success: false,
        message: 'Доступ запрещен. Требуются права администратора',
      };
    }

    return {
      success: true,
      message: 'Доступ разрешен',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
