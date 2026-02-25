export interface LoginCredentials {
    username: string;
    password?: string;
}

export interface Authentication {
    id: number;
    token: string;
    refreshToken: string;
}

export interface CustomResponse {
    code: string;
    message: string;
    data: string; // AWSJSON is typically a stringified JSON object
}

// Represents the GraphQL union type: AutenticationResult = Authentication | CustomResponse
export type AuthenticationResult = Authentication | CustomResponse;

// Helper type guard
export const isAuthentication = (result: AuthenticationResult): result is Authentication => {
    return (result as Authentication).token !== undefined;
};
