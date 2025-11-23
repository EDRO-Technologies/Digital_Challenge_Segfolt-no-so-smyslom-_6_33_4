import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Получаем credentials из заголовков
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Требуется авторизация');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [email, password] = credentials.split(':');

    // Проверяем, является ли пользователь администратором
    const isAdmin = await this.authService.isAdmin(email, password);

    if (!isAdmin) {
      throw new UnauthorizedException(
        'Доступ запрещен. Требуются права администратора',
      );
    }

    // Сохраняем email для использования в контроллерах
    request.userEmail = email;

    return true;
  }
}
