import { Injectable } from '@nestjs/common';

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

@Injectable()
export class AuthService {
  private users: User[] = [
    {
      id: 1,
      email: 'admin@university.ru',
      password: 'admin123',
      name: 'Администратор',
      role: 'admin',
    },
    {
      id: 2,
      email: 'teacher@university.ru',
      password: 'teacher123',
      name: 'Преподаватель',
      role: 'user',
    },
    {
      id: 3,
      email: 'manager@university.ru',
      password: 'manager123',
      name: 'Менеджер',
      role: 'user',
    },
  ];

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(
      (u) => u.email === email && u.password === password,
    );
    return user || null;
  }

  async isAdmin(email: string, password: string): Promise<boolean> {
    const user = await this.validateUser(email, password);
    return user?.role === 'admin';
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }
}
