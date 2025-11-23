import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(): Promise<UserResponseDto[]>;
    findOne(id: number): Promise<UserResponseDto>;
    findByEmail(email: string): Promise<UserResponseDto>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: number): Promise<void>;
    deactivate(id: number): Promise<UserResponseDto>;
    activate(id: number): Promise<UserResponseDto>;
    updateRole(id: number, role: string): Promise<UserResponseDto>;
    getUserRegistrations(id: number): Promise<{
        user: UserResponseDto;
        registrations: never[];
        message: string;
    }>;
}
