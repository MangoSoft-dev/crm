import { useQueryGraphQL } from '../../../hooks/useQueryTanstack';

export const GET_USER_INFO_QUERY = `
  query GetUserInfo {
    getUserInfo {
      id
      accountId
      account {
        id
        name
        code
        logoUrl
        status
      }
      avatarUrl
      parentId
      googleId
      username
      email
      firstName
      lastName
      phone
      lastActivity
      status
      updatedAt
      updatedBy
    }
  }
`;

export const useUserInfoQuery = (enabled: boolean = true) => {
  return useQueryGraphQL({
    key: 'getUserInfo',
    query: GET_USER_INFO_QUERY,
    enabled,
    staleTime: 5 * 60 * 1000 // Data remains fresh for 5 minutes
  });
};
