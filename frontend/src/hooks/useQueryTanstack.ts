import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../features/auth/store/useAuthStore";

export interface IQuery {
    key: string;
    query: string;
    variables?: any;
    refreshOnWindowFocus?: boolean;
    enabled?: boolean;
    usePlaceHolder?: boolean;
    staleTime?: number;
}

const getEnvVars = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:60001/api';
    const apiKey = import.meta.env.VITE_API_KEY || '';
    return {
        GRAPHQL_DATA: `${baseUrl}/data`,
        GRAPHQL_AUTH: `${baseUrl}/auth`,
        GRAPHQL_UPLOAD: import.meta.env.VITE_GRAPHQL_UPLOAD || `${baseUrl}/upload`,
        GRAPHQL_AUTH_KEY: apiKey
    };
};

const executeGraphQL = async (endpoint: string, query: string, variables: any, headers: HeadersInit) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify({ query, variables })
    });
    const result = await response.json();
    if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL Error');
    }
    return result.data;
};

const handleTokenRefresh = async () => {
    const { refreshToken, setLoginData, logout } = useAuthStore.getState();
    const env = getEnvVars();

    if (!refreshToken) {
        logout();
        throw new Error("No refresh token available");
    }

    try {
        const query = `
            mutation refreshToken($token: String!) {
                result: refreshToken(token: $token) {
                    ... on Authentication {
                        token
                        refreshToken
                    }
                    ... on CustomResponse {
                        code
                        message
                        data
                    }
                }
            }
        `;
        const data = await executeGraphQL(
            env.GRAPHQL_AUTH,
            query,
            { token: refreshToken },
            { "x-api-key": env.GRAPHQL_AUTH_KEY }
        );

        if (data && data.result && data.result.token) {
            setLoginData(data.result.token, data.result.refreshToken || refreshToken);
            return true;
        }
        throw new Error("Invalid refresh token response");
    } catch (error) {
        logout();
        throw error;
    }
};

const performRequestWithRefresh = async (query: string, variables: any) => {
    let { token } = useAuthStore.getState();
    const env = getEnvVars();

    const endpoint = token ? env.GRAPHQL_DATA : env.GRAPHQL_AUTH;
    const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : { "x-api-key": env.GRAPHQL_AUTH_KEY };

    try {
        return await executeGraphQL(endpoint, query, variables, headers);
    } catch (error) {
        // If unauthenticated (e.g. login failed), don't attempt a token refresh, just throw
        if (!token) throw error;

        // Attempt to refresh the token and then retry the API call if the refresh is successful
        // React Query handles retries for `useQuery`, but `handleTokenRefresh` will update the actual token in store.
        await handleTokenRefresh();
        throw error; // Propagate the error to trigger the configured retry from TanStack React Query.
    }
};

export const useQueryGraphQL = (args: IQuery): any => {
    const { key, query, variables, refreshOnWindowFocus, enabled = true, usePlaceHolder = false, staleTime = 0 } = args;

    const queryResult = useQuery({
        queryKey: [key, variables],
        queryFn: async () => {
            console.log('useQueryTanstack', "useQueryGraphQL", 'queryFn', key, args);
            const data = await performRequestWithRefresh(query, variables);

            let resultData = data[key]?.items || data[key];
            return resultData?.items || resultData;
        },
        refetchOnWindowFocus: refreshOnWindowFocus ? true : false,
        enabled: enabled,
        placeholderData: usePlaceHolder ? (prev) => prev : undefined,
        staleTime,
        retry: (failureCount, error) => {
            if (failureCount > 3) {
                useAuthStore.getState().logout();
                return false;
            }
            return true;
        }
    });

    const returnData: any = { data: queryResult.data, isLoading: queryResult.isLoading || queryResult.isFetching };
    returnData[key] = queryResult.data;

    return returnData;
};

export const useQueryItemsGraphQL = (args: IQuery): any => {
    const { key, query, variables, refreshOnWindowFocus, enabled = true } = args;

    const queryResult = useQuery({
        queryKey: [key, variables],
        queryFn: async () => {
            console.log('useQueryTanstack', "useQueryItemsGraphQL", 'queryFn', key, variables);
            return await performRequestWithRefresh(query, variables);
        },
        refetchOnWindowFocus: refreshOnWindowFocus ? true : false,
        enabled: enabled,
        placeholderData: (prev) => prev,
        retry: (failureCount, error) => {
            console.error('useQueryTanstack', "useQueryItemsGraphQL", 'retry', failureCount, error.message);
            if (failureCount > 2) {
                useAuthStore.getState().logout();
                return false;
            }
            return true;
        }
    });

    return { ...((queryResult.data as any)?.result), refetch: queryResult.refetch, isLoading: queryResult.isLoading || queryResult.isFetching };
};

export interface IMutation {
    query: string;
    variables?: any;
}

export const useMutationGraphQL = (args: IMutation, onSuccess?: any, onError?: any): any => {
    const { query } = args;

    const mutation = useMutation({
        mutationFn: async (variables: any) => {
            const data = await performRequestWithRefresh(query, variables);
            return { ...data, variables };
        },
        retry: (failureCount, error) => {
            if (failureCount > 2) {
                useAuthStore.getState().logout();
                return false;
            }
            return true;
        },
        onSuccess: (data) => {
            console.log('useQueryTanstack', "useMutationGraphQL", 'onSuccess', data);
            onSuccess && onSuccess(data);
        },
        onError: (error) => {
            console.error('useQueryTanstack', "useMutationGraphQL", 'onError', error);
            onError && onError(error);
        }
    });

    return mutation;
};

export const useMutationUpload = (onSuccess?: any, onError?: any): any => {
    const mutation = useMutation({
        mutationFn: async (variables: any) => {
            console.log('useMutationUpload', "mutationFn", 'queryFn', variables);
            const { file, fileName, entity, entityId, additionalPath, isUnique = false } = variables;
            const env = getEnvVars();

            const query = `
                mutation createFile($fileName: String, $entityId: String, $entity: String, $additionalPath: String, $isUnique: Boolean, $ttl: Int) {
                    data: createFile(fileName: $fileName, entityId: $entityId, entity: $entity, additionalPath: $additionalPath, isUnique: $isUnique, ttl: $ttl) {
                        id
                        url
                        signedData
                    }
                }
            `;

            let result: any;
            try {
                let { token } = useAuthStore.getState();
                result = await executeGraphQL(env.GRAPHQL_DATA, query, {
                    fileName: fileName || file.name,
                    entityId: entityId.toString(),
                    entity,
                    additionalPath,
                    isUnique
                }, { Authorization: `Bearer ${token}` });
            } catch (error) {
                await handleTokenRefresh();
                // We should retry execution once or let it fail for outer catch
                let { token } = useAuthStore.getState();
                result = await executeGraphQL(env.GRAPHQL_DATA, query, {
                    fileName: fileName || file.name,
                    entityId: entityId.toString(),
                    entity,
                    additionalPath,
                    isUnique
                }, { Authorization: `Bearer ${token}` });
            }

            if (!result.data?.signedData || !result.data?.url) {
                throw new Error('File upload problem: No signed URL returned');
            }

            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch(`${env.GRAPHQL_UPLOAD}?token=${result.data.signedData}`, {
                method: 'PUT',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error("File upload failed to S3/Storage");
            }

            return result.data;
        },
        onSuccess: (data) => {
            onSuccess && onSuccess(data);
        },
        onError: (error) => {
            console.error('useMutationUpload Error', error);
            onError && onError(error);
        }
    });

    return mutation;
};