import { useMutationGraphQL } from '../../../hooks/useQueryTanstack';
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
  return useMutationGraphQL({ query: LOGIN_MUTATION });
};
