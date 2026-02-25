import { useMutation } from '@tanstack/react-query';
import { graphqlClient } from './graphqlClient';
import { AuthenticationResult, LoginCredentials } from '../types';

const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ... on Authentication {
        id
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

interface LoginResponse {
  login: AuthenticationResult;
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await graphqlClient<LoginResponse, LoginCredentials>(
        LOGIN_MUTATION,
        credentials
      );

      // We return the union type defined in GraphQL (can be Authentication or CustomResponse)
      return response.login;
    },
  });
};
