"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseDto = void 0;
class LoginResponseDto {
    success;
    user;
    message;
    constructor(success, user, message) {
        this.success = success;
        if (user) {
            this.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            };
        }
        this.message = message;
    }
}
exports.LoginResponseDto = LoginResponseDto;
//# sourceMappingURL=login-response.dto.js.map