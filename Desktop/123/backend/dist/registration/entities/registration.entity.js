"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registration = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_entity_1 = require("../../users/entities/user.entity");
const event_entity_1 = require("../../events/entities/event.entity");
let Registration = class Registration extends sequelize_typescript_1.Model {
    userId;
    eventId;
    status;
    user;
    event;
};
exports.Registration = Registration;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_entity_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'user_id',
    }),
    __metadata("design:type", String)
], Registration.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => event_entity_1.Event),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'event_id',
    }),
    __metadata("design:type", String)
], Registration.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        defaultValue: 'registered',
    }),
    __metadata("design:type", String)
], Registration.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Registration.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => event_entity_1.Event),
    __metadata("design:type", event_entity_1.Event)
], Registration.prototype, "event", void 0);
exports.Registration = Registration = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'registrations',
        timestamps: true,
    })
], Registration);
//# sourceMappingURL=registration.entity.js.map