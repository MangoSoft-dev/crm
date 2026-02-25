import { useAuthStore } from '../store/useAuthStore';

// Simple fetch wrapper for GraphQL
export const graphqlClient = async <T, V = Record<string, any>>(
    query: string,
    variables?: V
): Promise<T> => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:60001/api';

    const apiKey = import.meta.env.VITE_API_KEY || '';

    // Get token directly from Zustand store without reactive subscription (getState)
    const token = useAuthStore.getState().token;

    // If there is a token we assume it's a private request to /data, otherwise it's public to /auth
    const endpoint = token ? `${baseUrl}/data` : `${baseUrl}/auth`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Inject the token if it exists (private routes), otherwise inject the API Key (public auth routes)
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else if (apiKey) {
        headers['x-api-key'] = apiKey;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    const result = await response.json();

    // Optional: Handle top level GraphQL errors
    if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        throw new Error(result.errors[0]?.message || 'Error occurred during GraphQL Request');
    }

    return result.data as T;
};
