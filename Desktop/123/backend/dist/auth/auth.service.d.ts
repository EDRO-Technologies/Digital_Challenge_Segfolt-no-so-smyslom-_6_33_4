interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'user';
}
export declare class AuthService {
    private users;
    validateUser(email: string, password: string): Promise<User | null>;
    isAdmin(email: string, password: string): Promise<boolean>;
    getUserByEmail(email: string): Promise<User | null>;
}
export {};
