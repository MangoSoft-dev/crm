export interface Account {
    id: string;
    logoUrl?: string;
    code?: string;
    name: string;
    status: number;
}

export interface User {
    id: string;
    accountId: string;
    account?: Account;
    avatarUrl?: string;
    parentId?: string;
    googleId?: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    lastActivity?: string;
    status: number;
    updatedAt?: string;
    updatedBy?: string;
}

export interface GetUserInfoResponse {
    getUserInfo: User;
}
