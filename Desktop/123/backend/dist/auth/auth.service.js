"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    users = [
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
    async validateUser(email, password) {
        const user = this.users.find((u) => u.email === email && u.password === password);
        return user || null;
    }
    async isAdmin(email, password) {
        const user = await this.validateUser(email, password);
        return user?.role === 'admin';
    }
    async getUserByEmail(email) {
        const user = this.users.find((u) => u.email === email);
        return user || null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map