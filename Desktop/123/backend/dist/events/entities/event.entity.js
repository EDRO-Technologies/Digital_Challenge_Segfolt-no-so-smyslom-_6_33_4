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
exports.Event = exports.EventStatus = exports.EventType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const course_entity_1 = require("../../courses/entities/course.entity");
const registration_entity_1 = require("../../registration/entities/registration.entity");
var EventType;
(function (EventType) {
    EventType["LECTURE"] = "lecture";
    EventType["SEMINAR"] = "seminar";
    EventType["PRACTICAL"] = "practical";
    EventType["LABORATORY"] = "laboratory";
    EventType["CONSULTATION"] = "consultation";
    EventType["EXAM"] = "exam";
    EventType["HACKATHON"] = "hackathon";
    EventType["WORKSHOP"] = "workshop";
})(EventType || (exports.EventType = EventType = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus["SCHEDULED"] = "scheduled";
    EventStatus["CANCELLED"] = "cancelled";
    EventStatus["RESCHEDULED"] = "rescheduled";
    EventStatus["COMPLETED"] = "completed";
    EventStatus["ONLINE"] = "online";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
let Event = class Event extends sequelize_typescript_1.Model {
    title;
    description;
    startTime;
    endTime;
    type;
    status;
    instructor;
    location;
    maxParticipants;
    targetGroup;
    changeHistory;
    courseId;
    course;
    registrations;
};
exports.Event = Event;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Event.prototype, "startTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Event.prototype, "endTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(EventType)),
        defaultValue: EventType.LECTURE,
    }),
    __metadata("design:type", String)
], Event.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(EventStatus)),
        defaultValue: EventStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Event.prototype, "instructor", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Event.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        field: 'max_participants',
    }),
    __metadata("design:type", Number)
], Event.prototype, "maxParticipants", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Event.prototype, "targetGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
        field: 'change_history',
    }),
    __metadata("design:type", Array)
], Event.prototype, "changeHistory", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => course_entity_1.Course),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'course_id',
    }),
    __metadata("design:type", Number)
], Event.prototype, "courseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => course_entity_1.Course),
    __metadata("design:type", course_entity_1.Course)
], Event.prototype, "course", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => registration_entity_1.Registration),
    __metadata("design:type", Array)
], Event.prototype, "registrations", void 0);
exports.Event = Event = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'events',
        timestamps: true,
    })
], Event);
//# sourceMappingURL=event.entity.js.map