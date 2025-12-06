export type UserRole = 'service' | 'admin' | 'inspector';

export type User = {
    id: string;
    userId: string;
    initials: string[];
    role: UserRole;
};

export type Users = {
    users: User[];
};

export type AddUserResponse = {
    status: string;
    message: string;
    data: User;
};

export type UpdateUserResponse = {
    status: string;
    message: string;
    data: User;
};

export type DeleteUserResponse = {
    status: string;
    message: string;
};
