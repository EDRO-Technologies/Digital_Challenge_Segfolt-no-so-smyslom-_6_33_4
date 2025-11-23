"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
class UserResponseDto {
    id;
    email;
    role;
    isActive;
    notificationPreferences;
    createdAt;
    updatedAt;
    constructor(user) {
        this.id = user.id;
        this.email = user.email;
        this.role = user.role;
        this.isActive = user.isActive;
        this.notificationPreferences = user.notificationPreferences || {
            email: true,
            telegram: false,
        };
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
exports.UserResponseDto = UserResponseDto;
//# sourceMappingURL=user-response.dto.js.map