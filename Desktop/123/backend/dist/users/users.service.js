"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const user_entity_1 = require("./entities/user.entity");
const user_response_dto_1 = require("./dto/user-response.dto");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        try {
            console.log('Creating user with data:', createUserDto);
            const existingUser = await this.findByEmail(createUserDto.email);
            if (existingUser) {
                throw new common_1.ConflictException('Пользователь с таким email уже существует');
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = await this.userModel.create({
                email: createUserDto.email,
                passwordHash: hashedPassword,
                role: createUserDto.role || user_entity_1.UserRole.PARTICIPANT,
                isActive: true,
                notificationPreferences: {
                    email: true,
                    telegram: false,
                },
            });
            console.log('User created successfully with ID:', user.id);
            return new user_response_dto_1.UserResponseDto(user);
        }
        catch (error) {
            console.error('Error creating user:', error);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при создании пользователя: ' + error.message);
        }
    }
    async findAll() {
        try {
            const users = await this.userModel.findAll({
                attributes: { exclude: ['passwordHash'] },
            });
            console.log('Found users:', users.length);
            return users.map((user) => new user_response_dto_1.UserResponseDto(user));
        }
        catch (error) {
            console.error('Error finding users:', error);
            throw new common_1.InternalServerErrorException('Ошибка при получении списка пользователей');
        }
    }
    async findOne(id) {
        try {
            console.log('Finding user by ID:', id);
            const user = await this.userModel.findByPk(id, {
                attributes: { exclude: ['passwordHash'] },
            });
            if (!user) {
                throw new common_1.NotFoundException(`Пользователь с ID ${id} не найден`);
            }
            console.log('User found:', user.id);
            return new user_response_dto_1.UserResponseDto(user);
        }
        catch (error) {
            console.error('Error finding user:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при получении пользователя');
        }
    }
    async findByEmail(email) {
        try {
            console.log('Searching user by email:', email);
            const user = await this.userModel.findOne({
                where: { email },
            });
            console.log('User found by email:', user ? user.id : 'null');
            return user;
        }
        catch (error) {
            console.error('Error in findByEmail:', error);
            return null;
        }
    }
    async update(id, updateUserDto) {
        try {
            const user = await this.userModel.findByPk(id);
            if (!user) {
                throw new common_1.NotFoundException(`Пользователь с ID ${id} не найден`);
            }
            const updateData = {};
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
            return new user_response_dto_1.UserResponseDto(user);
        }
        catch (error) {
            console.error('Error updating user:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при обновлении пользователя');
        }
    }
    async remove(id) {
        try {
            const user = await this.userModel.findByPk(id);
            if (!user) {
                throw new common_1.NotFoundException(`Пользователь с ID ${id} не найден`);
            }
            await user.destroy();
        }
        catch (error) {
            console.error('Error removing user:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ошибка при удалении пользователя');
        }
    }
    async validateUser(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (user && (await bcrypt.compare(password, user.passwordHash))) {
                return user;
            }
            return null;
        }
        catch (error) {
            console.error('Error validating user:', error);
            return null;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(user_entity_1.User)),
    __metadata("design:paramtypes", [Object])
], UsersService);
//# sourceMappingURL=users.service.js.map